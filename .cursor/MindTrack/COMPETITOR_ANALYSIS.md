# Competitor Analysis – MindTrack

Last updated: 2025-10-09

## Official Links
- SimplePractice: features https://www.simplepractice.com/features | pricing https://www.simplepractice.com/pricing
- TherapyNotes: features https://www.therapynotes.com/features/ | pricing https://www.therapynotes.com/pricing/
- TheraNest: features https://www.theranest.com/features/ | pricing https://www.theranest.com/pricing/
- Jane App: features https://jane.app/guide/what-is-jane/features | pricing https://jane.app/pricing | telehealth https://jane.app/telehealth
- TheraPlatform: features https://www.theraplatform.com/features | pricing https://www.theraplatform.com/pricing
- Carepatron: features https://www.carepatron.com/features | pricing https://www.carepatron.com/pricing

## Feature Matrix (H = Has; S = Strong; M = Medium; L = Limited; – = Absent)

| Capability | MindTrack | SimplePractice | TherapyNotes | TheraNest | Jane |
|---|---|---|---|---|---|
| Client management | S | S | S | S | S |
| Calendar & self‑scheduling | S (new) | S | M | S | S |
| Waitlist automation | S (new) | M | L | M | M |
| Telehealth | M (needs Pro add‑ons) | S | M (3rd‑party) | M | S |
| Secure messaging | S (new) | S | L | M | M |
| Forms builder + e‑signature | S (new) | S | M | M | S |
| Assessments (PHQ‑9/GAD‑7/PCL‑5) | S | M | M | M | M |
| Billing (self‑pay) | M | S | S | S | S |
| Insurance/claims (837/835/ERA) | L (gap) | M | S | S | L |
| No‑show automation + card vault | S (new) | S | M | M | M |
| Analytics/BI | M | M | M | M | M |
| Mobile apps | L (PWA) | S | M | M | S |
| Integrations (Google/Twilio/etc.) | S | S | S | M | M |
| Compliance (HIPAA/RLS/Audit) | S | S | S | M | S |

Notes:
- MindTrack strengths: newly added self‑scheduling+waitlist, secure messaging, ROMs, e‑signature, no‑show automation.
- Key gap: payer billing (clearinghouse EDI 837/835, eligibility, ERA auto‑posting), Telehealth Pro enhancements, mobile.

## SWOT

### SimplePractice
- Strengths: integrated telehealth, polished UX, broad templates, mobile apps
- Weaknesses: higher total cost with add‑ons; limited deep payer workflows
- Opportunities: advanced analytics; AI‑assisted documentation
- Threats: TherapyNotes payer depth; Jane’s UX and SMB growth

### TherapyNotes
- Strengths: insurance workflows, structured notes/treatment plans, support
- Weaknesses: limited portal messaging; telehealth via 3rd‑party; customization limits
- Opportunities: embedded telehealth; modern form builder; automation
- Threats: SimplePractice/Jane experience; newcomer AI features

### Jane
- Strengths: excellent UX, telehealth, mobile, multi‑discipline
- Weaknesses: US mental‑health payer depth moderate; behavior‑health specifics
- Opportunities: deeper mental‑health templates; insurance flows
- Threats: incumbents’ BH specialization; price pressure

## Gap & Opportunity Map (MindTrack)
- High impact, near‑term (≤4 weeks)
  - Telehealth Pro: waiting room customization, group session tools, recording consent/policy
  - Financial reports: A/R aging, claim funnel (self‑pay now, hooks for payers)
  - Messaging upgrades: read receipts, scheduled messages, attachment scanning
- High impact, mid‑term (6–12 weeks)
  - Clearinghouse EDI 837/835, eligibility checks, ERA auto‑posting
  - Native mobile (or PWA hardening + push + offline forms)

## 4–12 Week Close Plan (Draft)
- Weeks 1–2
  - Telehealth Pro v1 (waiting room branding, group session roster, consent log)
  - Analytics: A/R aging, no‑show heatmap, provider utilization widgets
- Weeks 3–4
  - Messaging v2: read/delivered, scheduled sends, retention policies, S3 virus scan
  - Forms v2: template gallery, publish/version workflows
- Weeks 5–8
  - Payer groundwork: eligibility API adapter, claim scrubbing service skeleton
  - ERA ingestion pipeline design; mapping to invoices/payments
- Weeks 9–12
  - 837/835 pilot via clearinghouse; ERA auto‑posting MVP
  - Mobile/PWA uplift: install prompts, offline intake, push notifications

## KPIs to Track
- Self‑scheduling conversion, waitlist fill rate, no‑show rate, time‑to‑note, DSO, first‑pass claim rate (when payers go live)
