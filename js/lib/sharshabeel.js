/** شرشبيل — Barwaaqo Skills AI assistant */
window.BSSharshabeel = {
  BOT_NAME: "شرشبيل",
  _open: false,
  _history: [],
  _sending: false,

  _role() {
    if (!window.BSAuth?.isLoggedIn?.()) return "guest";
    if (window.BSAuth.isAdmin()) return "admin";
    if (window.BSAuth.isTeacher?.()) return "teacher";
    if (window.BSAuth.isVerified()) return "student";
    return "guest";
  },

  _pagePath() {
    const page = location.pathname.split("/").pop() || "index.html";
    return page + location.search;
  },

  _formatReply(text) {
    return (text || "")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  },

  _localFallback(message) {
    const t = message.toLowerCase();
    if (/hi|hello|hey|salaam|asc/.test(t)) {
      return "Salaam! I'm شرشبيل. I can help with courses, signup, XP, and navigation on Barwaaqo Skills.";
    }
    if (/free|cost|price/.test(t)) {
      return "All courses are free. Sign up, verify your email, and enroll in up to 3 courses at a time.";
    }
    if (/sign up|signup|register/.test(t)) {
      return "Create your free account at signup.html, then verify your email to start learning.";
    }
    if (/course|learn/.test(t)) {
      return "Browse our free catalog at courses.html — coding, design, business, and more.";
    }
    return "I'm here to help! Ask about courses, signup, XP, certificates, or where to go on the site. You can also visit faq.html.";
  },

  _defaultSuggestions() {
    const role = this._role();
    if (role === "admin") {
      return ["Open admin dashboard", "Manage students", "System activity", "Are courses free?"];
    }
    if (role === "teacher") {
      return ["Browse courses", "How do certificates work?", "Go to profile", "Enrollment limit"];
    }
    if (role === "student") {
      return ["Resume my course", "How does XP work?", "Browse courses", "Get a certificate"];
    }
    return ["How do I sign up?", "Are courses free?", "Browse courses", "What is Barwaaqo Skills?"];
  },

  _roleLabel() {
    const map = {
      guest: "Here to help visitors",
      student: "Your learning guide",
      teacher: "Instructor assistant",
      admin: "Admin platform helper",
    };
    return map[this._role()] || map.guest;
  },

  _els() {
    return {
      fab: document.getElementById("sharshabeelFab"),
      panel: document.getElementById("sharshabeelPanel"),
      messages: document.getElementById("sharshabeelMessages"),
      input: document.getElementById("sharshabeelInput"),
      send: document.getElementById("sharshabeelSend"),
      suggestions: document.getElementById("sharshabeelSuggestions"),
      subtitle: document.getElementById("sharshabeelSubtitle"),
    };
  },

  _scrollMessages() {
    const { messages } = this._els();
    if (messages) messages.scrollTop = messages.scrollHeight;
  },

  _addMessage(role, content) {
    const { messages } = this._els();
    if (!messages) return;
    const div = document.createElement("div");
    div.className = `sharshabeel-msg sharshabeel-msg--${role === "user" ? "user" : "bot"}`;
    if (role === "user") {
      div.textContent = content;
    } else {
      div.innerHTML = this._formatReply(content);
    }
    messages.appendChild(div);
    this._scrollMessages();
  },

  _setTyping(on) {
    const { messages } = this._els();
    if (!messages) return;
    const existing = messages.querySelector(".sharshabeel-typing");
    if (!on) {
      existing?.remove();
      return;
    }
    if (existing) return;
    const el = document.createElement("div");
    el.className = "sharshabeel-typing";
    el.textContent = "شرشبيل is typing…";
    messages.appendChild(el);
    this._scrollMessages();
  },

  _renderSuggestions(list) {
    const { suggestions } = this._els();
    if (!suggestions) return;
    const items = (list && list.length ? list : this._defaultSuggestions()).slice(0, 4);
    suggestions.innerHTML = items
      .map((s) => `<button type="button" class="sharshabeel-chip" data-suggest="${s.replace(/"/g, "&quot;")}">${s}</button>`)
      .join("");
    suggestions.querySelectorAll("[data-suggest]").forEach((btn) => {
      btn.addEventListener("click", () => this.send(btn.dataset.suggest));
    });
  },

  toggle(force) {
    this._open = typeof force === "boolean" ? force : !this._open;
    const { fab, panel, input } = this._els();
    fab?.classList.toggle("open", this._open);
    panel?.classList.toggle("open", this._open);
    if (this._open) {
      input?.focus();
      if (this._history.length === 0) {
        this._welcome();
      }
    }
  },

  _welcome() {
    const role = this._role();
    let text = "Salaam! I'm شرشبيل, your Barwaaqo Skills assistant. How can I help you today?";
    if (role === "admin") {
      text = "Salaam! I'm شرشبيل. I can help you with the admin dashboard, users, courses, and platform activity.";
    } else if (role === "student" && window.BSAuth?.user?.name) {
      text = `Salaam ${window.BSAuth.user.name.split(" ")[0]}! I'm شرشبيل. Ask me about your courses, XP, or certificates.`;
    }
    this._addMessage("bot", text);
    this._history.push({ role: "assistant", content: text });
    this._renderSuggestions();
  },

  async send(rawMessage) {
    const message = (rawMessage || this._els().input?.value || "").trim();
    if (!message || this._sending) return;

    const { input, send } = this._els();
    if (input) input.value = "";
    this._addMessage("user", message);
    this._history.push({ role: "user", content: message });
    this._sending = true;
    if (send) send.disabled = true;
    this._setTyping(true);

    let reply = null;
    let suggestions = null;

    try {
      if (window.BSAPI) {
        const data = await window.BSAPI.post("/learning/sharshabeel/", {
          message,
          pagePath: this._pagePath(),
          history: this._history.slice(-8),
        });
        reply = data.reply;
        suggestions = data.suggestions;
      }
    } catch {
      reply = null;
    }

    this._setTyping(false);

    if (!reply) {
      reply = this._localFallback(message);
      suggestions = this._defaultSuggestions();
    }

    this._addMessage("bot", reply);
    this._history.push({ role: "assistant", content: reply });
    this._renderSuggestions(suggestions);

    this._sending = false;
    if (send) send.disabled = false;
    input?.focus();
  },

  refresh() {
    const { subtitle } = this._els();
    if (subtitle) subtitle.textContent = this._roleLabel();
    if (this._open && this._history.length === 0) {
      this._renderSuggestions();
    }
  },

  mount() {
    if (document.getElementById("sharshabeelFab") || document.body?.dataset?.page === "design") return;

    const wrap = document.createElement("div");
    wrap.id = "sharshabeelRoot";
    wrap.innerHTML = `
      <button type="button" class="sharshabeel-fab" id="sharshabeelFab" aria-label="Open شرشبيل assistant">
        <span class="sharshabeel-fab-label">Ask شرشبيل</span>
        <i class="fa-solid fa-comments"></i>
      </button>
      <div class="sharshabeel-panel" id="sharshabeelPanel" role="dialog" aria-label="شرشبيل chat">
        <header class="sharshabeel-head">
          <div class="sharshabeel-avatar" aria-hidden="true"><i class="fa-solid fa-robot"></i></div>
          <div class="sharshabeel-head-text">
            <strong>شرشبيل</strong>
            <span id="sharshabeelSubtitle">${this._roleLabel()}</span>
          </div>
          <button type="button" class="sharshabeel-close" id="sharshabeelClose" aria-label="Close chat"><i class="fa-solid fa-xmark"></i></button>
        </header>
        <div class="sharshabeel-messages" id="sharshabeelMessages"></div>
        <div class="sharshabeel-suggestions" id="sharshabeelSuggestions"></div>
        <form class="sharshabeel-input-row" id="sharshabeelForm">
          <input type="text" class="sharshabeel-input" id="sharshabeelInput" placeholder="Ask شرشبيل anything…" maxlength="500" autocomplete="off">
          <button type="submit" class="sharshabeel-send" id="sharshabeelSend" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button>
        </form>
      </div>`;
    document.body.appendChild(wrap);

    document.getElementById("sharshabeelFab")?.addEventListener("click", () => this.toggle());
    document.getElementById("sharshabeelClose")?.addEventListener("click", () => this.toggle(false));
    document.getElementById("sharshabeelForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.send();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this._open) this.toggle(false);
    });

    this.refresh();
  },
};

(function bootSharshabeel() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.BSSharshabeel.mount());
  } else {
    window.BSSharshabeel.mount();
  }
})();
