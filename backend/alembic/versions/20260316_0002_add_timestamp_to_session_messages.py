"""add timestamp to session_messages

Revision ID: 20260316_0002
Revises: 20260316_0001
Create Date: 2026-03-16
"""

from __future__ import annotations

import os

from alembic import op
import sqlalchemy as sa


revision = "20260316_0002"
down_revision = "20260316_0001"
branch_labels = None
depends_on = None


def _messages_table() -> str:
    return os.getenv("MYSQL_SESSION_MESSAGES_TABLE", "session_messages")


def upgrade() -> None:
    messages_table = _messages_table()
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    existing_cols = {col["name"] for col in inspector.get_columns(messages_table)}
    if "timestamp" not in existing_cols:
        # nullable=True 兼容已有行，默认值由应用层补写。
        op.add_column(
            messages_table,
            sa.Column("timestamp", sa.DateTime(), nullable=True),
        )
        # 用 created_at 回填现有行的 timestamp。
        op.execute(
            f"UPDATE `{messages_table}` SET `timestamp` = `created_at` WHERE `timestamp` IS NULL"
        )


def downgrade() -> None:
    messages_table = _messages_table()
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    existing_cols = {col["name"] for col in inspector.get_columns(messages_table)}
    if "timestamp" in existing_cols:
        op.drop_column(messages_table, "timestamp")
