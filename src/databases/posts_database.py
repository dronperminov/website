import logging
from typing import List, Optional, Tuple

from src.database import Database
from src.entities.post import Post
from src.query_params.posts_search import PostsSearch


class PostsDatabase:
    def __init__(self, database: Database, logger: logging.Logger) -> None:
        self.database = database
        self.logger = logger

    def add_post(self, post: Post) -> None:
        self.database.posts.insert_one(post.to_dict())
        self.logger.info(f'Add post "{post.post_id}"')

    def get_recent(self, count: int) -> List[Post]:
        posts = self.database.posts.find({}).sort({"date": -1}).limit(count)
        return [Post.from_dict(post) for post in posts]

    def get_post(self, post_id: int) -> Optional[Post]:
        post = self.database.posts.find_one({"post_id": post_id})
        return Post.from_dict(post) if post else None

    def search(self, params: PostsSearch) -> Tuple[int, List[Post]]:
        query, order = params.to_query(), params.to_order()

        total = self.database.posts.count_documents(query)
        posts = self.database.posts.find(query).sort(order).skip(params.page_size * params.page).limit(params.page_size)
        return total, [Post.from_dict(post) for post in posts]
