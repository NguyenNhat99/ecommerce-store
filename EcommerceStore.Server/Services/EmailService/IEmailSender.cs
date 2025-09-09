namespace EcommerceStore.Server.Services.EmailService
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }
}
