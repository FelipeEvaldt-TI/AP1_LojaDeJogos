namespace ApiLojaDeJogos.Models;

class JogoEntity
{
  public int Id { get; set; }  
  public string Nome { get; set;} = string.Empty;
  public bool Disponivel { get; set;}
};