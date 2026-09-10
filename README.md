# API de Catálogo de Jogos

## Nome

**API de Catálogo de Jogos**

## Tema

API REST para gerenciamento de um catálogo de jogos.

## Objetivo

O objetivo da API é permitir **consultar, cadastrar, atualizar e remover jogos** por meio de endpoints HTTP.

Cada jogo possui um **ID**, um **título** e uma informação indicando se está **disponível**.

A API foi desenvolvida em **C# utilizando ASP.NET Core e .NET 10**.

---

## Requisitos

Para executar o projeto, é necessário ter instalado:

- **.NET 10 SDK**
- **Git** (opcional, para clonar o repositório)
- **Bruno** para realizar os testes da API

---

## Como executar o projeto

Após clonar ou baixar o repositório, abra um terminal na pasta do projeto.

### 1. Restaurar as dependências

```bash
dotnet restore
```

### 2. Executar a API

```bash
dotnet run
```

A API será iniciada e ficará disponível localmente.

---

## URL local utilizada nos testes

A URL base utilizada nos testes é:

```text
http://localhost:5214
```

Exemplo:

```text
http://localhost:5214/api/jogos
```

---

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Verifica se a API está funcionando |
| GET | `/api/jogos` | Retorna todos os jogos cadastrados |
| GET | `/api/jogos/{id}` | Retorna um jogo específico pelo ID |
| POST | `/api/jogos` | Cadastra um novo jogo |
| PUT | `/api/jogos/{id}` | Atualiza um jogo existente |
| DELETE | `/api/jogos/{id}` | Remove um jogo pelo ID |

---

## Exemplos de JSON

### POST `/api/jogos`

O endpoint POST recebe o título do novo jogo. O ID é gerado automaticamente e o jogo é cadastrado como disponível.

Exemplo de requisição:

```json
{
  "titulo": "Grand Theft Auto 5"
}
```

Exemplo de resposta:

```json
{
  "id": 3,
  "titulo": "Grand Theft Auto 5",
  "disponivel": true
}
```

### PUT `/api/jogos/{id}`

O endpoint PUT recebe o título e a disponibilidade do jogo que será atualizado.

Exemplo de requisição:

```json
{
  "titulo": "Peak",
  "disponivel": false
}
```

Exemplo de resposta:

```json
{
  "id": 4,
  "titulo": "Peak",
  "disponivel": false
}
```

---

## Dados iniciais

Ao iniciar a aplicação, existem dois jogos cadastrados:

```json
[
  {
    "id": 1,
    "titulo": "Hollow Knight",
    "disponivel": true
  },
  {
    "id": 2,
    "titulo": "Grand Theft Auto 6",
    "disponivel": false
  }
]
```

---

## Armazenamento dos dados

**Os dados ficam somente em memória.**

A API utiliza uma lista (`List<Jogo>`) para armazenar os jogos durante a execução.

Isso significa que os dados cadastrados, atualizados ou removidos **não são persistidos em um banco de dados** e serão perdidos quando a aplicação for encerrada ou reiniciada.

---

## Collection do Bruno

A Collection utilizada para testar os endpoints da API foi criada no **Bruno** e está disponível dentro deste repositório na pasta:

```text
/Bruno
```

A Collection contém as requisições:

- Listar jogos
- Buscar jogo
- Criar jogo
- Atualizar jogo
- Remover jogo

As requisições utilizam a URL local:

```text
http://localhost:5214
```

---

## Tecnologias utilizadas

- **C#**
- **.NET 10**
- **ASP.NET Core Minimal API**
- **JSON**
- **Bruno**
- **Git/GitHub**
