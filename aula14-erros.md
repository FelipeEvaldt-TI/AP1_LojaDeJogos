
# Aula 14 — Tratamento de erros

## 1. Posicionamento do middleware

O middleware de tratamento de exceções (`UseExceptionHandler`) foi colocado no `Program.cs` logo após `UseDefaultFiles()` e `UseStaticFiles()`, antes do middleware de CORS e da definição das rotas da API.

Ele é responsável por interceptar exceções não tratadas durante o processamento das requisições e retornar uma resposta padronizada ao cliente.

## 2. Teste temporário

Foi adicionada temporariamente a rota `/api/teste-erro`, que lança uma exceção do tipo `InvalidOperationException` com a mensagem "Falha simulada para teste.".

- **Método:** GET
- **Rota:** `/api/teste-erro`
- **Status HTTP esperado:** 500 Internal Server Error
- **Corpo esperado da resposta:**

{
  "mensagem": "Ocorreu um erro interno. Tente novamente mais tarde."
}

O teste confirmou o funcionamento do middleware de tratamento de exceções, que intercepta a falha e retorna uma mensagem padronizada ao cliente, sem expor os detalhes internos da exceção.

## 3. Teste de ID inexistente

- **Método:** GET
- **Rota:** `/api/jogos/{id}` (utilizando um ID inexistente)
- **Status HTTP:** 404 Not Found
- **Resultado:** A API retornou uma resposta indicando que o jogo solicitado não foi encontrado.

Esse resultado ocorre porque a rota verifica se o jogo existe no banco de dados e retorna `Results.NotFound()` quando não encontra o registro.

## 4. Segurança

Não devemos enviar a mensagem bruta da exceção ao cliente, pois ela pode revelar informações internas do sistema, como caminhos de arquivos, detalhes da implementação e dados sensíveis, comprometendo a segurança da aplicação.
