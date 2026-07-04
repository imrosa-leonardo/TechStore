namespace TechStore.Api.Models;

public class Produto
{
    public int Id { get; set; }
    public required string Nome { get; set; }
    public string? Descricao { get; set; }
    public decimal Preco { get; set; }
    public int Quantidade { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    public DetalheProduto? DetalheProduto { get; set; }

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public ICollection<ItemNotaFiscal> ItensNotaFiscal { get; set; } = new List<ItemNotaFiscal>();
}