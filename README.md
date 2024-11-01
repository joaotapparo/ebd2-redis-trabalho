# Relatório do Projeto

## Solução Implementada

### Descrição

Este projeto implementa um sistema de gerenciamento de produtos utilizando Node.js, Express, MySQL e Redis. A solução foi projetada para garantir que os dados dos produtos sejam armazenados e recuperados de forma eficiente, utilizando o cache Redis para melhorar o desempenho das consultas.

Video demonstrativo do projeto: https://www.youtube.com/watch?v=aFdUHESltZQ

### Funcionalidades

1. **Adicionar Produto**: Um produto pode ser adicionado ao banco de dados e ao cache Redis.
2. **Atualizar Produto**: Um produto existente pode ser atualizado no banco de dados e no cache Redis.
3. **Excluir Produto**: Um produto pode ser excluído do banco de dados e removido do cache Redis.
4. **Obter Todos os Produtos**: Todos os produtos são recuperados do cache Redis. Se não estiverem no cache, são buscados no banco de dados e armazenados no cache.
5. **Obter Produto por ID**: Um produto específico é recuperado do cache Redis. Se não estiver no cache, é buscado no banco de dados e armazenado no cache.

### Implementação

#### ProdutosRepository.ts

- **Método `create`**: Insere um novo produto no banco de dados, armazena-o no cache Redis e invalida o cache de todos os produtos.
- **Método `update`**: Atualiza um produto existente no banco de dados, atualiza-o no cache Redis e invalida o cache de todos os produtos.
- **Método `delete`**: Exclui um produto do banco de dados, remove-o do cache Redis e invalida o cache de todos os produtos.
- **Método `getAll`**: Recupera todos os produtos do cache Redis. Se não estiverem no cache, busca no banco de dados e armazena no cache.
- **Método `getById`**: Recupera um produto específico do cache Redis. Se não estiver no cache, busca no banco de dados e armazena no cache.
- **Método `initCache`**: Inicializa o cache ao iniciar o servidor, carregando todos os produtos do banco de dados para o cache.

#### server.ts

- Define as rotas para adicionar, atualizar, excluir e obter produtos.
- Inicializa o cache ao iniciar o servidor.

## Problemas que a Solução Não Resolve

1. **Sincronização Manual do Banco de Dados**: Se o banco de dados for manipulado manualmente, o cache Redis não será automaticamente atualizado, o que pode levar a inconsistências entre o banco de dados e o cache.
2. **Escalabilidade**: A solução atual pode não escalar bem para um grande número de produtos ou um alto volume de requisições sem ajustes adicionais, como particionamento de cache ou balanceamento de carga.

## Resultados Observados

- **Desempenho**: O uso do cache Redis melhora significativamente o desempenho das consultas, especialmente para a recuperação de todos os produtos.
- **Consistência**: A solução garante que as operações de criação, atualização e exclusão mantenham o cache Redis consistente com o banco de dados, desde que as operações sejam realizadas através da aplicação.

## Pergunta: Sincronização do Redis após Manipulação Manual do Banco de Dados

### Resposta

Se o banco de dados for manipulado manualmente, o sistema pode ficar comprometido devido à inconsistência entre o banco de dados e o cache Redis. Para sincronizar o Redis novamente após uma edição manual dos dados diretamente no MySQL, você pode seguir os seguintes passos:

1. **Reinicializar o Cache**: Uma abordagem simples é reinicializar o cache Redis ao reiniciar o servidor. Isso pode ser feito chamando o método `initCache` novamente, que recarrega todos os produtos do banco de dados para o cache.

2. **Endpoint de Sincronização**: Implementar um endpoint específico para sincronizar o cache Redis com o banco de dados. Este endpoint pode ser chamado manualmente ou programaticamente para garantir que o cache esteja atualizado.
