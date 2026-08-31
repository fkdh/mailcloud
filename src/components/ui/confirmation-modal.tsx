import { useEffect, useId, useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "./button";

type ConfirmationModalProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  confirmingLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonProps["variant"];
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  confirmingLabel = "Processing...",
  cancelLabel = "Cancel",
  confirmVariant = "destructive",
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const [confirming, setConfirming] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !confirming) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirming, onClose, open]);

  if (!open) return null;

  async function handleConfirm() {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !confirming) onClose(); }}>
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-2xl" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} onMouseDown={(event) => event.stopPropagation()}>
        <h2 id={titleId} className="font-display text-lg font-semibold">{title}</h2>
        <div id={descriptionId} className="mt-2 text-sm text-muted-foreground">{description}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={confirming}>{cancelLabel}</Button>
          <Button type="button" variant={confirmVariant} onClick={() => void handleConfirm()} disabled={confirming}>
            {confirming ? confirmingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export { ConfirmationModal };
