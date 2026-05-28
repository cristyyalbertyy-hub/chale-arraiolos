# Chalé do Avô Bedi

Aplicação web de reservas para o Chalé do Avô Bedi em Arraiolos, Alentejo.

## Tecnologias

- [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Resend](https://resend.com/) + API na Vercel para receber pedidos de reserva por email
- [i18next](https://www.i18next.com/) — português, inglês e francês

## Começar

```bash
cd chale-arraiolos
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no browser.

> O envio de reservas por email só funciona com a API (`/api/send-booking`). Em local, use `npx vercel dev` (com as variáveis abaixo) ou faça deploy na Vercel.

## Email de reservas (Resend)

1. Crie conta em [resend.com](https://resend.com) e gere uma **API Key**.
2. Em testes pode usar o remetente `onboarding@resend.dev` (só envia para o email da sua conta Resend até verificar um domínio).
3. Na **Vercel** → projeto → **Settings** → **Environment Variables**, adicione:

| Variável | Exemplo |
| -------- | ------- |
| `RESEND_API_KEY` | `re_...` |
| `BOOKING_TO_EMAIL` | O seu email (onde recebe cada reserva) |
| `BOOKING_FROM_EMAIL` | `Chalé do Avô Bedi <onboarding@resend.dev>` |

4. Faça **Redeploy** (obrigatório após alterar variáveis).

A API de reservas vive em `api/` (código isolado para a Vercel). Ao alterar traduções em `src/i18n/locales/`, o `npm run build` copia-as automaticamente para `api/locales/`.

### Testar a API

Abra no browser (site já publicado na Vercel):

`https://o-seu-dominio.vercel.app/api/health`

Deve aparecer JSON parecido com `{"ok":true,"emailConfigured":true}`. Se vir HTML ou 404, a API não está activa — veja Root Directory abaixo.

### Resolução de problemas

| Sintoma | Solução |
| -------- | -------- |
| Mensagem genérica «contacte-nos por WhatsApp» | Site antigo em cache — faça **Redeploy** do último commit. A versão actual mostra `[503]`, `[502]`, etc. com detalhe. |
| «Não foi possível enviar a reserva» | Confirme os nomes exactos: `RESEND_API_KEY`, `BOOKING_TO_EMAIL`, `BOOKING_FROM_EMAIL`. Faça **Redeploy**. |
| `/api/health` dá 404 ou HTML | Na Vercel → **Settings** → **Root Directory** = `chale-arraiolos` (se o repositório tiver essa pasta). |
| Erro de domínio / remetente | Em testes use `BOOKING_FROM_EMAIL=Chalé do Avô Bedi <onboarding@resend.dev>` |
| Email não chega | Em testes, `BOOKING_TO_EMAIL` tem de ser o **mesmo email da conta Resend** |
| API 404 em local | Normal com `npm run dev` — use `npx vercel dev` ou teste no site publicado |

Cada submissão envia:

- **Para si:** nome, email, telemóvel, datas, adultos/crianças, actividades com preços, total (recalculado no servidor).
- **Para o hóspede:** email de confirmação de que o pedido foi recebido.

Copie `.env.example` para `.env.local` apenas se usar `vercel dev` em local.

## Calendário e pagamento

Quando um hóspede submete uma reserva:

1. **De dia (8h–24h, Lisboa):** as datas ficam bloqueadas **30 minutos**.
2. **De noite (0h–8h):** reserva **congelada** no calendário (roxo) até **8h30** — as datas ficam indisponíveis para outros hóspedes até expirar ou ser confirmada.
3. O **hóspede** recebe um email com resumo (noites, actividades), **dados de pagamento** e prazo.
4. **Você** recebe o email com os dados do hóspede e o ID da reserva — confirme em `/gestao` quando vir o pagamento no banco.
5. Se **não pagar** no prazo, as datas **libertam-se sozinhas**.

### Dados de pagamento no email (Vercel)

**Fase 1** (agora) — só estas três na Vercel:

| Variável | O que põe |
| -------- | --------- |
| `PAYMENT_MBWAY` | Número MB Way, ex. `+351 912 345 678` |
| `PAYMENT_IBAN` | IBAN completo (transferência bancária) |
| `PAYMENT_REVOLUT` | Link `https://revolut.me/…` ou identificador |

**Fase 2** (mais tarde) — quando quiser, acrescente (só aparecem no email se existirem):

| Variável | Uso |
| -------- | --- |
| `PAYMENT_MULTIBANCO` | Instruções Multibanco |

O hóspede vê também a **referência** `CHALE-XXXXXXXX` para indicar na transferência (corresponde ao ID da reserva).

### Automatizar confirmação (opcional)

O banco **não avisa o site** sozinho quando alguém paga. Para um “agente” confirmar em `/gestao`:

1. Configure alertas do **MB Way / banco** para o seu email.
2. Use **n8n**, Make ou similar: “email do banco recebido” → `POST /api/admin-calendar` com `Authorization: Bearer ADMIN_SECRET` e corpo `{ "action": "confirm", "holdId": "…" }` (o ID está no email da reserva e na referência `CHALE-…`).

Confirmação manual em `/gestao` continua sempre disponível.

### Configurar (Vercel)

1. **Storage** → [Upstash Redis](https://vercel.com/marketplace?category=storage&search=redis) → **Connect** ao projecto (cria `KV_REST_API_URL` / `KV_REST_API_TOKEN` ou `UPSTASH_*`).
2. Variável **`ADMIN_SECRET`** — palavra-passe só sua (ex.: uma frase longa aleatória).
3. **Redeploy**.

### Área de gestão (só para si)

Abra no browser:

`https://o-seu-dominio.vercel.app/gestao`

| Botão | O que faz |
| ----- | --------- |
| **Pagamento recebido — manter bloqueado** | Hóspede pagou → datas ficam ocupadas (sem limite de 15 min) |
| **Libertar datas** | Pagamento não veio ou desistiu → datas voltam a estar livres |

O email que recebe inclui o **ID da reserva** e o aviso dos 15 minutos.

Dias bloqueados manualmente (época alta, etc.) estão em `src/data/manualBlockedDates.ts` (e cópia em `api/lib/manual-blocks.ts`).

## Scripts

| Comando           | Descrição                   |
| ----------------- | --------------------------- |
| `npm run dev`     | Servidor de desenvolvimento |
| `npm run build`   | Build de produção           |
| `npm run preview` | Pré-visualizar build        |
| `npm run lint`    | ESLint                      |

## Idiomas

O site está disponível em **PT**, **EN** e **FR**. O selector no menu guarda a preferência no browser.

- Textos da interface: `src/i18n/locales/`
- Email à anfitriã: sempre em português
- Email de confirmação ao hóspede: no idioma seleccionado no site

## Estrutura

```
api/              # Envio de email (Vercel serverless)
src/
├── i18n/         # Traduções e configuração
├── components/   # UI (calendário, actividades, reserva, etc.)
├── data/         # Actividades, datas ocupadas
├── lib/          # Cálculo de preços, envio da reserva
└── pages/        # Página principal
```

A interface é **responsiva** (mobile-first).
