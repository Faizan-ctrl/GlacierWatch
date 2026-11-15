# GlacierWatch: Satellite-Driven GLOF Early-Risk Indicator & Warning System

**Live Deployment:** [https://glacier-watch-sigma.vercel.app](https://glacier-watch-sigma.vercel.app)  
**NASA Space Apps Challenge 2026 Submission**

---

## Overview
**GlacierWatch** is an automated satellite remote-sensing and early-warning platform designed to monitor high-altitude glacial lakes and detect **Glacial Lake Outburst Flood (GLOF)** hazards across high-mountain regions such as the Hindu Kush–Karakoram–Himalaya (HKH) belt.

Accelerated glacial melt causes moraine-dammed lakes to expand rapidly, placing downstream communities and critical infrastructure at risk of sudden, catastrophic flash floods. GlacierWatch fuses multi-spectral optical imagery, all-weather Synthetic Aperture Radar (SAR), and digital elevation telemetry to continuously score lake stability and provide actionable early-warning lead time.

---

## Key Features
* **Multi-Sensor All-Weather Monitoring:** Combines optical imagery (Landsat 8/9 & Sentinel-2) with C-band SAR backscatter (Sentinel-1) to track lake surface expansion even during monsoon cloud cover.
* **Automated Change & Risk Detection:** Computes Normalized Difference Water Index (NDWI) and SAR water-mask time series alongside NASADEM/SRTM slope gradients to evaluate dam breach and downstream flood vulnerability.
* **Interactive Geospatial Dashboard:** Visualizes monitored lakes by risk tier (**Low, Moderate, High, Critical**) with historical area-growth charts, satellite comparisons, and early-warning alert thresholds.

---

## Data Sources & Attribution
### NASA Data & Resources
* [NASA Earthdata / Landsat 8–9 Collection 2 Surface Reflectance](https://www.earthdata.nasa.gov/)
* [NASADEM / Shuttle Radar Topography Mission (SRTM) Global 1 arc second](https://www.earthdata.nasa.gov/data/catalog/lpcloud-nasadem-hgt-001)
* [NASA Global Land Ice Measurements from Space (GLIMS)](https://www.glims.org/)
* [NASA Worldview & GIBS](https://worldview.earthdata.nasa.gov/)

### Space Agency Partner & Open Data
* [Copernicus Sentinel-1 SAR & Sentinel-2 MSI (ESA)](https://dataspace.copernicus.eu/)
* [Google Earth Engine Data Catalog](https://developers.google.com/earth-engine/datasets)
* [High Mountain Asia Glacial Lake Inventory (NSIDC)](https://nsidc.org/data/hma_gli)
* [OpenStreetMap](https://www.openstreetmap.org/)

---

## Tech Stack
* **Geospatial & Data Pipeline:** Python, NumPy, Pandas, Rasterio, GeoPandas, OpenCV, Google Earth Engine
* **Backend:** FastAPI, Uvicorn, PostgreSQL / PostGIS
* **Frontend:** React, Leaflet / Mapbox GL, Recharts

---

## Local Setup
```bash
# Clone the repository
git clone [https://github.com/Faizan-ctrl/GlacierWatch.git](https://github.com/Faizan-ctrl/GlacierWatch.git)
cd GlacierWatch

# Backend setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup
cd ../frontend
npm install
npm run dev
