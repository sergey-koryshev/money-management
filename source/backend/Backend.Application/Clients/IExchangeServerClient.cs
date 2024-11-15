namespace Backend.Application.Clients;

using System;

public interface IExchangeServerClient
{
    public Dictionary<DateTime, Dictionary<string, double>> GetExchangeRates(DateTime from, DateTime to, string targetCurrency);
}
