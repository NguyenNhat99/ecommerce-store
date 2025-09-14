using AutoMapper;
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceStore.Server.Repository.Implementations
{
    public class ProductRepository : IProductRepository
    {
        private readonly EcommerceStoreContext _context;
        private readonly IMapper _mapper;
        private readonly IImageRepository _imageRepository;

        public ProductRepository(
            EcommerceStoreContext context,
            IMapper mapper,
            IImageRepository imageRepository)
        {
            _context = context;
            _mapper = mapper;
            _imageRepository = imageRepository;
        }

        public async Task<ProductResponseModel> AddAsync(ProductRequestModel model)
        {
            // Track các publicId ảnh mới upload để xoá nếu lỗi
            var uploadedPublicIds = new List<string>();

            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var newProduct = _mapper.Map<Product>(model);

                // Avatar (Cloudinary) - upload trước, lưu publicId để rollback nếu lỗi
                if (model.Avatar != null)
                {
                    var (url, pid) = await _imageRepository.AddAsync(model.Avatar, "Products");
                    uploadedPublicIds.Add(pid);
                    newProduct.Avatar = url;
                    newProduct.AvatarPublicId = pid;
                }

                // Thêm product trước để có tracking entity (Id sẽ có sau SaveChanges)
                _context.Products.Add(newProduct);
                await _context.SaveChangesAsync(); // trong transaction, rollback được

                // Ảnh chi tiết (upload trước, add vào context sau)
                if (model.Images != null && model.Images.Any())
                {
                    foreach (var file in model.Images)
                    {
                        var (url, pid) = await _imageRepository.AddAsync(file, "Products");
                        uploadedPublicIds.Add(pid);

                        _context.ProductImages.Add(new ProductImage
                        {
                            ProductId = newProduct.Id,
                            ImageUrl = url,
                            PublicId = pid
                        });
                    }
                }

                // Size
                await AddAndUpdateProductSize(newProduct.Id, model.ProductSizes);

                // Màu (không SaveChanges trong loop; dùng navigation để EF tự set FK)
                if (model.ColorCodes != null && model.ColorCodes.Any())
                {
                    foreach (var code in model.ColorCodes)
                    {
                        var color = await _context.Colors.FirstOrDefaultAsync(c => c.CodeColor == code);
                        if (color == null)
                        {
                            color = new Color { CodeColor = code };
                            _context.Colors.Add(color);
                        }

                        _context.ProductColors.Add(new ProductColor
                        {
                            ProductId = newProduct.Id,
                            Color = color
                        });
                    }
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                // Load lại đầy đủ sau commit
                var fullProduct = await _context.Products
                    .Include(p => p.ProductImages)
                    .Include(p => p.ProductSizes).ThenInclude(ps => ps.Size)
                    .Include(p => p.ProductColors).ThenInclude(pc => pc.Color)
                    .FirstOrDefaultAsync(p => p.Id == newProduct.Id);

                return _mapper.Map<ProductResponseModel>(fullProduct!);
            }
            catch
            {
                // Rollback DB
                await tx.RollbackAsync();

                // Xoá toàn bộ ảnh mới upload (compensating)
                foreach (var pid in uploadedPublicIds.Where(pid => !string.IsNullOrWhiteSpace(pid)))
                {
                    try { await _imageRepository.DeleteAsync(pid); } catch { /* swallow */ }
                }

                throw; // cho controller/bộ gọi biết có lỗi
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            // Delete: tuỳ chiến lược, ở đây ưu tiên dữ liệu nhất quán trong DB.
            // 1) Xoá DB trong transaction; 2) commit; 3) cố gắng xoá ảnh Cloudinary (nếu lỗi, chỉ còn rác ngoài Cloudinary, DB vẫn sạch).
            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var product = await _context.Products
                    .Include(p => p.ProductImages)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (product == null) return false;

                var productColors = await _context.ProductColors
                    .Where(pc => pc.ProductId == product.Id)
                    .ToListAsync();
                if (productColors.Any())
                    _context.ProductColors.RemoveRange(productColors);

                if (product.ProductImages?.Any() == true)
                    _context.ProductImages.RemoveRange(product.ProductImages);

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                // Post-commit: xóa Cloudinary (không thể rollback, nên tách khỏi transaction)
                if (product.ProductImages != null)
                {
                    foreach (var img in product.ProductImages)
                    {
                        if (!string.IsNullOrEmpty(img.PublicId))
                        {
                            try { await _imageRepository.DeleteAsync(img.PublicId); } catch { /* log nếu cần */ }
                        }
                    }
                }
                if (!string.IsNullOrEmpty(product.AvatarPublicId))
                {
                    try { await _imageRepository.DeleteAsync(product.AvatarPublicId); } catch { /* log nếu cần */ }
                }

                return true;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<List<ProductResponseModel>> GetAllAsync()
        {
            var products = await _context.Products
                .Include(p => p.ProductSizes).ThenInclude(ps => ps.Size)
                .Include(p => p.ProductColors).ThenInclude(pc => pc.Color)
                .OrderBy(p => p.Id)
                .ToListAsync();

            return _mapper.Map<List<ProductResponseModel>>(products);
        }

        public async Task<ProductResponseModel> GetByIdAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.ProductSizes).ThenInclude(ps => ps.Size)
                .Include(p => p.ProductColors).ThenInclude(pc => pc.Color)
                .FirstOrDefaultAsync(p => p.Id == id);

            return _mapper.Map<ProductResponseModel>(product);
        }

        public async Task<bool> UpdateAsync(int id, ProductRequestModel model)
        {
            // Track ảnh mới upload để xoá nếu Update fail
            var uploadedPublicIds = new List<string>();
            // Track ảnh cũ để xoá SAU KHI COMMIT
            var oldPublicIdsToDeleteAfterCommit = new List<string>();

            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var existingProduct = await _context.Products
                    .Include(p => p.ProductImages)
                    .Include(p => p.ProductColors)
                    .Include(p => p.ProductSizes)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (existingProduct == null) return false;

                // Cập nhật trường cơ bản
                existingProduct.Name = model.Name;
                existingProduct.Description = model.Description;
                existingProduct.Price = model.Price;
                existingProduct.OriginalPrice = model.OriginalPrice;
                existingProduct.Stock = model.Stock;
                existingProduct.CategoryId = model.CategoryId;
                existingProduct.BrandId = model.BrandId;
                existingProduct.SizeConversion = model.SizeConversion;

                // ===== Avatar: upload mới trước, xoá cũ sau khi commit =====
                if (model.Avatar != null)
                {
                    if (!string.IsNullOrEmpty(existingProduct.AvatarPublicId))
                        oldPublicIdsToDeleteAfterCommit.Add(existingProduct.AvatarPublicId);

                    var (url, pid) = await _imageRepository.AddAsync(model.Avatar, "Products");
                    uploadedPublicIds.Add(pid);

                    existingProduct.Avatar = url;
                    existingProduct.AvatarPublicId = pid;
                }

                // ===== Ảnh chi tiết: upload mới trước; xoá cũ sau commit =====
                if (model.Images != null && model.Images.Any())
                {
                    // giữ danh sách ảnh cũ để xóa sau commit
                    var oldImgsPublicIds = existingProduct.ProductImages
                        .Select(i => i.PublicId)
                        .Where(pid => !string.IsNullOrWhiteSpace(pid))
                        .ToList();
                    oldPublicIdsToDeleteAfterCommit.AddRange(oldImgsPublicIds);

                    // Upload tất cả ảnh mới
                    var newImages = new List<ProductImage>();
                    foreach (var file in model.Images)
                    {
                        var (url, pid) = await _imageRepository.AddAsync(file, "Products");
                        uploadedPublicIds.Add(pid);

                        newImages.Add(new ProductImage
                        {
                            ProductId = id,
                            ImageUrl = url,
                            PublicId = pid
                        });
                    }

                    // Thay thế trong DB (chỉ DB, chưa động vào Cloudinary cũ)
                    _context.ProductImages.RemoveRange(existingProduct.ProductImages);
                    await _context.SaveChangesAsync(); // để clear cũ trước khi add mới

                    await _context.ProductImages.AddRangeAsync(newImages);
                }

                // Size
                await AddAndUpdateProductSize(id, model.ProductSizes);

                // Màu: xoá cũ, thêm mới (không save trong loop)
                var oldColors = await _context.ProductColors.Where(pc => pc.ProductId == id).ToListAsync();
                if (oldColors.Any())
                    _context.ProductColors.RemoveRange(oldColors);

                if (model.ColorCodes != null && model.ColorCodes.Any())
                {
                    foreach (var code in model.ColorCodes)
                    {
                        var color = await _context.Colors.FirstOrDefaultAsync(c => c.CodeColor == code);
                        if (color == null)
                        {
                            color = new Color { CodeColor = code };
                            _context.Colors.Add(color);
                        }

                        _context.ProductColors.Add(new ProductColor
                        {
                            ProductId = id,
                            Color = color
                        });
                    }
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                // ===== Sau khi COMMIT, xoá Cloudinary của ảnh cũ =====
                foreach (var pid in oldPublicIdsToDeleteAfterCommit.Distinct())
                {
                    try { await _imageRepository.DeleteAsync(pid); } catch { /* log nếu cần */ }
                }

                return true;
            }
            catch
            {
                await tx.RollbackAsync();

                // Xoá toàn bộ ảnh mới vừa upload (compensating)
                foreach (var pid in uploadedPublicIds.Where(pid => !string.IsNullOrWhiteSpace(pid)))
                {
                    try { await _imageRepository.DeleteAsync(pid); } catch { /* swallow */ }
                }

                throw;
            }
        }

        /// <summary>
        /// Thêm & cập nhật Size/ProductSize
        /// </summary>
        private async Task AddAndUpdateProductSize(int idProduct, List<ProductSizeModel> productSizes)
        {
            var existingProductSizes = await _context.ProductSizes
                .Include(ps => ps.Size)
                .Where(ps => ps.ProductId == idProduct)
                .ToListAsync();

            foreach (var eps in existingProductSizes)
            {
                bool stillExists = productSizes.Any(ps =>
                    (ps.SizeId.HasValue && ps.SizeId == eps.SizeId) ||
                    (!string.IsNullOrEmpty(ps.SizeName) && ps.SizeName == eps.Size.Name));

                if (!stillExists)
                    _context.ProductSizes.Remove(eps);
            }

            foreach (var ps in productSizes ?? Enumerable.Empty<ProductSizeModel>())
            {
                if (string.IsNullOrWhiteSpace(ps.SizeName) && !ps.SizeId.HasValue) continue;

                Size size;
                if (ps.SizeId.HasValue && ps.SizeId.Value != 0)
                {
                    size = await _context.Sizes.FindAsync(ps.SizeId.Value)
                           ?? throw new InvalidOperationException($"SizeId {ps.SizeId.Value} không tồn tại.");
                }
                else
                {
                    size = await _context.Sizes.SingleOrDefaultAsync(s => s.Name == ps.SizeName)
                           ?? _context.Sizes.Add(new Size { Name = ps.SizeName }).Entity;
                }

                var exist = existingProductSizes.FirstOrDefault(eps =>
                    (eps.SizeId != 0 && eps.SizeId == size.Id) ||
                    (eps.Size != null && eps.Size.Name == size.Name));

                if (exist != null)
                {
                    exist.Stock = ps.Stock;
                }
                else
                {
                    _context.ProductSizes.Add(new ProductSize
                    {
                        ProductId = idProduct,
                        Stock = ps.Stock,
                        Size = size
                    });
                }
            }

            await _context.SaveChangesAsync();
        }
        public async Task<int> CountProductsAsync()
        {
            var products = await _context.Products.ToListAsync();
            return products.Count;
        }
    }
}
