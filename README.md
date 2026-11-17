# Fakret Mashrou (`fakret-mashrou-final-`) — Arabic Startup & Investor Platform

A full-stack Next.js 16 and Supabase platform (`arabic-platform`) connecting founders with investors, featuring idea submissions, KYC verification, funding progress tracking, leaderboards, and Stripe checkout.

## Executive Summary & Purpose
`fakret-mashrou-final-` enables entrepreneurs to pitch business ideas, track funding milestones, and connect with verified investors. It includes rate-limited APIs (`@upstash/ratelimit`), structured logging (`pino`), and interactive analytics (`recharts`).

## Core Functionality & Features
- **Founder & Investor Flows**: Dedicated portals (`/for-founders`, `/for-investors`, `/investors`), idea submission (`/add-idea`), discovery (`/discover`), and `/leaderboard`.
- **Trust & Compliance**: `/kyc` verification and `/funding-progress` tracking.
- **Payments & Analytics**: Stripe `/checkout`, `recharts` visualizations, `@vercel/analytics`, and `@vercel/speed-insights`.
- **Content & Admin**: `/blog`, `/about`, `/how-it-works`, `/contact`, `/dashboard`, and `/admin`.

## Architecture & Tech Stack
- **Framework**: Next.js 16 (`16.2.3`) App Router & React 19 (`19.2.4`)
- **Backend & Security**: Supabase (`@supabase/ssr`), `@upstash/ratelimit`, `isomorphic-dompurify`, `zod`
- **Payments & Logging**: `stripe`, `pino`, `pino-pretty`
- **UI**: `@base-ui/react`, `shadcn`, `recharts`, `sonner`, Tailwind CSS 4
- **Testing**: Playwright (`@playwright/test`)

## Getting Started

```bash
git clone https://github.com/islamsamyy/fakret-mashrou-final-.git
cd fakret-mashrou-final-
npm install
npm run dev
```

### Available Scripts
| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
