# Kimlik Doğrulama (NextAuth + Credentials)

Bu sürümde dashboard ve hassas API uçları yalnızca yetkilendirdiğiniz kullanıcı adlarıyla erişilebilir. NextAuth Credentials Provider kullanılıyor.

## 1. Ortam Değişkenleri

`web-app/.env` dosyanıza (veya deployment ortamınıza) aşağıdaki değişkenleri ekleyin:

```ini
NEXTAUTH_SECRET=rastgele_uzun_bir_gizli_anahtar

# JSON veya basit formatla kullanıcı listesi tanımlayın
AUTH_USERS_JSON=[{"username":"caglar","password":"$2b$10$.....","role":"admin","displayName":"Caglar Ilhan"}]
# Alternatif basit format (username:password[:role] şeklinde, ';' ile ayrılır)
# AUTH_USERS=caglar:$2b$10$.....:admin;analist:demo123
```

- `NEXTAUTH_SECRET`: `openssl rand -base64 32` ile üretilebilir.
- Şifreleri bcrypt ile hashlemek için:

```bash
cd web-app
node -e "console.log(require('bcryptjs').hashSync('sifre123', 10))"
```

Eğer JSON/env tanımlamadıysanız, `ADMIN_USERNAME` ve `ADMIN_PASSWORD` değişkenleri son çare olarak kullanılır:

```ini
ADMIN_USERNAME=demo
ADMIN_PASSWORD=demo123
ADMIN_DISPLAY_NAME=Demo Kullanıcı
```

## 2. Middleware Koruması

`middleware.ts` aşağıdaki yolları zorunlu girişe tabi tutar:

- `/dashboard`
- `/api/broker/*`
- `/api/paper/*`
- `/api/ai/*`
- `/api/markets/*`
- `/api/stack-runs/*`
- `/api/rl/*`
- `/api/health/*`

Giriş yapmamış kullanıcılar otomatik olarak `/login?callbackUrl=...` sayfasına yönlendirilir.

## 3. Login Akışı

- `/login` sayfası Credentials formu sunar.
- Başarılı girişte istek yapılan `callbackUrl`’e yönlendirilir (varsayılan `/dashboard`).
- Sağ üstteki kullanıcı rozeti üzerinden “Çıkış” butonu ile oturum kapatılır.

## 4. API Çağrıları

NextAuth middleware’i sayesinde tarayıcıdan yapılan istekler `next-auth.session-token` çereziyle korunur. Ekstra token taşımanıza gerek yoktur; ancak mevcut `PAPER_API_TOKEN` vb. guard’lar hâlen geçerlidir.

## 5. Özet

1. `NEXTAUTH_SECRET` ve kullanıcı listesi env’lerini tanımlayın.
2. Şifreleri bcrypt ile hashleyerek `AUTH_USERS_JSON` içine koyun.
3. `npm run dev` (veya deploy ortamınız) env’leri yüklü şekilde başlatın.
4. `/login` üzerinden giriş yaparak dashboard’a erişin.

Sorular için: kullanıcı ekleme/çıkarma sadece env değişkenleri güncellenerek yapılır; yeniden deploy etmek yeterlidir.



