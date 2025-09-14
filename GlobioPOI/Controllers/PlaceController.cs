using GlobioPOI.Interfaces;
using GlobioPOI.Models;
using Microsoft.AspNetCore.Mvc;

namespace GlobioPOI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PlaceController : ControllerBase
{
    private readonly IPlaceService placesService;

    public PlaceController(IPlaceService placesService)
    {
        this.placesService = placesService;
    }


    [HttpPost()]
    public async Task<ActionResult<Place>> GetPlace([FromBody] PlaceRequest request,
    CancellationToken cancellationToken)
    {
        if (request.Lat == 0 || request.Lng == 0)
        {
            request.Lat = 36.550838;
            request.Lng = 31.984941;
        }

        var results = await this.placesService.GetPlace(request, cancellationToken);

        return Ok(results);
    }
}
