using AutoMapper;
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;

namespace EcommerceStore.Server.Helpers
{
    public class ApplicationMapper : Profile
    {
        public ApplicationMapper()
        {
            CreateMap<Brand, BrandModel>().ReverseMap();
            CreateMap<Category, CategoryModel>().ReverseMap();

            // Mapper Product -> ProductResponseModel
            CreateMap<Product, ProductResponseModel>()
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.ProductImages))
                .ForMember(dest => dest.ProductSizes, opt => opt.MapFrom(src => src.ProductSizes))
                .ForMember(dest => dest.ProductColors, opt => opt.MapFrom(src => src.ProductColors));

            // Mapper ProductRequestModel -> Product
            CreateMap<ProductRequestModel, Product>()
                .ForMember(dest => dest.ProductSizes, opt => opt.Ignore())
                .ForMember(dest => dest.ProductImages, opt => opt.Ignore())
                .ForMember(dest => dest.ProductColors, opt => opt.Ignore())
                .ForMember(dest => dest.Avatar, opt => opt.Ignore());

            // ProductImage -> ProductImageModel
            CreateMap<ProductImage, ProductImageModel>();

            // ProductSize <=> ProductSizeModel
            CreateMap<ProductSizeModel, ProductSize>();
            CreateMap<ProductSize, ProductSizeModel>()
                .ForMember(dest => dest.SizeId, opt => opt.MapFrom(src => src.SizeId))
                .ForMember(dest => dest.SizeName, opt => opt.MapFrom(src => src.Size.Name))
                .ForMember(dest => dest.Stock, opt => opt.MapFrom(src => src.Stock));

            // ProductColor -> ProductColorModel
            CreateMap<ProductColor, ProductColorModel>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Color.Id))
                .ForMember(dest => dest.CodeColor, opt => opt.MapFrom(src => src.Color.CodeColor));

            CreateMap<Color, ColorModel>().ReverseMap();
            CreateMap<Order, OrderResponseModel>();

            CreateMap<User, AccountModel>()
                 .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                 .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                 .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender))
                 .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                 .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
                 .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
                 .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
                 // các field liên quan lockout:
                 .ForMember(dest => dest.LockoutEnabled, opt => opt.MapFrom(src => src.LockoutEnabled))
                 .ForMember(dest => dest.LockoutEnd, opt => opt.MapFrom(src => src.LockoutEnd))
                 // Role sẽ set sau (vì cần async), nên ignore ở đây để tránh nhầm lẫn:
                 .ForMember(dest => dest.Role, opt => opt.Ignore());
            // CartItem -> CartItemView
            CreateMap<CartItem, CartItemView>()
                .ForMember(dest => dest.ItemId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.ProductId))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.Product.Avatar))
                .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPrice))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity));

            // Cart -> CartView
            CreateMap<Cart, CartView>()
                .ForMember(dest => dest.CartId, opt => opt.MapFrom(src => src.Id))
                // map sang List<CartItemView> (sử dụng mapping ở trên)
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));
            // TotalItems & Subtotal tự động tính trong getter => không cần map
        }
    }
}
