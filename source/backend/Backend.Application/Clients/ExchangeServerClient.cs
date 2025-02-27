namespace Backend.Application.Clients;

using System;
using System.Collections.Generic;
using System.Text.Json;
using Backend.Domain.Models;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;

public class ExchangeServerClient : IExchangeServerClient
{
    private HttpClient? client;

    private HttpClient Client => this.client ??= new HttpClient();

    private ILogger Logger { get; }

    public ExchangeServerClient(Uri baseAddress, ILoggerFactory loggerFactory)
    {
        this.Client.BaseAddress = baseAddress;
        this.Logger = loggerFactory.CreateLogger<ExchangeServerClient>();
    }

    public Dictionary<DateTime, Dictionary<string, double>> GetExchangeRates(DateTime from, DateTime to, string targetCurrency)
    {
        TimeZoneInfo cetTimeZone = TimeZoneInfo.FindSystemTimeZoneById("CET");
        var cetFrom = TimeZoneInfo.ConvertTimeFromUtc(from, cetTimeZone);
        var cetTo = TimeZoneInfo.ConvertTimeFromUtc(to, cetTimeZone);

        string requestQuery = QueryHelpers.AddQueryString($"{cetFrom:yyyy-MM-dd}..{cetTo:yyyy-MM-dd}", new Dictionary<string, string>
        {
            { "base", targetCurrency }
        });

        var result = new Dictionary<DateTime, Dictionary<string, double>>();

        try
        {
            var requestMessage = new HttpRequestMessage(HttpMethod.Get, requestQuery);
            requestMessage.Headers.Add("Accept", "application/json");
            
            var request = this.Client.Send(requestMessage);

            if (request.IsSuccessStatusCode)
            {
                using (var reader = new StreamReader(request.Content.ReadAsStream()))
                {
                    var response = JsonSerializer.Deserialize<ExchangeServerResponseRoot>(reader.ReadToEnd());
                    
                    if (response?.Rates != null)
                    {
                        result = response.Rates.ToDictionary(x => TimeZoneInfo.ConvertTimeToUtc(x.Key, cetTimeZone), x => x.Value);
                    }
                    else
                    {
                        this.Logger.LogError($"There is no data in Exchange Server's response.");
                    };
                }
            }
            else
            {
                this.Logger.LogError($"Request to Exchange Server was failed. Returned code: {request.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            this.Logger.LogError($"Error has occurred during fetching exchange rates from server '{this.Client.BaseAddress}': {ex}");
        }

        return result;
    }
}