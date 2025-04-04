from dataclasses import dataclass


@dataclass
class Picture:
    width: int
    height: int
    url: str
    preview_url: str

    def to_dict(self) -> dict:
        return {
            "width": self.width,
            "height": self.height,
            "url": self.url,
            "preview_url": self.preview_url
        }

    @classmethod
    def from_dict(cls: "Picture", data: dict) -> "Picture":
        return Picture(
            width=data["width"],
            height=data["height"],
            url=data["url"],
            preview_url=data["preview_url"]
        )
