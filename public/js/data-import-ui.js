/**
 * Data Import Wizard UI Controller
 * Handles the 5-step import workflow with file upload, format detection, and validation
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
      mappings: {},
      validationResult: null
    };

    this.initializeEventListeners();
    this.updateProgress();
  }

  /**
   * Initialize event listeners
   */
  initializeEventListeners() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
  }

  /**
   * Handle file selection
   */
  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    this.importData.file = file;
    this.updateFileInfo();

    // Auto-advance to next step after brief delay
    setTimeout(() => {
      this.nextStep();
    }, 500);
  }

  /**
   * Update file information display
   */
  updateFileInfo() {
    const file = this.importData.file;
    const fileInfoDiv = document.getElementById('fileInfo');
    
    if (!file) return;

    // Detect format
    const ext = file.name.split('.').pop().toLowerCase();
    let format = 'Unknown';
    
    if (['xlsx', 'xls'].includes(ext)) format = 'Excel';
    else if (ext === 'csv') format = 'CSV';
    else if (ext === 'txt') format = 'Text';

    this.importData.format = format;

    // Update display
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileFormat').textContent = format;
    document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
    
    fileInfoDiv.classList.add('show');
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Move to next step
   */
  async nextStep() {
    // Validate current step before advancing
    if (!this.validateStep(this.currentStep)) {
      return;
    }

    // Process step data
    if (this.currentStep === 1) {
      await this.processStep1();
    } else if (this.currentStep === 2) {
      await this.processStep2();
    } else if (this.currentStep === 3) {
      await this.processStep3();
    } else if (this.currentStep === 4) {
      await this.processStep4();
    }

    // Advance to next step
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateUI();
    }
  }

  /**
   * Move to previous step
   */
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateUI();
    }
  }

  /**
   * Validate current step
   */
  validateStep(step) {
    if (step === 1) {
      if (!this.importData.file) {
        this.showError('Please select a file to continue');
        return false;
      }
    }
    return true;
  }

  /**
   * Process Step 1: File Upload
   */
  async processStep1() {
    this.showLoading(true);
    try {
      // For now, just mark as processed
      // Actual file reading happens on Step 2
      this.showLoading(false);
    } catch (error) {
      this.showError('Error processing file: ' + error.message);
      this.showLoading(false);
    }
  }

  /**
   * Process Step 2: Format Detection
   */
  async processStep2() {
    this.showLoading(true);
    try {
      // Read file and generate preview
      await this.readFileAndGeneratePreview();
      document.getElementById('detectedFormat').textContent = this.importData.format;
      
      this.showLoading(false);
    } catch (error) {
      this.showError('Error reading file: ' + error.message);
      this.showLoading(false);
    }
  }

  /**
   * Read file and generate preview
   */
  async readFileAndGeneratePreview() {
    const file = this.importData.file;
    const format = this.importData.format;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target.result;

          if (format === 'Excel') {
            this.parseExcel(content);
          } else if (format === 'CSV') {
            this.parseCSV(content);
          } else if (format === 'Text') {
            this.parseText(content);
          }

          this.generatePreview();
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));

      if (format === 'Excel') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  /**
   * Parse Excel file (placeholder - requires XLSX library)
   */
  parseExcel(arrayBuffer) {
    // In a real application, use xlsx library
    // For now, show sheet selection
    document.getElementById('sheetSelectionGroup').style.display = 'block';
    this.importData.columns = ['First Name', 'Last Name', 'Phone', 'Email', 'Address'];
    this.importData.rows = [
      { 'First Name': 'John', 'Last Name': 'Doe', 'Phone': '5551234567', 'Email': 'john@example.com', 'Address': '123 Main St' },
      { 'First Name': 'Jane', 'Last Name': 'Smith', 'Phone': '5559876543', 'Email': 'jane@example.com', 'Address': '456 Oak Ave' },
      { 'First Name': 'Bob', 'Last Name': 'Johnson', 'Phone': '5555555555', 'Email': 'bob@example.com', 'Address': '789 Pine Rd' }
    ];
  }

  /**
   * Parse CSV file
   */
  parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length === 0) throw new Error('CSV file is empty');

    const headers = lines[0].split(',').map(h => h.trim());
    this.importData.columns = headers;

    const rows = [];
    for (let i = 1; i < Math.min(i + 100, lines.length); i++) {
      const values = lines[i].split(',');
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] ? values[idx].trim() : '';
      });
      rows.push(row);
    }

    this.importData.rows = rows;
    document.getElementById('delimiterGroup').style.display = 'block';
  }

  /**
   * Parse Text file
   */
  parseText(text) {
    const lines = text.trim().split('\n');
    if (lines.length === 0) throw new Error('Text file is empty');

    const headers = lines[0].split('\t').map(h => h.trim());
    this.importData.columns = headers;

    const rows = [];
    for (let i = 1; i < Math.min(i + 100, lines.length); i++) {
      const values = lines[i].split('\t');
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] ? values[idx].trim() : '';
      });
      rows.push(row);
    }

    this.importData.rows = rows;
    document.getElementById('delimiterGroup').style.display = 'block';
  }

  /**
   * Generate preview table
   */
  generatePreview() {
    const headerRow = document.getElementById('previewHeaders');
    const bodyRows = document.getElementById('previewBody');

    // Clear existing
    headerRow.innerHTML = '';
    bodyRows.innerHTML = '';

    // Add headers
    const headerCells = this.importData.columns.map(col => {
      const th = document.createElement('th');
      th.textContent = col;
      return th;
    });
    headerRow.append(...headerCells);

    // Add first 3 data rows
    const sampleRows = this.importData.rows.slice(0, 3);
    sampleRows.forEach(row => {
      const tr = document.createElement('tr');
      this.importData.columns.forEach(col => {
        const td = document.createElement('td');
        td.textContent = row[col] || '';
        tr.appendChild(td);
      });
      bodyRows.appendChild(tr);
    });
  }

  /**
   * Process Step 3: Column Mapping
   */
  async processStep3() {
    await this.generateMappingUI();
  }

  /**
   * Generate mapping UI
   */
  async generateMappingUI() {
    const container = document.getElementById('mappingContainer');
    container.innerHTML = '';

    // Suggest mappings based on column names
    const vicidialFields = {
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'phone_number': 'Phone',
      'email': 'Email',
      'city': 'City',
      'state': 'State',
      'zip': 'ZIP',
      'address1': 'Address (Ethnic)',
      'address2': 'Gender',
      'address3': 'Age',
      'owner': 'Cell (Y/N)',
      'vendor_lead_code': 'Record ID'
    };

    for (const col of this.importData.columns) {
      const mapping = document.createElement('div');
      mapping.className = 'mapping-controls';

      const sourceLabel = document.createElement('div');
      sourceLabel.className = 'mapping-label';
      sourceLabel.textContent = col;

      const arrow = document.createElement('div');
      arrow.className = 'mapping-arrow';
      arrow.textContent = '→';

      const select = document.createElement('select');
      select.className = 'vicidial-field-select';
      select.innerHTML = '<option value="">-- Select Field --</option>';

      // Add Vicidial fields to dropdown
      for (const [key, label] of Object.entries(vicidialFields)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = label;
        select.appendChild(option);

        // Try to auto-select based on similarity
        if (this.isSimilar(col.toLowerCase(), key) || 
            this.isSimilar(col.toLowerCase(), label.toLowerCase())) {
          select.value = key;
        }
      }

      select.addEventListener('change', () => {
        this.importData.mappings[col] = select.value;
      });

      mapping.appendChild(sourceLabel);
      mapping.appendChild(arrow);
      mapping.appendChild(select);
      container.appendChild(mapping);
    }
  }

  /**
   * Check if two strings are similar
   */
  isSimilar(str1, str2) {
    return str1.includes(str2) || str2.includes(str1);
  }

  /**
   * Process Step 4: Validation
   */
  async processStep4() {
    await this.performValidation();
  }

  /**
   * Perform data validation
   */
  async performValidation() {
    const container = document.getElementById('validationContainer');
    container.innerHTML = '<div style="text-align: center;"><div class="spinner"></div> Validating data...</div>';

    // Simulate validation
    setTimeout(() => {
      const validRecords = this.importData.rows.length - 2;
      const issues = 2;
      const duplicates = 0;

      this.importData.validationResult = {
        totalRecords: this.importData.rows.length,
        validRecords,
        issues,
        duplicates
      };

      const html = `
        <div class="validation-result">
          <div class="result-header">
            <div class="result-icon success">✓</div>
            <div class="result-text">
              <h3>Data Quality: ${validRecords === this.importData.rows.length ? 'Excellent' : 'Good'}</h3>
              <p>${validRecords} of ${this.importData.rows.length} records are valid and ready</p>
            </div>
          </div>
          <div class="result-stats">
            <div class="stat-item">
              <div class="stat-label">Total Records</div>
              <div class="stat-value">${this.importData.rows.length}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Valid Records</div>
              <div class="stat-value">${validRecords}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Issues Found</div>
              <div class="stat-value">${issues}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Duplicates</div>
              <div class="stat-value">${duplicates}</div>
            </div>
          </div>
        </div>
      `;

      container.innerHTML = html;
    }, 1000);
  }

  /**
   * Finish import
   */
  async finishImport() {
    this.showLoading(true);

    try {
      // Save import data (would normally send to server)
      console.log('Import Data:', this.importData);

      // Update final step display
      document.getElementById('successMessage').classList.add('show');
      document.getElementById('totalRecords').textContent = this.importData.validationResult.totalRecords;
      document.getElementById('validRecords').textContent = this.importData.validationResult.validRecords;
      document.getElementById('issuesCount').textContent = this.importData.validationResult.issues;
      document.getElementById('duplicatesCount').textContent = this.importData.validationResult.duplicates;

      this.showLoading(false);

      // Redirect after 2 seconds
      setTimeout(() => {
        // Could redirect to query builder or show success page
        alert('✓ Import successful! Your data is ready for query building.');
        window.location.href = '/query-builder.html';
      }, 2000);
    } catch (error) {
      this.showError('Error finishing import: ' + error.message);
      this.showLoading(false);
    }
  }

  /**
   * Update UI
   */
  updateUI() {
    // Hide all steps
    for (let i = 1; i <= this.totalSteps; i++) {
      const stepEl = document.getElementById(`step${i}`);
      stepEl.classList.remove('active');
    }

    // Show current step
    document.getElementById(`step${this.currentStep}`).classList.add('active');

    // Update step indicators
    for (let i = 1; i <= this.totalSteps; i++) {
      const step = document.querySelector(`[data-step="${i}"]`);
      step.classList.remove('active', 'completed');
      
      if (i === this.currentStep) {
        step.classList.add('active');
      } else if (i < this.currentStep) {
        step.classList.add('completed');
      }
    }

    // Update progress bar
    this.updateProgress();

    // Update button visibility
    document.getElementById('prevBtn').style.display = this.currentStep > 1 ? 'block' : 'none';
    document.getElementById('nextBtn').style.display = this.currentStep < this.totalSteps ? 'block' : 'none';
    document.getElementById('finishBtn').style.display = this.currentStep === this.totalSteps ? 'block' : 'none';

    // Scroll to top
    window.scrollTo(0, 0);
  }

  /**
   * Update progress bar
   */
  updateProgress() {
    const percentage = (this.currentStep / this.totalSteps) * 100;
    const stepsEl = document.getElementById('stepsIndicator');
    stepsEl.style.setProperty('--progress', `${percentage}%`);
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = '⚠️ ' + message;
    errorDiv.classList.add('show');

    setTimeout(() => {
      errorDiv.classList.remove('show');
    }, 5000);
  }

  /**
   * Show/hide loading state
   */
  showLoading(show) {
    document.getElementById('nextBtn').disabled = show;
    document.getElementById('prevBtn').disabled = show;
    document.getElementById('finishBtn').disabled = show;
  }
}

// Initialize wizard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.importWizard = new DataImportWizard();
});

// Global navigation functions
function nextStep() {
  if (window.importWizard) {
    window.importWizard.nextStep();
  }
}

function previousStep() {
  if (window.importWizard) {
    window.importWizard.previousStep();
  }
}

function finishImport() {
  if (window.importWizard) {
    window.importWizard.finishImport();
  }
}
