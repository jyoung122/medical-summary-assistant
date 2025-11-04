import json
import logging
from pathlib import Path
from typing import Dict, Optional, Tuple
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from . import ner_service, template_service

logger = logging.getLogger(__name__)

CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "runtime.json"


def _load_runtime_config() -> Dict[str, str]:
    logger.info("Loading runtime configuration")
    if not CONFIG_PATH.exists():
        raise FileNotFoundError("Runtime configuration missing at config/runtime.json")
    with CONFIG_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _build_prompt(text: str, template: Dict) -> str:
    sections = template.get("template", {}).get("sections", [])
    prompt_sections = "\n".join(
        f"### {section['name']}\n{section['ai_instruction']}" for section in sections
    )
    prompt = (
        "You are a clinical documentation assistant. Use the template sections to summarise the text.\n"
        "Input text:\n"
        f"{text}\n\nTemplate guidance:\n{prompt_sections}\n"
    )
    return prompt


def _call_runtime(prompt: str, runtime: Dict[str, str]) -> str:
    payload = {
        "model": runtime.get("model", "gemma:2b"),
        "prompt": prompt,
        "stream": False,
    }
    data = json.dumps(payload).encode("utf-8")
    request = Request(
        f"{runtime['endpoint'].rstrip('/')}/api/generate",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=120) as response:
            body = response.read().decode("utf-8")
            result = json.loads(body)
            return result.get("response") or result.get("summary", "")
    except (HTTPError, URLError, TimeoutError) as exc:  # pragma: no cover - network failure
        logger.warning("Runtime call failed: %s", exc)
        return "Unable to contact local model runtime. Please verify the Ollama service is running."


def summarize_text(
    text: str, template_name: str, template_data: Optional[Dict] = None
) -> Tuple[str, Dict]:
    logger.info("Entering summarize_text")
    ner_result = ner_service.extract_entities(text)
    template = template_data or template_service.load_template(template_name)
    runtime = _load_runtime_config()

    prompt = _build_prompt(text, template)
    summary = _call_runtime(prompt, runtime)

    logger.info("Exiting summarize_text")
    return summary, ner_result
