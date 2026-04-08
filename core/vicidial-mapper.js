/**
 * Vicidial Field Mapper
 * Provides standard Vicidial database field mappings and column name suggestions
 */

class VicidialMapper {
  constructor() {
    // Standard Vicidial field definitions
    this.standardFields = {
      first_name: {
        description: 'First name of contact',
        aliases: ['firstname', 'first', 'fname', 'given_name', 'given name'],
        dataType: 'varchar(20)',
        vicidialColumn: 'first_name',
        category: 'contact_info'
      },
      last_name: {
        description: 'Last name of contact',
        aliases: ['lastname', 'last', 'lname', 'surname', 'family_name', 'family name'],
        dataType: 'varchar(20)',
        vicidialColumn: 'last_name',
        category: 'contact_info'
      },
      address1: {
        description: 'Ethnic background',
        aliases: ['ethnic', 'ethnicity', 'race', 'origin', 'address'],
        dataType: 'varchar(100)',
        vicidialColumn: 'address1',
        category: 'demographics',
        note: 'Maps to address1 field per Vicidial standard'
      },
      address2: {
        description: 'Gender',
        aliases: ['gender', 'sex', 'gender_identity'],
        dataType: 'varchar(20)',
        vicidialColumn: 'address2',
        category: 'demographics',
        note: 'Maps to address2 field per Vicidial standard'
      },
      address3: {
        description: 'Age',
        aliases: ['age', 'years_old', 'dob', 'date_of_birth', 'birth_date'],
        dataType: 'int(3)',
        vicidialColumn: 'address3',
        category: 'demographics',
        note: 'Maps to address3 field per Vicidial standard'
      },
      city: {
        description: 'City',
        aliases: ['city', 'town', 'municipality'],
        dataType: 'varchar(20)',
        vicidialColumn: 'city',
        category: 'location'
      },
      state: {
        description: 'State or Province',
        aliases: ['state', 'province', 'province_code', 'state_code', 'st'],
        dataType: 'varchar(2)',
        vicidialColumn: 'state',
        category: 'location'
      },
      zip: {
        description: 'ZIP code or postal code',
        aliases: ['zip', 'postal_code', 'postalcode', 'zipcode', 'postal', 'zip_code'],
        dataType: 'varchar(10)',
        vicidialColumn: 'zip',
        category: 'location'
      },
      owner: {
        description: 'Cell phone indicator (Y/N or Y with spaces)',
        aliases: ['cell', 'mobile', 'is_cell', 'cell_phone', 'phone_type', 'is_mobile'],
        dataType: 'varchar(3)',
        vicidialColumn: 'owner',
        category: 'contact_info',
        note: 'Values: Y, N, or Y with spaces (Y )',
        allowedValues: ['Y', 'N', 'Y ', 'N ', 'Y  ']
      },
      phone_number: {
        description: 'Phone number',
        aliases: ['phone', 'phone_number', 'phonenumber', 'number', 'tel', 'telephone'],
        dataType: 'varchar(20)',
        vicidialColumn: 'phone_number',
        category: 'contact_info'
      },
      vendor_lead_code: {
        description: 'Record ID / Unique identifier',
        aliases: ['recordid', 'record_id', 'id', 'lead_id', 'vendor_lead_code', 'code'],
        dataType: 'varchar(20)',
        vicidialColumn: 'vendor_lead_code',
        category: 'identifier',
        note: 'Should be unique per record'
      },
      email: {
        description: 'Email address',
        aliases: ['email', 'email_address', 'e-mail', 'email address', 'contact_email'],
        dataType: 'varchar(100)',
        vicidialColumn: 'email',
        category: 'contact_info'
      }
    };

    // Custom fields that can be added
    this.customFields = {
      political_party: {
        description: 'Political party affiliation',
        aliases: ['party', 'political_affiliation', 'affiliation'],
        dataType: 'varchar(30)',
        category: 'demographics'
      },
      notes: {
        description: 'Additional notes',
        aliases: ['note', 'comments', 'remarks', 'description'],
        dataType: 'text',
        category: 'metadata'
      }
    };

    // All fields combined
    this.allFields = { ...this.standardFields, ...this.customFields };
  }

  /**
   * Suggest Vicidial field mapping for a column name
   * Returns best match based on aliases
   */
  suggestFieldMapping(columnName) {
    const normalized = columnName.toLowerCase().trim();

    // Direct match
    if (this.allFields[normalized]) {
      return {
        suggestedField: normalized,
        confidence: 1.0,
        reason: 'Exact match'
      };
    }

    // Check aliases
    for (const [fieldName, fieldDef] of Object.entries(this.allFields)) {
      if (fieldDef.aliases && fieldDef.aliases.includes(normalized)) {
        return {
          suggestedField: fieldName,
          confidence: 0.95,
          reason: 'Matched to alias'
        };
      }
    }

    // Partial match
    let bestMatch = null;
    let bestScore = 0;

    for (const [fieldName, fieldDef] of Object.entries(this.allFields)) {
      const score = this.calculateSimilarity(normalized, fieldName);
      const aliasScores = fieldDef.aliases
        ? fieldDef.aliases.map(alias => this.calculateSimilarity(normalized, alias))
        : [];
      
      const maxScore = Math.max(score, ...aliasScores);
      
      if (maxScore > bestScore) {
        bestScore = maxScore;
        bestMatch = fieldName;
      }
    }

    if (bestMatch && bestScore > 0.7) {
      return {
        suggestedField: bestMatch,
        confidence: bestScore,
        reason: 'Partial match'
      };
    }

    return {
      suggestedField: null,
      confidence: 0,
      reason: 'No match found'
    };
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(s1, s2) {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  /**
   * Get all standard Vicidial fields
   */
  getStandardFields() {
    return Object.entries(this.standardFields).map(([key, def]) => ({
      fieldName: key,
      ...def
    }));
  }

  /**
   * Get all custom fields
   */
  getCustomFields() {
    return Object.entries(this.customFields).map(([key, def]) => ({
      fieldName: key,
      ...def
    }));
  }

  /**
   * Get field information by name
   */
  getFieldInfo(fieldName) {
    return this.allFields[fieldName] || null;
  }

  /**
   * Validate a value against a field's allowed values
   */
  validateFieldValue(fieldName, value) {
    const field = this.allFields[fieldName];
    
    if (!field) {
      return { valid: false, error: 'Field not found' };
    }

    if (field.allowedValues) {
      const valid = field.allowedValues.includes(value);
      return {
        valid,
        error: valid ? null : `Value must be one of: ${field.allowedValues.join(', ')}`
      };
    }

    // Basic type validation
    if (field.dataType.includes('int')) {
      const valid = !isNaN(parseInt(value));
      return {
        valid,
        error: valid ? null : 'Value must be an integer'
      };
    }

    if (field.dataType.includes('varchar')) {
      return { valid: true, error: null };
    }

    return { valid: true, error: null };
  }

  /**
   * Create field mapping from source columns to Vicidial fields
   * Returns array of suggestions with confidence scores
   */
  suggestMappings(sourceColumns) {
    return sourceColumns.map(column => {
      const suggestion = this.suggestFieldMapping(column);
      return {
        sourceColumn: column,
        ...suggestion,
        fieldInfo: suggestion.suggestedField 
          ? this.getFieldInfo(suggestion.suggestedField)
          : null
      };
    });
  }

  /**
   * Get mapping for standard contact fields
   */
  getStandardMapping() {
    return {
      first_name: 'first_name',
      last_name: 'last_name',
      phone_number: 'phone_number',
      city: 'city',
      state: 'state',
      zip: 'zip',
      ethnic: 'address1',
      gender: 'address2',
      age: 'address3',
      cell: 'owner',
      record_id: 'vendor_lead_code'
    };
  }

  /**
   * Generate SQL CREATE TABLE statement for Vicidial schema
   */
  generateVicidialTableSQL(tableName = 'contacts') {
    const fields = this.getStandardFields();
    const columns = fields
      .filter(f => f.dataType) // Has data type
      .map(f => `  ${f.fieldName} ${f.dataType}`)
      .join(',\n');

    return `CREATE TABLE ${tableName} (
  id INT AUTO_INCREMENT PRIMARY KEY,
${columns},
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;
  }

  /**
   * Get field category groups
   */
  getFieldsByCategory() {
    const categories = {};
    
    for (const [fieldName, fieldDef] of Object.entries(this.allFields)) {
      const category = fieldDef.category || 'uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({ fieldName, ...fieldDef });
    }

    return categories;
  }

  /**
   * Format field information for display
   */
  formatFieldInfo(fieldName) {
    const field = this.getFieldInfo(fieldName);
    
    if (!field) return null;

    return {
      name: fieldName,
      description: field.description,
      dataType: field.dataType,
      category: field.category,
      aliases: field.aliases ? field.aliases.join(', ') : 'None',
      note: field.note || 'None',
      allowedValues: field.allowedValues ? field.allowedValues.join(', ') : 'Any'
    };
  }
}

module.exports = VicidialMapper;
