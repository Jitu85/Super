/**
 * Certificate & Parent Report Card Generator & Exporter for TalentHunt
 * Designed and Developed by Abhijit Kumar Misra.
 * ========================================================================== */
class CertificateRenderer {

  /**
   * Render High-Fidelity Official Diploma Certificate HTML
   */
  renderCertificateHtml(cert) {
    const studentName = this.escapeHtml(cert.student_name || 'Champion Learner');
    const examTitle = this.escapeHtml(cert.exam_title || 'Academic & Olympiad Distinction');
    const rankTier = this.escapeHtml(cert.rank_tier || '★ GOLD MERIT DISTINCTION ★');
    const certNum = this.escapeHtml(cert.certificate_number || cert.id || 'TH-2026-CERT');
    const issueDate = this.escapeHtml(cert.issued_date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
    const scoreText = (cert.score !== undefined && cert.total_marks)
      ? `${cert.score} / ${cert.total_marks} (${cert.percentage || Math.round((cert.score / cert.total_marks) * 100)}%)`
      : `${cert.percentage || 95}% Cumulative Mastery`;

    return `
      <div class="cert-gold-frame" id="printable-cert">
        <div class="cert-corner-ornament cert-top-left">❦</div>
        <div class="cert-corner-ornament cert-top-right">❦</div>
        <div class="cert-corner-ornament cert-bottom-left">❧</div>
        <div class="cert-corner-ornament cert-bottom-right">❧</div>

        <!-- Certificate Header -->
        <div class="cert-header">
          <div class="cert-seal">
            <span class="cert-seal-star">⭐</span>
          </div>
          <h1 class="cert-institution-title">TalentHunt Academy of Excellence</h1>
          <p class="cert-institution-sub">National Olympiad &amp; Academic Curriculum Foundation &bull; Classes III to X</p>
          <div class="cert-divider-line">
            <span>❦ ══════════════ ❀ ══════════════ ❧</span>
          </div>
          <h2 class="cert-diploma-title">Certificate of Scholastic Merit &amp; Distinction</h2>
        </div>

        <!-- Citation Body -->
        <p class="cert-conferred-text">This official credential of excellence is honorably conferred upon</p>

        <div class="cert-recipient-name">
          ${studentName}
        </div>

        <p class="cert-citation-body">
          for demonstrating exceptional conceptual rigor, critical problem-solving skills, and disciplined academic mastery in
          <br>
          <strong class="cert-exam-name">${examTitle}</strong>
          <br>
          achieving an evaluated performance metric of <strong class="cert-score-highlight">${scoreText}</strong>.
        </p>

        <!-- Rank Tier Pill -->
        <div class="cert-rank-wrapper">
          <span class="cert-rank-pill">${rankTier}</span>
        </div>

        <!-- Signatures & Verification Seal -->
        <div class="cert-footer-row">
          <div class="cert-sig-block">
            <div class="cert-sig-line">
              <span class="cert-signature-script">Abhijit Kumar Misra</span>
            </div>
            <strong class="cert-sig-name">Abhijit Kumar Misra</strong>
            <span class="cert-sig-role">Author &amp; Lead Curriculum Architect</span>
          </div>

          <div class="cert-medallion-block">
            <div class="cert-gold-medallion">
              <span>★ TH ★<br><small>VERIFIED</small></span>
            </div>
            <div class="cert-credential-id">Credential ID: <strong>${certNum}</strong></div>
          </div>

          <div class="cert-sig-block cert-sig-right">
            <div class="cert-sig-line">
              <span class="cert-signature-stamp">Academic Evaluation Board</span>
            </div>
            <strong class="cert-sig-name">TalentHunt Governing Council</strong>
            <span class="cert-sig-role">Conferred on: ${issueDate}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Comprehensive Institutional Parent Progress Report Card HTML
   */
  renderParentReportHtml(report) {
    const student = report.student || {};
    const metrics = report.metrics || {};
    const subjects = report.subjects || [];
    const recommendations = report.recommendations || [];
    const reportId = this.escapeHtml(report.report_id || 'TH-REP-2026-001');
    const evalDate = this.escapeHtml(report.evaluation_date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));

    const subjectRows = subjects.map(s => `
      <tr>
        <td class="table-subject-cell">
          <span class="table-sub-icon">${s.icon || '📘'}</span>
          <strong>${this.escapeHtml(s.subject)}</strong>
        </td>
        <td class="text-center">${s.questions_attempted || 0} Qs</td>
        <td class="text-center">
          <div class="report-table-bar-wrap">
            <span>${s.accuracy}%</span>
            <div class="report-mini-track">
              <div class="report-mini-fill" style="width: ${s.accuracy}%; background: ${s.accuracy >= 80 ? '#10b981' : s.accuracy >= 60 ? '#f59e0b' : '#ef4444'};"></div>
            </div>
          </div>
        </td>
        <td class="text-center">
          <span class="report-pill ${s.accuracy >= 85 ? 'pill-gold' : s.accuracy >= 70 ? 'pill-green' : 'pill-amber'}">
            ${this.escapeHtml(s.grade_pill || 'Proficient')}
          </span>
        </td>
        <td class="table-remark-cell">${this.escapeHtml(s.remark || 'Consistent engagement with core curriculum.')}</td>
      </tr>
    `).join('');

    const recList = recommendations.map(r => `
      <li><span class="rec-bullet">✓</span> ${this.escapeHtml(r)}</li>
    `).join('');

    return `
      <div class="parent-report-card" id="printable-report-card">
        
        <!-- Header Institution Strip -->
        <div class="report-header-banner">
          <div class="report-brand-lockup">
            <div class="report-crest">🏛️</div>
            <div>
              <h2 class="report-inst-title">TALENTHUNT ACADEMIC &amp; OLYMPIAD FOUNDATION</h2>
              <span class="report-inst-sub">Continuous Learning Assessment &bull; Comprehensive Performance Evaluation</span>
            </div>
          </div>
          <div class="report-meta-tag">
            <span class="report-badge-pill">OFFICIAL REPORT</span>
            <small>Report ID: <strong>${reportId}</strong></small>
            <small>Date: ${evalDate}</small>
          </div>
        </div>

        <div class="report-divider-rule"></div>

        <!-- Student Identity Grid -->
        <div class="report-student-meta-grid">
          <div class="report-meta-cell">
            <span class="meta-label">Student Full Name</span>
            <strong class="meta-val highlight-gold">${this.escapeHtml(student.name || 'Student Champion')}</strong>
          </div>
          <div class="report-meta-cell">
            <span class="meta-label">Enrolled Standard</span>
            <strong class="meta-val">${this.escapeHtml(student.grade || 'Class 3')} (${this.escapeHtml(student.division || 'General')})</strong>
          </div>
          <div class="report-meta-cell">
            <span class="meta-label">Institutional Affiliation</span>
            <strong class="meta-val">${this.escapeHtml(student.school || 'TalentHunt Scholar Academy')}</strong>
          </div>
          <div class="report-meta-cell">
            <span class="meta-label">Student User ID</span>
            <strong class="meta-val">${this.escapeHtml(student.username || 'student')}</strong>
          </div>
        </div>

        <!-- 4 Core Performance KPI Cards -->
        <div class="report-kpi-grid">
          <div class="report-kpi-card">
            <div class="kpi-icon">📝</div>
            <div class="kpi-info">
              <span class="kpi-title">Questions Practiced</span>
              <strong class="kpi-number">${metrics.total_questions || 0}</strong>
              <small class="kpi-sub">Across curriculum &amp; mocks</small>
            </div>
          </div>

          <div class="report-kpi-card">
            <div class="kpi-icon">🎯</div>
            <div class="kpi-info">
              <span class="kpi-title">Overall Accuracy</span>
              <strong class="kpi-number text-green">${metrics.overall_accuracy || 0}%</strong>
              <small class="kpi-sub">${this.escapeHtml(metrics.overall_grade || 'High Distinction')}</small>
            </div>
          </div>

          <div class="report-kpi-card">
            <div class="kpi-icon">🔥</div>
            <div class="kpi-info">
              <span class="kpi-title">Study Flame Streak</span>
              <strong class="kpi-number text-amber">${student.streak_days || 1} Day${student.streak_days === 1 ? '' : 's'}</strong>
              <small class="kpi-sub">Unbroken study discipline</small>
            </div>
          </div>

          <div class="report-kpi-card">
            <div class="kpi-icon">⭐</div>
            <div class="kpi-info">
              <span class="kpi-title">Academic Capital</span>
              <strong class="kpi-number text-gold">${student.xp || 0} XP</strong>
              <small class="kpi-sub">${student.stars || 0} Excellence Stars</small>
            </div>
          </div>
        </div>

        <!-- Subject-Wise Curriculum Mastery Table -->
        <div class="report-section-block">
          <h3 class="report-section-heading">📚 Curriculum Subject Mastery &amp; Competency Breakdown</h3>
          <div class="report-table-responsive">
            <table class="report-data-table">
              <thead>
                <tr>
                  <th>Academic Domain</th>
                  <th class="text-center">Workload</th>
                  <th class="text-center" style="min-width: 140px;">Accuracy</th>
                  <th class="text-center">Performance Level</th>
                  <th>Pedagogical Remarks &amp; Observations</th>
                </tr>
              </thead>
              <tbody>
                ${subjectRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cognitive Habits & Exam Integrity Grid -->
        <div class="report-habits-grid">
          <div class="habit-card">
            <span class="habit-icon">🛡️</span>
            <div>
              <strong>Exam Proctoring Integrity:</strong>
              <span>${this.escapeHtml(metrics.integrity_rating || '100% (Flawless)')}</span>
              <p class="habit-desc">Student maintained disciplined tab-focus and ethical examination adherence during assessments.</p>
            </div>
          </div>

          <div class="habit-card">
            <span class="habit-icon">⏱️</span>
            <div>
              <strong>Average Solving Cadence:</strong>
              <span>${metrics.avg_speed_seconds || 42} seconds / question</span>
              <p class="habit-desc">Well-balanced cognitive pacing indicating thoughtful reading of problem stems before answering.</p>
            </div>
          </div>
        </div>

        <!-- Pedagogical Recommendations For Parents -->
        <div class="report-section-block report-rec-box">
          <h3 class="report-section-heading" style="color: #1e3a8a; border-bottom: none; margin-bottom: 8px;">
            💡 Actionable Guidance for Parents &amp; Mentors
          </h3>
          <ul class="report-rec-list">
            ${recList}
          </ul>
        </div>

        <!-- Signatures & Verification Seal -->
        <div class="report-signatures-container">
          <div class="report-sig-box">
            <div class="report-sig-line">
              <span class="sig-script">Abhijit Kumar Misra</span>
            </div>
            <strong>Abhijit Kumar Misra</strong>
            <span>Chief Academic Architect, TalentHunt</span>
          </div>

          <div class="report-seal-center">
            <div class="report-official-stamp">
              <span>TALENTHUNT<br>ACADEMIC SEAL<br>★ 2026 ★</span>
            </div>
          </div>

          <div class="report-sig-box report-sig-parent">
            <div class="report-sig-line dashed">
              <span class="sig-placeholder">Parent / Guardian Signature</span>
            </div>
            <strong>Parent / Guardian Endorsement</strong>
            <span>Date: ________________________</span>
          </div>
        </div>

      </div>
    `;
  }

  /**
   * High-Resolution Print Trigger for Certificate
   */
  printCertificate() {
    document.body.classList.remove('printing-report');
    document.body.classList.add('printing-cert');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-cert');
    }, 1500);
  }

  /**
   * High-Resolution Print Trigger for Parent Report Card
   */
  printReportCard() {
    document.body.classList.remove('printing-cert');
    document.body.classList.add('printing-report');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-report');
    }, 1500);
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
}

window.certRenderer = new CertificateRenderer();
