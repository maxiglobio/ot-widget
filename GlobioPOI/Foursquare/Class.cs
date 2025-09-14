using System.Text.Json.Serialization;
using System.Text.Json;

namespace GlobioPOI.Foursquare;

internal static class Serializer
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };
}

internal static class QueryStringBuilder
{
    public static string FromDictionary(Dictionary<string, string?> dict)
    {
        var items = dict
            .Where(kv => !string.IsNullOrWhiteSpace(kv.Value))
            .Select(kv => Uri.EscapeDataString(kv.Key) + "=" + Uri.EscapeDataString(kv.Value!));
        var qs = string.Join("&", items);
        return string.IsNullOrEmpty(qs) ? string.Empty : "?" + qs;
    }
}
