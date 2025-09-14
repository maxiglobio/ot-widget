using GlobioPOI.Models;

namespace GlobioPOI.Interfaces;

public interface IPlaceService
{
    Task<Place?> GetPlace(PlaceRequest placeRequest, CancellationToken cancellationToken);
}