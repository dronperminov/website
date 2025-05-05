import os.path
import tempfile
from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse

from src import database, posts_database
from src.api import templates
from src.entities.user import User
from src.enums import UserRole
from src.query_params.post_add import PostAdd
from src.query_params.posts_search import PostsSearch
from src.utils.auth import get_user
from src.utils.common import get_static_hash, save_file

router = APIRouter()


@router.get("/blog")
async def blog(user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    template = templates.get_template("blog.html")
    content = template.render(
        version=get_static_hash(),
        page="blog",
        user=user,
        breadcrumbs=[("/", "Главная"), ("/blog", "Блог")]
    )
    return HTMLResponse(content=content)


@router.get("/post/{post_id}")
async def get_post(post_id: int, user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    post = posts_database.get_post(post_id=post_id)

    if not post:
        template = templates.get_template("errors/no_post.html")
        return HTMLResponse(content=template.render(version=get_static_hash(), page="error", user=user))

    post_title = post.get_title()

    template = templates.get_template("entities/post.html")
    content = template.render(
        version=get_static_hash(),
        page="post",
        user=user,
        post_title=post_title,
        description=post_title,
        post=jsonable_encoder(post),
        breadcrumbs=[("/", "Главная"), ("/blog", "Блог"), (f"/post/{post_id}", post_title)]
    )
    return HTMLResponse(content=content)


@router.post("/search-posts")
async def search_posts(params: PostsSearch) -> JSONResponse:
    total, posts = posts_database.search(params=params)
    return JSONResponse({"status": "success", "total": total, "posts": jsonable_encoder(posts)})


@router.post("/add-post")
async def add_post(params: PostAdd = Depends(), user: Optional[User] = Depends(get_user)) -> JSONResponse:
    if not user:
        return JSONResponse({"status": "error", "message": "пользователь не авторизован"})

    if user.role == UserRole.USER:
        return JSONResponse({"status": "error", "message": "пользователь не является администратором"})

    # TODO: make pretty
    try:
        with tempfile.TemporaryDirectory() as tmp_dir:
            paths = [save_file(picture, output_path=os.path.join(tmp_dir, picture.filename)) for i, picture in enumerate(params.pictures)]
            posts_database.add_post(post=params.to_post(post_id=database.get_identifier("posts"), paths=paths))
    except Exception as error:
        return JSONResponse({"status": "error", "message": f"не удалось создать пост из-за {error}"})

    return JSONResponse({"status": "success"})
