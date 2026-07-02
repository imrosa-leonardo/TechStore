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

    // ... outras propriedades existentes (Id, Nome, CategoriaId, etc)

    // Propriedades para o relacionamento com Fornecedor
    public int? FornecedorId { get; set; }
    public Fornecedor? Fornecedor { get; set; }

}