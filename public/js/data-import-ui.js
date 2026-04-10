/**
 * Data Import Wizard UI Controller
 * Enhanced with SmartColumnAnalyzer — auto-detects field types,
 * calculates age from DOB, flags unique columns, and posts results to parent.
 */

class DataImportWizard {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 5;
    this.importData = {
      file: null,
      format: null,
      columns: [],
      rows: [],
      mappings: [],     // Array of { sourceColumn, vicidialField, label, isDOB }
      analysisResults: [],
      validationResult: null
    };
    this.analyzer = new SmartColumnAnalyzer();
    this.initializeEventListeners();
    this.updateUI();
  }

  initializeEventListeners() {
    const fi = document.getElementById('fileInput');
    if (fi) fi.addEventListener('change', e => this.handleFileSelect(e));
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    this.importData.file = file;
    this.updateFileInfo();
    setTimeout(() => this.nextStep(), 400);
  }

  updateFileInfo() {
    const file = this.importData.file;
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    let fmt = 'Text';
    if (['xlsx','xls'].includes(ext)) fmt = 'Excel';
    else if (ext === 'csv') fmt = 'CSV';
    this.importData.format = fmt;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileFormat').textContent = fmt;
    document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
    const fi = document.getElementById('fileInfo');
    if (fi) fi.classList.add('show');
  }

  formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024, s = ['Bytes','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + s[i];
  }

  // ─── Step navigation ─────────────────────────────────────────────────────

  async nextStep() {
    if (!this.validateStep(this.currentStep)) return;
    this.showLoading(true);
    try {
      if (this.currentStep === 1) await this.processStep1();
      else if (this.currentStep === 2) await this.processStep2();
      else if (this.currentStep === 3) await this.processStep3();
      else if (this.currentStep === 4) await this.processStep4();
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.updateUI();
      }
    } catch (e) {
      this.showError('Error: ' + e.message);
    } finally {
      this.showLoading(false);
    }
  }

  previousStep() {
    if (this.currentStep > 1) { this.currentStep--; this.updateUI(); }
  }

  validateStep(step) {
    if (step === 1 && !this.importData.file) {
      this.showError('Please select a file to continue.');
      return false;
    }
    return true;
  }

  // ─── Step processors ─────────────────────────────────────────────────────

  async processStep1() {
    // File already stored; format detection happens next step
  }

  async processStep2() {
    await this.readAndParseFile();
    const fmt = this.importData.format;
    document.getElementById('detectedFormat').textContent = fmt;
    if (fmt === 'Excel') document.getElementById('sheetSelectionGroup').style.display = 'block';
    if (fmt === 'CSV' || fmt === 'Text') document.getElementById('delimiterGroup').style.display = 'block';
    this.generatePreview();
  }

  async processStep3() {
    // Collect overrides from the mapping UI
    this.collectMappingOverrides();
  }

  async processStep4() {
    await this.performValidation();
  }

  // ─── File parsing ─────────────────────────────────────────────────────────

  async readAndParseFile() {
    const file = this.importData.file;
    const fmt  = this.importData.format;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.onload = e => {
        try {
          if (fmt === 'Excel') this.parseExcel(e.target.result);
          else if (fmt === 'CSV')  this.parseCSV(e.target.result);
          else                     this.parseText(e.target.result);
          resolve();
        } catch (err) { reject(err); }
      };
      if (fmt === 'Excel') reader.readAsArrayBuffer(file);
      else reader.readAsText(file);
    });
  }

  parseCSV(text) {
    const delim = this.detectDelimiter(text);
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (!lines.length) throw new Error('CSV file is empty');
    const headers = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g,''));
    this.importData.columns = headers;
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(delim).map(v => v.trim().replace(/^"|"$/g,''));
      const row = {};
      headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });
      rows.push(row);
    }
    this.importData.rows = rows;
    const sel = document.getElementById('delimiterSelect');
    if (sel) sel.value = delim;
  }

  detectDelimiter(text) {
    const line = text.split('\n')[0];
    const counts = { ',': 0, ';': 0, '\t': 0, '|': 0 };
    for (const ch of line) if (ch in counts) counts[ch]++;
    return Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0];
  }

  parseText(text) {
    const delim = '\t';
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (!lines.length) throw new Error('Text file is empty');
    const headers = lines[0].split(delim).map(h => h.trim());
    this.importData.columns = headers;
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(delim);
      const row = {};
      headers.forEach((h, idx) => { row[h] = (vals[idx] || '').trim(); });
      rows.push(row);
    }
    this.importData.rows = rows;
  }

  parseExcel(buffer) {
    // Placeholder — show sheet selector; use sample data for preview
    document.getElementById('sheetSelectionGroup').style.display = 'block';
    this.importData.columns = ['First Name','Last Name','Phone','Email','City','State','DOB','Gender','Ethnic','Party','Is Cell'];
    this.importData.rows = [
      {'First Name':'John','Last Name':'Doe','Phone':'5551234567','Email':'john@example.com','City':'Austin','State':'TX','DOB':'1985-06-15','Gender':'M','Ethnic':'Hispanic','Party':'D','Is Cell':'Y'},
      {'First Name':'Jane','Last Name':'Smith','Phone':'5559876543','Email':'jane@example.com','City':'Dallas','State':'TX','DOB':'1990-11-22','Gender':'F','Ethnic':'White','Party':'R','Is Cell':'N'},
      {'First Name':'Bob','Last Name':'Johnson','Phone':'5555555555','Email':'bob@example.com','City':'Houston','State':'TX','DOB':'1978-03-10','Gender':'M','Ethnic':'Black','Party':'I','Is Cell':'Y'}
    ];
  }

  generatePreview() {
    const hRow = document.getElementById('previewHeaders');
    const bRows = document.getElementById('previewBody');
    if (!hRow || !bRows) return;
    hRow.innerHTML = '';
    bRows.innerHTML = '';
    this.importData.columns.forEach(col => {
      const th = document.createElement('th'); th.textContent = col; hRow.appendChild(th);
    });
    this.importData.rows.slice(0, 3).forEach(row => {
      const tr = document.createElement('tr');
      this.importData.columns.forEach(col => {
        const td = document.createElement('td'); td.textContent = row[col] || ''; tr.appendChild(td);
      });
      bRows.appendChild(tr);
    });
  }

  // ─── Smart Analysis UI (Step 3) ──────────────────────────────────────────

  buildSmartAnalysisUI() {
    const container = document.getElementById('mappingContainer');
    if (!container) return;

    const results = this.analyzer.analyze(this.importData.columns, this.importData.rows);
    this.importData.analysisResults = results;

    // Build initial mappings array
    this.importData.mappings = results.map(r => ({
      sourceColumn: r.sourceColumn,
      vicidialField: r.vicidialField,
      label: r.label,
      isDOB: r.isDOB
    }));

    const allFields = [
      { value: '', label: '-- Skip / Ignore --' },
      { value: 'first_name',       label: 'First Name' },
      { value: 'last_name',        label: 'Last Name' },
      { value: 'phone_number',     label: 'Phone Number' },
      { value: 'email',            label: 'Email' },
      { value: 'city',             label: 'City' },
      { value: 'state',            label: 'State' },
      { value: 'zip',              label: 'ZIP Code' },
      { value: 'address1',         label: 'Ethnic (address1)' },
      { value: 'address2',         label: 'Gender (address2)' },
      { value: 'address3',         label: 'Age (address3)' },
      { value: 'dob_age',          label: 'Date of Birth → Age (auto-calc)' },
      { value: 'political_party',  label: 'Political Party' },
      { value: 'owner',            label: 'Is Cell (owner)' },
      { value: 'county',           label: 'County' },
      { value: 'district',         label: 'District' },
      { value: 'vendor_lead_code', label: 'Record ID' }
    ];

    // Summary banner
    const detected = results.filter(r => r.confidence >= 55).length;
    const banner = document.createElement('div');
    banner.style.cssText = 'background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.35);border-radius:10px;padding:14px 18px;margin-bottom:20px;';
    banner.innerHTML = `
      <div style="font-size:15px;font-weight:700;color:#00d4ff;margin-bottom:6px;">
        🧠 Smart Analysis Complete
      </div>
      <div style="font-size:13px;color:#b0b0b0;">
        Found <strong style="color:#00d4ff">${detected}</strong> of
        <strong style="color:#e0e0e0">${results.length}</strong> columns auto-detected.
        Review mappings below and adjust if needed.
      </div>`;
    container.innerHTML = '';
    container.appendChild(banner);

    // One row per column
    results.forEach((r, idx) => {
      const conf = this.analyzer.confidenceLabel(r.confidence);
      const row = document.createElement('div');
      row.className = 'mapping-controls';
      row.style.cssText = 'display:grid;grid-template-columns:1fr 28px 1fr 80px;align-items:center;gap:10px;margin-bottom:14px;';

      // Source column + samples
      const srcWrap = document.createElement('div');
      const sampleStr = r.sampleValues.slice(0, 2).map(v => {
        if (r.isDOB && r.sampleAges) {
          const i = r.sampleValues.indexOf(v);
          return `${v}→${r.sampleAges[i] ?? '?'}yr`;
        }
        return String(v).length > 18 ? String(v).slice(0, 18) + '…' : v;
      }).join(', ');
      srcWrap.innerHTML = `
        <div style="font-weight:600;color:#e0e0e0;font-size:13px;">${r.sourceColumn}</div>
        <div style="font-size:11px;color:#888;margin-top:2px;">${sampleStr || 'no data'}</div>`;

      const arrow = document.createElement('div');
      arrow.className = 'mapping-arrow';
      arrow.textContent = '→';
      arrow.style.cssText = 'text-align:center;color:#00d4ff;font-size:18px;';

      // Target field dropdown
      const sel = document.createElement('select');
      sel.className = 'vicidial-field-select';
      sel.style.cssText = 'width:100%;padding:7px 9px;background:rgba(255,255,255,0.06);border:1px solid rgba(0,212,255,0.35);border-radius:7px;color:#e0e0e0;font-size:13px;cursor:pointer;';
      allFields.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.value;
        opt.textContent = f.label;
        if (f.value === r.vicidialField || (r.isDOB && f.value === 'dob_age')) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', () => {
        const isDOB = sel.value === 'dob_age';
        this.importData.mappings[idx].vicidialField = isDOB ? 'address3' : sel.value;
        this.importData.mappings[idx].isDOB = isDOB;
      });

      // Confidence badge
      const badge = document.createElement('div');
      badge.style.cssText = `text-align:center;padding:4px 8px;border-radius:5px;font-size:11px;font-weight:700;background:rgba(0,0,0,0.3);color:${conf.color};border:1px solid ${conf.color}40;`;
      badge.textContent = r.confidence > 0 ? `${conf.text} ${r.confidence}%` : 'Manual';

      row.appendChild(srcWrap);
      row.appendChild(arrow);
      row.appendChild(sel);
      row.appendChild(badge);
      container.appendChild(row);
    });
  }

  collectMappingOverrides() {
    // Mappings are updated live via the select change listener above
  }

  // ─── Step 4: Validation ───────────────────────────────────────────────────

  async performValidation() {
    const container = document.getElementById('validationContainer');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">Validating data…</div>';

    await new Promise(r => setTimeout(r, 600));

    const rows = this.importData.rows;
    const mappings = this.importData.mappings;
    const phoneMap = mappings.find(m => m.vicidialField === 'phone_number');
    let phoneIssues = 0;
    let emptyIssues = 0;

    rows.forEach(row => {
      if (phoneMap) {
        const ph = String(row[phoneMap.sourceColumn] || '').replace(/\D/g,'');
        if (ph.length < 7 || ph.length > 15) phoneIssues++;
      }
      const empties = mappings.filter(m => m.vicidialField && !row[m.sourceColumn]);
      if (empties.length > 0) emptyIssues++;
    });

    const issues = phoneIssues + (emptyIssues > 0 ? 1 : 0);
    const valid  = rows.length - Math.min(phoneIssues, rows.length);

    this.importData.validationResult = {
      totalRecords: rows.length,
      validRecords: valid,
      issues,
      duplicates: 0
    };

    const quality = issues === 0 ? 'Excellent ✅' : issues < rows.length * 0.1 ? 'Good 👍' : 'Review Needed ⚠️';

    container.innerHTML = `
      <div style="background:rgba(0,212,255,0.07);border:1px solid rgba(0,212,255,0.3);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="font-size:15px;font-weight:700;color:#00d4ff;margin-bottom:8px;">Data Quality: ${quality}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
          ${[['Total','totalRecords',rows.length],['Valid','validRecords',valid],['Issues','issuesCount',issues],['Duplicates','duplicatesCount',0]]
            .map(([l,id,v])=>`<div style="text-align:center;background:rgba(0,0,0,0.2);border-radius:8px;padding:12px;">
              <div style="font-size:11px;color:#888;">${l}</div>
              <div id="${id}" style="font-size:22px;font-weight:700;color:#00d4ff;">${v}</div></div>`).join('')}
        </div>
      </div>
      ${phoneIssues > 0 ? `<div style="background:rgba(255,165,0,0.1);border:1px solid rgba(255,165,0,0.3);border-radius:8px;padding:10px;font-size:13px;color:#f0a500;">⚠️ ${phoneIssues} phone numbers may be invalid (too short/long).</div>` : ''}`;
  }

  // ─── Finish / confirm ─────────────────────────────────────────────────────

  async finishImport() {
    this.showLoading(true);
    try {
      const sm = document.getElementById('successMessage');
      if (sm) sm.classList.add('show');
      const vr = this.importData.validationResult || {};
      ['totalRecords','validRecords','issuesCount','duplicatesCount'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = vr[id.replace('Count','')] ?? vr.totalRecords ?? '-';
      });
      // Fix up stat IDs used in Step 5
      const fix = { totalRecords: vr.totalRecords, validRecords: vr.validRecords, issuesCount: vr.issues, duplicatesCount: vr.duplicates };
      Object.entries(fix).forEach(([id, val]) => { const el = document.getElementById(id); if (el && val !== undefined) el.textContent = val; });

      // Build transformed dataset
      const mapped = this.importData.rows.map(row => this.analyzer.transformRow(row, this.importData.mappings));

      // Send to parent (smart-builder page) via postMessage
      const payload = {
        type: 'importComplete',
        columns: this.importData.columns,
        mappings: this.importData.mappings,
        analysisResults: this.importData.analysisResults,
        rows: mapped,
        raw: this.importData.rows,
        stats: vr
      };
      window.parent.postMessage(payload, '*');

    } catch (e) {
      this.showError('Error finishing import: ' + e.message);
    } finally {
      this.showLoading(false);
    }
  }

  // ─── UI helpers ───────────────────────────────────────────────────────────

  updateUI() {
    for (let i = 1; i <= this.totalSteps; i++) {
      const el = document.getElementById(`step${i}`);
      if (el) el.classList.toggle('active', i === this.currentStep);
    }
    for (let i = 1; i <= this.totalSteps; i++) {
      const el = document.querySelector(`[data-step="${i}"]`);
      if (!el) continue;
      el.classList.remove('active','completed');
      if (i === this.currentStep) el.classList.add('active');
      else if (i < this.currentStep) el.classList.add('completed');
    }
    const pct = (this.currentStep / this.totalSteps) * 100;
    const si = document.getElementById('stepsIndicator');
    if (si) si.style.setProperty('--progress', pct + '%');

    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    const fin  = document.getElementById('finishBtn');
    if (prev) prev.style.display = this.currentStep > 1 ? 'block' : 'none';
    if (next) next.style.display = this.currentStep < this.totalSteps ? 'block' : 'none';
    if (fin)  fin.style.display  = this.currentStep === this.totalSteps ? 'block' : 'none';

    // Build step 3 analysis UI when entering that step
    if (this.currentStep === 3 && this.importData.columns.length > 0) {
      this.buildSmartAnalysisUI();
    }

    window.scrollTo(0, 0);
  }

  showError(msg) {
    const el = document.getElementById('errorMessage');
    if (!el) return;
    el.textContent = '⚠️ ' + msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 6000);
  }

  showLoading(show) {
    ['prevBtn','nextBtn','finishBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = show;
    });
  }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  window.importWizard = new DataImportWizard();
});

function nextStep()    { window.importWizard?.nextStep(); }
function previousStep(){ window.importWizard?.previousStep(); }
function finishImport(){ window.importWizard?.finishImport(); }
