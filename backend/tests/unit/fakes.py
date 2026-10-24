from app.models.user import User


class FakeUserRepository:
    def __init__(self) -> None:
        self.users: list[User] = []

    def add(self, user: User) -> User:
        user.id = len(self.users) + 1
        self.users.append(user)
        return user

    def find_by_email(self, email: str) -> User | None:
        return next((user for user in self.users if user.email == email), None)
