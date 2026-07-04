using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
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
    public DbSet<NotaFiscal> NotasFiscais { get; set; }
    public DbSet<ItemNotaFiscal> ItensNotaFiscal { get; set; }

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

        // NotaFiscal → Fornecedor
        modelBuilder.Entity<NotaFiscal>()
            .HasOne(n => n.Fornecedor)
            .WithMany(f => f.NotasFiscais)
            .HasForeignKey(n => n.FornecedorId)
            .OnDelete(DeleteBehavior.Restrict);

        // ItemNotaFiscal → NotaFiscal (excluir a nota exclui os itens dela)
        modelBuilder.Entity<ItemNotaFiscal>()
            .HasOne(i => i.NotaFiscal)
            .WithMany(n => n.Itens)
            .HasForeignKey(i => i.NotaFiscalId)
            .OnDelete(DeleteBehavior.Cascade);

        // ItemNotaFiscal → Produto (não pode excluir produto com histórico de notas)
        modelBuilder.Entity<ItemNotaFiscal>()
            .HasOne(i => i.Produto)
            .WithMany(p => p.ItensNotaFiscal)
            .HasForeignKey(i => i.ProdutoId)
            .OnDelete(DeleteBehavior.Restrict);

        // ValorTotal é calculado em memória, não existe coluna no banco
        modelBuilder.Entity<ItemNotaFiscal>()
            .Ignore(i => i.ValorTotal);

        modelBuilder.Entity<NotaFiscal>()
            .Ignore(n => n.ValorTotal);

        // Isolamento por usuário
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

        modelBuilder.Entity<NotaFiscal>()
            .HasOne(n => n.Usuario)
            .WithMany()
            .HasForeignKey(n => n.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        // Correção global de DateTime/UTC (Npgsql)
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(new ValueConverter<DateTime, DateTime>(
                        v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v, DateTimeKind.Utc),
                        v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
                    ));
                }
                else if (property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(new ValueConverter<DateTime?, DateTime?>(
                        v => v.HasValue ? (v.Value.Kind == DateTimeKind.Utc ? v.Value : DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)) : v,
                        v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v
                    ));
                }
            }
        }
    }
}