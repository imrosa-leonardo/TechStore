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

    // GET: api/notasfiscais
    // Lista todas as notas fiscais do usuário, da mais recente para a mais antiga.
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var notas = await _context.NotasFiscais
            .Include(n => n.Fornecedor)           // traz o nome do fornecedor junto
            .Include(n => n.Itens)                // traz os itens da nota...
                .ThenInclude(i => i.Produto)       // ...e, de cada item, o produto correspondente
                                                    // (ThenInclude "encadeia" um segundo nível de inclusão)
            .Where(n => n.UsuarioId == UsuarioIdAtual)
            .OrderByDescending(n => n.DataEmissao) // mais recentes primeiro
            .ToListAsync();

        // 200 OK
        return Ok(notas);
    }

    // GET: api/notasfiscais/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var nota = await _context.NotasFiscais
            .Include(n => n.Fornecedor)
            .Include(n => n.Itens)
                .ThenInclude(i => i.Produto)
            .FirstOrDefaultAsync(n => n.Id == id && n.UsuarioId == UsuarioIdAtual);

        // 404 Not Found — nota não existe ou pertence a outro usuário.
        if (nota == null) return NotFound(new { mensagem = "Nota fiscal não encontrada." });

        // 200 OK
        return Ok(nota);
    }

    // POST: api/notasfiscais
    [HttpPost]
    public async Task<IActionResult> Cadastrar([FromBody] NotaFiscal notaFiscal)
    {
        notaFiscal.UsuarioId = UsuarioIdAtual;

        // Correção pontual do problema de DateTime/UTC especificamente na criação:
        // garante que a data recebida do frontend (que pode vir sem informação de
        // fuso horário) seja tratada como UTC antes de tentar salvar no PostgreSQL.
        // (O AppDbContext já tem uma correção global equivalente, mas essa linha
        // reforça o comportamento explicitamente aqui também.)
        notaFiscal.DataEmissao = DateTime.SpecifyKind(notaFiscal.DataEmissao, DateTimeKind.Utc);

        _context.NotasFiscais.Add(notaFiscal);
        await _context.SaveChangesAsync();

        // 200 OK com a nota criada.
        return Ok(new { mensagem = "Nota fiscal cadastrada com sucesso!", data = notaFiscal });
    }

    // PUT: api/notasfiscais/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] NotaFiscal notaAlterada)
    {
        if (id != notaAlterada.Id) return BadRequest("ID incompatível."); // 400 Bad Request

        var nota = await _context.NotasFiscais
            .FirstOrDefaultAsync(n => n.Id == id && n.UsuarioId == UsuarioIdAtual);

        if (nota == null) return NotFound("Nota fiscal não encontrada."); // 404 Not Found

        nota.Numero = notaAlterada.Numero;
        nota.Serie = notaAlterada.Serie;
        nota.DataEmissao = notaAlterada.DataEmissao;
        nota.FornecedorId = notaAlterada.FornecedorId;
        // ValorTotal não aparece aqui de propósito: é uma propriedade CALCULADA
        // (soma dos itens), não existe como campo editável — tentar atribuí-la
        // geraria erro de compilação, já que não tem "set" definido no model.

        await _context.SaveChangesAsync();

        // 200 OK
        return Ok(new { mensagem = "Nota fiscal atualizada com sucesso!" });
    }

    // DELETE: api/notasfiscais/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var nota = await _context.NotasFiscais
            .FirstOrDefaultAsync(n => n.Id == id && n.UsuarioId == UsuarioIdAtual);

        if (nota == null) return NotFound("Nota fiscal não encontrada."); // 404 Not Found

        try
        {
            _context.NotasFiscais.Remove(nota);
            await _context.SaveChangesAsync();

            // 200 OK — exclusão bem-sucedida (e, por causa do DeleteBehavior.Cascade
            // configurado no AppDbContext, os itens dessa nota são excluídos junto,
            // automaticamente, pelo próprio banco de dados).
            return Ok(new { mensagem = "Nota fiscal removida com sucesso!" });
        }
        catch (DbUpdateException)
        {
            // Esse catch, na prática, dificilmente é acionado hoje: como ItemNotaFiscal
            // usa DeleteBehavior.Cascade em relação à NotaFiscal (não Restrict), o banco
            // normalmente permite a exclusão sem barrar. Fica aqui como proteção extra
            // para qualquer outra constraint futura que venha a existir.
            // 400 Bad Request
            return BadRequest("Não é possível remover uma nota fiscal com produtos vinculados.");
        }
    }
}