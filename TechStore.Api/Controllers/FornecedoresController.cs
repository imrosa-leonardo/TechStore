using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechStore.Api.Data;
using TechStore.Api.Models;

namespace TechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Qualquer chamada sem token válido recebe 401 Unauthorized automaticamente
public class FornecedoresController : ControllerBase
{
    private readonly AppDbContext _context;

    public FornecedoresController(AppDbContext context)
    {
        _context = context;
    }

    private int UsuarioIdAtual =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET: api/fornecedores
    // Lista todos os fornecedores do usuário logado.
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var fornecedores = await _context.Fornecedores
            .Where(f => f.UsuarioId == UsuarioIdAtual)
            .ToListAsync();

        // 200 OK — mesmo que a lista venha vazia, ainda é uma resposta "de sucesso"
        return Ok(fornecedores);
    }

    // POST: api/fornecedores
    [HttpPost]
    public async Task<IActionResult> Cadastrar([FromBody] Fornecedor fornecedor)
    {
        if (fornecedor == null)
        {
            // 400 Bad Request — corpo da requisição vazio/inválido
            return BadRequest(new { mensagem = "Dados do fornecedor não foram enviados." });
        }

        // Atribui o dono do registro automaticamente com base no token,
        // IGNORANDO qualquer UsuarioId que o frontend tenha tentado enviar
        // (evita que alguém "assine" um registro em nome de outro usuário).
        fornecedor.UsuarioId = UsuarioIdAtual;
        _context.Fornecedores.Add(fornecedor);
        await _context.SaveChangesAsync();

        // 200 OK com o objeto criado.
        return Ok(new { mensagem = "Fornecedor cadastrado com sucesso!", data = fornecedor });
    }

    // PUT: api/fornecedores/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] Fornecedor fornecedorAlterado)
    {
        if (id != fornecedorAlterado.Id)
        {
            // 400 Bad Request
            return BadRequest(new { mensagem = "ID incompatível." });
        }

        var fornecedor = await _context.Fornecedores
            .FirstOrDefaultAsync(f => f.Id == id && f.UsuarioId == UsuarioIdAtual);

        if (fornecedor == null)
        {
            // 404 Not Found — não existe, ou existe mas pertence a outro usuário
            return NotFound(new { mensagem = "Fornecedor não encontrado." });
        }

        fornecedor.Nome = fornecedorAlterado.Nome;
        fornecedor.Contato = fornecedorAlterado.Contato;

        await _context.SaveChangesAsync();

        // 200 OK com mensagem de confirmação.
        return Ok(new { mensagem = "Fornecedor atualizado com sucesso!" });
    }

    // DELETE: api/fornecedores/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var fornecedor = await _context.Fornecedores
            .FirstOrDefaultAsync(f => f.Id == id && f.UsuarioId == UsuarioIdAtual);

        if (fornecedor == null)
        {
            // 404 Not Found
            return NotFound(new { mensagem = "Fornecedor não encontrado." });
        }

        try
        {
            _context.Fornecedores.Remove(fornecedor);
            await _context.SaveChangesAsync();

            // 200 OK — exclusão bem-sucedida.
            return Ok(new { mensagem = "Fornecedor removido com sucesso!" });
        }
        catch (DbUpdateException)
        {
            // Esse catch captura a exceção que o PostgreSQL lança quando a exclusão
            // viola a constraint DeleteBehavior.Restrict configurada no AppDbContext
            // (Fornecedor → NotaFiscal). Ou seja: esse fornecedor tem notas fiscais
            // vinculadas, e o banco recusou a exclusão para não deixar dados órfãos.
            // 400 Bad Request — a operação viola uma regra de integridade do sistema.
            return BadRequest(new { mensagem = "Não é possível remover um fornecedor que possui notas fiscais vinculadas." });
        }
    }
}