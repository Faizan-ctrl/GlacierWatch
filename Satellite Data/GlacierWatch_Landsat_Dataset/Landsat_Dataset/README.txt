
GLACIERWATCH - LANDSAT 8 AND LANDSAT 9 DATASET
================================================

PROJECT
GlacierWatch: Glacial Lake Outburst Flood monitoring
Study area: Shisper Glacier, Gilgit-Baltistan, Pakistan

DATA SOURCE
Microsoft Planetary Computer
Collection: Landsat Collection 2 Level-2
Satellites: Landsat 8 and Landsat 9

TEMPORAL COVERAGE
January 2023 - October 2026

DATA SUMMARY
52 selected satellite scenes
27 Landsat 8 scenes
25 Landsat 9 scenes
312 GeoTIFF files

SPATIAL INFORMATION
Coordinate Reference System: EPSG:32643
Raster dimensions: 450 x 408 pixels
Spatial resolution: 30 metres
Study area: Approximate Shisper rectangular AOI

BANDS INCLUDED IN EACH SCENE

blue.tif
Landsat Band 2 - Blue

green.tif
Landsat Band 3 - Green

red.tif
Landsat Band 4 - Red

nir08.tif
Landsat Band 5 - Near Infrared

lwir11.tif
Landsat Band 10 - Surface Temperature

qa_pixel.tif
Pixel quality information, including fill, cloud,
cirrus, cloud shadow and snow flags.

CALIBRATION

Surface reflectance:
Physical value = stored value * 0.0000275 - 0.2

Thermal surface temperature:
Temperature in Kelvin = stored value * 0.00341802 + 149.0

To convert Kelvin to Celsius:
Temperature Celsius = Kelvin - 273.15

QA_PIXEL is an integer bitmask and must NOT be
interpreted as reflectance or temperature.

QUALITY INFORMATION

The selected scenes were screened using the
QA_PIXEL band over the study-area rectangle.

Preliminary selection threshold:
Cloud contamination <= 30%.

Snow and ice observations have been retained because
they are important for glacier monitoring.

IMPORTANT LIMITATIONS

1. The dataset covers an approximate rectangular
   study area, not an exact glacier boundary.

2. Cloud screening is based on the study-area rectangle.

3. Snow percentage is reported separately from cloud.

4. QA_PIXEL is supplied but cloud masking has not
   been applied to the optical bands.

5. Scenes from adjacent Landsat paths may overlap
   or have different acquisition dates.

6. These files are intended for research and
   decision-support analysis, not deterministic
   GLOF prediction.

FOLDER STRUCTURE

Landsat_Dataset/
    Landsat_8/
        SCENE_ID/
            blue.tif
            green.tif
            red.tif
            nir08.tif
            lwir11.tif
            qa_pixel.tif

    Landsat_9/
        SCENE_ID/
            blue.tif
            green.tif
            red.tif
            nir08.tif
            lwir11.tif
            qa_pixel.tif

    landsat_download_manifest.csv
    landsat_selected_scenes.csv
    landsat_all_scenes_quality.csv
    landsat_verification_report.csv
    README.txt

HOW TO OPEN

These GeoTIFF files can be opened using:
- Python with Rasterio
- QGIS
- ArcGIS
- Google Colab

For Python:

import rasterio

with rasterio.open("blue.tif") as src:
    band = src.read(1)
    print(src.crs)
    print(src.shape)
    print(src.scales)
    print(src.offsets)

SOURCE
Microsoft Planetary Computer:
https://planetarycomputer.microsoft.com/

Collection:
landsat-c2-l2
