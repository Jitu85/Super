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
    this.topView = 'portfolio'; // 'portfolio' | 'licence' | 'student-zone' | 'registration' | 'password-recovery' | 'admin-login' | 'admin-dashboard' | 'digital-library'
    this.studentSubView = 'home';
    this.user = null;
    this.subjects = [];
    this.olympiads = [];
    this.activeSubject = null;
    this.activeTopic = null;
    this.activeLesson = null;

    // Digital Library & Book Catalogue state
    this.libraryBooks = [];
    this.activeLibraryCategory = 'all';

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

    // Slider state: active and accepted by default
    this.isLicenceAccepted = true;
    this.sliderDragging = false;
    this.sliderProgress = 1;

    // Selected avatar in profile modal
    this.selectedAvatarId = 'lion';

    // Interactive Olympiad Mini-Quiz state (Landing Page Hook)
    this.miniQuizQuestions = [
      {
        subject: "Mathematics Olympiad • Numbers & Place Values",
        text: "What is the place value of the digit 7 in the number 4,782?",
        options: ["7 (Ones)", "70 (Tens)", "700 (Hundreds)", "7,000 (Thousands)"],
        correct: 2,
        explanation: "Correct! In the number 4,782, the digit 7 is in the hundreds place: 4 thousands, 7 hundreds (700), 8 tens (80), and 2 ones."
      },
      {
        subject: "English Grammar Olympiad • Parts of Speech",
        text: "Identify the adjective in the sentence: 'The brave astronaut explored the red planet.'",
        options: ["Astronaut", "Brave", "Explored", "Planet"],
        correct: 1,
        explanation: "Brilliant! 'Brave' describes the noun 'astronaut', making it an adjective of quality. ('Red' is also an adjective describing planet)."
      },
      {
        subject: "Logical Reasoning Olympiad • Number Patterns",
        text: "Find the next number in this sequence: 3, 6, 12, 24, ___",
        options: ["30", "36", "48", "50"],
        correct: 2,
        explanation: "Spot on! Each number is doubled (multiplied by 2): 3 × 2 = 6, 6 × 2 = 12, 12 × 2 = 24, and 24 × 2 = 48."
      }
    ];
    this.miniQuizCurrentIdx = 0;
    this.miniQuizScore = 0;
    this.miniQuizAnswered = false;
  }

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async init() {
    this.bindGlobalEvents();
    this.initSlider();
    this.revealMenuButtons(true);
    this.initCountryDropdown();
    this.initMiniQuiz();
    this.initOlympiadCountdown();

    // Check user session
    try {
      this.user = await window.api.getMe();
    } catch (e) {
      this.user = null;
    }

    // Strictly enforce registration: Clear any guest sessions or bypass tokens
    if (this.user && this.user.is_guest) {
      this.user = null;
      if (window.api) window.api.logout();
    }

    this.updateUserUI();

    // Load initial subjects & Olympiads in background
    await this.loadSubjects();
    await this.loadOlympiads();

    // Initial view: Check hash or default to Portfolio Landing Page
    if (window.location.hash === '#library' || window.location.hash === '#digital-library') {
      this.openDigitalLibraryView();
    } else if (window.location.hash === '#privacy') {
      this.openPrivacyPolicyView();
    } else if (window.location.hash === '#contact') {
      this.openContactView();
    } else {
      this.openPortfolioView();
    }
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
      this.setLicenceAccepted(false, false);
    } else {
      this.setLicenceAccepted(true, false);
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

  isUserRegistered() {
    return !!(this.user && !this.user.is_guest && window.api && window.api.token);
  }

  showRegistrationNotice(customMessage) {
    if (window.soundFX) window.soundFX.playClick();
    const modal = document.getElementById('registration-notice-modal');
    const msgEl = document.getElementById('registration-notice-text');
    if (msgEl && customMessage) {
      msgEl.textContent = customMessage;
    }
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      this.openRegistrationView();
    }
  }

  openLoginView() {
    if (window.soundFX) window.soundFX.playClick();
    this.openLicencePortal();
    this.revealMenuButtons(true);
    this.toggleInplaceLogin(true);
    setTimeout(() => {
      const input = document.getElementById('login-username-input');
      if (input) input.focus();
    }, 150);
  }

  openStudentZone(subView = 'home', params = {}) {
    if (!this.isUserRegistered()) {
      this.showRegistrationNotice('To access CBSE courses (Class III–X), English Grammar Masterclasses, Full Olympiad Rooms, and Vedic Mathematics, please register your free member account or log in.');
      return;
    }
    this.topView = 'student-zone';
    document.body.classList.add('student-mode');
    this.hideAllTopViews();
    const studentView = document.getElementById('view-student-zone');
    if (studentView) studentView.style.display = 'block';
    this.navigateTo(subView, params);
  }

  openDigitalLibraryView() {
    this.topView = 'digital-library';
    if (window.soundFX) window.soundFX.playClick();
    document.body.classList.remove('student-mode');
    this.hideAllTopViews();
    const libraryView = document.getElementById('view-digital-library');
    if (libraryView) libraryView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.renderDigitalLibraryCatalogue();
  }

  openBooksView() {
    // Navigate to dedicated Digital Library view
    this.openDigitalLibraryView();
  }

  openPrivacyPolicyView() {
    this.topView = 'privacy';
    if (window.soundFX) window.soundFX.playClick();
    document.body.classList.remove('student-mode');
    this.hideAllTopViews();
    const privacyView = document.getElementById('view-privacy');
    if (privacyView) privacyView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openContactView() {
    this.topView = 'contact';
    if (window.soundFX) window.soundFX.playClick();
    document.body.classList.remove('student-mode');
    this.hideAllTopViews();
    const contactView = document.getElementById('view-contact');
    if (contactView) contactView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  initMiniQuiz() {
    this.miniQuizCurrentIdx = 0;
    this.miniQuizScore = 0;
    this.miniQuizAnswered = false;
    this.renderMiniQuizQuestion();
  }

  renderMiniQuizQuestion() {
    const q = this.miniQuizQuestions[this.miniQuizCurrentIdx];
    if (!q) return;

    const numEl = document.getElementById('mini-q-num');
    const scoreEl = document.getElementById('mini-q-score');
    const subEl = document.getElementById('mini-q-subject');
    const textEl = document.getElementById('mini-q-text');
    const optionsGrid = document.getElementById('mini-quiz-options-grid');
    const feedbackBox = document.getElementById('mini-quiz-feedback');
    const nextBtn = document.getElementById('mini-quiz-next-btn');
    const portalBtn = document.getElementById('mini-quiz-portal-btn');

    if (numEl) numEl.textContent = this.miniQuizCurrentIdx + 1;
    if (scoreEl) scoreEl.textContent = this.miniQuizScore;
    if (subEl) subEl.textContent = q.subject;
    if (textEl) textEl.textContent = q.text;

    if (feedbackBox) {
      feedbackBox.style.display = 'none';
      feedbackBox.innerHTML = '';
    }
    if (nextBtn) nextBtn.style.display = 'none';
    if (portalBtn) portalBtn.style.display = 'none';
    this.miniQuizAnswered = false;

    if (optionsGrid) {
      const letters = ['A', 'B', 'C', 'D'];
      optionsGrid.innerHTML = q.options.map((opt, i) => `
        <button class="mini-opt-btn" onclick="window.app.selectMiniQuizOption(${i})">
          <span>${letters[i]}.</span> ${opt}
        </button>
      `).join('');
    }
  }

  selectMiniQuizOption(optionIdx) {
    if (this.miniQuizAnswered) return;
    this.miniQuizAnswered = true;

    const q = this.miniQuizQuestions[this.miniQuizCurrentIdx];
    const isCorrect = optionIdx === q.correct;
    const optionButtons = document.querySelectorAll('#mini-quiz-options-grid .mini-opt-btn');

    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) {
        btn.classList.add('correct');
      } else if (idx === optionIdx) {
        btn.classList.add('wrong');
      }
    });

    const feedbackBox = document.getElementById('mini-quiz-feedback');
    const nextBtn = document.getElementById('mini-quiz-next-btn');
    const portalBtn = document.getElementById('mini-quiz-portal-btn');
    const scoreEl = document.getElementById('mini-q-score');

    if (isCorrect) {
      if (window.soundFX) window.soundFX.playCorrect();
      this.miniQuizScore += 50;
      if (scoreEl) scoreEl.textContent = this.miniQuizScore;
      if (feedbackBox) {
        feedbackBox.style.display = 'block';
        feedbackBox.style.borderLeftColor = 'var(--green)';
        feedbackBox.innerHTML = `<strong>🎉 Outstanding!</strong> ${q.explanation}`;
      }
    } else {
      if (window.soundFX) window.soundFX.playWrong();
      if (feedbackBox) {
        feedbackBox.style.display = 'block';
        feedbackBox.style.borderLeftColor = '#ef4444';
        feedbackBox.innerHTML = `<strong>💡 Nice try!</strong> ${q.explanation}`;
      }
    }

    if (this.miniQuizCurrentIdx < this.miniQuizQuestions.length - 1) {
      if (nextBtn) nextBtn.style.display = 'inline-flex';
    } else {
      // Completed all questions in the mini-quiz!
      if (typeof window.launchConfetti === 'function') {
        window.launchConfetti(4000);
      }
      if (window.soundFX) window.soundFX.playFanfare();
      if (portalBtn) {
        if (this.isUserRegistered()) {
          portalBtn.innerHTML = '<span>🏆</span> Continue to Academic Dashboard &rarr;';
          portalBtn.onclick = () => window.app.openStudentZone('home');
        } else {
          portalBtn.innerHTML = '<span>📝</span> Register to Access Full Academic Portal &rarr;';
          portalBtn.onclick = () => window.app.openRegistrationView();
        }
        portalBtn.style.display = 'inline-flex';
      }
      if (feedbackBox) {
        feedbackBox.innerHTML += `<div style="margin-top: 10px; font-weight: 700; color: var(--navy);">🏆 You scored ${this.miniQuizScore} XP! ${this.isUserRegistered() ? 'Ready for timed countdown drills? Continue to your academic dashboard.' : 'Free registration required to unlock full CBSE courses (Class III–X), English Grammar, Olympiad arenas, and Vedic Mathematics.'}</div>`;
      }
    }
  }

  nextMiniQuizQuestion() {
    if (window.soundFX) window.soundFX.playClick();
    if (this.miniQuizCurrentIdx < this.miniQuizQuestions.length - 1) {
      this.miniQuizCurrentIdx++;
      this.renderMiniQuizQuestion();
    }
  }

  initOlympiadCountdown() {
    const update = () => {
      const now = new Date();
      // Countdown to 45 days ahead
      const target = new Date(now.getFullYear(), now.getMonth() + 1, 15, 10, 0, 0);
      let diff = target - now;
      if (diff < 0) diff = 30 * 24 * 3600 * 1000;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      const dEl = document.getElementById('cd-days');
      const hEl = document.getElementById('cd-hours');
      const mEl = document.getElementById('cd-mins');
      const sEl = document.getElementById('cd-secs');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(mins).padStart(2, '0');
      if (sEl) sEl.textContent = String(secs).padStart(2, '0');
    };

    update();
    setInterval(update, 1000);
  }

  handleContactInquiry(event) {
    event.preventDefault();
    if (window.soundFX) window.soundFX.playClick();

    const name = document.getElementById('contact-name-input')?.value.trim();
    const email = document.getElementById('contact-email-input')?.value.trim();
    const topic = document.getElementById('contact-subject-input')?.value;
    const message = document.getElementById('contact-message-input')?.value.trim();
    const statusBox = document.getElementById('contact-form-status');

    if (!name || !email || !message) {
      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.style.background = '#fee2e2';
        statusBox.style.color = '#991b1b';
        statusBox.textContent = 'Please complete all required fields.';
      }
      return;
    }

    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.style.background = '#e8f8f3';
      statusBox.style.color = '#116853';
      statusBox.innerHTML = `✓ Thank you, <strong>${name}</strong>! Your inquiry regarding <em>"${topic}"</em> has been received. Abhijit Kumar Misra will respond to <strong>${email}</strong> within 24 to 48 business hours.`;
    }

    if (window.soundFX) window.soundFX.playFanfare();
    const form = document.getElementById('contact-inquiry-form');
    if (form) form.reset();
  }

  filterLibraryCategory(category) {
    if (window.soundFX) window.soundFX.playClick();
    this.activeLibraryCategory = category;
    document.querySelectorAll('.cat-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === category);
    });
    const searchInput = document.getElementById('library-search-input');
    const q = searchInput ? searchInput.value : '';
    this.renderDigitalLibraryCatalogue(q);
  }

  filterLibraryBooks(query) {
    this.renderDigitalLibraryCatalogue(query);
  }

  renderDigitalLibraryCatalogue(searchQuery = '') {
    const container = document.getElementById('digital-library-catalogue');
    if (!container) return;

    // Filter books by active category and search query
    let filtered = this.libraryBooks || [];
    if (this.activeLibraryCategory && this.activeLibraryCategory !== 'all') {
      filtered = filtered.filter(b => b.category === this.activeLibraryCategory);
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(b =>
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.toLowerCase().includes(q))
      );
    }

    // Update count badges
    const countAll = document.getElementById('count-all');
    if (countAll) countAll.textContent = this.libraryBooks.length;
    ['cbse', 'olympiad', 'workbooks'].forEach(cat => {
      const el = document.getElementById(`count-${cat}`);
      if (el) el.textContent = this.libraryBooks.filter(b => b.category === cat).length;
    });

    if (filtered.length === 0) {
      // Blank catalogue state
      container.innerHTML = `
        <div class="blank-catalogue-box">
          <div class="blank-catalogue-icon-wrap">
            <svg class="blank-book-svg" viewBox="0 0 72 72" fill="none" aria-hidden="true">
              <rect x="8" y="14" width="56" height="44" rx="6" fill="#fef9ee" stroke="#f5a20e" stroke-width="2.5"/>
              <path d="M36 14v44M8 26h56M20 36h10M20 44h10M42 36h10M42 44h10" stroke="#17477f" stroke-width="2" stroke-linecap="round"/>
              <circle cx="36" cy="14" r="3" fill="#f5a20e"/>
            </svg>
          </div>
          <h2 class="blank-catalogue-title">Book Catalogue Ready</h2>
          <p class="blank-catalogue-desc">
            This dedicated digital library is organized and configured. As soon as you provide the book titles, covers, and details, they will be listed here with direct click-to-purchase links connecting to <strong>Amazon KDP</strong>.
          </p>

          <div class="blank-catalogue-shelf-placeholder">
            <div class="placeholder-card">
              <div class="ph-cover">
                <span class="ph-badge">Amazon KDP</span>
                <div class="ph-book-spine"></div>
                <span class="ph-icon">📖</span>
                <span class="ph-text">Book Cover Slot</span>
              </div>
              <div class="ph-info">
                <div class="ph-bar ph-bar-title"></div>
                <div class="ph-bar ph-bar-subtitle"></div>
                <div class="ph-bar ph-bar-text"></div>
                <div class="ph-btn-slot">
                  <span>🛒 Click to Purchase (Amazon KDP)</span>
                </div>
              </div>
            </div>

            <div class="placeholder-card">
              <div class="ph-cover">
                <span class="ph-badge">Amazon KDP</span>
                <div class="ph-book-spine"></div>
                <span class="ph-icon">📐</span>
                <span class="ph-text">Book Cover Slot</span>
              </div>
              <div class="ph-info">
                <div class="ph-bar ph-bar-title"></div>
                <div class="ph-bar ph-bar-subtitle"></div>
                <div class="ph-bar ph-bar-text"></div>
                <div class="ph-btn-slot">
                  <span>🛒 Click to Purchase (Amazon KDP)</span>
                </div>
              </div>
            </div>

            <div class="placeholder-card">
              <div class="ph-cover">
                <span class="ph-badge">Amazon KDP</span>
                <div class="ph-book-spine"></div>
                <span class="ph-icon">🏆</span>
                <span class="ph-text">Book Cover Slot</span>
              </div>
              <div class="ph-info">
                <div class="ph-bar ph-bar-title"></div>
                <div class="ph-bar ph-bar-subtitle"></div>
                <div class="ph-bar ph-bar-text"></div>
                <div class="ph-btn-slot">
                  <span>🛒 Click to Purchase (Amazon KDP)</span>
                </div>
              </div>
            </div>
          </div>

          <div class="blank-status-badge">
            <span>✨</span> Blank Book Catalogue Initialized &bull; Ready for Book Inventory &amp; Amazon KDP Links
          </div>
        </div>
      `;
      return;
    }

    // Live Book Cards when books exist
    container.innerHTML = `
      <div class="library-books-grid">
        ${filtered.map(book => `
          <article class="live-book-card" id="book-${book.id || ''}">
            <div>
              ${book.cover ? `<img src="${book.cover}" alt="${book.title}" class="live-book-cover" onerror="this.style.display='none'">` : ''}
              ${book.badge ? `<span class="book-badge">${book.badge}</span>` : ''}
              <h3 style="font-family: Georgia, serif; color: var(--navy); margin: 8px 0 4px;">${book.title}</h3>
              ${book.subtitle ? `<p style="color: var(--gold-hover); font-weight: 600; font-size: 0.9rem; margin-bottom: 8px;">${book.subtitle}</p>` : ''}
              ${book.description ? `<p style="color: var(--ink); font-size: 0.92rem; line-height: 1.5; margin-bottom: 12px;">${book.description}</p>` : ''}
              ${book.chapters && book.chapters.length ? `
                <ul class="book-chapter-list">
                  ${book.chapters.map(c => `<li><span>🔹</span> ${c}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
            <div style="margin-top: 14px;">
              <a href="${book.amazonKdpUrl || 'https://www.amazon.com/dp/'}" target="_blank" rel="noopener noreferrer" class="btn-amazon-kdp">
                <span>🛒</span> Click to Purchase on Amazon KDP &rarr;
              </a>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  setLibraryBooks(books = []) {
    this.libraryBooks = Array.isArray(books) ? books : [];
    this.renderDigitalLibraryCatalogue();
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

  setLicenceAccepted(accepted, playSound = false) {
    this.isLicenceAccepted = !!accepted;
    const slider = document.getElementById('acceptSlider');
    const thumb = document.getElementById('sliderThumb');
    const fill = document.getElementById('sliderFill');
    const label = document.getElementById('sliderLabel');
    const status = document.getElementById('sliderStatus');

    const checkmarkSVG = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 16l7 7L27 9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const arrowSVG = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 16h22M17 7l9 9-9 9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    if (this.isLicenceAccepted) {
      this.sliderProgress = 1;
      if (slider) {
        slider.classList.add('accepted');
        slider.setAttribute('aria-valuenow', '100');
        slider.setAttribute('aria-label', 'Licence and Policy Accepted (Click or slide to toggle)');
      }
      if (thumb) {
        thumb.innerHTML = checkmarkSVG;
        thumb.style.left = ''; // Handled by CSS calc(100% - ...) !important
      }
      if (fill) fill.style.width = '100%';
      if (label) label.textContent = '✓ Licence & Policy Accepted';
      if (status) status.textContent = 'All portal sections and navigation unlocked';
      this.revealMenuButtons(true);
      localStorage.setItem('talenthunt_licence_accepted', 'true');
      if (playSound && window.soundFX) window.soundFX.playFanfare();
    } else {
      this.sliderProgress = 0;
      if (slider) {
        slider.classList.remove('accepted');
        slider.setAttribute('aria-valuenow', '0');
        slider.setAttribute('aria-label', 'Slide or click to accept licence');
      }
      if (thumb) {
        thumb.innerHTML = arrowSVG;
        thumb.style.left = '0px';
      }
      if (fill) fill.style.width = '0%';
      if (label) label.textContent = 'Slide or click to accept';
      if (status) status.textContent = 'Accept licence to unlock all features';
      localStorage.removeItem('talenthunt_licence_accepted');
      if (playSound && window.soundFX) window.soundFX.playClick();
    }
  }

  initSlider() {
    const slider = document.getElementById('acceptSlider');
    const thumb = document.getElementById('sliderThumb');
    const fill = document.getElementById('sliderFill');
    if (!slider || !thumb || !fill) return;

    // Apply active & slided to right by default
    this.setLicenceAccepted(true, false);

    // Click handler: Clicking anywhere on the slider toggles state smoothly
    slider.addEventListener('click', () => {
      if (this.sliderHasDragged) {
        this.sliderHasDragged = false;
        return;
      }
      this.setLicenceAccepted(!this.isLicenceAccepted, true);
    });

    // Pointer / touch drag handling
    let isDragging = false;
    let startX = 0;
    this.sliderHasDragged = false;

    slider.addEventListener('pointerdown', (e) => {
      isDragging = true;
      this.sliderHasDragged = false;
      startX = e.clientX;
      slider.setPointerCapture(e.pointerId);
    });

    slider.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = Math.abs(e.clientX - startX);
      if (dx > 5) this.sliderHasDragged = true;

      const rect = slider.getBoundingClientRect();
      const usable = rect.width - thumb.offsetWidth;
      if (usable <= 0) return;

      const progress = Math.max(0, Math.min(1, (e.clientX - rect.left - thumb.offsetWidth / 2) / usable));
      thumb.style.left = `${progress * usable}px`;
      fill.style.width = `${progress * 100}%`;
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      if (this.sliderHasDragged) {
        const rect = slider.getBoundingClientRect();
        const usable = rect.width - thumb.offsetWidth;
        const progress = usable > 0 ? (e.clientX - rect.left - thumb.offsetWidth / 2) / usable : 0;
        if (progress >= 0.5) {
          this.setLicenceAccepted(true, true);
        } else {
          this.setLicenceAccepted(false, true);
        }
      }
    };

    slider.addEventListener('pointerup', endDrag);
    slider.addEventListener('pointercancel', endDrag);

    // Keyboard accessibility:
    slider.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.setLicenceAccepted(!this.isLicenceAccepted, true);
      } else if (e.key === 'ArrowRight' || e.key === 'End') {
        e.preventDefault();
        this.setLicenceAccepted(true, true);
      } else if (e.key === 'ArrowLeft' || e.key === 'Home') {
        e.preventDefault();
        this.setLicenceAccepted(false, true);
      }
    });

    window.addEventListener('resize', () => {
      if (this.isLicenceAccepted) {
        thumb.style.left = '';
        fill.style.width = '100%';
      }
    });
  }

  completeLicenceAcceptance() {
    this.setLicenceAccepted(true, true);
  }

  revealMenuButtons(immediate = false) {
    const buttons = [...document.querySelectorAll('[data-menu-item]')];
    buttons.forEach((btn, index) => {
      if (immediate) {
        btn.classList.add('visible');
      } else {
        window.setTimeout(() => btn.classList.add('visible'), index * 160);
      }
    });
  }

  resetSliderState() {
    this.setLicenceAccepted(false, false);
  }

  resetLicenceAcceptance() {
    document.getElementById('settings-modal')?.close();
    this.openLicencePortal(true);
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
    const levelEl = document.getElementById('user-header-level');
    const dashNameEl = document.getElementById('dashboard-student-name');

    const avatarObj = AVATARS.find(a => a.id === (this.user?.avatar || 'lion')) || AVATARS[0];

    const displayName = this.user ? this.user.display_name : 'Champion Learner';
    if (nameEl) nameEl.textContent = displayName;
    if (dashNameEl) dashNameEl.textContent = displayName;
    if (avatarEl) avatarEl.textContent = avatarObj.emoji;
    if (starsEl) starsEl.textContent = `${this.user?.stars || 0} ★`;
    if (xpEl) xpEl.textContent = `${this.user?.xp || 0} XP`;
    if (levelEl) {
      const xp = this.user?.xp || 0;
      const level = Math.floor(xp / 100) + 1;
      const grade = this.user?.grade ? `Class ${this.user.grade} • ` : '';
      levelEl.textContent = `${grade}Level ${level} Explorer`;
    }
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
      case 'analytics':
        document.getElementById('analytics-view').style.display = 'block';
        this.renderAnalyticsView();
        break;
      case 'community':
        document.getElementById('community-view').style.display = 'block';
        this.renderCommunityView();
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
            <button class="btn btn-primary btn-sm" onclick="window.app.openMultimodalLesson('${t.id}')" title="5-Pillar Multimodal Masterclass with Voice, Flashcards & Vedic Math">
              🎙️ Multimodal
            </button>
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
        <div class="lesson-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <span class="lesson-badge">✨ Bite-Sized Lesson</span>
            <h2 style="font-family: Georgia, serif; font-size: 2rem; color: var(--navy); margin: 6px 0;">
              ${lesson.title}
            </h2>
            <p style="color: var(--ink); margin: 0;">${topic.title} • CBSE Standards</p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="window.app.openMultimodalLesson('${topic.id}')">
              🎙️ Launch Multimodal Masterclass
            </button>
            <button class="btn btn-gold btn-sm" onclick="window.app.navigateTo('practice', { topicId: '${topic.id}' })">
              Test Your Knowledge ⚡
            </button>
          </div>
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

      if (window.antiCheating) {
        window.antiCheating.startSession('practice');
      }

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
        questions: data.questions || data.exam?.questions || []
      };
      this.currentQuestionIdx = 0;
      this.studentAnswers = {};
      this.markedForReview.clear();

      document.getElementById('olympiad-exam-title').textContent = this.currentQuiz.title;

      if (window.antiCheating) {
        window.antiCheating.startSession('olympiad');
      }

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

    let integrityScore = 100;
    let tabSwitches = 0;
    let telemetry = {};
    if (window.antiCheating) {
      const report = window.antiCheating.endSession();
      integrityScore = report.integrityScore ?? 100;
      tabSwitches = report.tabSwitches ?? 0;
      telemetry = report;
    }

    const timeSpent = Math.max(1, Math.round((Date.now() - this.quizStartTime) / 1000));
    const payload = {
      answers: this.studentAnswers,
      time_spent_seconds: timeSpent,
      integrity_score: integrityScore,
      tab_switches: tabSwitches,
      telemetry: telemetry
    };

    try {
      const data = await window.api.submitOlympiad(this.currentQuiz.id, payload);
      const results = data.results || data;
      this.user = await window.api.getMe();
      this.updateUserUI();

      if ((results.percentage || 0) >= 80) {
        window.soundFX.playFanfare();
        window.confettiFX?.launchCelebration(5);
      } else {
        window.soundFX.playCorrect();
      }

      this.navigateTo('results', { results });
    } catch (e) {
      console.error(e);
      alert('Error submitting Olympiad. Please try again.');
    }
  }

  renderResultsView(results) {
    if (!results) return;
    this.latestResults = results;

    document.getElementById('results-exam-title').textContent = results.exam_title || results.quiz_title || 'Olympiad Exam';
    document.getElementById('results-tier-badge').textContent = results.rank_tier || (results.certificate && results.certificate.rank_tier) || 'Honorable Merit';
    document.getElementById('results-score-text').textContent = `${results.score} / ${results.total_marks} (${results.percentage}%)`;

    // Proctoring Integrity Report
    const proctorCard = document.getElementById('results-proctoring-card');
    const badgeEl = document.getElementById('results-integrity-badge');
    const detailsEl = document.getElementById('results-integrity-details');
    if (proctorCard && badgeEl && detailsEl) {
      const score = results.integrity_score !== undefined ? results.integrity_score : 100;
      const switches = results.tab_switches || 0;
      proctorCard.style.display = 'block';
      badgeEl.textContent = `${score}% Integrity`;
      if (score >= 90) {
        badgeEl.className = 'proctor-pill proctor-pill-safe';
        detailsEl.textContent = `Honorable exam session! ${switches} tab switch(es) detected. Validated for official leaderboards.`;
      } else if (score >= 70) {
        badgeEl.className = 'proctor-pill proctor-pill-warning';
        detailsEl.textContent = `Warning: ${switches} tab switch(es) or rapid submission anomalies flagged during proctoring.`;
      } else {
        badgeEl.className = 'proctor-pill proctor-pill-flagged';
        detailsEl.textContent = `Integrity flag: ${switches} tab switch(es) recorded. Proctoring score adjusted.`;
      }
    }

    // Newly Unlocked Badges Container
    const badgesBox = document.getElementById('results-badges-box');
    const badgesList = document.getElementById('results-badges-list');
    if (badgesBox && badgesList) {
      if (results.badges_unlocked && results.badges_unlocked.length > 0) {
        badgesBox.style.display = 'block';
        badgesList.innerHTML = results.badges_unlocked.map(b => `
          <div class="badge-item-unlocked" style="background: #fef3c7; border: 1.5px solid #f59e0b; border-radius: 12px; padding: 8px 14px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.4rem;">${b.icon || '🎖️'}</span>
            <div style="text-align: left;">
              <strong style="color: #92400e; font-size: 0.9rem;">${b.name}</strong>
              <div style="font-size: 0.75rem; color: #78350f;">${b.description}</div>
            </div>
          </div>
        `).join('');
      } else {
        badgesBox.style.display = 'none';
      }
    }

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
      const topLearners = data.leaderboard || data.top_learners || [];

      container.innerHTML = topLearners.map((learner, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐';
        return `
          <div class="subject-card" style="align-items: center; text-align: center;">
            <div style="font-size: 2.2rem; margin-bottom: 6px;">${medal}</div>
            <div class="subject-icon-box" style="margin-bottom: 10px;">${learner.avatar ? AVATARS.find(a => a.id === learner.avatar)?.emoji || '🦁' : '🦁'}</div>
            <h3 class="subject-title" style="font-size: 1.4rem;">${this.escapeHtml(learner.display_name)}</h3>
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
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid var(--border-gold);">
        <div style="display: flex; align-items: center; gap: 18px;">
          <div class="user-avatar-circle" style="width: 72px; height: 72px; font-size: 2.5rem;">
            ${avatarObj.emoji}
          </div>
          <div>
            <h3 style="font-family: Georgia, serif; font-size: 1.8rem; color: var(--navy); margin: 0;">${this.escapeHtml(this.user?.display_name || 'Champion Learner')}</h3>
            <p style="color: var(--text-muted); margin: 4px 0 0;">
              Class ${this.escapeHtml(this.user?.grade || 3)} (${this.escapeHtml(this.user?.school_board || 'CBSE')}) &bull; ${this.escapeHtml(this.user?.target_olympiad || 'IMO & IEO')} Track
            </p>
          </div>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="window.app.openAcademicProfileModal()">
            🎓 Edit Academic Goals
          </button>
          <button class="btn btn-outline" onclick="window.app.openAuthModal()">
            🦁 Change Avatar
          </button>
        </div>
      </div>

      <!-- Hero Learning Telemetry Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px;">
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
        <div style="background: #fbf5e9; padding: 18px; border-radius: 16px; text-align: center; border: 1px solid var(--border-gold);">
          <div style="font-size: 2rem;">⏱️</div>
          <strong style="display: block; font-size: 1.4rem; color: var(--navy);">${this.user.daily_goal_minutes || 30} Mins</strong>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Daily Study Target</span>
        </div>
      </div>

      <!-- Academic Profiling Details Card -->
      <div class="section-card" style="margin-bottom: 24px; text-align: left;">
        <h4 style="margin: 0 0 14px 0; color: var(--navy); font-family: Georgia, serif; font-size: 1.2rem;">
          🏫 Academic Institution &amp; Curriculum Track
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; font-size: 0.95rem;">
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.82rem;">Current Class / Standard:</span>
            <strong>Class ${this.escapeHtml(this.user?.grade || 3)}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.82rem;">Education Board:</span>
            <strong>${this.escapeHtml(this.user?.school_board || 'CBSE')}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.82rem;">School Name:</span>
            <strong>${this.escapeHtml(this.user?.school_name || 'Not specified')}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.82rem;">Target Olympiad:</span>
            <strong style="color: var(--navy);">${this.escapeHtml(this.user?.target_olympiad || 'IMO & IEO')}</strong>
          </div>
        </div>
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
    const refreshBtn = document.getElementById('admin-refresh-btn');
    if (refreshBtn) refreshBtn.classList.add('spinning');
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
    } finally {
      if (refreshBtn) {
        setTimeout(() => refreshBtn.classList.remove('spinning'), 650);
      }
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
        `<strong>${this.escapeHtml(u.class_division || 'Class 3')}</strong><br><span style="font-size:0.8rem; color:var(--text-muted);">${this.escapeHtml(u.school_name || '—')}</span>` :
        `<strong>${this.escapeHtml(u.qualification || 'Professional')}</strong>`;

      const parentInfo = isStudent ?
        `<span>${this.escapeHtml(u.parent_relation || 'Parent')}: ${this.escapeHtml(u.parent_name || '—')}</span><br><span style="font-size:0.8rem; color:var(--text-muted);">${this.escapeHtml(u.parent_phone || '—')}</span>` :
        `<span style="color:var(--text-muted);">Not Applicable</span>`;

      const locationStr = [u.state, u.country].filter(Boolean).join(', ') + (u.pin ? ` (${u.pin})` : '');

      return `
        <tr>
          <td><code style="font-weight: 700; color: var(--navy);">${this.escapeHtml(u.username)}</code></td>
          <td><strong>${this.escapeHtml(u.display_name || u.username)}</strong></td>
          <td>${roleBadge}</td>
          <td><a href="mailto:${encodeURIComponent(u.email || '')}" style="color: #2563eb; text-decoration: none;">${this.escapeHtml(u.email || '—')}</a></td>
          <td>${academicOrQual}</td>
          <td>${parentInfo}</td>
          <td><span style="font-size: 0.86rem;">${this.escapeHtml(locationStr || '—')}</span></td>
          <td>
            <button class="btn-reset-pwd" data-userid="${this.escapeHtml(u.id)}" data-username="${this.escapeHtml(u.username)}" onclick="window.app.openAdminResetPwdModal(this.dataset.userid, this.dataset.username)" title="Reset Password">
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
      }
    }
  }

  // ========================================================================
  // DASHBOARD 4-PILLAR FLOW HANDLERS & MODALS
  // ========================================================================

  scrollToSection(sectionId) {
    if (this.topView !== 'student-zone') {
      if (!this.isUserRegistered()) {
        this.showRegistrationNotice('Please register or log in to access the full CBSE academic curriculum, English Grammar, Olympiad arenas, and Vedic Mathematics.');
        return;
      }
      this.openStudentZone('home');
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  }

  openSubjectFromDashboard(subjectId) {
    if (!this.isUserRegistered()) {
      this.showRegistrationNotice('Registration required to access interactive subject lessons and question drills.');
      return;
    }
    this.navigateTo('subject-detail', { subjectId });
  }

  openStandardModal(grade, subjectTrack) {
    if (!this.isUserRegistered()) {
      this.showRegistrationNotice('Registration required to view class standards curriculum and syllabus chapters.');
      return;
    }

    if (window.soundFX) window.soundFX.playClick();
    const modal = document.getElementById('class-curriculum-modal');
    const badgeEl = document.getElementById('curr-modal-badge');
    const titleEl = document.getElementById('curr-modal-title');
    const bodyEl = document.getElementById('curr-modal-body');

    const gradeNames = {
      3: 'Class III (Grade 3)',
      4: 'Class IV (Grade 4)',
      5: 'Class V (Grade 5)',
      6: 'Class VI (Grade 6)',
      7: 'Class VII (Grade 7)',
      8: 'Class VIII (Grade 8)',
      9: 'Class IX (Grade 9)',
      10: 'Class X (Grade 10)'
    };

    const gradeName = gradeNames[grade] || `Class ${grade}`;
    if (badgeEl) badgeEl.textContent = `CBSE Curriculum • ${gradeName}`;
    if (titleEl) titleEl.textContent = `${gradeName} Academic Syllabus`;

    const syllabusData = {
      3: {
        math: {
          name: 'Mathematics',
          icon: '📐',
          chapters: ['Numbers & Place Value (up to 4 digits)', 'Addition & Subtraction Word Problems', 'Multiplication Tables & Basic Division', 'Geometry: 2D Shapes & 3D Solids', 'Time & Clock Reading', 'Indian Currency & Money Math', 'Measurement (Length, Weight, Capacity)'],
          hasLive: true,
          subjectId: 'math-class3'
        },
        science: {
          name: 'Science',
          icon: '🔬',
          chapters: ['Living & Non-living Things', 'Parts of a Plant & Photosynthesis Basics', 'Animals: Food & Feeding Habits', 'Birds: Beaks, Claws & Nests', 'Our Body: Organ Systems & Personal Hygiene', 'Safety & First Aid Protocols', 'Air, Water & Weather Cycles', 'Earth, Sun, Moon & Stars']
        },
        english: {
          name: 'English',
          icon: '📖',
          chapters: ['Prose Comprehension & Theme Finding', 'Parts of Speech: Nouns, Pronouns & Verbs', 'Adjectives & Descriptive Modifiers', 'Prepositions of Place & Time', 'Sentence Capitalization & Punctuation', 'Short Story Narration & Picture Composition'],
          hasLive: true,
          subjectId: 'english-class3'
        }
      },
      4: {
        math: {
          name: 'Mathematics',
          icon: '📐',
          chapters: ['Large Numbers (up to 6 digits)', 'Operations with Multi-digit Numbers', 'Factors & Multiples (HCF & LCM basics)', 'Fractions & Equivalent Representations', 'Perimeter & Area of Rectangles/Squares', 'Symmetry & Patterns', 'Decimal Introduction']
        },
        science: {
          name: 'Science',
          icon: '🔬',
          chapters: ['Plant Adaptations & Terrestrial/Aquatic Habitats', 'Animal Adaptations & Reproduction', 'Food: Digestion & Balanced Diet', 'Teeth, Microbes & Oral Care', 'Solids, Liquids & Gases (Matter)', 'Force, Work & Types of Energy', 'Clean Environment & Natural Resources']
        },
        english: {
          name: 'English',
          icon: '📖',
          chapters: ['CBSE Prose Reading & Detailed Inference', 'Kinds of Sentences (Declarative, Interrogative)', 'Nouns: Gender & Possessive Forms', 'Simple Present, Past & Future Tenses', 'Articles: A, An, The & Omission Rules', 'Informal Letters & Paragraph Writing']
        }
      },
      5: {
        math: {
          name: 'Mathematics',
          icon: '📐',
          chapters: ['The Fish Tale: Large Number Calculations', 'Shapes and Angles (Acute, Right, Obtuse)', 'Parts and Wholes: Operations on Fractions', 'Rotational Symmetry & Patterns', 'Factors and Multiples Exploration', '3D Shapes, Boxes and Sketches', 'Area and its Boundary Calculation', 'Mapping & Grid Scales']
        },
        science: {
          name: 'Science',
          icon: '🔬',
          chapters: ['Growing Plants & Seed Germination Methods', 'Animal Habitats & Adaptations', 'Skeletal & Nervous Organ Systems', 'Food, Health & Deficiency Diseases', 'Safety, First Aid & Fire Protection', 'Rocks, Minerals & Soil Conservation', 'Simple Machines & Mechanical Advantage', 'Air, Atmosphere & Water Purification', 'Earth, Sun, Moon & Eclipses']
        },
        english: {
          name: 'English',
          icon: '📖',
          chapters: ['Classic Story Comprehension & Moral Insights', 'Adverbs of Manner, Time, Place & Degree', 'Degrees of Comparison (Adjectives)', 'Continuous & Perfect Tense Mechanics', 'Prepositional Phrases & Idiomatic Phrasings', 'Formal Letters & Creative Composition']
        }
      },
      6: {
        math: {
          name: 'Mathematics',
          icon: '📐',
          chapters: ['Knowing Our Numbers (Indian & International System)', 'Whole Numbers & Number Line Properties', 'Playing with Numbers (Prime, Composite, Divisibility)', 'Basic Geometrical Ideas (Points, Lines, Polygons)', 'Integers & Directed Numbers', 'Fractions & Decimals', 'Introduction to Algebra & Variable Equations', 'Ratio, Proportion & Unitary Method']
        },
        science: {
          name: 'Science',
          icon: '🔬',
          chapters: ['Components of Food & Dietary Balance', 'Sorting Materials into Groups', 'Separation of Substances', 'Getting to Know Plants: Leaves, Stems, Roots', 'Body Movements & Joint Mechanics', 'Living Organisms & Their Surroundings', 'Motion & Measurement of Distances', 'Light, Shadows & Reflections', 'Electricity & Electrical Circuits', 'Fun with Magnets & Magnetic Poles']
        },
        english: {
          name: 'English',
          icon: '📖',
          chapters: ['Honeysuckle Prose Anthology & Reader Stories', 'A Pact with the Sun: Supplementary Fiction', 'Finite & Non-Finite Verbs', 'Subject-Verb Concord in Complex Clauses', 'Modals (Can, Could, May, Might, Must, Should)', 'Active and Passive Voice (Basic Conversions)', 'Notice Writing, Diary Entry & Narrative Flow']
        }
      },
      7: {
        math: {
          name: 'Mathematics',
          icon: '📐',
          chapters: ['Integers: Multiplication & Division Rules', 'Fractions and Decimals (Multiplication/Division)', 'Data Handling: Mean, Median, Mode & Bar Graphs', 'Simple Equations: Solving Linear Equations', 'Lines and Angles: Transversals & Parallel Lines', 'The Triangle and its Properties & Congruence', 'Comparing Quantities: Percentage & Simple Interest', 'Rational Numbers & Operations', 'Algebraic Expressions: Like/Unlike Terms & Addition', 'Exponents and Powers']
        },
        science: {
          name: 'Science',
          icon: '🔬',
          chapters: ['Nutrition in Plants (Autotrophic & Heterotrophic)', 'Nutrition in Animals & Human Digestive Canal', 'Heat & Temperature Transfer (Conduction, Convection, Radiation)', 'Acids, Bases & Salts (Indicators & Neutralisation)', 'Physical & Chemical Changes', 'Respiration in Organisms (Aerobic & Anaerobic)', 'Transportation in Animals & Plants (Circulatory System)', 'Reproduction in Plants (Pollination & Fertilisation)', 'Motion & Time Calculation', 'Electric Current & Its Effects (Electromagnets)', 'Light: Reflection, Spherical Mirrors & Lenses', 'Forests: Our Lifeline & Wastewater Management']
        },
        english: {
          name: 'English',
          icon: '📖',
          chapters: ['Honeycomb Core CBSE Prose & Thematic Poetry', 'An Alien Hand Supplementary Reader Narratives', 'Direct & Indirect Reported Speech', 'Phrasal Verbs & Idiomatic Collocations', 'Clauses (Noun, Adjective, Adverbial Clauses)', 'Determiners & Quantifiers', 'Formal Letters to Editor & Article Construction']
        }
      },
      8: {
        math: {
          name: 'Mathematics',
          icon: '📐',
          chapters: ['Rational Numbers: Properties & Representation', 'Linear Equations in One Variable (Application Problems)', 'Understanding Quadrilaterals & Polygon Theorems', 'Data Handling: Pie Charts & Probability', 'Squares and Square Roots; Cubes and Cube Roots', 'Comparing Quantities: Compound Interest & Discounts', 'Algebraic Expressions, Identities & Factorisation', 'Mensuration: Surface Area & Volume of Solids', 'Exponents and Powers & Standard Form']
        },
        science: {
          name: 'Science',
          icon: '🔬',
          chapters: ['Crop Production & Agricultural Practices', 'Microorganisms: Friend & Foe', 'Coal & Petroleum (Fossil Fuels)', 'Combustion & Flame (Calorific Value)', 'Conservation of Plants & Animals (Flora & Fauna)', 'Reproduction in Animals & Metamorphosis', 'Reaching the Age of Adolescence (Hormones)', 'Force & Pressure (Atmospheric & Liquid Pressure)', 'Friction: Cause, Advantages & Reducing Friction', 'Sound: Frequency, Amplitude & Human Hearing', 'Chemical Effects of Electric Current (Electroplating)', 'Some Natural Phenomena (Lightning & Earthquakes)', 'Light: Laws of Reflection & Human Eye Anatomy']
        },
        english: {
          name: 'English',
          icon: '📖',
          chapters: ['Honeydew Core Reader Chapters & Poems', 'It So Happened Supplementary Classics', 'Conditional Sentences (Zero, 1st, 2nd, 3rd Conditionals)', 'Non-Finites: Infinitives, Gerunds & Participles', 'Advanced Voice Transformation & Passive Synthesis', 'Reported Speech: Commands, Questions & Exclamations', 'Speech Writing, Debate Framing & Story Construction']
        }
      },
      9: {
        math: {
          name: 'Mathematics',
          icon: '📐',
          chapters: ['Number Systems (Real Numbers & Irrationality)', 'Polynomials (Remainder & Factor Theorems, Identities)', 'Coordinate Geometry & Cartesian Plane', 'Linear Equations in Two Variables & Graphs', 'Introduction to Euclid\'s Geometry', 'Lines and Angles & Angle Sum Properties', 'Triangles (SAS, ASA, SSS, RHS Congruence)', 'Quadrilaterals & Mid-point Theorem', 'Circles (Chords, Subtended Angles & Cyclic Quadrilaterals)', 'Heron\'s Formula for Triangle Areas', 'Surface Areas and Volumes (Cones, Spheres, Hemispheres)', 'Statistics (Frequency Distributions & Histograms)']
        },
        science: {
          name: 'Science',
          icon: '🔬',
          chapters: ['Matter in Our Surroundings (States & Evaporation)', 'Is Matter Around Us Pure? (Solutions, Colloids, Suspensions)', 'Atoms and Molecules (Laws of Chemical Combination, Mole Concept)', 'Structure of the Atom (Bohr Model & Valency)', 'The Fundamental Unit of Life (Cell Organelles & Plasma Membrane)', 'Tissues (Plant Meristematic/Permanent & Animal Tissues)', 'Motion (Velocity, Acceleration, Distance-Time Graphs & Equations of Motion)', 'Force and Laws of Motion (Newton’s 3 Laws & Momentum)', 'Gravitation (Universal Law, Free Fall & Mass vs Weight)', 'Work and Energy (Kinetic/Potential Energy & Conservation)', 'Sound (Propagation, Reflection, Echo & Ultrasound Applications)', 'Improvement in Food Resources (Crop & Animal Husbandry)']
        },
        english: {
          name: 'English',
          icon: '📖',
          chapters: ['Beehive: Prose Chapters & Anthological Poems', 'Moments: Supplementary Fiction & Drama', 'Tenses & Modals Integrated Editing Exercises', 'Subject-Verb Agreement Cloze Tests', 'Reported Speech: Dialogue Transformation', 'Descriptive Paragraph Writing (Person, Event, Situation)', 'Short Story Writing with Cue Frameworks']
        }
      },
      10: {
        math: {
          name: 'Mathematics',
          icon: '📐',
          chapters: ['Real Numbers (Fundamental Theorem of Arithmetic)', 'Polynomials (Zeroes & Coefficients Relationship)', 'Pair of Linear Equations in Two Variables (Graphical & Algebraic)', 'Quadratic Equations (Factorisation & Quadratic Formula)', 'Arithmetic Progressions (nth Term & Sum of Terms)', 'Triangles (Basic Proportionality Theorem & Similarity)', 'Coordinate Geometry (Distance & Section Formulas)', 'Introduction to Trigonometry & Trigonometric Identities', 'Some Applications of Trigonometry (Heights & Distances)', 'Circles (Tangents to a Circle & Perpendicular Theorems)', 'Areas Related to Circles (Sectors & Segments)', 'Surface Areas and Volumes of Combinations of Solids', 'Statistics (Mean, Median & Mode of Grouped Data)', 'Probability (Classical Approach & Event Chances)']
        },
        science: {
          name: 'Science',
          icon: '🔬',
          chapters: ['Chemical Reactions and Equations (Types & Balancing)', 'Acids, Bases and Salts (pH Scale, Salts & Chlor-alkali Process)', 'Metals and Non-metals (Reactivity Series, Metallurgy & Corrosion)', 'Carbon and its Compounds (Covalent Bonding, Homologous Series & Functional Groups)', 'Life Processes (Nutrition, Cellular Respiration, Circulation & Excretion in Humans)', 'Control and Coordination (Nervous System, Reflex Arc & Plant Hormones)', 'How do Organisms Reproduce? (Asexual Modes, Sexual Reproduction in Flowering Plants & Humans)', 'Heredity and Evolution (Mendel’s Laws & Monohybrid/Dihybrid Crosses)', 'Light: Reflection and Refraction (Mirror/Lens Formulae & Magnification)', 'Human Eye and Colorful World (Atmospheric Refraction & Dispersion)', 'Electricity (Ohm’s Law, Resistance in Series/Parallel & Joule’s Heating Effect)', 'Magnetic Effects of Electric Current (Right-Hand Thumb Rule, Solenoid & Electromagnetic Induction)', 'Our Environment (Ecosystems, Trophic Levels, Food Webs & Ozone Depletion)']
        },
        english: {
          name: 'English',
          icon: '📖',
          chapters: ['First Flight: Board Textbook Prose, Drama & Poems', 'Footprints without Feet Supplementary Fiction', 'Tenses, Modals & Determiners Integrated Editing', 'Reported Speech: Commands, Requests & Statements', 'Subject-Verb Concord Cloze Test Exercises', 'Analytical Paragraph Writing (Data, Charts, Trends)', 'Formal Letters: Complaint, Inquiry, Order & Editor']
        }
      }
    };

    const classData = syllabusData[grade] || syllabusData[4];
    const mathData = classData.math;
    const scienceData = classData.science;
    const englishData = classData.english || classData.english_lit;

    const isMathSelected = subjectTrack === 'math';
    const isScienceSelected = subjectTrack === 'science';
    const isEnglishSelected = subjectTrack === 'english' || subjectTrack === 'english_lit' || subjectTrack === 'english_grammar';

    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="background: #fbf5e9; border: 1.5px solid var(--border-gold); border-radius: 16px; padding: 18px; margin-bottom: 22px;">
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 1.8rem;">📘</span>
            <div>
              <strong style="color: var(--navy); font-size: 1.1rem;">Official CBSE Curriculum &bull; 3 Core Subjects</strong>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin: 2px 0 0;">
                Authored by <strong>Abhijit Kumar Misra</strong> &bull; Published &amp; Distributed via Amazon KDP
              </p>
            </div>
          </div>
          <p style="color: var(--ink); font-size: 0.92rem; line-height: 1.5; margin: 0;">
            Every standard is divided into three core academic tracks: <strong>Mathematics</strong>, <strong>Science</strong>, and <strong>English</strong>.
          </p>
        </div>

        <div style="display: grid; gap: 16px;">
          <!-- Track 1: Mathematics -->
          <div style="background: white; border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 16px; ${isMathSelected ? 'border-color: var(--green); box-shadow: 0 4px 12px rgba(16,185,129,0.18);' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="font-family: Georgia, serif; color: var(--navy); margin: 0; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
                <span>${mathData.icon}</span> ${mathData.name}
              </h4>
              ${mathData.hasLive ? `
                <button class="btn btn-sm btn-gold" onclick="document.getElementById('class-curriculum-modal').close(); window.app.openSubjectFromDashboard('${mathData.subjectId}')">
                  Open Live Lessons &rarr;
                </button>
              ` : `
                <span class="stage-chip" style="background: #ecfdf5; color: #047857; font-weight: 700;">CBSE Syllabus</span>
              `}
            </div>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem; color: var(--ink); line-height: 1.6;">
              ${mathData.chapters.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>

          <!-- Track 2: Science -->
          <div style="background: white; border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 16px; ${isScienceSelected ? 'border-color: #258f80; box-shadow: 0 4px 12px rgba(37,143,128,0.18);' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="font-family: Georgia, serif; color: var(--navy); margin: 0; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
                <span>${scienceData.icon}</span> ${scienceData.name}
              </h4>
              <span class="stage-chip" style="background: #f0fdf4; color: #166534; font-weight: 700;">NCERT &amp; CBSE Standard</span>
            </div>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem; color: var(--ink); line-height: 1.6;">
              ${scienceData.chapters.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>

          <!-- Track 3: English -->
          <div style="background: white; border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 16px; ${isEnglishSelected ? 'border-color: var(--gold); box-shadow: 0 4px 12px rgba(242,165,30,0.2);' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="font-family: Georgia, serif; color: var(--navy); margin: 0; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
                <span>${englishData.icon}</span> ${englishData.name}
              </h4>
              ${englishData.hasLive ? `
                <button class="btn btn-sm btn-secondary" onclick="document.getElementById('class-curriculum-modal').close(); window.app.openSubjectFromDashboard('${englishData.subjectId}')">
                  Open Live Lessons &rarr;
                </button>
              ` : `
                <button class="btn btn-sm btn-outline" onclick="document.getElementById('class-curriculum-modal').close(); window.app.scrollToSection('section-grammar');">
                  Explore Grammar Hub &rarr;
                </button>
              `}
            </div>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem; color: var(--ink); line-height: 1.6;">
              ${englishData.chapters.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div style="margin-top: 22px; padding: 14px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; text-align: center; font-size: 0.88rem; color: var(--text-muted);">
          ℹ️ <strong>Curriculum &amp; Educational Matter:</strong> Detailed book passages, exercise sheets, and chapter illustrations authored by Abhijit Kumar Misra are scheduled for progressive rollout upon completion of platform development.
        </div>
      `;
    }

    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  openGrammarTopic(topicKey) {
    if (!this.isUserRegistered()) {
      this.showRegistrationNotice('Registration required to access the English Grammar Masterclass.');
      return;
    }

    if (window.soundFX) window.soundFX.playClick();
    const modal = document.getElementById('grammar-modal');
    const titleEl = document.getElementById('grammar-modal-title');
    const bodyEl = document.getElementById('grammar-modal-body');

    const topics = {
      'parts-of-speech': {
        title: 'Parts of Speech Masterclass',
        subtitle: 'The 8 Fundamental Building Blocks of the English Language',
        rules: [
          { name: 'Nouns', desc: 'Names of person, place, thing, or idea. (e.g., Delhi, courage, tiger, book).' },
          { name: 'Pronouns', desc: 'Words used in place of nouns to avoid repetition. (e.g., he, she, it, they, someone).' },
          { name: 'Verbs', desc: 'Express physical action, mental state, or occurrence. (e.g., run, ponder, is, become).' },
          { name: 'Adjectives', desc: 'Modify or describe nouns and pronouns. (e.g., brilliant student, vast ocean).' },
          { name: 'Adverbs', desc: 'Modify verbs, adjectives, or other adverbs. (e.g., sings sweetly, very fast).' },
          { name: 'Prepositions', desc: 'Show relationships in time, space, or direction. (e.g., on the desk, before noon).' },
          { name: 'Conjunctions', desc: 'Connect words, phrases, or clauses. (e.g., and, although, because, neither/nor).' },
          { name: 'Interjections', desc: 'Express sudden emotion. (e.g., Wow!, Bravo!, Alas!).' }
        ],
        practiceQ: {
          q: 'Identify the conjunction in the sentence: "She wanted to go to the park, but it started raining heavily."',
          options: ['Wanted', 'Park', 'But', 'Heavily'],
          correct: 2,
          explanation: '"But" is a coordinating conjunction connecting two independent clauses.'
        }
      },
      'tenses-syntax': {
        title: 'Tenses & Sentence Syntax',
        subtitle: 'Mastery over the 12 Time Frames, Subject-Verb Agreement, & Voice',
        rules: [
          { name: 'Simple Present', desc: 'Subject + Verb(s/es) for habitual facts. (e.g., The earth revolves around the sun).' },
          { name: 'Present Continuous', desc: 'Subject + is/am/are + Verb-ing for ongoing actions. (e.g., She is studying).' },
          { name: 'Present Perfect', desc: 'Subject + has/have + Past Participle (V3) for completed recent events. (e.g., We have finished).' },
          { name: 'Subject-Verb Concord', desc: 'Singular subjects take singular verbs; plural subjects take plural verbs. (e.g., Neither the teacher nor the students were late).' },
          { name: 'Active vs Passive Voice', desc: 'Active: Subject performs action. Passive: Subject receives action. (e.g., The chef cooked the meal &rarr; The meal was cooked by the chef).' }
        ],
        practiceQ: {
          q: 'Choose the grammatically correct sentence:',
          options: [
            'Each of the players have received a gold medal.',
            'Each of the players has received a gold medal.',
            'Each of the players were receiving a gold medal.',
            'Each of the players have receiving a gold medal.'
          ],
          correct: 1,
          explanation: '"Each" is an indefinite pronoun that takes a singular verb ("has received").'
        }
      },
      'vocabulary-comprehension': {
        title: 'Vocabulary, Idioms & Comprehension',
        subtitle: 'Lexical Precision, Root Words, & Unseen Reading Passage Mastery',
        rules: [
          { name: 'Root Words & Etymology', desc: 'Understand Latin/Greek prefixes and suffixes. (e.g., "Bene" = good &rarr; benevolent, benefactor).' },
          { name: 'Synonyms & Nuance', desc: 'Words with similar meanings that differ in intensity. (e.g., happy, cheerful, ecstatic).' },
          { name: 'Antonyms & Negation', desc: 'Opposites created via prefixes (un-, in-, dis-) or distinct words.' },
          { name: 'Idioms & Proverbs', desc: 'Figurative phrases whose meaning cannot be deduced literally. (e.g., "Piece of cake" = very easy).' },
          { name: 'Contextual Clues', desc: 'Decipher unfamiliar words using surrounding definitions, contrast words, and examples.' }
        ],
        practiceQ: {
          q: 'What does the idiom "Burn the midnight oil" mean?',
          options: [
            'To waste fuel carelessly',
            'To work or study late into the night',
            'To cause an accidental kitchen fire',
            'To wake up very early before sunrise'
          ],
          correct: 1,
          explanation: '"Burn the midnight oil" refers to working or studying late into the night.'
        }
      },
      'composition-writing': {
        title: 'Punctuation & Creative Writing',
        subtitle: 'Direct/Indirect Speech, Mechanics, & Expressive Composition',
        rules: [
          { name: 'Direct to Indirect Speech', desc: 'Shift tenses back when reporting verb is in the past. (e.g., He said, "I am tired" &rarr; He said that he was tired).' },
          { name: 'Apostrophe Rules', desc: 'Show possession (the girl\'s bag, children\'s toys) or contractions (it\'s = it is).' },
          { name: 'Comma Splicing Avoidance', desc: 'Never join two independent clauses with only a comma without a conjunction.' },
          { name: 'Analytical Paragraph Framing', desc: 'Topic sentence + supporting evidence + logical transitions + concluding thought.' },
          { name: 'Formal Communication', desc: 'Proper salutation, concise subject line, courteous body, and formal sign-off.' }
        ],
        practiceQ: {
          q: 'Change into Indirect Speech: Mira said, "I like ice cream."',
          options: [
            'Mira said that she like ice cream.',
            'Mira said that she liked ice cream.',
            'Mira says that she liked ice cream.',
            'Mira told that I liked ice cream.'
          ],
          correct: 1,
          explanation: 'The reporting verb "said" is in past tense, so the present "like" shifts to past "liked", and pronoun "I" shifts to "she".'
        }
      }
    };

    const topic = topics[topicKey] || topics['parts-of-speech'];
    if (titleEl) titleEl.textContent = topic.title;

    if (bodyEl) {
      bodyEl.innerHTML = `
        <p style="color: var(--text-muted); font-size: 1rem; margin-top: 0; margin-bottom: 20px;">
          ${topic.subtitle} &bull; Authored by <strong>Abhijit Kumar Misra</strong>
        </p>

        <div style="display: grid; gap: 12px; margin-bottom: 24px;">
          ${topic.rules.map(r => `
            <div style="background: #fbf5e9; border: 1px solid var(--border-gold); border-radius: 12px; padding: 14px;">
              <strong style="color: var(--navy); font-size: 1rem;">${r.name}:</strong>
              <span style="color: var(--ink); font-size: 0.92rem; margin-left: 6px;">${r.desc}</span>
            </div>
          `).join('')}
        </div>

        <!-- Interactive Question Practice Card -->
        <div style="background: white; border: 1.5px solid var(--gold); border-radius: 16px; padding: 20px; box-shadow: 0 4px 16px rgba(242,165,30,0.15);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span class="stage-chip" style="background: #fef3c7; color: #b45309; font-weight: 700;">Diagnostic Practice Drill</span>
            <span style="font-size: 0.85rem; color: var(--text-muted);">+25 XP Reward</span>
          </div>
          <h4 style="font-family: Georgia, serif; color: var(--navy); margin: 0 0 14px; font-size: 1.1rem;">
            ${topic.practiceQ.q}
          </h4>
          <div style="display: grid; gap: 8px; margin-bottom: 12px;" id="grammar-modal-options">
            ${topic.practiceQ.options.map((opt, idx) => `
              <button class="mini-opt-btn" onclick="window.app.evalGrammarModalQ(${idx}, ${topic.practiceQ.correct}, '${topic.practiceQ.explanation.replace(/'/g, "\\'")}')">
                <span>${String.fromCharCode(65 + idx)}.</span> ${opt}
              </button>
            `).join('')}
          </div>
          <div id="grammar-modal-feedback" style="display: none; padding: 12px; border-radius: 10px; font-size: 0.9rem;"></div>
        </div>
      `;
    }

    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  evalGrammarModalQ(selectedIdx, correctIdx, explanation) {
    const feedbackEl = document.getElementById('grammar-modal-feedback');
    const buttons = document.querySelectorAll('#grammar-modal-options button');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correctIdx) {
        btn.classList.add('correct');
      } else if (idx === selectedIdx) {
        btn.classList.add('incorrect');
      }
    });

    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      if (selectedIdx === correctIdx) {
        if (window.soundFX) window.soundFX.playSuccess();
        feedbackEl.style.background = '#f0fdf4';
        feedbackEl.style.color = '#16a34a';
        feedbackEl.style.border = '1px solid #bbf7d0';
        feedbackEl.innerHTML = `<strong>🎉 Brilliant!</strong> ${explanation}`;
      } else {
        if (window.soundFX) window.soundFX.playWrong();
        feedbackEl.style.background = '#fef2f2';
        feedbackEl.style.color = '#dc2626';
        feedbackEl.style.border = '1px solid #fecaca';
        feedbackEl.innerHTML = `<strong>💡 Solution:</strong> ${explanation}`;
      }
    }
  }

  startGrammarDiagnosticQuiz() {
    this.openGrammarTopic('parts-of-speech');
  }

  openOlympiadTrack(grade) {
    if (!this.isUserRegistered()) {
      this.showRegistrationNotice('Registration required to access the Olympiad Practice Arena.');
      return;
    }

    if (grade === 3) {
      this.navigateTo('olympiad-room', { olympiadId: 'olympiad-imo-class3' });
      return;
    }

    // Modal preview for Class IV to X Olympiads
    const modal = document.getElementById('class-curriculum-modal');
    const badgeEl = document.getElementById('curr-modal-badge');
    const titleEl = document.getElementById('curr-modal-title');
    const bodyEl = document.getElementById('curr-modal-body');

    if (badgeEl) badgeEl.textContent = `National Olympiad Arena • Class ${grade}`;
    if (titleEl) titleEl.textContent = `Class ${grade} Olympiad Track (IMO, IEO, NSO & Reasoning)`;

    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="background: #fbf5e9; border: 1.5px solid var(--border-gold); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-family: Georgia, serif; color: var(--navy); margin-top: 0; font-size: 1.3rem;">
            🏆 Competitive Olympiad Simulator (Class ${grade})
          </h3>
          <p style="color: var(--ink); font-size: 0.95rem; line-height: 1.6; margin: 0 0 12px;">
            Simulating national examinations from Science Olympiad Foundation (SOF) and SilverZone:
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-top: 8px;">
            <div style="background: white; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; text-align: center;">
              <strong>📐 IMO</strong><br><span style="font-size: 0.8rem; color: var(--text-muted);">Mathematics</span>
            </div>
            <div style="background: white; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; text-align: center;">
              <strong>📖 IEO</strong><br><span style="font-size: 0.8rem; color: var(--text-muted);">English</span>
            </div>
            <div style="background: white; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; text-align: center;">
              <strong>🔬 NSO</strong><br><span style="font-size: 0.8rem; color: var(--text-muted);">Science</span>
            </div>
            <div style="background: white; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; text-align: center;">
              <strong>🧠 Reasoning</strong><br><span style="font-size: 0.8rem; color: var(--text-muted);">Mental Ability</span>
            </div>
          </div>
        </div>

        <div style="background: white; border: 1px solid #cbd5e1; border-radius: 14px; padding: 18px; margin-bottom: 18px;">
          <h4 style="font-family: Georgia, serif; color: var(--navy); margin: 0 0 8px;">Examination Format &amp; Features:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem; color: var(--ink); line-height: 1.7;">
            <li>⏱️ <strong>Timed Countdown Simulator:</strong> Dedicated digital clock with auto-submission upon expiry.</li>
            <li>🌟 <strong>Achievers HOTS Section:</strong> Higher-Order Thinking Skills questions carrying double points (2 marks).</li>
            <li>📜 <strong>Automated Verification &amp; Certificate:</strong> Instant percentile ranking and printable PDF honors certificate.</li>
            <li>🛡️ <strong>100% Ad-Free &amp; Child-Safe:</strong> Focus-first testing environment authored by Abhijit Kumar Misra.</li>
          </ul>
        </div>

        <div style="text-align: center;">
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 14px;">
            Class ${grade} examination question banks are linked with upcoming workbook publications on Amazon KDP.
          </p>
          <button class="btn btn-gold btn-lg" onclick="document.getElementById('class-curriculum-modal').close(); window.app.navigateTo('olympiad-room', { olympiadId: 'olympiad-imo-class3' });">
            <span>🚀</span> Try Live Class III Olympiad Room &rarr;
          </button>
        </div>
      `;
    }

    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  openVedicTopic(sutraKey) {
    if (!this.isUserRegistered()) {
      this.showRegistrationNotice('Registration required to access Vedic Mathematics.');
      return;
    }

    if (window.soundFX) window.soundFX.playClick();
    const modal = document.getElementById('vedic-modal');
    const titleEl = document.getElementById('vedic-modal-title');
    const bodyEl = document.getElementById('vedic-modal-body');

    const sutras = {
      'ekadhikena': {
        name: 'Ekadhikena Purvena',
        sanskrit: 'एकाधिकेन पूर्वेण',
        meaning: '"By One More Than the Previous One"',
        formula: 'For any number (10a + 5): (10a + 5)² = 100 × a(a + 1) + 25',
        explanation: 'To square any number ending in 5, multiply the preceding digit(s) "a" by "a + 1", and append "25" to the product.',
        examples: [
          { num: '35²', steps: '3 × (3 + 1) = 3 × 4 = 12. Attach 25 &rarr; 1225' },
          { num: '65²', steps: '6 × (6 + 1) = 6 × 7 = 42. Attach 25 &rarr; 4225' },
          { num: '85²', steps: '8 × (8 + 1) = 8 × 9 = 72. Attach 25 &rarr; 7225' },
          { num: '105²', steps: '10 × (10 + 1) = 10 × 11 = 110. Attach 25 &rarr; 11025' }
        ]
      },
      'nikhilam': {
        name: 'Nikhilam Navatashcaramam Dashatah',
        sanskrit: 'निखिलं नवतश्चरमं दशतः',
        meaning: '"All from 9 and the Last from 10"',
        formula: 'Base multiplication near powers of 10 (10, 100, 1000)',
        explanation: 'Subtract each number from the nearest base. The left part is (Number 1 - Deficiency 2). The right part is (Deficiency 1 × Deficiency 2).',
        examples: [
          { num: '96 × 97 (Base 100)', steps: 'Deficiencies: -4 and -3. Left: 96 - 3 = 93. Right: (-4) × (-3) = 12 &rarr; 9312' },
          { num: '98 × 95 (Base 100)', steps: 'Deficiencies: -2 and -5. Left: 98 - 5 = 93. Right: (-2) × (-5) = 10 &rarr; 9310' },
          { num: '994 × 992 (Base 1000)', steps: 'Deficiencies: -6 and -8. Left: 994 - 8 = 986. Right: 048 &rarr; 986048' }
        ]
      },
      'urdhva': {
        name: 'Urdhva-Tiryagbhyam',
        sanskrit: 'ऊर्ध्वतिर्यग्भ्याम्',
        meaning: '"Vertically and Crosswise"',
        formula: 'Universal Cross-Multiplication Algorithm for all digits',
        explanation: 'Applicable to all multiplications. Eliminates intermediate paper calculations by generating digits directly from right to left using vertical and crosswise sums.',
        examples: [
          { num: '23 × 12', steps: 'Step 1: 3 × 2 = 6. Step 2: (2 × 2) + (3 × 1) = 4 + 3 = 7. Step 3: 2 × 1 = 2 &rarr; 276' },
          { num: '41 × 32', steps: 'Step 1: 1 × 2 = 2. Step 2: (4 × 2) + (1 × 3) = 8 + 3 = 11 (carry 1). Step 3: (4 × 3) + 1 = 13 &rarr; 1312' }
        ]
      },
      'paravartya': {
        name: 'Paravartya Yojayet',
        sanskrit: 'परावर्त्य योजयेत्',
        meaning: '"Transpose and Apply"',
        formula: 'Linear equation solving and high-speed polynomial division',
        explanation: 'Transposing signs enables instant mental division and algebraic simplification without lengthy step-by-step rearrangement.',
        examples: [
          { num: 'Solve: 7x - 5 = 2x + 25', steps: 'Transpose: (25 - (-5)) / (7 - 2) = 30 / 5 &rarr; x = 6 in one glance!' },
          { num: 'Solve: 3x + 4 = 19', steps: 'x = (19 - 4) / 3 = 15 / 3 &rarr; x = 5' }
        ]
      }
    };

    const sutra = sutras[sutraKey] || sutras['ekadhikena'];
    if (titleEl) titleEl.textContent = `${sutra.name} Sutra`;

    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="background: #fbf5e9; border: 1.5px solid var(--border-gold); border-radius: 16px; padding: 18px; margin-bottom: 20px;">
          <div style="font-family: Georgia, serif; font-size: 1.25rem; color: var(--navy); margin-bottom: 4px;">
            ${sutra.sanskrit} &bull; ${sutra.meaning}
          </div>
          <div style="font-size: 0.95rem; color: var(--ink); margin-top: 6px;">
            <strong>Mathematical Foundation:</strong> <code>${sutra.formula}</code>
          </div>
          <p style="font-size: 0.92rem; color: var(--text-muted); margin: 8px 0 0; line-height: 1.5;">
            ${sutra.explanation}
          </p>
        </div>

        <h4 style="font-family: Georgia, serif; color: var(--navy); margin: 0 0 12px; font-size: 1.15rem;">
          Solved Vedic Mental Calculation Examples:
        </h4>
        <div style="display: grid; gap: 10px; margin-bottom: 22px;">
          ${sutra.examples.map(ex => `
            <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 16px;">
              <strong style="color: var(--navy); font-size: 1.05rem;">${ex.num}:</strong>
              <div style="font-family: monospace; font-size: 0.95rem; color: #166534; background: #f0fdf4; padding: 6px 10px; border-radius: 6px; margin-top: 4px;">
                ${ex.steps}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="text-align: center;">
          <button class="btn btn-gold btn-lg" onclick="document.getElementById('vedic-modal').close(); window.app.scrollToSection('section-vedic');">
            <span>⚡</span> Try Vedic Speed Squaring Simulator &rarr;
          </button>
        </div>
      `;
    }

    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  runVedicSimulator() {
    const select = document.getElementById('vedic-num-select');
    const resultBox = document.getElementById('vedic-sim-result');
    if (!select || !resultBox) return;

    const num = parseInt(select.value, 10);
    const tenPart = Math.floor(num / 10);
    const leftPart = tenPart * (tenPart + 1);
    const rightPart = 25;
    const finalAns = (leftPart * 100) + rightPart;

    if (window.soundFX) window.soundFX.playClick();

    resultBox.innerHTML = `
      <div style="display: flex; gap: 14px; align-items: center; justify-content: center; flex-wrap: wrap;">
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--navy); font-family: Georgia, serif;">
          ${num}² =
        </div>
        <div style="background: white; border: 1.5px solid var(--gold); border-radius: 12px; padding: 8px 16px; font-family: monospace; font-size: 1.2rem; font-weight: 700; color: #b45309;">
          (${tenPart} × ${tenPart + 1}) | 25 = <span style="color: #16a34a; font-size: 1.4rem;">${finalAns}</span>
        </div>
      </div>
      <div style="margin-top: 10px; font-size: 0.9rem; color: var(--ink); text-align: center;">
        💡 <strong>Vedic Sutra:</strong> First Part = ${tenPart} × (${tenPart} + 1) = <strong>${leftPart}</strong> &bull; Second Part = 5² = <strong>25</strong> &bull; Combined = <strong style="color: #16a34a;">${finalAns}</strong>!
      </div>
    `;
  }

  // ========================================================================
  // ACADEMIC PROFILING ENGINE (STANDARDS III–X, BOARD, OLYMPIAD TARGETS)
  // ========================================================================

  async openAcademicProfileModal() {
    if (window.soundFX) window.soundFX.playClick();
    const modal = document.getElementById('academic-profile-modal');
    if (!modal) return;

    try {
      const data = await window.api.getAcademicProfile();
      const p = data.profile || {};
      const u = data.user || this.user || {};

      const gradeSelect = document.getElementById('prof-grade-select');
      const boardInput = document.getElementById('prof-board-input');
      const schoolInput = document.getElementById('prof-school-input');
      const divInput = document.getElementById('prof-division-input');
      const olySelect = document.getElementById('prof-olympiad-select');
      const goalInput = document.getElementById('prof-goal-input');

      if (gradeSelect) gradeSelect.value = String(u.grade || p.grade || 3);
      if (boardInput) boardInput.value = p.school_board || 'CBSE';
      if (schoolInput) schoolInput.value = p.school_name || '';
      if (divInput) divInput.value = p.division || '';
      if (olySelect) olySelect.value = p.target_olympiad || 'IMO & IEO';
      if (goalInput) goalInput.value = p.daily_goal_minutes || 30;

      modal.showModal();
    } catch (e) {
      console.error(e);
      modal.showModal();
    }
  }

  async saveAcademicProfile(e) {
    e.preventDefault();
    const grade = parseInt(document.getElementById('prof-grade-select')?.value, 10) || 3;
    const school_board = document.getElementById('prof-board-input')?.value.trim() || 'CBSE';
    const school_name = document.getElementById('prof-school-input')?.value.trim() || '';
    const division = document.getElementById('prof-division-input')?.value.trim() || '';
    const target_olympiad = document.getElementById('prof-olympiad-select')?.value || 'IMO & IEO';
    const daily_goal_minutes = parseInt(document.getElementById('prof-goal-input')?.value, 10) || 30;

    const currPwd = document.getElementById('prof-curr-pwd')?.value;
    const newPwd = document.getElementById('prof-new-pwd')?.value;

    try {
      await window.api.updateAcademicProfile({
        grade,
        school_board,
        school_name,
        division,
        target_olympiad,
        daily_goal_minutes
      });

      if (currPwd && newPwd) {
        await window.api.changePassword(currPwd, newPwd);
      }

      this.user = await window.api.getMe();
      this.updateUserUI();
      document.getElementById('academic-profile-modal')?.close();
      document.getElementById('academic-profile-form')?.reset();

      if (window.soundFX) window.soundFX.playFanfare();
      if (this.studentSubView === 'profile') this.renderProfileView();
      alert('Academic profile updated successfully! 🎓');
    } catch (err) {
      console.error(err);
      alert('Error updating profile: ' + (err.message || 'Please check your inputs'));
    }
  }

  // ========================================================================
  // 5-PILLAR MULTIMODAL LESSON ENGINE
  // ========================================================================

  async openMultimodalLesson(topicId) {
    if (window.soundFX) window.soundFX.playClick();
    const modal = document.getElementById('multimodal-lesson-modal');
    const titleEl = document.getElementById('mm-modal-title');
    const bodyEl = document.getElementById('mm-modal-body');

    if (!modal || !bodyEl) return;
    bodyEl.innerHTML = `<div style="text-align:center; padding: 2.5rem; color: var(--navy); font-size: 1.1rem;">⏳ Loading 5-Pillar Multimodal Masterclass...</div>`;
    modal.showModal();

    try {
      const data = await window.api.getMultimodalLesson(topicId);
      const lesson = data.lesson;
      this.currentMultimodalLesson = lesson;
      this.currentFlashcardIdx = 0;
      this.flashcardFlipped = false;

      const summaryContent = lesson.summary_html || lesson.concept_html || lesson.summary || 'Master the essential concept rules, applications, and strategies.';
      const rulesList = lesson.rules || lesson.key_rules || [
        'Understand the core foundation before applying formulas.',
        'Check work systematically using inverse mathematical operations.',
        'Use mental estimation to eliminate unlikely answers in competitive drills.'
      ];
      const audioScript = lesson.audio_script || (Array.isArray(lesson.audio_narration) ? lesson.audio_narration.join(' ') : (lesson.summary || ''));
      lesson.audio_script = audioScript;
      const flashcardsList = lesson.flashcards || [];
      const workedList = lesson.worked_examples || [];
      const vedicTrick = lesson.vedic_trick || {
        sutra: lesson.vedic_shortcut?.sutra_name || 'Ekadhikena Purvena & Nikhilam',
        trick: lesson.vedic_shortcut?.principle || 'High-speed mental calculation shortcut to bypass standard multi-step scratchwork.',
        example: lesson.vedic_shortcut?.vedic_method || 'Evaluate digits directly from left to right in seconds.'
      };

      if (titleEl) titleEl.textContent = `${lesson.title} (${data.topic ? data.topic.title : 'Masterclass'})`;

      bodyEl.innerHTML = `
        <!-- Multimodal Tab Navigation -->
        <div class="multimodal-tabs" role="tablist">
          <button class="mm-tab-btn active" onclick="window.app.switchMultimodalTab('summary', this)">📖 Concept Summary</button>
          <button class="mm-tab-btn" onclick="window.app.switchMultimodalTab('audio', this)">🎙️ Audio Lecture</button>
          <button class="mm-tab-btn" onclick="window.app.switchMultimodalTab('flashcards', this)">🎴 3D Flashcards</button>
          <button class="mm-tab-btn" onclick="window.app.switchMultimodalTab('worked', this)">✏️ Worked Steps</button>
          <button class="mm-tab-btn" onclick="window.app.switchMultimodalTab('vedic', this)">⚡ Vedic Shortcuts</button>
        </div>

        <!-- Pillar 1: Concept Summary & Rules -->
        <div id="mm-pane-summary" class="mm-pane active">
          <div style="background: #fbf5e9; border: 1.5px solid var(--border-gold); border-radius: 16px; padding: 18px 22px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 8px 0; color: var(--navy); font-size: 1.2rem; font-family: Georgia, serif;">Core Educational Foundations</h4>
            <div style="line-height: 1.7; color: var(--ink);">${summaryContent}</div>
          </div>
          <div class="rules-box" style="background: white; border-left: 4px solid var(--gold); padding: 16px 20px; border-radius: 0 12px 12px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
            <strong style="color: var(--navy);">📌 Primary Rules to Remember:</strong>
            <ul style="margin: 8px 0 0 20px; color: var(--ink); line-height: 1.6;">
              ${rulesList.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Pillar 2: Audio Lecture -->
        <div id="mm-pane-audio" class="mm-pane" style="display: none;">
          <div class="audio-lecture-box" style="text-align: center; padding: 30px; background: linear-gradient(135deg, #17477f, #0d2847); color: white; border-radius: 20px; margin-bottom: 20px;">
            <div style="font-size: 3rem; margin-bottom: 12px;">🎙️</div>
            <h4 style="margin: 0 0 6px 0; font-family: Georgia, serif; font-size: 1.5rem; color: #f2a51e;">Pedagogical Audio Explanation</h4>
            <p style="margin: 0 0 20px 0; color: rgba(255,255,255,0.85); font-size: 0.95rem;">Clear child-friendly voice walkthrough powered by Web Speech Synthesis.</p>
            <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
              <button id="mm-audio-play-btn" class="btn btn-gold btn-lg" onclick="window.app.playMultimodalAudio()">
                <span>▶️</span> Listen to Audio Lecture
              </button>
              <button class="btn btn-outline btn-lg" style="color: white; border-color: rgba(255,255,255,0.4);" onclick="window.app.stopMultimodalAudio()">
                <span>⏹️</span> Stop Audio
              </button>
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px;">
            <strong style="color: var(--navy);">Audio Transcript:</strong>
            <p style="margin: 8px 0 0; font-size: 0.92rem; color: #475569; line-height: 1.6;">${audioScript}</p>
          </div>
        </div>

        <!-- Pillar 3: 3D Flashcards -->
        <div id="mm-pane-flashcards" class="mm-pane" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <span style="font-weight: 700; color: var(--navy); font-size: 0.9rem;">Interactive Active Recall Card:</span>
            <span id="mm-card-counter" style="background: var(--gold); color: var(--navy); font-weight: 800; font-size: 0.8rem; padding: 4px 10px; border-radius: 12px;">Card 1 of ${flashcardsList.length}</span>
          </div>
          <div class="flashcard-3d-wrap" onclick="window.app.flipMultimodalFlashcard()">
            <div id="mm-flashcard-inner" class="flashcard-3d-inner">
              <div class="flashcard-face flashcard-front">
                <span class="flashcard-tag">Prompt / Question</span>
                <div id="mm-card-front-text" class="flashcard-text">Loading...</div>
                <div class="flashcard-hint">👆 Click or Tap to Flip Card</div>
              </div>
              <div class="flashcard-face flashcard-back">
                <span class="flashcard-tag" style="background: #10b981;">Concept & Answer</span>
                <div id="mm-card-back-text" class="flashcard-text">Loading...</div>
                <div class="flashcard-hint">👆 Click or Tap to Flip Back</div>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 14px; justify-content: center; margin-top: 20px;">
            <button class="btn btn-outline" onclick="window.app.prevMultimodalFlashcard()">← Previous Card</button>
            <button class="btn btn-gold" onclick="window.app.nextMultimodalFlashcard()">Next Card →</button>
          </div>
        </div>

        <!-- Pillar 4: Worked Steps -->
        <div id="mm-pane-worked" class="mm-pane" style="display: none;">
          <h4 style="margin: 0 0 14px 0; color: var(--navy); font-family: Georgia, serif;">Step-by-Step Worked Problems</h4>
          <div class="worked-steps-list">
            ${workedList.map((ex, idx) => `
              <div class="worked-example-card" style="background: white; border: 1.5px solid var(--border-gold); border-radius: 16px; padding: 18px; margin-bottom: 16px;">
                <div style="font-weight: 800; color: var(--navy); font-size: 1.05rem; margin-bottom: 8px;">
                  Problem ${idx + 1}: ${ex.problem}
                </div>
                <ol style="margin: 0 0 10px 20px; line-height: 1.6; color: var(--ink);">
                  ${ex.steps.map(s => `<li>${s}</li>`).join('')}
                </ol>
                <div style="background: #f0fdf4; border: 1px solid #86efac; color: #166534; font-weight: 700; padding: 8px 14px; border-radius: 8px; font-size: 0.95rem;">
                  Answer: ${ex.final_answer}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Pillar 5: Vedic Math Shortcuts -->
        <div id="mm-pane-vedic" class="mm-pane" style="display: none;">
          <div style="background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1.5px solid var(--gold); border-radius: 18px; padding: 22px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <span style="font-size: 2rem;">⚡</span>
              <div>
                <span class="stage-badge" style="background: var(--navy); color: white;">Ancient Vedic Sutra</span>
                <h4 style="margin: 2px 0 0; font-family: Georgia, serif; font-size: 1.3rem; color: var(--navy);">
                  ${vedicTrick.sutra}
                </h4>
              </div>
            </div>
            <p style="color: #78350f; font-size: 0.98rem; line-height: 1.6; margin: 0 0 14px 0;">
              ${vedicTrick.trick}
            </p>
            <div style="background: white; border-radius: 12px; padding: 14px 18px; border: 1px dashed var(--gold);">
              <strong style="color: var(--navy); font-size: 0.9rem;">Speed Calculation Demonstration:</strong>
              <div style="font-family: monospace; font-size: 1.05rem; color: #92400e; margin-top: 6px;">
                ${vedicTrick.example}
              </div>
            </div>
          </div>
        </div>
      `;

      this.renderCurrentFlashcard();
    } catch (err) {
      console.error(err);
      bodyEl.innerHTML = `<div style="text-align:center; padding: 2rem; color: #ef4444;">Failed to load multimodal lesson. Please try again.</div>`;
    }
  }

  switchMultimodalTab(tabKey, btnEl) {
    if (window.soundFX) window.soundFX.playClick();
    document.querySelectorAll('.mm-tab-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    document.querySelectorAll('.mm-pane').forEach(p => {
      p.style.display = 'none';
      p.classList.remove('active');
    });

    const target = document.getElementById(`mm-pane-${tabKey}`);
    if (target) {
      target.style.display = 'block';
      target.classList.add('active');
    }
  }

  renderCurrentFlashcard() {
    if (!this.currentMultimodalLesson || !this.currentMultimodalLesson.flashcards) return;
    const cards = this.currentMultimodalLesson.flashcards;
    const card = cards[this.currentFlashcardIdx];
    if (!card) return;

    const counter = document.getElementById('mm-card-counter');
    const front = document.getElementById('mm-card-front-text');
    const back = document.getElementById('mm-card-back-text');
    const inner = document.getElementById('mm-flashcard-inner');

    if (counter) counter.textContent = `Card ${this.currentFlashcardIdx + 1} of ${cards.length}`;
    if (front) front.textContent = card.front;
    if (back) back.textContent = card.back;
    if (inner) inner.classList.remove('flipped');
    this.flashcardFlipped = false;
  }

  flipMultimodalFlashcard() {
    if (window.soundFX) window.soundFX.playClick();
    const inner = document.getElementById('mm-flashcard-inner');
    if (inner) {
      this.flashcardFlipped = !this.flashcardFlipped;
      inner.classList.toggle('flipped', this.flashcardFlipped);
    }
  }

  prevMultimodalFlashcard() {
    if (window.soundFX) window.soundFX.playClick();
    if (this.currentFlashcardIdx > 0) {
      this.currentFlashcardIdx--;
      this.renderCurrentFlashcard();
    }
  }

  nextMultimodalFlashcard() {
    if (window.soundFX) window.soundFX.playClick();
    const total = this.currentMultimodalLesson?.flashcards?.length || 0;
    if (this.currentFlashcardIdx < total - 1) {
      this.currentFlashcardIdx++;
      this.renderCurrentFlashcard();
    }
  }

  playMultimodalAudio() {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis audio is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    if (!this.currentMultimodalLesson || !this.currentMultimodalLesson.audio_script) return;

    const btn = document.getElementById('mm-audio-play-btn');
    if (this.isAudioNarrating) {
      window.speechSynthesis.pause();
      this.isAudioNarrating = false;
      if (btn) btn.innerHTML = '<span>▶️</span> Resume Audio Lecture';
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.isAudioNarrating = true;
      if (btn) btn.innerHTML = '<span>⏸️</span> Pause Audio Lecture';
      return;
    }

    const utter = new SpeechSynthesisUtterance(this.currentMultimodalLesson.audio_script);
    utter.rate = 0.95;
    utter.pitch = 1.05;
    utter.onend = () => {
      this.isAudioNarrating = false;
      if (btn) btn.innerHTML = '<span>▶️</span> Listen to Audio Lecture';
    };
    utter.onerror = () => {
      this.isAudioNarrating = false;
      if (btn) btn.innerHTML = '<span>▶️</span> Listen to Audio Lecture';
    };
    window.speechSynthesis.speak(utter);
    this.isAudioNarrating = true;
    if (btn) btn.innerHTML = '<span>⏸️</span> Pause Audio Lecture';
  }

  stopMultimodalAudio() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isAudioNarrating = false;
    const btn = document.getElementById('mm-audio-play-btn');
    if (btn) btn.innerHTML = '<span>▶️</span> Listen to Audio Lecture';
  }

  // ========================================================================
  // PERFORMANCE ANALYTICS & GAMIFICATION ENGINE
  // ========================================================================

  async renderAnalyticsView() {
    const barsContainer = document.getElementById('analytics-subject-bars');
    const badgesCatalog = document.getElementById('analytics-badges-catalog');
    if (!barsContainer) return;

    try {
      const [analyticsData, gamificationData] = await Promise.all([
        window.api.getAnalytics(),
        window.api.getGamification()
      ]);

      const g = gamificationData;
      const a = analyticsData;

      const levelBadge = document.getElementById('user-level-badge');
      const levelName = document.getElementById('user-level-name');
      const xpBar = document.getElementById('user-xp-bar');
      const currXp = document.getElementById('user-current-xp');
      const nextXp = document.getElementById('user-next-xp');
      const streakDays = document.getElementById('analytics-streak-days');
      const streakMsg = document.getElementById('analytics-streak-msg');

      if (levelBadge) levelBadge.textContent = `Level ${g.level} • ${g.title}`;
      if (levelName) levelName.textContent = g.title;
      if (xpBar) xpBar.style.width = `${Math.min(100, Math.max(5, g.progress_percent))}%`;
      if (currXp) currXp.textContent = `${g.current_xp} XP`;
      if (nextXp) nextXp.textContent = `Target: ${g.next_level_xp} XP`;

      if (streakDays) streakDays.textContent = `${g.streak_days} Day${g.streak_days === 1 ? '' : 's'} 🔥`;
      if (streakMsg) {
        streakMsg.textContent = g.streak_days >= 3
          ? `Outstanding consistency! Your ${g.streak_days}-day study flame burns bright!`
          : `Complete daily Olympiad and CBSE drills to build your study flame!`;
      }

      if (a.subject_breakdown && a.subject_breakdown.length > 0) {
        barsContainer.innerHTML = a.subject_breakdown.map(s => `
          <div class="subject-stat-row" style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 6px; font-size: 0.95rem; color: var(--navy);">
              <span>${s.subject}</span>
              <span>${s.accuracy}% (${s.correct}/${s.total_questions} Solved)</span>
            </div>
            <div style="background: #e2e8f0; height: 12px; border-radius: 6px; overflow: hidden;">
              <div style="background: ${s.accuracy >= 75 ? '#10b981' : s.accuracy >= 50 ? '#f59e0b' : '#ef4444'}; height: 100%; width: ${s.accuracy}%; border-radius: 6px; transition: width 0.8s ease;"></div>
            </div>
          </div>
        `).join('');
      } else {
        barsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.95rem;">Complete practice quizzes or Olympiad exams to populate telemetry statistics.</p>`;
      }

      const masteredList = document.getElementById('analytics-mastered-list');
      const practiceList = document.getElementById('analytics-practice-list');

      if (masteredList) {
        masteredList.innerHTML = (a.mastered_topics && a.mastered_topics.length > 0)
          ? `<ul style="margin: 0; padding-left: 20px;">${a.mastered_topics.map(t => `<li style="margin-bottom: 4px;"><strong>${t.topic}</strong> (${t.accuracy}% mastery)</li>`).join('')}</ul>`
          : 'Complete topic drills to register mastered concepts.';
      }

      if (practiceList) {
        practiceList.innerHTML = (a.recommended_focus && a.recommended_focus.length > 0)
          ? `<ul style="margin: 0; padding-left: 20px;">${a.recommended_focus.map(t => `<li style="margin-bottom: 4px;"><strong>${t.topic}</strong> (Accuracy: ${t.accuracy}%) — <em>${t.suggestion}</em></li>`).join('')}</ul>`
          : 'Great work! No significant weaknesses identified yet.';
      }

      if (badgesCatalog && g.badges_catalog) {
        badgesCatalog.innerHTML = g.badges_catalog.map(b => `
          <div class="badge-card ${b.unlocked ? 'unlocked' : 'locked'}" style="background: ${b.unlocked ? '#fffbeb' : '#f8fafc'}; border: 1.5px solid ${b.unlocked ? '#f59e0b' : '#cbd5e1'}; border-radius: 16px; padding: 18px; text-align: center; opacity: ${b.unlocked ? '1' : '0.65'};">
            <div style="font-size: 2.8rem; margin-bottom: 8px;">${b.icon}</div>
            <h4 style="margin: 0 0 4px; color: var(--navy); font-size: 1.05rem;">${b.name}</h4>
            <p style="margin: 0 0 10px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">${b.description}</p>
            <span class="book-badge" style="background: ${b.unlocked ? '#10b981' : '#94a3b8'}; color: white; font-size: 0.75rem;">
              ${b.unlocked ? `Unlocked ✓` : 'Locked'}
            </span>
          </div>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  }

  // ========================================================================
  // COMMUNITY HUB & COLLABORATIVE LEARNING
  // ========================================================================

  async renderCommunityView() {
    try {
      const [challengeData, doubtsData] = await Promise.all([
        window.api.getDailyChallenge(),
        window.api.getDoubts(null, this.communitySubjectFilter || null)
      ]);

      const ch = challengeData.challenge;
      this.currentDailyChallenge = ch;

      const titleEl = document.getElementById('daily-challenge-title');
      const promptEl = document.getElementById('daily-challenge-prompt');
      const counterEl = document.getElementById('daily-solves-counter');
      const optionsContainer = document.getElementById('daily-challenge-options');
      const feedbackBox = document.getElementById('daily-challenge-feedback');

      if (titleEl) titleEl.textContent = ch.title;
      if (promptEl) promptEl.textContent = ch.prompt;
      if (counterEl) counterEl.textContent = `👥 ${ch.solves_count} Learners Solved Today`;

      if (feedbackBox) {
        feedbackBox.style.display = 'none';
        feedbackBox.innerHTML = '';
      }

      if (optionsContainer && ch.options) {
        const letters = ['A', 'B', 'C', 'D'];
        optionsContainer.innerHTML = ch.options.map((opt, idx) => `
          <button class="mini-opt-btn" style="background: rgba(255,255,255,0.9); color: var(--navy); border: 1.5px solid var(--gold); border-radius: 12px; padding: 10px 16px; font-weight: 700; cursor: pointer;" onclick="window.app.solveDailyChallenge(${idx})">
            <span>${letters[idx]}.</span> ${opt}
          </button>
        `).join('');
      }

      const streamEl = document.getElementById('community-doubts-stream');
      const doubts = doubtsData.doubts || [];

      if (!streamEl) return;

      if (doubts.length === 0) {
        streamEl.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">No community doubts found in this category. Be the first to ask!</div>`;
        return;
      }

      streamEl.innerHTML = doubts.map(d => `
        <div class="doubt-card" style="background: white; border: 1.5px solid var(--border-gold); border-radius: 18px; padding: 22px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="stage-badge" style="background: var(--navy); color: white;">${this.escapeHtml(d.subject)}</span>
              ${d.is_resolved ? '<span class="book-badge" style="background: #10b981; color: white;">Resolved ✓</span>' : ''}
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Today'}</span>
          </div>

          <h3 style="margin: 0 0 8px 0; font-family: Georgia, serif; color: var(--navy); font-size: 1.25rem;">
            ${this.escapeHtml(d.title)}
          </h3>
          <p style="margin: 0 0 16px 0; color: var(--ink); line-height: 1.6; font-size: 0.95rem;">
            ${this.escapeHtml(d.body)}
          </p>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 14px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--navy);">
              <span>👤 <strong>${this.escapeHtml(d.author_name || d.student_name || 'Scholar')}</strong> (Class ${this.escapeHtml(d.grade || d.student_grade || 3)})</span>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <button class="btn btn-outline btn-sm" data-id="${this.escapeHtml(d.id)}" onclick="window.app.upvoteDoubt(this.dataset.id, this)">
                <span>👍</span> Upvote (${d.upvotes || 0})
              </button>
              <button class="btn btn-primary btn-sm" data-id="${this.escapeHtml(d.id)}" onclick="window.app.toggleDoubtReplies(this.dataset.id)">
                <span>💬</span> Replies (${d.reply_count || (d.replies ? d.replies.length : 0)})
              </button>
            </div>
          </div>

          <!-- Collapsible Replies Thread -->
          <div id="doubt-replies-${this.escapeHtml(d.id)}" class="doubt-replies-thread" style="display: none; margin-top: 18px; padding-top: 16px; border-top: 1.5px dashed var(--border-gold);">
            <div id="doubt-replies-list-${this.escapeHtml(d.id)}" style="margin-bottom: 14px;">
              ${(d.replies && d.replies.length > 0) ? d.replies.map(r => `
                <div style="background: #f8fafc; border-left: 3px solid ${r.is_expert || r.is_mentor ? 'var(--gold)' : '#94a3b8'}; border-radius: 0 10px 10px 0; padding: 10px 14px; margin-bottom: 8px; font-size: 0.9rem;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <strong style="color: var(--navy);">${this.escapeHtml(r.author_name || r.user_name)} ${r.is_expert || r.is_mentor ? '<span style="color: #b45309; font-size: 0.75rem;">Verified Mentor ⭐</span>' : ''}</strong>
                    <span style="font-size: 0.75rem; color: #94a3b8;">${r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <div style="color: var(--ink);">${this.escapeHtml(r.body || r.reply_body)}</div>
                </div>
              `).join('') : '<div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">No replies yet. Be the first peer to help!</div>'}
            </div>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="reply-input-${this.escapeHtml(d.id)}" class="form-input" placeholder="Type a helpful answer or hint..." style="font-size: 0.88rem;" />
              <button class="btn btn-primary btn-sm" data-id="${this.escapeHtml(d.id)}" onclick="window.app.submitDoubtReply(this.dataset.id)">Reply</button>
            </div>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  }

  filterCommunity(subject) {
    if (window.soundFX) window.soundFX.playClick();
    this.communitySubjectFilter = (subject === 'All' ? null : subject);
    this.renderCommunityView();
  }

  toggleDoubtReplies(doubtId) {
    const el = document.getElementById(`doubt-replies-${doubtId}`);
    if (el) {
      const isHidden = el.style.display === 'none';
      el.style.display = isHidden ? 'block' : 'none';
    }
  }

  async upvoteDoubt(doubtId, btnEl) {
    if (window.soundFX) window.soundFX.playClick();
    try {
      const data = await window.api.upvoteDoubt(doubtId);
      if (btnEl) btnEl.innerHTML = `<span>👍</span> Upvote (${data.upvotes})`;
    } catch (e) {
      console.error(e);
    }
  }

  async submitDoubtReply(doubtId) {
    const input = document.getElementById(`reply-input-${doubtId}`);
    const body = input ? input.value.trim() : '';
    if (!body) return;

    try {
      await window.api.replyDoubt(doubtId, body);
      if (window.soundFX) window.soundFX.playFanfare();
      if (input) input.value = '';
      this.renderCommunityView();
    } catch (e) {
      console.error(e);
    }
  }

  openPostDoubtModal() {
    if (window.soundFX) window.soundFX.playClick();
    const modal = document.getElementById('post-doubt-modal');
    if (modal && typeof modal.showModal === 'function') modal.showModal();
  }

  async submitDoubt(e) {
    e.preventDefault();
    const subject = document.getElementById('doubt-subject-select')?.value;
    const title = document.getElementById('doubt-title-input')?.value.trim();
    const body = document.getElementById('doubt-body-input')?.value.trim();

    if (!title || !body) return;

    try {
      await window.api.createDoubt({ subject, title, body });
      if (window.soundFX) window.soundFX.playFanfare();
      if (typeof window.launchConfetti === 'function') window.launchConfetti(2500);
      document.getElementById('post-doubt-modal')?.close();
      document.getElementById('post-doubt-form')?.reset();
      this.renderCommunityView();
    } catch (err) {
      console.error(err);
      alert('Could not post your doubt. Please ensure you are logged in.');
    }
  }

  async solveDailyChallenge(optionIdx) {
    if (!this.currentDailyChallenge) return;
    const ch = this.currentDailyChallenge;
    const isCorrect = (optionIdx === ch.correct);

    const feedbackBox = document.getElementById('daily-challenge-feedback');
    if (!feedbackBox) return;

    feedbackBox.style.display = 'block';
    if (isCorrect) {
      if (window.soundFX) window.soundFX.playCorrect();
      if (typeof window.launchConfetti === 'function') window.launchConfetti(3000);
      feedbackBox.style.background = '#dcfce7';
      feedbackBox.style.color = '#166534';
      feedbackBox.style.border = '1px solid #86efac';
      feedbackBox.innerHTML = `<strong>🎉 Splendid deduction!</strong> ${ch.explanation}`;
      try {
        await window.api.solveDailyChallenge(optionIdx);
        this.user = await window.api.getMe();
        this.updateUserUI();
      } catch (e) {
        console.error(e);
      }
    } else {
      if (window.soundFX) window.soundFX.playWrong();
      feedbackBox.style.background = '#fee2e2';
      feedbackBox.style.color = '#991b1b';
      feedbackBox.style.border = '1px solid #fca5a5';
      feedbackBox.innerHTML = `<strong>💡 Good attempt!</strong> ${ch.explanation}`;
    }
  }
}

// Instantiate and initialize on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
