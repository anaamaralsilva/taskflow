using System.Net;
using System.Net.Mail;

namespace TaskFlow.API.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }
public async Task SendEmailAsync(string toEmail, string subject, string body)
{
    var smtpServer = _configuration["EmailSettings:SmtpServer"];
    var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]!);
    var senderEmail = _configuration["EmailSettings:SenderEmail"];
    var appPassword = _configuration["EmailSettings:AppPassword"];

    using var smtpClient = new SmtpClient(smtpServer, smtpPort)
    {
        Credentials = new NetworkCredential(senderEmail, appPassword),
        EnableSsl = true
    };

    using var mailMessage = new MailMessage
    {
        From = new MailAddress(senderEmail!, "TaskFlow"),
        Subject = subject,
        Body = body,
        IsBodyHtml = true
    };

    mailMessage.To.Add(toEmail);

    await smtpClient.SendMailAsync(mailMessage);
}
}