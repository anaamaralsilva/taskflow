using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly TaskFlow.API.Services.EmailService _emailService;
    
    public AuthController(
    AppDbContext context,
    IConfiguration configuration,
    TaskFlow.API.Services.EmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var passwordIsValid = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash
        );

        if (!passwordIsValid)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }
var claims = new[]
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim(ClaimTypes.Name, user.Name),
    new Claim(ClaimTypes.Email, user.Email)
};

var jwtKey = _configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT key not configured.");

var key = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(jwtKey)
);

var credentials = new SigningCredentials(
    key,
    SecurityAlgorithms.HmacSha256
);

var token = new JwtSecurityToken(
    issuer: _configuration["Jwt:Issuer"],
    audience: _configuration["Jwt:Audience"],
    claims: claims,
    expires: DateTime.UtcNow.AddMinutes(
        _configuration.GetValue<int>("Jwt:ExpiresMinutes")
    ),
    signingCredentials: credentials
);

var tokenValue = new JwtSecurityTokenHandler()
    .WriteToken(token);
        return Ok(new
        {
            token = tokenValue,
            user = new
           { 
            user.Id,
            user.Name,
            user.Email
          }  
        });
    }
[HttpPost("register")]
public async Task<IActionResult> Register(RegisterUserRequest request)
{
    var emailExists = await _context.Users
        .AnyAsync(u => u.Email == request.Email);

    if (emailExists)
    {
        return BadRequest(new
        {
            message = "Email already registered."
        });
    }

    var user = new User
    {
        Name = request.Name,
        Email = request.Email,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
    };

    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "User registered successfully."
    });
}

[HttpPost("forgot-password")]
public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == request.Email);

    if (user is null)
    {
        return Ok(new
        {
            message = "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha."
        });
    }

user.PasswordResetToken = Guid.NewGuid().ToString();

user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(30);

await _context.SaveChangesAsync();

    var resetLink = $"http://localhost:5173/reset-password?token={user.PasswordResetToken}";

await _emailService.SendEmailAsync(
    user.Email,
    "Redefinição de senha - TaskFlow",
    $@"
        <h2>Redefinição de senha</h2>
        <p>Olá, {user.Name}!</p>
        <p>Recebemos uma solicitação para redefinir sua senha no TaskFlow.</p>
        <p>
            <a href=""{resetLink}"">Clique aqui para redefinir sua senha</a>
        </p>
        <p>Este link expira em 30 minutos.</p>
        <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
    "
);
return Ok(new
{
    message = "Link de recuperação gerado com sucesso.",
    resetLink
});
}    
[HttpPost("reset-password")]
public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token);

    if (user is null ||
        user.PasswordResetTokenExpiresAt is null ||
        user.PasswordResetTokenExpiresAt < DateTime.UtcNow)
    {
        return BadRequest(new
        {
            message = "Token inválido ou expirado."
        });
    }

    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

    user.PasswordResetToken = null;
    user.PasswordResetTokenExpiresAt = null;

    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Senha redefinida com sucesso."
    });
}

[Authorize]
[HttpGet("protected")]
public IActionResult Protected()
{
    return Ok(new
    {
        message = "Access granted."
    });
}

}