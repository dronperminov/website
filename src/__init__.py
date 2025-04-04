import logging
import sys

from src.articles_database import ArticlesDatabase
from src.database import Database

logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger()

database = Database(mongo_url="mongodb://localhost:27017/", database_name="dronperminov", logger=logger)
articles_database = ArticlesDatabase(database=database, logger=logger)
