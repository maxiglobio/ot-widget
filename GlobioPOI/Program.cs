using GlobioPOI.Configuration;
using GlobioPOI.Interfaces;
using GlobioPOI.Services;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Configuration
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile("appsettings.Categories.json", optional: true, reloadOnChange: true);
        builder.Services.Configure<ChatGptConfiguration>(builder.Configuration.GetSection(ChatGptConfiguration.SectionName));
        builder.Services.Configure<FoursquareConfiguration>(builder.Configuration.GetSection(FoursquareConfiguration.SectionName));
        builder.Services.Configure<GeneralConfiguration>(builder.Configuration.GetSection(GeneralConfiguration.SectionName));

        builder.Services.AddHttpClient("foursquare", client => { });

        builder.Services.AddSingleton<IGptService, GptService>();
        builder.Services.AddTransient<IFoursquareService, FoursquareService>();
        builder.Services.AddTransient<IPlaceService, PlaceService>();

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        app.UseCors("AllowAll");

        app.UseAuthorization();

        app.UseDefaultFiles();
        app.UseStaticFiles();

        app.MapControllers();

        app.MapFallbackToFile("index.html");

        app.Run();
    }
}