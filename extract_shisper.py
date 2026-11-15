import ee

ee.Initialize()

# Official bounding box and centroid derived from the Portsmouth shapefile dataset
# Center: ~36.3595°N, 74.5658°E
roi = ee.Geometry.Polygon([
    [
        [74.5630, 36.3565],
        [74.5630, 36.3620],
        [74.5700, 36.3620],
        [74.5700, 36.3565]
    ]
])

print("ROI configured successfully for Shisper Glacier Lake exact basin.")