namespace GlobioPOI.Configuration
{
    public class ChatGptConfiguration
    {
        public const string SectionName = "ChatGpt";

        public string Model { get; set; } = "gpt-4o";
        public string OpenAIKey { get; set; } = string.Empty;

        public int? MaxOutputTokenCount { get; set; } = 1500;
        public double Temperature { get; set; } = 0.7;
        public double TopP { get; set; } = 0.95;
        public double PresencePenalty { get; set; } = 0.4;
        public double FrequencyPenalty { get; set; } = 0.3;


        public string PlacePromtFile { get; set; } = "PlacePromt.txt";
    }
}
