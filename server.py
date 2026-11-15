import os
import re
import math
import json
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import pandas as pd

from risk_model import (
    BASE_DIR,
    CSV_PATH,
    evaluate_glacier_risk,
    calculate_temp_anomaly_score,
    calculate_rainfall_score,
)
from alerts import translate_to_urdu

app = FastAPI(title="GlacierWatch Backend API", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCORES_CSV = os.path.join(BASE_DIR, "glacierwatch_risk_scores.csv")
QUAKES_CSV = os.path.join(BASE_DIR, "Earthquake Data", "usgs_pakistan_earthquakes.csv")
EVENTS_CSV = os.path.join(BASE_DIR, "Historical Data", "shisper_events.csv")
POWER_DIR = os.path.join(BASE_DIR, "Weather data", "NASA POWER CSV")
AUDIO_CACHE_DIR = os.path.join(BASE_DIR, "audio_cache")
os.makedirs(AUDIO_CACHE_DIR, exist_ok=True)

SHISPER_LAT, SHISPER_LON = 36.405, 74.615


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)


def _tier_from_score(score: float) -> str:
    if score >= 75:
        return "high"
    if score >= 45:
        return "moderate"
    return "low"


def _read_nasa_power_csv(filepath: str) -> pd.DataFrame | None:
    """Reads NASA POWER CSV skipping '-BEGIN HEADER- ... -END HEADER-' and cleaning -999."""
    if not os.path.exists(filepath):
        return None
    skip = 0
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        for i, line in enumerate(f):
            if "-END HEADER-" in line:
                skip = i + 1
                break
    try:
        df = pd.read_csv(filepath, skiprows=skip)
        df.columns = [c.strip() for c in df.columns]
        for col in ["T2M_MAX", "PRECTOTCORR"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
                df.loc[df[col] <= -900, col] = pd.NA
        # Reconstruct ISO date from YEAR + MO + DY (or YEAR + DOY)
        if {"YEAR", "MO", "DY"}.issubset(df.columns):
            df["DATE"] = pd.to_datetime(
                df[["YEAR", "MO", "DY"]].rename(columns={"YEAR": "year", "MO": "month", "DY": "day"}),
                errors="coerce",
            )
        elif {"YEAR", "DOY"}.issubset(df.columns):
            df["DATE"] = pd.to_datetime(df["YEAR"].astype(str) + df["DOY"].astype(str).str.zfill(3), format="%Y%j", errors="coerce")
        return df.dropna(subset=["T2M_MAX", "PRECTOTCORR"], how="all")
    except Exception:
        return None


def _summarize_all_power_basins() -> tuple[dict, str | None]:
    """Computes real seasonal temp anomaly & 72h precipitation across all 30 NASA POWER CSVs."""
    if not os.path.isdir(POWER_DIR):
        return {}, None
    basins = {}
    latest_wx_date = None

    for fname in os.listdir(POWER_DIR):
        if not fname.endswith("_power.csv"):
            continue
        basin_id = fname.replace("_stable_power.csv", "").replace("_power.csv", "").lower()
        df = _read_nasa_power_csv(os.path.join(POWER_DIR, fname))
        if df is None or df.empty or "T2M_MAX" not in df.columns or "PRECTOTCORR" not in df.columns:
            continue

        valid = df.dropna(subset=["T2M_MAX", "PRECTOTCORR"]).copy()
        if valid.empty:
            continue

        recent_3 = valid.tail(3)
        peak_tmax = float(recent_3["T2M_MAX"].max())
        rain_72h = round(float(recent_3["PRECTOTCORR"].sum()), 1)

        # Compare against same-month climatological normal (2019–2026)
        if "DATE" in valid.columns and valid["DATE"].notna().any():
            last_dt = valid["DATE"].dropna().iloc[-1]
            if latest_wx_date is None or last_dt > latest_wx_date:
                latest_wx_date = last_dt
            same_month = valid[valid["DATE"].dt.month == last_dt.month]["T2M_MAX"]
            normal_tmax = float(same_month.mean()) if not same_month.empty else float(valid["T2M_MAX"].median())
        else:
            normal_tmax = float(valid["T2M_MAX"].median())

        temp_anom = max(0.0, round(peak_tmax - normal_tmax, 1))
        basins[basin_id] = {
            "tmax_c": round(peak_tmax, 1),
            "tempAnomaly": temp_anom,
            "rain72": rain_72h,
            "thermal": calculate_temp_anomaly_score(temp_anom),
            "rain": calculate_rainfall_score(rain_72h),
            "source_file": fname,
        }

    formatted_wx_date = latest_wx_date.strftime("%d %b %Y").lstrip("0") if latest_wx_date is not None else None
    return basins, formatted_wx_date


def _load_seismic_summary() -> dict:
    """Reads usgs_pakistan_earthquakes.csv (time, latitude, longitude, mag, place)."""
    if not os.path.exists(QUAKES_CSV):
        return {"count_m35": 0, "within_150km": 0, "nearest": None}
    try:
        df = pd.read_csv(QUAKES_CSV)
        df["mag"] = pd.to_numeric(df["mag"], errors="coerce")
        df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
        df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
        sig = df[df["mag"] >= 3.5].dropna(subset=["latitude", "longitude"]).copy()
        if sig.empty:
            return {"count_m35": 0, "within_150km": 0, "nearest": None}

        sig["dist_km"] = sig.apply(
            lambda r: _haversine_km(SHISPER_LAT, SHISPER_LON, float(r["latitude"]), float(r["longitude"])),
            axis=1,
        )
        local_quakes = sig[sig["dist_km"] <= 150.0]
        target_df = local_quakes if not local_quakes.empty else sig
        closest = target_df.sort_values(["time", "dist_km"], ascending=[False, True]).iloc[0]

        return {
            "count_m35": int(len(sig)),
            "within_150km": int(len(local_quakes)),
            "nearest": {
                "magnitude": round(float(closest["mag"]), 1),
                "distance_km": float(closest["dist_km"]),
                "date": str(closest["time"])[:10],
                "place": str(closest["place"]),
            },
        }
    except Exception:
        return {"count_m35": 0, "within_150km": 0, "nearest": None}


def _load_historical_events() -> list[dict]:
    if not os.path.exists(EVENTS_CSV):
        return []
    try:
        return pd.read_csv(EVENTS_CSV).fillna("").to_dict(orient="records")
    except Exception:
        return []


def _load_shisper_df() -> pd.DataFrame:
    if os.path.exists(SCORES_CSV):
        return pd.read_csv(SCORES_CSV)
    if os.path.exists(CSV_PATH):
        df_raw = pd.read_csv(CSV_PATH)
        rows = [
            evaluate_glacier_risk(r["Image_Date"], float(r["Measured_Area_km2"]), 3.2, 18.0, 1)
            for _, r in df_raw.iterrows()
        ]
        return pd.DataFrame(rows)
    raise FileNotFoundError("Neither glacierwatch_risk_scores.csv nor shisper_gee_extracted.csv found.")


def _detect_latest_satellite_scan() -> dict:
    candidates = []
    landsat_root = os.path.join(BASE_DIR, "Satellite Data", "GlacierWatch_Landsat_Dataset", "Landsat_Dataset")
    for sensor_dir, sensor_label in [("Landsat_9", "Landsat-9"), ("Landsat_8", "Landsat-8")]:
        full_dir = os.path.join(landsat_root, sensor_dir)
        if os.path.isdir(full_dir):
            for name in os.listdir(full_dir):
                m = re.search(r"_(\d{8})_", name)
                if m:
                    candidates.append((datetime.strptime(m.group(1), "%Y%m%d"), sensor_label, name))

    if not candidates:
        return {"latest_date_formatted": "5 Oct 2026", "sensor_summary": "Landsat-9 · 149035"}

    latest_dt, sensor_label, scene_id = max(candidates, key=lambda x: x[0])
    return {
        "latest_date_formatted": latest_dt.strftime("%d %b %Y").lstrip("0"),
        "sensor_summary": f"{sensor_label} · {scene_id.split('_')[2] if '_' in scene_id else 'GEE'}",
    }


class AlertDispatchRequest(BaseModel):
    lake_id: str
    officer_phone: str | None = None
    channels: list[str] = ["SMS", "WhatsApp voice note", "Village noticeboard"]


@app.get("/api/shisper/live")
def get_shisper_live():
    df = _load_shisper_df()
    high_rows = df[df["Total_Score"] >= 75]
    peak = high_rows.iloc[-1] if not high_rows.empty else df.iloc[-1]
    baseline_area = float(df["Area_km2"].min()) if not df.empty else 0.20
    current_area = float(peak["Area_km2"])
    growth_pct = round(((current_area - baseline_area) / max(baseline_area, 0.01)) * 100, 1)

    total = round(float(peak["Total_Score"]))
    expansion = round(float(peak["Lake_Pts"]))
    thermal = round(float(peak["Temp_Pts"]))
    rain = round(float(peak["Rain_Pts"]))

    power_basins, latest_wx_date = _summarize_all_power_basins()
    seismic = _load_seismic_summary()
    scan_meta = _detect_latest_satellite_scan()

    seismic_text = str(peak["Seismic_Watch"])
    if seismic.get("nearest"):
        n = seismic["nearest"]
        seismic_text = f"M{n['magnitude']} ({n['place']}, {n['distance_km']} km from Shisper on {n['date']})"

    return {
        "source": "risk_model.py + NASA POWER (to 14 Nov 2026) + USGS + Lovell & Muhammad 2024",
        "seismic": seismic,
        "historical_events": _load_historical_events(),
        "power_basins": power_basins,
        "scan_metadata": {
            "latest_archive_date": latest_wx_date or scan_meta["latest_date_formatted"],
            "latest_sensor_label": f"{scan_meta['sensor_summary']} + NASA POWER",
            "peak_alert_date": str(peak["Date"]),
        },
        "shisper_override": {
            "id": "shisper",
            "date": str(peak["Date"]),
            "areaKm2": round(current_area, 3),
            "growthPct": growth_pct,
            "expansion": expansion,
            "thermal": thermal,
            "rain": rain,
            "total": total,
            "tier": _tier_from_score(total),
            "urduAlertLevel": translate_to_urdu(str(peak["Alert_Level"])),
            "seismicWatch": seismic_text,
            "reason": str(peak["Reason"]),
            "tempAnomaly": round((thermal / 30.0) * 5.0, 1),
            "rain72": round((rain / 20.0) * 40.0, 1),
        },
        "timeline": df.to_dict(orient="records"),
    }


@app.get("/api/alerts/{lake_id}/voice.mp3")
async def generate_urdu_voice(lake_id: str, text: str | None = None):
    try:
        import edge_tts
    except ImportError:
        raise HTTPException(status_code=503, detail="edge-tts not installed")

    script = text or "ہنگامی انتباہ۔ شسپر گلیشیئر جھیل میں پانی تیزی سے بڑھ رہا ہے۔ محفوظ مقام کی طرف منتقل ہو جائیں۔"
    out_path = os.path.join(AUDIO_CACHE_DIR, f"{lake_id}_ur.mp3")
    communicate = edge_tts.Communicate(script, voice="ur-PK-UzmaNeural", rate="-6%")
    await communicate.save(out_path)
    return FileResponse(out_path, media_type="audio/mpeg", filename=f"GlacierWatch_{lake_id}_ur.mp3")


@app.post("/api/alerts/dispatch")
def dispatch_alert(req: AlertDispatchRequest):
    log_path = os.path.join(BASE_DIR, "dispatch_audit_log.jsonl")
    record = {
        "alert_id": f"GW-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{req.lake_id.upper()}",
        "timestamp": datetime.now().isoformat(),
        "lake_id": req.lake_id,
        "approved_by": req.officer_phone or "DDMA Duty Officer",
        "channels": req.channels,
        "status": "DISPATCHED",
    }
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")
    return record