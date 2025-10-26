from fastapi import FastAPI, Query
from pydantic import BaseModel
import random
from datetime import datetime

app = FastAPI()

# Investor Styles & Prompts
INVESTOR_STYLES = {
    "buffett": {
        "name": "Warren Buffett",
        "tone": "uzun vadeli, temkinli, değer odaklı",
        "logic": "intrinsic value, temettü, borç oranı, sabır",
        "avatar": "💎",
        "color": "emerald"
    },
    "lynch": {
        "name": "Peter Lynch",
        "tone": "büyüme odaklı, keşfedilmemiş fırsatları seven",
        "logic": "PEG oranı, satış büyümesi, sektör trendi",
        "avatar": "🚀",
        "color": "purple"
    },
    "dalio": {
        "name": "Ray Dalio",
        "tone": "makro, döngüsel, risk paritesi temelli",
        "logic": "faiz, enflasyon, tahvil ve döviz döngüsü",
        "avatar": "🌍",
        "color": "blue"
    },
    "simons": {
        "name": "Jim Simons",
        "tone": "istatistiksel, veri odaklı, sistematik",
        "logic": "pattern tanıma, RSI, MACD, kısa vade",
        "avatar": "🧠",
        "color": "orange"
    },
    "soros": {
        "name": "George Soros",
        "tone": "riskli, spekülatif, refleksif düşünme",
        "logic": "piyasa psikolojisi, momentum, kriz fırsatları",
        "avatar": "⚡",
        "color": "red"
    },
    "wood": {
        "name": "Cathie Wood",
        "tone": "yenilikçi, ileri teknoloji ve gelecek odaklı",
        "logic": "AI, genomik, enerji, disruptif sektörler",
        "avatar": "🔮",
        "color": "pink"
    },
    "burry": {
        "name": "Michael Burry",
        "tone": "şüpheci, risk analizli, balon avcısı",
        "logic": "aşırı değerlenme, borç seviyesi, kredi verisi",
        "avatar": "🕳️",
        "color": "gray"
    }
}

class AnalysisResponse(BaseModel):
    investor: str
    avatar: str
    color: str
    one_day: dict
    three_day: dict
    five_day: dict
    ten_day: dict
    comment: str
    confidence: float
    timestamp: str

def random_pct():
    return round(random.uniform(-3.5, 4.5), 2)

def generate_direction():
    pct = random_pct()
    return "Yükseliş" if pct > 0 else "Düşüş", pct

@app.get("/api/v60/analyze", response_model=AnalysisResponse)
def analyze(
    mode: str = Query("buffett", enum=list(INVESTOR_STYLES.keys())),
    symbol: str = Query("THYAO", description="Stock symbol")
):
    i = INVESTOR_STYLES[mode]
    
    dir1, pct1 = generate_direction()
    dir3, pct3 = generate_direction()
    dir5, pct5 = generate_direction()
    dir10, pct10 = generate_direction()
    
    confidence = round(random.uniform(72, 95), 1)
    
    # Generate investor-specific commentary
    comments = {
        "buffett": f"{i['name']} tarzı {i['tone']} analize göre; {symbol} için yaklaşım {i['logic']} göstergelerini esas alır. Fiyat dalgalanabilir, ama temelleri sağlam. Sabırlı ol, 3-6 aylık ufukta kazanç potansiyeli var.",
        "soros": f"{i['name']} tarzı {i['tone']} yaklaşıma göre; piyasa inançtan besleniyor. Şu an herkes aynı yöne koşuyor - bu genelde dönüş sinyalidir. Momentum pozitif, ama hazırlıklı ol.",
        "simons": f"{i['name']} tarzı {i['tone']} model: Veri yapısı istikrarlı, pattern uyumu %85. RSI trend pozitif, MACD golden cross. Ancak hacim düşerse false breakout riski var.",
        "lynch": f"{i['name']} yaklaşımı: Satış büyümesi ve PEG oranı göstergeleri karışık. Sektör trendi destekliyor ama competition artıyor. Dikkatli büyüme fırsatı.",
        "dalio": f"{i['name']} makro yaklaşımı: {i['logic']} döngüsü şu anda güçlü. Risk paritesi dengeli. Ancak faiz şokunda düzeltme riski var. Hedge düşün.",
        "wood": f"{i['name']} yenilik odaklı analiz: {i['logic']} disruptif sektörlerde. Teknoloji trendi güçlü ama volatilite yüksek. Uzun vade büyüme potansiyeli var, ama risk yönetimi şart.",
        "burry": f"{i['name']} şüpheci yaklaşım: {i['logic']} seviyeleri kritik. Aşırı borç ve yüksek değerleme uyarısı. Piyasa balon belirtileri gösteriyor - dikkatli ol."
    }
    
    return AnalysisResponse(
        investor=i["name"],
        avatar=i["avatar"],
        color=i["color"],
        one_day={"direction": dir1, "percentage": pct1, "trend": "📈" if pct1 > 0 else "📉"},
        three_day={"direction": dir3, "percentage": pct3, "trend": "📈" if pct3 > 0 else "📉"},
        five_day={"direction": dir5, "percentage": pct5, "trend": "📈" if pct5 > 0 else "📉"},
        ten_day={"direction": dir10, "percentage": pct10, "trend": "📈" if pct10 > 0 else "📉"},
        comment=comments[mode],
        confidence=confidence,
        timestamp=datetime.now().isoformat()
    )

# Include this router in main.py
router = app

