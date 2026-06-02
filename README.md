# NovaTech Onboarding Platform

## Descrição

A NovaTech Onboarding Platform é uma aplicação web desenvolvida no âmbito da unidade curricular Projeto de Engenharia Informática.

O sistema permite gerir o processo de integração de novos colaboradores através da disponibilização de módulos de formação, conteúdos multimédia, questionários de avaliação e acompanhamento de progresso.

A aplicação inclui dois perfis de utilizador:

- Utilizador (colaborador)
- Administrador

---

## Tecnologias Utilizadas

### Frontend

- Angular 20
- TypeScript
- HTML5
- CSS3

### Backend

- Node.js
- Express.js
- JWT Authentication
- bcryptjs

### Base de Dados

- MongoDB Atlas
- Mongoose

---

## Funcionalidades

### Utilizador

- Registo de conta
- Autenticação com JWT
- Consulta de módulos de formação
- Visualização de conteúdos
- Realização de quizzes
- Acompanhamento do progresso individual

### Administrador

- Gestão de utilizadores
- Gestão de módulos
- Gestão de conteúdos
- Gestão de quizzes
- Gestão de perguntas
- Consulta do progresso da equipa
- Reposição da plataforma para o estado inicial

---

## Estrutura do Projeto

```text
frontend/
backend/
```

---

## Instalação

### 1. Clonar o projeto

```bash
git clone <repositorio>
```

### 2. Backend

```bash
cd backend
npm install
```

Criar o ficheiro `.env` com base em `.env.example`.

Executar o seed inicial:

```bash
node src/data/seedMongo.js
```

Iniciar o servidor:

```bash
node src/server.js
```

Backend disponível em:

```text
http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend disponível em:

```text
http://localhost:4200
```

---

## Contas de Demonstração

### Administrador

Email:

```text
admin@local.test
```

Password:

```text
admin123
```

### Utilizador

Email:

```text
user@local.test
```

Password:

```text
user123
```

---

## Base de Dados

A aplicação utiliza MongoDB Atlas para armazenamento persistente de:

- Utilizadores
- Módulos
- Conteúdos
- Quizzes
- Perguntas
- Progresso
- Tentativas de quiz
- Conclusão de conteúdos

---

## Variáveis de Ambiente

Exemplo:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:4200
JWT_SECRET=change_this_secret
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/novatech
```

---

## Autores

André Loureiro – 2300151

Diogo Castelo – 2300036

---

## Licença

Projeto académico desenvolvido para fins educativos.
