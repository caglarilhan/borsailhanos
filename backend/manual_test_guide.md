# 🚀 MANUAL TEST GUIDE - BIST AI Smart Trader

## 📋 Test Edilecek Sistemler

### 1. 🧪 Basic Python Test
```bash
cd backend
python3 -c "print('Python çalışıyor'); import numpy; print('NumPy OK')"
```

### 2. 🧪 Test Runner
```bash
cd backend
python3 run_test.py
```

### 3. 🧪 Working System
```bash
cd backend
python3 working_system.py
```

### 4. 🧪 Final Working System
```bash
cd backend
python3 final_working_system.py
```

### 5. 🧪 Real BIST Data Test
```bash
cd backend
python3 real_bist_test.py
```

## 🎯 Beklenen Sonuçlar

### ✅ Başarılı Test:
- Python imports çalışıyor
- NumPy, Pandas, Scikit-learn OK
- Model training başarılı
- Accuracy %90+ elde ediliyor
- Ensemble model çalışıyor

### ❌ Başarısız Test:
- Import hataları
- Memory errors
- Timeout errors
- Accuracy düşük

## 📊 Performance Metrics

| Test | Beklenen Sonuç | Durum |
|------|----------------|-------|
| Python Import | ✅ OK | - |
| NumPy Operations | ✅ OK | - |
| Pandas Data Handling | ✅ OK | - |
| Scikit-learn Models | ✅ OK | - |
| Feature Engineering | ✅ OK | - |
| Model Training | ✅ OK | - |
| Accuracy | %90+ | - |
| R² Score | 0.7+ | - |

## 🔧 Troubleshooting

### Import Error:
```bash
pip3 install -r requirements-100accuracy.txt
```

### Memory Error:
- Daha az veri ile test et
- max_iterations=1 yap

### Timeout Error:
- Daha basit model kullan
- Feature sayısını azalt

## 🚀 Production Deployment

Test başarılı olduktan sonra:

1. **Railway Deploy**
2. **API Endpoints**
3. **Monitoring Setup**
4. **Frontend Development**

## 📱 Test Sonrası

- ✅ Tüm testler başarılı → Production'a geç
- ⚠️ Bazı testler başarısız → Debug et
- ❌ Çoğu test başarısız → Major fix gerekli

---

*Test Guide - 2025-01-22*
*Status: Ready for Testing*
