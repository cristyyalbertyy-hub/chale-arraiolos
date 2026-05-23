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

4. Faça **Redeploy**.

Cada submissão envia:

- **Para si:** nome, email, telemóvel, datas, adultos/crianças, actividades com preços, total (recalculado no servidor).
- **Para o hóspede:** email de confirmação de que o pedido foi recebido.

Copie `.env.example` para `.env.local` apenas se usar `vercel dev` em local.

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
