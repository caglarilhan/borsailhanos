# Nightly Calibration Scheduler (Stub)

- Trigger endpoint: `GET /api/admin/scheduler/trigger`
  - Queues nightly calibration job (mock)
  - Returns: `{ status: 'queued', job: 'nightly_calibration', queued_at, notes }`

- Status endpoint: `GET /api/admin/scheduler/status`
  - Shows scheduler health and next run time (mock)
  - Returns: `{ scheduler, next_run, last_run, jobs: [{name, cron, enabled}] }`

Cron plan (target):
- Nightly calibration: `30 3 * * *` (03:30 local)
- Data refresh: `*/30 * * * *`

Future (real impl):
- Use `APScheduler` (FastAPI) or `systemd` timer/`cron`
- On trigger: run BO calibrate + refresh meta-ensemble weights and write to store
- Persist last-run summary to `model_validation.db`
