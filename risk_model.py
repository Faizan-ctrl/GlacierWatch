import pandas as pd
import os

# Base directory path
BASE_DIR = r"C:\Users\zawar\Desktop\GlacierWatchFinal"
CSV_PATH = os.path.join(BASE_DIR, "shisper_gee_extracted.csv")

def calculate_lake_expansion_score(current_area_km2, baseline_area_km2=0.20):
    """
    Calculates the Lake Expansion component (0 to 50 points).
    Scales proportionally from baseline (0.20 km2) up to critical surge capacity (0.38 km2).
    """
    if current_area_km2 <= baseline_area_km2:
        return 0.0
    
    # Calculate percentage growth relative to critical surge threshold (0.38 km2)
    max_critical_area = 0.38
    ratio = (current_area_km2 - baseline_area_km2) / (max_critical_area - baseline_area_km2)
    score = min(max(ratio * 50.0, 0.0), 50.0)
    return round(score, 1)

def calculate_temp_anomaly_score(temp_anomaly_c):
    """
    Calculates the Temperature Anomaly component (0 to 30 points).
    Scales up to +5.0°C heatwave anomaly above seasonal normal.
    """
    if temp_anomaly_c <= 0:
        return 0.0
    score = min((temp_anomaly_c / 5.0) * 30.0, 30.0)
    return round(score, 1)

def calculate_rainfall_score(rainfall_mm_72h):
    """
    Calculates the Rainfall component (0 to 20 points).
    Scales up to 40 mm cumulative 72-hour precipitation.
    """
    if rainfall_mm_72h <= 0:
        return 0.0
    score = min((rainfall_mm_72h / 40.0) * 20.0, 20.0)
    return round(score, 1)

def determine_alert_level(total_score):
    """Maps 0-100 score to operational alert tiers."""
    if total_score >= 75:
        return "HIGH ALERT"
    elif total_score >= 45:
        return "MODERATE WATCH"
    else:
        return "LOW / NORMAL"

def evaluate_glacier_risk(image_date, area_km2, temp_anomaly_c, rainfall_mm_72h, seismic_events_count=0):
    # 1. Calculate individual explainable sub-scores
    lake_pts = calculate_lake_expansion_score(area_km2)
    temp_pts = calculate_temp_anomaly_score(temp_anomaly_c)
    rain_pts = calculate_rainfall_score(rainfall_mm_72h)
    
    # 2. Total explainable score (Max 100; earthquakes add 0 points)
    total_score = round(lake_pts + temp_pts + rain_pts, 1)
    alert_level = determine_alert_level(total_score)
    
    # 3. Separate Seismic Watch Flag
    seismic_flag = "ACTIVE SEISMIC WATCH (M >= 3.5 detected)" if seismic_events_count > 0 else "No Recent Seismic Triggers"
    
    # 4. Generate plain-English explanation
    reasons = []
    if lake_pts >= 35:
        reasons.append(f"Rapid lake expansion ({area_km2} km², +{lake_pts}/50 pts)")
    elif lake_pts > 0:
        reasons.append(f"Moderate lake growth ({area_km2} km², +{lake_pts}/50 pts)")
    else:
        reasons.append(f"Lake extent stable/drained ({area_km2} km², 0/50 pts)")
        
    if temp_pts >= 18:
        reasons.append(f"Sustained heatwave anomaly (+{temp_anomaly_c}°C, +{temp_pts}/30 pts)")
    if rain_pts >= 10:
        reasons.append(f"Heavy 72h rainfall ({rainfall_mm_72h} mm, +{rain_pts}/20 pts)")
        
    explanation = " | ".join(reasons)
    
    return {
        "Date": image_date,
        "Area_km2": area_km2,
        "Lake_Pts": lake_pts,
        "Temp_Pts": temp_pts,
        "Rain_Pts": rain_pts,
        "Total_Score": total_score,
        "Alert_Level": alert_level,
        "Seismic_Watch": seismic_flag,
        "Reason": explanation
    }

if __name__ == "__main__":
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Could not find {CSV_PATH}. Run fetch_shisper_gee.py first.")
        
    df_lake = pd.read_csv(CSV_PATH)
    
    # Simulated concurrent weather & seismic telemetry matching the May 2022 heatwave + rain surge
    weather_timeline = {
        "2022-04-05": (0.8, 4.0, 0),
        "2022-04-10": (1.1, 6.0, 0),
        "2022-04-15": (1.5, 8.0, 0),
        "2022-05-10": (3.2, 18.0, 1),
        "2022-05-25": (4.5, 28.0, 1),  # Peak pre-outburst conditions -> Triggers HIGH ALERT (>= 75)
        "2022-06-14": (2.1, 10.0, 0),  # Post-outburst drained state -> Drops back to LOW
        "2022-06-24": (1.8, 5.0, 0),
        "2022-06-29": (2.0, 12.0, 0),
        "2022-07-04": (2.2, 15.0, 0),
        "2022-07-19": (2.5, 14.0, 0),
    }
    
    results = []
    for _, row in df_lake.iterrows():
        dt = row["Image_Date"]
        area = row["Measured_Area_km2"]
        temp_anom, rain_mm, quakes = weather_timeline.get(dt, (1.0, 5.0, 0))
        results.append(evaluate_glacier_risk(dt, area, temp_anom, rain_mm, quakes))
        
    df_risk = pd.DataFrame(results)
    
    print("\n=== GLACIERWATCH EXPLAINABLE RISK ASSESSMENT ===")
    print(df_risk[["Date", "Area_km2", "Lake_Pts", "Temp_Pts", "Rain_Pts", "Total_Score", "Alert_Level"]].to_string(index=False))
    
    # Print detailed alert card for the peak critical date
    peak_row = df_risk[df_risk["Date"] == "2022-05-25"].iloc[0]
    print("\n--- SAMPLE CRITICAL ALERT PAYLOAD (2022-05-25) ---")
    print(f"Status:        {peak_row['Alert_Level']} (Score: {peak_row['Total_Score']}/100)")
    print(f"Breakdown:     Lake {peak_row['Lake_Pts']}/50 | Temp {peak_row['Temp_Pts']}/30 | Rain {peak_row['Rain_Pts']}/20")
    print(f"Seismic Flag:  {peak_row['Seismic_Watch']}")
    print(f"Explanation:   {peak_row['Reason']}")
    
    # Save final scored dataset for the dashboard & Time Machine replay
    out_csv = os.path.join(BASE_DIR, "glacierwatch_risk_scores.csv")
    df_risk.to_csv(out_csv, index=False)
    print(f"\nSaved full risk assessment timeline to: {out_csv}")