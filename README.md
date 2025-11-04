# Medical Summary Assistant

The Medical Summary Assistant is a desktop application that helps clinicians transform long-form notes, dictated encounters, and PDF records into structured discharge summaries. It couples an Electron + React experience with a FastAPI backend powered by LangGraph to orchestrate local LLM inference.

## Architecture Overview

- **Frontend:** Electron shell with a React renderer that offers chat-style prompting, quick voice placeholders, and a live summary sidebar built with PromptKit, ShadCN UI, and TailwindCSS.
- **Backend:** FastAPI service exposing summarisation and health endpoints. The backend chains spaCy/scispaCy NER, YAML templates, and a local Ollama runtime through a LangGraph pipeline.
- **Configuration:** Runtime preferences are stored in `config/runtime.json`, and templates live under `templates/`.

## Getting Started

1. Install Node dependencies and start the Electron shell:
   ```bash
   npm install
   npm run dev
   ```
2. Set up the Python backend using Poetry:
   ```bash
   poetry install
   poetry run uvicorn backend.app:app --port 8001
   ```
3. Ensure an Ollama runtime is available locally. Update `config/runtime.json` if your endpoint differs.

For detailed setup and build instructions refer to:

- [Step-by-Step Setup](docs/step-by-step-setup.md)
- [Build Instructions](docs/build-instructions.md)

## Repository Layout

- `app/` – Electron main process and React renderer.
- `backend/` – FastAPI application, LangGraph workflow, and summarisation services.
- `config/` – Runtime configuration files for local inference.
- `docs/` – Documentation for contributors and automation agents.
- `templates/` – YAML templates describing the target clinical summary sections.

## Contributing

Please open issues or pull requests for changes. Ensure linting and tests run cleanly before submitting updates.
