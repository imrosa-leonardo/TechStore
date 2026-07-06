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
            .Include(p => p.DetalheProduto)
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == UsuarioIdAtual);

        if (produto == null)
        {
            return NotFound(new { mensagem = $"Produto com o ID {id} não encontrado." });
        }

        return Ok(produto);
    }

    // POST: api/Produtos
    [HttpPost]
    public async Task<ActionResult<Produto>> PostProduto(Produto produto)
    {
        // VALIDAÇÃO EXPLÍCITA: a modelagem do banco (AppDbContext) exige que todo
        // Produto tenha uma CategoriaId válida (relação obrigatória, não opcional).
        // Em vez de deixar o banco rejeitar isso silenciosamente com um erro 500
        // de violação de chave estrangeira, checamos ANTES se a categoria realmente
        // existe e pertence ao usuário logado — assim devolvemos uma mensagem clara.
        var categoriaExiste = await _context.Categorias
            .AnyAsync(c => c.Id == produto.CategoriaId && c.UsuarioId == UsuarioIdAtual);

        if (!categoriaExiste)
        {
            // 400 Bad Request — impede a tentativa de salvar um produto "órfão"
            // (sem categoria válida), que violaria a integridade do banco.
            return BadRequest(new { mensagem = "Selecione uma categoria válida. Todo produto precisa estar vinculado a uma categoria existente." });
        }

        produto.DataCriacao = DateTime.UtcNow;
        produto.UsuarioId = UsuarioIdAtual;

        try
        {
            _context.Produtos.Add(produto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduto), new { id = produto.Id }, produto);
        }
        catch (DbUpdateException)
        {
            // Rede de segurança: mesmo com a validação acima, mantemos esse catch
            // para cobrir qualquer outra violação de integridade inesperada no banco
            // (ex: condição de corrida rara, onde a categoria foi excluída bem no
            // instante entre a checagem acima e o SaveChangesAsync).
            return BadRequest(new { mensagem = "Não foi possível cadastrar o produto. Verifique se a categoria informada ainda existe." });
        }
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
            return NotFound(new { mensagem = $"Produto com o ID {id} não encontrado." });
        }

        // Mesma validação aplicada na edição: impede trocar o produto para
        // uma categoria inexistente ou de outro usuário.
        var categoriaExiste = await _context.Categorias
            .AnyAsync(c => c.Id == produto.CategoriaId && c.UsuarioId == UsuarioIdAtual);

        if (!categoriaExiste)
        {
            return BadRequest(new { mensagem = "Selecione uma categoria válida. Todo produto precisa estar vinculado a uma categoria existente, caso contrário, crie uma categoria." });
        }

        produtoExistente.Nome = produto.Nome;
        produtoExistente.Descricao = produto.Descricao;
        produtoExistente.Preco = produto.Preco;
        produtoExistente.Quantidade = produto.Quantidade;
        produtoExistente.CategoriaId = produto.CategoriaId;

        try
        {
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (DbUpdateException)
        {
            return BadRequest(new { mensagem = "Não foi possível atualizar o produto. Verifique se a categoria informada ainda existe." });
        }
    }

    // DELETE: api/Produtos/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduto(int id)
    {
        var produto = await _context.Produtos
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == UsuarioIdAtual);

        if (produto == null)
        {
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