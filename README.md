# MY GROK

Open-source AI cockpit with local Ollama support so you can avoid burning Grok 4.7 usage.

## Added files

- `static/model-select-snippet.html` — model dropdown (paste into your toolbar)
- `static/model-option.js` — auto-detects local Ollama models + cloud options
- `index-ollama.html` — full page with Ollama status pill + local chat button
- `static/app-ollama.js` — client that streams from local Ollama

## Quick start (free local)

```bash
ollama pull gpt-oss:20b
# or qwen3.6 / qwen3.8:27b

# if the browser blocks the request:
OLLAMA_ORIGINS="*" ollama serve
```

Open the app, pick a local model from the dropdown, and chat. It will not touch your Grok account.
