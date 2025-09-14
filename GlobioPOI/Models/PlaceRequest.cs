namespace GlobioPOI.Models
{
    public class PlaceRequest
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
        public bool Kids { get; set; }
        public bool Pets { get; set; }
        public bool Car { get; set; }
        public List<string>? ExcludeIds { get; set; }
    }
}
