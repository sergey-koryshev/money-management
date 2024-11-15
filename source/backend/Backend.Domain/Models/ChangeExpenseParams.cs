namespace Backend.Domain.Models;

public class ChangeExpenseParams
{
    public DateTime Date { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public string? CategoryName { get; set; }

    public double PriceAmount { get; set; }

    public int CurrencyId { get; set; }

    public List<int> PermittedPersonsIds { get; set; } = new List<int>();

    public string? TimeZone { get; set; }
}
