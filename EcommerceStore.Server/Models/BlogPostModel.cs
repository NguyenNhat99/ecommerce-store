namespace EcommerceStore.Server.Models
{
    public class BlogPostRequestModel
    {
        public string Title { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string? Thumbnail { get; set; }
        public bool IsPublished { get; set; } = true;
    }

    public class BlogPostResponseModel
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string? Thumbnail { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsPublished { get; set; }
    }
}
