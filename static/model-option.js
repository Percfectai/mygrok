// Minimal model option — add this to your existing app.js
// It detects Ollama, populates the dropdown, and routes chat accordingly.

(() => {
  const OLLAMA = "http://localhost:11434";
  const sel = document.getElementById("modelSelect");
  if (!sel) return;

  async function refreshModels() {
    // Keep the cloud options
    const cloud = `
      <optgroup label="Grok (cloud)">
        <option value="grok-4.20-0309-non-reasoning">Grok 4.20 (lighter)</option>
        <option value="grok-4.7">Grok 4.7</option>
        <option value="grok-build">Grok Build</option>
      </optgroup>`;

    let local = `<optgroup label="Local (Ollama)">`;
    try {
      const r = await fetch(`${OLLAMA}/api/tags`);
      if (r.ok) {
        const data = await r.json();
        const models = (data.models || []).map(m => m.name);
        if (models.length) {
          models.forEach(m => {
            local += `<option value="ollama:${m}">${m} (local)</option>`;
          });
        } else {
          local += `<option value="" disabled>No models pulled</option>`;
        }
      } else {
        local += `<option value="" disabled>Ollama offline</option>`;
      }
    } catch {
      local += `<option value="" disabled>Ollama offline</option>`;
    }
    local += `</optgroup>`;
    sel.innerHTML = local + cloud;

    // Restore last choice
    const last = localStorage.getItem("mygrok_model");
    if (last && sel.querySelector(`option[value="${last}"]`)) sel.value = last;
  }

  sel.addEventListener("change", () => {
    localStorage.setItem("mygrok_model", sel.value);
  });

  document.getElementById("btnRefreshModels")?.addEventListener("click", refreshModels);
  refreshModels();
  setInterval(refreshModels, 20000);

  // Expose for your sendMessage() to read
  window.MyGrokModel = {
    current() {
      return sel.value || "grok-4.20-0309-non-reasoning";
    },
    isOllama() {
      return this.current().startsWith("ollama:");
    },
    modelName() {
      const v = this.current();
      return v.startsWith("ollama:") ? v.slice(7) : v;
    }
  };
})();
