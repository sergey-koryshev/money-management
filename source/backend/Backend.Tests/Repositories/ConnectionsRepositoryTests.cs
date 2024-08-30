namespace Backend.Tests.Repositories;

using Backend.Application;
using Backend.Domain.Models;
using Backend.Domain.Models.Mappers;
using FluentAssertions;
using FluentAssertions.Equivalency;
using Entities = Domain.Entities;

[TestFixture]
public class ConnectionsRepositoryTests : TestsBase
{
    private readonly Func<EquivalencyAssertionOptions<Connection>, EquivalencyAssertionOptions<Connection>> connectionModelEquivalencyAssertionOptions = (o) => o
        .Excluding(c => c.Id)
        .Using<DateTime>(ctx => ctx.Subject.Should().BeCloseTo(ctx.Expectation, TimeSpan.FromSeconds(10))).WhenTypeIs<DateTime>();

    protected override bool ShouldConnectionsBeDeletedInTearDown => true;

    protected override bool ShouldPersonsBeDeletedInOneTimeTearDown => true;

    [TestCase(DanielTenant, ExpectedResult = 1)]
    [TestCase(VeronikaTenant, ExpectedResult = 2)]
    public int GetAllConnections_ConnectionsExists_ConnectionsRelatedToUserReturned(string userTenant)
    {
        var connections = new List<Entities.Connection>
        {
            new()
            {
                RequestingPersonId = this.Veronika.Id,
                TargetPersonId = this.Daniel.Id,
                IsAccepted = false,
                RequestedOn = DateTime.UtcNow
            },
            new()
            {
                RequestingPersonId = this.Veronika.Id,
                TargetPersonId = this.Chuck.Id,
                IsAccepted = false,
                RequestedOn = DateTime.UtcNow
            }
        };
        this.DbContext.AddRange(connections);
        this.DbContext.SaveChanges();

        var user = this.DbContext.Persons.FirstOrDefault(p => p.Tenant.ToString() == userTenant);

        var result = new ConnectionsRepository(this.DbContext, user!).GetAllConnections();

        return result.Count;
    }

    [Test]
    public void GetPendingConnectionRequestsAmount_UserHasAcceptedAndNotAcceptedConnections_NotAcceptedConnectionsAmountReturned()
    {
        var connections = new List<Entities.Connection>
        {
            new()
            {
                RequestingPersonId = this.Veronika.Id,
                TargetPersonId = this.Daniel.Id,
                IsAccepted = true,
                RequestedOn = DateTime.UtcNow,
                AcceptedOn = DateTime.UtcNow
            },
            new()
            {
                RequestingPersonId = this.Chuck.Id,
                TargetPersonId = this.Daniel.Id,
                IsAccepted = false,
                RequestedOn = DateTime.UtcNow
            }
        };
        this.DbContext.AddRange(connections);
        this.DbContext.SaveChanges();

        var result = new ConnectionsRepository(this.DbContext, this.Daniel).GetPendingConnectionRequestsAmount();

        result.Should().Be(1);
    }

    [Test]
    public void CreateConnectionRequest_RequestAndTargetUserSame_ErrorThrown()
    {
        new Action(() => new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Daniel.Id))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("You cannot create connection with yourself.");
    }

    [Test]
    public void CreateConnectionRequest_ConnectionAlreadyExist_ErrorThrown()
    {
        var connection = new Entities.Connection
        {
            RequestingPersonId = this.Daniel.Id,
            TargetPersonId = this.Veronika.Id,
            IsAccepted = true,
            RequestedOn = DateTime.UtcNow,
            AcceptedOn = DateTime.UtcNow
        };
        this.DbContext.Connections.Add(connection);
        this.DbContext.SaveChanges();

        new Action(() => new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id))
            .Should().Throw<InvalidOperationException>()
            .WithMessage($"You are already connected with the user with id '{this.Veronika.Id}'.");
    }

    [Test]
    public void CreateConnectionRequest_TargetPersonNotExists_ErrorThrown()
    {
        new Action(() => new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(-1))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("User with id '-1' doesn't exist.");
    }

    [Test]
    public void CreateConnectionRequest_ConnectionNotExistYet_ConnectionCreated()
    {
        var expectedModel = new Connection
        {
            IsAccepted = false,
            RequestingPerson = new Person
            {
                Id = this.Daniel.Id,
                FirstName = this.Daniel.FirstName,
                SecondName = this.Daniel.SecondName,
                Tenant = this.Daniel.Tenant
            },
            TargetPerson = new Person
            {
                Id = this.Veronika.Id,
                FirstName = this.Veronika.FirstName,
                SecondName = this.Veronika.SecondName,
                Tenant = this.Veronika.Tenant
            },
            RequestedOn = DateTime.UtcNow,
            AcceptedOn = null
        };

        var returnedModel = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
        returnedModel.Should().BeEquivalentTo(expectedModel, this.connectionModelEquivalencyAssertionOptions);

        var createdConnection = this.DbContext.Connections.FirstOrDefault(c => c.RequestingPersonId == this.Daniel.Id && c.TargetPersonId == this.Veronika.Id);
        createdConnection.Should().NotBeNull();
        createdConnection!.ToModel().Should().BeEquivalentTo(expectedModel, this.connectionModelEquivalencyAssertionOptions);
    }

    [Test]
    public void DeleteConnection_ConnectionNotExist_ErrorThrown()
    {
        new Action(() => new ConnectionsRepository(this.DbContext, this.Daniel).DeleteConnection(-1))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Connection with id '-1' doesn't exist.");
    }

    [TestCase(DanielTenant)]
    [TestCase(VeronikaTenant)]
    public void DeleteConnection_RelatedUsersToConnection_ConnectionDeleted(string userTenant)
    {
        var connection = new Entities.Connection
        {
            RequestingPersonId = this.Daniel.Id,
            TargetPersonId = this.Veronika.Id,
            IsAccepted = false,
            RequestedOn = DateTime.UtcNow
        };
        this.DbContext.Connections.Add(connection);
        this.DbContext.SaveChanges();

        var user = this.DbContext.Persons.FirstOrDefault(p => p.Tenant.ToString() == userTenant);

        new ConnectionsRepository(this.DbContext, user!).DeleteConnection(connection.Id);

        this.DbContext.Connections.Find(connection.Id).Should().BeNull();
    }

    [Test]
    public void DeleteConnection_UnrelatedUserToConnection_ErrorThrown()
    {
        var connection = new Entities.Connection
        {
            RequestingPersonId = this.Daniel.Id,
            TargetPersonId = this.Veronika.Id,
            IsAccepted = false,
            RequestedOn = DateTime.UtcNow
        };
        this.DbContext.Connections.Add(connection);
        this.DbContext.SaveChanges();

        new Action(() => new ConnectionsRepository(this.DbContext, this.Chuck).DeleteConnection(connection.Id))
            .Should().Throw<InvalidOperationException>()
            .WithMessage($"Connection with id '{connection.Id}' doesn't exist.");
    }

    [Test]
    public void AcceptConnectionRequest_ConnectionNotExist_ErrorThrown()
    {
        new Action(() => new ConnectionsRepository(this.DbContext, this.Chuck).AcceptConnectionRequest(-1))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Connection with id '-1' doesn't exist.");
    }

    [TestCase(DanielTenant)]
    [TestCase(ChuckTenant)]
    public void AcceptConnectionRequest_UserNotHavePendingConnection_ErrorThrown(string userTenant)
    {
        var connection = new Entities.Connection
        {
            RequestingPersonId = this.Daniel.Id,
            TargetPersonId = this.Veronika.Id,
            IsAccepted = false,
            RequestedOn = DateTime.UtcNow
        };
        this.DbContext.Connections.Add(connection);
        this.DbContext.SaveChanges();

        var user = this.DbContext.Persons.FirstOrDefault(p => p.Tenant.ToString() == userTenant);

        new Action(() => new ConnectionsRepository(this.DbContext, user!).AcceptConnectionRequest(connection.Id))
            .Should().Throw<InvalidOperationException>()
            .WithMessage(connection.RequestingPersonId == user!.Id
                ? "You doesn't have permissions to accept this connection request."
                : $"Connection with id '{connection.Id}' doesn't exist.");
    }

    [Test]
    public void AcceptConnectionRequest_ConnectionAlreadyAccepted_ErrorThrown()
    {
        var connection = new Entities.Connection
        {
            RequestingPersonId = this.Daniel.Id,
            TargetPersonId = this.Veronika.Id,
            IsAccepted = true,
            RequestedOn = DateTime.UtcNow,
            AcceptedOn = DateTime.UtcNow
        };
        this.DbContext.Connections.Add(connection);
        this.DbContext.SaveChanges();

        new Action(() => new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id))
            .Should().Throw<InvalidOperationException>()
            .WithMessage($"Connection request with id '{connection.Id}' has been already accepted.");
    }

    [Test]
    public void AcceptConnectionRequest_ConnectionNotAccepted_ConnectionAccepted()
    {
        var connection = new Entities.Connection
        {
            RequestingPersonId = this.Daniel.Id,
            TargetPersonId = this.Veronika.Id,
            IsAccepted = false,
            RequestedOn = DateTime.UtcNow
        };
        this.DbContext.Connections.Add(connection);
        this.DbContext.SaveChanges();

        var expectedModel = new Connection
        {
            IsAccepted = true,
            RequestingPerson = new Person
            {
                Id = this.Daniel.Id,
                FirstName = this.Daniel.FirstName,
                SecondName = this.Daniel.SecondName,
                Tenant = this.Daniel.Tenant
            },
            TargetPerson = new Person
            {
                Id = this.Veronika.Id,
                FirstName = this.Veronika.FirstName,
                SecondName = this.Veronika.SecondName,
                Tenant = this.Veronika.Tenant
            },
            RequestedOn = DateTime.UtcNow,
            AcceptedOn = DateTime.UtcNow
        };

        var returnedModel = new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);
        returnedModel.Should().BeEquivalentTo(expectedModel, this.connectionModelEquivalencyAssertionOptions);

        var acceptedConnection = this.DbContext.Connections.Find(connection.Id);
        acceptedConnection.Should().NotBeNull();
        acceptedConnection!.ToModel().Should().BeEquivalentTo(expectedModel, this.connectionModelEquivalencyAssertionOptions);
    }
}
