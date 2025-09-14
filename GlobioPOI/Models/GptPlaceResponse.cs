using System.Text.Json.Serialization;

namespace GlobioPOI.Models;

public class GptPlaceResponse
{
    [JsonPropertyName("title")]
    public required string Title { get; set; }

    [JsonPropertyName("description")]
    public required string Description { get; set; }

    [JsonPropertyName("tags")]
    public required string Tags { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("category")]
    public required string Category { get; set; }
}
