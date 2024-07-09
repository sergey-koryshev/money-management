namespace Backend.Service;

using Backend.Domain.DTO;

public interface ICategoriesService
{
    public List<CategoryDto> GetAllCategories();
}
