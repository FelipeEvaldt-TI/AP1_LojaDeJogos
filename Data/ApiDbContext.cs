namespace ApiLojaDeJogos.Data;
using ApiLojaDeJogos.Models;
using Microsoft.EntityFrameworkCore;

class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }

    public DbSet<JogoEntity> Jogos => Set<JogoEntity>();
};
