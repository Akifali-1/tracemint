"""initial_schema

Revision ID: 794d8410d4f5
Revises: 
Create Date: 2026-10-08 14:40:37.905237

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '794d8410d4f5'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('google_id', sa.String(length=128), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('avatar_url', sa.String(length=1024), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_google_id'), 'users', ['google_id'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. github_accounts table
    op.create_table(
        'github_accounts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('github_id', sa.String(length=128), nullable=False),
        sa.Column('username', sa.String(length=255), nullable=False),
        sa.Column('access_token_encrypted', sa.Text(), nullable=True),
        sa.Column('avatar_url', sa.String(length=1024), nullable=True),
        sa.Column('connected_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_github_accounts_id'), 'github_accounts', ['id'], unique=False)
    op.create_index(op.f('ix_github_accounts_user_id'), 'github_accounts', ['user_id'], unique=True)
    op.create_index(op.f('ix_github_accounts_github_id'), 'github_accounts', ['github_id'], unique=True)
    op.create_index(op.f('ix_github_accounts_username'), 'github_accounts', ['username'], unique=False)

    # 3. repositories table
    op.create_table(
        'repositories',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('github_account_id', sa.Integer(), nullable=False),
        sa.Column('github_repo_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('html_url', sa.String(length=1024), nullable=False),
        sa.Column('language', sa.String(length=100), nullable=True),
        sa.Column('stars', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('forks', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('topics', sa.JSON(), nullable=False),
        sa.Column('is_fork', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('repo_created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('repo_updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_synced_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['github_account_id'], ['github_accounts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_repositories_id'), 'repositories', ['id'], unique=False)
    op.create_index(op.f('ix_repositories_github_account_id'), 'repositories', ['github_account_id'], unique=False)
    op.create_index(op.f('ix_repositories_github_repo_id'), 'repositories', ['github_repo_id'], unique=True)
    op.create_index(op.f('ix_repositories_name'), 'repositories', ['name'], unique=False)
    op.create_index(op.f('ix_repositories_language'), 'repositories', ['language'], unique=False)

    # 4. github_metrics table
    op.create_table(
        'github_metrics',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('github_account_id', sa.Integer(), nullable=False),
        sa.Column('repository_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_stars', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_forks', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('languages', sa.JSON(), nullable=False),
        sa.Column('recent_repository_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('active_repository_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('calculated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['github_account_id'], ['github_accounts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_github_metrics_id'), 'github_metrics', ['id'], unique=False)
    op.create_index(op.f('ix_github_metrics_github_account_id'), 'github_metrics', ['github_account_id'], unique=True)

    # 5. developer_profiles table
    op.create_table(
        'developer_profiles',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('username_slug', sa.String(length=255), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('skills_json', sa.JSON(), nullable=False),
        sa.Column('strengths_json', sa.JSON(), nullable=False),
        sa.Column('projects_json', sa.JSON(), nullable=False),
        sa.Column('insights_json', sa.JSON(), nullable=False),
        sa.Column('metrics_json', sa.JSON(), nullable=False),
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_developer_profiles_id'), 'developer_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_developer_profiles_user_id'), 'developer_profiles', ['user_id'], unique=True)
    op.create_index(op.f('ix_developer_profiles_username_slug'), 'developer_profiles', ['username_slug'], unique=True)


def downgrade() -> None:
    op.drop_table('developer_profiles')
    op.drop_table('github_metrics')
    op.drop_table('repositories')
    op.drop_table('github_accounts')
    op.drop_table('users')
