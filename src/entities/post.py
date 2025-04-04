from dataclasses import dataclass, field
from datetime import datetime

from src.entities.picture import Picture
from src.enums import PostType


@dataclass
class Post:
    post_id: int
    post_type: PostType = field(init=False)
    timestamp: datetime
    text: str

    def to_dict(self) -> dict:
        return {
            "post_id": self.post_id,
            "post_type": self.post_type.value,
            "timestamp": self.timestamp,
            "text": self.text
        }

    @classmethod
    def from_dict(cls: "Post", data: dict) -> "Post":
        post_type = PostType(data["post_type"])

        if post_type == PostType.TEXT:
            return TextPost.from_dict(data=data)

        if post_type == PostType.PICTURE:
            return PicturePost.from_dict(data=data)

        raise ValueError(f'Invalid post type "{post_type}"')


@dataclass
class TextPost(Post):
    post_type = PostType.TEXT

    @classmethod
    def from_dict(cls: "TextPost", data: dict) -> "TextPost":
        return cls(
            post_id=data["post_id"],
            timestamp=data["timestamp"],
            text=data["text"]
        )


@dataclass
class PicturePost(Post):
    post_type = PostType.PICTURE
    picture: Picture

    @classmethod
    def from_dict(cls: "PicturePost", data: dict) -> "PicturePost":
        return cls(
            post_id=data["post_id"],
            timestamp=data["timestamp"],
            text=data["text"],
            picture=Picture.from_dict(data["picture"])
        )

    def to_dict(self) -> dict:
        return {
            **super().to_dict(),
            "picture": self.picture.to_dict()
        }
