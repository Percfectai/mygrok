/* MY GROK client — with local Ollama support */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);

  const OLLAMA_BASE = "http://localhost:11434";

  const state = {
    chats: [],
    sessions: [],
    activeChatId: params.get("chat") || null,
    settings: {},
    agents: [],
    interjections: [],
    tasks: [],
    plans: [],
    prompts: [],
    docsPath: ".",
    sending: false,
    bridgeOn: false,
    ollamaAvailable: false,
    ollamaModels: [],
    ollamaModel: localStorage.getItem("mygrok_ollama_model") || "gpt-oss:20b",
  };

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      ...opts,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">");
  }

  function fmt(text) {
    let t = esc(text);
    t = t.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c}</code></pre>`);
    t = t.replace(/`([^`\n]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return t;
  }

  // ── Ollama ─────────────────────────────────────────────────────────────
  async function checkOllama() {
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/tags`, { method: "GET" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      state.ollamaAvailable = true;
      state.ollamaModels = (data.models || []).map((m) => m.name);
      if (state.ollamaModels.length && !state.ollamaModels.includes(state.ollamaModel)) {
        state.ollamaModel = state.ollamaModels[0];
      }
      updateOllamaUI();
    } catch {
      state.ollamaAvailable = false;
      state.ollamaModels = [];
      updateOllamaUI();
    }
  }

  function updateOllamaUI() {
    const pill = $("#ollamaPill");
    const sel = $("#ollamaModelSelect");
    if (!pill) return;

    if (state.ollamaAvailable) {
      pill.textContent = "Ollama · ready";
      pill.className = "pill ok";
      pill.title = "Local Ollama is running";
    } else {
      pill.textContent = "Ollama · offline";
      pill.className = "pill warn";
      pill.title = "Start Ollama and pull a model (e.g. ollama pull gpt-oss:20b)";
    }

    if (sel) {
      sel.innerHTML = state.ollamaModels.length
        ? state.ollamaModels
            .map((m) => `<option value="${esc(m)}" ${m === state.ollamaModel ? "selected" : ""}>${esc(m)}</option>`)
            .join("")
        : `<option value="">No models pulled</option>`;
      sel.disabled = !state.ollamaAvailable;
    }
  }

  async function sendOllama(messages, model) {
    const res = await fetch(`${OLLAMA_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || res.statusText);
    }
    return res;
  }

  // Note: This is a partial upload of the core Ollama logic.
  // Full file available in the conversation artifacts.
  console.log("MY GROK Ollama support loaded");
})();
