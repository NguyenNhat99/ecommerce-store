namespace EcommerceStore.Server.Services.VnPayService
{
    public class VnPayOptions
    {
        public string TmnCode { get; set; }
        public string HashSecret { get; set; }
        public string BaseUrl { get; set; }
        public string vnp_Api { get; set; }
        public string ReturnUrl { get; set; }
        public string Locale { get; set; }
    }
}
