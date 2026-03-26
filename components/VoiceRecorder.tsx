"use client";

import { useState, useRef, useCallback } from "react";
import { isSpeechSupported, startListening, requestMicPermission } from "@/lib/speech";

interface Props {
  onComplete: (text: string) => void;
  onCancel: () => void;
}

type Mode = "browser" | "whisper";

export default function VoiceRecorder({ onComplete, onCancel }: Props) {
  const [mode, setMode] = useState<Mode>("whisper");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [processing, setProcessing] = useState(false);
  const sessionRef = useRef<ReturnType<typeof startListening>>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const browserSupported = isSpeechSupported();

  // ---- Whisper mode ----
  const toggleWhisperRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (chunksRef.current.length === 0) return;

        setProcessing(true);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });

        try {
          const formData = new FormData();
          formData.append("audio", blob, "audio.webm");

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "Fout bij spraakherkenning");
          } else if (data.text) {
            setTranscript(prev => prev + (prev ? " " : "") + data.text);
          }
        } catch {
          setError("Kon niet verbinden met de server. Probeer de browser-modus.");
        }
        setProcessing(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setError("Microfoon toegang geweigerd. Sta microfoon toe in je browserinstellingen.");
    }
  }, [isRecording]);

  // ---- Browser Speech API mode ----
  const toggleBrowserRecording = useCallback(async () => {
    if (isRecording) {
      sessionRef.current?.stop();
      sessionRef.current = null;
      setIsRecording(false);
      return;
    }

    setError("");

    if (!permissionAsked) {
      const allowed = await requestMicPermission();
      setPermissionAsked(true);
      if (!allowed) {
        setError("Microfoon toegang geweigerd. Sta microfoon toe in je browserinstellingen.");
        return;
      }
    }

    setIsRecording(true);
    setInterim("");

    const session = startListening(
      (text, isFinal) => {
        if (isFinal) {
          setTranscript(prev => prev + (prev ? " " : "") + text);
          setInterim("");
        } else {
          setInterim(text);
        }
      },
      () => {
        setIsRecording(false);
        sessionRef.current = null;
      },
      (errMsg) => {
        setError(errMsg);
        setIsRecording(false);
        sessionRef.current = null;
      }
    );

    if (!session) {
      setIsRecording(false);
    } else {
      sessionRef.current = session;
    }
  }, [isRecording, permissionAsked]);

  const toggleRecording = mode === "whisper" ? toggleWhisperRecording : toggleBrowserRecording;

  const fullText = transcript + (interim ? (transcript ? " " : "") + interim : "");

  return (
    <div className="voice-modal">
      <h2>Spreek je anekdote in</h2>

      {/* Mode switcher */}
      <div style={{ display: "flex", gap: 6, background: "var(--bg-input)", borderRadius: "var(--radius-sm)", padding: 4 }}>
        <button
          onClick={() => { if (!isRecording) setMode("whisper"); }}
          style={{
            flex: 1, padding: "8px 12px", borderRadius: "var(--radius-xs)",
            border: "none", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
            fontFamily: "inherit",
            background: mode === "whisper" ? "var(--accent-light)" : "transparent",
            color: mode === "whisper" ? "var(--accent)" : "var(--text-muted)",
            transition: "all 0.2s",
          }}
        >
          Whisper AI
        </button>
        <button
          onClick={() => { if (!isRecording) setMode("browser"); }}
          style={{
            flex: 1, padding: "8px 12px", borderRadius: "var(--radius-xs)",
            border: "none", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
            fontFamily: "inherit",
            background: mode === "browser" ? "var(--accent-light)" : "transparent",
            color: mode === "browser" ? "var(--accent)" : "var(--text-muted)",
            opacity: !browserSupported && mode !== "browser" ? 0.5 : 1,
            transition: "all 0.2s",
          }}
          disabled={!browserSupported}
        >
          Browser {!browserSupported && "(n/a)"}
        </button>
      </div>

      <p className="voice-hint">
        {processing
          ? "Tekst wordt verwerkt..."
          : isRecording
            ? "Aan het luisteren... Spreek je verhaal in."
            : transcript
              ? "Klik op de microfoon om verder te gaan, of gebruik de tekst."
              : "Klik op de microfoon om te beginnen."
        }
      </p>

      {error && <div className="error-box">{error}</div>}

      <button
        className={`mic-btn ${isRecording ? "active" : ""}`}
        onClick={toggleRecording}
        disabled={processing}
        style={{ width: 80, height: 80, marginTop: 4, marginBottom: 4, opacity: processing ? 0.5 : 1 }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </button>

      <div className="voice-transcript">
        {fullText || (
          <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>
            Je tekst verschijnt hier...
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        <button className="btn" style={{ flex: 1 }} onClick={onCancel}>Annuleer</button>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={() => onComplete(fullText)}
          disabled={!transcript.trim() || processing}
        >
          Gebruik tekst
        </button>
      </div>
    </div>
  );
}
