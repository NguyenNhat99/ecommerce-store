using EcommerceStore.Server.Services.EmailService;

namespace EcommerceStore.Server.Services
{
    public static class ServiceRegistration
    {
        public static void AddServices(this IServiceCollection services)
        {
            services.AddScoped<IEmailSender, EmailSender>();
        }
    }
}
