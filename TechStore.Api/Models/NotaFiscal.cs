namespace TechStore.Api.Models;

public class NotaFiscal
{
    public int Id { get; set; }
    public required string Numero { get; set; }
    public string? Serie { get; set; }
    public DateTime DataEmissao { get; set; } = DateTime.UtcNow;

    public int FornecedorId { get; set; }
    public Fornecedor? Fornecedor { get; set; }

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public ICollection<ItemNotaFiscal> Itens { get; set; } = new List<ItemNotaFiscal>();

    // Calculado dinamicamente a partir dos itens — não existe coluna no banco
    public decimal ValorTotal => Itens?.Sum(i => i.Quantidade * i.ValorUnitario) ?? 0;
}