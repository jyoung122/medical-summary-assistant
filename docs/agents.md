# Project Agents

The Medical Summary Assistant uses several cooperative agents coordinated through LangGraph:

- **ner-agent (`backend/ner_service.py`)** – Loads the `en_core_sci_sm` spaCy/scispaCy model to extract entities and section cues from clinician notes.
- **template-agent (`backend/template_service.py`)** – Reads, validates, and persists YAML templates located in `templates/`.
- **summarizer-agent (`backend/summarizer.py`)** – Builds prompts using template metadata, invokes the configured Ollama runtime, and merges results with NER output.
- **graph-agent (`backend/graph_flow.py`)** – Orchestrates the LangGraph workflow that wires NER, template loading, and summarisation nodes together.
- **ui-agent (`app/renderer/components/ChatInterface.jsx`)** – Hosts the PromptKit chat surface and updates the summary sidebar via React Query.

The `graph-agent` owns the LangGraph state machine. It passes intermediate state between the NER, template, and summariser agents and exposes a single `run_flow` method for the FastAPI endpoint.
