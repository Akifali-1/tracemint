"""add improvements_json to developer_profiles

Revision ID: 8f1e2d3c4b5a
Revises: 794d8410d4f5
Create Date: 2026-10-08 16:16:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f1e2d3c4b5a'
down_revision: Union[str, None] = '794d8410d4f5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'developer_profiles',
        sa.Column('improvements_json', sa.JSON(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('developer_profiles', 'improvements_json')
