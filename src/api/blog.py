from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from src.api import templates
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/blog")
async def blog() -> HTMLResponse:
    template = templates.get_template("blog.html")
    content = template.render(
        version=get_static_hash(),
        page="blog"
    )
    return HTMLResponse(content=content)
