import logging
from pathlib import Path
from typing import Any, Dict

import yaml

logger = logging.getLogger(__name__)

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"


def _normalize_name(name: str) -> str:
    return name if name.endswith(".yaml") else f"{name}.yaml"


def _validate_template(data: Dict[str, Any]) -> None:
    logger.info("Validating template structure")
    template = data.get("template")
    if not template or "sections" not in template:
        raise ValueError("Template must include a 'template' key with 'sections'.")
    for section in template["sections"]:
        if "name" not in section or "ai_instruction" not in section:
            raise ValueError("Each section requires 'name' and 'ai_instruction'.")


def load_template(name: str) -> Dict[str, Any]:
    logger.info("Entering load_template")
    path = TEMPLATE_DIR / _normalize_name(name)
    if not path.exists():
        raise FileNotFoundError(f"Template {name} not found")
    with path.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle) or {}
    _validate_template(data)
    logger.info("Exiting load_template")
    return data


def save_template(name: str, data: Dict[str, Any]) -> Path:
    logger.info("Entering save_template")
    TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)
    _validate_template(data)
    path = TEMPLATE_DIR / _normalize_name(name)
    with path.open("w", encoding="utf-8") as handle:
        yaml.safe_dump(data, handle, sort_keys=False, allow_unicode=True)
    logger.info("Exiting save_template")
    return path
