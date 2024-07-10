namespace Backend.Domain.DTO;

public class CategoryDto
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public required PersonDto CreatedBy { get; set; }
}
