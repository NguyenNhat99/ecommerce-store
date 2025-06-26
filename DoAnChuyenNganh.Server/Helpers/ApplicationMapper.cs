using AutoMapper;
using DoAnChuyenNganh.Server.Data;
using DoAnChuyenNganh.Server.Models;

namespace DoAnChuyenNganh.Server.Helpers
{
    public class ApplicationMapper : Profile
    {
        public ApplicationMapper() {
            CreateMap<Brand, BrandModel>().ReverseMap();
        }
    }
}
