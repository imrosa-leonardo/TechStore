namespace TechStore.Api.Models;

public class Categoria
{
    public int Id { get; set; }
    public required string Nome { get; set; }

    public string? Descricao { get; set; }

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public ICollection<Produto> Produtos { get; set; } = new List<Produto>();   

}