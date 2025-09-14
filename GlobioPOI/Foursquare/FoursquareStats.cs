using System.Text.Json.Serialization;

namespace GlobioPOI.Foursquare;

public sealed class FoursquareStats
{
    [JsonPropertyName("total_ratings")] public int? TotalRatings { get; set; }
}
