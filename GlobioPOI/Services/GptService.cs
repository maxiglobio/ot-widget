using GlobioPOI.Configuration;
using GlobioPOI.Interfaces;
using GlobioPOI.Models;
using Microsoft.Extensions.Options;
using OpenAI.Chat;
using System.Text.Json;

namespace GlobioPOI.Services;

public class GptService : IGptService
{
    private readonly ChatGptConfiguration configuration;
    private readonly ChatClient chatClient;
    private readonly string systemPrompt;

    public GptService(IOptions<ChatGptConfiguration> configuration)
    {
        this.configuration = configuration.Value;

        this.chatClient = new(model: this.configuration.Model, this.configuration.OpenAIKey);
        this.systemPrompt = File.ReadAllText(this.configuration.PlacePromtFile);
    }

    public async Task<GptPlaceResponse?> AskChat(string jsonPayload)
    {
        var options = new ChatCompletionOptions
        {
            MaxOutputTokenCount = configuration.MaxOutputTokenCount,
            Temperature = (float)configuration.Temperature,
            TopP = (float)configuration.TopP,
            PresencePenalty = (float)configuration.PresencePenalty,
            FrequencyPenalty = (float)configuration.FrequencyPenalty,
            ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                "PlaceSchema",
                 BinaryData.FromString("""
                {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "maxLength": 30,
                      "description": "Max 30 characters. Must be clear, not generic"
                    },
                    "description": {
                      "type": "string",
                      "pattern": "^(\\s*\\b\\S+\\b\\s*){1,30}$",
                      "description": "Up to 30 words"
                    },
                    "tags": {
                      "type": "string",
                      "pattern": "^[^,]+(,[^,]+){0,4}$",
                      "description": "comma-separated, max 5"
                    },
                    "name": { "type": "string" },
                    "category": { "type": "string", "enum": ["PLACES"] }
                  },
                  "required": ["title","description","tags","name","category"],
                  "additionalProperties": false
                }
                """),
                jsonSchemaIsStrict: true)
        };

        var messages = new ChatMessage[]
        {
            ChatMessage.CreateSystemMessage(systemPrompt),
            ChatMessage.CreateUserMessage(jsonPayload)
        };

        var completion = await this.chatClient.CompleteChatAsync(messages, options);
        var json = completion.Value.Content.FirstOrDefault()?.Text;
        if (json == null)
        {
            return null;
        }
        var dto = JsonSerializer.Deserialize<GptPlaceResponse>(json);
        return dto;


    }
}
