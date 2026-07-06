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
    // Lista resumida de produtos (traz a Categoria, mas NÃO o DetalheProduto —
    // isso é intencional: carregar o detalhe técnico de TODO produto na listagem
    // seria desperdício de performance, já que a tabela principal não precisa disso).
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Produto>>> GetProdutos()
    {
        var produtos = await _context.Produtos
            .Include(p => p.Categoria)
            .Where(p => p.UsuarioId == UsuarioIdAtual)
            .ToListAsync();

        // 200 OK
        return Ok(produtos);
    }

    // GET: api/Produtos/{id}
    // Busca um produto específico com TODOS os dados relacionados — usado
    // tanto para edição quanto para a tela de visualização completa (somente leitura).
    [HttpGet("{id}")]
    public async Task<ActionResult<Produto>> GetProduto(int id)
    {
        var produto = await _context.Produtos
            .Include(p => p.Categoria)
            .Include(p => p.DetalheProduto) // aqui SIM incluímos o detalhe técnico completo
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == UsuarioIdAtual);

        if (produto == null)
        {
            // 404 Not Found — produto não existe ou pertence a outro usuário.
            return NotFound(new { mensagem = $"Produto com o ID {id} não encontrado." });
        }

        // 200 OK
        return Ok(produto);
    }

    // POST: api/Produtos
    [HttpPost]
    public async Task<ActionResult<Produto>> PostProduto(Produto produto)
    {
        // A data de criação é definida pelo SERVIDOR, nunca pelo frontend —
        // evita que alguém envie uma data falsa/manipulada no cadastro.
        produto.DataCriacao = DateTime.UtcNow;
        produto.UsuarioId = UsuarioIdAtual;

        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();

        // CreatedAtAction retorna 201 Created, com um cabeçalho "Location" apontando
        // para a URL de GetProduto(id) — permite ao cliente buscar o recurso recém-criado.
        return CreatedAtAction(nameof(GetProduto), new { id = produto.Id }, produto);
    }

    // PUT: api/Produtos/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> PutProduto(int id, Produto produto)
    {
        if (id != produto.Id)
        {
            // 400 Bad Request — Id da URL diferente do Id no corpo da requisição.
            return BadRequest(new { mensagem = "O ID do produto não corresponde ao ID fornecido." });
        }

        var produtoExistente = await _context.Produtos
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == UsuarioIdAtual);

        if (produtoExistente == null)
        {
            // 404 Not Found
            return NotFound(new { mensagem = $"Produto com o ID {id} não encontrado." });
        }

        // Atualização campo a campo — note que UsuarioId e DataCriacao NÃO são
        // reatribuídos aqui, preservando o dono original e a data de cadastro real.
        produtoExistente.Nome = produto.Nome;
        produtoExistente.Descricao = produto.Descricao;
        produtoExistente.Preco = produto.Preco;
        produtoExistente.Quantidade = produto.Quantidade;
        produtoExistente.CategoriaId = produto.CategoriaId;

        await _context.SaveChangesAsync();

        // 204 No Content — atualização bem-sucedida, sem corpo de resposta.
        return NoContent();
    }

    // DELETE: api/Produtos/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduto(int id)
    {
        var produto = await _context.Produtos
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == UsuarioIdAtual);

        if (produto == null)
        {
            // 404 Not Found
            return NotFound(new { mensagem = $"Produto com o ID {id} não encontrado." });
        }

        try
        {
            _context.Produtos.Remove(produto);
            await _context.SaveChangesAsync();

            // 204 No Content — exclusão bem-sucedida.
            return NoContent();
        }
        catch (DbUpdateException)
        {
            // Esse catch captura a exceção que o PostgreSQL lança quando a exclusão
            // viola a constraint DeleteBehavior.Restrict configurada no AppDbContext
            // (ItemNotaFiscal → Produto). Ou seja: esse produto já apareceu em alguma
            // nota fiscal, e o banco recusou a exclusão para não deixar itens órfãos
            // (perderíamos o histórico de compra daquele produto).
            // 400 Bad Request — a operação viola uma regra de integridade do sistema,
            // com mensagem clara para o usuário entender o motivo (em vez de um 500 "cru").
            return BadRequest(new { mensagem = "Não é possível remover um produto que possui notas fiscais vinculadas." });
        }
    }
}