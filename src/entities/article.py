from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

from src.entities.picture import Picture
from src.utils.common import get_word_form


@dataclass
class Article:
    article_id: int
    title: str
    datetime: datetime
    link: Optional[str]
    preview: Picture
    intro: str
    tags: List[str]

    def to_dict(self) -> dict:
        return {
            "article_id": self.article_id,
            "title": self.title,
            "datetime": self.datetime,
            "link": self.link,
            "preview": self.preview.to_dict(),
            "intro": self.intro,
            "tags": self.tags
        }

    @classmethod
    def from_dict(cls: "Article", data: dict) -> "Article":
        return Article(
            article_id=data["article_id"],
            title=data["title"],
            datetime=data["datetime"],
            link=data["link"],
            preview=Picture.from_dict(data["preview"]),
            intro=data["intro"],
            tags=data["tags"]
        )

    def format_datetime(self) -> str:
        delta = (datetime.now() - self.datetime).total_seconds() / 60

        if delta < 1:
            return "только что"

        if delta < 60:
            return get_word_form(int(delta), ["минуту назад", "минуты назад", "минут назад"])

        if delta < 60 * 24:
            return get_word_form(int(delta / 60), ["час назад", "часа назад", "часов назад"])

        months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]

        day = f"{self.datetime.day:02d}"
        month = months[self.datetime.month - 1]
        year = self.datetime.year

        hours = f"{self.datetime.hour:02d}"
        minutes = f"{self.datetime.minute:02d}"

        return f"{day} {month} {year} в {hours}:{minutes}"
