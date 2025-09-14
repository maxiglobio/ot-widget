using GlobioPOI.Configuration;
using GlobioPOI.Foursquare;
using GlobioPOI.Interfaces;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

public sealed class FoursquareService : IFoursquareService
{
    private readonly IHttpClientFactory httpClientFactory;
    private readonly FoursquareConfiguration options;

    public FoursquareService(IHttpClientFactory httpClientFactory, IOptions<FoursquareConfiguration> options)
    {
        this.httpClientFactory = httpClientFactory;
        this.options = options?.Value ?? throw new ArgumentNullException(nameof(options));
    }

    public async Task<IReadOnlyList<FoursquarePlace>?> GetPlaces(
        double latitude,
        double longitude,
        int radiusMeters,
        bool kids,
        bool cars,
        bool pets,
        IEnumerable<string> excludeIds,
        CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient("foursquare");
        client.BaseAddress = new Uri(options.PlacesApiUrl);
        client.DefaultRequestHeaders.Accept.Clear();
        client.DefaultRequestHeaders.Add("X-Places-Api-Version", options.ApiVersion);
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", options.ApiKey);

        var query = new Dictionary<string, string?>
        {
            ["ll"] = FormattableString.Invariant($"{latitude.ToString(CultureInfo.InvariantCulture)},{longitude.ToString(CultureInfo.InvariantCulture)}"),
            ["radius"] = (radiusMeters == 0 ? options.DefaultRadius : radiusMeters).ToString(CultureInfo.InvariantCulture),
            ["limit"] = options.DefaultLimit.ToString(),
            ["sort"] = options.DefaultSort,
            ["fields"] = "fsq_place_id,name,latitude,longitude,distance,rating,popularity,attributes,categories",
        };

        if (excludeIds != null)
        {
            var ids = string.Join(',', excludeIds.Where(x => !string.IsNullOrWhiteSpace(x)));
            if (!string.IsNullOrWhiteSpace(ids))
                query["exclude_fsq_chain_ids"] = ids;
        }

        var categoryIds = new List<string>();
        if (kids)
        {
            categoryIds.AddRange(options.Categories.Kids.Select(i => i.Key));
        }
        if (pets)
        {
            categoryIds.AddRange(options.Categories.Pets.Select(i => i.Key));
        }
        if (cars)
        {
            categoryIds.AddRange(options.Categories.Cars.Select(i => i.Key));
        }
        if (categoryIds != null)
        {
            var ids = string.Join(',', categoryIds.Where(x => !string.IsNullOrWhiteSpace(x)));
            if (!string.IsNullOrWhiteSpace(ids))
                query["fsq_category_ids"] = ids;
        }

        var url = new StringBuilder("/places/search");
        url.Append(QueryStringBuilder.FromDictionary(query));

        using var req = new HttpRequestMessage(HttpMethod.Get, url.ToString());
        using var resp = await client.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        resp.EnsureSuccessStatusCode();

        await using var stream = await resp.Content.ReadAsStreamAsync(cancellationToken);
        var payload = await JsonSerializer.DeserializeAsync<FoursquareSearchResponse>(
            stream,
            Serializer.Options,
            cancellationToken) ?? new FoursquareSearchResponse();

        return payload.Results;
    }
}