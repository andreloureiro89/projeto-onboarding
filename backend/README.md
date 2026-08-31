# Nota Importante

O ficheiro .env não é enviado para o GitHub devido a questões de segurança. Por esse motivo, qualquer utilizador que clone o projeto deve criar o ficheiro .env a partir do ficheiro .env.example antes de iniciar o backend.


# NovaTech Onboarding Platform

Plataforma de onboarding corporativo desenvolvida no âmbito da unidade curricular Projeto de Engenharia Informática.

## Tecnologias Utilizadas

### Frontend
- Angular
- TypeScript
- HTML
- CSS

### Backend
- Node.js
- Express.js
- JWT Authentication

### Base de Dados
- MongoDB Atlas
- Mongoose

## Funcionalidades

### Utilizador
- Registo de conta
- Login
- Visualização de módulos de formação
- Consulta de conteúdos
- Realização de quizzes
- Acompanhamento do progresso

### Administrador
- Gestão de utilizadores
- Gestão de módulos
- Gestão de conteúdos
- Gestão de quizzes
- Gestão de perguntas
- Consulta do progresso da equipa
- Reset da plataforma para dados iniciais

## Instalação

### Backend

```bash
cd backend
npm install
```

Criar o ficheiro `.env` a partir de `.env.example` e preencher
`MONGODB_URI` e `JWT_SECRET`. O servidor valida ambas as variáveis no
arranque e termina com erro se alguma estiver em falta.

Popular a base de dados com os dados iniciais:

```bash
npm run seed
```

Iniciar a API:

```bash
npm start
```

## Testes

O backend inclui testes automatizados desenvolvidos com **Jest** e **Supertest**.

Os testes validam as principais partes da API e da lógica do servidor, incluindo:

- Health check da API
- Rotas de autenticação
- Rotas de aprendizagem
- Rotas de administração
- Middleware de autenticação e autorização
- Tratamento global de erros
- Serviços de autenticação
- Serviços de aprendizagem
- Validações de dados

Para executar os testes do backend:

```bash
cd backend
npm test
```

Os testes correm contra repositórios em memória injetados em `buildApp`,
pelo que não necessitam de ligação ao MongoDB nem de ficheiro `.env`.

### Frontend

```bash
cd frontend
npm install
npm start
```

A aplicação ficará disponível em:

```text
http://localhost:4200
```

## Contas de Demonstração

Administrador:

```text
admin@local.test
admin123
```

Utilizador:

```text
user@local.test
user123
```

## Estrutura do Projeto

```text
frontend/
backend/
```

## Autor

André Loureiro – 2300151
Diogo Castelo - 2300036