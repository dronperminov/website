from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional


@dataclass
class Article:
    article_id: int
    title: str
    authors: List[str]
    date: datetime
    link: Optional[str]
    pdf_link: Optional[str]

    def to_dict(self) -> dict:
        return {
            "article_id": self.article_id,
            "title": self.title,
            "authors": self.authors,
            "date": self.date,
            "link": self.link,
            "pdf_link": self.pdf_link
        }

    @classmethod
    def from_dict(cls: "Article", data: dict) -> "Article":
        return Article(
            article_id=data["article_id"],
            title=data["title"],
            authors=data["authors"],
            date=data["date"],
            link=data["link"],
            pdf_link=data["pdf_link"]
        )
