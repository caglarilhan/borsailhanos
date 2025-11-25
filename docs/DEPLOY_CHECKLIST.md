# Deploy Checklist

## Environment Variables
- `HEALTH_BASE_URL` → fully-qualified base URL (e.g. `https://app.example.com`).
- `PAPER_API_TOKEN` → secret token required by `/api/broker/orders` and `/api/paper/*`.
- `NEXT_PUBLIC_PAPER_API_TOKEN` (optional) → expose same token to frontend for authenticated fetches.

## File System
- Ensure `data/` and `logs/` directories exist and are writable by the runtime user.
- Initialize empty files if needed:
  - `data/paper_trading_state.json` (or let API create on first use).
  - `logs/ai_order_history.jsonl`, `logs/paper_trades.jsonl` (touch to set permissions).

## Services
- Schedule snapshot scripts (`backend/scripts/fetch_us_market.py`, `backend/scripts/ingest_us_news.py`) via cron or job runner.
- Run StackTuner/ RL jobs with proper logging if required.

## Health Monitoring
- Configure external monitor or ping `/api/health` endpoint.
- Verify `/api/ai/us-sentiment`, `/api/markets/us`, `/api/ai/global-bias` respond over public base URL.

## Security
- Rotate `PAPER_API_TOKEN` per environment.
- If enabling real broker APIs, store credentials in secret manager (not `.env`).
- Enforce HTTPS and configure CSRF/session protection on auth routes.

## Verification
- `npm run build` → ensure no TypeScript/Next errors.
- `npm run lint` (if configured) → ensure clean.
- Smoke test major flows:
  - Dashboard `/dashboard`
  - `/api/health`
  - `/api/paper/portfolio?userId=paper-demo` (with token header)
  - `/api/broker/orders` (token header).
