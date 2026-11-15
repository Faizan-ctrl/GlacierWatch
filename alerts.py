import pandas as pd
import os

BASE_DIR = r"C:\Users\zawar\Desktop\GlacierWatchFinal"
SCORES_CSV = os.path.join(BASE_DIR, "glacierwatch_risk_scores.csv")

def translate_to_urdu(alert_level):
    """Maps alert levels to Urdu translation strings for local dissemination."""
    mapping = {
        "HIGH ALERT": "خترناک الرٹ (High Alert)",
        "MODERATE WATCH": "درمیانہ انتباہ (Moderate Watch)",
        "LOW / NORMAL": "معمول کے مطابق (Low / Normal)"
    }
    return mapping.get(alert_level, alert_level)

def generate_alerts():
    if not os.path.exists(SCORES_CSV):
        print(f"Error: Could not find {SCORES_CSV}. Please run risk_model.py first.")
        return
    
    df = pd.read_csv(SCORES_CSV)
    
    print("\n" + "="*60)
    print("       GLACIERWATCH AUTOMATED DISPATCH & ALERT FEED")
    print("="*60 + "\n")
    
    for _, row in df.iterrows():
        date = row["Date"]
        score = row["Total_Score"]
        level = row["Alert_Level"]
        urdu_level = translate_to_urdu(level)
        seismic = row["Seismic_Watch"]
        reason = row["Reason"]
        
        # Highlight high alert rows visually in terminal
        marker = "🚨 [CRITICAL DISPATCH]" if level == "HIGH ALERT" else "ℹ️  [STATUS UPDATE]"
        
        print(f"{marker} Date: {date} | Score: {score}/100")
        print(f"   Status Tier : {level} | اردو: {urdu_level}")
        print(f"   Seismic Flag: {seismic}")
        print(f"   Explanation : {reason}")
        print("-" * 60)

if __name__ == "__main__":
    generate_alerts()