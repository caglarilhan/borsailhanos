# Twelve Data Snapshot Scheduler

Canlı fiyat feed’ini düşük bütçeli Twelve Data planında çalıştırmak için `fetch_market_snapshot.py` artık parametre destekliyor ve `run_snapshot_scheduler.py` ile otomatik döngüye alınabiliyor.

## 1. Ortam Değişkenleri

```bash
export TWELVE_DATA_API_KEY=...
export SECRETS_MASTER_KEY=...      # şifreli vault için gerekirse

export SNAPSHOT_INTERVAL_SECONDS=120         # her 2 dakikada bir
export SNAPSHOT_ROTATION="us:6;bist:0"      # önce US (6 sembol), sonra BIST sadece yfinance
export SNAPSHOT_LATEST_LINK="data/snapshots/latest.json"
```

- `SNAPSHOT_ROTATION` formatı: `markets[:budget];...`
  - `markets`: `us`, `bist` veya `us,bist` gibi virgül ayrımlı liste
  - `budget`: (opsiyonel) bu turda Twelve Data’dan kaç sembole öncelik verileceği
- `TWELVE_DATA_SYMBOL_LIMIT` env’i hâlâ genel üst limit olarak kullanılabilir; rota bazındaki bütçe bunu override eder.

## 2. Manuel Çalıştırma

```bash
.venv/bin/python backend/scripts/fetch_market_snapshot.py --markets us --twelvedata-budget 6
.venv/bin/python backend/scripts/fetch_market_snapshot.py --markets bist --twelvedata-budget 0
```

- `--latest-link` (varsayılan `data/snapshots/latest.json`) en güncel dosyaya symlink oluşturur.
- `--output` özel dosya adı belirlemenize imkân verir.

## 3. Sürekli Çalıştırma

```bash
.venv/bin/python backend/scripts/run_snapshot_scheduler.py
```

Scheduler, `SNAPSHOT_ROTATION` dizisini sırayla döner ve her tur arasında `SNAPSHOT_INTERVAL_SECONDS` kadar bekler.

### systemd Servis Örneği

`/etc/systemd/system/bist-snapshot.service`

```
[Unit]
Description=BIST Snapshot Scheduler

[Service]
WorkingDirectory=/opt/borsailhanos
Environment="SNAPSHOT_INTERVAL_SECONDS=120"
Environment="SNAPSHOT_ROTATION=us:6;bist:0;us,bist:4"
ExecStart=/opt/borsailhanos/.venv/bin/python backend/scripts/run_snapshot_scheduler.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Aktifleştirme:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now bist-snapshot.service
```

## 4. Cron Alternatifi

1 dakikalık US + 1 dakikalık BIST turu için:

```
* * * * * cd /opt/borsailhanos && .venv/bin/python backend/scripts/fetch_market_snapshot.py --markets us --twelvedata-budget 6 >> logs/snapshot.log 2>&1
* * * * * sleep 30 && cd /opt/borsailhanos && .venv/bin/python backend/scripts/fetch_market_snapshot.py --markets bist --twelvedata-budget 0 >> logs/snapshot.log 2>&1
```

> Not: Twelve Data free plan dakikada 8 istek sınırına sahip; rota/bütçe ayarlarını bu limiti aşmayacak şekilde yapılandırın.



