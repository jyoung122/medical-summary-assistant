# Step-by-Step Setup Guide

This guide walks through preparing a development environment for the Medical Summary Assistant.

## 1. Clone the Repository
```bash
git clone https://github.com/your-org/medical-summary-assistant.git
cd medical-summary-assistant
```

## 2. Configure Python Environment
1. Install [Poetry](https://python-poetry.org/docs/#installation).
2. Create the virtual environment and install dependencies:
   ```bash
   poetry install
   ```
3. (Optional) Download spaCy/scispaCy models:
   ```bash
   poetry run python -m spacy download en_core_sci_sm
   ```
4. Start the FastAPI backend:
   ```bash
   poetry run uvicorn backend.app:app --port 8001
   ```

## 3. Configure Node Environment
1. Install Node.js 18 or later.
2. Install packages and start the renderer:
   ```bash
   npm install
   npm run dev
   ```

## 4. Prepare Local LLM Runtime
1. Install [Ollama](https://ollama.ai/).
2. Pull the `gemma:2b` model:
   ```bash
   ollama pull gemma:2b
   ```
3. Ensure the service is running on `http://localhost:11434` or update `config/runtime.json`.

## 5. Test the End-to-End Flow
1. Open the Electron app started by `npm run dev`.
2. Paste clinical text or upload a PDF placeholder.
3. Verify that the summary sidebar updates with summary text, YAML template, and NER output.

Keep this document up to date if backend endpoints, model names, or runtime settings change.
