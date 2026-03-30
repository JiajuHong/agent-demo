"""create session tables

Revision ID: 20260316_0001
Revises:
Create Date: 2026-03-16 16:00:00
"""

from __future__ import annotations

import os

from alembic import op
import sqlalchemy as sa


revision = "20260316_0001"
down_revision = None
branch_labels = None
depends_on = None


def _sessions_table() -> str:
    return os.getenv("MYSQL_SESSIONS_TABLE", "sessions")


def _messages_table() -> str:
    return os.getenv("MYSQL_SESSION_MESSAGES_TABLE", "session_messages")


def _index_names(inspector: sa.Inspector, table_name: str) -> set[str]:
    return {idx["name"] for idx in inspector.get_indexes(table_name)}


def upgrade() -> None:
    sessions_table = _sessions_table()
    messages_table = _messages_table()
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    sessions_exists = inspector.has_table(sessions_table)
    messages_exists = inspector.has_table(messages_table)

    if not sessions_exists:
        op.create_table(
            sessions_table,
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("session_id", sa.String(length=64), nullable=False),
            sa.Column("user_id", sa.String(length=64), nullable=True),
            sa.Column("title", sa.String(length=255), nullable=False),
            sa.Column("system_prompt", sa.Text(), nullable=True),
            sa.Column("status", sa.String(length=32), nullable=False, server_default="active"),
            sa.Column("message_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("last_message_at", sa.DateTime(), nullable=True),
            sa.Column("metadata_json", sa.Text(), nullable=True),
            sa.Column("agent_config_json", sa.Text(), nullable=True),
            sa.Column("tool_schema_hash", sa.String(length=255), nullable=True),
            sa.Column("read_cache_json", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
            sa.Column(
                "updated_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.UniqueConstraint("session_id", name="uk_session_id"),
        )

    current_session_indexes = _index_names(sa.inspect(bind), sessions_table)
    if "idx_user_updated" not in current_session_indexes:
        op.create_index("idx_user_updated", sessions_table, ["user_id", "updated_at"], unique=False)
    if "idx_last_message_at" not in current_session_indexes:
        op.create_index("idx_last_message_at", sessions_table, ["last_message_at"], unique=False)

    if not messages_exists:
        op.create_table(
            messages_table,
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("session_id", sa.String(length=64), nullable=False),
            sa.Column("message_id", sa.String(length=64), nullable=True),
            sa.Column("seq_no", sa.Integer(), nullable=False),
            sa.Column("role", sa.String(length=32), nullable=False),
            sa.Column("agent_name", sa.String(length=128), nullable=True),
            sa.Column("content", sa.Text(), nullable=False),
            sa.Column("content_type", sa.String(length=32), nullable=False, server_default="text"),
            sa.Column("tool_name", sa.String(length=128), nullable=True),
            sa.Column("tool_call_id", sa.String(length=128), nullable=True),
            sa.Column("metadata_json", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
            sa.ForeignKeyConstraint(["session_id"], [f"{sessions_table}.session_id"], ondelete="CASCADE"),
        )

    current_message_indexes = _index_names(sa.inspect(bind), messages_table)
    if "idx_session_seq" not in current_message_indexes:
        op.create_index("idx_session_seq", messages_table, ["session_id", "seq_no"], unique=True)
    if "idx_session_created" not in current_message_indexes:
        op.create_index("idx_session_created", messages_table, ["session_id", "created_at"], unique=False)
    if "idx_role" not in current_message_indexes:
        op.create_index("idx_role", messages_table, ["role"], unique=False)


def downgrade() -> None:
    sessions_table = _sessions_table()
    messages_table = _messages_table()

    op.drop_index("idx_role", table_name=messages_table)
    op.drop_index("idx_session_created", table_name=messages_table)
    op.drop_index("idx_session_seq", table_name=messages_table)
    op.drop_table(messages_table)

    op.drop_index("idx_last_message_at", table_name=sessions_table)
    op.drop_index("idx_user_updated", table_name=sessions_table)
    op.drop_table(sessions_table)
