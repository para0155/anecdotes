"use client";

import { useState, useRef, useCallback } from "react";
import { isSpeechSupported, startListening } from "@/lib/speech";

interface Props {
  onComplete: (text: string) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onComplete, onCancel }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const sessionRef = useRef<ReturnType<typeof startListening>>(null);

  const supported = isSpeechSupported();

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      sessionRef.current?.stop();
      sessionRef.current = null;
      setIsRecording(false);
      return;
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
      }
    );

    sessionRef.current = session;
  }, [isRecording]);

  if (!supported) {
    return (
      <div className="voice-modal">
        <h2>Spraakherkenning niet beschikbaar</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Je browser ondersteunt geen spraakherkenning. Gebruik Chrome of Edge voor de beste ervaring.
        </p>
        <button className="btn" onClick={onCancel}>Sluiten</button>
      </div>
    );
  }

  const fullText = transcript + (interim ? (transcript ? " " : "") + interim : "");

  return (
    <div className="voice-modal">
      <h2>Spreek je anekdote in</h2>

      <p className="voice-hint">
        {isRecording
          ? "Aan het luisteren... Spreek je verhaal in."
          : transcript
            ? "Klik op de microfoon om verder te gaan, of gebruik de tekst."
            : "Klik op de microfoon om te beginnen."
        }
      </p>

      <button
        className={`mic-btn ${isRecording ? "active" : ""}`}
        onClick={toggleRecording}
        style={{ width: 72, height: 72 }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        {interim && (
          <span style={{ color: "var(--text-dim)" }}> {interim}</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        <button className="btn" style={{ flex: 1 }} onClick={onCancel}>Annuleer</button>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={() => onComplete(fullText)}
          disabled={!transcript.trim()}
        >
          Gebruik tekst
        </button>
      </div>
    </div>
  );
}
