/**
 * Universal Assessment Anti-Cheating & Proctoring Engine
 * Monitors tab switches, fullscreen status, speed anomalies, and restricts clipboard tampering.
 */
class AntiCheatingEngine {
  constructor() {
    this.isActive = false;
    this.tabSwitches = 0;
    this.fullscreenExits = 0;
    this.startTime = null;
    this.questionStartTimes = {};
    this.questionDurations = {};
    this.currentQuestionId = null;
    this.warningBanner = null;

    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.onWindowBlur = this.onWindowBlur.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
    this.preventCopyPaste = this.preventCopyPaste.bind(this);
  }

  startProctoring(examContainerId = 'quiz-active-card') {
    this.isActive = true;
    this.tabSwitches = 0;
    this.fullscreenExits = 0;
    this.startTime = Date.now();
    this.questionStartTimes = {};
    this.questionDurations = {};
    this.currentQuestionId = null;

    // Attach listeners
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    window.addEventListener('blur', this.onWindowBlur);
    document.addEventListener('fullscreenchange', this.onFullscreenChange);

    // Context menu and clipboard protection on active container
    const container = document.getElementById(examContainerId) || document.body;
    container.addEventListener('contextmenu', this.preventCopyPaste);
    container.addEventListener('copy', this.preventCopyPaste);
    container.addEventListener('cut', this.preventCopyPaste);

    this.createWarningBanner();
  }

  stopProctoring(examContainerId = 'quiz-active-card') {
    this.isActive = false;
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    window.removeEventListener('blur', this.onWindowBlur);
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);

    const container = document.getElementById(examContainerId) || document.body;
    container.removeEventListener('contextmenu', this.preventCopyPaste);
    container.removeEventListener('copy', this.preventCopyPaste);
    container.removeEventListener('cut', this.preventCopyPaste);

    this.removeWarningBanner();
  }

  preventCopyPaste(e) {
    if (!this.isActive) return;
    e.preventDefault();
    this.showProctorNotice('Clipboard and right-click access are disabled during active assessments to preserve test integrity.');
  }

  onVisibilityChange() {
    if (!this.isActive) return;
    if (document.hidden) {
      this.tabSwitches++;
      this.showProctorWarning(`⚠️ Proctoring Alert: Tab switch detected! (Notice #${this.tabSwitches}). Maintain test focus.`);
    }
  }

  onWindowBlur() {
    if (!this.isActive) return;
    // Debounced blur detection
    if (!document.hidden && this.tabSwitches === 0) {
      this.showProctorNotice('Please keep this assessment window focused.');
    }
  }

  onFullscreenChange() {
    if (!this.isActive) return;
    if (!document.fullscreenElement) {
      this.fullscreenExits++;
      this.showProctorNotice('Exited Fullscreen mode. Please click Fullscreen to restore exam focus.');
    }
  }

  markQuestionStart(questionId) {
    if (this.currentQuestionId && this.questionStartTimes[this.currentQuestionId]) {
      const elapsed = (Date.now() - this.questionStartTimes[this.currentQuestionId]) / 1000;
      this.questionDurations[this.currentQuestionId] = elapsed;
    }
    this.currentQuestionId = questionId;
    this.questionStartTimes[questionId] = Date.now();
  }

  markQuestionEnd(questionId) {
    if (this.questionStartTimes[questionId]) {
      const elapsed = (Date.now() - this.questionStartTimes[questionId]) / 1000;
      this.questionDurations[questionId] = elapsed;
    }
  }

  createWarningBanner() {
    if (this.warningBanner) return;
    this.warningBanner = document.createElement('div');
    this.warningBanner.id = 'proctor-warning-banner';
    this.warningBanner.className = 'proctor-banner';
    this.warningBanner.style.display = 'none';
    document.body.appendChild(this.warningBanner);
  }

  removeWarningBanner() {
    if (this.warningBanner && this.warningBanner.parentNode) {
      this.warningBanner.parentNode.removeChild(this.warningBanner);
    }
    this.warningBanner = null;
  }

  showProctorWarning(text) {
    if (!this.warningBanner) this.createWarningBanner();
    this.warningBanner.className = 'proctor-banner proctor-alert-anim';
    this.warningBanner.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;">
        <span><strong>🛡️ Assessment Proctoring:</strong> ${text}</span>
        <button onclick="document.getElementById('proctor-warning-banner').style.display='none'" class="btn btn-sm btn-ghost" style="color:white;padding:2px 8px;">Dismiss</button>
      </div>
    `;
    this.warningBanner.style.display = 'flex';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (this.warningBanner) {
        this.warningBanner.style.display = 'none';
      }
    }, 5000);
  }

  showProctorNotice(text) {
    if (!this.warningBanner) this.createWarningBanner();
    this.warningBanner.className = 'proctor-banner proctor-notice-anim';
    this.warningBanner.innerHTML = `<span><strong>ℹ️ Notice:</strong> ${text}</span>`;
    this.warningBanner.style.display = 'flex';
    setTimeout(() => {
      if (this.warningBanner) {
        this.warningBanner.style.display = 'none';
      }
    }, 4000);
  }

  async toggleFullscreen(elementId = 'view-student-zone') {
    const el = document.getElementById(elementId) || document.documentElement;
    if (!document.fullscreenElement) {
      try {
        await el.requestFullscreen();
      } catch (err) {
        console.warn('Fullscreen request denied:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  }

  getTelemetry() {
    if (this.currentQuestionId && this.questionStartTimes[this.currentQuestionId]) {
      this.markQuestionEnd(this.currentQuestionId);
    }

    return {
      tab_switches: this.tabSwitches,
      fullscreen_exits: this.fullscreenExits,
      time_per_question: this.questionDurations,
      total_time_seconds: this.startTime ? Math.round((Date.now() - this.startTime) / 1000) : 0
    };
  }
}

window.antiCheating = new AntiCheatingEngine();
