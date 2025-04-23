from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse

from src import papers_database
from src.api import templates
from src.entities.user import User
from src.query_params.papers_search import PapersSearch
from src.utils.auth import get_user
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/research")
async def research(user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    template = templates.get_template("research.html")
    content = template.render(
        version=get_static_hash(),
        page="research",
        user=user,
        breadcrumbs=[("/", "Главная"), ("/research", "Исследования")]
    )
    return HTMLResponse(content=content)


@router.post("/search-papers")
async def search_papers(params: PapersSearch) -> JSONResponse:
    total, papers = papers_database.search(params=params)
    return JSONResponse({"status": "success", "total": total, "papers": jsonable_encoder(papers)})
