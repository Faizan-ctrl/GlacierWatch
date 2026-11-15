import os
import earthaccess

# 1. Target output directory requested
output_dir = r"C:\Users\zawar\Desktop\Weather data\IMERG Data"
os.makedirs(output_dir, exist_ok=True)

# 2. Authenticate with your NASA Earthdata credentials
print("Authenticating with NASA Earthdata...")
auth = earthaccess.login(persist=True)

# 3. Search for GPM IMERG Final Daily data (GPM_3IMERGDF) over Northern Pakistan lakes
print("Searching GPM IMERG granule archive...")
results = earthaccess.search_data(
    short_name="GPM_3IMERGDF",
    version="07",
    bounding_box=(73.0, 34.0, 75.0, 36.5),
    temporal=("2023-06-01", "2026-11-14"),
)

print(f"Found {len(results)} granules matching your criteria.")

# 4. Download the files directly to your folder
print(f"Downloading files to {output_dir}...")
files = earthaccess.download(results, output_dir)
print("Download complete!")