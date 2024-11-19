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
        var convertedFrom = TimeZoneInfo.ConvertTimeFromUtc(from, cetTimeZone);
        var convertedTo = TimeZoneInfo.ConvertTimeFromUtc(to, cetTimeZone);
        var today = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, cetTimeZone);

        // workaround for https://github.com/hakanensari/frankfurter/issues/71
        if (convertedFrom.DayOfWeek == DayOfWeek.Monday && convertedFrom.Date == today.Date && convertedFrom.Date == convertedTo.Date)
        {
            convertedFrom = from.AddDays(-3);
        } 
        else if (convertedFrom.DayOfWeek == DayOfWeek.Sunday)
        {
            convertedFrom = from.AddDays(-2);
        }
        else if (convertedFrom.DayOfWeek == DayOfWeek.Saturday)
        {
            convertedFrom = from.AddDays(-1);
        }

        string requestQuery = QueryHelpers.AddQueryString($"{convertedFrom:yyyy-MM-dd}..{convertedTo:yyyy-MM-dd}", new Dictionary<string, string>
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
            Trace.TraceWarning($"Error has occurred during fetching exchange rates from server '{this.Client.BaseAddress}': {ex}");
        }

        return result;
    }
}