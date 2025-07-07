using AutoMapper;
using DoAnChuyenNganh.Server.Data;
using DoAnChuyenNganh.Server.Models;

namespace DoAnChuyenNganh.Server.Helpers
{
    public class ApplicationMapper : Profile
    {
        public ApplicationMapper() {
            CreateMap<Brand, BrandModel>().ReverseMap();
            CreateMap<Category, CategoryModel>().ReverseMap();

            //Mapper Product -> ProductResponseModel
            CreateMap<Product, ProductResponseModel>()
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.ProductImages))
                .ForMember(dest => dest.ProductSizes, opt => opt.MapFrom(src => src.ProductSizes));

            // Mapper ProductResquestModel->Product
            CreateMap<ProductRequestModel, Product>()
               .ForMember(dest => dest.ProductSizes, opt => opt.Ignore())
               .ForMember(dest => dest.Avatar, opt => opt.Ignore())
               .ForMember(dest => dest.ProductImages, opt => opt.Ignore());

            //Mapper ProductImage -> ProductImageModel
            CreateMap<ProductImage, ProductImageModel>();

            //Mapper ProductSizeModel -> ProductSize
            CreateMap<ProductSizeModel, ProductSize>();

            //Mapper ProductSize -> ProductSizeModel
            CreateMap<ProductSize, ProductSizeModel>()
              .ForMember(dest => dest.SizeId, opt => opt.MapFrom(src => src.SizeId))
              .ForMember(dest => dest.SizeName, opt => opt.MapFrom(src => src.Size.Name))
              .ForMember(dest => dest.Stock, opt => opt.MapFrom(src => src.Stock));

            //Mapper User -> AccountModel
            CreateMap<User, AccountModel>()
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender));
        }
    }
}
