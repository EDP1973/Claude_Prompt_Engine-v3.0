/**
 * MySQL Query Generator - Advanced
 * Generates MySQL queries based on analyzed imported data
 * Supports Vicidial field mapping and intelligent query suggestions
 */

class AdvancedMySQLQueryGenerator {
  constructor(vicidialMapper = null) {
    this.mapper = vicidialMapper;
    this.analyzedData = null;
    this.dataProfile = null;
    this.columnMetadata = {};
  }

  /**
   * Analyze imported data to extract metadata for query generation
   * @param {Array} rows - Array of imported data rows
   * @param {Array} columns - Column names
   * @returns {Object} Analysis profile
   */
  analyzeData(rows, columns) {
    if (!rows || rows.length === 0) {
      throw new Error('No data to analyze');
    }

    this.analyzedData = rows;
    this.dataProfile = {
      totalRows: rows.length,
      columns: columns,
      columnStats: {},
      distinctValues: {},
      dataTypes: {},
      suggestedQueries: []
    };

    // Analyze each column
    columns.forEach(col => {
      this.analyzeColumn(col, rows);
    });

    // Generate suggested queries
    this.generateSuggestions();

    return this.dataProfile;
  }

  /**
   * Analyze individual column for patterns and statistics
   * @private
   */
  analyzeColumn(columnName, rows) {
    const values = rows.map(r => r[columnName]).filter(v => v !== null && v !== undefined);
    const distinctValues = new Set(values);

    // Detect data type
    const dataType = this.detectColumnType(values);

    this.columnMetadata[columnName] = {
      name: columnName,
      type: dataType,
      distinct: distinctValues.size,
      total: values.length,
      nullCount: rows.length - values.length,
      min: dataType === 'number' ? Math.min(...values.filter(v => !isNaN(v))) : null,
      max: dataType === 'number' ? Math.max(...values.filter(v => !isNaN(v))) : null,
      uniqueValues: Array.from(distinctValues).slice(0, 10), // First 10 unique values
      isEmpty: values.length === 0
    };

    this.dataProfile.columnStats[columnName] = this.columnMetadata[columnName];
    this.dataProfile.distinctValues[columnName] = Array.from(distinctValues);
    this.dataProfile.dataTypes[columnName] = dataType;
  }

  /**
   * Detect column data type
   * @private
   */
  detectColumnType(values) {
    if (values.length === 0) return 'unknown';

    let numberCount = 0;
    let dateCount = 0;
    let phoneCount = 0;
    let emailCount = 0;

    values.forEach(val => {
      const str = String(val).trim();
      
      if (!isNaN(str) && str !== '') numberCount++;
      if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$|^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$/.test(str)) dateCount++;
      if (/^\+?1?\d{9,15}$|^\d{3}-\d{3}-\d{4}$|^\(\d{3}\)\s?\d{3}-\d{4}$/.test(str)) phoneCount++;
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) emailCount++;
    });

    const total = values.length;
    if (numberCount / total > 0.9) return 'number';
    if (phoneCount / total > 0.9) return 'phone';
    if (emailCount / total > 0.9) return 'email';
    if (dateCount / total > 0.9) return 'date';
    return 'string';
  }

  /**
   * Generate query suggestions based on data analysis
   * @private
   */
  generateSuggestions() {
    this.dataProfile.suggestedQueries = [];

    Object.entries(this.columnMetadata).forEach(([colName, metadata]) => {
      // Suggest queries for each column based on data type
      if (metadata.type === 'phone' && metadata.distinct > 0) {
        this.dataProfile.suggestedQueries.push({
          type: 'phone_query',
          title: `Find records by phone number`,
          description: `Query phone numbers from ${colName}`,
          template: this.generatePhoneTemplate(colName),
          field: colName
        });
      }

      if (metadata.type === 'email' && metadata.distinct > 0) {
        this.dataProfile.suggestedQueries.push({
          type: 'email_query',
          title: `Find records by email`,
          description: `Query email addresses from ${colName}`,
          template: this.generateEmailTemplate(colName),
          field: colName
        });
      }

      if (metadata.type === 'number' && metadata.distinct > 0) {
        this.dataProfile.suggestedQueries.push({
          type: 'range_query',
          title: `Find records in ${colName} range`,
          description: `Query records with ${colName} between ${metadata.min} and ${metadata.max}`,
          template: this.generateRangeTemplate(colName, metadata.min, metadata.max),
          field: colName
        });
      }

      if (metadata.type === 'string' && metadata.distinct < 20) {
        this.dataProfile.suggestedQueries.push({
          type: 'enum_query',
          title: `Find records by ${colName}`,
          description: `Query specific ${colName} values`,
          template: this.generateEnumTemplate(colName, metadata.uniqueValues),
          field: colName
        });
      }

      if (metadata.type === 'date' && metadata.distinct > 0) {
        this.dataProfile.suggestedQueries.push({
          type: 'date_query',
          title: `Find records by date range`,
          description: `Query records within specific date range`,
          template: this.generateDateTemplate(colName),
          field: colName
        });
      }

      if (metadata.distinct > 0) {
        this.dataProfile.suggestedQueries.push({
          type: 'exists_query',
          title: `Find non-empty ${colName}`,
          description: `Find all records where ${colName} is not empty`,
          template: this.generateExistsTemplate(colName),
          field: colName
        });
      }
    });
  }

  /**
   * Generate phone query template
   * @private
   */
  generatePhoneTemplate(columnName) {
    const vicidialCol = this.mapper ? this.mapper.mapColumnName(columnName) : columnName;
    return {
      description: 'Search by specific phone number',
      operators: ['=', 'LIKE', 'IN'],
      example: `SELECT * FROM contacts WHERE ${vicidialCol} = '5551234567';`,
      vicidialExample: `SELECT * FROM contacts WHERE ${vicidialCol} = '5551234567';`
    };
  }

  /**
   * Generate email query template
   * @private
   */
  generateEmailTemplate(columnName) {
    const vicidialCol = this.mapper ? this.mapper.mapColumnName(columnName) : columnName;
    return {
      description: 'Search by email address or domain',
      operators: ['=', 'LIKE'],
      example: `SELECT * FROM contacts WHERE ${vicidialCol} = 'user@example.com';`,
      vicidialExample: `SELECT * FROM contacts WHERE ${vicidialCol} LIKE '%example.com%';`
    };
  }

  /**
   * Generate range query template
   * @private
   */
  generateRangeTemplate(columnName, min, max) {
    const vicidialCol = this.mapper ? this.mapper.mapColumnName(columnName) : columnName;
    return {
      description: `Search for records with ${columnName} between ${min} and ${max}`,
      operators: ['BETWEEN', '>', '<', 'IN'],
      example: `SELECT * FROM contacts WHERE ${vicidialCol} BETWEEN ${min} AND ${max};`,
      vicidialExample: `SELECT * FROM contacts WHERE ${vicidialCol} BETWEEN ${min} AND ${max};`
    };
  }

  /**
   * Generate enum query template
   * @private
   */
  generateEnumTemplate(columnName, values) {
    const vicidialCol = this.mapper ? this.mapper.mapColumnName(columnName) : columnName;
    const valueList = values.slice(0, 5).map(v => `'${v}'`).join(', ');
    return {
      description: `Search for specific ${columnName} values`,
      operators: ['=', 'IN', 'NOT IN'],
      example: `SELECT * FROM contacts WHERE ${vicidialCol} IN (${valueList});`,
      vicidialExample: `SELECT * FROM contacts WHERE ${vicidialCol} IN (${valueList});`
    };
  }

  /**
   * Generate date query template
   * @private
   */
  generateDateTemplate(columnName) {
    const vicidialCol = this.mapper ? this.mapper.mapColumnName(columnName) : columnName;
    return {
      description: 'Search for records within date range',
      operators: ['BETWEEN', '>', '<', '='],
      example: `SELECT * FROM contacts WHERE ${vicidialCol} BETWEEN '2026-01-01' AND '2026-12-31';`,
      vicidialExample: `SELECT * FROM contacts WHERE ${vicidialCol} BETWEEN '2026-01-01' AND '2026-12-31';`
    };
  }

  /**
   * Generate exists query template
   * @private
   */
  generateExistsTemplate(columnName) {
    const vicidialCol = this.mapper ? this.mapper.mapColumnName(columnName) : columnName;
    return {
      description: `Find records where ${columnName} is not empty`,
      operators: ['IS NOT NULL', '!='],
      example: `SELECT * FROM contacts WHERE ${vicidialCol} IS NOT NULL;`,
      vicidialExample: `SELECT * FROM contacts WHERE ${vicidialCol} IS NOT NULL;`
    };
  }

  /**
   * Generate intelligent MySQL query from user parameters based on analyzed data
   * @param {string} columnName - Column to query
   * @param {string} operator - SQL operator (=, <, >, IN, BETWEEN, LIKE, etc.)
   * @param {string|Array} value - Value(s) to filter
   * @param {string} tableName - Target table name
   * @param {Array} selectColumns - Columns to select (default: *)
   * @returns {string} Generated MySQL query
   */
  generateQuery(columnName, operator, value, tableName = 'contacts', selectColumns = []) {
    if (!this.columnMetadata[columnName]) {
      throw new Error(`Column '${columnName}' not found in analyzed data`);
    }

    const colType = this.columnMetadata[columnName].type;
    const vicidialCol = this.mapper ? this.mapper.mapColumnName(columnName) : columnName;

    // Validate operator for column type
    this.validateOperator(operator, colType);

    // Format value based on column type and operator
    const formattedValue = this.formatValue(value, operator, colType);

    // Build SELECT clause
    const selectClause = selectColumns.length > 0
      ? `SELECT ${selectColumns.join(', ')}`
      : 'SELECT *';

    // Build WHERE clause
    let whereClause = '';
    if (operator.toUpperCase() === 'BETWEEN') {
      const [val1, val2] = Array.isArray(value) ? value : value.split(',');
      whereClause = `WHERE ${vicidialCol} BETWEEN ${this.formatValue(val1, operator, colType)} AND ${this.formatValue(val2, operator, colType)}`;
    } else {
      whereClause = `WHERE ${vicidialCol} ${operator} ${formattedValue}`;
    }

    return `${selectClause} FROM ${tableName} ${whereClause};`;
  }

  /**
   * Generate multiple queries from analysis
   * @param {Object} queryDefinitions - Array of query configs
   * @returns {Array} Generated queries
   */
  generateBulkQueries(queryDefinitions, tableName = 'contacts') {
    return queryDefinitions.map(def => 
      this.generateQuery(
        def.columnName,
        def.operator,
        def.value,
        tableName,
        def.selectColumns || []
      )
    );
  }

  /**
   * Validate operator for data type
   * @private
   */
  validateOperator(operator, dataType) {
    const validOperators = {
      'string': ['=', '!=', '<>', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
      'number': ['=', '!=', '<>', '<', '>', '<=', '>=', 'BETWEEN', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
      'phone': ['=', '!=', 'LIKE', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
      'email': ['=', '!=', 'LIKE', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
      'date': ['=', '!=', '<', '>', '<=', '>=', 'BETWEEN', 'IS NULL', 'IS NOT NULL'],
      'unknown': ['=', '!=', 'LIKE', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL']
    };

    const allowed = validOperators[dataType] || validOperators['unknown'];
    if (!allowed.includes(operator.toUpperCase())) {
      throw new Error(`Operator '${operator}' not valid for ${dataType} columns. Valid: ${allowed.join(', ')}`);
    }
  }

  /**
   * Format value based on type and operator
   * @private
   */
  formatValue(value, operator, dataType) {
    operator = operator.toUpperCase();

    // Handle NULL operators
    if (operator === 'IS NULL' || operator === 'IS NOT NULL') {
      return '';
    }

    // Handle IN operator
    if (operator === 'IN' || operator === 'NOT IN') {
      const values = Array.isArray(value) ? value : String(value).split(',');
      return `(${values.map(v => this.quoteValue(v.trim(), dataType)).join(', ')})`;
    }

    // Handle LIKE operator
    if (operator === 'LIKE' || operator === 'NOT LIKE') {
      return this.quoteLike(value, dataType);
    }

    // Handle other operators
    return this.quoteValue(value, dataType);
  }

  /**
   * Quote value appropriately
   * @private
   */
  quoteValue(value, dataType) {
    if (dataType === 'number') {
      return String(value);
    }
    // Escape single quotes
    const escaped = String(value).replace(/'/g, "''");
    return `'${escaped}'`;
  }

  /**
   * Quote LIKE pattern
   * @private
   */
  quoteLike(value, dataType) {
    const escaped = String(value).replace(/'/g, "''");
    return `'%${escaped}%'`;
  }

  /**
   * Get analysis report
   */
  getAnalysisReport() {
    if (!this.dataProfile) {
      throw new Error('No data analyzed yet');
    }

    return {
      summary: {
        totalRows: this.dataProfile.totalRows,
        totalColumns: this.dataProfile.columns.length,
        columns: this.dataProfile.columns
      },
      columnStats: this.dataProfile.columnStats,
      dataTypes: this.dataProfile.dataTypes,
      suggestedQueries: this.dataProfile.suggestedQueries,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export analysis as JSON
   */
  exportAnalysis() {
    return JSON.stringify(this.getAnalysisReport(), null, 2);
  }

  /**
   * Get suggested query for specific column
   */
  getSuggestedQuery(columnName) {
    return this.dataProfile.suggestedQueries
      .filter(q => q.field === columnName);
  }
}

// Module exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedMySQLQueryGenerator;
}
