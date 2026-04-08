/**
 * Data Validator
 * Validates imported data for quality, completeness, and dialability
 */

const validator = require('validator');

class DataValidator {
  constructor() {
    this.validationRules = {
      required: [],
      email: [],
      phone: [],
      age: [],
      state: [],
      zip: [],
      custom: []
    };

    this.validationResults = {
      isValid: true,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      issues: [],
      byRowNumber: {},
      summary: {}
    };

    // US State codes for validation
    this.usStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    // Canadian Provinces
    this.canadianProvinces = [
      'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
    ];

    this.allRegions = [...this.usStates, ...this.canadianProvinces];
  }

  /**
   * Validate a phone number for dialing (basic format check)
   */
  isDialable(phoneNumber) {
    if (!phoneNumber) return false;

    // Remove common formatting characters
    const cleaned = phoneNumber.toString().replace(/[\s\-\(\)\.]/g, '');

    // Check if it contains only digits
    if (!/^\d+$/.test(cleaned)) {
      return false;
    }

    // Must be at least 10 digits (US/Canada standard)
    if (cleaned.length < 10) {
      return false;
    }

    // Should not exceed 15 digits (international standard)
    if (cleaned.length > 15) {
      return false;
    }

    return true;
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    if (!email) return false;
    return validator.isEmail(email);
  }

  /**
   * Validate age
   */
  isValidAge(age) {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 0 && ageNum <= 150;
  }

  /**
   * Validate state/province code
   */
  isValidState(state) {
    if (!state) return false;
    return this.allRegions.includes(state.toUpperCase());
  }

  /**
   * Validate ZIP code (US or Canadian postal code)
   */
  isValidZip(zip) {
    if (!zip) return false;
    const zipStr = zip.toString().toUpperCase();

    // US ZIP code: 5 or 9 digits
    if (/^\d{5}(-\d{4})?$/.test(zipStr)) {
      return true;
    }

    // Canadian postal code: A1A 1A1 format
    if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(zipStr)) {
      return true;
    }

    return false;
  }

  /**
   * Validate owner (cell phone indicator)
   */
  isValidOwner(value) {
    if (!value) return false;
    const str = value.toString().toUpperCase();
    return ['Y', 'N', 'Y ', 'N ', 'Y  '].includes(str);
  }

  /**
   * Validate gender
   */
  isValidGender(value) {
    if (!value) return false;
    const str = value.toString().toUpperCase();
    return ['M', 'F', 'U', 'O', 'MALE', 'FEMALE', 'UNKNOWN', 'OTHER'].includes(str);
  }

  /**
   * Validate a single row
   */
  validateRow(row, rowNumber, mappings = {}) {
    const issues = [];

    // Check required fields
    if (this.validationRules.required.length > 0) {
      for (const field of this.validationRules.required) {
        if (!row[field] || row[field].toString().trim() === '') {
          issues.push({
            type: 'missing_required',
            field,
            message: `Required field "${field}" is empty`
          });
        }
      }
    }

    // Validate specific field types
    if (row.phone_number && !this.isDialable(row.phone_number)) {
      issues.push({
        type: 'invalid_phone',
        field: 'phone_number',
        value: row.phone_number,
        message: `Phone number "${row.phone_number}" is not dialable`
      });
    }

    if (row.email && !this.isValidEmail(row.email)) {
      issues.push({
        type: 'invalid_email',
        field: 'email',
        value: row.email,
        message: `Email "${row.email}" is not valid format`
      });
    }

    if (row.age && !this.isValidAge(row.age)) {
      issues.push({
        type: 'invalid_age',
        field: 'age',
        value: row.age,
        message: `Age "${row.age}" is outside valid range (0-150)`
      });
    }

    if (row.state && !this.isValidState(row.state)) {
      issues.push({
        type: 'invalid_state',
        field: 'state',
        value: row.state,
        message: `State/Province "${row.state}" not recognized`
      });
    }

    if (row.zip && !this.isValidZip(row.zip)) {
      issues.push({
        type: 'invalid_zip',
        field: 'zip',
        value: row.zip,
        message: `ZIP code "${row.zip}" is not valid format`
      });
    }

    if (row.owner && !this.isValidOwner(row.owner)) {
      issues.push({
        type: 'invalid_owner',
        field: 'owner',
        value: row.owner,
        message: `Owner field must be Y, N, or Y with spaces`
      });
    }

    if (row.address2 && !this.isValidGender(row.address2)) {
      issues.push({
        type: 'invalid_gender',
        field: 'address2',
        value: row.address2,
        message: `Gender value "${row.address2}" not recognized`
      });
    }

    return {
      isValid: issues.length === 0,
      rowNumber,
      issues
    };
  }

  /**
   * Validate entire dataset
   */
  validate(rows, options = {}) {
    this.validationResults = {
      isValid: true,
      totalRows: rows.length,
      validRows: 0,
      invalidRows: 0,
      issues: [],
      byRowNumber: {},
      duplicates: [],
      nonDialable: [],
      summary: {}
    };

    const seenPhones = new Set();
    const seenCombos = new Set(); // name + phone combinations

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const validation = this.validateRow(row, i + 1); // 1-indexed for user display

      // Check for duplicates
      if (row.phone_number) {
        const phone = row.phone_number.toString().replace(/\D/g, '');
        
        if (seenPhones.has(phone)) {
          validation.issues.push({
            type: 'duplicate_phone',
            field: 'phone_number',
            value: row.phone_number,
            message: `Phone number already exists in dataset`
          });
          this.validationResults.duplicates.push({
            rowNumber: i + 1,
            phone: row.phone_number,
            name: `${row.first_name || ''} ${row.last_name || ''}`.trim()
          });
        }
        seenPhones.add(phone);

        // Check name + phone combo
        const namePhoneCombo = `${row.first_name || ''}|${row.last_name || ''}|${phone}`;
        if (seenCombos.has(namePhoneCombo)) {
          validation.issues.push({
            type: 'duplicate_combo',
            message: `Duplicate record (name + phone combination)`
          });
        }
        seenCombos.add(namePhoneCombo);
      }

      // Check dialability
      if (row.phone_number && !this.isDialable(row.phone_number)) {
        this.validationResults.nonDialable.push({
          rowNumber: i + 1,
          phone: row.phone_number,
          name: `${row.first_name || ''} ${row.last_name || ''}`.trim()
        });
      }

      if (validation.isValid) {
        this.validationResults.validRows++;
      } else {
        this.validationResults.invalidRows++;
        this.validationResults.isValid = false;
      }

      this.validationResults.byRowNumber[i + 1] = validation;
      this.validationResults.issues.push(...validation.issues);
    }

    // Generate summary
    this.validationResults.summary = {
      totalIssues: this.validationResults.issues.length,
      totalDuplicates: this.validationResults.duplicates.length,
      totalNonDialable: this.validationResults.nonDialable.length,
      validPercentage: Math.round((this.validationResults.validRows / rows.length) * 100),
      issueTypes: this.countIssueTypes(this.validationResults.issues)
    };

    return this.validationResults;
  }

  /**
   * Count issue types
   */
  countIssueTypes(issues) {
    const counts = {};
    for (const issue of issues) {
      counts[issue.type] = (counts[issue.type] || 0) + 1;
    }
    return counts;
  }

  /**
   * Set required fields for validation
   */
  setRequiredFields(fields) {
    this.validationRules.required = fields;
    return this;
  }

  /**
   * Add custom validation rule
   */
  addCustomRule(name, validator) {
    this.validationRules.custom.push({ name, validator });
    return this;
  }

  /**
   * Get validation results
   */
  getResults() {
    return this.validationResults;
  }

  /**
   * Get rows with errors
   */
  getInvalidRows(results = null) {
    const resultsToUse = results || this.validationResults;
    const invalidRows = [];

    for (const [rowNum, validation] of Object.entries(resultsToUse.byRowNumber)) {
      if (!validation.isValid) {
        invalidRows.push({
          rowNumber: parseInt(rowNum),
          issues: validation.issues
        });
      }
    }

    return invalidRows;
  }

  /**
   * Get clean rows (only valid rows)
   */
  getCleanRows(rows, results = null) {
    const resultsToUse = results || this.validationResults;
    const cleanRows = [];

    for (let i = 0; i < rows.length; i++) {
      const validation = resultsToUse.byRowNumber[i + 1];
      if (validation && validation.isValid) {
        cleanRows.push(rows[i]);
      }
    }

    return cleanRows;
  }

  /**
   * Generate validation report
   */
  generateReport(results = null) {
    const resultsToUse = results || this.validationResults;

    const report = {
      timestamp: new Date().toISOString(),
      summary: resultsToUse.summary,
      overallValid: resultsToUse.isValid,
      statistics: {
        totalRows: resultsToUse.totalRows,
        validRows: resultsToUse.validRows,
        invalidRows: resultsToUse.invalidRows,
        duplicateRecords: resultsToUse.duplicates.length,
        nonDialableRecords: resultsToUse.nonDialable.length
      },
      issues: resultsToUse.issues.slice(0, 20), // First 20 issues
      recommendations: []
    };

    // Add recommendations
    if (resultsToUse.duplicates.length > 0) {
      report.recommendations.push(
        `Remove ${resultsToUse.duplicates.length} duplicate phone numbers`
      );
    }

    if (resultsToUse.nonDialable.length > 0) {
      report.recommendations.push(
        `Fix or remove ${resultsToUse.nonDialable.length} non-dialable phone numbers`
      );
    }

    if (resultsToUse.invalidRows > 0) {
      report.recommendations.push(
        `Review and fix ${resultsToUse.invalidRows} rows with validation errors`
      );
    }

    return report;
  }

  /**
   * Clear validation results
   */
  clear() {
    this.validationResults = {
      isValid: true,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      issues: [],
      byRowNumber: {},
      summary: {}
    };
    return this;
  }
}

module.exports = DataValidator;
