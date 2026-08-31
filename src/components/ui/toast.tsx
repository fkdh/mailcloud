import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";

type ToastVariant = "success" | "error";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = ToastOptions & { id: number };

type ToastContextValue = {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const item = { ...options, id };
    setToasts((current) => [...current, item]);
    window.setTimeout(() => dismiss(id), options.duration ?? 3500);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed right-4 top-4 z-50 grid w-[min(24rem,calc(100vw-2rem))] gap-3" aria-live="polite" aria-label="Notifications">
        {toasts.map((item) => (
          <div key={item.id} className={cn("relative rounded-lg border bg-card p-4 pr-9 text-card-foreground shadow-xl", item.variant === "error" ? "border-destructive/50" : "border-primary/40")} role="status">
            <div className={cn("text-sm font-semibold", item.variant === "error" ? "text-destructive" : "text-primary")}>{item.title}</div>
            {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
            <button className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground" type="button" aria-label="Dismiss notification" onClick={() => dismiss(item.id)}>x</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export { ToastProvider, useToast };
