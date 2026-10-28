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
          <button class="ai-chip" onclick="window.guruAI.sendQuickPrompt('Give me a fast Vedic mental math trick for squaring numbers!')">⚡ Vedic Math Trick</button>
          <button class="ai-chip" onclick="window.guruAI.sendQuickPrompt('Explain Collective Nouns with fun examples for Class 3')">📚 Grammar Nouns</button>
          <button class="ai-chip" onclick="window.guruAI.sendQuickPrompt('How do I spot number patterns in Olympiad questions?')">🏆 Olympiad Strategy</button>
          <button class="ai-chip" onclick="window.guruAI.sendQuickPrompt('Explain fractions like I am 8 years old')">🧒 Explain Simply</button>
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
          />
          <button class="btn btn-primary guru-ai-send-btn" onclick="window.guruAI.handleSend()">
            Send 🚀
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(container);
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

    // Format basic bold and linebreaks
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');

    let followUpHtml = '';
    if (followUps && followUps.length > 0) {
      followUpHtml = `
        <div class="ai-followups" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;">
          ${followUps.map(fu => `<button class="ai-subchip" onclick="window.guruAI.sendQuickPrompt('${fu}')">${fu}</button>`).join('')}
        </div>
      `;
    }

    const speakerBtn = sender === 'ai' ? `
      <button class="ai-speak-btn" onclick="window.guruAI.speakText('${text.replace(/'/g, "\\'").replace(/\n/g, ' ')}')">🔊 Read</button>
    ` : '';

    msgEl.innerHTML = `
      <div class="ai-msg-content">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-weight:700;font-size:12px;color:${sender === 'ai' ? '#f2a51e' : '#8B5CF6'};">
            ${sender === 'ai' ? '🎓 Guru AI' : '👤 You'}
          </span>
          ${speakerBtn}
        </div>
        <div style="font-size:13.5px;line-height:1.5;">${formattedText}</div>
        ${followUpHtml}
      </div>
    `;

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
