import logging
from functools import lru_cache
from typing import Dict, TypedDict

from langgraph.graph import END, StateGraph

from . import ner_service, summarizer, template_service

logger = logging.getLogger(__name__)


class SummaryState(TypedDict):
    text: str
    template_name: str
    ner: Dict
    template: Dict
    summary: str


def _ner_node(state: SummaryState) -> SummaryState:
    logger.info("Entering graph node: ner")
    state["ner"] = ner_service.extract_entities(state["text"])
    logger.info("Exiting graph node: ner")
    return state


def _template_node(state: SummaryState) -> SummaryState:
    logger.info("Entering graph node: template")
    state["template"] = template_service.load_template(state["template_name"])
    logger.info("Exiting graph node: template")
    return state


def _summarize_node(state: SummaryState) -> SummaryState:
    logger.info("Entering graph node: summarize")
    summary, ner_result = summarizer.summarize_text(
        state["text"], state["template_name"], state.get("template")
    )
    state["summary"] = summary
    state["ner"] = ner_result
    logger.info("Exiting graph node: summarize")
    return state


@lru_cache(maxsize=1)
def _build_graph() -> StateGraph:
    logger.info("Building LangGraph state machine")
    graph = StateGraph(SummaryState)
    graph.add_node("ner", _ner_node)
    graph.add_node("template", _template_node)
    graph.add_node("summarize", _summarize_node)

    graph.set_entry_point("ner")
    graph.add_edge("ner", "template")
    graph.add_edge("template", "summarize")
    graph.add_edge("summarize", END)
    return graph.compile()


def run_flow(text: str, template_name: str) -> Dict:
    logger.info("Entering run_flow")
    state: SummaryState = {
        "text": text,
        "template_name": template_name,
        "ner": {},
        "template": {},
        "summary": "",
    }
    graph = _build_graph()
    result_state = graph.invoke(state)
    logger.info("Exiting run_flow")
    return {"summary": result_state.get("summary", ""), "ner": result_state.get("ner", {})}
