namespace Backend.Service;

using Backend.Domain.DTO;

public interface ICurrenciesService
{
    public List<CurrencyDto> GetAllCurrencies();

    public CurrencyDto? GetMainCurrency();

    public CurrencyDto SetMainCurrency(int currencyId);

    public void DeleteMainCurrency();
}
