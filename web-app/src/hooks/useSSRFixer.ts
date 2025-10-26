"use client";
import { useEffect, useState } from "react";

/**
 * SSR ve Client render farklarını ortadan kaldırır.
 * - Hydration mismatch hatalarını önler.
 * - Server'da render edilen anlık değerleri (Date, random, locale) client'a taşır.
 * - "Ready" state ile render'ı sadece client'ta başlatır.
 * 
 * Kullanım:
 * const ready = useSSRFixer();
 * if (!ready) return null;
 * 
 * @param delayMs - (opsiyonel) Render gecikmesi (ms)
 * @returns ready state (true = client render edebilir)
 */
export function useSSRFixer(delayMs: number = 0): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydration tamamlandıktan sonra render'a izin ver
    const timer = setTimeout(() => {
      setReady(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  return ready;
}

/**
 * Belirli veri yüklenmesi için kısmi SSR koruması
 * - Sadece veri hazır olunca render eder
 * - SSR farkını minimize eder
 * 
 * Kullanım:
 * const ready = useSSRPartialFix([summary, chartData]);
 * if (!ready) return <Loading />;
 * 
 * @param keys - Kontrol edilecek veriler
 * @returns ready state
 */
export function useSSRPartialFix(keys: any[]): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Tüm veriler yüklendi mi?
    if (keys.every(Boolean)) {
      setReady(true);
    }
  }, [keys]);

  return ready;
}

