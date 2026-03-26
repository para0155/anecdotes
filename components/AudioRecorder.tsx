"use client";

import { useState, useRef } from "react";
import { Attachment } from "@/lib/types";
import { saveFile } from "@/lib/attachments";

interface Props {
  onRecorded: (attachment: Attachment) => void;
}

export default function AudioRecorder({ onRecorded }: Props) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await saveFile(id, blob);

        const att: Attachment = {
          id,
          type: "audio",
          name: `Opname ${new Date().toLocaleString("nl-NL")}`,
          mimeType: blob.type,
          size: blob.size,
          createdAt: new Date().toISOString(),
        };
        onRecorded(att);
        setDuration(0);
      };

      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      alert("Kon microfoon niet starten. Sta microfoontoegang toe in je browser.");
    }
  }

  function stopRecording() {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }

  function formatDuration(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {!recording ? (
        <button className="btn btn-sm" onClick={startRecording} style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
          </svg>
          Audio opnemen
        </button>
      ) : (
        <>
          <button className="btn btn-sm btn-danger recording-pulse" onClick={stopRecording}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
            </svg>
            Stoppen
          </button>
          <span style={{ fontSize: "0.9rem", color: "var(--danger)", fontFamily: "monospace" }}>
            {formatDuration(duration)}
          </span>
        </>
      )}
    </div>
  );
}
