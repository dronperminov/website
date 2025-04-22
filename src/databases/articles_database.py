import logging
from typing import List, Optional, Tuple

from src.database import Database
from src.entities.article import Article
from src.query_params.articles_search import ArticlesSearch


class ArticlesDatabase:
    def __init__(self, database: Database, logger: logging.Logger) -> None:
        self.database = database
        self.logger = logger

    def add_article(self, article: Article) -> None:
        self.database.articles.insert_one(article.to_dict())
        self.logger.info(f'Add article "{article.title}" ({article.datetime})')

    def get_recent(self, count: int) -> List[Article]:
        articles = self.database.articles.find({}).sort({"datetime": -1}).limit(count)
        return [Article.from_dict(article) for article in articles]

    def get_article_by_link(self, link: str) -> Optional[Article]:
        article = self.database.articles.find_one({"link": link})
        return Article.from_dict(article) if article else None

    def search(self, params: ArticlesSearch) -> Tuple[int, List[Article]]:
        query, order = params.to_query(), params.to_order()

        total = self.database.articles.count_documents(query)
        articles = self.database.articles.find(query).sort(order).skip(params.page_size * params.page).limit(params.page_size)
        return total, [Article.from_dict(article) for article in articles]
