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

## Calendário e pagamento (15 minutos)

Quando um hóspede submete uma reserva:

1. As **datas ficam bloqueadas** no calendário durante **15 minutos**.
2. Recebe o email e envia os dados de pagamento por **WhatsApp**.
3. Se o hóspede pagar a tempo, confirma na área de gestão.
4. Se **não pagar** em 15 min, as datas **libertam-se sozinhas**.

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
