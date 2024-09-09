namespace Backend.Infrastructure.Converters;

using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

public class NullableDateTimeUtcConverter : ValueConverter<DateTime?, DateTime?>
{
    public NullableDateTimeUtcConverter() : base(
        v => v == null ? v : v.Value.Kind == DateTimeKind.Utc ? v.Value : v.Value.ToUniversalTime(), 
        v => v == null ? v : DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)
    ) {}
}
