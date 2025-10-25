# BIST AI Smart Trader - Deployment Guide

## 🚀 Production Deployment Guide

Bu rehber, BIST AI Smart Trader'ı production ortamında deploy etmek için gerekli tüm adımları içerir.

---

## 📋 Ön Gereksinimler

### Sistem Gereksinimleri
- **OS**: Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+
- **RAM**: Minimum 4GB, Önerilen 8GB+
- **CPU**: Minimum 2 core, Önerilen 4 core+
- **Disk**: Minimum 20GB boş alan
- **Network**: Port 80, 443, 8000-8004, 8081, 3000, 3010, 9090 açık

### Yazılım Gereksinimleri
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18.0+ (development için)
- **Python**: 3.9+ (development için)
- **Git**: 2.30+

---

## 🔧 Kurulum Adımları

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/your-username/borsailhanos.git
cd borsailhanos
```

### 2. Environment Variables Ayarlayın

```bash
# Production environment dosyası oluşturun
cp .env.example .env.production

# Environment variables'ları düzenleyin
nano .env.production
```

**Önemli Environment Variables:**

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_REALTIME_URL=wss://api.yourdomain.com/ws

# Database
DATABASE_URL=sqlite:///./bist_ai.db

# Security
JWT_SECRET_KEY=your-super-secret-jwt-key-here
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_PUBLIC_KEY=your-vapid-public-key

# External APIs
YFINANCE_ENABLED=true
FINNHUB_API_KEY=your-finnhub-api-key
NEWS_API_KEY=your-news-api-key

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
```

### 3. SSL Sertifikası Kurulumu

#### Let's Encrypt ile SSL (Önerilen)

```bash
# Certbot kurulumu
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası alın
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Otomatik yenileme
sudo crontab -e
# Şu satırı ekleyin:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Manuel SSL Sertifikası

```bash
# Sertifika dosyalarınızı şu konuma koyun:
# /etc/ssl/certs/yourdomain.com.crt
# /etc/ssl/private/yourdomain.com.key
```

### 4. Nginx Reverse Proxy Kurulumu

```bash
# Nginx kurulumu
sudo apt install nginx

# Nginx konfigürasyonu
sudo nano /etc/nginx/sites-available/bist-ai
```

**Nginx Konfigürasyonu:**

```nginx
# Frontend
server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API Backend
server {
    listen 80;
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Grafana
server {
    listen 80;
    listen 443 ssl http2;
    server_name grafana.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Nginx'i etkinleştirin
sudo ln -s /etc/nginx/sites-available/bist-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🐳 Docker ile Deployment

### 1. Docker Compose ile Deploy

```bash
# Production modunda başlatın
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Logları kontrol edin
docker-compose logs -f

# Servis durumunu kontrol edin
docker-compose ps
```

### 2. Docker Compose Production Override

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    environment:
      - APP_ENV=production
      - LOG_LEVEL=warning
    restart: always
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'

  frontend:
    environment:
      - NODE_ENV=production
    restart: always
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'

  grafana:
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    restart: always
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push images
      uses: docker/build-push-action@v3
      with:
        context: .
        push: true
        tags: |
          your-username/bist-ai-backend:latest
          your-username/bist-ai-frontend:latest
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/bist-ai
          git pull origin main
          docker-compose down
          docker-compose pull
          docker-compose up -d
```

---

## 📊 Monitoring ve Logging

### 1. Log Management

```bash
# Log dosyalarını kontrol edin
tail -f logs/bist_ai.log
tail -f logs/realtime_server.log
tail -f logs/auto_retrain.log

# Log rotation ayarlayın
sudo nano /etc/logrotate.d/bist-ai
```

**Logrotate Konfigürasyonu:**

```
/opt/bist-ai/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        docker-compose restart backend realtime
    endscript
}
```

### 2. System Monitoring

```bash
# System monitoring kurulumu
sudo apt install htop iotop nethogs

# Service monitoring
sudo systemctl enable docker
sudo systemctl enable nginx

# Disk usage monitoring
df -h
du -sh /opt/bist-ai/*
```

### 3. Grafana Dashboard

1. **Grafana'ya erişin**: https://grafana.yourdomain.com
2. **Login**: admin / admin123
3. **Data Source ekleyin**: Prometheus (http://prometheus:9090)
4. **Dashboard import edin**: BIST AI Dashboard JSON

---

## 🔒 Güvenlik

### 1. Firewall Ayarları

```bash
# UFW kurulumu
sudo ufw enable

# Gerekli portları açın
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8000:8004/tcp  # API services
sudo ufw allow 8081/tcp  # WebSocket
sudo ufw allow 3010/tcp # Grafana
sudo ufw allow 9090/tcp # Prometheus

# Status kontrol
sudo ufw status
```

### 2. SSL/TLS Güvenliği

```bash
# SSL konfigürasyonu güçlendirin
sudo nano /etc/nginx/sites-available/bist-ai
```

**SSL Güvenlik Ayarları:**

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
```

### 3. API Güvenliği

```python
# backend/middleware/security.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer
import jwt

security = HTTPBearer()

async def verify_token(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## 🚀 Performance Optimization

### 1. Database Optimization

```python
# SQLite optimizasyonu
import sqlite3

def optimize_database():
    conn = sqlite3.connect('bist_ai.db')
    cursor = conn.cursor()
    
    # WAL mode
    cursor.execute('PRAGMA journal_mode=WAL')
    
    # Cache size
    cursor.execute('PRAGMA cache_size=10000')
    
    # Synchronous mode
    cursor.execute('PRAGMA synchronous=NORMAL')
    
    # Vacuum
    cursor.execute('VACUUM')
    
    conn.close()
```

### 2. Caching

```python
# Redis cache kurulumu
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(expiration=300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            redis_client.setex(cache_key, expiration, json.dumps(result))
            
            return result
        return wrapper
    return decorator
```

### 3. Load Balancing

```nginx
# Nginx load balancer
upstream backend {
    server localhost:8000;
    server localhost:8001;
    server localhost:8002;
}

server {
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔧 Maintenance

### 1. Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/opt/backups/bist-ai"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp bist_ai.db $BACKUP_DIR/bist_ai_$DATE.db

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz logs/

# Backup AI models
tar -czf $BACKUP_DIR/models_$DATE.tar.gz ai/models/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### 2. Update Script

```bash
#!/bin/bash
# update.sh

echo "🔄 Updating BIST AI Smart Trader..."

# Backup current version
./backup.sh

# Pull latest changes
git pull origin main

# Update dependencies
docker-compose pull

# Restart services
docker-compose down
docker-compose up -d

# Wait for services to start
sleep 30

# Health check
curl -f http://localhost:8000/api/health || exit 1

echo "✅ Update completed successfully!"
```

### 3. Health Check Script

```bash
#!/bin/bash
# health_check.sh

services=(
    "Frontend:3000"
    "Backend:8000"
    "Realtime:8081"
    "Health:8001"
    "Watchlist:8002"
    "Notification:8003"
    "Monitoring:8004"
    "Grafana:3010"
)

all_healthy=true

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    if curl -s -f "http://localhost:$port" >/dev/null 2>&1; then
        echo "✅ $name: Healthy"
    else
        echo "❌ $name: Unhealthy"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    echo "🎉 All services are healthy!"
    exit 0
else
    echo "⚠️ Some services are unhealthy!"
    exit 1
fi
```

---

## 📞 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :8000
   sudo kill -9 <PID>
   ```

2. **Docker Permission Denied**
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **SSL Certificate Issues**
   ```bash
   sudo certbot renew --dry-run
   sudo systemctl reload nginx
   ```

4. **Database Locked**
   ```bash
   sudo fuser -k bist_ai.db
   ```

### Log Analysis

```bash
# Error logs
grep -i error logs/*.log

# Performance logs
grep -i "slow" logs/*.log

# WebSocket issues
grep -i "websocket" logs/*.log
```

---

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
    environment:
      - WORKER_ID=${HOSTNAME}

  frontend:
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Vertical Scaling

```bash
# Increase Docker resources
docker-compose up -d --scale backend=3 --scale frontend=2
```

---

## 🎯 Production Checklist

- [ ] SSL sertifikası kuruldu
- [ ] Environment variables ayarlandı
- [ ] Firewall konfigüre edildi
- [ ] Monitoring kuruldu
- [ ] Backup sistemi aktif
- [ ] Log rotation ayarlandı
- [ ] Health check scriptleri çalışıyor
- [ ] Performance testleri yapıldı
- [ ] Security audit tamamlandı
- [ ] Documentation güncellendi

---

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/your-username/borsailhanos/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/borsailhanos/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/borsailhanos/discussions)

---

**🎉 BIST AI Smart Trader başarıyla production'a deploy edildi!**