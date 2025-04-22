from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse, Response

from src import articles_database, papers_database, posts_database
from src.api import templates
from src.entities.sitemap import Sitemap
from src.entities.user import User
from src.utils.auth import get_user
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/")
async def index(user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    papers = papers_database.get_recent(count=3)
    template = templates.get_template("index.html")
    content = template.render(
        version=get_static_hash(),
        page="index",
        user=user,
        papers=papers
    )
    return HTMLResponse(content=content)


@router.get("/sitemap.xml")
async def get_sitemap() -> Response:
    articles = articles_database.get_recent(count=10000)
    posts = posts_database.get_recent(count=10000)
    last_modified = datetime(2025, 4, 21, 22, 4, 0)

    sitemap = Sitemap(domain="https://dronperminov.ru")
    sitemap.add_url(url="", last_modified=last_modified, priority=1.0)
    sitemap.add_url(url="articles", last_modified=articles[0].datetime if articles else last_modified, priority=0.8)
    sitemap.add_url(url="blog", last_modified=posts[0].timestamp if posts else last_modified, priority=0.8)
    sitemap.add_url(url="projects", last_modified=last_modified, priority=0.8)
    sitemap.add_url(url="research", last_modified=last_modified, priority=0.8)
    sitemap.add_url(url="/machine-learning/dense-network-playground", last_modified=last_modified, priority=0.6)

    for article in articles:
        sitemap.add_url(url=f"articles/{article.link}", last_modified=article.datetime, priority=0.6)

    for post in posts:
        sitemap.add_url(url=f"post/{post.post_id}", last_modified=post.timestamp, priority=0.6)

    return Response(content=sitemap.content(), media_type="application/xml")
