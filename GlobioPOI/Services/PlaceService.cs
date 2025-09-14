using GlobioPOI.Configuration;
using GlobioPOI.Foursquare;
using GlobioPOI.Interfaces;
using GlobioPOI.Models;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace GlobioPOI.Services;

public class PlaceService : IPlaceService
{
    private readonly GeneralConfiguration generalConfiguration;
    private readonly IFoursquareService foursquareService;
    private readonly IGptService gptService;

    public PlaceService(
        IOptions<GeneralConfiguration> options, 
        IFoursquareService foursquareService,
        IGptService gptService)
    {
        this.generalConfiguration = options?.Value ?? throw new ArgumentNullException(nameof(options));
        this.foursquareService = foursquareService;
        this.gptService = gptService;
    }

    public async Task<Place?> GetPlace(PlaceRequest placeRequest, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var radius = 0;
        if (placeRequest.Kids) radius = generalConfiguration.KidsRadius;
        if (placeRequest.Pets) radius = generalConfiguration.PetsRadius;
        if (placeRequest.Car) radius = generalConfiguration.CarsRadius;

        var foursquarePlaces = await foursquareService.GetPlaces(
            placeRequest.Lat,
            placeRequest.Lng,
            radius,
            placeRequest.Kids,
            placeRequest.Pets,
            placeRequest.Car,
            placeRequest.ExcludeIds ?? new List<string>(),
            CancellationToken.None);

        if(foursquarePlaces == null || !foursquarePlaces.Any())
            return null;

        var rand = new Random();
        var index = rand.Next(foursquarePlaces.Count() - 1);
        var foursquarePlace = foursquarePlaces[index];

        var place = Map(foursquarePlace);
        place.Car = placeRequest.Car;
        place.Kids = placeRequest.Kids;
        place.Pets = placeRequest.Pets;

        var gptJson = JsonSerializer.Serialize(place);
        var gptResponse = await gptService.AskChat(gptJson);
        if(gptResponse != null)
        {
            place = place with
            {
                Name = gptResponse.Name ?? place.Name,
                Tags = gptResponse.Tags,
                Title = gptResponse.Title,
                Description = gptResponse.Description,
                Category = gptResponse.Category
            };
        }

        return place;
    }

    private static Place Map(FoursquarePlace fp) => new()
    {
        Id = fp.FsqId ?? string.Empty,
        Name = fp.Name ?? string.Empty,
        Address = fp.Location?.FormattedAddress,
        Latitude = fp.Latitude,
        Longitude = fp.Longitude,
        DistanceMeters = fp.Distance,
        Rating = fp.Rating,
        Popularity = fp.Popularity,
        Categories = fp.Categories?.Select(c => c.Name ?? c.Id).Where(s => !string.IsNullOrWhiteSpace(s)).ToArray() ?? Array.Empty<string>()
    };
}
