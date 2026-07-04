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
public class ProdutosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProdutosController(AppDbContext context)
    {
        _context = context;
    }

    private int UsuarioIdAtual =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET: api/Produtos
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Produto>>> GetProdutos()
    {
        var produtos = await _context.Produtos
            .Include(p => p.Categoria)
            .Where(p => p.UsuarioId == UsuarioIdAtual)
            .ToListAsync();
        return Ok(produtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Produto>> GetProduto(int id)
    {
        var produto = await _context.Produtos
            .Include(p => p.Categoria)
            .Include(p => p.DetalheProduto)
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == UsuarioIdAtual);

        if (produto == null)
        {
            return NotFound(new { mensagem = $"Produto com o ID {id} não encontrado." });
        }

        return Ok(produto);
    }

    [HttpPost]
    public async Task<ActionResult<Produto>> PostProduto(Produto produto)
    {
        produto.DataCriacao = DateTime.UtcNow;
        produto.UsuarioId = UsuarioIdAtual;
        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProduto), new { id = produto.Id }, produto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutProduto(int id, Produto produto)
    {
        if (id != produto.Id)
        {
            return BadRequest(new { mensagem = "O ID do produto não corresponde ao ID fornecido." });
        }

        var produtoExistente = await _context.Produtos
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == UsuarioIdAtual);

        if (produtoExistente == null)
        {
            return NotFound(new { mensagem = $"Produto com o ID {id} não encontrado." });
        }

        produtoExistente.Nome = produto.Nome;
        produtoExistente.Descricao = produto.Descricao;
        produtoExistente.Preco = produto.Preco;
        produtoExistente.Quantidade = produto.Quantidade;
        produtoExistente.CategoriaId = produto.CategoriaId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduto(int id)
    {
        var produto = await _context.Produtos
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == UsuarioIdAtual);

        if (produto == null)
        {
            return NotFound(new { mensagem = $"Produto com o ID {id} não encontrado." });
        }

        _context.Produtos.Remove(produto);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}