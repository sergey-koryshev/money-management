namespace Backend.Tests.Mappers;

using AutoMapper;
using Backend.Domain.DTO;
using Backend.Domain.Models;
using Backend.Domain.Models.Mappers;
using Backend.Service.Mappers;
using FluentAssertions;
using Entities = Domain.Entities;

[TestFixture]
public class AutoMapperTests
{
    IMapper mapper;

    [Theory]
    public void Connection_ConnectionDto_Accepted_FullPersonObjectReturned(bool identityContainsRequestingPerson)
    {
        var requestingPerson = new Entities.Person
        {
            Id = 1,
            FirstName = "First",
            SecondName = "User",
            Tenant = Guid.NewGuid()
        };

        var targetPerson = new Entities.Person
        {
            Id = 2,
            FirstName = "User",
            SecondName = "2",
            Tenant = Guid.NewGuid()
        };

        var connection = new Connection
        {
            Id = 1,
            RequestingPerson = requestingPerson.ToModel(),
            TargetPerson = targetPerson.ToModel(),
            IsAccepted = true,
            RequestedOn = DateTime.UtcNow,
            AcceptedOn = DateTime.UtcNow
        };

        var connectionDto = mapper.Map<ConnectionDto>(connection, opt => opt.Items["Identity"] = identityContainsRequestingPerson ? requestingPerson : targetPerson);

        connectionDto.Should().BeEquivalentTo(new ConnectionDto
        {
            Id = 1,
            Status = ConnectionStatus.Accepted,
            Person = new AmbiguousPersonDto
            {
                Id = identityContainsRequestingPerson ? targetPerson.Id : requestingPerson.Id,
                FirstName = identityContainsRequestingPerson ? targetPerson.FirstName : requestingPerson.FirstName,
                SecondName = identityContainsRequestingPerson ? targetPerson.SecondName : requestingPerson.SecondName,
                Tenant = identityContainsRequestingPerson ? targetPerson.Tenant : requestingPerson.Tenant
            }
        });
    }

    [Test]
    public void Connection_ConnectionDto_NotAccepted_LimitedPersonObjectReturned()
    {
        var requestingPerson = new Entities.Person
        {
            Id = 1,
            FirstName = "First",
            SecondName = "User",
            Tenant = Guid.NewGuid()
        };

        var targetPerson = new Entities.Person
        {
            Id = 2,
            FirstName = "User",
            SecondName = "2",
            Tenant = Guid.NewGuid()
        };

        var connection = new Connection
        {
            Id = 1,
            RequestingPerson = requestingPerson.ToModel(),
            TargetPerson = targetPerson.ToModel(),
            IsAccepted = false,
            RequestedOn = DateTime.UtcNow
        };

        var connectionDto = mapper.Map<ConnectionDto>(connection, opt => opt.Items["Identity"] = requestingPerson);

        connectionDto.Should().BeEquivalentTo(new ConnectionDto
        {
            Id = 1,
            Status = ConnectionStatus.PendingOnTarget,
            Person = new AmbiguousPersonDto
            {
                Id = targetPerson.Id
            }
        });
    }

    [Test]
    public void Connection_ConnectionDto_NotAccepted_TargetUserSeeFullPersonObject()
    {
        var requestingPerson = new Entities.Person
        {
            Id = 1,
            FirstName = "First",
            SecondName = "User",
            Tenant = Guid.NewGuid()
        };

        var targetPerson = new Entities.Person
        {
            Id = 2,
            FirstName = "User",
            SecondName = "2",
            Tenant = Guid.NewGuid()
        };

        var connection = new Connection
        {
            Id = 1,
            RequestingPerson = requestingPerson.ToModel(),
            TargetPerson = targetPerson.ToModel(),
            IsAccepted = false,
            RequestedOn = DateTime.UtcNow
        };

        var connectionDto = mapper.Map<ConnectionDto>(connection, opt => opt.Items["Identity"] = targetPerson);

        connectionDto.Should().BeEquivalentTo(new ConnectionDto
        {
            Id = 1,
            Status = ConnectionStatus.Pending,
            Person = new AmbiguousPersonDto
            {
                Id = requestingPerson.Id,
                FirstName = requestingPerson.FirstName,
                SecondName = requestingPerson.SecondName,
                Tenant = requestingPerson.Tenant
            }
        });
    }

    [OneTimeSetUp]
    public void AutoMapperTestsOneTimeSetUp()
    {
        var config = new MapperConfiguration(cfg => {
            cfg.AddProfile<AppMapper>();
        });

        this.mapper = new Mapper(config);
    }
}
