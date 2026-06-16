using Backend.Domain.Entities;
using Backend.Infrastructure;
using Backend.Service.Actions;
using MCP.Adapters;
using MCP.DTO;
using MCP.Tools;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration.GetSection("Mcp:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddAutoMapper(typeof(Mapper));

builder.Services.AddDbContextFactory<AppDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

builder.Services.AddScoped<Person>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var dbContextFactory = sp.GetRequiredService<IDbContextFactory<AppDbContext>>();

    var personId = config.GetValue<int>("OnBehalfOf");
    if (personId == 0)
    {
        throw new Exception("OnBehalfOf configuration is not set.");
    }

    using var dbContext = dbContextFactory.CreateDbContext();
    var identity = dbContext.Persons.AsNoTracking().FirstOrDefault(p => p.Id == personId);

    if (identity == null)
    {
        throw new UnauthorizedAccessException();
    }

    return identity;
});

builder.Services.AddScoped<IActionFactory, ActionFactory>();
builder.Services.AddScoped<IMcpAdapter, McpAdapter>();

builder.Services
    .AddMcpServer()
    .WithTools<CurrenciesTools>()
    .WithTools<CategoriesTools>()
    .WithTools<ConnectionsTools>()
    .WithTools<ExpensesTools>()
    .WithHttpTransport(options =>
    {
        options.Stateless = true;
    });

var app = builder.Build();
app.UseCors();
app.MapMcp().RequireCors();

Console.WriteLine($"Starting MCP server");
Console.WriteLine("Press Ctrl+C to stop the server");

app.Run();