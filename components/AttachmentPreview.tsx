"use client";

import { useState, useEffect } from "react";
import { Attachment } from "@/lib/types";
import { getFileUrl, formatFileSize } from "@/lib/attachments";

interface Props {
  attachment: Attachment;
  onRemove?: () => void;
  large?: boolean;
}

export default function AttachmentPreview({ attachment, onRemove, large }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    getFileUrl(attachment.id).then(u => {
      objectUrl = u;
      setUrl(u);
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.id]);

  const size = large ? 200 : 80;

  if (attachment.type === "image") {
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={attachment.name}
            style={{
              width: size, height: size,
              objectFit: "cover",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
            }}
          />
        ) : (
          <div style={{
            width: size, height: size,
            background: "var(--bg-input)",
            borderRadius: "var(--radius-sm)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-dim)", fontSize: "0.8rem",
          }}>
            Laden...
          </div>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            style={{
              position: "absolute", top: -6, right: -6,
              width: 22, height: 22, borderRadius: "50%",
              background: "var(--danger)", color: "white",
              border: "none", cursor: "pointer",
              fontSize: "0.75rem", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            x
          </button>
        )}
      </div>
    );
  }

  // Audio
  return (
    <div style={{
      background: "var(--bg-input)",
      borderRadius: "var(--radius-sm)",
      padding: large ? "12px 16px" : "8px 12px",
      border: "1px solid var(--border)",
      display: "flex", alignItems: "center", gap: 8,
      position: "relative",
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
      <div>
        <div style={{ fontSize: "0.85rem", color: "var(--text)" }}>{attachment.name}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{formatFileSize(attachment.size)}</div>
        {url && large && (
          <audio controls src={url} style={{ marginTop: 6, width: "100%", height: 32 }} />
        )}
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            position: "absolute", top: -6, right: -6,
            width: 22, height: 22, borderRadius: "50%",
            background: "var(--danger)", color: "white",
            border: "none", cursor: "pointer",
            fontSize: "0.75rem", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          x
        </button>
      )}
    </div>
  );
}
