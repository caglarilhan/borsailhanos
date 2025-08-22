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

// Makro rejim kartı
function macroRegimeCard(regime){
  const regimeType = regime.regime || 'UNKNOWN';
  const confidence = (regime.confidence * 100).toFixed(0);
  const lastUpdate = regime.last_update ? new Date(regime.last_update).toLocaleString() : 'Bilinmiyor';
  
  let regimeCls = 'mid';
  if(regimeType === 'RISK_ON') regimeCls = 'good';
  else if(regimeType === 'RISK_OFF') regimeCls = 'bad';
  
  let weightsHtml = '';
  if(regime.weights && Object.keys(regime.weights).length > 0){
    weightsHtml = '<div style="margin-top:10px;font-size:12px;"><strong>Model Ağırlıkları:</strong><br>';
    for(const [model, weight] of Object.entries(regime.weights)){
      weightsHtml += `${model}: ${(weight * 100).toFixed(1)}%<br>`;
      }
    weightsHtml += '</div>';
  }
  
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <strong>Makro Rejim</strong>
      <span class="rr ${regimeCls}">${regimeType}</span>
    </div>
    <div>Güven: <strong>${confidence}%</strong></div>
    <div style="opacity:.7;font-size:12px">Son Güncelleme: ${lastUpdate}</div>
    ${weightsHtml}
  </div>`;
}

// Makro rejim yükle
async function loadMacroRegime(){
  try{
    const data = await fetchJSON('/ai/macro/regime');
    $('#macro-regime').innerHTML = macroRegimeCard(data);
  }catch(e){
    console.error('macro regime error', e);
    $('#macro-regime').innerHTML = '<div>Makro rejim yüklenemedi</div>';
  }
}

        // Trading Robot yükle
        async function loadTradingRobotStatus(){
          try{
            const data = await fetchJSON('/trading/robot/status');
            updateTradingRobotStatus(data);
          }catch(e){
            console.error('trading robot status error', e);
            document.getElementById('robot-status').textContent = 'Hata';
          }
        }

        // Trading Robot status güncelle
        function updateTradingRobotStatus(data) {
          if (data.is_active) {
            document.getElementById('robot-status').textContent = 'Aktif';
            document.getElementById('robot-status').className = 'value active';
          } else {
            document.getElementById('robot-status').textContent = 'Pasif';
            document.getElementById('robot-status').className = 'value inactive';
          }
          
          document.getElementById('robot-capital').textContent = `${data.current_capital.toLocaleString()} TL`;
          document.getElementById('robot-winrate').textContent = `${data.win_rate.toFixed(1)}%`;
        }

        // Auto Trading başlat
        async function startAutoTrading() {
          const button = event.target;
          const originalText = button.textContent;
          
          button.disabled = true;
          button.textContent = '🚀 Çalışıyor...';
          
          try {
            const symbols = ['SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'GARAN.IS'];
            const response = await fetch('/trading/robot/auto-trade', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(symbols)
            });
            
            const data = await response.json();
            
            if (data.auto_trade_results) {
              showNotification('✅ Auto trading tamamlandı!', 'success');
              loadTradingRobotStatus();
              getPortfolioSummary();
            } else {
              showNotification('❌ Auto trading hatası', 'error');
            }
          } catch (error) {
            console.error('Auto trading error:', error);
            showNotification('❌ Auto trading hatası', 'error');
          } finally {
            button.disabled = false;
            button.textContent = originalText;
          }
        }

        // Tüm sembolleri analiz et
        async function analyzeAllSymbols() {
          const button = event.target;
          const originalText = button.textContent;
          
          button.disabled = true;
          button.textContent = '🔍 Analiz ediliyor...';
          
          try {
            const symbols = ['SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'GARAN.IS'];
            const analyses = [];
            
            for (const symbol of symbols) {
              const analysis = await fetchJSON(`/trading/robot/analyze/${symbol}`);
              if (!analysis.error) {
                analyses.push(analysis);
              }
            }
            
            // En trend ve en dip hisseleri bul
            const sortedAnalyses = analyses.sort((a, b) => 
              b.trading_signal.combined_score - a.trading_signal.combined_score
            );
            
            updateTrendingStocks(sortedAnalyses);
            showNotification('✅ Analiz tamamlandı!', 'success');
            
          } catch (error) {
            console.error('Analysis error:', error);
            showNotification('❌ Analiz hatası', 'error');
          } finally {
            button.disabled = false;
            button.textContent = originalText;
          }
        }

        // Portfolio özeti al
        async function getPortfolioSummary() {
          try {
            const data = await fetchJSON('/trading/robot/portfolio');
            showPortfolioModal(data);
          } catch (error) {
            console.error('Portfolio error:', error);
            showNotification('❌ Portfolio hatası', 'error');
          }
        }

        // Trending stocks güncelle
        function updateTrendingStocks(analyses) {
          const topGainers = document.getElementById('top-gainers');
          const topLosers = document.getElementById('top-losers');
          
          // En trend hisseler (top 5)
          const gainers = analyses.slice(0, 5);
          topGainers.innerHTML = gainers.map(stock => `
            <div class="stock-item gainer">
              <div class="stock-symbol">${stock.symbol}</div>
              <div class="stock-price">${stock.current_price.toFixed(2)} TL</div>
              <div class="stock-score">+${stock.trading_signal.combined_score.toFixed(1)}</div>
              <div class="stock-signal ${stock.trading_signal.action.toLowerCase()}">${stock.trading_signal.action}</div>
            </div>
          `).join('');
          
          // En dip hisseler (bottom 5)
          const losers = analyses.slice(-5).reverse();
          topLosers.innerHTML = losers.map(stock => `
            <div class="stock-item loser">
              <div class="stock-symbol">${stock.symbol}</div>
              <div class="stock-price">${stock.current_price.toFixed(2)} TL</div>
              <div class="stock-score">${stock.trading_signal.combined_score.toFixed(1)}</div>
              <div class="stock-signal ${stock.trading_signal.action.toLowerCase()}">${stock.trading_signal.action}</div>
            </div>
          `).join('');
        }

        // Portfolio modal göster
        function showPortfolioModal(portfolio) {
          const modalContent = `
            <div class="modal-overlay" onclick="closeModal()">
              <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                  <h3>📊 Trading Portfolio</h3>
                  <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                  <div class="portfolio-summary">
                    <h4>💰 Özet</h4>
                    <p>Toplam Değer: <strong>${portfolio.total_value.toLocaleString()} TL</strong></p>
                    <p>Mevcut Capital: <strong>${portfolio.current_capital.toLocaleString()} TL</strong></p>
                    <p>Toplam Return: <strong class="${portfolio.total_return >= 0 ? 'positive' : 'negative'}">${portfolio.total_return.toFixed(2)}%</strong></p>
                    <p>Toplam PnL: <strong class="${portfolio.total_pnl >= 0 ? 'positive' : 'negative'}">${portfolio.total_pnl.toLocaleString()} TL</strong></p>
                  </div>
                  <div class="portfolio-positions">
                    <h4>📈 Pozisyonlar</h4>
                    ${portfolio.positions.map(pos => `
                      <div class="position-item">
                        <span class="symbol">${pos.symbol}</span>
                        <span class="quantity">${pos.quantity}</span>
                        <span class="avg-price">${pos.avg_price.toFixed(2)} TL</span>
                        <span class="current-price">${pos.current_price.toFixed(2)} TL</span>
                        <span class="pnl ${pos.pnl >= 0 ? 'positive' : 'negative'}">${pos.pnl.toFixed(2)} TL (${pos.pnl_percent.toFixed(2)}%)</span>
                      </div>
                    `).join('') || '<p>Henüz pozisyon yok</p>'}
                  </div>
                  <div class="portfolio-performance">
                    <h4>🎯 Performans</h4>
                    <p>Toplam İşlem: <strong>${portfolio.performance.total_trades}</strong></p>
                    <p>Kazanan: <strong class="positive">${portfolio.performance.winning_trades}</strong></p>
                    <p>Kaybeden: <strong class="negative">${portfolio.performance.losing_trades}</strong></p>
                    <p>Win Rate: <strong>${portfolio.performance.win_rate.toFixed(1)}%</strong></p>
                  </div>
                </div>
              </div>
            </div>
          `;
          
          document.body.insertAdjacentHTML('beforeend', modalContent);
        }

        // Historical Accuracy yükle
        async function loadHistoricalAccuracy() {
          try {
            const data = await fetchJSON('/historical/accuracy/summary');
            updateHistoricalAccuracy(data);
          } catch (e) {
            console.error('Historical accuracy error', e);
            document.getElementById('overall-accuracy').textContent = 'Hata';
          }
        }

        // Historical Accuracy güncelle
        function updateHistoricalAccuracy(data) {
          if (data.summary) {
            const summary = data.summary;
            
            document.getElementById('overall-accuracy').textContent = `${(summary.average_accuracy * 100).toFixed(2)}%`;
            document.getElementById('total-symbols').textContent = summary.total_symbols;
            document.getElementById('best-performer').textContent = summary.top_5_accuracy[0] || 'N/A';
            document.getElementById('avg-drawdown').textContent = `${(summary.average_max_drawdown * 100).toFixed(2)}%`;
            
            // Accuracy chart güncelle
            updateAccuracyChart(summary.accuracy_distribution);
          }
        }

        // Accuracy chart güncelle
        function updateAccuracyChart(distribution) {
          const chartContainer = document.getElementById('accuracy-chart');
          
          const chartHTML = `
            <div class="accuracy-bars">
              <div class="accuracy-bar excellent">
                <span class="bar-label">Mükemmel (≥80%)</span>
                <div class="bar-fill" style="width: ${(distribution.excellent / 19) * 100}%"></div>
                <span class="bar-value">${distribution.excellent}</span>
              </div>
              <div class="accuracy-bar good">
                <span class="bar-label">İyi (60-80%)</span>
                <div class="bar-fill" style="width: ${(distribution.excellent / 19) * 100}%"></div>
                <span class="bar-value">${distribution.good}</span>
              </div>
              <div class="accuracy-bar fair">
                <span class="bar-label">Orta (40-60%)</span>
                <div class="bar-fill" style="width: ${(distribution.fair / 19) * 100}%"></div>
                <span class="bar-value">${distribution.fair}</span>
              </div>
              <div class="accuracy-bar poor">
                <span class="bar-label">Zayıf (<40%)</span>
                <div class="bar-fill" style="width: ${(distribution.poor / 19) * 100}%"></div>
                <span class="bar-value">${distribution.poor}</span>
              </div>
            </div>
          `;
          
          chartContainer.innerHTML = chartHTML;
        }

        // Tüm hisseleri historical accuracy analiz et
        async function analyzeAllHistorical() {
          const button = event.target;
          const originalText = button.textContent;
          
          button.disabled = true;
          button.textContent = '🔍 Analiz ediliyor...';
          
          try {
            const response = await fetch('/historical/accuracy/analyze-all?force_update=true');
            const data = await response.json();
            
            if (data.overall_summary) {
              showNotification('✅ Historical accuracy analiz tamamlandı!', 'success');
              loadHistoricalAccuracy();
            } else {
              showNotification('❌ Historical accuracy analiz hatası', 'error');
            }
          } catch (error) {
            console.error('Historical accuracy error:', error);
            showNotification('❌ Historical accuracy analiz hatası', 'error');
            button.disabled = false;
            button.textContent = originalText;
          }
        }

        // Historical accuracy raporu al
        async function getHistoricalReport() {
          try {
            const data = await fetchJSON('/historical/accuracy/report');
            showHistoricalReportModal(data);
          } catch (error) {
            console.error('Historical report error:', error);
            showNotification('❌ Historical rapor hatası', 'error');
          }
        }

        // Historical accuracy özeti al
        async function getHistoricalSummary() {
          try {
            const data = await fetchJSON('/historical/accuracy/summary');
            showHistoricalSummaryModal(data);
          } catch (error) {
            console.error('Historical summary error:', error);
            console.error('Historical summary error:', error);
            showNotification('❌ Historical özet hatası', 'error');
          }
        }

        // Historical accuracy rapor modal göster
        function showHistoricalReportModal(report) {
          const modalContent = `
            <div class="modal-overlay" onclick="closeModal()">
              <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                  <h3>📋 Historical Accuracy Raporu</h3>
                  <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                  <div class="report-summary">
                    <h4>📊 Analiz Özeti</h4>
                    <p>Toplam Sembol: <strong>${report.analysis_summary.total_symbols}</strong></p>
                    <p>Genel Doğruluk: <strong>${report.analysis_summary.overall_accuracy}</strong></p>
                    <p>Doğruluk Notu: <strong>${report.analysis_summary.accuracy_grade}</strong></p>
                    <p>En İyi Performans: <strong>${report.analysis_summary.best_performer}</strong></p>
                    <p>En Kötü Performans: <strong>${report.analysis_summary.worst_performer}</strong></p>
                  </div>
                  <div class="report-metrics">
                    <h4>📈 Risk Metrikleri</h4>
                    <p>Ortalama Drawdown: <strong>${report.risk_metrics.average_drawdown}</strong></p>
                    <p>Ortalama Volatilite: <strong>${report.risk_metrics.average_volatility}</strong></p>
                  </div>
                  <div class="report-recommendations">
                    <h4>💡 Öneriler</h4>
                    ${report.recommendations.map(rec => `<p>• ${rec}</p>`).join('')}
                  </div>
                </div>
              </div>
            </div>
          `;
          
          document.body.insertAdjacentHTML('beforeend', modalContent);
        }

        // Historical accuracy özet modal göster
        function showHistoricalSummaryModal(summary) {
          const modalContent = `
            <div class="modal-overlay" onclick="closeModal()">
              <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                  <h3>📊 Historical Accuracy Özeti</h3>
                  <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                  <div class="summary-stats">
                    <h4>📈 Genel İstatistikler</h4>
                    <p>Toplam Sembol: <strong>${summary.summary.total_symbols}</strong></p>
                    <p>Ortalama Doğruluk: <strong>${(summary.summary.average_accuracy * 100).toFixed(2)}%</strong></p>
                    <p>Doğruluk Std: <strong>${(summary.summary.accuracy_std * 100).toFixed(2)}%</strong></p>
                    <p>Ortalama Max Drawdown: <strong>${(summary.summary.average_max_drawdown * 100).toFixed(2)}%</strong></p>
                    <p>Ortalama Volatilite: <strong>${(summary.summary.average_volatility * 100).toFixed(2)}%</strong></p>
                  </div>
                  <div class="summary-trends">
                    <h4>🔄 Trend Dağılımı</h4>
                    ${Object.entries(summary.summary.trend_distribution).map(([trend, count]) => 
                      `<p><strong>${trend}:</strong> ${count} sembol</p>`
                    ).join('')}
                  </div>
                  <div class="summary-top">
                    <h4>🏆 En İyi 5 Performans</h4>
                    ${summary.summary.top_5_accuracy.map((symbol, index) => 
                      `<p>${index + 1}. ${symbol}</p>`
                    ).join('')}
                  </div>
                </div>
              </div>
            </div>
          `;
          
          document.body.insertAdjacentHTML('beforeend', modalContent);
        }

        // Continuous optimization yükle
        async function loadOptimizationStatus(){
          try{
            const data = await fetchJSON('/ai/optimization/status');
            updateOptimizationStatus(data);
          }catch(e){
            console.error('optimization status error', e);
            document.getElementById('opt-status').textContent = 'Hata';
          }
        }

// Update optimization status display
function updateOptimizationStatus(data) {
  // Update status
  if (data.current_optimization) {
    document.getElementById('opt-status').textContent = `Çalışıyor: ${data.current_optimization.type}`;
    document.getElementById('opt-status').className = 'value running';
  } else {
    document.getElementById('opt-status').textContent = 'Beklemede';
    document.getElementById('opt-status').className = 'value idle';
  }
  
  // Update history count
  document.getElementById('opt-history').textContent = data.optimization_history_count;
  
  // Update next scheduled
  if (data.next_scheduled_optimizations && data.next_scheduled_optimizations.length > 0) {
    const next = data.next_scheduled_optimizations[0];
    document.getElementById('next-optimization').textContent = `${next.type}: ${next.days_until} gün`;
  } else {
    document.getElementById('next-optimization').textContent = 'Planlanmamış';
  }
}

// Force optimization
function forceOptimization(type) {
  const button = event.target;
  const originalText = button.textContent;
  
  // Disable button and show loading
  button.disabled = true;
  button.textContent = '🔄 Çalışıyor...';
  
  fetch('/ai/optimization/force', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ optimization_type: type })
  })
  .then(response => response.json())
  .then(data => {
    if (data.results && data.results.status === 'completed') {
      showNotification('✅ Optimizasyon tamamlandı!', 'success');
      // Refresh status
      loadOptimizationStatus();
    } else {
      showNotification('❌ Optimizasyon başarısız', 'error');
    }
  })
  .catch(error => {
    console.error('Error forcing optimization:', error);
    showNotification('❌ Optimizasyon hatası', 'error');
  })
  .finally(() => {
    // Re-enable button
    button.disabled = false;
    button.textContent = originalText;
  });
}

// Get optimization report
function getOptimizationReport() {
  const button = event.target;
  const originalText = button.textContent;
  
  // Show loading
  button.textContent = '📊 Oluşturuluyor...';
  
  fetch('/ai/optimization/report')
    .then(response => response.json())
    .then(data => {
      if (data.report_timestamp) {
        showNotification('✅ Rapor oluşturuldu!', 'success');
        // Show report in modal or new window
        showOptimizationReport(data);
      } else {
        showNotification('❌ Rapor oluşturulamadı', 'error');
      }
    })
    .catch(error => {
      console.error('Error getting optimization report:', error);
      showNotification('❌ Rapor hatası', 'error');
    })
    .finally(() => {
      // Reset button
      button.textContent = originalText;
    });
}

// Show optimization report
function showOptimizationReport(report) {
  // Create modal content
  const modalContent = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>🔄 Optimizasyon Raporu</h3>
          <button class="close-btn" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="report-section">
            <h4>📊 Özet</h4>
            <p>Toplam: ${report.optimization_summary.total_optimizations}</p>
            <p>Başarılı: ${report.optimization_summary.successful_optimizations}</p>
            <p>Başarısız: ${report.optimization_summary.failed_optimizations}</p>
          </div>
          <div class="report-section">
            <h4>📅 Sonraki Planlanan</h4>
            ${report.next_scheduled.map(opt => 
              `<p>${opt.type}: ${opt.days_until} gün sonra</p>`
            ).join('')}
          </div>
          <div class="report-section">
            <h4>💡 Öneriler</h4>
            <ul>
              ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalContent);
}

// Close modal
function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.remove();
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Ana yükleme fonksiyonunu güncelle
document.addEventListener('DOMContentLoaded', async ()=>{
  await initSymbols();
  await Promise.all([loadForecast(), loadSignals(), loadPrices(), loadHealthSummary(), loadTopsisRanking(), loadTechnicalPatterns(), loadAIEnsemble(), loadMacroRegime(), loadOptimizationStatus(), loadTradingRobotStatus(), loadHistoricalAccuracy()]);
  $('#refreshBtn').addEventListener('click', ()=>{
    loadForecast();
    loadSignals();
    loadPrices();
    loadHealthSummary();
    loadTopsisRanking();
    loadTechnicalPatterns();
    loadAIEnsemble();
    loadMacroRegime();
    loadTradingRobotStatus();
    loadHistoricalAccuracy();
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
    loadMacroRegime(); 
    loadOptimizationStatus(); 
    loadTradingRobotStatus();
    loadHistoricalAccuracy();
  }, 30000);
});


