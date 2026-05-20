# Chalé Arraiolos

Aplicação web de reservas para um chalé em Arraiolos, Alentejo.

## Tecnologias

- [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Stripe Checkout](https://stripe.com/docs/checkout)
- API serverless na [Vercel](https://vercel.com/)

## Começar

```bash
cd chale-arraiolos
npm install
cp .env.example .env.local
# Edite .env.local com as chaves Stripe (modo teste)
npm run dev:vercel
```

Abra [http://localhost:3000](http://localhost:3000) (Vercel Dev serve o frontend e `/api`).

Alternativa só frontend (sem pagamento): `npm run dev` em [http://localhost:5173](http://localhost:5173).

## Stripe

1. Crie uma conta em [dashboard.stripe.com](https://dashboard.stripe.com).
2. Copie a **chave publicável** (`pk_test_…`) e a **chave secreta** (`sk_test_…`).
3. Preencha `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_URL=http://localhost:3000
```

4. Na Vercel (produção), adicione as mesmas variáveis em *Settings → Environment Variables*.

Após o pagamento, o Stripe redireciona para `/obrigado`.

## Scripts

| Comando              | Descrição                              |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Só frontend (Vite)                       |
| `npm run dev:vercel` | Frontend + API Stripe (recomendado)    |
| `npm run build`      | Build de produção                      |
| `npm run preview`    | Pré-visualizar build                   |
| `npm run lint`       | Verificar código com ESLint            |

## Estrutura

```
api/              # Funções serverless Vercel (Stripe Checkout)
src/
├── components/   # UI (Header, Hero, formulário de reserva, etc.)
├── pages/        # Home e página Obrigado
├── providers/    # StripeProvider (@stripe/react-stripe-js)
├── data/         # Dados estáticos
├── lib/          # Lógica de reservas, Stripe client
└── types/        # Tipos TypeScript
```

A interface é **responsiva** (mobile-first) com menu hamburger em ecrãs pequenos.
