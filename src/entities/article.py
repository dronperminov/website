from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

from src.entities.picture import Picture


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
