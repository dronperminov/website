from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse

from src import articles_database
from src.api import templates
from src.entities.user import User
from src.query_params.articles_search import ArticlesSearch
from src.utils.auth import get_user
from src.utils.common import get_plain_text, get_static_hash

router = APIRouter()


@router.get("/articles")
async def get_articles(user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    template = templates.get_template("articles.html")
    content = template.render(
        version=get_static_hash(),
        page="articles",
        user=user,
        breadcrumbs=[("/", "Главная"), ("/articles", "Статьи")]
    )
    return HTMLResponse(content=content)


@router.get("/articles/{article_link}")
async def get_article(article_link: str, user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    article = articles_database.get_article_by_link(link=article_link)

    if not article:
        template = templates.get_template("errors/no_article.html")
        return HTMLResponse(content=template.render(version=get_static_hash(), page="error", user=user))

    template = templates.get_template("entities/article.html")
    content = template.render(
        version=get_static_hash(),
        page="article",
        user=user,
        article=article,
        description=get_plain_text(article.intro),
        breadcrumbs=[("/", "Главная"), ("/articles", "Статьи"), (f"/articles/{article.link}", article.title)]
    )
    return HTMLResponse(content=content)


@router.post("/search-articles")
async def search_articles(params: ArticlesSearch) -> JSONResponse:
    total, articles = articles_database.search(params=params)
    return JSONResponse({"status": "success", "total": total, "articles": jsonable_encoder(articles)})
