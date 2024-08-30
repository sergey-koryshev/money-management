namespace Backend.Domain.Models;

public class ExpensesFilter
{
    public int? Month { get; set; }

    public int? Year { get; set; }

    public string? SearchingTerm { get; set; }
}
