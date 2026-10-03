using System.Net;
using System.Net.Mail;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace TaskFlow.API.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient = new HttpClient();

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }
public async Task SendEmailAsync(string toEmail, string subject, string body)
{
    var apiKey = _configuration["Resend:ApiKey"];
    _httpClient.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", apiKey);

var emailData = new
{
    from = "TaskFlow <onboarding@resend.dev>",
    to = new[] { toEmail },
    subject = subject,
    html = body
};

var json = JsonSerializer.Serialize(emailData);
var content = new StringContent(json, Encoding.UTF8, "application/json");

var response = await _httpClient.PostAsync(
    "https://api.resend.com/emails",
    content
);

response.EnsureSuccessStatusCode();

return;
}
}