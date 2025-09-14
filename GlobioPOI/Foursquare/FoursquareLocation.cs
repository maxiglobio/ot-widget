using System.Text.Json.Serialization;

namespace GlobioPOI.Foursquare;

public sealed class FoursquareLocation
{
    [JsonPropertyName("formatted_address")] public string? FormattedAddress { get; set; }
    [JsonPropertyName("latitude")] public double? Lat { get; set; }
    [JsonPropertyName("longitude")] public double? Lng { get; set; }
}
