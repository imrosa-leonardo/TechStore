namespace TechStore.Api.Models;

public class Usuario
{
    public int Id { get; set; }
    public required string NomeUsuario { get; set; }
    public required string SenhaHash { get; set; }
    
}