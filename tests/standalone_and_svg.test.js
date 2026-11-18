const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { dbAdapter } = require('../src/db/database');

describe('Standalone Masterclasses and Asset Rendering Integrity', () => {
  it('should verify standalone masterclasses structure in content.js', () => {
    const contentJs = fs.readFileSync(path.join(__dirname, '..', 'src', 'routes', 'content.js'), 'utf8');
    assert.ok(contentJs.includes("id: 'vedic-maths'"), 'content.js must define vedic-maths');
    assert.ok(contentJs.includes("id: 'english-grammar'"), 'content.js must define english-grammar');
    assert.ok(contentJs.includes('/standalone-courses'), 'content.js must have /standalone-courses route');
    assert.ok(contentJs.includes('/vedic'), 'content.js must have /vedic route');
    assert.ok(contentJs.includes('/grammar'), 'content.js must have /grammar route');
  });

  it('should verify CBSE classes (3 to 10) do not contain legacy vedic-class or grammar-class', () => {
    const contentJs = fs.readFileSync(path.join(__dirname, '..', 'src', 'routes', 'content.js'), 'utf8');
    for (let g = 3; g <= 10; g++) {
      assert.ok(!contentJs.includes(`id: 'vedic-class${g}'`), `Class ${g} must not contain vedic-class${g}`);
      assert.ok(!contentJs.includes(`id: 'grammar-class${g}'`), `Class ${g} must not contain grammar-class${g}`);
    }
  });

  it('should verify Class 3 curriculum has Aptitude & Reasoning', () => {
    const contentJs = fs.readFileSync(path.join(__dirname, '..', 'src', 'routes', 'content.js'), 'utf8');
    assert.ok(contentJs.includes("id: 'aptitude-class3'"), 'Class 3 must include aptitude-class3');
  });

  it('should verify subjects table in database has vedic-maths and english-grammar with grade null', async () => {
    const vedic = await dbAdapter.queryOne("SELECT * FROM subjects WHERE id = 'vedic-maths'");
    assert.ok(vedic, 'vedic-maths subject must exist in database');
    assert.strictEqual(vedic.grade, null, 'vedic-maths grade must be null (universal)');

    const grammar = await dbAdapter.queryOne("SELECT * FROM subjects WHERE id = 'english-grammar'");
    assert.ok(grammar, 'english-grammar subject must exist in database');
    assert.strictEqual(grammar.grade, null, 'english-grammar grade must be null (universal)');
  });

  it('should verify 8.svg and 12.svg have valid XML without unquoted href= xlink:href', () => {
    const svgs = [
      'public/assets/questions/8.svg',
      'public/assets/questions/12.svg',
      'public/assets/options/8_A.svg',
      'public/assets/options/12_A.svg',
      'public/assets/options/1424_D.svg'
    ];
    for (const file of svgs) {
      const p = path.join(__dirname, '..', file);
      const text = fs.readFileSync(p, 'utf8');
      assert.ok(!text.includes('href= xlink:href'), `${file} must not contain malformed href= xlink:href`);
      assert.ok(!text.includes('href= '), `${file} must not contain unquoted href=`);
      assert.ok(text.includes('</svg>'), `${file} must be closed svg`);
    }
  });
});
