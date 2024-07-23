namespace Backend.Tests.Services;

using AutoMapper;
using Backend.Infrastructure;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using Entities = Domain.Entities;

[TestFixture]
public class ServiceBaseTests : TestsBase
{
    private Mock<IDbContextFactory<AppDbContext>> mockedDbContextFactory;

    private Mock<IHttpContextAccessor> mockHttpContextAccessor;

    protected override bool ShouldCurrenciesBeDeletedInTearDown => true;

    [Test]
    public void ExecuteActionInTransaction_ExceptionInAction_NoChangesInDbContext()
    {
        new Action(() => new ServiceTest(this.mockHttpContextAccessor.Object, new Mock<IMapper>().Object, this.mockedDbContextFactory.Object).ServiceTestMethod((dbContext) =>
        {
            dbContext.Currencies.Add(new Entities.Currency()
            {
                Name = "TC1",
                FriendlyName = "Test Currency 1",
                FlagCode = "tc1"
            });
            dbContext.SaveChanges();

            throw new Exception("Unexpected internal exception");
        }, false))
            .Should()
            .Throw<Exception>()
            .WithMessage("Unexpected internal exception");

        this.DbContext.Currencies.Where(c => c.Name == "TC1").Should().BeEmpty();
    }

    [Test]
    public void ExecuteActionInTransaction_NoExceptionInAction_ChangesSavedInDbContext()
    {
        new ServiceTest(this.mockHttpContextAccessor.Object, new Mock<IMapper>().Object, this.mockedDbContextFactory.Object).ServiceTestMethod((dbContext) =>
        {
            dbContext.Currencies.Add(new Entities.Currency()
            {
                Name = "TC2",
                FriendlyName = "Test Currency 2",
                FlagCode = "tc2"
            });
            dbContext.SaveChanges();
        }, false);

        this.DbContext.Currencies.Where(c => c.Name == "TC2").Should().HaveCount(1);
    }

    [Test]
    public void ExecuteActionInTransaction_AuthenticationRequiredAndIdentityEmpty_ErrorThrown()
    {
        new Action(() => new ServiceTest(this.mockHttpContextAccessor.Object, new Mock<IMapper>().Object, this.mockedDbContextFactory.Object).ServiceTestMethod((_) => {}))
            .Should()
            .Throw<UnauthorizedAccessException>();
    }

    [Test]
    public void ExecuteActionInTransaction_AuthenticationRequiredAndIdentityNotEmpty_ErrorNotThrown()
    {
        this.mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(() => new DefaultHttpContext
        {
            Items = new Dictionary<object, object>
            {
                { "__identity", this.Daniel },
            }
        });

        new Action(() => new ServiceTest(this.mockHttpContextAccessor.Object, new Mock<IMapper>().Object, this.mockedDbContextFactory.Object).ServiceTestMethod((_) => {}))
            .Should()
            .NotThrow<UnauthorizedAccessException>();
    }

    [SetUp]
    public void ServiceBaseTestsSetUp()
    {
        this.mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
        this.mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(() => new DefaultHttpContext());
    }

    [OneTimeSetUp]
    public void ServiceBaseTestsOneTimeSetUp()
    {
        this.mockedDbContextFactory = new Mock<IDbContextFactory<AppDbContext>>();
        this.mockedDbContextFactory.Setup(x => x.CreateDbContext()).Returns(this.GetDbContext);
    }
}
