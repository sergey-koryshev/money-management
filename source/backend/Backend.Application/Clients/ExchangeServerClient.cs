namespace Backend.Application.Clients;

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text.Json;
using Backend.Domain.Models;
using Microsoft.AspNetCore.WebUtilities;

public class ExchangeServerClient : IExchangeServerClient
{
    private HttpClient? client;

    private HttpClient Client => this.client ??= new HttpClient();

    public ExchangeServerClient(Uri baseAddress)
    {
        this.Client.BaseAddress = baseAddress;
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
            var webRequest = new HttpRequestMessage(HttpMethod.Get, requestQuery);
            webRequest.Headers.Add("Accept", "application/json");
            
            var request = this.Client.Send(webRequest);

            if (request.IsSuccessStatusCode)
            {
                using (var reader = new StreamReader(request.Content.ReadAsStream()))
                {
                    var response = JsonSerializer.Deserialize<ExchangeServerResponseRoot>(reader.ReadToEnd());
                    
                    if (response?.Rates != null)
                    {
                        result = response.Rates.ToDictionary(x => TimeZoneInfo.ConvertTimeToUtc(x.Key, cetTimeZone), x => x.Value);
                    };
                }
            }
        }
        catch (Exception ex)
        {
            Trace.TraceError($"Error has occurred during fetching exchange rates from server '{this.Client.BaseAddress}': {ex}");
        }

        return result;
    }
}