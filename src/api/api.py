from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from src.api import templates
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/")
async def index() -> HTMLResponse:
    template = templates.get_template("index.html")
    content = template.render(
        version=get_static_hash(),
        page="index"
    )
    return HTMLResponse(content=content)
