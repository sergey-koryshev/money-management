namespace Backend.Domain.DTO;

public class ChangeExpenseParamsDto
{
    public DateTime Date { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public LookupItemDto? Category { get; set; }

    public double PriceAmount { get; set; }

    public int CurrencyId { get; set; }

    public List<int> PermittedPersonsIds { get; set; } = new List<int>();
}
