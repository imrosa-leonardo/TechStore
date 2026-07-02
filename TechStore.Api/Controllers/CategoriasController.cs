using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStore.Api.Data;
using TechStore.Api.Models;

namespace TechStore.Api.Controllers;

[ApiController]

[Route("api/[controller]")]

public class CategoriasController : ControllerBase
{
    
    private readonly AppDbContext _context;

    public CategoriasController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias()
    {
        var categorias = await _context.Categorias.ToListAsync();
        return Ok(categorias);
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Categoria>> GetCategoria(int id)
    {
        var categoria = await _context.Categorias
            .Include(c => c.Produtos) 
            .FirstOrDefaultAsync(c => c.Id == id);

            if (categoria == null)
        {
            return NotFound(new {mensagem = $"Categoria com ID {id} não encontrada."});
        }

        return Ok(categoria);
        
    }

    [HttpPost]
    public async Task<ActionResult<Categoria>> PostCategoria(Categoria categoria)
    {
        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategoria), new { id = categoria.Id }, categoria);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutCategoria(int id, Categoria categoria)
    {
        if (id != categoria.Id)
        {
            return BadRequest(new {mensagem = "ID da categoria não corresponde ao ID da URL."});
        }

        var categoriaExistente = await _context.Categorias.FindAsync(id);

        if (categoriaExistente == null)
        {
            return NotFound(new {mensagem = $"Categoria com ID {id} não encontrada."});
        }

        categoriaExistente.Nome = categoria.Nome;
        categoriaExistente.Descricao = categoria.Descricao;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategoria(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);

        if (categoria == null)
        {
            return NotFound(new {mensagem = $"Categoria com ID {id} não encontrada."});
        }

        try
        {
            _context.Categorias.Remove(categoria);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return BadRequest(new 
            {
                mensagem = "Não é possível excluir esta categoria porque existem produtos associados a ela." + 
                "Remova ou reatribua os produtos antes de excluir a categoria."
                });
        }

        return NoContent();
    }

}