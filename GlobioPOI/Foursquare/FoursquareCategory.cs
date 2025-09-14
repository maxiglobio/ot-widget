using System.Text.Json.Serialization;

namespace GlobioPOI.Foursquare;

public sealed class FoursquareCategory
{
    [JsonPropertyName("id")] public string? Id { get; set; }
    [JsonPropertyName("name")] public string? Name { get; set; }
}
