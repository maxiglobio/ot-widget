using System.Text.Json.Serialization;

namespace GlobioPOI.Foursquare;

public sealed class FoursquarePlace
{
    [JsonPropertyName("fsq_place_id")] public string? FsqId { get; set; }
    [JsonPropertyName("name")] public string? Name { get; set; }
    [JsonPropertyName("distance")] public int? Distance { get; set; }
    [JsonPropertyName("rating")] public double? Rating { get; set; }
    [JsonPropertyName("popularity")] public double? Popularity { get; set; }
    [JsonPropertyName("latitude")] public double? Latitude { get; set; }
    [JsonPropertyName("longitude")] public double? Longitude { get; set; }
    [JsonPropertyName("stats")] public FoursquareStats? Stats { get; set; }
    [JsonPropertyName("categories")] public List<FoursquareCategory>? Categories { get; set; }
    [JsonPropertyName("location")] public FoursquareLocation? Location { get; set; }
}
