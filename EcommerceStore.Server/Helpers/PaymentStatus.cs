namespace EcommerceStore.Server.Helpers
{
    public static class PaymentStatus
    {
        public const string Pending = "Pending";       // Chưa thanh toán
        public const string Paid = "Paid";             // Đã thanh toán
        public const string Failed = "Failed";         // Thanh toán thất bại
        public const string Refunded = "Refunded";     // Đã hoàn tiền
        public const string Processing = "Processing"; // Đang xử lý
    }
}
