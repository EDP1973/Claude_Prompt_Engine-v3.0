/**
 * Query Builder
 * Generates MySQL queries from user conditions with Vicidial field mapping
 */

class QueryBuilder {
  constructor(mapper = null) {
    this.conditions = [];
    this.selectedColumns = [];
    this.mapper = mapper;
    this.logicalOperators = ['AND', 'OR'];
    this.comparisonOperators = ['=', '!=', '<>', '<', '>', '<=', '>=', 'IN', 'NOT IN', 'LIKE', 'BETWEEN'];
  }

  /**
   * Add a condition to the query
   */
  addCondition(column, operator, value, logicalOp = 'AND') {
    if (!this.comparisonOperators.includes(operator.toUpperCase())) {
      throw new Error(`Invalid operator: ${operator}`);
    }

    if (!this.logicalOperators.includes(logicalOp.toUpperCase())) {
      throw new Error(`Invalid logical operator: ${logicalOp}`);
    }

    this.conditions.push({
      column,
      operator: operator.toUpperCase(),
      value,
      logicalOp: logicalOp.toUpperCase(),
      id: this.generateConditionId()
    });

    return this;
  }

  /**
   * Remove a condition by ID
   */
  removeCondition(conditionId) {
    this.conditions = this.conditions.filter(c => c.id !== conditionId);
    return this;
  }

  /**
   * Clear all conditions
   */
  clearConditions() {
    this.conditions = [];
    return this;
  }

  /**
   * Set columns to select
   */
  setSelectedColumns(columns) {
    this.selectedColumns = columns;
    return this;
  }

  /**
   * Generate condition ID
   */
  generateConditionId() {
    return `cond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format a value for SQL based on operator
   */
  formatValue(value, operator) {
    operator = operator.toUpperCase();

    switch (operator) {
      case 'IN':
      case 'NOT IN':
        // Handle array or comma-separated values
        if (Array.isArray(value)) {
          return `(${value.map(v => `'${this.escapeSQL(v)}'`).join(', ')})`;
        } else if (typeof value === 'string' && value.includes(',')) {
          const items = value.split(',').map(v => v.trim());
          return `(${items.map(v => `'${this.escapeSQL(v)}'`).join(', ')})`;
        }
        return `('${this.escapeSQL(value)}')`;

      case 'BETWEEN':
        if (Array.isArray(value) && value.length === 2) {
          return `${this.formatSingleValue(value[0])} AND ${this.formatSingleValue(value[1])}`;
        }
        throw new Error('BETWEEN requires array with 2 values');

      case 'LIKE':
        return `'${this.escapeSQL(value)}'`;

      default:
        return this.formatSingleValue(value);
    }
  }

  /**
   * Format a single value for SQL
   */
  formatSingleValue(value) {
    // Check if it's a number
    if (!isNaN(value) && value !== '') {
      return value.toString();
    }
    // Otherwise treat as string
    return `'${this.escapeSQL(value)}'`;
  }

  /**
   * Escape SQL special characters
   */
  escapeSQL(str) {
    if (str === null || str === undefined) return '';
    return str.toString().replace(/'/g, "''");
  }

  /**
   * Build WHERE clause from conditions
   */
  buildWhereClause() {
    if (this.conditions.length === 0) {
      return '';
    }

    let whereClause = 'WHERE ';
    const clauseParts = [];

    for (let i = 0; i < this.conditions.length; i++) {
      const cond = this.conditions[i];
      const operator = cond.operator.toUpperCase();
      const formattedValue = this.formatValue(cond.value, operator);

      let conditionStr = `${cond.column} ${operator}`;

      if (['IN', 'NOT IN', 'BETWEEN'].includes(operator)) {
        conditionStr += ` ${formattedValue}`;
      } else {
        conditionStr += ` ${formattedValue}`;
      }

      // Add logical operator if not the last condition
      if (i < this.conditions.length - 1) {
        conditionStr += ` ${cond.logicalOp}`;
      }

      clauseParts.push(conditionStr);
    }

    whereClause += clauseParts.join(' ');
    return whereClause;
  }

  /**
   * Build SELECT clause
   */
  buildSelectClause() {
    if (this.selectedColumns.length === 0) {
      return 'SELECT *';
    }

    return `SELECT ${this.selectedColumns.join(', ')}`;
  }

  /**
   * Generate full MySQL query
   */
  generateQuery(tableName = 'contacts') {
    const selectClause = this.buildSelectClause();
    const fromClause = `FROM ${tableName}`;
    const whereClause = this.buildWhereClause();

    let query = `${selectClause} ${fromClause}`;
    if (whereClause) {
      query += ` ${whereClause}`;
    }
    query += ';';

    return query;
  }

  /**
   * Generate Vicidial-compatible query (with mapped field names)
   */
  generateVicidialQuery(tableName = 'contacts') {
    if (!this.mapper) {
      return this.generateQuery(tableName);
    }

    // Map columns to Vicidial standard names
    const mappedConditions = this.conditions.map(cond => ({
      ...cond,
      mappedColumn: this.mapColumnName(cond.column)
    }));

    const mappedSelectedColumns = this.selectedColumns.map(col => this.mapColumnName(col));

    // Build with mapped names
    const selectClause = mappedSelectedColumns.length > 0
      ? `SELECT ${mappedSelectedColumns.join(', ')}`
      : 'SELECT *';

    let whereClause = '';
    if (mappedConditions.length > 0) {
      whereClause = 'WHERE ';
      const parts = mappedConditions.map(cond => {
        const formattedValue = this.formatValue(cond.value, cond.operator);
        let part = `${cond.mappedColumn} ${cond.operator} ${formattedValue}`;
        return part;
      });

      whereClause += parts.join(` ${mappedConditions[0].logicalOp} `);
    }

    let query = `${selectClause} FROM ${tableName}`;
    if (whereClause) {
      query += ` ${whereClause}`;
    }
    query += ';';

    return query;
  }

  /**
   * Map column name to Vicidial standard
   */
  mapColumnName(columnName) {
    if (!this.mapper) return columnName;

    const suggestion = this.mapper.suggestFieldMapping(columnName);
    return suggestion.suggestedField || columnName;
  }

  /**
   * Get current conditions
   */
  getConditions() {
    return this.conditions;
  }

  /**
   * Get query as object (for JSON serialization)
   */
  toJSON() {
    return {
      conditions: this.conditions,
      selectedColumns: this.selectedColumns,
      query: this.generateQuery(),
      vicidialQuery: this.generateVicidialQuery()
    };
  }

  /**
   * Load from JSON (for deserialization)
   */
  static fromJSON(data, mapper = null) {
    const builder = new QueryBuilder(mapper);
    builder.conditions = data.conditions || [];
    builder.selectedColumns = data.selectedColumns || [];
    return builder;
  }

  /**
   * Validate query conditions
   */
  validateConditions() {
    const errors = [];

    for (const cond of this.conditions) {
      if (!cond.column) {
        errors.push('Column name is required');
      }
      if (!cond.operator) {
        errors.push('Operator is required');
      }
      if (cond.value === undefined || cond.value === null || cond.value === '') {
        errors.push(`Value is required for column "${cond.column}"`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Format query for display (with line breaks)
   */
  formatForDisplay(query) {
    return query
      .replace(/SELECT/, '\nSELECT')
      .replace(/FROM/, '\nFROM')
      .replace(/WHERE/, '\nWHERE')
      .replace(/AND /g, '\nAND ')
      .replace(/OR /g, '\nOR ')
      .replace(/;$/, ';\n');
  }

  /**
   * Get query string with formatted display
   */
  getFormattedQuery(tableName = 'contacts') {
    const query = this.generateVicidialQuery(tableName);
    return this.formatForDisplay(query);
  }

  /**
   * Clone current builder
   */
  clone() {
    const cloned = new QueryBuilder(this.mapper);
    cloned.conditions = JSON.parse(JSON.stringify(this.conditions));
    cloned.selectedColumns = [...this.selectedColumns];
    return cloned;
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.conditions = [];
    this.selectedColumns = [];
    return this;
  }

  /**
   * Get condition by ID
   */
  getConditionById(id) {
    return this.conditions.find(c => c.id === id);
  }

  /**
   * Update condition
   */
  updateCondition(id, updates) {
    const index = this.conditions.findIndex(c => c.id === id);
    if (index !== -1) {
      this.conditions[index] = { ...this.conditions[index], ...updates };
    }
    return this;
  }

  /**
   * Get supported operators
   */
  getSupportedOperators() {
    return {
      comparison: this.comparisonOperators,
      logical: this.logicalOperators
    };
  }

  /**
   * Build simple query (single condition)
   */
  static buildSimple(column, operator, value, tableName = 'contacts') {
    const builder = new QueryBuilder();
    builder.addCondition(column, operator, value);
    return builder.generateQuery(tableName);
  }
}

module.exports = QueryBuilder;
