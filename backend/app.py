import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import graph_flow, template_service

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class SummarizeRequest(BaseModel):
    text: str
    template_name: str


class TemplateSaveRequest(BaseModel):
    name: str
    data: dict


app = FastAPI(title="Medical Summary Assistant")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.post("/summarize")
async def summarize(payload: SummarizeRequest) -> dict:
    logger.info("Entering /summarize endpoint")
    try:
        response = graph_flow.run_flow(payload.text, payload.template_name)
        summary = response.get("summary", "")
        ner = response.get("ner", {})
        logger.info("Exiting /summarize endpoint successfully")
        return {"summary": summary, "ner": ner}
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception("Summarization flow failed")
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/health")
async def health() -> dict:
    logger.info("Health check invoked")
    logger.info("Health check completed")
    return {"status": "ok"}


@app.get("/template/{name}")
async def get_template(name: str) -> dict:
    logger.info("Entering /template/{name} endpoint")
    try:
        template = template_service.load_template(name)
        logger.info("Exiting /template/{name} endpoint")
        return template
    except Exception as exc:
        logger.exception("Template retrieval failed")
        raise HTTPException(status_code=404, detail=str(exc))


@app.post("/template/save")
async def save_template(payload: TemplateSaveRequest) -> dict:
    logger.info("Entering /template/save endpoint")
    try:
        path = template_service.save_template(payload.name, payload.data)
        logger.info("Exiting /template/save endpoint")
        return {"status": "saved", "path": str(path)}
    except Exception as exc:
        logger.exception("Template save failed")
        raise HTTPException(status_code=400, detail=str(exc))
