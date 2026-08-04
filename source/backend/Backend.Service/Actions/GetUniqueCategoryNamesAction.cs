namespace Backend.Service.Actions;

using Backend.Application;
using Backend.Infrastructure;

public class GetUniqueCategoryNamesAction : ActionBase<List<string>>
{
    public GetUniqueCategoryNamesAction()
    {
    }

    protected override List<string> ExecuteInternal(AppDbContext dbContext, Domain.Entities.Person identity)
    {
        var result = new CategoriesRepository(dbContext, identity).GetUniqueCategoryNames().ToList();
        return result;
    }
}