namespace EcommerceStore.Server.Helpers
{
    public static class OrderStatus
    {
        public const string Pending = "pend";
        public const string Error = "err";
        public const string Success = "success";
        public const string Cancel = "cancel";
        public const string AwaitingPayment = "awaitpay";
    }
}
