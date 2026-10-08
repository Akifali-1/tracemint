from datetime import datetime, timezone, timedelta
from app.services.github_analyzer import GitHubAnalyzer


def test_github_analyzer_metrics():
    now = datetime.now(timezone.utc)
    recent_date = now - timedelta(days=30)
    old_date = now - timedelta(days=250)

    sample_repos = [
        {
            "name": "fastapi-service",
            "language": "Python",
            "stars": 45,
            "forks": 12,
            "description": "High performance async REST API with Docker",
            "topics": ["fastapi", "docker", "api"],
            "is_fork": False,
            "repo_updated_at": recent_date
        },
        {
            "name": "tracemint-web",
            "language": "TypeScript",
            "stars": 20,
            "forks": 5,
            "description": "Developer proof-of-work web frontend",
            "topics": ["react", "vite", "tailwind"],
            "is_fork": False,
            "repo_updated_at": recent_date
        },
        {
            "name": "legacy-tool",
            "language": "Python",
            "stars": 5,
            "forks": 1,
            "description": "Legacy scripts",
            "topics": [],
            "is_fork": False,
            "repo_updated_at": old_date
        },
        {
            "name": "external-fork",
            "language": "Go",
            "stars": 1000,
            "forks": 200,
            "description": "Forked project",
            "topics": [],
            "is_fork": True,  # Forks shouldn't inflate stars/forks
            "repo_updated_at": recent_date
        }
    ]

    evidence = GitHubAnalyzer.analyze_repositories("testdev", sample_repos)

    assert evidence.username == "testdev"
    assert evidence.repository_count == 4
    assert evidence.total_stars == 70  # 45 + 20 + 5 (ignoring forked 1000)
    assert evidence.total_forks == 18  # 12 + 5 + 1
    assert evidence.languages["Python"] == 2
    assert evidence.languages["TypeScript"] == 1
    assert evidence.languages["Go"] == 1
    assert evidence.active_repository_count == 3  # 3 updated within 90 days
