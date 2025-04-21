from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional


@dataclass
class Paper:
    paper_id: int
    title: str
    authors: List[str]
    date: datetime
    link: Optional[str]
    pdf_link: Optional[str]

    def to_dict(self) -> dict:
        return {
            "paper_id": self.paper_id,
            "title": self.title,
            "authors": self.authors,
            "date": self.date,
            "link": self.link,
            "pdf_link": self.pdf_link
        }

    @classmethod
    def from_dict(cls: "Paper", data: dict) -> "Paper":
        return Paper(
            paper_id=data["paper_id"],
            title=data["title"],
            authors=data["authors"],
            date=data["date"],
            link=data["link"],
            pdf_link=data["pdf_link"]
        )
