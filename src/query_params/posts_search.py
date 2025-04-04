from dataclasses import dataclass


@dataclass
class PostsSearch:
    order: str = "timestamp"
    order_type: int = -1

    page: int = 0
    page_size: int = 10

    def to_query(self) -> dict:
        query = {}
        return query

    def to_order(self) -> dict:
        return {self.order: self.order_type, "post_id": 1}
