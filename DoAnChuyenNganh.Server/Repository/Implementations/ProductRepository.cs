using AutoMapper;
using DoAnChuyenNganh.Server.Data;
using DoAnChuyenNganh.Server.Helpers;
using DoAnChuyenNganh.Server.Models;
using DoAnChuyenNganh.Server.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace DoAnChuyenNganh.Server.Repository.Implementations
{
    public class ProductRepository : IProductRepository
    {
        private readonly EcommerceStoreContext _context;
        private readonly IMapper _mapper;
        private readonly IImageRepository _imageRepository;

        public ProductRepository(EcommerceStoreContext context, IMapper mapper, IImageRepository imageRepository) {
            _context = context;
            _mapper = mapper;
            _imageRepository = imageRepository;
        }
        public async Task<ProductResponseModel> AddAsync(ProductRequestModel model)
        {
            var newProduct = _mapper.Map<Product>(model);

            #region Xử lý avatar
            if (model.Avatar != null)
                newProduct.Avatar = await _imageRepository.AddAsync(model.Avatar, "Products");

            _context.Products.Add(newProduct);
            await _context.SaveChangesAsync(); // để lấy được Id cho các bảng liên quan
            #endregion

            #region Xử lý hình ảnh chi tiết
            if (model.Images != null && model.Images.Any())
            {
                foreach (var image in model.Images)
                {
                    var newImage = new ProductImage
                    {
                        ImageUrl = await _imageRepository.AddAsync(image, "Products"),
                        ProductId = newProduct.Id
                    };
                    _context.ProductImages.Add(newImage);
                }
            }
            await _context.SaveChangesAsync();
            #endregion

            #region Xử lý Size
            await AddAndUpdateProductSize(newProduct.Id, model.ProductSizes);
            #endregion

            #region Xử lý màu
            if (model.ColorCodes != null && model.ColorCodes.Any())
            {
                foreach (var colorCode in model.ColorCodes)
                {
                    var c = await _context.Colors.Where(c => c.CodeColor.Equals(colorCode)).FirstOrDefaultAsync();
                    if (c != null)
                    {
                        var productColor = new ProductColor
                        {
                            ProductId = newProduct.Id,
                            ColorId = c.Id,
                        };
                        _context.ProductColors.Add(productColor);
                    }
                    else
                    {
                        var color = new Color
                        {
                            CodeColor = colorCode + ""
                        };
                        _context.Colors.Add(color);
                        _context.SaveChanges();
                        var productColor = new ProductColor
                        {
                            ProductId = newProduct.Id,
                            ColorId = color.Id,
                        };
                        _context.ProductColors.Add(productColor);
                        await _context.SaveChangesAsync();
                    }
                }
            }
            #endregion
            await _context.SaveChangesAsync();

            // Load lại product đầy đủ để map ra response
            var fullProduct = await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.ProductSizes).ThenInclude(ps => ps.Size)
                .Include(p => p.ProductColors).ThenInclude(pc => pc.Color)
                .FirstOrDefaultAsync(p => p.Id == newProduct.Id);

            return _mapper.Map<ProductResponseModel>(fullProduct!);
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var deleteProduct = await _context.Products.FindAsync(id);
            if (deleteProduct == null) return false;
            var productColors = await _context.ProductColors.Where(pc => pc.ProductId.Equals(deleteProduct.Id)).ToListAsync();
            if (productColors.Any() && productColors!=null) 
                _context.ProductColors.RemoveRange(productColors);
            var productImages = await _context.ProductImages.Where(pi => pi.Id.Equals(deleteProduct.Id)).ToListAsync();
            if(productImages!=null && productImages.Any())
            {
                foreach (var image in productImages)
                {
                    await _imageRepository.DeleteAsync(image.ImageUrl, "Products");
                }
                _context.ProductImages.RemoveRange(productImages);
            }
            _context.Products.Remove(deleteProduct);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ProductResponseModel>> GetAllAsync()
        {
            var products = await _context.Products
                .Include(p => p.ProductSizes).ThenInclude(ps => ps.Size)
                 .Include(p => p.ProductColors).ThenInclude(pc => pc.Color).ToListAsync();
            return _mapper.Map<List<ProductResponseModel>>(products);
        }
        public async Task<ProductResponseModel> GetByIdAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.ProductImages)
               .Include(p => p.ProductSizes).ThenInclude(ps => ps.Size)
                .Include(p => p.ProductColors).ThenInclude(pc => pc.Color).FirstOrDefaultAsync(p => p.Id == id);
            return _mapper.Map<ProductResponseModel>(product);
        }

        public async Task<bool> UpdateAsync(int id, ProductRequestModel model)
        {
            var existingProduct = await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.ProductColors)
                .Include(p => p.ProductSizes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existingProduct == null)
                return false;

            // Cập nhật các trường cơ bản
            existingProduct.Name = model.Name;
            existingProduct.Description = model.Description;
            existingProduct.Price = model.Price;
            existingProduct.OriginalPrice = model.OriginalPrice;
            existingProduct.Stock = model.Stock;
            existingProduct.CategoryId = model.CategoryId;
            existingProduct.BrandId = model.BrandId;
            existingProduct.SizeConversion = model.SizeConversion;

            #region Cập nhật ảnh đại diện (avatar)
            if (model.Avatar != null)
            {
                // Xóa ảnh cũ
                if (!string.IsNullOrEmpty(existingProduct.Avatar))
                    await _imageRepository.DeleteAsync(existingProduct.Avatar, "Products");

                // Lưu ảnh mới
                existingProduct.Avatar = await _imageRepository.AddAsync(model.Avatar, "Products");
            }
            #endregion

            #region Cập nhật ảnh chi tiết
            if (model.Images != null && model.Images.Any())
            {
                // Xóa ảnh cũ
                foreach (var image in existingProduct.ProductImages)
                {
                    await _imageRepository.DeleteAsync(image.ImageUrl, "Products");
                }
                _context.ProductImages.RemoveRange(existingProduct.ProductImages);

                // Thêm ảnh mới
                foreach (var image in model.Images)
                {
                    var newImage = new ProductImage
                    {
                        ProductId = id,
                        ImageUrl = await _imageRepository.AddAsync(image, "Products")
                    };
                    _context.ProductImages.Add(newImage);
                }
            }
            #endregion

            #region Cập nhật size
            await AddAndUpdateProductSize(id, model.ProductSizes);
            #endregion

            #region Cập nhật màu sắc
            // Xóa màu cũ
            var oldColors = await _context.ProductColors.Where(pc => pc.ProductId == id).ToListAsync();
            _context.ProductColors.RemoveRange(oldColors);

            // Thêm màu mới
            if (model.ColorCodes != null && model.ColorCodes.Any())
            {
                foreach (var colorCode in model.ColorCodes)
                {
                    var existingColor = await _context.Colors.FirstOrDefaultAsync(c => c.CodeColor == colorCode);
                    if (existingColor == null)
                    {
                        existingColor = new Color { CodeColor = colorCode };
                        _context.Colors.Add(existingColor);
                        await _context.SaveChangesAsync();
                    }

                    var newProductColor = new ProductColor
                    {
                        ProductId = id,
                        ColorId = existingColor.Id
                    };
                    _context.ProductColors.Add(newProductColor);
                }
            }
            #endregion

            await _context.SaveChangesAsync();
            return true;
        }


        /// <summary>
        /// thêm và cập nhật Size, ProductSize
        /// </summary>
        /// <param name="product">Sản phẩm cần thêm hoặc cập nhật cho size</param>
        /// <param name="productSizes">Danh sách productsize cần thêm hoặc cập nhật</param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        private async Task AddAndUpdateProductSize(int idProduct, List<ProductSizeModel> productSizes)
        {
            // Lấy danh sách ProductSizes hiện có
            var existingProductSizes = await _context.ProductSizes.Include(ps => ps.Size).Where(ps => ps.ProductId == idProduct).ToListAsync();

            // Xóa các ProductSize không có trong danh sách mới
            foreach (var eps in existingProductSizes)
            {
                if (!productSizes.Any(ps =>
                    (ps.SizeId.HasValue && ps.SizeId == eps.SizeId) ||
                    (!string.IsNullOrEmpty(ps.SizeName) && ps.SizeName == eps.Size.Name)))
                {
                    _context.ProductSizes.Remove(eps);
                }
            }
            // Thêm hoặc cập nhật ProductSizes
            foreach (var ps in productSizes)
            {
                if (string.IsNullOrWhiteSpace(ps.SizeName) && !ps.SizeId.HasValue) continue; 
                int sizeId;

                // Xử lý trường hợp có SizeId
                if (ps.SizeId.HasValue && ps.SizeId != 0) 
                    sizeId = ps.SizeId.Value;

                // Xử lý trường hợp chỉ có SizeName
                else if (!string.IsNullOrEmpty(ps.SizeName))
                {
                    var existingSize = await _context.Sizes.FirstOrDefaultAsync(s => s.Name == ps.SizeName);
                    if (existingSize == null)
                    {
                        var newSize = new Size { Name = ps.SizeName };
                        _context.Sizes.Add(newSize);
                        await _context.SaveChangesAsync();
                        sizeId = newSize.Id;
                    }
                    else
                    {
                        sizeId = existingSize.Id;
                    }
                }
                else
                {
                    continue; 
                }

                var existingProductSize = existingProductSizes.FirstOrDefault(eps => eps.SizeId == sizeId);
                if (existingProductSize != null)
                {
                    existingProductSize.Stock = ps.Stock;
                }
                else
                {
                    var newProductSize = new ProductSize
                    {
                        SizeId = sizeId,
                        ProductId = idProduct,
                        Stock = ps.Stock
                    };
                    _context.ProductSizes.Add(newProductSize);
                }
            }
            await _context.SaveChangesAsync();
        }
    }
}
