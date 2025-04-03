from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from uvicorn.config import LOGGING_CONFIG

from src.api import api


def init_routers() -> None:
    app.include_router(api.router)


def init_static_directories() -> None:
    app.mount("/styles", StaticFiles(directory="web/styles"))
    app.mount("/js", StaticFiles(directory="web/js"))
    app.mount("/fonts", StaticFiles(directory="web/fonts"))
    app.mount("/images", StaticFiles(directory="web/images"))


def init_logging_config() -> None:
    LOGGING_CONFIG["formatters"]["default"]["fmt"] = "%(asctime)s %(levelprefix)s %(message)s"
    LOGGING_CONFIG["formatters"]["access"]["fmt"] = '%(asctime)s %(levelprefix)s %(client_addr)s - "%(request_line)s" %(status_code)s'
    LOGGING_CONFIG["formatters"]["default"]["datefmt"] = "%Y-%m-%d %H:%M:%S"
    LOGGING_CONFIG["formatters"]["access"]["datefmt"] = "%Y-%m-%d %H:%M:%S"


app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=500)

init_routers()
init_static_directories()
init_logging_config()
