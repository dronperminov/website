import logging
from typing import List, Tuple

from src.database import Database
from src.entities.paper import Paper
from src.query_params.papers_search import PapersSearch


class PapersDatabase:
    def __init__(self, database: Database, logger: logging.Logger) -> None:
        self.database = database
        self.logger = logger

    def add_paper(self, paper: Paper) -> None:
        self.database.papers.insert_one(paper.to_dict())
        self.logger.info(f'Add paper "{paper.title}" ({paper.date.year})')

    def get_recent(self, count: int) -> List[Paper]:
        papers = self.database.papers.find({}).sort({"date": -1}).limit(count)
        return [Paper.from_dict(paper) for paper in papers]

    def search(self, params: PapersSearch) -> Tuple[int, List[Paper]]:
        query, order = params.to_query(), params.to_order()

        total = self.database.papers.count_documents(query)
        papers = self.database.papers.find(query).sort(order).skip(params.page_size * params.page).limit(params.page_size)
        return total, [Paper.from_dict(paper) for paper in papers]
