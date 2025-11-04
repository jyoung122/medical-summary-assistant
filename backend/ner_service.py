import logging
from functools import lru_cache
from typing import Dict, List

import spacy

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _load_model():
    logger.info("Loading spaCy model en_core_sci_sm")
    try:
        return spacy.load("en_core_sci_sm")
    except (OSError, IOError):
        logger.warning("en_core_sci_sm model not found; falling back to blank English model")
        return spacy.blank("en")


def extract_entities(text: str) -> Dict[str, List[Dict[str, str]]]:
    logger.info("Entering extract_entities")
    nlp = _load_model()
    doc = nlp(text)

    entities = [
        {"text": ent.text, "label": ent.label_ or "UNKNOWN"}
        for ent in getattr(doc, "ents", [])
    ]

    sections: List[Dict[str, str]] = []
    for idx, block in enumerate(text.split("\n\n")):
        cleaned = block.strip()
        if cleaned:
            sections.append({"id": idx, "content": cleaned})

    result = {"entities": entities, "sections": sections}
    logger.info("Exiting extract_entities")
    return result
