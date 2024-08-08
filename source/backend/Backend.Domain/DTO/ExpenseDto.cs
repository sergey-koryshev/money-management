namespace Backend.Domain.DTO;

public class ExpenseDto
{
    public int Id { get; set; }

    public DateTime Date { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public CategoryDto? Category { get; set; }

    public required PriceDto Price { get; set; }

    public PriceDto? OriginalPrice { get; set; }

    public required AmbiguousPersonDto CreatedBy { get; set; }

    public List<AmbiguousPersonDto> PermittedPersons { get; set; } = new List<AmbiguousPersonDto>();
}
