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
    // Lista os itens de UMA nota fiscal específica, passada via query string.
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int notaFiscalId)
    {
        var itens = await _context.ItensNotaFiscal
            .Include(i => i.Produto) // traz o nome/preço do produto junto, para exibir na tabela do frontend
            // A checagem "i.NotaFiscal!.UsuarioId == UsuarioIdAtual" garante que, mesmo que
            // alguém tente passar o notaFiscalId de uma nota de OUTRO usuário na URL,
            // a consulta simplesmente não retorna nada (nunca dá acesso cruzado entre contas).
            .Where(i => i.NotaFiscalId == notaFiscalId && i.NotaFiscal!.UsuarioId == UsuarioIdAtual)
            .ToListAsync();

        // 200 OK — mesmo que a lista venha vazia (nota sem itens ainda).
        return Ok(itens);
    }

    // POST: api/itensnotafiscal
    // Adiciona um novo item (produto + quantidade + valor) a uma nota fiscal.
    [HttpPost]
    public async Task<IActionResult> Cadastrar([FromBody] ItemNotaFiscal item)
    {
        // Confirma que a NotaFiscal referenciada existe e pertence ao usuário logado.
        var nota = await _context.NotasFiscais
            .FirstOrDefaultAsync(n => n.Id == item.NotaFiscalId && n.UsuarioId == UsuarioIdAtual);

        if (nota == null)
            // 400 Bad Request — NotaFiscalId inválido ou de outro usuário.
            return BadRequest(new { mensagem = "Nota fiscal não encontrada." });

        // Confirma que o Produto referenciado existe e pertence ao usuário logado.
        var produto = await _context.Produtos
            .FirstOrDefaultAsync(p => p.Id == item.ProdutoId && p.UsuarioId == UsuarioIdAtual);

        if (produto == null)
            // 400 Bad Request — ProdutoId inválido ou de outro usuário.
            return BadRequest(new { mensagem = "Produto não encontrado." });

        _context.ItensNotaFiscal.Add(item);
        await _context.SaveChangesAsync();

        // 200 OK com o item criado.
        return Ok(new { mensagem = "Item adicionado à nota fiscal com sucesso!", data = item });
    }

    // PUT: api/itensnotafiscal/{id}
    // Atualiza quantidade/valor/produto de um item já existente.
    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] ItemNotaFiscal itemAlterado)
    {
        // Include(NotaFiscal) necessário porque ItemNotaFiscal não tem UsuarioId
        // próprio — a posse é verificada indiretamente, através da nota fiscal "pai".
        var item = await _context.ItensNotaFiscal
            .Include(i => i.NotaFiscal)
            .FirstOrDefaultAsync(i => i.Id == id && i.NotaFiscal!.UsuarioId == UsuarioIdAtual);

        if (item == null) return NotFound(new { mensagem = "Item não encontrado." }); // 404 Not Found

        item.ProdutoId = itemAlterado.ProdutoId;
        item.Quantidade = itemAlterado.Quantidade;
        item.ValorUnitario = itemAlterado.ValorUnitario;

        await _context.SaveChangesAsync();

        // 200 OK com mensagem de confirmação.
        return Ok(new { mensagem = "Item atualizado com sucesso!" });
    }

    // DELETE: api/itensnotafiscal/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var item = await _context.ItensNotaFiscal
            .Include(i => i.NotaFiscal)
            .FirstOrDefaultAsync(i => i.Id == id && i.NotaFiscal!.UsuarioId == UsuarioIdAtual);

        if (item == null) return NotFound(new { mensagem = "Item não encontrado." }); // 404 Not Found

        _context.ItensNotaFiscal.Remove(item);
        await _context.SaveChangesAsync();

        // 200 OK — exclusão bem-sucedida. Não precisa de try/catch aqui porque
        // ItemNotaFiscal não é referenciado por mais nada no sistema (é sempre
        // a "ponta final" da cadeia de relacionamentos).
        return Ok(new { mensagem = "Item removido com sucesso!" });
    }
}