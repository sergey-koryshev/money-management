using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Connections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Connections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RequestingPersonId = table.Column<int>(type: "integer", nullable: false),
                    TargetPersonId = table.Column<int>(type: "integer", nullable: false),
                    IsAccepted = table.Column<bool>(type: "boolean", nullable: false),
                    RequestedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AcceptedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Connections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Connections_Persons_RequestingPersonId",
                        column: x => x.RequestingPersonId,
                        principalTable: "Persons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Connections_Persons_TargetPersonId",
                        column: x => x.TargetPersonId,
                        principalTable: "Persons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Connections_RequestingPersonId",
                table: "Connections",
                column: "RequestingPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_Connections_TargetPersonId",
                table: "Connections",
                column: "TargetPersonId");

            migrationBuilder.InsertData(
                table: "Connections",
                columns: new[] { "Id", "RequestingPersonId", "TargetPersonId", "IsAccepted", "RequestedOn", "AcceptedOn" },
                values: new object[,]
                {
                    { 1, 2, 1, true, new DateTime(2024, 01, 01, 0, 01, 08).ToUniversalTime(), new DateTime(2024, 01, 10, 0, 18, 42).ToUniversalTime() },
                    { 2, 2, 3, false, new DateTime(2024, 01, 01, 5, 01, 08).ToUniversalTime(), null },
                    { 3, 1, 3, false, new DateTime(2024, 01, 01, 12, 01, 08).ToUniversalTime(), null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Connections");
        }
    }
}
