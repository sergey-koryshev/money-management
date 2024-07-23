namespace Backend.Tests.Models;

using Backend.Domain.Models;
using FluentAssertions;
using Entities = Domain.Entities;

[TestFixture]
public class ConnectionTest
{
    [Test]
    public void ToModel_Connection_Accepted_FullPersonObjectReturned()
    {
        var connectionEntity = new Entities.Connection
        {
            Id = 1,
            RequestingPersonId = 1,
            RequestingPerson = new Entities.Person
            {
                Id = 1,
                FirstName = "User",
                SecondName = "1",
                Tenant = Guid.NewGuid()
            },
            TargetPersonId = 2,
            TargetPerson = new Entities.Person
            {
                Id = 2,
                FirstName = "User",
                SecondName = "2",
                Tenant = Guid.NewGuid()
            },
            IsAccepted = true,
            RequestedOn = DateTime.UtcNow,
            AcceptedOn = DateTime.UtcNow
        };

        var connectionModel = connectionEntity.ToModel(connectionEntity.RequestingPerson);

        connectionModel.Should().BeEquivalentTo(new Connection
        {
            Id = 1,
            Status = ConnectionStatus.Accepted,
            Person = new AmbiguousPerson
            {
                Id = connectionEntity.TargetPerson.Id,
                FirstName = connectionEntity.TargetPerson.FirstName,
                SecondName = connectionEntity.TargetPerson.SecondName,
                Tenant = connectionEntity.TargetPerson.Tenant
            }
        });
    }

    [Test]
    public void ToModel_Connection_NotAccepted_LimitedPersonObjectReturned()
    {
        var connectionEntity = new Entities.Connection
        {
            Id = 1,
            RequestingPersonId = 1,
            RequestingPerson = new Entities.Person
            {
                Id = 1,
                FirstName = "User",
                SecondName = "1",
                Tenant = Guid.NewGuid()
            },
            TargetPersonId = 2,
            TargetPerson = new Entities.Person
            {
                Id = 2,
                FirstName = "User",
                SecondName = "2",
                Tenant = Guid.NewGuid()
            },
            IsAccepted = false,
            RequestedOn = DateTime.UtcNow
        };

        var connectionModel = connectionEntity.ToModel(connectionEntity.RequestingPerson);

        connectionModel.Should().BeEquivalentTo(new Connection
        {
            Id = 1,
            Status = ConnectionStatus.PendingOnTarget,
            Person = new AmbiguousPerson
            {
                Id = connectionEntity.TargetPerson.Id
            }
        });
    }

    [Test]
    public void ToModel_Connection_NotAccepted_TargetUseSeeFullPersonObject()
    {
        var connectionEntity = new Entities.Connection
        {
            Id = 1,
            RequestingPersonId = 1,
            RequestingPerson = new Entities.Person
            {
                Id = 1,
                FirstName = "User",
                SecondName = "1",
                Tenant = Guid.NewGuid()
            },
            TargetPersonId = 2,
            TargetPerson = new Entities.Person
            {
                Id = 2,
                FirstName = "User",
                SecondName = "2",
                Tenant = Guid.NewGuid()
            },
            IsAccepted = false,
            RequestedOn = DateTime.UtcNow
        };

        var connectionModel = connectionEntity.ToModel(connectionEntity.TargetPerson);

        connectionModel.Should().BeEquivalentTo(new Connection
        {
            Id = 1,
            Status = ConnectionStatus.Pending,
            Person = new AmbiguousPerson
            {
                Id = connectionEntity.RequestingPerson.Id,
                FirstName = connectionEntity.RequestingPerson.FirstName,
                SecondName = connectionEntity.RequestingPerson.SecondName,
                Tenant = connectionEntity.RequestingPerson.Tenant
            }
        });
    }
}
