/**
 * Certificate Generator & Exporter for TalentHunt
 * Designed and Developed by Abhijit Kumar Misra.
 * ========================================================================== */
class CertificateRenderer {
  renderCertificateHtml(cert) {
    return `
      <div class="cert-gold-frame" id="printable-cert">
        <div style="text-align: center; margin-bottom: 20px;">
          <div class="cert-seal">🏆</div>
          <h2 style="font-family: Georgia, serif; font-size: 2.2rem; color: #17477f; margin: 8px 0 4px; letter-spacing: -0.5px;">
            Talent Hunt Academy
          </h2>
          <div style="font-size: 0.95rem; font-weight: 700; color: #f2a51e; text-transform: uppercase; letter-spacing: 1px;">
            Certificate of Academic Distinction • CBSE Class III
          </div>
        </div>

        <p style="text-align: center; color: #214b7c; font-style: italic; font-size: 1.1rem; margin: 15px 0 8px;">
          This official credential is honorably conferred upon
        </p>

        <div style="text-align: center; font-family: Georgia, serif; font-size: 2.5rem; font-weight: 700; color: #17477f; border-bottom: 2px solid #f2a51e; display: inline-block; padding: 0 40px 6px; margin: 0 auto 20px;">
          ${this.escapeHtml(cert.student_name)}
        </div>

        <p style="text-align: center; color: #214b7c; font-size: 1.05rem; line-height: 1.6; max-width: 580px; margin: 0 auto 25px;">
          for demonstrating conceptual mastery and outstanding analytical problem-solving in the<br>
          <strong style="color: #17477f; font-size: 1.2rem;">${this.escapeHtml(cert.exam_title)}</strong><br>
          attaining a final score of <strong style="color: #25a78b;">${cert.score} / ${cert.total_marks} (${cert.percentage}%)</strong>
        </p>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #f2a51e; padding-top: 20px; margin-top: 10px;">
          <div style="text-align: left;">
            <div style="width: 140px; border-bottom: 1.5px solid #17477f; margin-bottom: 4px;"></div>
            <p style="font-size: 0.85rem; color: #17477f; margin: 0;">
              <strong>Abhijit Kumar Misra</strong><br>
              <small style="color: #4e6a8d;">Founder &amp; Lead Architect</small>
            </p>
          </div>

          <div style="text-align: center;">
            <div style="display: inline-block; border: 2px solid #f2a51e; border-radius: 50px; padding: 4px 16px; font-size: 0.85rem; font-weight: 700; color: #17477f; background: #fffdf7;">
              ★ ${this.escapeHtml(cert.rank_tier || 'GOLD MERIT')} ★
            </div>
            <div style="font-size: 0.75rem; color: #4e6a8d; margin-top: 4px;">
              Credential ID: ${this.escapeHtml(cert.certificate_number || cert.id || 'TH-2026-CBSE')}
            </div>
          </div>

          <div style="text-align: right;">
            <div style="width: 140px; border-bottom: 1.5px solid #17477f; margin-bottom: 4px; margin-left: auto;"></div>
            <p style="font-size: 0.85rem; color: #17477f; margin: 0;">
              <strong>Date: ${this.escapeHtml(cert.issued_date || new Date().toLocaleDateString())}</strong><br>
              <small style="color: #4e6a8d;">Talent Hunt Academic Board</small>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  printCertificate() {
    window.print();
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.certRenderer = new CertificateRenderer();
