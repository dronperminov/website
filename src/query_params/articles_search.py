import re
from dataclasses import dataclass


@dataclass
class ArticlesSearch:
    query: str = ""
    order: str = "date"
    order_type: int = -1

    page: int = 0
    page_size: int = 10

    def to_query(self) -> dict:
        query = {}

        if self.query:
            query["title"] = {"$regex": re.escape(self.query)}

        return query

    def to_order(self) -> dict:
        return {self.order: self.order_type, "article_id": 1}
