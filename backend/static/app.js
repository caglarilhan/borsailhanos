const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function signalCard(s){
  const conf = (s.confidence ?? 0).toFixed(2);
  const cls = `badge ${s.signal}`;
  const rr = s.risk_reward;
  const rrCls = rr >= 2 ? 'good' : rr >= 1.5 ? 'mid' : 'bad';
  const rrHtml = rr!=null ? `<span class="rr ${rrCls}">R/R ${Number(rr).toFixed(2)}</span>` : '';
  const sltp = (s.stop_loss!=null && s.take_profit!=null) ? `<div>SL: <b>${Number(s.stop_loss).toFixed(2)}</b> • TP: <b>${Number(s.take_profit).toFixed(2)}</b></div>` : '';
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <strong>${s.symbol}</strong>
      <span class="${cls}">${s.signal}</span>
    </div>
    <div>Confidence: <strong>${conf}</strong>${rrHtml}</div>
    ${sltp}
    <div style="opacity:.7;font-size:12px">${new Date(s.timestamp).toLocaleString()}</div>
  </div>`;
}

async function loadSignals(){
  try{
    const qs = buildSymbolsQuery();
    const data = await fetchJSON(`/signals${qs}`);
    const list = Object.values(data.signals || {});
    $('#signals').innerHTML = list.map(signalCard).join('') || '<div>Henüz sinyal yok</div>';
  }catch(e){
    console.error('signals error', e);
  }
}

async function loadForecast(){
  try{
    const forecast = await fetchJSON('/forecast/active');
    const list = (forecast.signals || []).map(s=>({
      symbol: s.symbol,
      signal: s.action,
      confidence: s.confidence,
      timestamp: s.timestamp,
      stop_loss: s.stop_loss,
      take_profit: s.take_profit,
      risk_reward: s.risk_reward
    }));
    $('#forecast').innerHTML = list.map(signalCard).join('') || '<div>Aktif 48 saatlik sinyal yok</div>';
  }catch(e){
    console.error('forecast error', e);
  }
}

async function loadPrices(){
  try{
    const data = await fetchJSON('/prices');
    const tbody = $('#pricesTable tbody');
    const rows = Object.entries(data.prices || {}).map(([symbol, price])=>{
      return `<tr><td>${symbol}</td><td>${price}</td><td>${new Date(data.timestamp).toLocaleTimeString()}</td></tr>`;
    }).join('');
    tbody.innerHTML = rows || '<tr><td colspan="3">Veri yok</td></tr>';
  }catch(e){
    console.error('prices error', e);
  }
}

function buildSymbolsQuery(){
  const selected = $$('#symbolsSelect option:checked').map(o=>o.value);
  return selected.length ? `?symbols=${encodeURIComponent(selected.join(','))}` : '';
}

async function initSymbols(){
  const resp = await fetchJSON('/bist100/symbols');
  const sectors = resp.sectors || [];
  const symbols = resp.symbols || [];
  const sectorSel = $('#sectorFilter');
  sectorSel.innerHTML = ['Hepsi', ...sectors].map(x=>`<option value="${x}">${x}</option>`).join('');
  const select = $('#symbolsSelect');
  select.innerHTML = symbols.map(s=>`<option value="${s.symbol}">${s.symbol} — ${s.name}</option>`).join('');
  sectorSel.addEventListener('change', async ()=>{
    const val = sectorSel.value;
    const qs = val && val !== 'Hepsi' ? `?sector=${encodeURIComponent(val)}` : '';
    const filtered = await fetchJSON('/bist100/symbols'+qs);
    const list = filtered.symbols || [];
    select.innerHTML = list.map(s=>`<option value="${s.symbol}">${s.symbol} — ${s.name}</option>`).join('');
  });
}

// Fundamental analiz kartı
function healthCard(item){
  const score = item.health_score || 0;
  const grade = item.health_grade || 'N/A';
  const piotroski = item.piotroski?.Total_Score || 0;
  const roe = item.dupont?.ROE || 0;
  
  const scoreCls = score >= 80 ? 'good' : score >= 60 ? 'mid' : 'bad';
  
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <strong>${item.symbol}</strong>
      <span class="rr ${scoreCls}">${score}/100 (${grade})</span>
    </div>
    <div>Piotroski: <strong>${piotroski}/9</strong></div>
    <div>ROE: <strong>${roe.toFixed(2)}%</strong></div>
    <div style="opacity:.7;font-size:12px">${new Date(item.timestamp).toLocaleString()}</div>
  </div>`;
}

// TOPSIS sıralama kartı
function topsisCard(item, rank){
  const score = item.TOPSIS_Score || 0;
  const dPlus = item.D_Plus || 0;
  const dMinus = item.D_Minus || 0;
  
  const scoreCls = score >= 0.7 ? 'good' : score >= 0.5 ? 'mid' : 'bad';
  
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <strong>${rank}. ${item.symbol || 'N/A'}</strong>
      <span class="rr ${scoreCls}">${score.toFixed(4)}</span>
    </div>
    <div>D+: <strong>${dPlus.toFixed(4)}</strong> • D-: <strong>${dMinus.toFixed(4)}</strong></div>
    <div style="opacity:.7;font-size:12px">TOPSIS Skoru</div>
  </div>`;
}

// Finansal sağlık özeti yükle
async function loadHealthSummary(){
  try{
    const data = await fetchJSON('/analysis/health/summary');
    const list = data.summary || [];
    $('#health-summary').innerHTML = list.map(healthCard).join('') || '<div>Sağlık verisi yok</div>';
  }catch(e){
    console.error('health summary error', e);
  }
}

// TOPSIS sıralama yükle
async function loadTopsisRanking(){
  try{
    const data = await fetchJSON('/analysis/topsis/ranking');
    const ranking = data.ranking || {};
    
    let list = [];
    for(const [symbol, item] of Object.entries(ranking)){
      list.push({...item, symbol});
    }
    
    // Sıralamaya göre düzenle
    list.sort((a, b) => (a.Rank || 0) - (b.Rank || 0));
    
    $('#topsis-ranking').innerHTML = list.map((item, idx) => topsisCard(item, idx + 1)).join('') || '<div>TOPSIS verisi yok</div>';
  }catch(e){
    console.error('topsis ranking error', e);
  }
}

// Teknik formasyon kartı
function patternCard(pattern){
  const direction = pattern.direction;
  const directionCls = direction === 'BULLISH' ? 'good' : direction === 'BEARISH' ? 'bad' : 'mid';
  const confidence = (pattern.confidence * 100).toFixed(0);
  const rr = pattern.risk_reward;
  const rrCls = rr >= 2 ? 'good' : rr >= 1.5 ? 'mid' : 'bad';
  
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <strong>${pattern.symbol}</strong>
      <span class="rr ${directionCls}">${direction}</span>
    </div>
    <div><strong>${pattern.pattern_name}</strong></div>
    <div>Güven: <strong>${confidence}%</strong> • R/R: <span class="rr ${rrCls}">${rr.toFixed(2)}</span></div>
    <div>Giriş: <strong>${pattern.entry_price.toFixed(2)}</strong></div>
    <div>SL: <strong>${pattern.stop_loss.toFixed(2)}</strong> • TP: <strong>${pattern.take_profit.toFixed(2)}</strong></div>
    <div style="opacity:.7;font-size:12px">${pattern.description}</div>
    <div style="opacity:.5;font-size:11px">${new Date(pattern.timestamp).toLocaleString()}</div>
  </div>`;
}

// Teknik formasyonları yükle
async function loadTechnicalPatterns(){
  try{
    const data = await fetchJSON('/analysis/patterns/scan/bist100');
    const patterns = data.patterns || [];
    
    if(patterns.length > 0){
      $('#technical-patterns').innerHTML = patterns.map(patternCard).join('');
    } else {
      $('#technical-patterns').innerHTML = '<div>Henüz teknik formasyon bulunamadı</div>';
    }
  }catch(e){
    console.error('technical patterns error', e);
    $('#technical-patterns').innerHTML = '<div>Teknik formasyon yüklenemedi</div>';
  }
}

// AI Ensemble kartı
function ensembleCard(prediction){
  const direction = prediction.ensemble_direction;
  const directionCls = direction === 'BULLISH' ? 'good' : direction === 'BEARISH' ? 'bad' : 'mid';
  const confidence = (prediction.ensemble_confidence * 100).toFixed(0);
  const rr = prediction.risk_reward;
  const rrCls = rr >= 2 ? 'good' : rr >= 1.5 ? 'mid' : 'bad';
  
  return `<div class="card">
    <div style="display:flex;justify-content;space-between;align-items:center">
      <strong>${prediction.symbol || 'UNKNOWN'}</strong>
      <span class="rr ${directionCls}">${direction}</span>
    </div>
    <div>Ensemble Confidence: <strong>${confidence}%</strong></div>
    <div>Risk/Reward: <span class="rr ${rrCls}">${rr.toFixed(2)}</span></div>
    <div style="opacity:.7;font-size:12px">AI Ensemble Score: ${prediction.ensemble_score.toFixed(4)}</div>
    <div style="opacity:.5;font-size:11px">${new Date(prediction.timestamp).toLocaleString()}</div>
  </div>`;
}

// AI Ensemble yükle
async function loadAIEnsemble(){
  try{
    // Sembol listesinden ilk 3'ü al
    const symbols = ['SISE.IS', 'EREGL.IS', 'TUPRS.IS'];
    const predictions = [];
    
    for(const symbol of symbols){
      try{
        const data = await fetchJSON(`/ai/ensemble/prediction/${symbol}`);
        if(data.prediction){
          data.prediction.symbol = symbol;
          predictions.push(data.prediction);
        }
      }catch(e){
        console.warn(`${symbol} ensemble tahmin hatası:`, e);
      }
    }
    
    if(predictions.length > 0){
      $('#ai-ensemble').innerHTML = predictions.map(ensembleCard).join('');
    } else {
      $('#ai-ensemble').innerHTML = '<div>AI Ensemble tahminleri yüklenemedi</div>';
    }
  }catch(e){
    console.error('AI ensemble error', e);
    $('#ai-ensemble').innerHTML = '<div>AI Ensemble hatası</div>';
  }
}

// Ana yükleme fonksiyonunu güncelle
document.addEventListener('DOMContentLoaded', async ()=>{
  await initSymbols();
  await Promise.all([loadForecast(), loadSignals(), loadPrices(), loadHealthSummary(), loadTopsisRanking(), loadTechnicalPatterns(), loadAIEnsemble()]);
  $('#refreshBtn').addEventListener('click', ()=>{
    loadForecast();
    loadSignals();
    loadPrices();
    loadHealthSummary();
    loadTopsisRanking();
    loadTechnicalPatterns();
    loadAIEnsemble();
  });
  // 30sn'de bir yenile
  setInterval(()=>{ 
    loadForecast(); 
    loadSignals(); 
    loadPrices(); 
    loadHealthSummary(); 
    loadTopsisRanking(); 
    loadTechnicalPatterns(); 
    loadAIEnsemble(); 
  }, 30000);
});


