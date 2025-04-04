from dataclasses import dataclass


@dataclass
class Picture:
    url: str
    preview_url: str

    def to_dict(self) -> dict:
        return {
            "url": self.url,
            "preview_url": self.preview_url
        }

    @classmethod
    def from_dict(cls: "Picture", data: dict) -> "Picture":
        return Picture(
            url=data["url"],
            preview_url=data["preview_url"]
        )
