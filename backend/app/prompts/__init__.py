"""Prompts layer - 提示词模板统一管理"""

import os

SOFTWARE_FACTORY_PROMPT_PATH = os.path.join(
    os.path.dirname(__file__),
    "software_factory_prompt.md"
)

with open(SOFTWARE_FACTORY_PROMPT_PATH, "r", encoding="utf-8") as f:
    SOFTWARE_FACTORY_PROMPT = f.read()

__all__ = ["SOFTWARE_FACTORY_PROMPT"]
