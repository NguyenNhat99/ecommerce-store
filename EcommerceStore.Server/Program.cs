using EcommerceStore.Server.Data;
using EcommerceStore.Server.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1) CORS: CHỈ rõ origin FE và cho phép Credentials (cookie)
var MyCors = "_MyCors";
builder.Services.AddCors(opts =>
{
    opts.AddPolicy(MyCors, p => p
        .WithOrigins(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://localhost:5173" // nếu FE chạy https
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
    );
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "Book API", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type=ReferenceType.SecurityScheme, Id="Bearer" } }, new string[]{} }
    });
});

builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<EcommerceStoreContext>()
    .AddDefaultTokenProviders();

builder.Services.AddDbContext<EcommerceStoreContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("EcommerceStore"));
});

builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddRepositories();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateAudience = false,
        ValidateIssuer = false,
        ValidAudience = builder.Configuration["JWT:Audience"],
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"]))
    };
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 2) Bắt buộc chuyển HTTPS trước khi set cookie có Secure
app.UseHttpsRedirection();

// 3) Bật CORS (cho phép cookie cross-site)
app.UseCors(MyCors);

// 4) Middleware đảm bảo có cookie cart_id cho khách ẩn danh
app.Use(async (ctx, next) =>
{
    const string CartCookie = "cart_id";
    if (!ctx.Request.Cookies.ContainsKey(CartCookie))
    {
        // tạo id và set cookie với SameSite=None để XHR cross-site gửi lại
        var id = Guid.NewGuid().ToString("N");
        ctx.Response.Cookies.Append(
            CartCookie,
            id,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,                 // bắt buộc khi SameSite=None
                SameSite = SameSiteMode.None,  // quan trọng cho cross-site XHR
                Expires = DateTimeOffset.UtcNow.AddDays(30)
            }
        );
    }
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");
app.Run();
