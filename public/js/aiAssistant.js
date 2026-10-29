/**
 * Guru AI - Friendly and Interactive AI Learning Assistant Client
 * Provides Socratic tutoring, concept breakdowns, Vedic shortcuts, and voice readout.
 */
class AIAssistant {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.currentVoiceRate = 1.0;
    this.isSpeaking = false;
  }

  /**
   * Safely encode a string for insertion into HTML text nodes.
   * Prevents XSS by escaping all HTML-special characters.
   */
  static escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  init() {
    this.renderWidget();
    // Greet learner on initialization
    this.addMessage(
      'ai',
      'Namaste! 🌟 I am **Guru AI**, your friendly learning assistant. Ask me anything about Mathematics, English Grammar, Olympiad tricks, or Vedic mental shortcuts!'
    );
  }

  renderWidget() {
    if (document.getElementById('guru-ai-container')) return;

    const container = document.createElement('div');
    container.id = 'guru-ai-container';
    container.className = 'guru-ai-container';

    container.innerHTML = `
      <!-- Floating Trigger Button -->
      <button id="guru-ai-trigger" class="guru-ai-bubble" onclick="window.guruAI.toggleChat()" title="Ask Guru AI">
        <span class="guru-ai-icon">🎓</span>
        <span class="guru-ai-label">Ask Guru AI</span>
      </button>

      <!-- Chat Drawer Window -->
      <div id="guru-ai-window" class="guru-ai-window" style="display:none;">
        <div class="guru-ai-header">
          <div class="guru-ai-title-wrap">
            <span class="guru-ai-avatar">🎓</span>
            <div>
              <h4 style="margin:0;font-size:15px;color:white;font-weight:700;">Guru AI Learning Companion</h4>
              <span class="guru-ai-status"><span class="status-dot"></span> Socratic Pedagogical Tutor</span>
            </div>
          </div>
          <div class="guru-ai-header-actions">
            <button class="guru-ai-btn-icon" onclick="window.guruAI.clearChat()" title="Clear Chat">🔄</button>
            <button class="guru-ai-btn-icon" onclick="window.guruAI.toggleChat()" title="Close">✖</button>
          </div>
        </div>

        <!-- Quick Prompt Chips -->
        <div class="guru-ai-chips">
          <button class="ai-chip" data-prompt="Give me a fast Vedic mental math trick for squaring numbers!">⚡ Vedic Math Trick</button>
          <button class="ai-chip" data-prompt="Explain Collective Nouns with fun examples for Class 3">📚 Grammar Nouns</button>
          <button class="ai-chip" data-prompt="How do I spot number patterns in Olympiad questions?">🏆 Olympiad Strategy</button>
          <button class="ai-chip" data-prompt="Explain fractions like I am 8 years old">🧒 Explain Simply</button>
        </div>

        <!-- Messages Scroll Body -->
        <div id="guru-ai-messages" class="guru-ai-messages"></div>

        <!-- Input Box -->
        <div class="guru-ai-footer">
          <input
            type="text"
            id="guru-ai-input"
            class="guru-ai-input"
            placeholder="Ask about a formula, rule, or concept..."
            onkeydown="if(event.key === 'Enter') window.guruAI.handleSend()"
            maxlength="2000"
          />
          <button class="btn btn-primary guru-ai-send-btn" onclick="window.guruAI.handleSend()">
            Send 🚀
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Attach chip click handlers using addEventListener (no inline onclick with data injection)
    container.querySelectorAll('.ai-chip[data-prompt]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.guruAI.sendQuickPrompt(btn.dataset.prompt);
      });
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const win = document.getElementById('guru-ai-window');
    const trigger = document.getElementById('guru-ai-trigger');
    if (win) {
      win.style.display = this.isOpen ? 'flex' : 'none';
      if (this.isOpen) {
        document.getElementById('guru-ai-input')?.focus();
        this.scrollToBottom();
      }
    }
  }

  addMessage(sender, text, followUps = []) {
    this.messages.push({ sender, text, followUps });
    const msgContainer = document.getElementById('guru-ai-messages');
    if (!msgContainer) return;

    const msgEl = document.createElement('div');
    msgEl.className = `ai-msg ai-msg-${sender}`;

    // For AI messages: allow safe markdown-like formatting (bold/italic/newlines)
    // For user messages: always escape HTML to prevent XSS
    let formattedText;
    if (sender === 'ai') {
      formattedText = AIAssistant.escapeHtml(text)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
    } else {
      // User-generated content — always fully escape, never interpret as HTML
      formattedText = AIAssistant.escapeHtml(text).replace(/\n/g, '<br/>');
    }

    // Build the message content div
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-msg-content';

    // Header row (sender label + speak button for AI)
    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;';

    const senderLabel = document.createElement('span');
    senderLabel.style.cssText = `font-weight:700;font-size:12px;color:${sender === 'ai' ? '#f2a51e' : '#8B5CF6'};`;
    senderLabel.textContent = sender === 'ai' ? '🎓 Guru AI' : '👤 You';
    headerRow.appendChild(senderLabel);

    if (sender === 'ai') {
      // Use data attribute + addEventListener to avoid inline eval XSS
      const speakBtn = document.createElement('button');
      speakBtn.className = 'ai-speak-btn';
      speakBtn.textContent = '🔊 Read';
      speakBtn.dataset.speechText = text;
      speakBtn.addEventListener('click', () => {
        window.guruAI.speakText(speakBtn.dataset.speechText);
      });
      headerRow.appendChild(speakBtn);
    }

    contentDiv.appendChild(headerRow);

    // Message body
    const bodyDiv = document.createElement('div');
    bodyDiv.style.cssText = 'font-size:13.5px;line-height:1.5;';
    bodyDiv.innerHTML = formattedText; // formattedText is already escaped above
    contentDiv.appendChild(bodyDiv);

    // Follow-up prompt chips — rendered via DOM APIs, not innerHTML interpolation
    if (followUps && followUps.length > 0) {
      const followUpContainer = document.createElement('div');
      followUpContainer.className = 'ai-followups';
      followUpContainer.style.cssText = 'margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;';

      followUps.forEach(fu => {
        const chip = document.createElement('button');
        chip.className = 'ai-subchip';
        chip.textContent = fu; // textContent — never innerHTML — safe against XSS
        chip.addEventListener('click', () => {
          window.guruAI.sendQuickPrompt(fu);
        });
        followUpContainer.appendChild(chip);
      });

      contentDiv.appendChild(followUpContainer);
    }

    msgEl.appendChild(contentDiv);
    msgContainer.appendChild(msgEl);
    this.scrollToBottom();
  }

  scrollToBottom() {
    const msgContainer = document.getElementById('guru-ai-messages');
    if (msgContainer) {
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
  }

  clearChat() {
    this.messages = [];
    const msgContainer = document.getElementById('guru-ai-messages');
    if (msgContainer) msgContainer.innerHTML = '';
    this.addMessage('ai', 'Chat history refreshed! How can I assist your study session now?');
  }

  sendQuickPrompt(promptText) {
    const input = document.getElementById('guru-ai-input');
    if (input) {
      input.value = promptText;
      this.handleSend();
    }
  }

  async handleSend() {
    const input = document.getElementById('guru-ai-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    // Enforce client-side length limit (mirrors server-side 2000 char limit)
    if (text.length > 2000) {
      this.addMessage('ai', 'Your message is too long. Please keep it under 2000 characters.');
      return;
    }

    input.value = '';
    this.addMessage('user', text);

    // Show typing indicator
    const typingId = 'guru-typing-' + Date.now();
    const msgContainer = document.getElementById('guru-ai-messages');
    if (msgContainer) {
      const typingEl = document.createElement('div');
      typingEl.id = typingId;
      typingEl.className = 'ai-msg ai-msg-ai typing-pulse';
      typingEl.innerHTML = '<span style="font-size:12px;color:#a0aec0;">🎓 Guru AI is formulating pedagogical guidance...</span>';
      msgContainer.appendChild(typingEl);
      this.scrollToBottom();
    }

    try {
      const userGrade = window.app && window.app.user ? window.app.user.grade : 3;
      const res = await window.api.askGuruAI(text, { grade: userGrade });
      
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      this.addMessage('ai', res.reply, res.follow_ups || []);
    } catch (err) {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      this.addMessage('ai', 'I am here with you! Please check your network connection and try again.');
    }
  }

  speakText(text) {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech narration is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown stars from spoken speech
    const cleanSpeech = text.replace(/[*#_~`$]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = this.currentVoiceRate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN'; // Indian English voice preferred for CBSE curriculum

    window.speechSynthesis.speak(utterance);
  }
}

window.guruAI = new AIAssistant();
document.addEventListener('DOMContentLoaded', () => {
  window.guruAI.init();
});
