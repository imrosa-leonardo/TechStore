namespace TechStore.Api.Models;

public class DetalheProduto
{
    public int Id { get; set; }
    public string? Especificacoes { get; set; }
    public string? Garantia { get; set; }
    public string? PaisDeOrigem { get; set; }
    public double? PesoGramas { get; set; }
    public int ProdutoId { get; set; }
    public Produto? Produto { get; set; }
}