"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export default function Modal({ title, subtitle, onClose, children, wide = false, error }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; wide?: boolean; error?: string }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return <div className="fm-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={`fm-modal__panel ${wide ? "fm-modal__panel--wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
      <header className="fm-modal__header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button type="button" aria-label="Close dialog" onClick={onClose}><X size={21} /></button></header>
      <div className="fm-modal__body">{error && <p className="fm-modal__error" role="alert">{error}</p>}{children}</div>
    </section>
  </div>;
}
