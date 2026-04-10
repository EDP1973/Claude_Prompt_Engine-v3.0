/**
 * Smart Column Analyzer
 * Analyzes dataset columns to detect field types, calculate age from DOB,
 * identify unique/identifier columns, and produce confidence-scored mappings.
 */

class SmartColumnAnalyzer {
  constructor() {
    this.fieldDefinitions = [
      {
        key: 'first_name',
        label: 'First Name',
        vicidialField: 'first_name',
        namePatterns: ['first_name','firstname','fname','f_name','given_name','given','first','forename','fn'],
        dataPattern: null
      },
      {
        key: 'last_name',
        label: 'Last Name',
        vicidialField: 'last_name',
        namePatterns: ['last_name','lastname','lname','l_name','surname','family_name','family','last','sn'],
        dataPattern: null
      },
      {
        key: 'phone_number',
        label: 'Phone Number',
        vicidialField: 'phone_number',
        namePatterns: ['phone','phone_number','phonenumber','ph','tel','telephone','phone1','primary_phone','contact_phone','number','mobile'],
        dataPattern: /^\+?1?[\s\-\.]?\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}$/
      },
      {
        key: 'city',
        label: 'City',
        vicidialField: 'city',
        namePatterns: ['city','town','municipality','city_name','cty'],
        dataPattern: null
      },
      {
        key: 'state',
        label: 'State',
        vicidialField: 'state',
        namePatterns: ['state','st','province','state_code','state_name','province_code','prov'],
        dataPattern: /^[A-Z]{2}$/
      },
      {
        key: 'zip',
        label: 'ZIP Code',
        vicidialField: 'zip',
        namePatterns: ['zip','zipcode','zip_code','postal','postal_code','postalcode','postcode','zc'],
        dataPattern: /^\d{5}(-\d{4})?$/
      },
      {
        key: 'address1',
        label: 'Ethnic',
        vicidialField: 'address1',
        namePatterns: ['ethnic','ethnicity','race','origin','ethnic_group','background','address1'],
        dataPattern: null
      },
      {
        key: 'address2',
        label: 'Gender',
        vicidialField: 'address2',
        namePatterns: ['gender','sex','gender_identity','address2'],
        dataPattern: /^(m|f|male|female|other|unknown|u|x|nb|nonbinary)$/i
      },
      {
        key: 'address3',
        label: 'Age',
        vicidialField: 'address3',
        namePatterns: ['age','years_old','age_group','address3','yrs','age_range'],
        dataPattern: /^\d{1,3}$/
      },
      {
        key: 'dob',
        label: 'Date of Birth',
        vicidialField: 'address3',  // age stored in address3
        namePatterns: ['dob','date_of_birth','birth_date','birthday','birthdate','bdate','born','birth','dateofbirth','dob_date'],
        isDOB: true,
        dataPattern: /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$|^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/
      },
      {
        key: 'political_party',
        label: 'Political Party',
        vicidialField: 'political_party',
        namePatterns: ['party','political_party','political','political_affiliation','affiliation','pol_party','pol','party_code','party_affiliation','polparty'],
        dataPattern: /^(r|d|i|rep|dem|ind|republican|democrat|independent|gop|lib|libertarian|green|other|u|unaffiliated|npa|dts)$/i
      },
      {
        key: 'owner',
        label: 'Is Cell',
        vicidialField: 'owner',
        namePatterns: ['is_cell','cell','mobile','cell_phone','owner','is_mobile','cellphone','cell_indicator','cell_flag','wireless'],
        dataPattern: /^(y|n|yes|no|1|0|true|false|mobile|landline)$/i
      },
      {
        key: 'county',
        label: 'County',
        vicidialField: 'county',
        namePatterns: ['county','county_name','cnty','county_code','co'],
        dataPattern: null
      },
      {
        key: 'district',
        label: 'District',
        vicidialField: 'district',
        namePatterns: ['district','congressional_district','precinct','district_name','ward','district_code','cd','precinct_name','voting_district'],
        dataPattern: null
      },
      {
        key: 'email',
        label: 'Email',
        vicidialField: 'email',
        namePatterns: ['email','email_address','e_mail','mail','contact_email'],
        dataPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      {
        key: 'vendor_lead_code',
        label: 'Record ID',
        vicidialField: 'vendor_lead_code',
        namePatterns: ['id','record_id','recordid','lead_id','vendor_lead_code','uid','unique_id','record_number','recid','row_id'],
        dataPattern: null
      }
    ];
  }

  /**
   * Normalize a column name for comparison
   */
  normalize(str) {
    return String(str).toLowerCase().trim()
      .replace(/[\s\-\/]+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  /**
   * Compute Levenshtein distance between two strings
   */
  levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[m][n];
  }

  /**
   * Score a column name against a field definition
   */
  scoreColumnName(colNorm, def) {
    let best = 0;
    for (const pat of def.namePatterns) {
      if (colNorm === pat) { best = 100; break; }
      if (colNorm.includes(pat) || pat.includes(colNorm)) { best = Math.max(best, 80); }
      const dist = this.levenshtein(colNorm, pat);
      const maxLen = Math.max(colNorm.length, pat.length);
      const sim = (1 - dist / maxLen) * 100;
      if (sim > 75) best = Math.max(best, sim * 0.9);
    }
    return best;
  }

  /**
   * Score column values against a data pattern
   */
  scoreDataPattern(values, pattern) {
    if (!pattern || values.length === 0) return 0;
    const hits = values.filter(v => pattern.test(String(v).trim())).length;
    return Math.round((hits / values.length) * 100);
  }

  /**
   * Parse a date-of-birth value and return age in years
   */
  calculateAgeFromDOB(dobStr) {
    if (!dobStr || !String(dobStr).trim()) return null;
    const s = String(dobStr).trim();

    // Try ISO format YYYY-MM-DD first
    let d = new Date(s);

    // Try MM/DD/YYYY or M/D/YYYY
    if (isNaN(d)) {
      const parts = s.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const [a, b, c] = parts.map(Number);
        if (c > 1900 && c < 2100) {
          // MM/DD/YYYY
          d = new Date(c, a - 1, b);
        } else if (a > 1900 && a < 2100) {
          // YYYY/MM/DD
          d = new Date(a, b - 1, c);
        }
      }
    }

    if (isNaN(d)) return null;

    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    if (
      now.getMonth() < d.getMonth() ||
      (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())
    ) age--;

    return (age >= 0 && age < 130) ? age : null;
  }

  /**
   * Main analysis: given column headers and sample rows, return field mappings
   */
  analyze(columns, rows) {
    const usedKeys = new Set();
    const results = [];

    // Pre-compute values per column
    const columnValues = {};
    for (const col of columns) {
      columnValues[col] = rows
        .map(r => r[col])
        .filter(v => v !== null && v !== undefined && String(v).trim() !== '');
    }

    for (const col of columns) {
      const colNorm = this.normalize(col);
      const values = columnValues[col];
      const total = rows.length;
      const nonEmpty = values.length;

      // Uniqueness check
      const uniqueSet = new Set(values.map(v => String(v).toLowerCase().trim()));
      const uniqueRatio = nonEmpty > 0 ? uniqueSet.size / nonEmpty : 0;
      const isUnique = nonEmpty > 3 && uniqueRatio > 0.95;

      // Score each field definition
      let bestDef = null;
      let bestScore = 0;
      let nameScore = 0;
      let dataScore = 0;

      for (const def of this.fieldDefinitions) {
        if (usedKeys.has(def.key)) continue;

        const ns = this.scoreColumnName(colNorm, def);
        const ds = this.scoreDataPattern(values, def.dataPattern);
        // Weighted: name match is more important
        const combined = ns * 0.7 + ds * 0.3;

        if (combined > bestScore) {
          bestScore = combined;
          bestDef = def;
          nameScore = ns;
          dataScore = ds;
        }
      }

      const THRESHOLD = 55;

      if (bestDef && bestScore >= THRESHOLD) {
        usedKeys.add(bestDef.key);

        const entry = {
          sourceColumn: col,
          detectedKey: bestDef.key,
          vicidialField: bestDef.vicidialField,
          label: bestDef.label,
          confidence: Math.round(bestScore),
          nameScore: Math.round(nameScore),
          dataScore: Math.round(dataScore),
          isDOB: bestDef.isDOB || false,
          isUnique,
          sampleValues: values.slice(0, 3),
          nonEmptyCount: nonEmpty,
          totalCount: total
        };

        // If DOB column, compute sample ages and relabel
        if (bestDef.isDOB) {
          const sampleAges = values.slice(0, 3).map(v => this.calculateAgeFromDOB(v));
          entry.sampleValues = values.slice(0, 3);
          entry.sampleAges = sampleAges;
          entry.label = 'Date of Birth → Age';
          entry.vicidialField = 'address3';
          entry.detectedKey = 'dob';
        }

        results.push(entry);
      } else if (isUnique && !usedKeys.has('vendor_lead_code')) {
        // Auto-detect unique columns as record IDs if not already assigned
        usedKeys.add('vendor_lead_code');
        results.push({
          sourceColumn: col,
          detectedKey: 'vendor_lead_code',
          vicidialField: 'vendor_lead_code',
          label: 'Record ID (auto — all unique)',
          confidence: 62,
          nameScore: 0,
          dataScore: 0,
          isDOB: false,
          isUnique: true,
          autoDetected: true,
          sampleValues: values.slice(0, 3),
          nonEmptyCount: nonEmpty,
          totalCount: total
        });
      } else {
        // No match — present as unmapped
        results.push({
          sourceColumn: col,
          detectedKey: '',
          vicidialField: '',
          label: 'Unmapped',
          confidence: 0,
          nameScore: 0,
          dataScore: 0,
          isDOB: false,
          isUnique,
          sampleValues: values.slice(0, 3),
          nonEmptyCount: nonEmpty,
          totalCount: total
        });
      }
    }

    return results;
  }

  /**
   * Transform a row using the current mappings (applying DOB→age conversion)
   */
  transformRow(row, mappings) {
    const out = {};
    for (const { sourceColumn, vicidialField, isDOB } of mappings) {
      if (!vicidialField) continue;
      const raw = row[sourceColumn];
      if (isDOB) {
        const age = this.calculateAgeFromDOB(raw);
        out[vicidialField] = age !== null ? String(age) : '';
      } else {
        out[vicidialField] = raw !== undefined ? String(raw) : '';
      }
    }
    return out;
  }

  /**
   * Build a human-readable confidence label
   */
  confidenceLabel(score) {
    if (score >= 90) return { text: 'High', color: '#00d4ff' };
    if (score >= 70) return { text: 'Good', color: '#7bc83c' };
    if (score >= 55) return { text: 'Likely', color: '#f0a500' };
    return { text: 'Manual', color: '#ff6b6b' };
  }
}

// Export for both browser and Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartColumnAnalyzer;
}
