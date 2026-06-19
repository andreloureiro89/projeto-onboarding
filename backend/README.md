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

Criar ficheiro `.env` com base em `.env.example`.

Executar:

```bash
node src/server.js
```

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