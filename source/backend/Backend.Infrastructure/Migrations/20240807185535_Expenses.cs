using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Expenses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Expenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CategoryId = table.Column<int>(type: "integer", nullable: true),
                    PriceAmount = table.Column<double>(type: "double precision", nullable: false),
                    CurrencyId = table.Column<int>(type: "integer", nullable: false),
                    CreatedById = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Expenses_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Expenses_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Expenses_Persons_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Persons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExpensesToPerson",
                columns: table => new
                {
                    ExpenseId = table.Column<int>(type: "integer", nullable: false),
                    PersonId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExpensesToPerson", x => new { x.ExpenseId, x.PersonId });
                    table.ForeignKey(
                        name: "FK_ExpensesToPerson_Expenses_ExpenseId",
                        column: x => x.ExpenseId,
                        principalTable: "Expenses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExpensesToPerson_Persons_PersonId",
                        column: x => x.PersonId,
                        principalTable: "Persons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CategoryId",
                table: "Expenses",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CreatedById",
                table: "Expenses",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CurrencyId",
                table: "Expenses",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_ExpensesToPerson_PersonId",
                table: "ExpensesToPerson",
                column: "PersonId");

            migrationBuilder.InsertData(
                table: "Expenses",
                columns: new[] { "Id", "Date", "Name", "Description", "CategoryId", "PriceAmount", "CurrencyId", "CreatedById" },
                values: new object[,]
                {
                    { 1, new DateTime(2022, 8, 1).ToUniversalTime(), "Zavičaj", "Komplete lepinja, cappuccino", 1, 750, 2, 1 },
                    { 2, new DateTime(2022, 8, 2).ToUniversalTime(), "Ozon", null, 3, 1056, 1, 1 },
                    { 3, new DateTime(2022, 8, 5).ToUniversalTime(), "Trapizzino", null, 1, 29.30, 4, 1 },
                    { 4, new DateTime(2022, 8, 1).ToUniversalTime(), "Konzum", null, 2, 31, 4, 1 },
                    { 5, new DateTime(2022, 8, 1).ToUniversalTime(), "Dolac", null, 4, 13.50, 4, 2 },
                    { 6, new DateTime(2022, 8, 2).ToUniversalTime(), "Wolt", null, 5, 26, 4, 2 },
                    { 7, new DateTime(2022, 8, 3).ToUniversalTime(), "Wolt", null, 5, 2190, 2, 2 }
                });

            migrationBuilder.InsertData(
                table: "ExpensesToPerson",
                columns: new[] { "ExpenseId", "PersonId" },
                values: new object[,]
                {
                    { 1, 1 },
                    { 2, 1 },
                    { 3, 1 },
                    { 4, 1 },
                    { 5, 1 },
                    { 5, 2 },
                    { 6, 2 },
                    { 6, 1 },
                    { 6, 3 },
                    { 7, 2 },
                    { 2, 2 },
                    { 2, 3 },
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExpensesToPerson");

            migrationBuilder.DropTable(
                name: "Expenses");
        }
    }
}
