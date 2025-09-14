using System.Text.Json.Serialization;

namespace GlobioPOI.Foursquare;

public sealed class FoursquareSearchResponse
{
    [JsonPropertyName("results")] public List<FoursquarePlace>? Results { get; set; }
}
