using System.Text.Json;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
var app = builder.Build();

var jogos = new List<Jogo>
{
    new Jogo(1, "Hollow Knight", true),
    new Jogo(2, "Grand Theft Auto 6", false)
};

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

app.MapPut("/api/jogos/{id:int}", (int id, JogoAtualizadoDTO dados) =>
{
    int indice = jogos.FindIndex(JogoDaLista => JogoDaLista.id == id);
    if (indice == -1)
    {
        return Results.NotFound();
    }
    var atualizado = new Jogo(id, dados.titulo, dados.disponivel);
    jogos[indice] = atualizado;
    return Results.Ok(atualizado);
});

app.MapDelete("/api/jogos/{id:int}",async (int id, ApiDbContext db) =>
{
    var jogo = await db.Jogos.FindAsync(id);
    
    if (jogo is null)
    {
        return Results.NotFound();
    }
    
    db.Jogos.Remove(jogo);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();

class JogoEntity
{
  public int Id { get; set; }  
  public string Nome { get; set;} = string.Empty;
  public bool Disponivel { get; set;}
};

class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }

    public DbSet<JogoEntity> Jogos => Set<JogoEntity>();
}

record Jogo(int id, string titulo, bool disponivel);
record JogoDTO(string titulo);
record JogoAtualizadoDTO (string titulo, bool disponivel);