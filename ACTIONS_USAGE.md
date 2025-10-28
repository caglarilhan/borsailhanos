# 🎯 **actions.ts Kullanım Kılavuzu**

**Dosya:** `web-app/src/lib/actions.ts`  
**Özellik:** 27 action handler  
**Durum:** Production-ready ✅

---

## 📋 **Kullanım Örneği**

```tsx
import { createActions } from '@/lib/actions';

export default function Dashboard() {
  // Mevcut state'leriniz
  const [showTraderGPT, setShowTraderGPT] = useState(false);
  const [showAdvancedViz, setShowAdvancedViz] = useState(false);
  // ... diğer state'ler

  // Actions oluştur
  const actions = createActions({
    openPanel: openPanel,
    setShowTraderGPT: setShowTraderGPT,
    setShowAdvancedViz: setShowAdvancedViz,
    openExplanation: (symbol) => setSelectedForXAI(symbol),
    loadMore: () => console.log('Loading more...'),
    rebalance: async () => {
      // Rebalance logic
    },
    shareAnalysis: async () => {
      // Share logic
    },
    logout: () => {
      localStorage.removeItem('token');
      router.push('/login');
    },
    // ... diğer handler'lar
  });

  return (
    <>
      <button onClick={actions.gpt}>🤖 GPT</button>
      <button onClick={actions.viz}>📊 Viz</button>
      <button onClick={actions.riskModel}>📈 Risk</button>
      <button onClick={actions.logout}>🚪 Çıkış</button>
    </>
  );
}
```

---

## ✅ **TÜM SPRINTLER TAMAMLANDI**

**Sprint:** 10/10  
**Sorun:** 23+ çözüldü  
**Library:** 9 dosya (format, guards, sectorMap, backtestMeta, metaLabels, featureFlags, config, utils, actions)  
**Backend:** Query params eklendi  
**Handler:** onClick'ler çalışıyor

**Test:** `http://localhost:3000`

