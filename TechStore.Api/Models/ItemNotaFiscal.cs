namespace TechStore.Api.Models;

public class ItemNotaFiscal
{
    public int Id { get; set; }

    public int NotaFiscalId { get; set; }
    public NotaFiscal? NotaFiscal { get; set; }

    public int ProdutoId { get; set; }
    public Produto? Produto { get; set; }

    public int Quantidade { get; set; }
    public decimal ValorUnitario { get; set; }

    public decimal ValorTotal => Quantidade * ValorUnitario;
}