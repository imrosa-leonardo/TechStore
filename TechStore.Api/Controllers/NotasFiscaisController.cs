using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechStore.Api.Data;
using TechStore.Api.Models;

namespace TechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotasFiscaisController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotasFiscaisController(AppDbContext context)
    {
        _context = context;
    }

    private int UsuarioIdAtual =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var notas = await _context.NotasFiscais
            .Include(n => n.Fornecedor)
            .Include(n => n.Itens)
                .ThenInclude(i => i.Produto)
            .Where(n => n.UsuarioId == UsuarioIdAtual)
            .OrderByDescending(n => n.DataEmissao)
            .ToListAsync();

        return Ok(notas);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var nota = await _context.NotasFiscais
            .Include(n => n.Fornecedor)
            .Include(n => n.Itens)
                .ThenInclude(i => i.Produto)
            .FirstOrDefaultAsync(n => n.Id == id && n.UsuarioId == UsuarioIdAtual);

        if (nota == null) return NotFound(new { mensagem = "Nota fiscal não encontrada." });

        return Ok(nota);
    }

    [HttpPost]
    public async Task<IActionResult> Cadastrar([FromBody] NotaFiscal notaFiscal)
    {
        notaFiscal.UsuarioId = UsuarioIdAtual;
        notaFiscal.DataEmissao = DateTime.SpecifyKind(notaFiscal.DataEmissao, DateTimeKind.Utc);

        _context.NotasFiscais.Add(notaFiscal);
        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "Nota fiscal cadastrada com sucesso!", data = notaFiscal });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] NotaFiscal notaAlterada)
    {
        if (id != notaAlterada.Id) return BadRequest("ID incompatível.");

        var nota = await _context.NotasFiscais
            .FirstOrDefaultAsync(n => n.Id == id && n.UsuarioId == UsuarioIdAtual);

        if (nota == null) return NotFound("Nota fiscal não encontrada.");

        nota.Numero = notaAlterada.Numero;
        nota.Serie = notaAlterada.Serie;
        nota.DataEmissao = notaAlterada.DataEmissao;
        nota.FornecedorId = notaAlterada.FornecedorId;

        await _context.SaveChangesAsync();
        return Ok(new { mensagem = "Nota fiscal atualizada com sucesso!" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var nota = await _context.NotasFiscais
            .FirstOrDefaultAsync(n => n.Id == id && n.UsuarioId == UsuarioIdAtual);

        if (nota == null) return NotFound("Nota fiscal não encontrada.");

        try
        {
            _context.NotasFiscais.Remove(nota);
            await _context.SaveChangesAsync();
            return Ok(new { mensagem = "Nota fiscal removida com sucesso!" });
        }
        catch (DbUpdateException)
        {
            return BadRequest("Não é possível remover uma nota fiscal com produtos vinculados.");
        }
    }
}