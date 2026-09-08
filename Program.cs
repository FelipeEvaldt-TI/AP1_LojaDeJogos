using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var jogos = new List<Jogo>
{
    new Jogo(1, "Hollow Knight", true),
    new Jogo(2, "Grand Theft Auto 6", false)
};

app.MapGet("/", () => "API do catálogo de jogos está no ar!");

app.MapGet("/api/jogos", () =>
{
    return Results.Ok(jogos);
});

app.MapGet("/api/jogos/{id:int}", (int id) => 
{
    var jogoEncontrado = jogos.Find(jogo => jogo.id == id);
    if (jogoEncontrado is null)
    {
        return Results.NotFound();
    };
    return Results.Ok(jogoEncontrado);
});

app.MapPost("/api/jogos", (JogoDTO dados) =>
{
   int proximoId = jogos.Count + 1;
   var novoJogo = new Jogo(proximoId, dados.titulo, true);
   jogos.Add(novoJogo);
   return Results.Created($"/api/jogos/{novoJogo.id}", novoJogo);
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

app.MapDelete("/api/jogos/{id:int}", (int id) =>
{
    int indice = jogos.FindIndex(JogoDaLista => JogoDaLista.id == id);
    if (indice == -1)
    {
        return Results.NotFound();
    }
    jogos.RemoveAt(indice);

    return Results.NoContent();
});


app.Run();

record Jogo(int id, string titulo, bool disponivel);
record JogoDTO(string titulo);
record JogoAtualizadoDTO (string titulo, bool disponivel);