"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Attachment } from "@/lib/types";
import { getFileUrl } from "@/lib/attachments";

interface Props {
  attachments: Attachment[];
}

export default function PhotoCarousel({ attachments }: Props) {
  const photos = attachments.filter(a => a.type === "image");
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const touchStart = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const objectUrls: string[] = [];
    Promise.all(
      photos.map(async (p) => {
        const url = await getFileUrl(p.id);
        if (url) objectUrls.push(url);
        return { id: p.id, url };
      })
    ).then((results) => {
      const map: Record<string, string> = {};
      results.forEach((r) => {
        if (r.url) map[r.id] = r.url;
      });
      setUrls(map);
    });
    return () => {
      objectUrls.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachments]);

  const goTo = useCallback((idx: number) => {
    setCurrent(Math.max(0, Math.min(idx, photos.length - 1)));
  }, [photos.length]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && current < photos.length - 1) goTo(current + 1);
      if (diff < 0 && current > 0) goTo(current - 1);
    }
    touchStart.current = null;
  }

  if (photos.length === 0) return null;

  if (photos.length === 1) {
    const url = urls[photos[0].id];
    return (
      <div>
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={photos[0].name}
              onClick={() => setFullscreen(true)}
              style={{
                width: "100%",
                maxHeight: 400,
                objectFit: "cover",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            />
            {fullscreen && (
              <div
                onClick={() => setFullscreen(false)}
                style={{
                  position: "fixed", inset: 0, zIndex: 200,
                  background: "rgba(0,0,0,0.9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={photos[0].name} style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain" }} />
              </div>
            )}
          </>
        ) : (
          <div style={{ width: "100%", height: 200, background: "var(--bg-input)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)" }}>
            Laden...
          </div>
        )}
      </div>
    );
  }

  // Multiple photos - carousel
  const currentUrl = urls[photos[current]?.id];

  return (
    <div>
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ position: "relative", overflow: "hidden", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
      >
        {currentUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt={photos[current]?.name}
              onClick={() => setFullscreen(true)}
              style={{
                width: "100%",
                height: 300,
                objectFit: "cover",
                display: "block",
                cursor: "pointer",
                transition: "opacity 0.3s ease",
              }}
            />
          </>
        ) : (
          <div style={{ width: "100%", height: 300, background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)" }}>
            Laden...
          </div>
        )}

        {/* Navigation arrows */}
        {current > 0 && (
          <button
            onClick={() => goTo(current - 1)}
            style={{
              position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(0,0,0,0.5)", border: "none", color: "white",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}
        {current < photos.length - 1 && (
          <button
            onClick={() => goTo(current + 1)}
            style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(0,0,0,0.5)", border: "none", color: "white",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 6 15 12 9 18"/></svg>
          </button>
        )}

        {/* Counter badge */}
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "rgba(0,0,0,0.6)", borderRadius: 12,
          padding: "3px 10px", fontSize: "0.75rem", color: "white", fontWeight: 600,
        }}>
          {current + 1} / {photos.length}
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? 20 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              background: i === current ? "var(--accent)" : "var(--text-dim)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Fullscreen */}
      {fullscreen && currentUrl && (
        <div
          onClick={() => setFullscreen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUrl} alt={photos[current]?.name} style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain" }} />
        </div>
      )}
    </div>
  );
}
