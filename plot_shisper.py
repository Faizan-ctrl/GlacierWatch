import pandas as pd
import matplotlib.pyplot as plt

# Load your validated events CSV
df = pd.read_csv("shisper_events.csv")

# Convert Image_Date to datetime objects for proper timeline plotting
df['Image_Date'] = pd.to_datetime(df['Image_Date'])
df = df.sort_values('Image_Date')

# Plotting Lake Area and Volume over time
plt.figure(figsize=(12, 6))

plt.subplot(2, 1, 1)
plt.plot(df['Image_Date'], df['Shape_Area'] / 1e4, color='dodgerblue', marker='o', linestyle='-', linewidth=1.5, markersize=3)
plt.title("Shisper Glacier Lake Historical Dynamics (Portsmouth Dataset)")
plt.ylabel("Surface Area (hectares)")
plt.grid(True, linestyle='--', alpha=0.6)

plt.subplot(2, 1, 2)
plt.plot(df['Image_Date'], df['Volume'] / 1e6, color='crimson', marker='s', linestyle='-', linewidth=1.5, markersize=3)
plt.ylabel("Volume (million m³)")
plt.xlabel("Date")
plt.grid(True, linestyle='--', alpha=0.6)

plt.tight_layout()
plt.savefig("shisper_historical_trends.png", dpi=300)
print("Plot successfully generated and saved as 'shisper_historical_trends.png'!")
plt.show()