using System.Net.Mail;
using System.Net;

namespace EcommerceStore.Server.Services.EmailService
{
    public class EmailSender : IEmailSender
    {
        private readonly IConfiguration configuration;

        public EmailSender(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var fromEmail = configuration["EmailSettings:From"];
            var password = configuration["EmailSettings:Password"];
            var host = configuration["EmailSettings:Host"];
            var port = int.Parse(configuration["EmailSettings:Port"]);

            var smtp = new SmtpClient
            {
                Host = host,
                Port = port,
                EnableSsl = true,
                Credentials = new NetworkCredential(fromEmail, password)
            };

            var message = new MailMessage(fromEmail, toEmail, subject, body)
            {
                IsBodyHtml = true
            };

            await smtp.SendMailAsync(message);
        }
    }
}
