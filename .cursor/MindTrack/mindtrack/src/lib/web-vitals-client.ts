import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals'

/**
 * Web Vitals client collector
 * - Bu modul, tarayicidan temel vitals metriklerini toplar
 * - /api/metrics/vitals endpoint'ine POST eder
 * - Consent/policy ihtiyaclarina gore cagirma noktasi kontrol edilebilir
 */
export function initWebVitalsReporting() {
  if (typeof window === 'undefined') return

  const endpoint = '/api/metrics/vitals'

  const send = (metric: { name: string; value: number; id: string; rating?: string }) => {
    try {
      const body = {
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer || undefined,
      }
      navigator.sendBeacon?.(endpoint, new Blob([JSON.stringify(body)], { type: 'application/json' }))
    } catch {
      // fallback
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(metric) }).catch(() => {})
    }
  }

  onCLS(send)
  onINP(send)
  onLCP(send)
  onFCP(send)
  onTTFB(send)
}
