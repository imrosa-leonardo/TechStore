using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechStore.Api.Data;
using TechStore.Api.Models;

namespace TechStore.Api.Controllers;

// [Authorize] na classe protege TODOS os métodos abaixo: qualquer requisição
// sem um token JWT válido recebe automaticamente 401 Unauthorized antes
// mesmo de entrar no método (o ASP.NET Core barra isso no pipeline).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DetalhesProdutoController : ControllerBase
{
    private readonly AppDbContext _context;

    public DetalhesProdutoController(AppDbContext context)
    {
        _context = context;
    }

    // Extrai o Id do usuário logado a partir do token JWT (claim NameIdentifier,
    // que foi colocada lá pelo AuthController no momento do login).
    // Usada em toda consulta abaixo para garantir que um usuário só acesse
    // detalhes de PRODUTOS QUE SÃO DELE.
    private int UsuarioIdAtual =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET: api/DetalhesProduto/produto/{produtoId}
    // Busca o detalhe técnico de um produto específico.
    [HttpGet("produto/{produtoId}")]
    public async Task<ActionResult<DetalheProduto>> GetDetalhePorProduto(int produtoId)
    {
        // Include(d => d.Produto) traz o Produto junto na mesma consulta,
        // necessário para poder checar "d.Produto!.UsuarioId" logo abaixo
        // (sem isso, Produto viria null e a checagem falharia).
        var detalhe = await _context.DetalhesProduto
            .Include(d => d.Produto)
            .FirstOrDefaultAsync(d => d.ProdutoId == produtoId && d.Produto!.UsuarioId == UsuarioIdAtual);

        if (detalhe == null)
        {
            // 404 Not Found — cenário ESPERADO quando o produto ainda não tem
            // detalhe cadastrado (não é necessariamente um "erro" no frontend,
            // apenas indica "ainda não existe, pode criar um novo").
            return NotFound(new { mensagem = $"Nenhum detalhe encontrado para o produto de ID {produtoId}." });
        }

        // 200 OK — detalhe encontrado e retornado normalmente.
        return Ok(detalhe);
    }

    // POST: api/DetalhesProduto
    // Cria um novo detalhe técnico para um produto (só é permitido um por produto).
    [HttpPost]
    public async Task<ActionResult<DetalheProduto>> PostDetalhe(DetalheProduto detalhe)
    {
        // Confirma que o Produto referenciado existe E pertence ao usuário logado —
        // evita que alguém crie um detalhe apontando para um ProdutoId de outra conta.
        var produto = await _context.Produtos
            .FirstOrDefaultAsync(p => p.Id == detalhe.ProdutoId && p.UsuarioId == UsuarioIdAtual);

        if (produto == null)
        {
            // 400 Bad Request — o ProdutoId enviado não existe (ou não é do usuário).
            return BadRequest(new { mensagem = $"Produto com ID {detalhe.ProdutoId} não encontrado." });
        }

        // Verifica se esse produto JÁ tem um detalhe cadastrado — a relação é 1:1,
        // então não pode haver dois DetalheProduto para o mesmo Produto.
        var detalheExistente = await _context.DetalhesProduto
            .FirstOrDefaultAsync(d => d.ProdutoId == detalhe.ProdutoId);

        if (detalheExistente != null)
        {
            // 409 Conflict — o recurso já existe; o cliente deveria usar PUT
            // para atualizar, em vez de tentar criar um novo com POST.
            return Conflict(new { mensagem = $"O produto de ID {detalhe.ProdutoId} já possui um detalhe cadastrado. " + "Use PUT para atualizar o detalhe existente." });
        }

        _context.DetalhesProduto.Add(detalhe);
        await _context.SaveChangesAsync();

        // CreatedAtAction retorna 201 Created — indica que um NOVO recurso foi
        // criado com sucesso, e inclui no cabeçalho da resposta a URL para
        // buscá-lo depois (aponta para o método GetDetalhePorProduto).
        return CreatedAtAction(nameof(GetDetalhePorProduto), new { produtoId = detalhe.ProdutoId }, detalhe);
    }

    // PUT: api/DetalhesProduto/{id}
    // Atualiza um detalhe técnico já existente.
    [HttpPut("{id}")]
    public async Task<IActionResult> PutDetalhe(int id, DetalheProduto detalhe)
    {
        if (id != detalhe.Id)
        {
            // 400 Bad Request — o Id da URL não bate com o Id do corpo da requisição,
            // indício de erro no frontend ou tentativa de manipular a chamada.
            return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID do detalhe" });
        }

        // Include(d => d.Produto) necessário para checar a posse via Produto.UsuarioId,
        // já que DetalheProduto não guarda UsuarioId diretamente (proteção indireta).
        var detalheExistente = await _context.DetalhesProduto
            .Include(d => d.Produto)
            .FirstOrDefaultAsync(d => d.Id == id && d.Produto!.UsuarioId == UsuarioIdAtual);

        if (detalheExistente == null)
        {
            // 404 Not Found — detalhe não existe, ou existe mas pertence a outro usuário
            // (nesse caso, tratamos como "não encontrado" em vez de "403 Forbidden",
            // para não revelar a outros usuários que o registro existe).
            return NotFound(new { mensagem = $"Detalhe com ID {id} não encontrado." });
        }

        // Atualiza campo por campo (em vez de substituir o objeto inteiro),
        // evitando sobrescrever acidentalmente Id ou ProdutoId.
        detalheExistente.Especificacoes = detalhe.Especificacoes;
        detalheExistente.Garantia = detalhe.Garantia;
        detalheExistente.PaisDeOrigem = detalhe.PaisDeOrigem;
        detalheExistente.PesoGramas = detalhe.PesoGramas;

        await _context.SaveChangesAsync();

        // 204 No Content — atualização bem-sucedida, mas não há corpo de resposta
        // para devolver (convenção comum em PUT: o cliente já sabe o que enviou).
        return NoContent();
    }

    // DELETE: api/DetalhesProduto/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDetalhe(int id)
    {
        var detalhe = await _context.DetalhesProduto
            .Include(d => d.Produto)
            .FirstOrDefaultAsync(d => d.Id == id && d.Produto!.UsuarioId == UsuarioIdAtual);

        if (detalhe == null)
        {
            // 404 Not Found
            return NotFound(new { mensagem = $"Detalhe com ID {id} não encontrado." });
        }

        _context.DetalhesProduto.Remove(detalhe);
        await _context.SaveChangesAsync();

        // 204 No Content — exclusão bem-sucedida.
        return NoContent();
    }
}