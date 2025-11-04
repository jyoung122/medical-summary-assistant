
````markdown
# 🧠 Codex Build Instructions per File
This document provides **explicit instructions for Codex (OpenAI codex coding agent)** to implement or modify each file in the `medical-summary-assistant` project.

> Codex should follow these instructions precisely, maintaining modularity and human-readable code.  
> The project integrates an Electron + React frontend with a Python FastAPI + LangGraph backend and local LLM inference.

---

## ⚙️ Root Files

### `package.json`
**Purpose:** Node/Electron dependency management.  
**Codex Tasks:**
- Include dependencies: `electron`, `react`, `react-dom`, `prompt-kit`, `shadcn-ui`, `tailwindcss`, `@tanstack/react-query`.
- Add scripts:
  ```json
  "scripts": {
    "dev": "electron app/main.js",
    "build": "electron-builder",
    "start": "electron app/main.js"
  }
````

* Ensure Electron build targets cross-platform (Windows, macOS, Linux).

---

### `pyproject.toml`

**Purpose:** Python dependency management.
**Codex Tasks:**

* Use `fastapi`, `uvicorn`, `pyyaml`, `spacy`, `scispacy`, `langgraph`, `langchain-core`.
* Configure virtual environment isolation.

---

### `codex.project.json`

**Purpose:** Provides Codex context for project structure.
**Codex Tasks:**

* Preserve all agent metadata (see finalized version with `langgraph`).
* Ensure `agentsEnabled` and `allowLLMLocalRuntime` remain `true`.

---

### `README.md`

**Purpose:** Human-facing overview.
**Codex Tasks:**

* Summarize app purpose and architecture.
* Include setup links to `/docs/step-by-step-setup.md` and `/docs/build-instructions.md`.

---

## 🧩 Backend (Python)

### `backend/app.py`

**Purpose:** Entrypoint FastAPI service.
**Codex Tasks:**

* Create `/summarize` endpoint that:

  1. Accepts `text` and `template_name`.
  2. Calls `graph_flow.run_flow()` (LangGraph pipeline).
  3. Returns JSON `{ summary, ner }`.
* Create `/health` endpoint returning `{status:"ok"}`.
* Launch via `uvicorn backend.app:app --port 8001`.

---

### `backend/ner_service.py`

**Purpose:** Medical NER preprocessing.
**Codex Tasks:**

* Load `en_core_sci_sm` spaCy model.
* Implement `extract_entities(text)`:

  * Return dict `{ "entities": [{ "text": str, "label": str }], "sections": [...] }`.
* Handle missing models gracefully.
* Include caching if desired.

---

### `backend/template_service.py`

**Purpose:** Template management (YAML).
**Codex Tasks:**

* Implement `load_template(name)` to load YAML from `/templates`.
* Implement `save_template(name, data)` to write YAML.
* Validate section format (`name`, `ai_instruction` required).

---

### `backend/summarizer.py`

**Purpose:** Summarization orchestration.
**Codex Tasks:**

* Define `summarize_text(text, template_name)`:

  1. Call `ner_service.extract_entities()`.
  2. Load YAML via `template_service.load_template()`.
  3. Build structured prompt with template + entities.
  4. Send to local runtime (`ollama` API POST).
  5. Return combined summary JSON.

---

### `backend/graph_flow.py`

**Purpose:** LangGraph orchestration.
**Codex Tasks:**

* Use `langgraph.graph` to define nodes:

  * `ner_node`: runs NER.
  * `template_node`: loads YAML schema.
  * `summarize_node`: runs `summarizer.summarize_text()`.
* Define flow:

  ```
  NER → TEMPLATE → SUMMARIZE → OUTPUT
  ```
* Expose `run_flow(text, template_name)` for external call.
* Log all intermediate outputs.

---

## 🎨 Frontend (Electron + React)

### `app/main.js`

**Purpose:** Electron entrypoint.
**Codex Tasks:**

* Create a browser window loading `app/renderer/index.html`.
* Enable Node integration for IPC calls.
* Manage app lifecycle (`ready`, `window-all-closed`, etc.).

---

### `app/renderer/index.html`

**Purpose:** Static HTML root.
**Codex Tasks:**

* Minimal HTML skeleton:

  ```html
  <div id="root"></div>
  <script type="module" src="./App.jsx"></script>
  ```

---

### `app/renderer/App.jsx`

**Purpose:** Main React app entry.
**Codex Tasks:**

* Render `ChatInterface` and `SummarySidebar`.
* Manage layout:

  * Left: Chat pane.
  * Right: Summary / Template / NER tabs.
* Use Tailwind for layout styling.

---

### `app/renderer/components/ChatInterface.jsx`

**Purpose:** User input + message display.
**Codex Tasks:**

* Use PromptKit’s `PromptInput` and `ChatContainer`.
* Support:

  * Text input
  * Voice (placeholder button)
  * PDF upload (calls backend `/summarize`)
* Stream responses as they arrive.

---

### `app/renderer/components/SummarySidebar.jsx`

**Purpose:** Display right sidebar tabs.
**Codex Tasks:**

* Use ShadCN `Tabs` with:

  1. **Summary** (markdown)
  2. **Template YAML** (editable)
  3. **NER View** (JSON tree)
* Sync live with backend results.

---

### `app/renderer/components/TemplateEditor.jsx`

**Purpose:** Template builder/editor.
**Codex Tasks:**

* Use Monaco Editor for YAML syntax highlighting.
* Load templates from `/templates`.
* Allow adding/removing sections.
* Save to backend via `/template/save`.

---

## 🧾 Config + Docs

### `config/runtime.json`

**Purpose:** Define local model runtime.
**Codex Tasks:**

* Default to:

  ```json
  {
    "runtime": "ollama",
    "model": "gemma:2b",
    "endpoint": "http://localhost:11434"
  }
  ```
* Must be readable by `summarizer.py`.

---

### `docs/agents.md`

**Purpose:** Describe all project agents.
**Codex Tasks:**

* Keep synced with `codex.project.json`.
* Explain how `graph-agent` coordinates LangGraph nodes.

---

### `docs/build-instructions.md`

**Purpose:** Developer setup instructions.
**Codex Tasks:**

* Ensure consistency with actual dependency versions.
* Link to `step-by-step-setup.md`.

---

### `docs/step-by-step-setup.md`

**Purpose:** Hands-on guide.
**Codex Tasks:**

* Keep updated when backend endpoints or models change.

---

### `templates/discharge_summary.yaml`

**Purpose:** Default clinical summary schema.
**Codex Tasks:**

* Maintain YAML format:

  ```yaml
  template:
    name: "Discharge Summary"
    sections:
      - name: "Chief Complaint"
        ai_instruction: "Summarize presenting issue."
      - name: "Hospital Course"
        ai_instruction: "Summarize interventions and progress."
  ```

---

## 🧠 Codex Implementation Order

1. Generate backend structure (`app.py`, NER, template, summarizer, graph_flow).
2. Implement config and template loading.
3. Create frontend layout and chat integration.
4. Connect API calls (Electron → FastAPI).
5. Add LangGraph pipeline orchestration.
6. Test end-to-end flow using dummy input.

---

### ✅ Final Notes for Codex

* Always log function entry/exit for backend modules.
* Never include PHI or sensitive data in logs.
* Follow dependency isolation between Python and Node.
* Prioritize modular design so each agent can evolve independently.

