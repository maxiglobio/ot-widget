using GlobioPOI.Models;

namespace GlobioPOI.Interfaces;

public interface IGptService
{
    Task<GptPlaceResponse?> AskChat(string jsonPayload);
}
