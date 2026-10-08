"""add gemini_usage_logs table

Revision ID: 9a8b7c6d5e4f
Revises: 8f1e2d3c4b5a
Create Date: 2026-10-08 16:44:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '9a8b7c6d5e4f'
down_revision: Union[str, None] = '8f1e2d3c4b5a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'gemini_usage_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('requested_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('feature', sa.String(length=64), server_default='profile_analysis', nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gemini_usage_logs_id'), 'gemini_usage_logs', ['id'], unique=False)
    op.create_index(op.f('ix_gemini_usage_logs_user_id'), 'gemini_usage_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_gemini_usage_logs_requested_at'), 'gemini_usage_logs', ['requested_at'], unique=False)


def downgrade() -> None:
    op.drop_table('gemini_usage_logs')
