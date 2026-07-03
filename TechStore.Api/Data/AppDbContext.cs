using Microsoft.EntityFrameworkCore;
using TechStore.Api.Models;

namespace TechStore.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }


    public DbSet<Produto> Produtos { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<DetalheProduto> DetalhesProduto { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Fornecedor> Fornecedores { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        
        modelBuilder.Entity<Produto>()
            .HasOne(p => p.Categoria)
            .WithMany(c => c.Produtos)
            .HasForeignKey(p => p.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DetalheProduto>()
            .HasOne(d => d.Produto)
            .WithOne(p => p.DetalheProduto)
            .HasForeignKey<DetalheProduto>(d => d.ProdutoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DetalheProduto>()
            .HasIndex(d => d.ProdutoId)
            .IsUnique();    

        modelBuilder.Entity<Produto>()
            .HasOne(p => p.Fornecedor)
            .WithMany(f => f.Produtos)
            .HasForeignKey(p => p.FornecedorId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        // Isolamento de dados por usuário
        modelBuilder.Entity<Produto>()
            .HasOne(p => p.Usuario)
            .WithMany()
            .HasForeignKey(p => p.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Categoria>()
            .HasOne(c => c.Usuario)
            .WithMany()
            .HasForeignKey(c => c.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Fornecedor>()
            .HasOne(f => f.Usuario)
            .WithMany()
            .HasForeignKey(f => f.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}