import sys, json, pathlib, rasterio
from rasterio.warp import transform_bounds
g = next(pathlib.Path(sys.argv[1]).rglob("green.tif"))
with rasterio.open(g) as s:
    ll = transform_bounds(s.crs, "EPSG:4326", *s.bounds)
    print("size:", s.width, "x", s.height, "res:", s.res, "crs:", s.crs)
    print("AOI lon/lat [west, south, east, north]:", [round(x, 4) for x in ll])
    json.dump({"bbox_lonlat": ll}, open(sys.argv[2], "w"))
