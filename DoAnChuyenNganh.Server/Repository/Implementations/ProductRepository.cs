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
            #region Xử lý hình
            if (model.Avatar != null)
                newProduct.Avatar = await _imageRepository.AddAsync(model.Avatar, "Products");
            _context.Products.Add(newProduct);
            if (model.Images!.Any() || model.Images != null)
            {
                foreach(var image in model.Images)
                {
                    var newImage = new ProductImage()
                    {
                        ImageUrl = await _imageRepository.AddAsync(model.Avatar, "Products"),
                        ProductId = newProduct.Id
                    };
                    _context.ProductImages.Add(newImage);
                }
            }
            #endregion
            #region Xử lý Size
            await AddAndUpdateProductSize(newProduct.Id, model.ProductSizes);
            #endregion
            #region Xử lý màu

            #endregion
            await _context.SaveChangesAsync();  
            throw new NotImplementedException();

        }
        public Task<bool> DeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<List<ProductResponseModel>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<ProductResponseModel> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateAsync(int id, ProductRequestModel model)
        {
            throw new NotImplementedException();
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
