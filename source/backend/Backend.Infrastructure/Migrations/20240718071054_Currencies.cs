using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Currencies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Currencies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    FriendlyName = table.Column<string>(type: "text", nullable: false),
                    FlagCode = table.Column<string>(type: "text", nullable: false),
                    Sign = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Currencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CurrencyMappings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CurrencyId = table.Column<int>(type: "integer", nullable: false),
                    PersonId = table.Column<int>(type: "integer", nullable: false),
                    IsMainCurrency = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CurrencyMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CurrencyMappings_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CurrencyMappings_Persons_PersonId",
                        column: x => x.PersonId,
                        principalTable: "Persons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CurrencyMappings_CurrencyId",
                table: "CurrencyMappings",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrencyMappings_PersonId",
                table: "CurrencyMappings",
                column: "PersonId");
            
            migrationBuilder.InsertData(
                table: "Currencies",
                columns: new[] { "Id", "Name", "FriendlyName", "FlagCode", "Sign"},
                values: new object[,]
                {
                    { 1, "RUB", "Russian ruble", "ru", "₽" },
                    { 2, "RSD", "Serbian dinar", "rs", null },
                    { 3, "USD", "American dollar", "us", "$" },
                    { 4, "EUR", "Euro", "eu", "€" }
                });

            migrationBuilder.InsertData(
                table: "CurrencyMappings",
                columns: new[] { "Id", "CurrencyId", "PersonId", "IsMainCurrency"},
                values: new object[,]
                {
                    { 1, 1, 1, false },
                    { 2, 2, 1, true },
                    { 3, 3, 1, false },
                    { 4, 4, 1, false },
                    { 5, 1, 2, false },
                    { 6, 2, 2, false },
                    { 7, 3, 2, false },
                    { 8, 4, 2, true },
                    { 9, 1, 3, false },
                    { 10, 2, 3, false },
                    { 11, 3, 3, false },
                    { 12, 4, 3, false }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CurrencyMappings");

            migrationBuilder.DropTable(
                name: "Currencies");
        }
    }
}
