import { LAKES, LAKE_BY_ID, TIME_MACHINE } from './data.js';

const API_BASE = 'http://localhost:8080/api';

export const backendState = {
  connected: false,
  seismicCount: 0,
  liveReason: '',
  urduLevel: '',
  scanMeta: null,
};

export async function syncWithBackend() {
  try {
    const res = await fetch(`${API_BASE}/shisper/live`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    backendState.connected = true;
    backendState.seismicCount = payload.seismic_events_m35 || 0;
    backendState.scanMeta = payload.scan_metadata || null;

    // 1. Merge real risk_model.py output into Shisper Lake in LAKES & LAKE_BY_ID
    const shisper = LAKE_BY_ID.get('shisper');
    if (shisper && payload.shisper_override) {
      Object.assign(shisper, payload.shisper_override);
      backendState.liveReason = payload.shisper_override.reason || '';
      backendState.urduLevel = payload.shisper_override.urduAlertLevel || '';
    }

    console.info('[GlacierWatch] Synced with Python backend:', backendState.scanMeta);
    return true;
  } catch (err) {
    backendState.connected = false;
    console.warn('[GlacierWatch] Python backend unreachable, running on local data.js snapshot:', err.message);
    return false;
  }
}

export function getVoiceAudioUrl(lakeId, urduText) {
  const params = new URLSearchParams({ text: urduText });
  return `${API_BASE}/alerts/${encodeURIComponent(lakeId)}/voice.mp3?${params.toString()}`;
}

export async function dispatchAlertToBackend(lakeId) {
  const res = await fetch(`${API_BASE}/alerts/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lake_id: lakeId,
      officer_phone: localStorage.getItem('user_phone') || null,
    }),
  });
  if (!res.ok) throw new Error(`Dispatch failed (${res.status})`);
  return res.json();
}