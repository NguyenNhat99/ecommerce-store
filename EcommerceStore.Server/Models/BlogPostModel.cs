namespace EcommerceStore.Server.Models
{
    public class BlogPostRequestModel
    {
        public string Title { get; set; } = "";
        public string Slug { get; set; } = "";
        public string Content { get; set; } = "";
        public bool IsPublished { get; set; }
        public IFormFile? Thumbnail { get; set; } // file upload
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
    public class BlogPostFormModel
    {
        public string Title { get; set; } = null!;
        public string? Slug { get; set; }
        public string Content { get; set; } = null!;
        public bool IsPublished { get; set; } = true;

        // Upload file:
        public IFormFile? ThumbnailFile { get; set; }

        // Cho phép fallback nếu vẫn muốn gửi URL (tùy chọn)
        public string? ThumbnailUrl { get; set; }
    }
}
