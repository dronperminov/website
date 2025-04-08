import os
from dataclasses import dataclass
from datetime import datetime
from typing import List, Union

from fastapi import File, Form, UploadFile

from src.entities.picture import Picture
from src.entities.post import PicturePost, Post, TextPost
from src.utils.common import prepare_pictures


@dataclass
class PostAdd:
    text: str = Form(...)
    pictures: List[Union[UploadFile, Picture]] = File([])

    def to_post(self, post_id: int, paths: List[str]) -> Post:
        timestamp = datetime.now()

        if self.pictures:
            post_images_path = os.path.join(os.path.dirname(__file__), "..", "..", "web", "images", "posts")
            pictures = prepare_pictures(paths=paths, post_id=post_id, post_images_path=post_images_path)
            return PicturePost(post_id=post_id, timestamp=timestamp, text=self.text, pictures=pictures)

        return TextPost(post_id=post_id, timestamp=timestamp, text=self.text)
