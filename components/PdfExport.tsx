"use client";

import { useState } from "react";
import { getAnecdotes } from "@/lib/storage";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export default function PdfExport() {
  const [generating, setGenerating] = useState(false);

  async function handleExport() {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const all = getAnecdotes().sort((a, b) => a.date.localeCompare(b.date));

      if (all.length === 0) {
        alert("Geen anekdotes om te exporteren.");
        setGenerating(false);
        return;
      }

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Title page
      doc.setFontSize(36);
      doc.setFont("helvetica", "bold");
      doc.text("Anekdotes", pageWidth / 2, 80, { align: "center" });

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 140);
      doc.text("Mijn levensverhalen", pageWidth / 2, 95, { align: "center" });

      doc.setFontSize(11);
      doc.text(`${all.length} verhalen`, pageWidth / 2, 110, { align: "center" });

      const dateRange = `${formatDate(all[0].date)} - ${formatDate(all[all.length - 1].date)}`;
      doc.text(dateRange, pageWidth / 2, 120, { align: "center" });

      doc.setTextColor(180, 180, 200);
      doc.setFontSize(9);
      doc.text(`Geexporteerd op ${new Date().toLocaleDateString("nl-NL")}`, pageWidth / 2, pageHeight - 30, { align: "center" });

      // Table of contents
      doc.addPage();
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Inhoudsopgave", margin, 30);

      let tocY = 45;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      for (let i = 0; i < all.length; i++) {
        const a = all[i];
        if (tocY > pageHeight - 20) {
          doc.addPage();
          tocY = 30;
        }
        doc.setTextColor(100, 100, 120);
        const dateText = formatDate(a.date);
        doc.text(dateText, margin, tocY);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        const truncTitle = a.subject.length > 50 ? a.subject.slice(0, 50) + "..." : a.subject;
        doc.text(truncTitle, margin + 50, tocY);
        doc.setFont("helvetica", "normal");
        tocY += 7;
      }

      // Anecdotes
      for (const a of all) {
        doc.addPage();
        let y = 30;

        // Subject
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        const subjectLines = doc.splitTextToSize(a.subject, contentWidth);
        doc.text(subjectLines, margin, y);
        y += subjectLines.length * 8 + 4;

        // Date, location, mood
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 90, 220);
        const meta = [formatDate(a.date), a.location, a.mood].filter(Boolean).join("  |  ");
        doc.text(meta, margin, y);
        y += 8;

        // People
        if (a.people.length > 0) {
          doc.setTextColor(100, 100, 120);
          doc.text(`Personen: ${a.people.join(", ")}`, margin, y);
          y += 7;
        }

        // Tags
        if (a.tags.length > 0) {
          doc.setTextColor(100, 100, 120);
          doc.text(`Tags: ${a.tags.join(", ")}`, margin, y);
          y += 7;
        }

        y += 4;

        // Separator
        doc.setDrawColor(200, 200, 220);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        // Story
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 60);
        doc.setFont("helvetica", "normal");
        const storyLines = doc.splitTextToSize(a.story, contentWidth);

        for (const line of storyLines) {
          if (y > pageHeight - 25) {
            doc.addPage();
            y = 25;
          }
          doc.text(line, margin, y);
          y += 6;
        }
      }

      doc.save(`anekdotes-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (e) {
      console.error("PDF export error:", e);
      alert("Fout bij PDF export. Probeer opnieuw.");
    }
    setGenerating(false);
  }

  return (
    <button className="btn btn-sm" onClick={handleExport} disabled={generating}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
      {generating ? "Bezig..." : "Download als PDF"}
    </button>
  );
}
