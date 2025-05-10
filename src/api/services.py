from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse

from src.api import templates
from src.entities.user import User
from src.utils.auth import get_user
from src.utils.common import get_static_hash

router = APIRouter()


@router.get("/json-formatter")
async def get_json_formatter(user: Optional[User] = Depends(get_user)) -> HTMLResponse:
    template = templates.get_template("services/json_formatter.html")
    content = template.render(
        version=get_static_hash(),
        page="json_formatter",
        user=user,
        title="JSON форматтер с контролем глубины и валидацией | Dronperminov",
        description="Онлайн JSON форматтер с уникальной функцией ограничения глубины форматирования. Поддерживает минификацию, валидацию и гибкие настройки.",
        keywords=", ".join([
            "json formatter", "json minifier", "онлайн json", "форматировать json", "подсветка json",
            "сжать json", "beautify json", "форматирование json онлайн", "json online tool"
        ]),
        breadcrumbs=[("/", "Главная"), ("/json-formatter", "Умный JSON форматтер с глубиной форматирования и валидацией")]
    )
    return HTMLResponse(content=content)
