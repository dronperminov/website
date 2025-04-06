from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse

from src import articles_database
from src.api import templates
from src.entities.user import User
from src.utils.auth import get_user
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/")
async def index(user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    articles = articles_database.get_recent(count=3)
    template = templates.get_template("index.html")
    content = template.render(
        version=get_static_hash(),
        page="index",
        user=user,
        articles=articles
    )
    return HTMLResponse(content=content)
