namespace Backend.Domain.Extensions;

public static class DomainExtensions
{
    public static bool IsEmpty<T>(this IEnumerable<T> list)
    {
        if (list == null)
        {
            return true;
        }

        return list.Count() == 0;
    }
}