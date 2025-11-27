# Deploy Hazırlık Kontrol Listesi

## ✅ Tamamlananlar

### 1. Altyapı
- [x] Secret vault sistemi (Fernet encryption)
- [x] Twelve Data API entegrasyonu (hibrit: Twelve Data + yfinance fallback)
- [x] Alpaca Paper Trading entegrasyonu
- [x] NextAuth.js kimlik doğrulama sistemi
- [x] Snapshot scheduler (cron-ready)

### 2. Kod Kalitesi
- [x] Legacy mega-component'ler lint'ten hariç tutuldu
- [x] Yeni auth/API dosyalarında tip güvenliği sağlandı
- [x] ESLint config optimize edildi

## ⚠️ Deploy Öncesi Yapılması Gerekenler

### 1. Environment Variables (ZORUNLU)

#### Backend (Python)
```bash
# Secret vault master key (production'da güçlü bir key kullan!)
SECRETS_MASTER_KEY=<32-byte-base64-encoded-key>

# Twelve Data (zaten vault'ta, ama env'den override edilebilir)
TWELVE_DATA_API_KEY=cb0d577285204e839d9ceaf8dd68d303
TWELVE_DATA_SYMBOL_LIMIT=8  # Free plan limit
TWELVE_DATA_BASE_URL=https://api.twelvedata.com

# Alpaca (zaten vault'ta, ama env'den override edilebilir)
ALPACA_API_KEY_ID=PKAWMXAHGASEG7JEJ6RKRP2MRR
ALPACA_API_SECRET=DArRQpRKbvY8RcWrnjEuidU86vxmxhFkXiUBrbKsQWVs
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

#### Frontend (Next.js)
```bash
# NextAuth
NEXTAUTH_SECRET=<güçlü-random-string-32+karakter>
NEXTAUTH_URL=https://yourdomain.com  # Production URL

# Auth kullanıcıları (JSON formatında veya env'ler)
AUTH_USERS_JSON='[{"username":"admin","password":"$2b$10$...","role":"admin"}]'
# VEYA
AUTH_USERS=admin:$2b$10$...:admin,user:$2b$10$...:trader
# VEYA (son çare, bcrypt hash gerekli)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<bcrypt-hash>

# Backend URL (FastAPI)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000  # veya production URL

# Paper Trading API Token
PAPER_API_TOKEN=<random-secure-token>
```

### 2. Dosya İzinleri

```bash
# data/ klasörü yazılabilir olmalı
chmod -R 755 data/
mkdir -p data/snapshots data/datasets logs
chmod -R 755 logs/

# config/secrets.enc dosyası okunabilir olmalı
chmod 644 config/secrets.enc
```

### 3. Database/State Dosyaları

```bash
# Paper trading state
touch data/paper_trading_state.json
chmod 644 data/paper_trading_state.json

# Snapshot latest links
touch data/snapshots/latest_us.json
touch data/snapshots/latest_bist.json
```

### 4. Cron Jobs (Opsiyonel ama Önerilen)

```bash
# Snapshot scheduler'ı çalıştır
# Her 5 dakikada bir US market snapshot (Twelve Data budget: 2)
# Her 5 dakikada bir BIST snapshot (yfinance only)

# Örnek systemd service:
# /etc/systemd/system/bist-snapshot.service
[Unit]
Description=BIST AI Snapshot Scheduler
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/borsailhanos
Environment="SECRETS_MASTER_KEY=..."
Environment="TWELVE_DATA_SYMBOL_LIMIT=8"
Environment="SNAPSHOT_INTERVAL_SECONDS=300"
Environment="SNAPSHOT_ROTATION=us:2;bist:0"
ExecStart=/path/to/.venv/bin/python backend/scripts/run_snapshot_scheduler.py
Restart=always

[Install]
WantedBy=multi-user.target
```

### 5. Build & Test

```bash
# Frontend build test
cd web-app
npm run build

# Backend test (snapshot script)
cd ..
SECRETS_MASTER_KEY=... .venv/bin/python backend/scripts/fetch_market_snapshot.py --markets us --twelvedata-budget 2

# Alpaca connection test
SECRETS_MASTER_KEY=... .venv/bin/python backend/services/alpaca_client.py
```

### 6. Health Checks

```bash
# Frontend health
curl https://yourdomain.com/api/health

# Backend health (FastAPI)
curl http://localhost:8000/

# Auth test
curl -X POST https://yourdomain.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

## 🚨 Bilinen Limitler

1. **Twelve Data Free Plan**: Dakikada 8 API çağrısı limiti var. BIST hisseleri için "Grow plan" gerekiyor (otomatik yfinance fallback çalışıyor).

2. **Alpaca Paper Trading**: Sadece US hisseleri destekleniyor. BIST için mock broker kullanılıyor.

3. **Websockets Versiyonu**: `alpaca-trade-api` ve `yfinance` farklı websockets versiyonları istiyor. Şu an `websockets>=13` kurulu, Alpaca client çalışıyor ama pip uyarısı veriyor.

4. **Legacy Components**: `DashboardV33Inner.tsx` ve diğer mega-component'ler lint'ten hariç tutuldu. İleride refactor edilmeli.

## 📝 Deployment Platform Önerileri

### Railway / Render
- Environment variables'ları platform UI'dan ekle
- Build command: `cd web-app && npm install && npm run build`
- Start command: `cd web-app && npm start` (veya `npm run dev`)

### Vercel (Frontend Only)
- Next.js otomatik deploy
- Environment variables Vercel dashboard'dan ekle
- Backend ayrı bir serviste çalışmalı (Railway/Render)

### Docker
```dockerfile
# Örnek Dockerfile (backend için)
FROM python:3.14-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "backend/fastapi_app.py"]
```

## ✅ Deploy Sonrası Kontroller

1. [ ] Login sayfası açılıyor mu? (`/login`)
2. [ ] Dashboard'a giriş yapılabiliyor mu? (`/dashboard`)
3. [ ] Alpaca hesap bilgileri görünüyor mu? (Broker Integration paneli)
4. [ ] Snapshot'lar oluşuyor mu? (`data/snapshots/` klasörü)
5. [ ] Health endpoint çalışıyor mu? (`/api/health`)
6. [ ] Paper trading emirleri gönderilebiliyor mu?

## 🔐 Güvenlik Notları

1. **SECRETS_MASTER_KEY**: Production'da mutlaka güçlü, rastgele bir key kullan. `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`

2. **NEXTAUTH_SECRET**: En az 32 karakter, rastgele string. `openssl rand -base64 32`

3. **PAPER_API_TOKEN**: API token'lar için güçlü rastgele string.

4. **AUTH_USERS**: Şifreler bcrypt hash'lenmiş olmalı. `node -e "const bcrypt=require('bcryptjs');bcrypt.hash('your-password',10).then(h=>console.log(h))"`

5. **config/secrets.enc**: Git'e commit edilmemeli (zaten `.gitignore`'da).

## 📞 Sorun Giderme

### "SECRETS_MASTER_KEY bulunamadı" hatası
→ Environment variable'ı set et: `export SECRETS_MASTER_KEY=...`

### "NEXTAUTH_SECRET missing" hatası
→ Next.js env'lerini kontrol et, `.env.local` dosyası oluştur.

### Alpaca bağlantı hatası
→ `ALPACA_API_KEY_ID` ve `ALPACA_API_SECRET` doğru mu? Paper trading URL'i kullanılıyor mu?

### Snapshot oluşmuyor
→ `data/snapshots/` klasörü yazılabilir mi? Twelve Data API key geçerli mi?

---

**Son Güncelleme**: 2025-11-25
**Hazırlık Durumu**: ✅ Deploy'a hazır (env'ler set edildikten sonra)
