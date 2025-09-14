namespace GlobioPOI.Interfaces;

using GlobioPOI.Foursquare;

public interface IFoursquareService
{
    Task<IReadOnlyList<FoursquarePlace>?> GetPlaces(
        double latitude,
        double longitude,
        int radiusMeters,
        bool kids, 
        bool cars, 
        bool pets,
        IEnumerable<string> excludeIds,
        CancellationToken cancellationToken);
}
