"""Test the photo models on YOUR Malaysian photos and help choose thresholds.

Folder layout:  my_photos/{tyre,drain,flowerpot,bucket,puddle,none}/*.jpg
Run:            python evaluate_my_photos.py --photos ../my_photos
"""
import argparse
import csv
from pathlib import Path

import photo_check as pc

EXPECT = {"tyre": "tyre", "drain": "drain", "flowerpot": "flowerpot"}   # bucket / puddle / none: no object class expected
WATER_T = [0.15, 0.25, 0.35, 0.50]

ap = argparse.ArgumentParser()
ap.add_argument("--photos", default="../my_photos")
a = ap.parse_args()

rows = []
for folder in sorted(p for p in Path(a.photos).iterdir() if p.is_dir()):
    for img in sorted(f for f in folder.iterdir() if f.suffix.lower() in {".jpg", ".jpeg", ".png"}):
        d = pc.check_photo_details(img)
        top_obj = d["objects"][0] if d["objects"] else ("", 0.0)
        top_w = d["water"][0][1] if d["water"] else 0.0
        rows.append(dict(folder=folder.name, file=img.name, top_object=pc.FRIENDLY.get(top_obj[0], top_obj[0]),
                         top_object_conf=round(top_obj[1], 2), top_water_conf=round(top_w, 2)))
if not rows:
    raise SystemExit("no photos found")
if not pc._models.get("m1") and not pc._models.get("m2"):
    raise SystemExit("models not loaded: put model1_best.pt and model2_water_best.pt in backend/models/")

with open("my_photos_eval.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)

print(f"\nobject threshold = {pc.CONF_OBJECT}\n")
print(f"{'folder':<10}{'n':>4}  {'object found':>13}  " + "  ".join(f"water>={t}" for t in WATER_T))
for folder in sorted({r['folder'] for r in rows}):
    rs = [r for r in rows if r["folder"] == folder]
    n = len(rs)
    exp = EXPECT.get(folder)
    obj = (sum(r["top_object"] == exp and r["top_object_conf"] >= pc.CONF_OBJECT for r in rs) if exp
           else sum(r["top_object_conf"] >= pc.CONF_OBJECT for r in rs))
    obj_txt = f"{obj}/{n}" + (" right" if exp else " any")
    water = "  ".join(f"{sum(r['top_water_conf'] >= t for r in rs):>3}/{n:<3}  " for t in WATER_T)
    print(f"{folder:<10}{n:>4}  {obj_txt:>13}  {water}")
print("\nHow to read it:")
print(" - tyre/drain/flowerpot rows: 'object found ... right' should be high.")
print(" - bucket/puddle rows: no object class exists for bucket; puddle/bucket water columns should be high.")
print(" - none row: both 'any' object and the water columns should be LOW (false alarms).")
print(" - pick the smallest water threshold where the none row is still clean; set NYAHMUK_CONF_WATER.")
print("details saved to my_photos_eval.csv")
