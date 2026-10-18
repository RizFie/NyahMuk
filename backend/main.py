"""
NyahMuk API (feature 1: risk map).
Run:  uvicorn main:app --reload
Docs: http://localhost:8000/docs
"""
import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NyahMuk API")

# Let the Next.js frontend call this API from the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA = Path(__file__).parent / "data"


def load(name: str):
    path = DATA / name
    if not path.exists():
        raise HTTPException(503, f"{name} not found. Run: python make_risk_json.py")
    return json.loads(path.read_text(encoding="utf-8"))


@app.get("/")
def health():
    return {"status": "ok", "app": "NyahMuk API"}


@app.get("/risk")
def risk(day: int = 0):
    if not 0 <= day <= 6:
        raise HTTPException(400, "day must be between 0 and 6")
    return load("risk.json")[day]


@app.get("/model-info")
def model_info():
    return load("model_info.json")