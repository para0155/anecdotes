"use client";

import { useState, useRef } from "react";

interface Props {
  children: React.ReactNode;
  onDelete: () => void;
}

export default function SwipeableCard({ children, onDelete }: Props) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    setSwiping(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!swiping) return;
    const diffX = e.touches[0].clientX - startX.current;
    const diffY = e.touches[0].clientY - startY.current;

    // Determine direction on first significant move
    if (isHorizontal.current === null && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
      isHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
    }

    if (!isHorizontal.current) return;

    // Only allow swipe left (negative)
    const clamped = Math.min(0, Math.max(-100, diffX));
    setOffset(clamped);
  }

  function handleTouchEnd() {
    setSwiping(false);
    if (offset < -60) {
      setOffset(-90);
      setShowConfirm(true);
    } else {
      setOffset(0);
      setShowConfirm(false);
    }
    isHorizontal.current = null;
  }

  function handleConfirmDelete() {
    onDelete();
    setOffset(0);
    setShowConfirm(false);
  }

  function handleCancelSwipe() {
    setOffset(0);
    setShowConfirm(false);
  }

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--radius)" }}>
      {/* Delete background */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 90,
          background: showConfirm ? "var(--danger)" : "var(--danger-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: showConfirm ? "background 0.2s" : undefined,
        }}
      >
        {showConfirm ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
            <button
              onClick={handleConfirmDelete}
              style={{
                background: "white",
                color: "var(--danger)",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Ja
            </button>
            <button
              onClick={handleCancelSwipe}
              style={{
                background: "none",
                color: "white",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: "0.7rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Nee
            </button>
          </div>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        )}
      </div>

      {/* Card content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: swiping ? "none" : "transform 0.3s ease",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
