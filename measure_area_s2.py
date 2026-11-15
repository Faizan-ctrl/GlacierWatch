"""
GlacierWatch - measure lake area from Sentinel-2 (optical, NDWI)

Reads B03 (green), B08 (near infrared) and SCL (scene classification) for each date folder,
cuts out only the Shisper box from the big tile, finds water, and writes lake area in km2.

STEP A (find the lake):   python measure_area_s2.py --s2 <S2 folder> --aoi aoi.json --previews previews
STEP B (measure it):      python measure_area_s2.py --s2 <S2 folder> --aoi aoi.json --previews previews --seed LAT LON

Install once:  pip install rasterio numpy scipy matplotlib
"""
import argparse
import csv
import json
import pathlib
import sys

import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.transform import rowcol, xy
from rasterio.warp import transform as warp_transform
from rasterio.warp import transform_bounds
from rasterio.windows import from_bounds
from scipy import ndimage

CLOUD_CLASSES = [3, 8, 9, 10]      # cloud shadow, cloud medium, cloud high, thin cirrus
SNOW_CLASS = 11
FIELDS = ["date", "lake_area_km2", "sensor", "method", "cloud_pct", "image_id"]


def read_crop(path, bbox_ll, out_shape=None):
    """Read only the window that covers the box (lon/lat). Never loads the whole tile."""
    with rasterio.open(path) as src:
        b = transform_bounds("EPSG:4326", src.crs, *bbox_ll)
        win = from_bounds(*b, transform=src.transform).round_offsets().round_lengths()
        arr = src.read(1, window=win, out_shape=out_shape, resampling=Resampling.nearest,
                       boundless=True, fill_value=0)
        tf = src.window_transform(win)
        if out_shape is not None:
            tf = tf * rasterio.Affine.scale(win.width / out_shape[1], win.height / out_shape[0])
        return arr, tf, src.crs


def find_band(folder, name):
    for p in folder.iterdir():
        if p.stem.upper() == name and p.suffix.lower() in (".tif", ".tiff"):
            return p
    return None


def to_lonlat(tf, crs, rows, cols):
    x, y = xy(tf, rows, cols)
    lon, lat = warp_transform(crs, "EPSG:4326", list(np.atleast_1d(x)), list(np.atleast_1d(y)))
    return lon, lat


def process_date(folder, bbox, thr, seed, radius_m, min_km2):
    p03, p08, pscl = (find_band(folder, n) for n in ("B03", "B08", "SCL"))
    if not (p03 and p08 and pscl):
        print(f"  {folder.name}: missing B03, B08 or SCL, skipped")
        return None
    b03, tf, crs = read_crop(p03, bbox)
    shape = b03.shape
    b08, _, _ = read_crop(p08, bbox, shape)
    scl, _, _ = read_crop(pscl, bbox, shape)
    px_m2 = abs(tf.a * tf.e)

    # Reflectance. Sentinel-2 L2A from 2022 has a +1000 offset in the stored numbers.
    g = np.clip(b03.astype("float32") * 1e-4 - 0.1, 0, None)
    n = np.clip(b08.astype("float32") * 1e-4 - 0.1, 0, None)
    ndwi = (g - n) / (g + n + 1e-6)

    valid = (b03 > 0) & (b08 > 0)
    cloud = np.isin(scl, CLOUD_CLASSES)
    snow = scl == SNOW_CLASS
    water = (ndwi > thr) & valid & ~cloud & ~snow          # snow also looks "wet" in NDWI, so it is removed

    labels, nlab = ndimage.label(water)
    ids = np.arange(1, nlab + 1)
    areas = ndimage.sum(water, labels, ids) * px_m2 / 1e6 if nlab else np.array([])
    keep = [i for i, a in zip(ids, areas) if a >= min_km2]
    aoi_cloud = round(100 * cloud[valid].mean(), 1) if valid.any() else None

    out = {"date": folder.name, "aoi_cloud_pct": aoi_cloud, "labels": labels, "g": g, "tf": tf,
           "crs": crs, "px_m2": px_m2, "cands": [], "lake": None, "cloud": cloud}
    for i in sorted(keep, key=lambda k: -areas[k - 1])[:6]:
        r, c = ndimage.center_of_mass(labels == i)
        lon, lat = to_lonlat(tf, crs, int(r), int(c))
        out["cands"].append({"id": int(i), "area_km2": round(float(areas[i - 1]), 4),
                             "lon": round(lon[0], 4), "lat": round(lat[0], 4), "row": r, "col": c})

    if seed and keep:
        sx, sy = warp_transform("EPSG:4326", crs, [seed[1]], [seed[0]])
        sr, sc = rowcol(tf, sx[0], sy[0])
        pt = np.ones(shape, dtype=bool)
        if 0 <= sr < shape[0] and 0 <= sc < shape[1]:
            pt[sr, sc] = False
            dist = ndimage.distance_transform_edt(pt) * np.sqrt(px_m2)
            mind = ndimage.minimum(dist, labels, keep)
            j = int(np.argmin(mind))
            if mind[j] <= radius_m:
                lake = labels == keep[j]
                ring = ndimage.binary_dilation(lake, iterations=30) & ~lake
                out["lake"] = {"id": int(keep[j]), "mask": lake,
                               "area_km2": round(float(lake.sum() * px_m2 / 1e6), 4),
                               "cloud_near_pct": round(100 * cloud[ring].mean(), 1)}
    return out


def save_preview(res, path, seed):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    g = res["g"]
    lo, hi = np.percentile(g, [2, 98])
    fig, ax = plt.subplots(figsize=(8, 7))
    ax.imshow(np.clip((g - lo) / (hi - lo + 1e-6), 0, 1), cmap="gray")
    overlay = np.zeros(g.shape + (4,), dtype="float32")
    overlay[res["labels"] > 0] = [0, 0.8, 1, 0.55]
    if res["lake"] is not None:
        overlay[res["lake"]["mask"]] = [1, 0, 0, 0.8]
    ax.imshow(overlay)
    for c in res["cands"]:
        ax.text(c["col"], c["row"], str(c["id"]), color="yellow", fontsize=9, weight="bold")
    ax.set_title(f"{res['date']}   cyan = water found, red = chosen lake, yellow = candidate number")
    ax.axis("off")
    fig.savefig(path, dpi=110, bbox_inches="tight")
    plt.close(fig)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--s2", required=True, help="folder with one sub-folder per date (YYYY-MM-DD)")
    ap.add_argument("--aoi", required=True, help="aoi.json made by make_aoi.py")
    ap.add_argument("--seed", nargs=2, type=float, metavar=("LAT", "LON"), help="a point on the lake")
    ap.add_argument("--thr", type=float, default=0.1, help="NDWI water limit (try 0.0 to 0.3)")
    ap.add_argument("--pad", type=float, default=0.03, help="extra degrees around the box")
    ap.add_argument("--radius", type=float, default=1500, help="how far (m) the lake may be from the seed")
    ap.add_argument("--min-km2", type=float, default=0.01, help="ignore water bodies smaller than this")
    ap.add_argument("--previews", default="previews")
    ap.add_argument("--out", default="shisper_area_measured.csv")
    ap.add_argument("--catalogue", help="sentinel2_image_catalogue.csv (optional, for image ids)")
    a = ap.parse_args()

    w, s, e, n = json.load(open(a.aoi))["bbox_lonlat"]
    bbox = [w - a.pad, s - a.pad, e + a.pad, n + a.pad]
    print("Box (lon/lat):", [round(x, 4) for x in bbox])

    ids = {}
    if a.catalogue:
        for row in csv.DictReader(open(a.catalogue, newline="")):
            ids.setdefault(row["date"][:10], row["image_id"])

    pathlib.Path(a.previews).mkdir(parents=True, exist_ok=True)
    rows = []
    for folder in sorted(p for p in pathlib.Path(a.s2).iterdir() if p.is_dir()):
        print(f"\n{folder.name}")
        res = process_date(folder, bbox, a.thr, a.seed, a.radius, a.min_km2)
        if res is None:
            continue
        print(f"  cloud over the box: {res['aoi_cloud_pct']}%")
        for c in res["cands"]:
            print(f"  candidate {c['id']}: {c['area_km2']} km2 at lat {c['lat']}, lon {c['lon']}")
        if a.seed:
            if res["lake"]:
                print(f"  LAKE area: {res['lake']['area_km2']} km2  (cloud near lake: {res['lake']['cloud_near_pct']}%)")
                rows.append({"date": folder.name, "lake_area_km2": res["lake"]["area_km2"], "sensor": "sentinel-2",
                             "method": f"NDWI>{a.thr}, cloud+snow masked", "cloud_pct": res["lake"]["cloud_near_pct"],
                             "image_id": ids.get(folder.name, folder.name)})
            else:
                print("  no water body near the seed on this date (not written)")
        save_preview(res, pathlib.Path(a.previews) / f"{folder.name}.png", a.seed)

    if a.seed and rows:
        out = pathlib.Path(a.out)
        keep = []
        if out.exists():
            keep = [r for r in csv.DictReader(open(out, newline="")) if r.get("sensor") != "sentinel-2"]
        with open(out, "w", newline="") as f:
            wr = csv.DictWriter(f, fieldnames=FIELDS)
            wr.writeheader()
            wr.writerows(keep + rows)
        print(f"\nWrote {len(rows)} Sentinel-2 rows to {out}")
    elif not a.seed:
        print("\nNo seed given: nothing written. Open the PNG files in the previews folder, pick the lake number,")
        print("then run again with --seed LAT LON using that candidate's lat and lon.")


if __name__ == "__main__":
    main()