using Microsoft.EntityFrameworkCore;
using ApiLojaDeJogos.Models;
using ApiLojaDeJogos.Data;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddCors();
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(new
        {
            mensagem = "Ocorreu um erro interno. Tente novamente mais tarde."
        });
    });
});

app.UseCors(policy => policy.WithOrigins("http://localhost:5214")
    .AllowAnyHeader().AllowAnyMethod());

app.MapGet("/", () => "API do catálogo de jogos está no ar!");

app.MapGet("/api/jogos", async (ApiDbContext db) =>
{
    var jogos = await db.Jogos.ToListAsync();
    return Results.Ok(jogos);
});

app.MapGet("/api/jogos/{id:int}", async (int id, ApiDbContext db) => 
{
    var jogoEncontrado = db.Jogos.Find(id);
    if (jogoEncontrado is null)
    {
        return Results.NotFound();
    };
    return Results.Ok(jogoEncontrado);
});

app.MapPost("/api/jogos", async (JogoEntity dados, ApiDbContext db) =>
{
   
   db.Jogos.Add(dados);
   await db.SaveChangesAsync();
   return Results.Created($"/api/jogos/{dados.Id}", dados);
});

app.MapPut("/api/jogos/{id:int}", async (int id, JogoEntity JogoAtualizado, ApiDbContext db) =>
{
    var jogo = await db.Jogos.FindAsync(id);
    if (jogo is null) return Results.NotFound();
    jogo.Nome = JogoAtualizado.Nome;
    jogo.Disponivel = JogoAtualizado.Disponivel;
    await db.SaveChangesAsync();
    return Results.Ok(jogo);
});

app.MapDelete("/api/jogos/{id:int}",async (int id, ApiDbContext db) =>
{
    var jogo = await db.Jogos.FindAsync(id);
    if (jogo is null) return Results.NotFound();
    
    db.Jogos.Remove(jogo);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
