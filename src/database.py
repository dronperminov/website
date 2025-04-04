import logging

from pymongo import MongoClient


class Database:
    client: MongoClient = None
    identifiers = None
    articles = None
    posts = None

    def __init__(self, mongo_url: str, database_name: str, logger: logging.Logger) -> None:
        self.mongo_url = mongo_url
        self.database_name = database_name
        self.logger = logger

    def connect(self) -> None:
        self.client = MongoClient(self.mongo_url)
        database = self.client[self.database_name]

        self.identifiers = database["identifiers"]

        for name in ["articles", "posts"]:
            if self.identifiers.find_one({"_id": name}) is None:
                self.identifiers.insert_one({"_id": name, "value": 0})

        self.articles = database["articles"]
        self.posts = database["posts"]

    def get_identifier(self, collection_name: str) -> int:
        identifier = self.identifiers.find_one_and_update({"_id": collection_name}, {"$inc": {"value": 1}}, return_document=True)
        return identifier["value"]

    def drop(self) -> None:
        self.client.drop_database(self.database_name)

    def close(self) -> None:
        self.client.close()
