namespace Backend.Domain.Models;

public class ExpensesFilter
{
    public int? Month { get; set; }

    public int? Year { get; set; }

    public string? TimeZone { get; set; }

    public string? SearchingTerm { get; set; }

    public int? CreatedById { get; set; }

    public bool? Shared { get; set; }

    public List<string>? CategoryNames { get; set; }
}
