export default function PricingPage() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Abonelik Planları</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{name:'Free', price:'₺0', features:['Temel sinyaller','Gecikmeli veri']}, {name:'Pro', price:'₺199/ay', features:['Gerçek zamanlı sinyal','Portföy optimizasyonu','Uyarılar']}, {name:'Elite', price:'₺499/ay', features:['Pro +','Gelişmiş AI raporları','Öncelikli destek']}].map((p,i)=> (
          <div key={i} className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="text-xl font-bold mb-2">{p.name}</div>
            <div className="text-2xl text-blue-600 font-extrabold mb-4">{p.price}</div>
            <ul className="text-sm text-slate-700 space-y-1 mb-4 list-disc pl-5">
              {p.features.map((f,fi)=> <li key={fi}>{f}</li>)}
            </ul>
            <a className="inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" href="#" title="Stripe ödemesi yakında">Satın Al</a>
          </div>
        ))}
      </div>
    </main>
  );
}



