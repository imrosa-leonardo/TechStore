using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStore.Api.Data;
using TechStore.Api.Models;

namespace TechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DetalhesProdutoController : ControllerBase
{
    private readonly AppDbContext _context;
    public DetalhesProdutoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("produto/{produtoId}")]
    public async Task<ActionResult<DetalheProduto>> GetDetalhePorProduto (int produtoId)
    {
        var detalhe = await _context.DetalhesProduto
            .Include(d => d.Produto)
            .FirstOrDefaultAsync(d => d.ProdutoId == produtoId);

        if (detalhe == null)
        {
            return NotFound(new { mensagem = $"Nenhum detalhe encontrado para o produto de ID {produtoId}." });
        }

        return Ok(detalhe);
    }

    [HttpPost]
    public async Task<ActionResult<DetalheProduto>> PostDetalhe(DetalheProduto detalhe)
    {
        var produto = await _context.Produtos.FindAsync(detalhe.ProdutoId);
        if (produto == null)
        {
            return BadRequest(new { mensagem = $"Produto com ID {detalhe.ProdutoId} não encontrado." });
        }

        var detalheExistente = await _context.DetalhesProduto
            .FirstOrDefaultAsync(d => d.ProdutoId == detalhe.ProdutoId);

        if (detalheExistente != null)
        {
            return Conflict(new { mensagem = $"O produto de ID {detalhe.ProdutoId} já possui um detalhe cadastrado. " + "Use PUT para atualizar o detalhe existente." });
        }

        _context.DetalhesProduto.Add(detalhe);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDetalhePorProduto), new { produtoId = detalhe.ProdutoId }, detalhe);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutDetalhe(int id, DetalheProduto detalhe)
    {
        if (id != detalhe.Id)
        {
            return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID do detalhe" });
        }

        var detalheExistente = await _context.DetalhesProduto.FindAsync(id);

        if (detalheExistente == null)
        {
            return NotFound(new { mensagem = $"Detalhe com ID {id} não encontrado." });
        }

        detalheExistente.Especificacoes = detalhe.Especificacoes;
        detalheExistente.Garantia = detalhe.Garantia;
        detalheExistente.PaisDeOrigem = detalhe.PaisDeOrigem;
        detalheExistente.PesoGramas = detalhe.PesoGramas;

        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDetalhe(int id)
    {
        var detalhe = await _context.DetalhesProduto.FindAsync(id);
        
        if (detalhe == null)
        {
            return NotFound(new { mensagem = $"Detalhe com ID {id} não encontrado."});
        }

        _context.DetalhesProduto.Remove(detalhe);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}