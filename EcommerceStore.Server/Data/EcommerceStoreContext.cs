using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace EcommerceStore.Server.Data
{
    public class EcommerceStoreContext : IdentityDbContext<User>
    {
        public EcommerceStoreContext(DbContextOptions<EcommerceStoreContext> opt) : base(opt)
        {
        }
        #region DbSet
        public DbSet<Product> Products { get; set; }    
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<RatingProduct> RatingProducts { get; set; }
        public DbSet<Color> Colors { get; set; }
        public DbSet<ProductColor> ProductColors { get; set; }
        public DbSet<ProductSize> ProductSizes { get; set; }
        public DbSet<Size> Sizes { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Cart> Carts { get; set; }
        #endregion
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ProductColor>(entity =>
            {
                entity.HasKey(ps => new { ps.ProductId, ps.ColorId });

                entity.HasOne(ps => ps.Product)
                  .WithMany(ps => ps.ProductColors)
                  .HasForeignKey(ps => ps.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ps => ps.Color)
                .WithMany(ps => ps.ProductColors)
                .HasForeignKey(ps => ps.ColorId)
                .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<ProductSize>(entity =>
            {
                entity.HasKey(ps => new { ps.ProductId, ps.SizeId });
                //Khoa ngoại ddeeen size
                entity.HasOne(ps => ps.Size)
                    .WithMany(ps => ps.ProductSizes)
                    .HasForeignKey(ps => ps.SizeId)
                    .OnDelete(DeleteBehavior.Cascade);
                // khóa ngoại đến product
                entity.HasOne(ps => ps.Product)
                    .WithMany(ps => ps.ProductSizes)
                    .HasForeignKey(ps => ps.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
