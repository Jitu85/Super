/**
   TalentHunt Application Controller
   Designed and Developed by Abhijit Kumar Misra.
   ========================================================================== */

// Available Kid-Friendly Avatars
const AVATARS = [
  { id: 'lion', emoji: '🦁', name: 'Leo the Lion' },
  { id: 'astronaut', emoji: '🚀', name: 'Cosmo Astronaut' },
  { id: 'robot', emoji: '🤖', name: 'Sparky Robot' },
  { id: 'dino', emoji: '🦖', name: 'Pip the Dino' },
  { id: 'unicorn', emoji: '🦄', name: 'Luna Unicorn' },
  { id: 'explorer', emoji: '🧭', name: 'Maya Explorer' },
  { id: 'owl', emoji: '🦉', name: 'Oliver Owl' },
  { id: 'superhero', emoji: '⚡', name: 'Zap Superhero' }
];

class App {
  constructor() {
    this.topView = 'portfolio'; // 'portfolio' | 'licence' | 'student-zone'
    this.studentSubView = 'home'; // 'home' | 'subjects' | 'subject-detail' | 'lesson' | 'practice' | 'olympiad-room' | 'results' | 'leaderboard' | 'profile'
    this.user = null;
    this.subjects = [];
    this.olympiads = [];
    this.activeSubject = null;
    this.activeTopic = null;
    this.activeLesson = null;

    // Quiz & Examination state
    this.currentQuiz = null; // { type, title, id, questions: [] }
    this.currentQuestionIdx = 0;
    this.studentAnswers = {}; // { [qId]: selectedOption }
    this.markedForReview = new Set();
    this.quizTimerInterval = null;
    this.quizTimeRemaining = 0;
    this.quizTotalTime = 0;
    this.quizStartTime = null;

    // Slider state
    this.isLicenceAccepted = localStorage.getItem('talenthunt_licence_accepted') === 'true';
    this.sliderDragging = false;
    this.sliderProgress = 0;

    // Selected avatar in profile modal
    this.selectedAvatarId = 'lion';
  }

  async init() {
    this.bindGlobalEvents();
    this.initSlider();

    // Check user session
    try {
      this.user = await window.api.getMe();
    } catch (e) {}

    if (!this.user) {
      const savedGuest = localStorage.getItem('talenthunt_user');
      if (savedGuest) {
        this.user = JSON.parse(savedGuest);
      } else {
        try {
          const res = await window.api.guestLogin('Champion Learner', 'lion');
          this.user = res.user;
        } catch (err) {
          this.user = { display_name: 'Champion Learner', avatar: 'lion', xp: 50, stars: 5, grade: 3 };
        }
      }
    }

    this.updateUserUI();

    // Load initial subjects & Olympiads in background
    await this.loadSubjects();
    await this.loadOlympiads();

    // Initial view: Portfolio Landing Page (Exact user requirement)
    this.openPortfolioView();
  }

  // ========================================================================
  // TOP-LEVEL NAVIGATION (PORTFOLIO, LICENCE, STUDENT'S ZONE)
  // ========================================================================

  openPortfolioView() {
    this.topView = 'portfolio';
    document.body.classList.remove('student-mode');
    this.hideAllTopViews();
    const portfolioView = document.getElementById('view-portfolio');
    if (portfolioView) portfolioView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openLicencePortal() {
    this.topView = 'licence';
    document.body.classList.remove('student-mode');
    this.hideAllTopViews();
    const licenceView = document.getElementById('view-licence');
    if (licenceView) licenceView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If already accepted, reveal buttons immediately
    if (this.isLicenceAccepted) {
      this.revealMenuButtons(true);
    } else {
      this.resetSliderState();
    }
  }

  goToLicenceOrStudent() {
    if (this.isLicenceAccepted) {
      this.openStudentZone();
    } else {
      this.openLicencePortal();
    }
  }

  openStudentZone(subView = 'home', params = {}) {
    this.topView = 'student-zone';
    document.body.classList.add('student-mode');
    this.hideAllTopViews();
    const studentView = document.getElementById('view-student-zone');
    if (studentView) studentView.style.display = 'block';
    this.navigateTo(subView, params);
  }

  openBooksView() {
    window.soundFX.playClick();
    const modal = document.getElementById('books-modal');
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  openSettingsModal() {
    window.soundFX.playClick();
    const modal = document.getElementById('settings-modal');
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  hideAllTopViews() {
    document.querySelectorAll('.top-view').forEach(v => v.style.display = 'none');
  }

  // ========================================================================
  // LICENCE & REFUND POLICY SLIDER & TABS
  // ========================================================================

  switchLicenceTab(tab) {
    window.soundFX.playClick();
    const eulaBtn = document.getElementById('tab-btn-eula');
    const refundBtn = document.getElementById('tab-btn-refund');
    const eulaPane = document.getElementById('pane-eula');
    const refundPane = document.getElementById('pane-refund');

    if (tab === 'refund') {
      eulaBtn?.classList.remove('active');
      eulaBtn?.setAttribute('aria-selected', 'false');
      refundBtn?.classList.add('active');
      refundBtn?.setAttribute('aria-selected', 'true');
      if (eulaPane) eulaPane.style.display = 'none';
      if (refundPane) refundPane.style.display = 'block';
    } else {
      refundBtn?.classList.remove('active');
      refundBtn?.setAttribute('aria-selected', 'false');
      eulaBtn?.classList.add('active');
      eulaBtn?.setAttribute('aria-selected', 'true');
      if (refundPane) refundPane.style.display = 'none';
      if (eulaPane) eulaPane.style.display = 'block';
    }
  }

  initSlider() {
    const slider = document.getElementById('acceptSlider');
    const thumb = document.getElementById('sliderThumb');
    const fill = document.getElementById('sliderFill');
    if (!slider || !thumb || !fill) return;

    const setProgress = (value) => {
      const max = slider.clientWidth - thumb.offsetWidth;
      this.sliderProgress = Math.max(0, Math.min(1, value));
      thumb.style.left = `${this.sliderProgress * max}px`;
      fill.style.width = `${this.sliderProgress * 100}%`;
      slider.setAttribute('aria-valuenow', String(Math.round(this.sliderProgress * 100)));

      if (this.sliderProgress >= 0.88 && !this.isLicenceAccepted) {
        this.completeLicenceAcceptance();
      }
    };

    const pointerProgress = (event) => {
      const rect = slider.getBoundingClientRect();
      const usable = rect.width - thumb.offsetWidth;
      if (usable <= 0) return 0;
      return (event.clientX - rect.left - thumb.offsetWidth / 2) / usable;
    };

    slider.addEventListener('pointerdown', event => {
      if (this.isLicenceAccepted) return;
      this.sliderDragging = true;
      slider.setPointerCapture(event.pointerId);
      setProgress(pointerProgress(event));
    });

    slider.addEventListener('pointermove', event => {
      if (this.sliderDragging && !this.isLicenceAccepted) {
        setProgress(pointerProgress(event));
      }
    });

    const finishDrag = () => {
      if (!this.sliderDragging) return;
      this.sliderDragging = false;
      if (this.sliderProgress >= 0.85) {
        this.completeLicenceAcceptance();
      } else {
        setProgress(0);
      }
    };

    slider.addEventListener('pointerup', finishDrag);
    slider.addEventListener('pointercancel', finishDrag);

    // Keyboard Accessibility
    slider.addEventListener('keydown', event => {
      if (this.isLicenceAccepted) return;
      if (event.key === 'ArrowRight' || event.key === 'End') {
        event.preventDefault();
        setProgress(event.key === 'End' ? 1 : this.sliderProgress + 0.15);
      } else if (event.key === 'ArrowLeft' || event.key === 'Home') {
        event.preventDefault();
        setProgress(event.key === 'Home' ? 0 : this.sliderProgress - 0.15);
      } else if (event.key === 'Enter' && this.sliderProgress >= 0.75) {
        event.preventDefault();
        this.completeLicenceAcceptance();
      }
    });

    window.addEventListener('resize', () => {
      if (this.isLicenceAccepted) {
        const max = slider.clientWidth - thumb.offsetWidth;
        thumb.style.left = `${max}px`;
        fill.style.width = '100%';
      }
    });
  }

  completeLicenceAcceptance() {
    this.isLicenceAccepted = true;
    localStorage.setItem('talenthunt_licence_accepted', 'true');
    window.soundFX.playFanfare();

    const slider = document.getElementById('acceptSlider');
    const thumb = document.getElementById('sliderThumb');
    const fill = document.getElementById('sliderFill');
    const label = document.getElementById('sliderLabel');
    const status = document.getElementById('sliderStatus');

    if (slider && thumb && fill) {
      const max = slider.clientWidth - thumb.offsetWidth;
      thumb.style.left = `${max}px`;
      fill.style.width = '100%';
    }
    if (label) label.textContent = '✓ Licence & Policy Accepted';
    if (status) status.textContent = 'Welcome! Student Zone and Curriculum are now unlocked.';

    // Reveal buttons with smooth stagger animation
    this.revealMenuButtons(false);
  }

  revealMenuButtons(immediate = false) {
    const buttons = [...document.querySelectorAll('[data-menu-item]')];
    const label = document.getElementById('sliderLabel');
    const status = document.getElementById('sliderStatus');
    const slider = document.getElementById('acceptSlider');
    const thumb = document.getElementById('sliderThumb');
    const fill = document.getElementById('sliderFill');

    if (label) label.textContent = '✓ Licence & Policy Accepted';
    if (status) status.textContent = 'Student Zone, Books, and Settings are unlocked.';
    if (slider && thumb && fill) {
      const max = slider.clientWidth - thumb.offsetWidth;
      thumb.style.left = `${max}px`;
      fill.style.width = '100%';
    }

    buttons.forEach((btn, index) => {
      if (immediate) {
        btn.classList.add('visible');
      } else {
        window.setTimeout(() => btn.classList.add('visible'), index * 320);
      }
    });
  }

  resetSliderState() {
    this.sliderProgress = 0;
    const thumb = document.getElementById('sliderThumb');
    const fill = document.getElementById('sliderFill');
    const label = document.getElementById('sliderLabel');
    const status = document.getElementById('sliderStatus');

    if (thumb) thumb.style.left = '0px';
    if (fill) fill.style.width = '0%';
    if (label) label.textContent = 'Slide to accept';
    if (status) status.textContent = '';

    document.querySelectorAll('[data-menu-item]').forEach(btn => btn.classList.remove('visible'));
  }

  resetLicenceAcceptance() {
    this.isLicenceAccepted = false;
    localStorage.removeItem('talenthunt_licence_accepted');
    this.resetSliderState();
    document.getElementById('settings-modal')?.close();
    this.openLicencePortal();
  }

  // ========================================================================
  // STUDENT ZONE INNER ROUTING & CONTROLS
  // ========================================================================

  bindGlobalEvents() {
    // Sound FX button
    document.getElementById('audio-toggle-btn')?.addEventListener('click', () => this.toggleAudio());

    // Navigation links in student zone
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.soundFX.playClick();
        const targetView = el.getAttribute('data-nav');
        this.navigateTo(targetView);
      });
    });
  }

  toggleAudio() {
    const isMuted = window.soundFX.toggleMute();
    const btn = document.getElementById('audio-toggle-btn');
    if (btn) {
      btn.textContent = isMuted ? '🔇' : '🔊';
      btn.title = isMuted ? 'Unmute Sound FX' : 'Mute Sound FX';
    }
    if (!isMuted) window.soundFX.playClick();
  }

  updateUserUI() {
    const nameEl = document.getElementById('user-header-name');
    const avatarEl = document.getElementById('user-header-avatar');
    const starsEl = document.getElementById('user-header-stars');
    const xpEl = document.getElementById('user-header-xp');

    const avatarObj = AVATARS.find(a => a.id === (this.user?.avatar || 'lion')) || AVATARS[0];

    if (nameEl) nameEl.textContent = this.user ? this.user.display_name : 'Guest';
    if (avatarEl) avatarEl.textContent = avatarObj.emoji;
    if (starsEl) starsEl.textContent = `${this.user?.stars || 0} ★`;
    if (xpEl) xpEl.textContent = `${this.user?.xp || 0} XP`;
  }

  navigateTo(view, params = {}) {
    this.studentSubView = view;

    if (view !== 'practice' && view !== 'olympiad-room') {
      this.clearQuizTimer();
    }

    // Hide all sub-views inside Student Zone
    document.querySelectorAll('.student-zone-wrap .app-view').forEach(v => v.style.display = 'none');

    // Update active nav link
    document.querySelectorAll('.student-nav-btn').forEach(btn => {
      if (btn.getAttribute('data-nav') === view) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (view) {
      case 'home':
        document.getElementById('home-view').style.display = 'block';
        this.renderHome();
        break;
      case 'subjects':
        document.getElementById('subjects-view').style.display = 'block';
        this.renderSubjectsView();
        break;
      case 'subject-detail':
        document.getElementById('subject-detail-view').style.display = 'block';
        this.renderSubjectDetail(params.subjectId);
        break;
      case 'lesson':
        document.getElementById('lesson-view').style.display = 'block';
        this.renderLessonView(params.topicId);
        break;
      case 'practice':
        document.getElementById('practice-view').style.display = 'block';
        this.startPractice(params.topicId);
        break;
      case 'olympiad-room':
        document.getElementById('olympiad-view').style.display = 'block';
        this.startOlympiadExam(params.olympiadId);
        break;
      case 'results':
        document.getElementById('results-view').style.display = 'block';
        this.renderResultsView(params.results);
        break;
      case 'leaderboard':
        document.getElementById('leaderboard-view').style.display = 'block';
        this.renderLeaderboardView();
        break;
      case 'profile':
        document.getElementById('profile-view').style.display = 'block';
        this.renderProfileView();
        break;
      default:
        document.getElementById('home-view').style.display = 'block';
        this.renderHome();
        break;
    }
  }

  // ========================================================================
  // DATA LOADERS & VIEWS
  // ========================================================================

  async loadSubjects() {
    try {
      const data = await window.api.getSubjects();
      this.subjects = data.subjects || [];
    } catch (e) {
      console.error(e);
    }
  }

  async loadOlympiads() {
    try {
      const data = await window.api.getOlympiads();
      this.olympiads = data.olympiads || [];
    } catch (e) {
      console.error(e);
    }
  }

  renderHome() {
    const container = document.getElementById('home-subjects-container');
    if (!container) return;

    container.innerHTML = this.subjects.map(s => `
      <div class="subject-card ${s.slug === 'mathematics' ? 'subject-card-math' : 'subject-card-english'}" onclick="window.app.navigateTo('subject-detail', { subjectId: '${s.id}' })">
        <div class="subject-card-header">
          <div class="subject-icon-box">${s.icon}</div>
          <div>
            <div class="subject-tag">Class III CBSE</div>
            <h3 class="subject-title">${s.name}</h3>
          </div>
        </div>
        <p class="subject-desc">${s.description}</p>
        <div class="subject-meta">
          <span>📖 ${s.topic_count} Topics</span>
          <span class="btn btn-sm btn-primary">Explore Syllabus &rarr;</span>
        </div>
      </div>
    `).join('');
  }

  renderSubjectsView() {
    const container = document.getElementById('all-subjects-container');
    if (!container) return;

    container.innerHTML = this.subjects.map(s => `
      <div class="subject-card ${s.slug === 'mathematics' ? 'subject-card-math' : 'subject-card-english'}" onclick="window.app.navigateTo('subject-detail', { subjectId: '${s.id}' })">
        <div class="subject-card-header">
          <div class="subject-icon-box">${s.icon}</div>
          <div>
            <div class="subject-tag">CBSE Grade 3 Curriculum</div>
            <h3 class="subject-title">${s.name}</h3>
          </div>
        </div>
        <p class="subject-desc">${s.description}</p>
        <div class="subject-meta">
          <span>${s.topic_count} Core Chapters</span>
          <button class="btn btn-primary btn-sm">Open Chapters &rarr;</button>
        </div>
      </div>
    `).join('');
  }

  async renderSubjectDetail(subjectId) {
    const headerContainer = document.getElementById('subject-detail-header');
    const topicsContainer = document.getElementById('topics-list-container');
    if (!headerContainer || !topicsContainer) return;

    topicsContainer.innerHTML = `<div style="text-align:center; padding: 2rem;">Loading Chapters...</div>`;

    try {
      const data = await window.api.getTopics(subjectId);
      const subject = data.subject;
      const topics = data.topics || [];
      this.activeSubject = subject;

      headerContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 18px;">
          <div class="subject-icon-box" style="background:${subject.color}20; font-size: 2.2rem; width: 64px; height: 64px; border-radius: 50%;">
            ${subject.icon}
          </div>
          <div>
            <div class="subject-tag">CBSE Class III</div>
            <h2 class="sz-section-title" style="margin: 0;">${subject.name}</h2>
            <p class="sz-section-subtitle">${subject.description}</p>
          </div>
        </div>
      `;

      topicsContainer.innerHTML = topics.map(t => `
        <div class="topic-card">
          <div class="topic-card-header">
            <div class="topic-icon">${t.icon}</div>
            <h3 class="topic-title">${t.title}</h3>
          </div>
          <p class="topic-summary">${t.summary}</p>
          <div class="topic-actions">
            ${t.has_lesson ? `
              <button class="btn btn-outline btn-sm" onclick="window.app.navigateTo('lesson', { topicId: '${t.id}' })">
                📖 Lesson
              </button>
            ` : ''}
            <button class="btn btn-gold btn-sm" onclick="window.app.navigateTo('practice', { topicId: '${t.id}' })">
              🎯 Practice
            </button>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  }

  async renderLessonView(topicId) {
    const container = document.getElementById('lesson-content-container');
    if (!container) return;

    container.innerHTML = `<div style="text-align:center; padding: 2rem;">Loading Lesson Content...</div>`;

    try {
      const data = await window.api.getLesson(topicId);
      const lesson = data.lesson;
      const topic = data.topic;
      this.activeLesson = lesson;

      container.innerHTML = `
        <div class="lesson-header">
          <div>
            <span class="lesson-badge">✨ Bite-Sized Lesson</span>
            <h2 style="font-family: Georgia, serif; font-size: 2rem; color: var(--navy); margin: 6px 0;">
              ${lesson.title}
            </h2>
            <p style="color: var(--ink);">${topic.title} • CBSE Grade 3</p>
          </div>
          <button class="btn btn-gold btn-sm" onclick="window.app.navigateTo('practice', { topicId: '${topic.id}' })">
            Test Your Knowledge ⚡
          </button>
        </div>
        <div class="lesson-body">
          ${lesson.content}
        </div>
      `;
    } catch (e) {
      console.error(e);
    }
  }

  // ========================================================================
  // PRACTICE QUIZ & OLYMPIAD RUNNER
  // ========================================================================

  async startPractice(topicId) {
    try {
      const data = await window.api.getPracticeQuiz(topicId);
      this.currentQuiz = {
        type: 'practice',
        title: data.quiz.title,
        id: data.quiz.id,
        topicId: topicId,
        questions: data.quiz.questions || []
      };
      this.currentQuestionIdx = 0;
      this.studentAnswers = {};

      const titleEl = document.getElementById('practice-quiz-title');
      if (titleEl) titleEl.textContent = this.currentQuiz.title;

      this.renderPracticeQuestion();
    } catch (e) {
      console.error(e);
    }
  }

  renderPracticeQuestion() {
    if (!this.currentQuiz || !this.currentQuiz.questions.length) return;
    const q = this.currentQuiz.questions[this.currentQuestionIdx];
    const total = this.currentQuiz.questions.length;

    document.getElementById('practice-progress-text').textContent = `Question ${this.currentQuestionIdx + 1} of ${total}`;
    document.getElementById('practice-progress-fill').style.width = `${((this.currentQuestionIdx + 1) / total) * 100}%`;

    document.getElementById('practice-question-prompt').textContent = `${this.currentQuestionIdx + 1}. ${q.prompt}`;

    const optionsContainer = document.getElementById('practice-options-container');
    const selectedAns = this.studentAnswers[q.id];

    optionsContainer.innerHTML = q.options.map((opt, idx) => {
      const letters = ['A', 'B', 'C', 'D'];
      let extraClass = '';
      if (selectedAns !== undefined) {
        if (idx === q.correct_option) extraClass = 'correct';
        else if (idx === selectedAns) extraClass = 'wrong';
      }

      return `
        <div class="option-item ${extraClass}" onclick="window.app.selectPracticeOption(${idx})">
          <div class="option-circle">${letters[idx]}</div>
          <div>${opt}</div>
        </div>
      `;
    }).join('');

    const explanationBox = document.getElementById('practice-explanation-box');
    if (selectedAns !== undefined && q.explanation) {
      explanationBox.style.display = 'block';
      explanationBox.innerHTML = `<strong>💡 Explanation:</strong> ${q.explanation}`;
    } else {
      explanationBox.style.display = 'none';
    }

    const prevBtn = document.getElementById('practice-prev-btn');
    if (prevBtn) prevBtn.disabled = this.currentQuestionIdx === 0;

    const nextBtn = document.getElementById('practice-next-btn');
    if (nextBtn) {
      nextBtn.textContent = this.currentQuestionIdx === total - 1 ? 'Finish Practice ✓' : 'Next Question →';
    }
  }

  selectPracticeOption(idx) {
    const q = this.currentQuiz.questions[this.currentQuestionIdx];
    if (this.studentAnswers[q.id] !== undefined) return; // already answered

    this.studentAnswers[q.id] = idx;
    if (idx === q.correct_option) {
      window.soundFX.playCorrect();
    } else {
      window.soundFX.playWrong();
    }
    this.renderPracticeQuestion();
  }

  async startOlympiadExam(olympiadId) {
    try {
      const data = await window.api.getOlympiadExam(olympiadId);
      this.currentQuiz = {
        type: 'olympiad',
        title: data.exam.title,
        id: data.exam.id,
        durationMinutes: data.exam.duration_minutes || 20,
        questions: data.exam.questions || []
      };
      this.currentQuestionIdx = 0;
      this.studentAnswers = {};
      this.markedForReview.clear();

      document.getElementById('olympiad-exam-title').textContent = this.currentQuiz.title;

      // Start countdown timer
      this.quizTotalTime = this.currentQuiz.durationMinutes * 60;
      this.quizTimeRemaining = this.quizTotalTime;
      this.quizStartTime = Date.now();
      this.startQuizTimer();

      this.renderOlympiadQuestion();
    } catch (e) {
      console.error(e);
    }
  }

  startQuizTimer() {
    this.clearQuizTimer();
    this.updateTimerDisplay();

    this.quizTimerInterval = setInterval(() => {
      this.quizTimeRemaining--;
      this.updateTimerDisplay();

      if (this.quizTimeRemaining <= 30 && this.quizTimeRemaining > 0) {
        window.soundFX.playTick();
      }

      if (this.quizTimeRemaining <= 0) {
        this.clearQuizTimer();
        window.soundFX.playWrong();
        alert('⏰ Time has expired! Submitting your Olympiad exam automatically.');
        this.submitOlympiadExam();
      }
    }, 1000);
  }

  clearQuizTimer() {
    if (this.quizTimerInterval) {
      clearInterval(this.quizTimerInterval);
      this.quizTimerInterval = null;
    }
  }

  updateTimerDisplay() {
    const timerDisplay = document.getElementById('olympiad-timer-display');
    if (!timerDisplay) return;

    const mins = Math.floor(this.quizTimeRemaining / 60);
    const secs = this.quizTimeRemaining % 60;
    timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (this.quizTimeRemaining < 120) {
      timerDisplay.style.color = '#ef4444';
    } else {
      timerDisplay.style.color = 'var(--navy)';
    }
  }

  renderOlympiadQuestion() {
    if (!this.currentQuiz || !this.currentQuiz.questions.length) return;
    const q = this.currentQuiz.questions[this.currentQuestionIdx];
    const total = this.currentQuiz.questions.length;

    document.getElementById('olympiad-progress-fill').style.width = `${((this.currentQuestionIdx + 1) / total) * 100}%`;
    document.getElementById('olympiad-question-prompt').textContent = `Question ${this.currentQuestionIdx + 1} of ${total}: ${q.prompt}`;

    const optionsContainer = document.getElementById('olympiad-options-container');
    const selectedAns = this.studentAnswers[q.id];

    optionsContainer.innerHTML = q.options.map((opt, idx) => {
      const letters = ['A', 'B', 'C', 'D'];
      const isSelected = selectedAns === idx;

      return `
        <div class="option-item ${isSelected ? 'selected' : ''}" onclick="window.app.selectOlympiadOption(${idx})">
          <div class="option-circle">${letters[idx]}</div>
          <div>${opt}</div>
        </div>
      `;
    }).join('');

    const prevBtn = document.getElementById('olympiad-prev-btn');
    if (prevBtn) prevBtn.disabled = this.currentQuestionIdx === 0;

    const nextBtn = document.getElementById('olympiad-next-btn');
    if (nextBtn) nextBtn.style.display = this.currentQuestionIdx === total - 1 ? 'none' : 'inline-flex';

    const submitBtn = document.getElementById('olympiad-submit-btn');
    if (submitBtn) submitBtn.style.display = this.currentQuestionIdx === total - 1 ? 'inline-flex' : 'none';

    const reviewBtn = document.getElementById('olympiad-review-btn');
    if (reviewBtn) {
      reviewBtn.textContent = this.markedForReview.has(q.id) ? '★ Marked for Review' : '☆ Mark for Review';
    }
  }

  selectOlympiadOption(idx) {
    window.soundFX.playClick();
    const q = this.currentQuiz.questions[this.currentQuestionIdx];
    this.studentAnswers[q.id] = idx;
    this.renderOlympiadQuestion();
  }

  toggleMarkForReview() {
    const q = this.currentQuiz.questions[this.currentQuestionIdx];
    if (this.markedForReview.has(q.id)) {
      this.markedForReview.delete(q.id);
    } else {
      this.markedForReview.add(q.id);
    }
    this.renderOlympiadQuestion();
  }

  nextQuestion() {
    window.soundFX.playClick();
    if (this.currentQuestionIdx < this.currentQuiz.questions.length - 1) {
      this.currentQuestionIdx++;
      if (this.currentQuiz.type === 'practice') {
        this.renderPracticeQuestion();
      } else {
        this.renderOlympiadQuestion();
      }
    } else if (this.currentQuiz.type === 'practice') {
      this.navigateTo('subject-detail', { subjectId: this.activeSubject?.id });
    }
  }

  prevQuestion() {
    window.soundFX.playClick();
    if (this.currentQuestionIdx > 0) {
      this.currentQuestionIdx--;
      if (this.currentQuiz.type === 'practice') {
        this.renderPracticeQuestion();
      } else {
        this.renderOlympiadQuestion();
      }
    }
  }

  confirmSubmitOlympiad() {
    const total = this.currentQuiz.questions.length;
    const answeredCount = Object.keys(this.studentAnswers).length;
    const unanswered = total - answeredCount;

    let msg = `You have answered <strong>${answeredCount}</strong> out of <strong>${total}</strong> questions.`;
    if (unanswered > 0) {
      msg += `<br><span style="color: #ef4444; font-weight:700;">⚠️ You have ${unanswered} unanswered question(s).</span>`;
    }
    document.getElementById('confirm-modal-msg').innerHTML = msg;
    document.getElementById('confirm-submit-modal')?.showModal();
  }

  async submitOlympiadExam() {
    document.getElementById('confirm-submit-modal')?.close();
    this.clearQuizTimer();

    const timeSpent = Math.max(1, Math.round((Date.now() - this.quizStartTime) / 1000));
    const payload = {
      answers: this.studentAnswers,
      time_spent_seconds: timeSpent
    };

    try {
      const data = await window.api.submitOlympiad(this.currentQuiz.id, payload);
      this.user = await window.api.getMe();
      this.updateUserUI();

      if (data.results.percentage >= 80) {
        window.soundFX.playFanfare();
        window.confettiFX?.launchCelebration(5);
      } else {
        window.soundFX.playCorrect();
      }

      this.navigateTo('results', { results: data.results });
    } catch (e) {
      console.error(e);
      alert('Error submitting Olympiad. Please try again.');
    }
  }

  renderResultsView(results) {
    if (!results) return;
    this.latestResults = results;

    document.getElementById('results-exam-title').textContent = results.exam_title;
    document.getElementById('results-tier-badge').textContent = results.rank_tier || 'Honorable Merit';
    document.getElementById('results-score-text').textContent = `${results.score} / ${results.total_marks} (${results.percentage}%)`;

    const certBtn = document.getElementById('results-cert-btn');
    if (certBtn) {
      certBtn.style.display = results.certificate_earned ? 'inline-flex' : 'none';
    }
  }

  viewEarnedCertificate() {
    if (!this.latestResults?.certificate_earned) return;
    const cert = this.latestResults.certificate_earned;
    const html = window.certRenderer.renderCertificateHtml(cert);
    document.getElementById('cert-modal-body').innerHTML = html;
    document.getElementById('certificate-modal')?.showModal();
  }

  async renderLeaderboardView() {
    const container = document.getElementById('leaderboard-cards-container');
    if (!container) return;

    container.innerHTML = `<div style="text-align:center; padding: 2rem;">Loading Young Achievers...</div>`;

    try {
      const data = await window.api.getLeaderboard();
      const topLearners = data.top_learners || [];

      container.innerHTML = topLearners.map((learner, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐';
        return `
          <div class="subject-card" style="align-items: center; text-align: center;">
            <div style="font-size: 2.2rem; margin-bottom: 6px;">${medal}</div>
            <div class="subject-icon-box" style="margin-bottom: 10px;">${learner.avatar ? AVATARS.find(a => a.id === learner.avatar)?.emoji || '🦁' : '🦁'}</div>
            <h3 class="subject-title" style="font-size: 1.4rem;">${learner.display_name}</h3>
            <div class="book-badge" style="margin: 8px 0 16px;">Rank #${idx + 1} • Class III</div>
            <div class="subject-meta" style="width: 100%; justify-content: center; gap: 20px;">
              <span>⭐ ${learner.stars} Stars</span>
              <span>⚡ ${learner.xp} XP</span>
            </div>
          </div>
        `;
      }).join('');
    } catch (e) {
      console.error(e);
    }
  }

  async renderProfileView() {
    const container = document.getElementById('profile-info-container');
    if (!container) return;

    const avatarObj = AVATARS.find(a => a.id === (this.user?.avatar || 'lion')) || AVATARS[0];

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid var(--border-gold);">
        <div class="user-avatar-circle" style="width: 72px; height: 72px; font-size: 2.5rem;">
          ${avatarObj.emoji}
        </div>
        <div>
          <h3 style="font-family: Georgia, serif; font-size: 1.8rem; color: var(--navy); margin: 0;">${this.user.display_name}</h3>
          <p style="color: var(--text-muted); margin: 4px 0 0;">CBSE Grade 3 Student • Talent Hunt Scholar</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: #fbf5e9; padding: 18px; border-radius: 16px; text-align: center; border: 1px solid var(--border-gold);">
          <div style="font-size: 2rem;">⚡</div>
          <strong style="display: block; font-size: 1.4rem; color: var(--navy);">${this.user.xp || 0}</strong>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Total XP Points</span>
        </div>
        <div style="background: #fbf5e9; padding: 18px; border-radius: 16px; text-align: center; border: 1px solid var(--border-gold);">
          <div style="font-size: 2rem;">⭐</div>
          <strong style="display: block; font-size: 1.4rem; color: var(--navy);">${this.user.stars || 0}</strong>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Honors Stars</span>
        </div>
        <div style="background: #fbf5e9; padding: 18px; border-radius: 16px; text-align: center; border: 1px solid var(--border-gold);">
          <div style="font-size: 2rem;">🔥</div>
          <strong style="display: block; font-size: 1.4rem; color: var(--navy);">${this.user.streak_days || 1} Days</strong>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Learning Streak</span>
        </div>
      </div>

      <div style="text-align: center;">
        <button class="btn btn-gold btn-lg" onclick="window.app.openAuthModal()">
          ✏️ Edit Name &amp; Choose Avatar
        </button>
      </div>
    `;
  }

  openAuthModal() {
    window.soundFX.playClick();
    const input = document.getElementById('guest-name-input');
    if (input && this.user) input.value = this.user.display_name;

    const picker = document.getElementById('avatar-picker-container');
    if (picker) {
      picker.innerHTML = AVATARS.map(a => `
        <button type="button" class="btn btn-outline" style="font-size: 1.5rem; padding: 10px; border-radius: 12px; ${a.id === (this.user?.avatar || 'lion') ? 'border-color: var(--gold); background: #fef3c7;' : ''}" onclick="window.app.selectAvatar('${a.id}', this)">
          ${a.emoji}
        </button>
      `).join('');
    }

    document.getElementById('auth-modal')?.showModal();
  }

  selectAvatar(id, el) {
    this.selectedAvatarId = id;
    document.querySelectorAll('#avatar-picker-container button').forEach(b => {
      b.style.borderColor = '#cbd5e1';
      b.style.background = 'transparent';
    });
    if (el) {
      el.style.borderColor = 'var(--gold)';
      el.style.background = '#fef3c7';
    }
  }

  async handleGuestUpdate(e) {
    e.preventDefault();
    const name = document.getElementById('guest-name-input').value.trim();
    if (!name) return;

    try {
      const res = await window.api.guestLogin(name, this.selectedAvatarId);
      this.user = res.user;
      localStorage.setItem('talenthunt_user', JSON.stringify(this.user));
      this.updateUserUI();
      document.getElementById('auth-modal')?.close();
      if (this.studentSubView === 'profile') this.renderProfileView();
      window.soundFX.playFanfare();
    } catch (err) {
      console.error(err);
    }
  }
}

// Instantiate and initialize on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
