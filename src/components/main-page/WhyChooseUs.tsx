"use client";

import React, { useRef, useState, useEffect } from "react";

type Props = {
  leftTitle?: string;
  rightTitle?: string;
  leftImg?: string;
  rightImg?: string;
  kpis?: { num: string; label: string }[];
  ctaHref?: string;
  ctaText?: string;
};

export default function WhyChooseUs({
  leftTitle = "Paper workflow",
  rightTitle = "QR workflow",
  leftImg = "",
  rightImg = "/assets/img/qr-menu.webp",
  kpis = [
    { num: "-30%", label: "printing costs" },
    { num: "+18%", label: "avg. ticket" },
    { num: "10m", label: "to launch" },
  ],
  ctaHref = "#demo",
  ctaText = "Open live demo",
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState(56);
  const dragging = useRef(false);

  useEffect(() => {
    const up = () => (dragging.current = false);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);

  const onDown = () => (dragging.current = true);
  const onMove = (clientX: number) => {
    if (!dragging.current || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - r.left, 0), r.width);
    setPos((x / r.width) * 100);
  };

  return (
    <section className="whyx-qrmenu" data-section="why">
      <div className="whyx-qrmenu__inner qr-container">
        <header className="whyx-qrmenu__head">
          <h2 className="whyx-qrmenu__title">
            <span className="whyx-qrmenu__title-top">Why teams switch</span>
            <span className="whyx-qrmenu__title-bottom">from paper to QR</span>
          </h2>
          <p className="whyx-qrmenu__subtitle">Drag the handle to compare. Less waiting, less reprints, more orders.</p>
        </header>

        <div
          className="whyx-qrmenu__compare"
          ref={wrapRef}
          onMouseMove={(e) => onMove(e.clientX)}
          onTouchMove={(e) => onMove(e.touches[0].clientX)}
        >
          <div className="whyx-qrmenu__pane whyx-qrmenu__pane--left">
            <img src={leftImg} alt="" className="whyx-qrmenu__img" />
            <div className="whyx-qrmenu__label whyx-qrmenu__label--left">{leftTitle}</div>
          </div>

          <div className="whyx-qrmenu__pane whyx-qrmenu__pane--right" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
            <img src={rightImg} alt="" className="whyx-qrmenu__img" />
            <div className="whyx-qrmenu__label whyx-qrmenu__label--right">{rightTitle}</div>
          </div>

          <button
            className="whyx-qrmenu__handle"
            style={{ left: `${pos}%` }}
            onMouseDown={onDown}
            onTouchStart={onDown}
            aria-label="Drag to compare"
          >
            <span className="whyx-qrmenu__handle-dot"></span>
          </button>

          <div className="whyx-qrmenu__rail"></div>
        </div>

        <ul className="whyx-qrmenu__kpis" aria-label="Impact">
          {kpis.map((k, i) => (
            <li className="kpi-qrmenu" key={i}>
              <span className="kpi-qrmenu__num">{k.num}</span>
              <span className="kpi-qrmenu__label">{k.label}</span>
            </li>
          ))}
        </ul>

        <div className="whyx-qrmenu__cta">
          <a href={ctaHref} className="btn btn--primary">{ctaText}</a>
        </div>
      </div>
    </section>
  );
}
