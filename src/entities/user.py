from dataclasses import dataclass

from src.enums import UserRole


@dataclass
class User:
    username: str
    password_hash: str
    fullname: str
    avatar_url: str
    role: UserRole

    def to_dict(self) -> dict:
        return {
            "username": self.username,
            "password_hash": self.password_hash,
            "fullname": self.fullname,
            "avatar_url": self.avatar_url,
            "role": self.role.value
        }

    @classmethod
    def from_dict(cls: "User", data: dict) -> "User":
        return cls(
            username=data["username"],
            password_hash=data["password_hash"],
            fullname=data["fullname"],
            avatar_url=data["avatar_url"],
            role=UserRole(data["role"])
        )
