namespace EcommerceStore.Server.Models
{
    public class CartItemView
    {
        public int ItemId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = "";
        public string? Avatar { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice => UnitPrice * Quantity;
    }
    public class UpdateCartItem
    {
        public int Quantity { get; set; } = 1;
    }
    public class AddCart
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }
    public class CartView
    {
        public int CartId { get; set; }
        public List<CartItemView> Items { get; set; } = new();
        public int TotalItems => Items.Sum(i => i.Quantity);
        public decimal Subtotal => Items.Sum(i => i.TotalPrice);
    }
}
