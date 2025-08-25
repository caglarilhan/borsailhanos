# MindTrack - Therapist Practice Management SaaS

Complete MVP with Google Calendar OAuth, Zoom link generation, and SMS reminders.

## Features

### ✅ Sprint 1 (MVP)
- **Clients**: CRUD with phone/email fields
- **Appointments**: Scheduling with status management
- **Notes**: SOAP/BIRP/DAP with AES-GCM encryption
- **Billing**: Invoices with CPT codes and status tracking
- **Auth**: Magic link authentication with Supabase
- **Email Reminders**: 24h before appointments (Resend)

### ✅ Sprint 2 (Calendar Integration)
- **Google Calendar OAuth**: Connect and sync appointments
- **Calendar Sync Button**: One-click Google integration
- **OAuth Flow**: Secure token management

### ✅ Sprint 3 (Communication)
- **Zoom Links**: Auto-generate meeting links
- **Google Meet**: Alternative video call option
- **SMS Reminders**: Twilio integration for text notifications
- **Tele Provider Selection**: Zoom, Google Meet, or custom URLs

## Setup

### 1. Environment Variables (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ENCRYPTION_KEY=base64-32bytes

# Email (Resend)
RESEND_API_KEY=...
RESEND_FROM=reminder@mindtrack.app

# SMS (Twilio)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Cron
CRON_SECRET=some-secret

# Google Calendar OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google
```

### 2. Supabase Database
Run SQL files in order:
1. `supabase/schema.sql` - Tables with owner_id + triggers
2. `supabase/policies.sql` - Row Level Security (RLS)

### 3. Development
```bash
cd mindtrack
npm install
npm run dev
```

## API Endpoints

- `GET /api/reminders` - Email reminders for appointments (24h ahead)
- `GET /api/auth/google` - Google OAuth callback

## Database Schema

- **clients**: id, owner_id, name, phone, email, insurance, status
- **appointments**: id, owner_id, client_id, date, time, status, tele_link
- **notes**: id, owner_id, client_id, type, content_encrypted
- **invoices**: id, owner_id, client_id, amount, cpt_code, status
- **files**: id, owner_id, client_id, file_url, type
- **audit_logs**: id, owner_id, action, entity, meta

## Security Features

- **Row Level Security (RLS)**: Users only see their own data
- **AES-GCM Encryption**: Notes content encrypted at rest
- **Owner ID Triggers**: Automatic user association
- **Audit Logging**: Track all data access

## Next Steps (Sprint 4+)

- **AI Note Assistant**: Whisper + GPT integration
- **Multi-language**: EN, TR, DE, FR, ES
- **White-label**: Multi-user clinic mode
- **Outcome Tracking**: PHQ-9, GAD-7, BDI assessments
