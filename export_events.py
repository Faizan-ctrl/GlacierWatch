import shapefile
import csv

# Read the shapefile
sf = shapefile.Reader("Shisper_Lakes.shp")
fields = [field[0] for field in sf.fields[1:]]

# Write out to shisper_events.csv
output_file = "shisper_events.csv"
with open(output_file, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    # Write header
    writer.writerow(["Index", "Image_Date", "Lake_Phase", "Z_Max", "Volume", "Shape_Area"])
    
    for idx, shape_rec in enumerate(sf.shapeRecords()):
        rec = dict(zip(fields, shape_rec.record))
        writer.writerow([
            idx,
            rec.get("Image_Date"),
            rec.get("Lake_Phase", ""),
            rec.get("Z_Max", ""),
            rec.get("Volume", ""),
            rec.get("Shape_Area", "")
        ])

print(f"Successfully generated {output_file} with all historical lake phases!")