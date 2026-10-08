import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.db.database import Base
from app.db.session import get_db
from app.models.user import User
from app.models.github_account import GitHubAccount
from app.core.security import create_session_token, encrypt_token

# In-memory SQLite for self-contained, isolated async testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def test_user(db_session: AsyncSession) -> User:
    user = User(
        google_id="google-test-id-12345",
        email="developer@tracemint.tech",
        name="Test Developer",
        avatar_url="https://tracemint.tech/avatar.png"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture(scope="function")
async def authenticated_client(client: AsyncClient, test_user: User) -> AsyncClient:
    token = create_session_token(test_user.id)
    client.cookies.set("tracemint_session", token)
    return client


@pytest_asyncio.fixture(scope="function")
async def user_with_github(db_session: AsyncSession, test_user: User) -> User:
    gh_account = GitHubAccount(
        user_id=test_user.id,
        github_id="gh-98765",
        username="dev_proven",
        avatar_url="https://avatars.githubusercontent.com/u/98765",
        access_token_encrypted=encrypt_token("gho_dummy_test_token_123")
    )
    db_session.add(gh_account)
    await db_session.commit()
    await db_session.refresh(test_user)
    return test_user
