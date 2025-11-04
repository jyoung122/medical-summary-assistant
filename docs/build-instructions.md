# Build Instructions

Follow these steps to build and package the Medical Summary Assistant across supported platforms.

## Prerequisites

- Node.js 18+
- Python 3.11 with [Poetry](https://python-poetry.org/)
- An [Ollama](https://ollama.ai/) runtime with the `gemma:2b` model installed

## Backend

1. Install dependencies and lock versions:
   ```bash
   poetry install
   ```
2. Run migrations or model downloads if needed (spaCy/scispaCy models can be installed with `python -m spacy download en_core_sci_sm`).
3. Launch the API locally:
   ```bash
   poetry run uvicorn backend.app:app --port 8001
   ```

## Frontend

1. Install Node dependencies:
   ```bash
   npm install
   ```
2. Start the development shell:
   ```bash
   npm run dev
   ```
3. Build a distributable package using Electron Builder:
   ```bash
   npm run build
   ```

## Packaging Notes

- Electron Builder is configured to emit installers for Windows (NSIS), macOS (DMG/ZIP), and Linux (AppImage/DEB).
- Ensure the backend is bundled or launched separately when distributing the desktop application.
- Refer to the [Step-by-Step Setup guide](step-by-step-setup.md) for environment configuration details.
