using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TechStore.Api.Data;
using TechStore.Api.Models;

namespace TechStore.Api.Controllers;

// [ApiController] ativa validações automáticas (ex: retorna 400 automaticamente
// se o corpo da requisição não bater com o DTO esperado) e outras convenções de API REST.
[ApiController]
// Define que este controller responde em "/api/auth" (o nome "Auth" vem do
// nome da classe "AuthController", removendo o sufixo "Controller").
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // _context é a nossa conexão com o banco de dados (via Entity Framework),
    // injetada automaticamente pelo ASP.NET Core no construtor abaixo.
    private readonly AppDbContext _context;

    // Chave secreta usada para assinar e conferir a validade dos tokens JWT.
    // Precisa ser EXATAMENTE a mesma chave configurada no Program.cs,
    // senão os tokens gerados aqui seriam rejeitados pelo restante da API.
    private readonly string _chaveJwt = "ChaveSecretaMuitoSeguraTechStore2026!";

    // Construtor: o ASP.NET Core injeta automaticamente uma instância do AppDbContext
    // aqui sempre que uma requisição chega nesse controller (Injeção de Dependência).
    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    // Endpoint: POST /api/auth/login
    // Recebe usuário e senha, valida, e devolve um token JWT se estiver tudo certo.
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // 1. BUSCA O USUÁRIO DIRETAMENTE NO BANCO DE DADOS
        // Procura na tabela Usuarios um registro cujo NomeUsuario seja igual
        // ao que foi enviado na requisição. Se não encontrar, retorna null.
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.NomeUsuario == dto.NomeUsuario);

        // 2. VALIDA SE ELE EXISTE E SE A SENHA CRIPTOGRAFADA BATE
        // BCrypt.Verify compara a senha em texto puro (dto.Senha) com o hash
        // salvo no banco (usuario.SenhaHash) — nunca comparamos senhas em texto puro
        // diretamente, pois a senha real nunca é armazenada, só o hash dela.
        if (usuario == null || !BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
        {
            // Mensagem genérica de propósito: não revelamos se o erro foi
            // "usuário não existe" ou "senha errada", por segurança (evita
            // que alguém descubra quais nomes de usuário existem no sistema).
            return Unauthorized(new { mensagem = "Usuário ou senha inválidos" });
        }

        // 3. GERAÇÃO DO TOKEN JWT COM OS DADOS REAIS DO USUÁRIO
        // JwtSecurityTokenHandler é a classe responsável por criar e assinar o token.
        var tokenHandler = new JwtSecurityTokenHandler();

        // Converte a chave secreta (string) em bytes, formato exigido pela biblioteca de criptografia.
        var key = Encoding.UTF8.GetBytes(_chaveJwt);

        // Define o "conteúdo" e as regras do token que vamos gerar.
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            // Claims são "afirmações" sobre o usuário, guardadas dentro do token.
            // Elas ficam visíveis (não criptografadas, só assinadas) para qualquer
            // um que decodificar o token — não devem conter dados sensíveis como senha.
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, usuario.NomeUsuario),
                // Essa claim é a MAIS IMPORTANTE do sistema: é o Id do usuário logado.
                // Todo Controller protegido (Produtos, Categorias, etc.) lê esse valor
                // através de "User.FindFirstValue(ClaimTypes.NameIdentifier)" para saber
                // QUEM está fazendo a requisição, e assim filtrar só os dados dele.
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString())
            }),
            // Define que esse token deixa de ser válido 8 horas após ser gerado.
            // Depois disso, o usuário precisa fazer login novamente.
            Expires = DateTime.UtcNow.AddHours(8),
            // Assina o token com a chave secreta, usando o algoritmo HMAC-SHA256.
            // Essa assinatura é o que impede alguém de "forjar" um token válido
            // sem conhecer a chave secreta do servidor.
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        // Gera o token propriamente dito, com base nas regras definidas acima.
        var token = tokenHandler.CreateToken(tokenDescriptor);

        // Converte o token (um objeto interno da biblioteca) para a string
        // que efetivamente será enviada ao frontend (o formato clássico "xxxxx.yyyyy.zzzzz").
        var tokenString = tokenHandler.WriteToken(token);

        // Devolve o token para o frontend, que vai guardá-lo (no localStorage)
        // e reenviá-lo em toda requisição futura, no cabeçalho Authorization.
        return Ok(new { token = tokenString });
    }

    // Endpoint: POST /api/auth/registrar
    // Cria uma nova conta de usuário no sistema.
    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] RegisterDto dto)
    {
        // Verifica se o usuário já existe no banco
        // AnyAsync retorna true/false sem precisar carregar o registro inteiro —
        // mais eficiente do que buscar o usuário completo só para checar se existe.
        var usuarioExiste = await _context.Usuarios
            .AnyAsync(u => u.NomeUsuario == dto.NomeUsuario);

        if (usuarioExiste)
        {
            // Impede dois usuários com o mesmo nome de login.
            return BadRequest(new { mensagem = "Este nome de usuário já está em uso." });
        }

        // Criptografa a senha antes de salvar
        // BCrypt.HashPassword transforma a senha em texto puro num "hash" — uma versão
        // embaralhada e irreversível. Mesmo que alguém tenha acesso ao banco de dados,
        // não conseguiria descobrir a senha original a partir do hash.
        var senhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha);

        // Monta o novo registro de Usuario, já com a senha protegida (nunca guardamos
        // a senha em texto puro em nenhum momento, nem temporariamente).
        var novoUsuario = new Usuario
        {
            NomeUsuario = dto.NomeUsuario,
            SenhaHash = senhaHash
        };

        // Adiciona o novo usuário à "fila" de mudanças pendentes do Entity Framework...
        _context.Usuarios.Add(novoUsuario);
        // ...e efetivamente salva no banco de dados (gera o INSERT em SQL).
        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "Usuário cadastrado com sucesso!" });
    }

    // DTO (Data Transfer Object) usado exclusivamente para receber os dados
    // do formulário de cadastro (POST /api/auth/registrar). Separado do model
    // Usuario para não expor ou aceitar campos que não deveriam vir do frontend
    // (como Id ou SenhaHash direto).
    public class RegisterDto
    {
        public required string NomeUsuario { get; set; }
        public required string Senha { get; set; } // aqui ainda é a senha em texto puro, recebida do formulário
    }
}

// DTO usado para receber os dados do formulário de login (POST /api/auth/login).
// Fica fora da classe AuthController porque, diferente do RegisterDto, não é
// específico só de um método — mas poderia estar dentro também, é só organização.
public class LoginDto
{
    public required string NomeUsuario { get; set; }
    public required string Senha { get; set; }
}