import logging
import sys

from src.database import Database
from src.databases.articles_database import ArticlesDatabase
from src.databases.papers_database import PapersDatabase
from src.databases.posts_database import PostsDatabase

logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger()

database = Database(mongo_url="mongodb://localhost:27017/", database_name="dronperminov", logger=logger)
articles_database = ArticlesDatabase(database=database, logger=logger)
papers_database = PapersDatabase(database=database, logger=logger)
posts_database = PostsDatabase(database=database, logger=logger)
