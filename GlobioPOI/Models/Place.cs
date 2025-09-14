using System.Globalization;

namespace GlobioPOI.Models;

public sealed record Place
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Address { get; init; }
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
    public int? DistanceMeters { get; init; }
    public double? Rating { get; init; }
    public double? Popularity { get; init; }
    public bool Kids { get; set; }
    public bool Pets { get; set; }
    public bool Car { get; set; }

    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Tags { get; set; }
    public string? Category { get; set; }

    public string? GoogleMapLink => 
        this.Latitude is not null && this.Longitude is not null 
        ? $"https://www.google.com/maps?q={this.Latitude?.ToString(CultureInfo.InvariantCulture)},{this.Longitude?.ToString(CultureInfo.InvariantCulture)}" 
        : null;
    public string? AppleMapLink => 
        this.Latitude is not null && this.Longitude is not null 
        ? $"http://maps.apple.com/?ll={this.Latitude?.ToString(CultureInfo.InvariantCulture)},{this.Longitude?.ToString(CultureInfo.InvariantCulture)}" 
        : null;
    public IReadOnlyList<string> Categories { get; init; } = Array.Empty<string>();
}
