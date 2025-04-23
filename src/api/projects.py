from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse

from src.api import templates
from src.entities.user import User
from src.utils.auth import get_user
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/projects")
async def projects(user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    template = templates.get_template("projects.html")
    content = template.render(
        version=get_static_hash(),
        page="projects",
        user=user,
        breadcrumbs=[("/", "Главная"), ("/projects", "Проекты")]
    )
    return HTMLResponse(content=content)
