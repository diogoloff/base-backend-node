# 🔐 Projeto Base de Autenticação com Node.js, MySQL e Redis

Este repositório apresenta um projeto backend com autenticação de usuários completo, desenvolvido em Node.js com Express. Ele pode ser utilizado como base para novas aplicações que exijam controle de acesso, segurança com JWT, e persistência de sessões.

- Quer entender um pouco mais veja o video no meu canal [youtube](https://youtu.be/wzqfz0lJr2c)

---

## 📌 Funcionalidades

- Autenticação com JWT (login, cadastro, recuperação de senha)
- Criptografia de senha com Bcrypt + Crypto
- Controle de acesso com Rate Limiting e Redis
- Estrutura modular e extensível
- Envio de e-mails para verificação e recuperação
- Integração com Redis para sessões e bloqueio de IPs

### 📡 Endpoints Disponíveis

#### 🔓 Rotas Públicas

Essas rotas não exigem autenticação com token JWT.

| Método | Endpoint                       | Descrição                             |
|--------|--------------------------------|----------------------------------------|
| POST   | `/usuarios`                   | Cadastro de novo usuário               |
| POST   | `/usuarios/login`             | Autenticação e geração de token        |
| POST   | `/usuarios/ativar`            | Ativação de conta via token            |
| POST   | `/usuarios/novo-token`        | Geração de novo token de ativação      |
| POST   | `/usuarios/solicitar-senha`   | Solicita redefinição de senha via e-mail |
| POST   | `/usuarios/nova-senha`        | Define nova senha usando token         |

#### 🔐 Rotas Protegidas

Essas rotas exigem o envio do token JWT no header `Authorization: Bearer <token>`.

| Método | Endpoint                                | Descrição                                 |
|--------|------------------------------------------|--------------------------------------------|
| GET    | `/usuarios`                             | Lista todos os usuários (Admin)           |
| GET    | `/usuarios/:id`                         | Retorna os dados de um usuário específico |
| PUT    | `/usuarios/:id`                         | Atualiza os dados do usuário              |
| PATCH  | `/usuarios/:id/desativar`               | Desativa conta do usuário                 |
| DELETE | `/usuarios/:id`                         | Exclui usuário (Admin)                    |
| POST   | `/usuarios/logout`                      | Realiza logout da sessão ativa            |

> 💡 Você pode testar essas rotas via Postman ou ferramentas similares. Lembre-se de incluir os headers necessários para as rotas protegidas!
> 
---

## 🧱 Tecnologias Utilizadas

- **Node.js + Express** – Framework principal
- **MySQL + Knex.js** – Banco de dados relacional
- **Redis (via ioredis)** – Cache e controle de segurança
- **JWT (jsonwebtoken)** – Geração e verificação de tokens
- **Bcrypt / Crypto** – Hash e criptografia de dados sensíveis
- **Express-rate-limit / rate-limit-redis** – Proteção contra força bruta
- **Moment.js** – Manipulação de datas
- **CORS** – Controle de origem nas requisições
- **Nodemon** – Monitoramento durante o desenvolvimento

---

## 🗂 Estrutura do Projeto

```bash
├── api/              # Rotas da aplicação (ex: api/usuarios/)
├── config/           # Arquivos de configuração (middleware, banco, Redis)
├── db/               # Scripts SQL para criação das tabelas
├── schemas/          # Schemas JSON de validação
├── tasks/            # Tarefas automatizadas
├── utils/            # Helpers e funções utilitárias
```

> ⚠️ **Atenção:** Os arquivos da pasta tasks, eles estão embutidos na aplicação, porem seria ideal os mesmos serem serviços a parte, visto que em caso de volume poderiam gerar alguma lentidão na aplicação.

---

## 🛢 Banco de Dados

Este projeto utiliza **MySQL** como banco de dados principal. Os scripts SQL estão disponíveis na pasta `db/`, contendo a estrutura completa de tabelas necessárias para o funcionamento da aplicação. 

> ⚠️ **Atenção**: este projeto **não utiliza migrations**. O banco de dados deve ser **criado manualmente** antes de iniciar a aplicação.

### Tabelas incluídas:

| Tabela                   | Finalidade                                                         |
|--------------------------|---------------------------------------------------------------------|
| `usuarios`               | Cadastro de usuários (nome, email, senha, etc.)                    |
| `usuariostokens`         | Armazena tokens de verificação e recuperação de senha              |
| `usuariostokenssessao`   | Controla sessões ativas e reforça a segurança em múltiplos logins  |

---

## ⚙️ Requisitos

Certifique-se de ter as seguintes dependências instaladas para rodar o projeto:

- [Node.js](https://nodejs.org/) 18+
- [MySQL Server](https://dev.mysql.com/downloads/)
- [Redis](https://redis.io/) (pode ser instalado localmente ou via Docker)
- Docker (opcional, mas recomendado para ambiente padronizado)

---

## 🐳 Exemplo de Setup com Docker

Abaixo, um exemplo rápido para subir o ambiente com MySQL e Redis usando containers:

### MySQL

```bash
docker run --name mysql-auth \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=nome-bd \
  -e MYSQL_USER=usuario-bd \
  -e MYSQL_PASSWORD=pass-bd \
  -p 3306:3306 \
  -d mysql:8
```

### Redis

```bash
docker run --name redis-auth \
  -p 6379:6379 \
  -d redis
```

---

## ▶️ Como Rodar Localmente

Siga os passos abaixo para executar o projeto em ambiente local:

### 1. Clone o repositório

```bash
git clone https://github.com/diogoloff/base-backend-node.git
cd base-backend-node
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o arquivo .env
```bash
# Configuração do Banco de Dados
DB_HOST=localhost
DB_USER=usuario-bd
DB_PASSWORD=pass-bd
DB_NAME=nome-bd
DB_PORT=3306

# Chaves e Segurança
CHAVE_SECRETA=chave-da-senha
JWT_SECRET=chave-jwt
DEBUG=S

# API
SERVER_PORT=3000
CORS_ORIGIN=*
ORIGEM=http://localhost:3000

# Email (SMTP)
EMAIL_HOST=smtp.provedor.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=email@provedor.com
EMAIL_PASS=senha-email
EMAIL_FROM="Minha Aplicação <email@provedor.com>"

# Identidade da Aplicação
APP_NOME="Minha Aplicação"
```

### 4. Configure o banco de dados

Execute os arquivos SQL que estão na pasta db/ para criar manualmente as tabelas necessárias no MySQL.

### 5. Inicie o Redis

Você pode usar o Redis localmente ou via Docker:
```bash
docker run --name redis-auth -p 6379:6379 -d redis
```

### 6. Execute a aplicação

Você pode usar o Redis localmente ou via Docker:
```bash
npm run dev
```

A aplicação será iniciada na porta definida em SERVER_PORT (padrão: http://localhost:3000).

---

## 📬 Contato e Contribuição

Este projeto foi desenvolvido com o intuito de servir como base para aplicações Node.js com autenticação robusta e escalável. Se você encontrou algum problema, tem sugestões ou deseja contribuir de alguma forma, sinta-se bem-vindo!

- 💡 Sugestões de melhoria ou novas funcionalidades são muito bem-vindas
- 🐞 Encontrou um bug? Abra uma [issue](https://github.com/diogoloff/base-backend-node/issues)
- 🚀 Quer colaborar? Envie um [pull request](https://github.com/diogoloff/base-backend-node/pulls)
- 📥 Para dúvidas diretas, entre em contato por e-mail: [diogoloff@gmail.com](mailto:diogoloff@gmail.com)

Vamos construir algo incrível juntos! 💙

---


