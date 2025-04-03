from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from src.api import templates
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/research")
async def research() -> HTMLResponse:
    template = templates.get_template("research.html")
    content = template.render(
        version=get_static_hash(),
        page="research"
    )
    return HTMLResponse(content=content)
