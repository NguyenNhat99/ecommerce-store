namespace EcommerceStore.Server.Models
{
    public class RatingProductModel
    {
        public int Id { get; set; }
        public string? Email { get; set; }
        public int ProductId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public string? UserId { get; set; }
        public DateTime CreateAt { get; set; } = DateTime.UtcNow;
    }

}
