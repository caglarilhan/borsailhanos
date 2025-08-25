Setup
1) .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ENCRYPTION_KEY=base64-32bytes
RESEND_API_KEY=...
RESEND_FROM=reminder@mindtrack.app
CRON_SECRET=some-secret

# Google Calendar OAuth (Sprint 2)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google

2) Supabase SQL (owner_id + RLS)
- Run supabase/schema.sql then supabase/policies.sql

3) Dev
cd mindtrack && npm run dev

Cron (Vercel)
- Add a Vercel Cron to call GET /api/reminders daily at 09:00
- Pass header Authorization: Bearer $CRON_SECRET via Vercel Secret / Env

Google Calendar Setup
1. Go to Google Cloud Console
2. Create project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add http://localhost:3000/api/auth/google to authorized redirect URIs
6. Copy Client ID and Secret to .env.local
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
