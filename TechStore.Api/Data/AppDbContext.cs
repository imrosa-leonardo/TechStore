using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TechStore.Api.Models;

namespace TechStore.Api.Data;

// AppDbContext é a "ponte" entre o código C# e o banco de dados PostgreSQL.
// Cada DbSet<T> abaixo representa uma tabela no banco. O Entity Framework Core
// usa essa classe para traduzir código C# (LINQ) em comandos SQL automaticamente.
public class AppDbContext : DbContext
{
    // Construtor que recebe as opções de configuração (como a string de conexão)
    // definidas no Program.cs, através de builder.Services.AddDbContext<AppDbContext>(...).
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Cada propriedade DbSet<T> vira uma tabela no banco de dados.
    // Ex: Produtos é a tabela "Produtos", Categorias é a tabela "Categorias", etc.
    public DbSet<Produto> Produtos { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<DetalheProduto> DetalhesProduto { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Fornecedor> Fornecedores { get; set; }
    public DbSet<NotaFiscal> NotasFiscais { get; set; }
    public DbSet<ItemNotaFiscal> ItensNotaFiscal { get; set; }

    // OnModelCreating é onde configuramos manualmente os relacionamentos entre tabelas
    // que o Entity Framework não conseguiria adivinhar sozinho (ou que queremos
    // customizar, como o comportamento ao excluir um registro relacionado).
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Relação: Produto pertence a UMA Categoria, e uma Categoria pode ter VÁRIOS Produtos.
        modelBuilder.Entity<Produto>()
            .HasOne(p => p.Categoria)              // Produto tem UMA Categoria
            .WithMany(c => c.Produtos)              // Categoria tem MUITOS Produtos
            .HasForeignKey(p => p.CategoriaId)      // A coluna que guarda essa ligação é CategoriaId
            .OnDelete(DeleteBehavior.Restrict);      // Impede excluir uma Categoria se ela tiver Produtos vinculados
                                                      // (o banco vai lançar erro em vez de excluir em cascata)

        // Relação: Produto tem UM DetalheProduto (informações extras), e vice-versa (1 para 1).
        modelBuilder.Entity<DetalheProduto>()
            .HasOne(d => d.Produto)
            .WithOne(p => p.DetalheProduto)
            .HasForeignKey<DetalheProduto>(d => d.ProdutoId)
            .OnDelete(DeleteBehavior.Cascade);       // Se o Produto for excluído, o DetalheProduto dele
                                                      // é excluído automaticamente junto (não fica "órfão")

        // Garante que cada Produto só possa ter UM DetalheProduto no banco
        // (impede que dois DetalheProduto apontem para o mesmo ProdutoId por engano).
        modelBuilder.Entity<DetalheProduto>()
            .HasIndex(d => d.ProdutoId)
            .IsUnique();

        // Relação: NotaFiscal pertence a UM Fornecedor, e um Fornecedor pode emitir VÁRIAS Notas Fiscais.
        // NotaFiscal → Fornecedor
        modelBuilder.Entity<NotaFiscal>()
            .HasOne(n => n.Fornecedor)
            .WithMany(f => f.NotasFiscais)
            .HasForeignKey(n => n.FornecedorId)
            .OnDelete(DeleteBehavior.Restrict);      // Não deixa excluir um Fornecedor que já tenha Notas Fiscais

        // Relação: uma NotaFiscal tem VÁRIOS ItemNotaFiscal (os produtos daquela nota).
        // ItemNotaFiscal → NotaFiscal (excluir a nota exclui os itens dela)
        modelBuilder.Entity<ItemNotaFiscal>()
            .HasOne(i => i.NotaFiscal)
            .WithMany(n => n.Itens)
            .HasForeignKey(i => i.NotaFiscalId)
            .OnDelete(DeleteBehavior.Cascade);       // Se a Nota Fiscal for excluída, todos os itens dela
                                                      // somem automaticamente (faz sentido: item sem nota não existe)

        // Relação: um Produto pode aparecer em VÁRIOS ItemNotaFiscal (histórico de compras dele ao longo do tempo).
        // ItemNotaFiscal → Produto (não pode excluir produto com histórico de notas)
        modelBuilder.Entity<ItemNotaFiscal>()
            .HasOne(i => i.Produto)
            .WithMany(p => p.ItensNotaFiscal)
            .HasForeignKey(i => i.ProdutoId)
            .OnDelete(DeleteBehavior.Restrict);      // Não deixa excluir um Produto que já tenha
                                                      // aparecido em alguma nota fiscal (preserva o histórico)

        // ValorTotal (em ItemNotaFiscal) e ValorTotal (em NotaFiscal) são propriedades calculadas
        // em C# (Quantidade × ValorUnitario, ou soma dos itens) — elas NÃO existem como coluna
        // real no banco de dados. O .Ignore() avisa o Entity Framework: "não tente criar uma
        // coluna para isso, é só um cálculo feito na memória quando o objeto é lido".
        // ValorTotal é calculado em memória, não existe coluna no banco
        modelBuilder.Entity<ItemNotaFiscal>()
            .Ignore(i => i.ValorTotal);

        modelBuilder.Entity<NotaFiscal>()
            .Ignore(n => n.ValorTotal);

        // ==========================================================
        // ISOLAMENTO POR USUÁRIO
        // Cada uma dessas configurações liga um registro (Produto, Categoria,
        // Fornecedor, NotaFiscal) ao Usuario que o criou. É essa ligação que
        // permite aos Controllers filtrar ".Where(x => x.UsuarioId == usuarioLogado)"
        // e garantir que cada usuário só veja seus próprios dados.
        // ==========================================================
        modelBuilder.Entity<Produto>()
            .HasOne(p => p.Usuario)
            .WithMany()                              // Usuario não precisa de uma lista "Produtos" navegável (simplificação)
            .HasForeignKey(p => p.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);       // Não deixa excluir um Usuario que já tenha Produtos cadastrados

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

        // ==========================================================
        // CORREÇÃO GLOBAL DE DATETIME/UTC (necessária para o Npgsql/PostgreSQL)
        // O PostgreSQL exige que todo valor salvo em coluna do tipo
        // "timestamp with time zone" tenha Kind = DateTimeKind.Utc.
        // Sem essa correção, qualquer data enviada pelo frontend sem informação
        // de fuso horário (Kind = Unspecified) causa erro ao salvar no banco.
        // ==========================================================
        // Correção global de DateTime/UTC (Npgsql)

        // Percorre TODAS as entidades (Produto, Categoria, NotaFiscal, etc.)
        // e TODAS as propriedades de cada uma, procurando por campos do tipo DateTime.
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                // Caso 1: campo DateTime obrigatório (não-nulável), como DataCriacao ou DataEmissao.
                if (property.ClrType == typeof(DateTime))
                {
                    // ValueConverter define duas conversões:
                    // - A primeira função (v => ...) roda ANTES de salvar no banco: garante que o
                    //   valor seja marcado como UTC (se já não for, força a marcação).
                    // - A segunda função roda AO LER do banco: também força o valor como UTC,
                    //   já que o PostgreSQL sempre devolve datas em UTC nessas colunas.
                    property.SetValueConverter(new ValueConverter<DateTime, DateTime>(
                        v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v, DateTimeKind.Utc),
                        v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
                    ));
                }
                // Caso 2: campo DateTime opcional (nulável, DateTime?), como algum campo que pode ficar em branco.
                else if (property.ClrType == typeof(DateTime?))
                {
                    // Mesma lógica do caso acima, mas tratando a possibilidade do valor ser nulo (v.HasValue).
                    property.SetValueConverter(new ValueConverter<DateTime?, DateTime?>(
                        v => v.HasValue ? (v.Value.Kind == DateTimeKind.Utc ? v.Value : DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)) : v,
                        v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v
                    ));
                }
            }
        }
    }
}