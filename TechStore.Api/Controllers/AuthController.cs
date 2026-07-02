using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TechStore.Api.Data;
using TechStore.Api.Models;

namespace TechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly string _chaveJwt = "ChaveSecretaMuitoSeguraTechStore2026!";

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // 1. BUSCA O USUÁRIO DIRETAMENTE NO BANCO DE DADOS
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.NomeUsuario == dto.NomeUsuario);

        // 2. VALIDA SE ELE EXISTE E SE A SENHA CRIPTOGRAFADA BATE
        if (usuario == null || !BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
        {
            return Unauthorized(new { mensagem = "Usuário ou senha inválidos" });
        }

        // 3. GERAÇÃO DO TOKEN JWT COM OS DADOS REAIS DO USUÁRIO
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_chaveJwt);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, usuario.NomeUsuario),
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString())
            }),
            Expires = DateTime.UtcNow.AddHours(8),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return Ok(new { token = tokenString });
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] RegisterDto dto)
    {
        // Verifica se o usuário já existe no banco
        var usuarioExiste = await _context.Usuarios
            .AnyAsync(u => u.NomeUsuario == dto.NomeUsuario);

        if (usuarioExiste)
        {
            return BadRequest(new { mensagem = "Este nome de usuário já está em uso." });
        }

        // Criptografa a senha antes de salvar
        var senhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha);

        var novoUsuario = new Usuario
        {
            NomeUsuario = dto.NomeUsuario,
            SenhaHash = senhaHash
        };

        _context.Usuarios.Add(novoUsuario);
        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "Usuário cadastrado com sucesso!" });
    }

    public class RegisterDto
    {
        public required string NomeUsuario { get; set; }
        public required string Senha { get; set; }
    }
}

public class LoginDto
{
    public required string NomeUsuario { get; set; }
    public required string Senha { get; set; }
}