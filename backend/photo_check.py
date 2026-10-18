"""check_photo(path) -> {"label", "is_standing_water", "confidence"}

Model 1 (VisText detector)  -> what kind of water-holding object is in the photo.
Model 2 (water detector)    -> is visible water present.
Both only say "possible breeding site". An officer verifies. Never claim "larvae found".

Put the weights here (not in git):
    models/model1_best.pt        Model 1  (runs/model1_vistext_det_v1/weights/best.pt)
    models/model2_water_best.pt  Model 2  (runs/model2_water_only_v2/weights/best.pt)
If a weight file or ultralytics is missing, check_photo returns label "unknown" instead of crashing.
"""
import logging
import os
from pathlib import Path

log = logging.getLogger("photo_check")
MODEL_DIR = Path(os.getenv("NYAHMUK_MODEL_DIR", Path(__file__).parent / "models"))
M1_PATH, M2_PATH = MODEL_DIR / "model1_best.pt", MODEL_DIR / "model2_water_best.pt"

# Thresholds: starting values. Tune them with evaluate_my_photos.py on your own Malaysian photos.
CONF_OBJECT = float(os.getenv("NYAHMUK_CONF_OBJECT", "0.25"))
CONF_WATER = float(os.getenv("NYAHMUK_CONF_WATER", "0.25"))

FRIENDLY = {"Tire": "tyre", "Drain-Inlet": "drain", "Vase": "flowerpot",
            "Bottle": "bottle", "Coconut-Exocarp": "coconut_shell"}
_models = {}


def _load():
    if _models:
        return
    _models.update(m1=None, m2=None)
    try:
        from ultralytics import YOLO
    except Exception as e:                                   # ultralytics not installed
        log.warning("ultralytics not available: %s", e)
        return
    for key, path in (("m1", M1_PATH), ("m2", M2_PATH)):
        if path.exists():
            _models[key] = YOLO(str(path))
        else:
            log.warning("weights not found: %s", path)


def _run(model, path, imgsz):
    r = model.predict(str(path), conf=0.10, imgsz=imgsz, verbose=False)[0]
    return [(r.names[int(c)], float(s)) for c, s in zip(r.boxes.cls, r.boxes.conf)]


def check_photo_details(path):
    """All detections above conf 0.10 (used for tuning). Not part of the API contract."""
    _load()
    objects = _run(_models["m1"], path, 640) if _models["m1"] else []
    water = [(n, s) for n, s in (_run(_models["m2"], path, 320) if _models["m2"] else []) if n == "water"]
    return {"objects": sorted(objects, key=lambda x: -x[1]), "water": sorted(water, key=lambda x: -x[1]),
            "loaded": {"model1": _models["m1"] is not None, "model2": _models["m2"] is not None}}


def check_photo(path):
    d = check_photo_details(path)
    if not d["loaded"]["model1"] and not d["loaded"]["model2"]:
        return {"label": "unknown", "is_standing_water": False, "confidence": 0.0}
    best_obj = next(((n, s) for n, s in d["objects"] if s >= CONF_OBJECT), None)
    best_water = d["water"][0][1] if d["water"] else 0.0
    is_water = best_water >= CONF_WATER
    if best_obj:
        label, conf = FRIENDLY.get(best_obj[0], best_obj[0].lower()), best_obj[1]
    else:
        label, conf = "none", (best_water if is_water else 0.0)
    return {"label": label, "is_standing_water": bool(is_water), "confidence": round(conf, 2)}
