namespace GlobioPOI.Configuration
{
    public class FoursquareConfiguration
    {
        public const string SectionName = "Foursquare";

        public required string ApiKey { get; set; }
        public required string PlacesApiUrl { get; set; }
        public required string ApiVersion { get; set; }
        public int DefaultRadius { get; set; }
        public int DefaultLimit { get; set; }
        public required string DefaultSort { get; set; }

        public required FoursquareCategories Categories { get; set; }
    }

    public class FoursquareCategories
    {
        public Dictionary<string, string> Kids { get; set; } = new();
        public Dictionary<string, string> Pets { get; set; } = new();
        public Dictionary<string, string> Cars { get; set; } = new();
    }

}
