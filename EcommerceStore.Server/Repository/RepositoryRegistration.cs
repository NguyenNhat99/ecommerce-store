using Microsoft.Extensions.DependencyInjection;
using EcommerceStore.Server.Repository.Interfaces;
using EcommerceStore.Server.Repository.Implementations;
using EcommerceStore.Server.Helpers;

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
            services.AddScoped<IEmailSender, EmailSender>();
            services.AddScoped<ICartRepository, CartRepository>();

        }
    }
}
