from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

router = APIRouter()
templates = Jinja2Templates(directory="templates")


@router.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


@router.get("/vehicle/{vehicle_id}", response_class=HTMLResponse)
async def vehicle_detail(request: Request, vehicle_id: str):
    # 🔧 Mockad data – kommer ersättas med riktig integration
    mock_vehicle = {
        "vehicle_id": vehicle_id,
        "name": "XPENG P7",
        "battery": "76%",
        "range": "320 km",
        "charging": "AC - 11 kW",
        "location": "Hammarby Sjöstad, Stockholm",
        "events": [
            {"time": "13:01", "type": "Charging Started", "details": "Home charger"},
            {"time": "12:55", "type": "Vehicle Linked", "details": "XPENG P7 via Enode"},
        ]
    }
    return templates.TemplateResponse("vehicle_detail.html", {
        "request": request,
        "vehicle": mock_vehicle
    })
