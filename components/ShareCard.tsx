"use client";

import { useState } from "react";
import { Anecdote } from "@/lib/types";

interface Props {
  anecdote: Anecdote;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Limit to avoid huge images
  if (lines.length > 8) {
    lines.length = 8;
    lines[7] = lines[7] + "...";
  }

  return lines;
}

export default function ShareCard({ anecdote }: Props) {
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");

  async function generate() {
    setStatus("generating");
    try {
      const canvas = document.createElement("canvas");
      const width = 800;
      const padding = 60;
      const ctx = canvas.getContext("2d")!;

      // Measure text to determine height
      canvas.width = width;
      canvas.height = 1000; // temporary

      // Set font for story text
      ctx.font = "italic 22px 'Georgia', serif";
      const storyLines = wrapText(ctx, `"${anecdote.story}"`, width - padding * 2);

      // Calculate actual height needed
      const headerHeight = 80;
      const storyHeight = storyLines.length * 34 + 20;
      const footerHeight = 100;
      const totalHeight = headerHeight + storyHeight + footerHeight + padding * 2;
      canvas.height = totalHeight;

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, width, totalHeight);
      grad.addColorStop(0, "#0c0c1e");
      grad.addColorStop(0.5, "#1a1035");
      grad.addColorStop(1, "#0c0c1e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, totalHeight);

      // Subtle accent glow
      const glow = ctx.createRadialGradient(width / 2, totalHeight / 2, 0, width / 2, totalHeight / 2, 300);
      glow.addColorStop(0, "rgba(139, 108, 255, 0.08)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, totalHeight);

      let y = padding;

      // Mood
      if (anecdote.mood) {
        ctx.font = "32px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(anecdote.mood, padding, y + 30);
        y += 10;
      }

      // Subject
      ctx.font = "bold 28px 'Inter', sans-serif";
      ctx.fillStyle = "#f0f0f5";
      ctx.fillText(anecdote.subject, padding + (anecdote.mood ? 44 : 0), y + 28);
      y += headerHeight;

      // Decorative line
      const lineGrad = ctx.createLinearGradient(padding, y, width - padding, y);
      lineGrad.addColorStop(0, "transparent");
      lineGrad.addColorStop(0.3, "rgba(139, 108, 255, 0.5)");
      lineGrad.addColorStop(0.7, "rgba(139, 108, 255, 0.5)");
      lineGrad.addColorStop(1, "transparent");
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      y += 30;

      // Story text
      ctx.font = "italic 22px 'Georgia', serif";
      ctx.fillStyle = "#c0c0d8";
      for (const line of storyLines) {
        ctx.fillText(line, padding, y);
        y += 34;
      }
      y += 20;

      // Footer line
      ctx.strokeStyle = lineGrad;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      y += 24;

      // Date & location
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "#8b6cff";
      const meta = [formatDate(anecdote.date), anecdote.location].filter(Boolean).join(" \u00B7 ");
      ctx.fillText(meta, padding, y);

      // App name
      ctx.fillStyle = "#404058";
      ctx.font = "14px 'Inter', sans-serif";
      ctx.fillText("Anekdotes", width - padding - ctx.measureText("Anekdotes").width, y);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error("Kon afbeelding niet maken")), "image/png");
      });

      // Try clipboard first, fallback to download
      try {
        if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setStatus("done");
          setTimeout(() => setStatus("idle"), 3000);
          return;
        }
      } catch {
        // Fall through to download
      }

      // Download as fallback
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `anekdote-${anecdote.subject.slice(0, 20).replace(/\s+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <button
      className="btn"
      onClick={generate}
      disabled={status === "generating"}
      style={{ flex: 1 }}
    >
      {status === "generating" ? (
        "Genereren..."
      ) : status === "done" ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Gekopieerd!
        </>
      ) : status === "error" ? (
        "Fout - probeer opnieuw"
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Deel als afbeelding
        </>
      )}
    </button>
  );
}
