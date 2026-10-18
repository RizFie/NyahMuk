"""NyahMuk backend: the whole API (5 endpoints). Run:  uvicorn main:app --reload --port 8000"""
import json
import os
import threading
import uuid
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Literal, Optional

from fastapi import FastAPI, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageOps
from pydantic import BaseModel
from starlette.exceptions import HTTPException as StarletteHTTPException

import risk
from photo_check import check_photo

UPLOAD_DIR = Path(os.getenv("NYAHMUK_UPLOAD_DIR", Path(__file__).parent / "uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_BYTES = 10 * 1024 * 1024
_lock = threading.Lock()

app = FastAPI(title="NyahMuk API", version=risk.MODEL_VERSION)
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("NYAHMUK_CORS", "*").split(","),
                   allow_methods=["*"], allow_headers=["*"])
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ---------- error shape: { "error": "message" } ----------
@app.exception_handler(StarletteHTTPException)
async def http_error(_, exc):
    return JSONResponse({"error": str(exc.detail)}, status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_error(_, exc):
    e = exc.errors()[0]
    where = ".".join(str(x) for x in e["loc"] if x not in ("body", "query", "form"))
    return JSONResponse({"error": f"Invalid {where}: {e['msg']}"}, status_code=422)


# ---------- storage helpers ----------
def _reports():
    return risk._read("reports.json", [])


def _save_reports(items):
    risk._write("reports.json", items)


def _public(r, request):
    out = dict(r)
    if out.get("photo_url", "").startswith("/"):
        out["photo_url"] = str(request.base_url).rstrip("/") + out["photo_url"]
    return out


# ---------- endpoints ----------
@app.get("/risk")
def get_risk(day: int = Query(0)):
    if not 0 <= day < risk.HORIZON_DAYS:
        raise HTTPException(400, f"day must be 0 to {risk.HORIZON_DAYS - 1}")
    with _lock:
        doc = risk.load_risk(_reports)
    return {"generated_at": doc["generated_at"], "day": day, "horizon_days": doc["horizon_days"],
            "model_version": doc["model_version"], "cells": doc["days"][str(day)]}


@app.get("/model-info")
def model_info():
    info = risk._read("model_info.json")
    if not info:
        raise HTTPException(404, "model_info.json missing")
    return info


@app.get("/reports")
def list_reports(request: Request):
    return [_public(r, request) for r in reversed(_reports())]


@app.post("/reports")
def create_report(request: Request, photo: UploadFile = File(...), lat: float = Form(...),
                  lng: float = Form(...), note: Optional[str] = Form(None)):
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        raise HTTPException(400, "lat/lng out of range")
    if note and len(note) > 500:
        raise HTTPException(400, "note is too long (max 500 characters)")
    raw = photo.file.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise HTTPException(400, "photo is too large (max 10 MB)")
    try:
        img = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert("RGB")
    except Exception:
        raise HTTPException(400, "photo is not a readable image (use JPG or PNG)")
    img.thumbnail((1600, 1600))
    rid = "r_" + uuid.uuid4().hex[:8]
    path = UPLOAD_DIR / f"{rid}.jpg"
    img.save(path, "JPEG", quality=85)          # re-saving drops EXIF data (GPS, device info)
    ai = check_photo(path)
    report = {"id": rid, "lat": lat, "lng": lng, "photo_url": f"/uploads/{rid}.jpg",
              "note": (note or "").strip(), "created_at": risk.now_iso(), "status": "new",
              "assigned_to": None, "ai_check": ai, "cell_id": risk.find_cell(lat, lng)}
    with _lock:
        items = _reports() + [report]
        _save_reports(items)
        risk.rebuild(items)
    return _public(report, request)


class PatchBody(BaseModel):
    status: Literal["new", "assigned", "cleared"]
    assigned_to: Optional[str] = None


@app.patch("/reports/{report_id}")
def update_report(report_id: str, body: PatchBody, request: Request):
    with _lock:
        items = _reports()
        r = next((x for x in items if x["id"] == report_id), None)
        if not r:
            raise HTTPException(404, f"report {report_id} not found")
        r["status"] = body.status
        if body.assigned_to is not None:
            r["assigned_to"] = body.assigned_to
        _save_reports(items)
        risk.rebuild(items)
    return _public(r, request)
