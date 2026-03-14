(function () {
  'use strict';

  // ── CONFIG ── Update BACKEND_URL after deploying to Vercel ────────────────
  const BACKEND_URL = 'https://levlin-tech-backend.vercel.app';
  const WEBHOOK_URL = BACKEND_URL + '/api/chat';
  const STORAGE_KEY = 'levlin_chat_history';
  const GREETING = 'Hi! How can I help you today?';

  // ── Styles ─────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

    #lvl-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      box-shadow: 0 4px 24px rgba(5, 150, 105, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483646;
      border: none;
      outline: none;
      opacity: 0;
      transform: scale(0.5);
      transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
    }
    #lvl-launcher.lvl-visible {
      opacity: 1;
      transform: scale(1);
    }
    #lvl-launcher:hover {
      box-shadow: 0 6px 32px rgba(5, 150, 105, 0.7), 0 0 0 1px rgba(16, 185, 129, 0.4);
      transform: scale(1.07);
    }
    #lvl-launcher.lvl-visible:hover {
      transform: scale(1.07);
    }
    #lvl-launcher svg {
      width: 26px;
      height: 26px;
      fill: #fff;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    #lvl-launcher .lvl-icon-close { display: none; }
    #lvl-launcher.lvl-open .lvl-icon-chat { display: none; }
    #lvl-launcher.lvl-open .lvl-icon-close { display: block; }

    #lvl-launcher::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.4);
      animation: lvl-pulse 2.4s ease-out infinite;
    }
    #lvl-launcher.lvl-open::before { animation: none; opacity: 0; }
    @keyframes lvl-pulse {
      0%   { transform: scale(1);   opacity: 0.8; }
      70%  { transform: scale(1.7); opacity: 0; }
      100% { transform: scale(1.7); opacity: 0; }
    }

    #lvl-badge {
      position: absolute;
      top: -3px; right: -3px;
      width: 18px; height: 18px;
      border-radius: 50%;
      background: #ef4444;
      color: #fff;
      font-size: 10px; font-weight: 700;
      font-family: 'Space Grotesk', system-ui, sans-serif;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #000;
      opacity: 0; transform: scale(0);
      transition: opacity 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
      pointer-events: none;
    }
    #lvl-badge.lvl-show { opacity: 1; transform: scale(1); }

    #lvl-window {
      position: fixed;
      bottom: 96px; right: 24px;
      width: 368px;
      max-width: calc(100vw - 32px);
      height: 540px;
      max-height: calc(100vh - 120px);
      background: rgba(10, 10, 10, 0.92);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(16, 185, 129, 0.18);
      border-radius: 20px;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.04) inset,
        0 24px 64px rgba(0,0,0,0.6),
        0 4px 16px rgba(0,0,0,0.4),
        0 0 40px rgba(5,150,105,0.08);
      display: flex; flex-direction: column;
      overflow: hidden;
      z-index: 2147483645;
      opacity: 0;
      transform: translateY(16px) scale(0.97);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
      font-family: 'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #lvl-window.lvl-open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    #lvl-header {
      background: linear-gradient(135deg, rgba(5,150,105,0.3) 0%, rgba(13,148,136,0.2) 100%);
      border-bottom: 1px solid rgba(16, 185, 129, 0.15);
      padding: 16px 20px;
      display: flex; align-items: center; gap: 12px;
      flex-shrink: 0; position: relative; overflow: hidden;
    }
    #lvl-avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #059669, #10b981);
      box-shadow: 0 0 16px rgba(16,185,129,0.4);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #lvl-avatar svg { width: 22px; height: 22px; fill: #fff; }
    #lvl-header-text { flex: 1; }
    #lvl-header-name { color: #fff; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
    #lvl-header-status {
      color: rgba(255,255,255,0.55); font-size: 12px; margin-top: 3px;
      display: flex; align-items: center; gap: 5px; font-weight: 400;
    }
    #lvl-status-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #34d399; flex-shrink: 0; box-shadow: 0 0 6px #34d399;
    }

    #lvl-messages {
      flex: 1; overflow-y: auto;
      padding: 20px 16px;
      display: flex; flex-direction: column; gap: 10px;
      scroll-behavior: smooth;
    }
    #lvl-messages::-webkit-scrollbar { width: 3px; }
    #lvl-messages::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.25); border-radius: 2px; }

    .lvl-msg {
      max-width: 82%; display: flex; flex-direction: column; gap: 4px;
      animation: lvl-fadein 0.25s ease;
    }
    @keyframes lvl-fadein {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .lvl-msg.lvl-bot  { align-self: flex-start; }
    .lvl-msg.lvl-user { align-self: flex-end; }

    .lvl-bubble {
      padding: 10px 14px; border-radius: 16px;
      font-size: 14px; line-height: 1.55; word-break: break-word;
    }
    .lvl-bot .lvl-bubble {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      color: #e2e8f0;
      border-bottom-left-radius: 4px;
    }
    .lvl-user .lvl-bubble {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: #fff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 2px 12px rgba(5,150,105,0.35);
    }
    .lvl-time { font-size: 10px; color: rgba(255,255,255,0.3); padding: 0 4px; }
    .lvl-bot  .lvl-time { align-self: flex-start; }
    .lvl-user .lvl-time { align-self: flex-end; }

    #lvl-typing {
      align-self: flex-start; display: none;
      align-items: center; gap: 5px;
      padding: 10px 14px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; border-bottom-left-radius: 4px;
    }
    #lvl-typing.lvl-show { display: flex; }
    #lvl-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: rgba(16,185,129,0.7);
      animation: lvl-bounce 1.2s ease-in-out infinite;
    }
    #lvl-typing span:nth-child(2) { animation-delay: 0.15s; }
    #lvl-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes lvl-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30%            { transform: translateY(-6px); }
    }

    #lvl-footer {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.06);
      background: rgba(0,0,0,0.3);
      display: flex; align-items: flex-end; gap: 10px; flex-shrink: 0;
    }
    #lvl-input {
      flex: 1;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 10px 14px;
      font-size: 14px; font-family: inherit;
      line-height: 1.4; resize: none; outline: none;
      color: #e2e8f0; background: rgba(255,255,255,0.05);
      max-height: 120px; overflow-y: auto;
      transition: border-color 0.2s, background 0.2s;
    }
    #lvl-input::placeholder { color: rgba(255,255,255,0.3); }
    #lvl-input:focus {
      border-color: rgba(16,185,129,0.5);
      background: rgba(255,255,255,0.07);
      box-shadow: 0 0 0 3px rgba(16,185,129,0.08);
    }
    #lvl-send {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 12px rgba(5,150,105,0.4);
      transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    #lvl-send:hover { opacity: 0.9; transform: scale(1.06); }
    #lvl-send:active { transform: scale(0.96); }
    #lvl-send:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
    #lvl-send svg { width: 18px; height: 18px; fill: #fff; }

    #lvl-powered {
      text-align: center; font-size: 10px;
      color: rgba(255,255,255,0.2);
      padding: 6px 16px 10px;
      font-family: 'Space Grotesk', system-ui, sans-serif;
    }
    #lvl-powered a { color: rgba(16,185,129,0.7); text-decoration: none; }
    #lvl-powered a:hover { color: #10b981; }

    #lvl-close-btn {
      display: none;
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
      cursor: pointer; align-items: center; justify-content: center;
      flex-shrink: 0; color: rgba(255,255,255,0.7);
      transition: background 0.2s;
    }
    #lvl-close-btn:hover { background: rgba(255,255,255,0.14); }
    #lvl-close-btn svg { width: 18px; height: 18px; fill: rgba(255,255,255,0.8); }

    @media (max-width: 480px) {
      #lvl-window {
        bottom: 0; right: 0; left: 0;
        width: 100%; max-width: 100%;
        height: 100dvh; max-height: 100dvh;
        border-radius: 0;
        border: none;
      }
      #lvl-launcher { bottom: 20px; right: 20px; }
      #lvl-header { padding: 14px 16px; }
      #lvl-close-btn { display: flex !important; }
      #lvl-messages { padding: 16px 12px; }
      #lvl-input { font-size: 16px !important; padding: 12px 14px; }
      #lvl-send { width: 46px; height: 46px; }
      #lvl-footer {
        padding: 10px 12px;
        padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
      }
      .lvl-bubble { font-size: 15px; padding: 11px 15px; }
    }
  `;

  const chatIcon = `<svg class="lvl-icon-chat" viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"/><path d="M7 9H17V11H7V9ZM7 12H14V14H7V12ZM7 6H17V8H7V6Z" opacity="0.6"/></svg>`;
  const closeIcon = `<svg class="lvl-icon-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
  const botIcon   = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`;
  const sendIcon  = `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;

  let isOpen = false, isWaiting = false, unreadCount = 0, messages = [];

  const loadHistory = () => { try { const r = sessionStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch(_) { return []; } };
  const saveHistory = (m) => { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(m)); } catch(_) {} };
  const formatTime  = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const esc         = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  function injectStyles() {
    const s = document.createElement('style');
    s.id = 'lvl-styles'; s.textContent = css;
    document.head.appendChild(s);
  }

  function buildLauncher() {
    const btn = document.createElement('button');
    btn.id = 'lvl-launcher'; btn.setAttribute('aria-label', 'Open chat');
    btn.innerHTML = chatIcon + closeIcon;
    const badge = document.createElement('div');
    badge.id = 'lvl-badge'; badge.textContent = '1';
    btn.appendChild(badge);
    btn.addEventListener('click', toggleChat);
    document.body.appendChild(btn);
    setTimeout(() => {
      btn.classList.add('lvl-visible');
      setTimeout(() => { if (!isOpen) showBadge(); }, 800);
    }, 2000);
  }

  function buildWindow() {
    const win = document.createElement('div');
    win.id = 'lvl-window'; win.setAttribute('role', 'dialog');
    win.innerHTML = `
      <div id="lvl-header">
        <div id="lvl-avatar">${botIcon}</div>
        <div id="lvl-header-text">
          <div id="lvl-header-name">Levlin AI Assistant</div>
          <div id="lvl-header-status"><div id="lvl-status-dot"></div>Online · replies instantly</div>
        </div>
        <button id="lvl-close-btn" aria-label="Close chat">${closeIcon}</button>
      </div>
      <div id="lvl-messages" aria-live="polite">
        <div id="lvl-typing"><span></span><span></span><span></span></div>
      </div>
      <div id="lvl-footer">
        <textarea id="lvl-input" rows="1" placeholder="Type a message…" aria-label="Message input"></textarea>
        <button id="lvl-send" aria-label="Send">${sendIcon}</button>
      </div>
      <div id="lvl-powered">Powered by <a href="#" tabindex="-1">Levlin AI</a></div>
    `;
    document.body.appendChild(win);
  }

  function appendMessage(role, text, ts) {
    const el = document.createElement('div');
    el.className = `lvl-msg lvl-${role}`;
    el.innerHTML = `<div class="lvl-bubble">${esc(text).replace(/\n/g,'<br>')}</div><div class="lvl-time">${formatTime(ts||Date.now())}</div>`;
    document.getElementById('lvl-messages').insertBefore(el, document.getElementById('lvl-typing'));
    scrollBottom();
  }

  const scrollBottom = () => { const m = document.getElementById('lvl-messages'); if(m) m.scrollTop = m.scrollHeight; };
  const showTyping   = () => { document.getElementById('lvl-typing')?.classList.add('lvl-show'); scrollBottom(); };
  const hideTyping   = () => { document.getElementById('lvl-typing')?.classList.remove('lvl-show'); };
  const showBadge    = () => { unreadCount=1; const b=document.getElementById('lvl-badge'); if(b){b.textContent=1;b.classList.add('lvl-show');} };
  const clearBadge   = () => { unreadCount=0; document.getElementById('lvl-badge')?.classList.remove('lvl-show'); };

  function addMessage(role, text) {
    const entry = { role, text, ts: Date.now() };
    messages.push(entry); saveHistory(messages);
    appendMessage(role, text, entry.ts);
  }

  async function sendMessage(text) {
    if (!text.trim() || isWaiting) return;
    addMessage('user', text);
    const input = document.getElementById('lvl-input');
    const sendBtn = document.getElementById('lvl-send');
    if (input) { input.value = ''; input.style.height = 'auto'; }
    if (sendBtn) sendBtn.disabled = true;
    isWaiting = true; showTyping();
    try {
      // Build history: all prior messages except the one just added (last item)
      const history = messages.slice(0, -1).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text
      }));
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.response || data.reply || data.message || data.text || "I received your message. Let me get back to you shortly.";
      hideTyping(); addMessage('bot', reply.trim());
    } catch(_) {
      hideTyping(); addMessage('bot', "Sorry, I couldn't connect right now. Please try again in a moment.");
    } finally {
      isWaiting = false; if (sendBtn) sendBtn.disabled = false;
    }
  }

  const toggleChat = () => isOpen ? closeChat() : openChat();

  const isMobile = () => window.innerWidth <= 480;

  function applyViewport() {
    if (!isMobile()) return;
    const win = document.getElementById('lvl-window');
    if (!win) return;
    const vp = window.visualViewport;
    const h = vp ? vp.height : window.innerHeight;
    win.style.height = h + 'px';
    win.style.top = '0px';
    win.style.bottom = 'auto';
    scrollBottom();
  }

  function resetViewport() {
    const win = document.getElementById('lvl-window');
    if (!win) return;
    win.style.height = '';
    win.style.top = '';
    win.style.bottom = '';
  }

  function openChat() {
    isOpen = true; clearBadge();
    document.getElementById('lvl-window').classList.add('lvl-open');
    const launcher = document.getElementById('lvl-launcher');
    launcher.classList.add('lvl-open');
    launcher.setAttribute('aria-label', 'Close chat');
    if (isMobile()) {
      launcher.style.display = 'none';
      document.body.style.overflow = 'hidden';
      applyViewport();
      if (window.visualViewport) window.visualViewport.addEventListener('resize', applyViewport);
    }
    setTimeout(() => { document.getElementById('lvl-input')?.focus(); scrollBottom(); }, 50);
  }

  function closeChat() {
    isOpen = false;
    document.getElementById('lvl-window').classList.remove('lvl-open');
    const launcher = document.getElementById('lvl-launcher');
    launcher.classList.remove('lvl-open');
    launcher.setAttribute('aria-label', 'Open chat');
    launcher.style.display = '';
    document.body.style.overflow = '';
    resetViewport();
    if (window.visualViewport) window.visualViewport.removeEventListener('resize', applyViewport);
  }

  function bindInput() {
    const input = document.getElementById('lvl-input');
    const sendBtn = document.getElementById('lvl-send');
    const closeBtn = document.getElementById('lvl-close-btn');
    input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); } });
    sendBtn.addEventListener('click', () => sendMessage(input.value));
    if (closeBtn) closeBtn.addEventListener('click', closeChat);
  }

  function init() {
    if (document.getElementById('lvl-launcher')) return;
    injectStyles(); buildLauncher(); buildWindow(); bindInput();
    document.addEventListener('click', (e) => { if (!isOpen) return; const w=document.getElementById('lvl-window'),l=document.getElementById('lvl-launcher'); if(w&&!w.contains(e.target)&&l&&!l.contains(e.target)) closeChat(); }, true);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) closeChat(); });
    messages = loadHistory();
    if (messages.length === 0) { messages.push({ role:'bot', text:GREETING, ts:Date.now() }); saveHistory(messages); }
    messages.forEach(m => appendMessage(m.role, m.text, m.ts));
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
