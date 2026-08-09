namespace Backend.Application.Clients;

using System;
using System.Collections.Generic;
using System.Text.Json;
using Backend.Domain.Extensions;
using Backend.Domain.Models;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;

public class ExchangeServerClientV2 : IExchangeServerClient
{
    private HttpClient? client;

    private HttpClient Client => this.client ??= new HttpClient();

    private ILogger Logger { get; }

    public ExchangeServerClientV2(Uri baseAddress, ILoggerFactory loggerFactory)
    {
        this.Client.BaseAddress = baseAddress;
        this.Logger = loggerFactory.CreateLogger<ExchangeServerClient>();
    }

    public Dictionary<DateTime, Dictionary<string, double>> GetExchangeRates(DateTime from, DateTime to, string targetCurrency)
    {
        TimeZoneInfo cetTimeZone = TimeZoneInfo.FindSystemTimeZoneById("CET");
        var cetFrom = TimeZoneInfo.ConvertTimeFromUtc(from, cetTimeZone);
        var cetTo = TimeZoneInfo.ConvertTimeFromUtc(to, cetTimeZone);

        string requestQuery = QueryHelpers.AddQueryString($"rates", new Dictionary<string, string>
        {
            { "from", cetFrom.ToString("yyyy-MM-dd") },
            { "to", cetTo.ToString("yyyy-MM-dd") },
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
                    var response = JsonSerializer.Deserialize<List<ExchangeServerRateResponse>>(reader.ReadToEnd());
                    
                    if (!response.IsEmpty())
                    {
                        result = response!.GroupBy(x => x.Date).ToDictionary(g => TimeZoneInfo.ConvertTimeToUtc(g.Key, cetTimeZone), g => g.ToDictionary(r => r.Quote, r => r.Rate));
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