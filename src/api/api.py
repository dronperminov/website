from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from src import articles_database
from src.api import templates
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/")
async def index() -> HTMLResponse:
    articles = articles_database.get_recent(count=3)
    template = templates.get_template("index.html")
    content = template.render(
        articles=articles,
        version=get_static_hash(),
        page="index"
    )
    return HTMLResponse(content=content)
