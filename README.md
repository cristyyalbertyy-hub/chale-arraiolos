# Chalé Arraiolos

Aplicação web de reservas para um chalé em Arraiolos, Alentejo.

## Tecnologias

- [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Google Forms](https://www.google.com/forms/about/) para receber pedidos de reserva

## Começar

```bash
cd chale-arraiolos
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no browser.

## Google Forms

Quando tiveres o formulário Google:

1. Cria um formulário com um campo de **texto longo** (resumo da reserva).
2. Clica em **Enviar** → ícone de link → copia o URL que termina em `/formResponse`.
3. Para o `entry` ID: **⋮** → *Obter link pré-preenchido* → preenche o campo → copia da URL `entry.XXXXXXXX`.
4. Cria `.env.local`:

```env
VITE_GOOGLE_FORM_ACTION_URL=https://docs.google.com/forms/d/e/.../formResponse
VITE_GOOGLE_FORM_ENTRY_RESUMO=entry.1234567890
```

5. Na Vercel, adiciona as mesmas variáveis `VITE_*` e faz **Redeploy**.

Cada submissão envia: nome, email, telemóvel, datas, adultos/crianças, actividades e total.

## Scripts

| Comando           | Descrição                   |
| ----------------- | --------------------------- |
| `npm run dev`     | Servidor de desenvolvimento |
| `npm run build`   | Build de produção           |
| `npm run preview` | Pré-visualizar build        |
| `npm run lint`    | ESLint                      |

## Estrutura

```
src/
├── components/   # UI (calendário, actividades, reserva, etc.)
├── config/       # Configuração Google Forms
├── data/         # Actividades, datas ocupadas
├── lib/          # Cálculo de preços, envio ao Google Forms
└── pages/        # Página principal
```

A interface é **responsiva** (mobile-first).
