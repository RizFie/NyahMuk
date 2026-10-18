"""Optional, run once:  python make_osm_features.py
Marks grid cells that contain water bodies / drains or construction sites (OpenStreetMap via Overpass).
Writes data/cell_features.json. Without it the factors near_water_body / near_construction_site never fire.
"""
import json
import urllib.parse
import urllib.request

import risk

QUERY = """[out:json][timeout:60];
(
  way["natural"="water"]({s},{w},{n},{e}); relation["natural"="water"]({s},{w},{n},{e});
  way["waterway"]({s},{w},{n},{e});
  way["landuse"="construction"]({s},{w},{n},{e}); way["building"="construction"]({s},{w},{n},{e});
  node["construction"]({s},{w},{n},{e});
);
out center;"""


def classify(el):
    t = el.get("tags", {})
    if t.get("landuse") == "construction" or t.get("building") == "construction" or "construction" in t:
        return "near_construction_site"
    if t.get("natural") == "water" or "waterway" in t:
        return "near_water_body"
    return None


def centre(el):
    if "center" in el:
        return el["center"]["lat"], el["center"]["lon"]
    return el.get("lat"), el.get("lon")


def features_from_overpass(js, grid):
    out = {}
    for el in js.get("elements", []):
        kind, (lat, lng) = classify(el), centre(el)
        if kind and lat is not None:
            cid = risk.find_cell(lat, lng, grid)
            if cid:
                out.setdefault(cid, {})[kind] = True
    return out


if __name__ == "__main__":
    grid = risk.load_grid(); m = grid["meta"]
    q = QUERY.format(s=m["origin_lat"], w=m["origin_lng"], n=m["origin_lat"] + m["nrows"] * m["dlat"],
                     e=m["origin_lng"] + m["ncols"] * m["dlng"])
    req = urllib.request.Request("https://overpass-api.de/api/interpreter",
                                 data=urllib.parse.urlencode({"data": q}).encode(), method="POST")
    with urllib.request.urlopen(req, timeout=90) as r:
        feats = features_from_overpass(json.loads(r.read().decode("utf-8")), grid)
    risk._write("cell_features.json", feats)
    print("cells with features:", len(feats))
