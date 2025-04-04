from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse

from src import articles_database
from src.api import templates
from src.query_params.articles_search import ArticlesSearch
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


@router.post("/search-articles")
async def search_articles(params: ArticlesSearch) -> JSONResponse:
    total, articles = articles_database.search(params=params)
    return JSONResponse({"status": "success", "total": total, "articles": jsonable_encoder(articles)})
