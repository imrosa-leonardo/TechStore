namespace TechStore.Api.Models;

public class Fornecedor
{
    public int Id { get; set; }
    public required string Nome { get; set; }
    public required string Contato { get; set; }

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public ICollection<NotaFiscal> NotasFiscais { get; set; } = new List<NotaFiscal>();
}