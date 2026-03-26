"use client";

import { useState, useEffect, useCallback } from "react";
import { Anecdote } from "@/lib/types";
import { getAnecdotes } from "@/lib/storage";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then(m => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then(m => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then(m => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then(m => m.Popup),
  { ssr: false }
);

interface GeoCache {
  [location: string]: { lat: number; lng: number } | null;
}

const GEO_CACHE_KEY = "anecdotes_geocache";

function loadGeoCache(): GeoCache {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveGeoCache(cache: GeoCache) {
  localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache));
}

async function geocode(location: string, cache: GeoCache): Promise<{ lat: number; lng: number } | null> {
  if (location in cache) return cache[location];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
      { headers: { "User-Agent": "AnecdotesApp/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      cache[location] = coords;
      saveGeoCache(cache);
      return coords;
    }
    cache[location] = null;
    saveGeoCache(cache);
    return null;
  } catch {
    return null;
  }
}

interface MarkerData {
  anecdote: Anecdote;
  lat: number;
  lng: number;
}

interface Props {
  onBack: () => void;
  onOpenDetail: (a: Anecdote) => void;
}

function MapInner({ markers, onOpenDetail }: { markers: MarkerData[]; onOpenDetail: (a: Anecdote) => void }) {
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    // Fix default marker icon
    import("leaflet").then(L => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      setLeafletReady(true);
    });
  }, []);

  if (!leafletReady || markers.length === 0) return null;

  const centerLat = markers.reduce((s, m) => s + m.lat, 0) / markers.length;
  const centerLng = markers.reduce((s, m) => s + m.lng, 0) / markers.length;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={6}
      style={{ height: "60vh", width: "100%", borderRadius: "var(--radius)", overflow: "hidden" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map(m => (
        <Marker key={m.anecdote.id} position={[m.lat, m.lng]}>
          <Popup>
            <div style={{ minWidth: 150, cursor: "pointer" }} onClick={() => onOpenDetail(m.anecdote)}>
              <strong>{m.anecdote.subject}</strong>
              <br />
              <span style={{ fontSize: "0.85em", color: "#666" }}>
                {m.anecdote.location} &middot; {m.anecdote.date}
              </span>
              <br />
              <span style={{ fontSize: "0.8em" }}>
                {m.anecdote.story.slice(0, 80)}{m.anecdote.story.length > 80 ? "..." : ""}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default function MapView({ onBack, onOpenDetail }: Props) {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadMarkers = useCallback(async () => {
    const all = getAnecdotes();
    const withLocation = all.filter(a => a.location);
    setTotal(withLocation.length);

    if (withLocation.length === 0) {
      setLoading(false);
      return;
    }

    const cache = loadGeoCache();
    const result: MarkerData[] = [];

    for (const a of withLocation) {
      const coords = await geocode(a.location!, cache);
      if (coords) {
        result.push({ anecdote: a, lat: coords.lat, lng: coords.lng });
      }
    }

    setMarkers(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  return (
    <div className="animate-in">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Terug
        </button>
      </div>

      <h1 style={{ marginBottom: 8 }}>Kaart</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 20 }}>
        {loading
          ? "Locaties worden geladen..."
          : `${markers.length} van ${total} locaties gevonden`
        }
      </p>

      {loading ? (
        <div style={{
          height: "60vh", display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--bg-card)", borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
        }}>
          <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
            <div className="recording-pulse" style={{ fontSize: "2rem", marginBottom: 8 }}>
              &#x1F30D;
            </div>
            Locaties zoeken...
          </div>
        </div>
      ) : markers.length === 0 ? (
        <div className="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="10" r="3"/>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          </svg>
          <h2>Geen locaties</h2>
          <p style={{ marginTop: 8 }}>Voeg locaties toe aan je anekdotes om ze op de kaart te zien</p>
        </div>
      ) : (
        <MapInner markers={markers} onOpenDetail={onOpenDetail} />
      )}
    </div>
  );
}
