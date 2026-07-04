using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveValorTotalManualDeNotaFiscal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValorTotal",
                table: "NotasFiscais");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ValorTotal",
                table: "NotasFiscais",
                type: "numeric",
                nullable: true);
        }
    }
}
