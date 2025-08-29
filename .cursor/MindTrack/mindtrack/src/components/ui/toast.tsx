"use client";

import * as React from "react";

type ToastVariant = "success" | "error" | "info" | "warning";

type ToastItem = {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  timeoutMs?: number;
};

type ToastContextValue = {
  show: (message: string, options?: Partial<Omit<ToastItem, "id" | "message">>) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const remove = (id: string) => setItems(prev => prev.filter(t => t.id !== id));

  const show: ToastContextValue["show"] = (message, options) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = {
      id,
      message,
      variant: options?.variant ?? "info",
      title: options?.title,
      timeoutMs: options?.timeoutMs ?? 4000,
    };
    setItems(prev => [...prev, item]);
    if (item.timeoutMs && item.timeoutMs > 0) {
      window.setTimeout(() => remove(id), item.timeoutMs);
    }
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {items.map((t) => (
          <div key={t.id} className={[
              "w-80 rounded-lg shadow-lg border p-3 bg-white",
              t.variant === "success" && "border-green-200",
              t.variant === "error" && "border-red-200",
              t.variant === "info" && "border-blue-200",
              t.variant === "warning" && "border-yellow-200",
            ].filter(Boolean).join(" ")}
          >
            {t.title && (
              <div className="text-sm font-semibold text-gray-900 mb-1">{t.title}</div>
            )}
            <div className="text-sm text-gray-700">{t.message}</div>
            <div className="mt-2 text-right">
              <button onClick={() => remove(t.id)} className="text-xs text-gray-500 hover:text-gray-700">Kapat</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


