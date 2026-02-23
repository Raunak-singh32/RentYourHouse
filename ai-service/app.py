from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import random

app = FastAPI(title="RentYourHouse AI Price Service")

class Listing(BaseModel):
    city: str
    amenities: List[str]
    description: str
    rooms: Optional[int] = 1
    bathrooms: Optional[int] = 1
    guests: Optional[int] = 2

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict_price(data: Listing):
    base = 1000

    base += (data.rooms or 0) * 500
    base += (data.bathrooms or 0) * 300
    base += (data.guests or 0) * 200
    base += len(data.amenities) * 150

    # Small bonus rules (temporary)
    am = {a.strip().lower() for a in data.amenities}
    if "wifi" in am: base += 200
    if "ac" in am or "air conditioning" in am: base += 400
    if "parking" in am: base += 150

    recommended = int(base)

    return {
        "minPrice": int(recommended * 0.85),
        "recommendedPrice": recommended,
        "maxPrice": int(recommended * 1.15),
        "confidence": round(random.uniform(0.70, 0.90), 2)
    }