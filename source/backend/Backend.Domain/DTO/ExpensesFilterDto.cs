namespace Backend.Domain.DTO;

public class ExpensesFilterDto
{
    public int? Month { get; set; }

    public int? Year { get; set; }

    public string? TimeZone { get; set; }

    public string? SearchingTerm { get; set; }

    public int? CreatedById { get; set; }

    public bool? Shared { get; set; }
}
