from contextlib import asynccontextmanager
from typing import AsyncContextManager

from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.requests import Request
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from uvicorn.config import LOGGING_CONFIG

from src import database
from src.api import api, articles, auth, blog, projects, research, templates
from src.utils.auth import get_user
from src.utils.common import get_static_hash


class CachedStaticFiles(StaticFiles):
    def __init__(self, *args, cache_control: str, **kwargs) -> None:
        self.cache_control = cache_control
        super().__init__(*args, **kwargs)

    def file_response(self, *args, **kwargs) -> Response:
        response: Response = super().file_response(*args, **kwargs)
        response.headers.setdefault("Cache-Control", self.cache_control)
        return response


def init_routers() -> None:
    app.include_router(api.router)
    app.include_router(auth.router)
    app.include_router(articles.router)
    app.include_router(research.router)
    app.include_router(blog.router)
    app.include_router(projects.router)


def init_static_directories() -> None:
    app.mount("/styles", CachedStaticFiles(directory="web/styles", cache_control="public, max-age=31536000"))
    app.mount("/js", CachedStaticFiles(directory="web/js", cache_control="public, max-age=31536000"))
    app.mount("/fonts", CachedStaticFiles(directory="web/fonts", cache_control="public, max-age=31536000"))
    app.mount("/images", CachedStaticFiles(directory="web/images", cache_control="public, max-age=31536000"))
    app.mount("/media", StaticFiles(directory="web/media"))


def init_logging_config() -> None:
    LOGGING_CONFIG["formatters"]["default"]["fmt"] = "%(asctime)s %(levelprefix)s %(message)s"
    LOGGING_CONFIG["formatters"]["access"]["fmt"] = '%(asctime)s %(levelprefix)s %(client_addr)s - "%(request_line)s" %(status_code)s'
    LOGGING_CONFIG["formatters"]["default"]["datefmt"] = "%Y-%m-%d %H:%M:%S"
    LOGGING_CONFIG["formatters"]["access"]["datefmt"] = "%Y-%m-%d %H:%M:%S"


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncContextManager[None]:
    database.connect()
    yield
    database.close()


app = FastAPI(lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=500)


@app.exception_handler(404)
async def handle_error404(request: Request, _: Exception) -> HTMLResponse:
    user = await get_user(request)
    template = templates.get_template("errors/404.html")
    content = template.render(
        version=get_static_hash(),
        user=user
    )

    return HTMLResponse(content=content, status_code=404)


init_routers()
init_static_directories()
init_logging_config()
