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

// Cascading Country and States Dictionary for Global Registration
const COUNTRIES_AND_STATES = {
  "India": [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Delhi (NCT)", "Jammu & Kashmir", "Ladakh", "Chandigarh", "Puducherry"
  ],
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
    "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ],
  "United Kingdom": [
    "England", "Scotland", "Wales", "Northern Ireland", "Greater London"
  ],
  "Canada": [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
    "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Northwest Territories",
    "Nunavut", "Yukon"
  ],
  "Australia": [
    "New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia",
    "Tasmania", "Australian Capital Territory", "Northern Territory"
  ],
  "United Arab Emirates": [
    "Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"
  ],
  "Singapore": [
    "Central Region", "East Region", "North Region", "North-East Region", "West Region"
  ],
  "Germany": [
    "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony",
    "North Rhine-Westphalia", "Saxony", "Baden-Württemberg"
  ],
  "France": [
    "Île-de-France", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie", "Provence-Alpes-Côte d'Azur"
  ],
  "Japan": [
    "Tokyo", "Osaka", "Kyoto", "Hokkaido", "Kanagawa", "Aichi", "Fukuoka"
  ],
  "Other": [
    "Other State / Province"
  ]
};

class App {
  constructor() {
    this.topView = 'portfolio'; // 'portfolio' | 'licence' | 'student-zone' | 'registration' | 'password-recovery' | 'admin-login' | 'admin-dashboard'
    this.studentSubView = 'home';
    this.user = null;
    this.subjects = [];
    this.olympiads = [];
    this.activeSubject = null;
    this.activeTopic = null;
    this.activeLesson = null;

    // Registration state
    this.regUserType = 'student'; // 'student' | 'other'
    this.adminUsers = [];

    // Quiz & Examination state
    this.currentQuiz = null;
    this.currentQuestionIdx = 0;
    this.studentAnswers = {};
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
    this.initCountryDropdown();

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
  // TOP-LEVEL NAVIGATION (PORTFOLIO, LICENCE, REGISTRATION, RECOVERY, ADMIN)
  // ========================================================================

  openPortfolioView() {
    this.topView = 'portfolio';
    document.body.classList.remove('student-mode');
    this.hideAllTopViews();
    const portfolioView = document.getElementById('view-portfolio');
    if (portfolioView) portfolioView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openLicencePortal(forceReset = false) {
    this.topView = 'licence';
    document.body.classList.remove('student-mode');
    this.hideAllTopViews();
    this.toggleInplaceLogin(false);
    const licenceView = document.getElementById('view-licence');
    if (licenceView) licenceView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (forceReset) {
      this.isLicenceAccepted = false;
      localStorage.removeItem('talenthunt_licence_accepted');
      this.resetSliderState();
    } else if (this.isLicenceAccepted) {
      this.revealMenuButtons(true);
    } else {
      this.resetSliderState();
    }
  }

  openRegistrationView() {
    this.topView = 'registration';
    document.body.classList.remove('student-mode');
    this.hideAllTopViews();
    const regView = document.getElementById('view-registration');
    if (regView) regView.style.display = 'block';
    this.setRegistrationType('student');
    const msgBox = document.getElementById('reg-msg-box');
    if (msgBox) msgBox.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openPasswordRecoveryView() {
    this.topView = 'password-recovery';
    document.body.classList.remove('student-mode');
    this.hideAllTopViews();
    const recView = document.getElementById('view-password-recovery');
    if (recView) recView.style.display = 'block';
    const pwdGroup = document.getElementById('rec-new-pwd-group');
    if (pwdGroup) pwdGroup.style.display = 'none';
    const msgBox = document.getElementById('rec-msg-box');
    if (msgBox) msgBox.style.display = 'none';
    const submitBtn = document.getElementById('rec-submit-btn');
    if (submitBtn) submitBtn.textContent = 'Verify Security Details →';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openAdminPortal() {
    if (window.api && window.api.adminToken) {
      this.openAdminDashboard();
    } else {
      this.topView = 'admin-login';
      document.body.classList.remove('student-mode');
      this.hideAllTopViews();
      const adminLoginView = document.getElementById('view-admin-login');
      if (adminLoginView) adminLoginView.style.display = 'block';
      const msg = document.getElementById('admin-login-msg');
      if (msg) msg.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  openAdminDashboard() {
    this.topView = 'admin-dashboard';
    document.body.classList.remove('student-mode');
    this.hideAllTopViews();
    const adminDashView = document.getElementById('view-admin-dashboard');
    if (adminDashView) adminDashView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loadAdminUsers();
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

  // ========================================================================
  // IN-PLACE LOGIN ON LICENCE PAGE
  // ========================================================================

  toggleInplaceLogin(show) {
    const panel = document.getElementById('licence-menu-panel');
    const err = document.getElementById('inplace-login-error');
    if (err) err.style.display = 'none';
    if (panel) {
      if (show) {
        window.soundFX.playClick();
        panel.classList.add('login-active');
        document.getElementById('login-username-input')?.focus();
      } else {
        window.soundFX.playClick();
        panel.classList.remove('login-active');
      }
    }
  }

  async handleInplaceLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username-input').value.trim();
    const password = document.getElementById('login-password-input').value;
    const errEl = document.getElementById('inplace-login-error');

    if (!username || !password) {
      if (errEl) {
        errEl.textContent = 'Please enter User ID and Password.';
        errEl.style.display = 'block';
      }
      return;
    }

    try {
      const res = await window.api.login({ username, password });
      this.user = res.user;
      this.updateUserUI();
      window.soundFX.playFanfare();
      if (res.user && res.user.is_admin) {
        this.openAdminDashboard();
      } else {
        this.openStudentZone('home');
      }
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message || 'Invalid User ID or Password.';
        errEl.style.display = 'block';
      }
    }
  }

  // ========================================================================
  // REGISTRATION PAGE (STUDENTS & OTHER)
  // ========================================================================

  initCountryDropdown() {
    const countrySelect = document.getElementById('reg-country');
    if (!countrySelect) return;

    countrySelect.innerHTML = Object.keys(COUNTRIES_AND_STATES).map(c => `
      <option value="${c}" ${c === 'India' ? 'selected' : ''}>${c}</option>
    `).join('');

    this.handleCountryChange('India');
  }

  handleCountryChange(country) {
    const stateSelect = document.getElementById('reg-state');
    if (!stateSelect) return;

    const states = COUNTRIES_AND_STATES[country] || ['Default State / Province'];
    stateSelect.innerHTML = states.map(s => `
      <option value="${s}">${s}</option>
    `).join('');
  }

  setRegistrationType(type) {
    this.regUserType = type;
    window.soundFX.playClick();

    const studentBtn = document.getElementById('type-btn-student');
    const otherBtn = document.getElementById('type-btn-other');
    const lblName = document.getElementById('lbl-student-name');
    const lblEmail = document.getElementById('lbl-student-email');
    const qualGroup = document.getElementById('grp-qualification');

    const disabledGroups = [
      document.getElementById('grp-class-div'),
      document.getElementById('grp-school-name'),
      document.getElementById('grp-parent-name'),
      document.getElementById('grp-parent-phone')
    ];

    if (type === 'other') {
      studentBtn?.classList.remove('active');
      otherBtn?.classList.add('active');

      if (lblName) lblName.innerHTML = '<del style="color:#ef4444; text-decoration-thickness: 2px;">Student</del> Name:';
      if (lblEmail) lblEmail.innerHTML = '<del style="color:#ef4444; text-decoration-thickness: 2px;">Student</del> Email ID:';

      disabledGroups.forEach(grp => {
        if (!grp) return;
        grp.classList.add('field-disabled');
        grp.querySelectorAll('input, select').forEach(input => {
          input.disabled = true;
        });
      });

      if (qualGroup) qualGroup.style.display = 'block';
    } else {
      otherBtn?.classList.remove('active');
      studentBtn?.classList.add('active');

      if (lblName) lblName.innerHTML = 'Student Name:';
      if (lblEmail) lblEmail.innerHTML = 'Student Email ID:';

      disabledGroups.forEach(grp => {
        if (!grp) return;
        grp.classList.remove('field-disabled');
        grp.querySelectorAll('input, select').forEach(input => {
          input.disabled = false;
        });
      });

      if (qualGroup) qualGroup.style.display = 'none';
    }
  }

  async handleRegistration(event) {
    event.preventDefault();
    const msgBox = document.getElementById('reg-msg-box');
    if (msgBox) {
      msgBox.style.display = 'none';
      msgBox.className = '';
    }

    const firstName = document.getElementById('reg-first-name').value.trim();
    const middleName = document.getElementById('reg-middle-name').value.trim();
    const lastName = document.getElementById('reg-last-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const username = document.getElementById('reg-username').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const country = document.getElementById('reg-country').value;
    const state = document.getElementById('reg-state').value;
    const pin = document.getElementById('reg-pin').value.trim();
    const addressDetails = document.getElementById('reg-address-details').value.trim();
    const secCity = document.getElementById('reg-security-city').value.trim();
    const secPet = document.getElementById('reg-security-pet').value.trim();

    // Validations:
    if (!firstName || !lastName) {
      this.showRegMsg('Please enter both First Name and Last Name.', 'error');
      return;
    }

    if (!email) {
      this.showRegMsg("Can't leave email blank, verification PIN will be sent to the email.", 'error');
      return;
    }

    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(username)) {
      this.showRegMsg('User_ID must be alphanumeric, all small caps and no special characters (e.g. abhijit85).', 'error');
      return;
    }

    if (password.length < 8) {
      this.showRegMsg('Password should be at least 8 digits/characters.', 'error');
      return;
    }

    const hasCapital = /[A-Z]/.test(password);
    const hasSpecial = /[*@#]/.test(password);
    const hasAlphaNum = /[0-9]/.test(password) && /[a-z]/i.test(password);

    if (!hasCapital || !hasSpecial || !hasAlphaNum) {
      this.showRegMsg('Password condition: should be eight digits, alphanumeric with one special character (*, @, #) and at least one capital letter.', 'error');
      return;
    }

    if (secCity.split(/\s+/).length > 1 || secPet.split(/\s+/).length > 1) {
      this.showRegMsg('Security Questions condition: Answer should be in one word only.', 'error');
      return;
    }

    const payload = {
      user_type: this.regUserType,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      email,
      username,
      password,
      country,
      state,
      pin,
      address_details: addressDetails,
      security_city: secCity,
      security_pet: secPet
    };

    if (this.regUserType === 'student') {
      payload.class_division = document.getElementById('reg-class-div').value;
      payload.school_name = document.getElementById('reg-school-name').value.trim();
      payload.parent_relation = document.getElementById('reg-parent-relation').value;
      payload.parent_name = document.getElementById('reg-parent-name').value.trim();
      payload.parent_phone = document.getElementById('reg-parent-phone').value.trim();
    } else {
      payload.qualification = document.getElementById('reg-qualification').value;
    }

    try {
      const res = await window.api.register(payload);
      window.soundFX.playFanfare();
      this.showRegMsg(
        `🎉 ${res.message} ${res.verification_pin_notice || ''} Redirecting to login...`,
        'success'
      );
      document.getElementById('registration-form').reset();
      this.initCountryDropdown();

      window.setTimeout(() => {
        this.openLicencePortal();
        this.toggleInplaceLogin(true);
        const loginUserInput = document.getElementById('login-username-input');
        if (loginUserInput) loginUserInput.value = username;
      }, 2500);
    } catch (err) {
      this.showRegMsg(err.message || 'Registration failed.', 'error');
    }
  }

  showRegMsg(text, type) {
    const box = document.getElementById('reg-msg-box');
    if (!box) return;
    box.textContent = text;
    box.style.display = 'block';
    if (type === 'error') {
      box.style.background = '#fef2f2';
      box.style.color = '#dc2626';
      box.style.border = '1px solid #fecaca';
    } else {
      box.style.background = '#f0fdf4';
      box.style.color = '#16a34a';
      box.style.border = '1px solid #bbf7d0';
    }
  }

  // ========================================================================
  // PASSWORD RECOVERY HANDLER
  // ========================================================================

  async handlePasswordRecovery(event) {
    event.preventDefault();
    const pwdGroup = document.getElementById('rec-new-pwd-group');
    const submitBtn = document.getElementById('rec-submit-btn');

    const city = document.getElementById('rec-city').value.trim();
    const pet = document.getElementById('rec-pet').value.trim();
    const email = document.getElementById('rec-email').value.trim();

    if (!city || !pet || !email) {
      this.showRecMsg('Please fill in both security answers and your registered Email ID.', 'error');
      return;
    }

    if (city.split(/\s+/).length > 1 || pet.split(/\s+/).length > 1) {
      this.showRecMsg('Security question answers must be one word only.', 'error');
      return;
    }

    // Step 1: Verify answers if new password is not visible yet
    if (pwdGroup.style.display === 'none') {
      try {
        const res = await window.api.recoverPassword({
          email,
          security_city: city,
          security_pet: pet
        });
        this.showRecMsg(`✅ ${res.message}`, 'success');
        pwdGroup.style.display = 'block';
        if (submitBtn) submitBtn.textContent = 'Reset Password & Proceed to Login →';
        document.getElementById('rec-new-password')?.focus();
      } catch (err) {
        this.showRecMsg(err.message || 'Verification failed.', 'error');
      }
      return;
    }

    // Step 2: Submit new password
    const newPassword = document.getElementById('rec-new-password').value;
    if (!newPassword || newPassword.length < 8) {
      this.showRecMsg('New password must be at least 8 characters long.', 'error');
      return;
    }

    const hasCapital = /[A-Z]/.test(newPassword);
    const hasSpecial = /[*@#]/.test(newPassword);
    const hasAlphaNum = /[0-9]/.test(newPassword) && /[a-z]/i.test(newPassword);

    if (!hasCapital || !hasSpecial || !hasAlphaNum) {
      this.showRecMsg('New password must be at least 8 digits/chars, alphanumeric with one special char (*, @, #) and at least one capital letter.', 'error');
      return;
    }

    try {
      const res = await window.api.recoverPassword({
        email,
        security_city: city,
        security_pet: pet,
        new_password: newPassword
      });
      window.soundFX.playFanfare();
      this.showRecMsg(`🎉 ${res.message} Redirecting to login...`, 'success');
      window.setTimeout(() => {
        this.openLicencePortal();
        this.toggleInplaceLogin(true);
      }, 2000);
    } catch (err) {
      this.showRecMsg(err.message || 'Password reset failed.', 'error');
    }
  }

  showRecMsg(text, type) {
    const box = document.getElementById('rec-msg-box');
    if (!box) return;
    box.textContent = text;
    box.style.display = 'block';
    if (type === 'error') {
      box.style.background = '#fef2f2';
      box.style.color = '#dc2626';
      box.style.border = '1px solid #fecaca';
    } else {
      box.style.background = '#f0fdf4';
      box.style.color = '#16a34a';
      box.style.border = '1px solid #bbf7d0';
    }
  }

  // ========================================================================
  // ADMIN PORTAL & DASHBOARD
  // ========================================================================

  async handleAdminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('admin-user-input').value.trim();
    const password = document.getElementById('admin-pwd-input').value;
    const msg = document.getElementById('admin-login-msg');

    if (!username || !password) return;

    try {
      const res = await window.api.adminLogin({ username, password });
      window.soundFX.playFanfare();
      this.openAdminDashboard();
    } catch (err) {
      if (msg) {
        msg.textContent = err.message || 'Invalid administrator credentials.';
        msg.style.display = 'block';
        msg.style.background = '#fef2f2';
        msg.style.color = '#dc2626';
        msg.style.border = '1px solid #fecaca';
      }
    }
  }

  handleAdminLogout() {
    window.api.adminLogout();
    window.soundFX.playClick();
    this.openPortfolioView();
  }

  async loadAdminUsers() {
    try {
      const data = await window.api.adminGetUsers();
      this.adminUsers = data.users || [];

      const statTotal = document.getElementById('admin-stat-total');
      const statStudents = document.getElementById('admin-stat-students');
      const statOther = document.getElementById('admin-stat-other');

      if (statTotal) statTotal.textContent = data.stats.total;
      if (statStudents) statStudents.textContent = data.stats.students;
      if (statOther) statOther.textContent = data.stats.other;

      this.renderAdminUsersTable(this.adminUsers);
    } catch (err) {
      console.error('Failed to load admin users:', err);
    }
  }

  filterAdminUsers(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      this.renderAdminUsersTable(this.adminUsers);
      return;
    }

    const filtered = this.adminUsers.filter(u => {
      const idMatch = (u.username || '').toLowerCase().includes(q);
      const nameMatch = (u.display_name || '').toLowerCase().includes(q);
      const emailMatch = (u.email || '').toLowerCase().includes(q);
      const schoolMatch = (u.school_name || '').toLowerCase().includes(q);
      const qualMatch = (u.qualification || '').toLowerCase().includes(q);
      return idMatch || nameMatch || emailMatch || schoolMatch || qualMatch;
    });

    this.renderAdminUsersTable(filtered);
  }

  renderAdminUsersTable(users) {
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;

    if (!users || users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">
            No matching registered members found in directory.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = users.map(u => {
      const isStudent = u.user_type === 'student';
      const roleBadge = u.is_admin ? '<span class="role-tag" style="background:#fee2e2; color:#b91c1c;">Admin</span>' :
        (isStudent ? '<span class="role-tag student">Student</span>' : '<span class="role-tag other">Other</span>');

      const academicOrQual = isStudent ?
        `<strong>${u.class_division || 'Class 3'}</strong><br><span style="font-size:0.8rem; color:var(--text-muted);">${u.school_name || '—'}</span>` :
        `<strong>${u.qualification || 'Professional'}</strong>`;

      const parentInfo = isStudent ?
        `<span>${u.parent_relation || 'Parent'}: ${u.parent_name || '—'}</span><br><span style="font-size:0.8rem; color:var(--text-muted);">${u.parent_phone || '—'}</span>` :
        `<span style="color:var(--text-muted);">Not Applicable</span>`;

      const locationStr = [u.state, u.country].filter(Boolean).join(', ') + (u.pin ? ` (${u.pin})` : '');

      return `
        <tr>
          <td><code style="font-weight: 700; color: var(--navy);">${u.username}</code></td>
          <td><strong>${u.display_name || u.username}</strong></td>
          <td>${roleBadge}</td>
          <td><a href="mailto:${u.email || ''}" style="color: #2563eb; text-decoration: none;">${u.email || '—'}</a></td>
          <td>${academicOrQual}</td>
          <td>${parentInfo}</td>
          <td><span style="font-size: 0.86rem;">${locationStr || '—'}</span></td>
          <td>
            <button class="btn-reset-pwd" onclick="window.app.openAdminResetPwdModal(${u.id}, '${u.username}')" title="Reset Password">
              🔑 Reset Pwd
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  openAdminResetPwdModal(userId, username) {
    window.soundFX.playClick();
    const idInput = document.getElementById('reset-target-userid');
    const nameEl = document.getElementById('reset-target-username');
    const pwdInput = document.getElementById('admin-new-pwd-input');
    const msg = document.getElementById('admin-reset-pwd-msg');

    if (idInput) idInput.value = userId;
    if (nameEl) nameEl.textContent = username;
    if (pwdInput) pwdInput.value = '';
    if (msg) msg.style.display = 'none';

    document.getElementById('admin-reset-pwd-modal')?.showModal();
  }

  async submitAdminPasswordReset(event) {
    event.preventDefault();
    const userId = document.getElementById('reset-target-userid').value;
    const newPwd = document.getElementById('admin-new-pwd-input').value;
    const msg = document.getElementById('admin-reset-pwd-msg');

    if (!newPwd || newPwd.length < 6) {
      if (msg) {
        msg.textContent = 'Password must be at least 6 characters.';
        msg.style.display = 'block';
        msg.style.background = '#fef2f2';
        msg.style.color = '#dc2626';
      }
      return;
    }

    try {
      const res = await window.api.adminResetPassword(userId, newPwd);
      window.soundFX.playFanfare();
      if (msg) {
        msg.textContent = `✅ ${res.message}`;
        msg.style.display = 'block';
        msg.style.background = '#f0fdf4';
        msg.style.color = '#16a34a';
      }
      window.setTimeout(() => {
        document.getElementById('admin-reset-pwd-modal')?.close();
      }, 1400);
    } catch (err) {
      if (msg) {
        msg.textContent = err.message || 'Failed to reset password.';
        msg.style.display = 'block';
        msg.style.background = '#fef2f2';
        msg.style.color = '#dc2626';
      }
    }
  }
}

// Instantiate and initialize on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
