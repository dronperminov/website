import logging
import re
from typing import Optional

from pymongo import ASCENDING, MongoClient

from src.entities.user import User


class Database:
    client: MongoClient = None
    identifiers = None
    users = None
    papers = None
    posts = None

    def __init__(self, mongo_url: str, database_name: str, logger: logging.Logger) -> None:
        self.mongo_url = mongo_url
        self.database_name = database_name
        self.logger = logger

    def connect(self) -> None:
        self.client = MongoClient(self.mongo_url)
        database = self.client[self.database_name]

        self.identifiers = database["identifiers"]

        for name in ["papers", "posts"]:
            if self.identifiers.find_one({"_id": name}) is None:
                self.identifiers.insert_one({"_id": name, "value": 0})

        self.users = database["users"]
        self.users.create_index([("username", ASCENDING)], unique=True)

        self.papers = database["papers"]
        self.papers.create_index([("paper_id", ASCENDING)], unique=True)

        self.posts = database["posts"]
        self.posts.create_index([("post_id", ASCENDING)], unique=True)

    def get_identifier(self, collection_name: str) -> int:
        identifier = self.identifiers.find_one_and_update({"_id": collection_name}, {"$inc": {"value": 1}}, return_document=True)
        return identifier["value"]

    def get_user(self, username: str) -> Optional[User]:
        if not username:
            return None

        user: dict = self.users.find_one({"username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}})
        return User.from_dict(user) if user else None

    def add_user(self, user: User) -> None:
        self.users.insert_one(user.to_dict())
        self.logger.info(f'Add new user "{user.username}"')

    def drop(self) -> None:
        self.client.drop_database(self.database_name)

    def close(self) -> None:
        self.client.close()
