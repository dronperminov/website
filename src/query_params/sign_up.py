from dataclasses import dataclass

from src.entities.user import User
from src.enums import UserRole
from src.utils.auth import get_password_hash


@dataclass
class SignUp:
    username: str
    password: str
    fullname: str

    def to_user(self) -> User:
        return User(
            username=self.username,
            password_hash=get_password_hash(self.password),
            fullname=self.fullname,
            role=UserRole.USER,
            avatar_url="/images/profiles/default.png"
        )
