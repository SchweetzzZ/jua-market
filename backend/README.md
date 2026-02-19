# Elysia with Bun runtime
API do Jua Market responsável por:

- Autenticação de usuários
- CRUD de produtos e serviços
- Painel de vendedor
- Painel administrativo
- Controle de permissões (admin e seller)

---

# Stack
- Elysia
- Bun
- Drizzle ORM
- PostgreSQL
- BetterAuth

## Getting Started
bun install na raiz do projeto

## Development
To start the development server run:
```bash
bun run dev
```
# Authentication
o admin guard protege as rotas de admin - deve ser usado antes das rotas que devem ser protegidas. Se quiser algo fora da proteção deixa ACIMA da linha que usa o admin guard(.use(adminGuard))

o seller guard protege as rotas de vendedor - deve ser usado antes das rotas que devem ser protegidas. Se quiser algo fora da proteção deixa ACIMA da linha que usa o seller guard(.use(sellerGuard)) 

# BetterAuth Endpoints
/api/auth/sign-up/email
/api/auth/sign-in/email

Open http://localhost:3000/ with your browser to see the result.