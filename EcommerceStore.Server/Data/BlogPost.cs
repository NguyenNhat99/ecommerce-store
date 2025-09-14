using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceStore.Server.Data
{
    [Table("BlogPost")]
    public class BlogPost
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [MaxLength(200)]
        [Required]
        public string Title { get; set; } = null!;

        [MaxLength(200)]
        [Required]
        public string Slug { get; set; } = null!;   // dùng cho URL thân thiện

        [Column(TypeName = "text")]
        public string Content { get; set; } = null!;

        [MaxLength(255)]
        public string? Thumbnail { get; set; }
        public string? ThumbnailPublicId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsPublished { get; set; } = true;

        // Quan hệ với User (tác giả)
        [ForeignKey("Author")]
        public string? AuthorId { get; set; }
        public virtual User? Author { get; set; }
    }
}