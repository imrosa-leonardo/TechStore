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
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var fornecedores = await _context.Fornecedores
            .Where(f => f.UsuarioId == UsuarioIdAtual)
            .ToListAsync();
        return Ok(fornecedores);
    }

    // POST: api/fornecedores
    [HttpPost]
    public async Task<IActionResult> Cadastrar([FromBody] Fornecedor fornecedor)
    {
        if (fornecedor == null) return BadRequest();

        fornecedor.UsuarioId = UsuarioIdAtual;
        _context.Fornecedores.Add(fornecedor);
        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "Fornecedor cadastrado com sucesso!", data = fornecedor });
    }

    // PUT: api/fornecedores/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] Fornecedor fornecedorAlterado)
    {
        if (id != fornecedorAlterado.Id) return BadRequest("ID incompatível.");

        var fornecedor = await _context.Fornecedores
            .FirstOrDefaultAsync(f => f.Id == id && f.UsuarioId == UsuarioIdAtual);

        if (fornecedor == null) return NotFound("Fornecedor não encontrado.");

        fornecedor.Nome = fornecedorAlterado.Nome;
        fornecedor.Contato = fornecedorAlterado.Contato;

        await _context.SaveChangesAsync();
        return Ok(new { mensagem = "Fornecedor atualizado com sucesso!" });
    }

    // DELETE: api/fornecedores/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var fornecedor = await _context.Fornecedores
            .FirstOrDefaultAsync(f => f.Id == id && f.UsuarioId == UsuarioIdAtual);

        if (fornecedor == null) return NotFound("Fornecedor não encontrado.");

        try
        {
            _context.Fornecedores.Remove(fornecedor);
            await _context.SaveChangesAsync();
            return Ok(new { mensagem = "Fornecedor removido com sucesso!" });
        }
        catch (DbUpdateException)
        {
            return BadRequest("Não é possível remover um fornecedor que possui produtos vinculados.");
        }
    }
}