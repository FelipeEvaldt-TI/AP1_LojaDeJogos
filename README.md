# API de Catálogo de Jogos

## Nome

API de Catálogo de Jogos

## Tema

API REST para gerenciamento de um catálogo de jogos.

## Objetivo

O objetivo do projeto é permitir consultar, cadastrar, atualizar e remover jogos por meio de endpoints HTTP e de uma interface web integrada à API.

Cada jogo possui um identificador único (`id`), um título (`titulo`) e uma informação indicando se está disponível (`disponivel`).

A API foi desenvolvida em C# utilizando ASP.NET Core, .NET 10, Entity Framework Core e SQLite para o armazenamento persistente dos dados.

## Requisitos

Para executar o projeto, é necessário ter instalado:

- .NET 10 SDK
- Git (opcional, para clonar o repositório)
- Bruno ou Postman para realizar os testes da API
- Ferramenta `dotnet-ef` para executar as migrações manualmente, se necessário

## Como executar o projeto

Após clonar ou baixar o repositório, abra um terminal na pasta do projeto, onde está localizado o arquivo `LojaDeJogos.csproj`.

### 1. Restaurar as dependências

```bash
dotnet restore
```

### 2. Preparar o banco de dados

O projeto utiliza SQLite com Entity Framework Core para armazenar os jogos.

Para instalar a ferramenta de migrações, caso ainda não esteja instalada, execute:

```bash
dotnet tool install --global dotnet-ef
```

Se a ferramenta já estiver instalada, mas precisar ser atualizada, utilize:

```bash
dotnet tool update --global dotnet-ef
```

Para criar ou atualizar o banco de dados de acordo com as migrações existentes, execute:

```bash
dotnet ef database update
```

Esse comando aplica as migrações do Entity Framework Core e prepara a estrutura do banco de dados.

### 3. Executar a API

```bash
dotnet run
```

A aplicação será iniciada localmente. Utilize a URL e a porta informadas no terminal.

## URL local utilizada nos testes

A URL base utilizada nos testes é:

`http://localhost:5214`

Exemplos de acesso:

- API: `http://localhost:5214/api/jogos`
- Interface web: `http://localhost:5214/index.html`

A porta pode variar conforme a configuração de execução do projeto.

## Endpoints da API

| Método | Rota | Descrição | Resposta esperada |
|---|---|---|---|
| GET | `/` | Verifica o funcionamento da API ou disponibiliza a interface web, conforme a configuração | `200 OK` |
| GET | `/api/jogos` | Retorna todos os jogos cadastrados | `200 OK` |
| GET | `/api/jogos/{id}` | Busca um jogo pelo ID | `200 OK` ou `404 Not Found` |
| POST | `/api/jogos` | Cadastra um novo jogo | `201 Created` |
| PUT | `/api/jogos/{id}` | Atualiza um jogo existente | `200 OK` ou `404 Not Found` |
| DELETE | `/api/jogos/{id}` | Exclui um jogo pelo ID | `204 No Content` ou `404 Not Found` |

Os códigos HTTP apresentados são os comportamentos esperados para cada operação.

## Exemplos de requisições JSON

### POST `/api/jogos`

O endpoint `POST` cadastra um novo jogo. O identificador é gerado automaticamente pelo banco de dados.

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

O ID apresentado é apenas um exemplo. O valor real depende dos registros existentes no banco de dados.

### PUT `/api/jogos/{id}`

O endpoint `PUT` atualiza as informações de um jogo existente.

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

O ID apresentado é apenas um exemplo. A resposta real depende do registro atualizado.

## Banco de dados e persistência

O projeto utiliza SQLite como banco de dados e Entity Framework Core para realizar as operações de leitura, criação, atualização e exclusão dos jogos.

O `ApiDbContext` representa o contexto de acesso ao banco de dados, enquanto o modelo `Jogo` representa os registros do catálogo.

A configuração da conexão com o banco é realizada por meio do arquivo `appsettings.json`.

As migrações ficam armazenadas na pasta `Migrations` e permitem criar ou atualizar a estrutura do banco de dados.

Diferentemente da versão inicial, que utilizava uma lista em memória (`List<Jogo>`), a versão atual utiliza o SQLite para persistir os registros.

Assim, os jogos cadastrados e atualizados devem continuar disponíveis após reiniciar a aplicação. Da mesma forma, os jogos excluídos não devem reaparecer após a reinicialização.

## Interface web

A interface web do catálogo está localizada na pasta `wwwroot` do projeto ASP.NET Core.

Para acessar a interface:

1. Execute a aplicação com `dotnet run`.
2. Abra o navegador.
3. Acesse `http://localhost:5214/index.html`, utilizando a porta configurada para a aplicação.
4. Utilize a interface para listar, cadastrar, editar e excluir jogos.

A interface deve consumir os endpoints reais da API por meio de requisições HTTP.

As operações realizadas no navegador devem ser gravadas no banco de dados SQLite por meio do Entity Framework Core.

Como a interface é servida pela própria aplicação ASP.NET Core, ela pode utilizar a mesma origem da API, sem precisar iniciar um servidor frontend separado.

## Testes da API com Bruno ou Postman

Antes da integração com a interface web, os endpoints devem ser testados individualmente utilizando Bruno ou Postman.

Os testes devem verificar:

- Listagem de todos os jogos.
- Busca de um jogo pelo ID.
- Retorno `404 Not Found` ao buscar um jogo inexistente.
- Cadastro de um novo jogo com resposta `201 Created`.
- Atualização de um jogo existente com resposta `200 OK`.
- Retorno `404 Not Found` ao atualizar um jogo inexistente.
- Exclusão de um jogo com resposta `204 No Content`.
- Retorno `404 Not Found` ao excluir um jogo inexistente.
- Persistência dos dados após reiniciar a API.

Após os testes individuais, deve ser realizado o teste de ponta a ponta no navegador, verificando se as operações realizadas na interface são refletidas no banco de dados.

## Collection do Bruno

A collection utilizada para testar os endpoints da API pode ser disponibilizada junto ao repositório.

O arquivo `bruno.zip`, presente na raiz do projeto, pode ser utilizado para compartilhar os testes, caso contenha a collection atualizada.

As requisições devem utilizar a URL base configurada para a execução local:

`http://localhost:5214`

A collection deve conter requisições para:

- Listar jogos.
- Buscar jogo por ID.
- Criar jogo.
- Atualizar jogo.
- Remover jogo.

## Tecnologias utilizadas

- C#
- .NET 10
- ASP.NET Core Minimal API
- Entity Framework Core
- SQLite
- JSON
- HTML, CSS e JavaScript para a interface web
- Bruno ou Postman
- Git e GitHub

## Vídeo de demonstração — AP2

O vídeo de demonstração apresentará o funcionamento do projeto, incluindo:

- Execução da aplicação.
- Preparação e utilização do banco de dados SQLite.
- Explicação dos principais elementos do código.
- Testes dos endpoints utilizando Bruno ou Postman.
- Utilização da interface web para listar, cadastrar, editar e excluir jogos.
- Verificação da persistência dos dados após reiniciar a API.

**Link público do vídeo:** será adicionado após a gravação e publicação da demonstração.