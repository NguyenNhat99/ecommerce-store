using Microsoft.Extensions.DependencyInjection;
using EcommerceStore.Server.Helpers;
using EcommerceStore.Server.Repository.Implementations;
using EcommerceStore.Server.Repository.Interfaces;

namespace EcommerceStore.Server.Repository
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
            services.AddScoped<ICartRepository, CartRepository>();
            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<IRatingRepository, RatingRepository>();
        }
    }
}
