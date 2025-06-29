using Models;
using Microsoft.EntityFrameworkCore;
using System;
using Microsoft.AspNetCore.Identity;
using Models.Entities;
using Repositories.Implementations;
using Repositories.Interfaces;
using Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Repositories;

namespace MasjidStory
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseLazyLoadingProxies().UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
                 .AddEntityFrameworkStores<ApplicationDbContext>();

            // Repository Registration
            builder.Services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
            builder.Services.AddScoped(typeof(IMasjidRepository), typeof(MasjidRepository));
            builder.Services.AddScoped(typeof(IMasjidVisitRepository), typeof(MasjidVisitRepository));
            builder.Services.AddScoped(typeof(IStoryRepository), typeof(StoryRepository));
            builder.Services.AddScoped(typeof(ILikeRepository), typeof(LikeRepository));
            builder.Services.AddScoped(typeof(ICommentRepository), typeof(CommentRepository));
            builder.Services.AddScoped(typeof(IUserRepository), typeof(UserRepository));
            builder.Services.AddScoped(typeof(IMediaRepository), typeof(MediaRepository));

            // Service Registration
            builder.Services.AddScoped<AuthService>();
            builder.Services.AddScoped<MasjidService>();
            builder.Services.AddScoped<StoryService>();
            builder.Services.AddScoped<MediaService>();
            builder.Services.AddScoped<EventService>();
            builder.Services.AddScoped<LikeService>();
            builder.Services.AddScoped<CommentService>();
            builder.Services.AddScoped<LanguageService>();
            builder.Services.AddScoped<CommunityService>();
            builder.Services.AddScoped<UserService>();

            // Register IWebHostEnvironment
            builder.Services.AddSingleton<IWebHostEnvironment>(builder.Environment);

            // Authentication
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                };
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAngularDev",
                    policy => policy.WithOrigins("http://localhost:4200")
                                    .AllowAnyMethod()
                                    .AllowAnyHeader()
                                    .AllowCredentials());
            });

            var app = builder.Build();

            // Seed Roles
            using (var scope = app.Services.CreateScope())
            {
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
                string[] roles = { "Admin", "User" };

                foreach (var role in roles)
                {
                    var roleExists = await roleManager.RoleExistsAsync(role);
                    if (!roleExists)
                        await roleManager.CreateAsync(new IdentityRole(role));
                }

                // Seed Admin User from appsettings
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
                var adminEmail = builder.Configuration["AdminUser:Email"];
                var adminPassword = builder.Configuration["AdminUser:Password"];
                var firstName = builder.Configuration["AdminUser:FirstName"];
                var lastName = builder.Configuration["AdminUser:LastName"];

                var adminUser = await userManager.FindByEmailAsync(adminEmail);

                if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
                {
                    Console.WriteLine("⚠ Admin credentials are missing from appsettings.json");
                }

                if (adminUser == null)
                {
                    var admin = new ApplicationUser
                    {
                        Email = adminEmail,
                        UserName = adminEmail,
                        FirstName = firstName,
                        LastName = lastName,
                        ProfilePictureUrl = "default.jpg"
                    };

                    var result = await userManager.CreateAsync(admin, adminPassword);
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(admin, "Admin");
                        Console.WriteLine($"✔ Admin user '{adminEmail}' created and assigned to role 'Admin'");
                    }
                    else
                    {
                        Console.WriteLine($"❌ Failed to create admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
                }

                // Seed Tags
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                if (!dbContext.Tags.Any())
                {
                    var defaultTags = new List<Tag>
                    {
                        new Tag { Name = "History" },
                        new Tag { Name = "Architecture" },
                        new Tag { Name = "Community" },
                        new Tag { Name = "Charity" },
                        new Tag { Name = "Education" },
                        new Tag { Name = "Event" },
                        new Tag { Name = "Prayer" },
                        new Tag { Name = "Youth" },
                        new Tag { Name = "Women" },
                        new Tag { Name = "Ramadan" },
                        new Tag { Name = "Lecture" },
                        new Tag { Name = "Fundraising" }
                    };
                    dbContext.Tags.AddRange(defaultTags);
                    dbContext.SaveChanges();
                    Console.WriteLine("✔ Default tags seeded.");
                }
                else
                {
                    Console.WriteLine("ℹ Tags already exist, skipping tag seeding.");
                }
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("AllowAngularDev");
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseStaticFiles();  // enables access to /uploads/image.jpg

            // Ensure uploads directory exists
            var uploadsPath = Path.Combine(app.Environment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            app.MapControllers();

            app.Run();
        }
    }
} 