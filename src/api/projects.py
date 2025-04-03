from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from src.api import templates
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/projects")
async def projects() -> HTMLResponse:
    template = templates.get_template("projects.html")
    content = template.render(
        version=get_static_hash(),
        page="projects"
    )
    return HTMLResponse(content=content)
