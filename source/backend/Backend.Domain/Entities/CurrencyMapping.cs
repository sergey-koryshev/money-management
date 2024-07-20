namespace Backend.Domain.Entities;

using System.ComponentModel.DataAnnotations;

public class CurrencyMapping
{
    public int Id { get; set; }
    
    [Required]
    public int CurrencyId { get; set; }
    
    [Required]
    public int PersonId { get; set; }

    [Required]
    public bool IsMainCurrency { get; set; }

    public virtual Currency? Currency { get; set; }

    public virtual Person? Person { get; set; }
}
