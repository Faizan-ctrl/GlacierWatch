import requests
import pandas as pd
import os

output_dir = r"C:\Users\zawar\Desktop\Earthquake Data"
os.makedirs(output_dir, exist_ok=True)
file_path = os.path.join(output_dir, "usgs_earthquakes_pakistan.csv")

url = (
    "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson"
    "&starttime=2023-01-01&endtime=2026-11-14"
    "&minlatitude=33.0&maxlatitude=38.0"
    "&minlongitude=70.0&maxlongitude=78.0"
    "&minmagnitude=3.0"
)

print("Fetching USGS earthquake catalog for Northern Pakistan...")
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    features = data.get("features", [])
    
    quake_list = []
    for f in features:
        props = f["properties"]
        geom = f["geometry"]
        quake_list.append({
            "time": pd.to_datetime(props["time"], unit="ms"),
            "magnitude": props["mag"],
            "place": props["place"],
            "longitude": geom["coordinates"][0],
            "latitude": geom["coordinates"][1],
            "depth_km": geom["coordinates"][2],
            "url": props["url"]
        })
    
    df = pd.DataFrame(quake_list)
    df.to_csv(file_path, index=False)
    print(f"Successfully saved {len(df)} earthquake records to: {file_path}")
else:
    print("Failed to fetch USGS data, status code:", response.status_code)
