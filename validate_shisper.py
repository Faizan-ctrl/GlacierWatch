import pandas as pd

# Load the official ground-truth events CSV and your measured CSV
# (Make sure to adjust your measured CSV filename if it differs, e.g., 'shisper_area_measured.csv')
official_df = pd.read_csv("shisper_events.csv")

print("--- Official Shisper Dataset Overview ---")
print(f"Total historical records loaded: {len(official_df)}")
print(official_df.head(10))

# Quick summary statistics of Portsmouth lake area and volume
print("\n--- Lake Volume & Area Statistics ---")
if 'Shape_Area' in official_df.columns:
    print(f"Max Recorded Area: {official_df['Shape_Area'].max():.2f} sq meters")
if 'Volume' in official_df.columns:
    print(f"Max Recorded Volume: {official_df['Volume'].max():.2f} cubic meters")