using Microsoft.EntityFrameworkCore;
using Moq;

namespace Backend.Tests;

public static class TestExtensions
{
    public static Mock<DbSet<T>> InitializeMock<T>(this Mock<DbSet<T>> mock, List<T> collection) where T : class
    {
        var queryableCollection = collection.AsQueryable();

        mock.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryableCollection.Provider);
        mock.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryableCollection.Expression);
        mock.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryableCollection.ElementType);
        mock.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryableCollection.GetEnumerator());
    
        return mock;
    }
}
