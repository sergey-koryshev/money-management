
namespace Backend.Domain.Entities;

using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

public class User : IdentityUser<int>
{
    public required string FirstName { get; set; }

    public string? SecondName { get; set; }

    public required Guid Tenant { get; set; }

    [NotMapped]
    public override bool EmailConfirmed { get; set; }

    [NotMapped]
    public override string? PhoneNumber { get; set; }

    [NotMapped]
    public override bool PhoneNumberConfirmed { get; set; }

    [NotMapped]
    public override bool TwoFactorEnabled { get; set; }
}