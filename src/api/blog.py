from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse

from src import posts_database
from src.api import templates
from src.query_params.posts_search import PostsSearch
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


@router.get("/post/{post_id}")
async def get_post(post_id: int) -> HTMLResponse:
    post = posts_database.get_post(post_id=post_id)

    if not post:
        template = templates.get_template("errors/no_post.html")
        return HTMLResponse(content=template.render(version=get_static_hash(), page="error"))

    template = templates.get_template("entities/post.html")
    content = template.render(
        version=get_static_hash(),
        page="post",
        post_title=post.get_title(),
        post=jsonable_encoder(post)
    )
    return HTMLResponse(content=content)


@router.post("/search-posts")
async def search_posts(params: PostsSearch) -> JSONResponse:
    total, posts = posts_database.search(params=params)
    return JSONResponse({"status": "success", "total": total, "posts": jsonable_encoder(posts)})
