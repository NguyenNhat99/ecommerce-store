using Microsoft.Extensions.DependencyInjection;
using DoAnChuyenNganh.Server.Repository.Interfaces;
using DoAnChuyenNganh.Server.Repository.Implementations;

namespace DoAnChuyenNganh.Server.Repository
{
    public static class RepositoryRegistration
    {
        public static void AddRepositories(this IServiceCollection services)
        {
            services.AddScoped<IBrandRepository, BrandRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<IImageRepository, ImageRepository>();
            services.AddScoped<IAccountRepository, AccountRepository>();
        }
    }
}
