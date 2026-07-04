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
public class ItensNotaFiscalController : ControllerBase
{
    private readonly AppDbContext _context;

    public ItensNotaFiscalController(AppDbContext context)
    {
        _context = context;
    }

    private int UsuarioIdAtual =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET: api/itensnotafiscal?notaFiscalId=5
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int notaFiscalId)
    {
        var itens = await _context.ItensNotaFiscal
            .Include(i => i.Produto)
            .Where(i => i.NotaFiscalId == notaFiscalId && i.NotaFiscal!.UsuarioId == UsuarioIdAtual)
            .ToListAsync();

        return Ok(itens);
    }

    [HttpPost]
    public async Task<IActionResult> Cadastrar([FromBody] ItemNotaFiscal item)
    {
        var nota = await _context.NotasFiscais
            .FirstOrDefaultAsync(n => n.Id == item.NotaFiscalId && n.UsuarioId == UsuarioIdAtual);

        if (nota == null)
            return BadRequest(new { mensagem = "Nota fiscal não encontrada." });

        var produto = await _context.Produtos
            .FirstOrDefaultAsync(p => p.Id == item.ProdutoId && p.UsuarioId == UsuarioIdAtual);

        if (produto == null)
            return BadRequest(new { mensagem = "Produto não encontrado." });

        _context.ItensNotaFiscal.Add(item);
        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "Item adicionado à nota fiscal com sucesso!", data = item });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] ItemNotaFiscal itemAlterado)
    {
        var item = await _context.ItensNotaFiscal
            .Include(i => i.NotaFiscal)
            .FirstOrDefaultAsync(i => i.Id == id && i.NotaFiscal!.UsuarioId == UsuarioIdAtual);

        if (item == null) return NotFound(new { mensagem = "Item não encontrado." });

        item.ProdutoId = itemAlterado.ProdutoId;
        item.Quantidade = itemAlterado.Quantidade;
        item.ValorUnitario = itemAlterado.ValorUnitario;

        await _context.SaveChangesAsync();
        return Ok(new { mensagem = "Item atualizado com sucesso!" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var item = await _context.ItensNotaFiscal
            .Include(i => i.NotaFiscal)
            .FirstOrDefaultAsync(i => i.Id == id && i.NotaFiscal!.UsuarioId == UsuarioIdAtual);

        if (item == null) return NotFound(new { mensagem = "Item não encontrado." });

        _context.ItensNotaFiscal.Remove(item);
        await _context.SaveChangesAsync();
        return Ok(new { mensagem = "Item removido com sucesso!" });
    }
}