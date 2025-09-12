using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace EcommerceStore.Server.Services.VnPayService
{
    public class VnPayLibrary
    {
        public const string VERSION = "2.1.0";

        private readonly SortedList<string, string> _requestData =
            new SortedList<string, string>(new VnPayCompare());

        private readonly SortedList<string, string> _responseData =
            new SortedList<string, string>(new VnPayCompare());

        public void AddRequestData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                // Sẽ throw nếu trùng key -> kiểm soát upstream
                _requestData.Add(key, value);
            }
        }

        public void AddResponseData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _responseData.Add(key, value);
            }
        }

        public string GetResponseData(string key)
        {
            return _responseData.TryGetValue(key, out var retValue) ? retValue : string.Empty;
        }

        // ========= REQUEST =========
        public string CreateRequestUrl(string baseUrl, string vnp_HashSecret)
        {
            // Ghép query theo thứ tự key ASCII (SortedList + comparer đã đảm bảo)
            var pairs = _requestData
                .Where(kv => !string.IsNullOrEmpty(kv.Value))
                .Select(kv => $"{WebUtility.UrlEncode(kv.Key)}={WebUtility.UrlEncode(kv.Value)}");

            var queryString = string.Join("&", pairs);

            // Chuỗi ký: toàn bộ query (không có vnp_SecureHash ở đây)
            var signData = queryString; // không cần TrimEnd vì đã join

            var vnp_SecureHash = Utils.HmacSHA512(vnp_HashSecret, signData);

            // Trả về URL hoàn chỉnh
            return $"{baseUrl}?{queryString}&vnp_SecureHash={vnp_SecureHash}";
        }

        // ========= RESPONSE =========
        public bool ValidateSignature(string inputHash, string secretKey)
        {
            var rspRaw = BuildResponseDataRaw();
            var myChecksum = Utils.HmacSHA512(secretKey, rspRaw);
            return myChecksum.Equals(inputHash, StringComparison.InvariantCultureIgnoreCase);
        }

        private string BuildResponseDataRaw()
        {
            // Loại bỏ 2 tham số hash ra khỏi dữ liệu ký
            if (_responseData.ContainsKey("vnp_SecureHashType"))
                _responseData.Remove("vnp_SecureHashType");
            if (_responseData.ContainsKey("vnp_SecureHash"))
                _responseData.Remove("vnp_SecureHash");

            var pairs = _responseData
                .Where(kv => !string.IsNullOrEmpty(kv.Value))
                .Select(kv => $"{WebUtility.UrlEncode(kv.Key)}={WebUtility.UrlEncode(kv.Value)}");

            return string.Join("&", pairs);
        }
    }

    public static class Utils
    {
        public static string HmacSHA512(string key, string inputData)
        {
            var hash = new StringBuilder();
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);
            using var hmac = new HMACSHA512(keyBytes);
            var hashValue = hmac.ComputeHash(inputBytes);
            foreach (var b in hashValue)
                hash.Append(b.ToString("x2"));
            return hash.ToString();
        }

        public static string GetIpAddress(HttpContext? context)
        {
            if (context == null) return string.Empty;

            if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var values))
            {
                var raw = values.ToString();
                if (!string.IsNullOrWhiteSpace(raw))
                {
                    var first = raw.Split(',').Select(s => s.Trim()).FirstOrDefault();
                    if (!string.IsNullOrEmpty(first)) return first;
                }
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? string.Empty;
        }
    }

    public class VnPayCompare : IComparer<string>
    {
        public int Compare(string x, string y)
        {
            if (x == y) return 0;
            if (x == null) return -1;
            if (y == null) return 1;
            var vnpCompare = CompareInfo.GetCompareInfo("en-US");
            return vnpCompare.Compare(x, y, CompareOptions.Ordinal);
        }
    }
}
