using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi.Models;
using DailyTaskVerse.API.Middleware;
using DailyTaskVerse.API.BackgroundServices;
using DailyTaskVerse.Application;
using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Infrastructure;
using DailyTaskVerse.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add layers
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// Background Services
builder.Services.AddHostedService<OverdueTaskCheckerService>();
builder.Services.AddHostedService<ReminderCheckerService>();

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DailyTaskVerse API",
        Version = "v1",
        Description = "Internal office productivity tool API"
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:5173" })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Seed admin user
using (var scope = app.Services.CreateScope())
{
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var adminEmail = "admin@dailytaskverse.com";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Name = "Admin",
            Email = adminEmail,
            UserName = adminEmail,
            Role = DailyTaskVerse.Domain.Enums.UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };
        await userManager.CreateAsync(adminUser, "Admin@123");
    }
}

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.MapControllers();

app.Run();
