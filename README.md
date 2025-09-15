# FinTrack

Full-stack personal expense tracking application built with Next.js + TypeScript, Tailwind CSS and MongoDB.

This README documents how to get the project running locally, explains the main architecture, lists key scripts and environment variables, and gives tips for development and deployment.

## Table of contents

- Project overview
- Tech stack
- Features
- Repo structure
- Getting started (development)
- Environment variables
- Database & migration notes
- Scripts
- Styling & components
- Deployment
- Troubleshooting
- Contributing

## Project overview

FinTrack is a web app that helps you record, categorize and visualize your daily expenses. The app includes account management (register/login/verify email), categories, payment sources, transactions, charts and basic analytics.

This repository uses the Next.js (app router) framework with server actions and API routes in the `src/app` and `server` directories. The backend stores data in MongoDB via Mongoose models found under `src/models`.

## Tech stack

- Framework: Next.js (app router) + React + TypeScript
- Styling: Tailwind CSS (+ tailwind-merge, tailwindcss-animate)
- UI primitives: Radix + shadcn-style components (see `components.json`) and custom components in `src/components/ui`
- State & data fetching: @tanstack/react-query
- Forms & validation: Formik + Yup
- Charts: Recharts
- Icons: lucide-react
- Database: MongoDB with mongoose (server side)
- Email: nodemailer (server side)
- Authentication/session: custom server code (`src/lib/session.ts` / server actions)
- Utilities: axios, moment, sonner (toasts)

## Main features

- User registration, login, email verification and profile
- CRUD for categories and payment sources
- Transaction recording with categories, date, amount and source
- Dashboard charts and summaries (top categories, sources, monthly cards)
- Responsive UI with desktop sidebar and mobile navigation patterns

## Repository structure (high level)

- `src/app` — Next.js app router pages and global layout(s)
  - `(pages)` — application pages (dashboard, profile, transactions, etc.)
- `src/components` — reusable React components (ui primitives, charts, forms, wrappers)
- `src/server` — server actions & API implementations used by server components
- `src/models` — Mongoose models for User, Transaction, Category, Source
- `src/lib` — helper utilities: `mongodb.ts`, `mailService.ts`, `session.ts`, etc.
- `src/hooks` — custom React hooks
- `public` — static assets (icons, manifest, images)
- `components.json` — shadcn component generator config
- `tailwind.config.ts` — Tailwind configuration

## Getting started (development)

Prerequisites

- Node.js (recommended 18+), npm
- MongoDB (local or remote Atlas cluster)

Steps

1. Clone the repo

```powershell
git clone <repository-url>
cd expense-tracker
```

2. Install dependencies

```powershell
npm install
```

3. Create environment file `.env.local` in project root with required variables (see next section)

4. Start the development server

```powershell
npm run dev
```

5. Open http://localhost:3000 in your browser

## Environment variables

Create `.env.local` in project root and fill values. Typical values used by this project (may vary depending on your environment):

- `MONGODB_URI` — MongoDB connection string (mongodb+srv://... or mongodb://...)
- `NEXTAUTH_URL` or `NEXT_PUBLIC_BASE_URL` — optional, if used for absolute links
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — for transactional email (nodemailer)
- `JWT_SECRET` — secret used for tokens/sessions (if used)
- `NEXT_PUBLIC_*` — any public client-side environment variables begin with NEXT*PUBLIC*

Notes

- Do not commit `.env.local` to source control. Use platform secret storage for production deployments.

## Database & models

- This project uses MongoDB with Mongoose. Model files are in `src/models`.
- No migrations system is bundled — when you change model shapes, handle migrations manually or via a migration tool.

## Scripts

From `package.json`:

- `npm run dev` — run Next.js in development mode
- `npm run build` — build for production
- `npm run start` — start production server (after build)
- `npm run lint` — run Next.js / ESLint checks

## Styling & components

- Tailwind CSS is configured in `tailwind.config.ts` and global styles are in `src/app/globals.css`.
- UI primitives and components are under `src/components/ui` following shadcn patterns (cards, buttons, inputs, sheets, dropdowns).
- Component generator config is `components.json` (shadcn config).

## Tests

- No unit or integration tests are included by default. Recommended quick additions:
  - Jest or Vitest for unit tests
  - React Testing Library for component tests
  - Cypress or Playwright for end-to-end tests

## Deployment

Recommended: Vercel (native support for Next.js)

1. Push your branch to GitHub (or Git provider)
2. Create a new Vercel project and link the repository
3. Add environment variables in the Vercel dashboard (same keys as `.env.local`)
4. Set the build command to `npm run build` and the output directory is handled by Next.js automatically

Other options: Deploy to a Node host or container. If self-hosting, build (`npm run build`) and run `npm run start` with a process manager (PM2, systemd) behind a reverse proxy.

## Troubleshooting

- If pages fail to connect to the DB, ensure `MONGODB_URI` is correct and accessible.
- If you see ESLint/TypeScript warnings about versions, ensure your local TypeScript version matches project expectations. The repo may have newer TypeScript than some ESLint parsers support.
- For email sending, verify SMTP credentials and allow less-secure settings if required by provider (or use a transactional email provider like SendGrid/Mailgun).

## Contributing

- Fork the repository and send pull requests for fixes or features.
- Keep changes small and focused. Add tests where appropriate.
- Update this README when adding significant architecture or setup changes.

## Notes for maintainers

- UI: The project uses a mixture of Radix + shadcn-styled UI primitives; if you want a complete redesign (modern look + sidebar navigation), focus on updating the app layout(s) under `src/app` and central navigation components under `src/components/common`.
- Server actions: Look under `src/server/actions` for server-side logic grouped by feature (category, profile, register, transaction, etc.).

## License

No license file included in the repository. Add a `LICENSE` file if you intend to open-source this project.

---

If you want, I can:

- generate a short developer quickstart cheat-sheet for contributors,
- add recommended GitHub workflows for CI (lint/build/test), or
- implement a visual theme update (complete conversion to a sidebar-based UI across all pages).

Tell me which of those you'd like next.
