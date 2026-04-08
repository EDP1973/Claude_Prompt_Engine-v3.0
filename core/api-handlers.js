/**
 * API Handlers for Data Import & Query Builder
 * All endpoints for configuration, import, validation, and query generation
 */

const InstallConfig = require('./install-config');
const DataImporter = require('./data-importer');
const DataValidator = require('./data-validator');
const VicidialMapper = require('./vicidial-mapper');
const QueryBuilder = require('./query-builder');
const crypto = require('crypto');

class APIHandlers {
  constructor(db) {
    this.db = db;
    this.config = new InstallConfig();
    this.mapper = new VicidialMapper();
    this.importer = new DataImporter();
    this.validator = new DataValidator();
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  // ==================== CONFIGURATION ENDPOINTS ====================

  /**
   * POST /api/config/deployment
   * Set deployment mode
   */
  setDeploymentMode(mode) {
    try {
      const config = this.config.saveDeploymentConfig(mode);
      return {
        success: true,
        mode,
        config
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * POST /api/config/hardware
   * Set hardware tier (auto-detect or manual)
   */
  setHardwareTier(tier, autoDetect = true) {
    try {
      const config = this.config.saveHardwareProfile(tier, !autoDetect);
      return {
        success: true,
        tier,
        config
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * GET /api/config/current
   * Get current deployment and hardware configuration
   */
  getCurrentConfig() {
    return this.config.getCurrentConfig();
  }

  /**
   * GET /api/config/deployment-modes
   * Get available deployment modes
   */
  getDeploymentModes() {
    return this.config.getDeploymentModes();
  }

  /**
   * GET /api/config/hardware-tiers
   * Get available hardware tiers
   */
  getHardwareTiers() {
    return this.config.getHardwareTiers();
  }

  /**
   * POST /api/config/auto-detect
   * Auto-detect hardware tier
   */
  autoDetectHardware() {
    const detection = this.config.detectHardwareTier();
    return {
      detected: detection.detectedTier,
      memoryMB: detection.memoryMB,
      cpuCount: detection.cpuCount,
      tierInfo: detection.tierInfo
    };
  }

  // ==================== DATA IMPORT ENDPOINTS ====================

  /**
   * POST /api/import/upload
   * Upload and parse file (Excel, CSV, or Text)
   */
  uploadFile(filePath, options = {}) {
    try {
      const result = this.importer.import(filePath, options);

      const importId = this.generateId();
      const importMetadata = {
        id: importId,
        filename: this.importer.metadata.fileName,
        format: this.importer.sourceFormat,
        recordCount: this.importer.rows.length,
        columnCount: this.importer.columns.length,
        columns: this.importer.columns,
        sampleData: this.importer.getSample(3)
      };

      // Store in database
      if (this.db) {
        this.db.run(
          `INSERT INTO data_imports (id, filename, file_format, record_count) 
           VALUES (?, ?, ?, ?)`,
          [importId, importMetadata.filename, this.importer.sourceFormat, importMetadata.recordCount]
        );
      }

      return {
        success: true,
        importId,
        ...importMetadata
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * POST /api/import/validate
   * Validate imported data
   */
  validateImportedData(importId, options = {}) {
    try {
      if (this.importer.rows.length === 0) {
        throw new Error('No imported data to validate');
      }

      // Set required fields if specified
      if (options.requiredFields) {
        this.validator.setRequiredFields(options.requiredFields);
      }

      // Run validation
      const results = this.validator.validate(this.importer.rows, options);

      // Store validation results in database
      if (this.db) {
        const resultsInsert = this.db.prepare(
          `INSERT INTO validation_results 
           (id, import_id, row_number, issue_type, field_name, message) 
           VALUES (?, ?, ?, ?, ?, ?)`
        );

        for (const issue of results.issues) {
          resultsInsert.run(
            this.generateId(),
            importId,
            issue.rowNumber || 0,
            issue.type || 'general',
            issue.field || null,
            issue.message
          );
        }
      }

      return {
        success: true,
        validationReport: this.validator.generateReport(results),
        cleanRowCount: results.validRows,
        issueCount: results.issues.length,
        duplicateCount: results.duplicates.length
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * POST /api/import/mapping
   * Suggest and save column mappings
   */
  suggestMappings(columns) {
    try {
      const suggestions = this.mapper.suggestMappings(columns);

      return {
        success: true,
        suggestions: suggestions.map(s => ({
          sourceColumn: s.sourceColumn,
          suggestedField: s.suggestedField,
          confidence: s.confidence,
          description: s.fieldInfo ? s.fieldInfo.description : null
        }))
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * POST /api/import/mapping/save
   * Save final column mappings
   */
  saveMappings(importId, mappings) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      const stmt = this.db.prepare(
        `INSERT OR REPLACE INTO column_mappings 
         (id, import_id, source_column, vicidial_field, confidence) 
         VALUES (?, ?, ?, ?, ?)`
      );

      for (const [sourceCol, mapping] of Object.entries(mappings)) {
        stmt.run(
          this.generateId(),
          importId,
          sourceCol,
          mapping.vicidialField || mapping,
          mapping.confidence || 0.8
        );
      }

      // Update import status
      this.db.run(
        `UPDATE data_imports SET validation_status = 'mapped' WHERE id = ?`,
        [importId]
      );

      return {
        success: true,
        mappingsSaved: Object.keys(mappings).length
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * GET /api/import/columns
   * Get available columns from imported data
   */
  getImportedColumns() {
    return {
      columns: this.importer.columns,
      count: this.importer.columns.length
    };
  }

  /**
   * GET /api/import/statistics
   * Get data statistics
   */
  getImportStatistics() {
    return this.importer.getStatistics();
  }

  // ==================== QUERY BUILDER ENDPOINTS ====================

  /**
   * POST /api/query-builder/generate
   * Generate MySQL query from conditions
   */
  generateQuery(conditions, selectedColumns = [], tableName = 'contacts') {
    try {
      const builder = new QueryBuilder(this.mapper);

      // Add conditions
      for (const cond of conditions) {
        builder.addCondition(cond.column, cond.operator, cond.value, cond.logicalOp || 'AND');
      }

      // Set columns to select
      if (selectedColumns.length > 0) {
        builder.setSelectedColumns(selectedColumns);
      }

      // Validate
      const validation = builder.validateConditions();
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const query = builder.generateVicidialQuery(tableName);
      const formatted = builder.getFormattedQuery(tableName);

      return {
        success: true,
        query,
        formattedQuery: formatted,
        conditions: builder.getConditions(),
        selectedColumns: builder.selectedColumns,
        operatorSupport: builder.getSupportedOperators()
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * GET /api/query-builder/columns
   * Get available Vicidial columns for query building
   */
  getQueryColumns() {
    const fields = this.mapper.getStandardFields();
    const categories = this.mapper.getFieldsByCategory();

    return {
      allColumns: fields.map(f => f.fieldName),
      byCategory: Object.entries(categories).map(([cat, fields]) => ({
        category: cat,
        fields: fields.map(f => f.fieldName)
      })),
      supportedOperators: ['=', '!=', '<>', '<', '>', '<=', '>=', 'IN', 'NOT IN', 'LIKE', 'BETWEEN']
    };
  }

  /**
   * POST /api/query-builder/save
   * Save query for later use
   */
  saveQuery(name, conditions, selectedColumns = [], tableName = 'contacts') {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      const queryId = this.generateId();
      const builder = new QueryBuilder(this.mapper);

      // Build query
      for (const cond of conditions) {
        builder.addCondition(cond.column, cond.operator, cond.value, cond.logicalOp || 'AND');
      }
      if (selectedColumns.length > 0) {
        builder.setSelectedColumns(selectedColumns);
      }

      const query = builder.generateVicidialQuery(tableName);

      // Save to database
      this.db.run(
        `INSERT INTO saved_queries (id, name, conditions_json, query_output, selected_columns) 
         VALUES (?, ?, ?, ?, ?)`,
        [queryId, name, JSON.stringify(conditions), query, JSON.stringify(selectedColumns)]
      );

      return {
        success: true,
        queryId,
        name,
        query
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * GET /api/query-builder/saved
   * Get all saved queries
   */
  getSavedQueries() {
    try {
      if (!this.db) {
        return { queries: [] };
      }

      const queries = this.db.prepare(
        'SELECT id, name, query_output, created_at FROM saved_queries ORDER BY created_at DESC'
      ).all();

      return {
        success: true,
        queries,
        count: queries.length
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * GET /api/query-builder/saved/:id
   * Get specific saved query
   */
  getSavedQuery(queryId) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      const query = this.db.prepare(
        'SELECT * FROM saved_queries WHERE id = ?'
      ).get(queryId);

      if (!query) {
        throw new Error('Query not found');
      }

      return {
        success: true,
        query: {
          ...query,
          conditions: JSON.parse(query.conditions_json),
          selectedColumns: JSON.parse(query.selected_columns)
        }
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * DELETE /api/query-builder/saved/:id
   * Delete saved query
   */
  deleteSavedQuery(queryId) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      this.db.run('DELETE FROM saved_queries WHERE id = ?', [queryId]);

      return {
        success: true,
        message: 'Query deleted'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * GET /api/vicidial/fields
   * Get all Vicidial field definitions
   */
  getVicidialFields() {
    return {
      standardFields: this.mapper.getStandardFields(),
      customFields: this.mapper.getCustomFields(),
      byCategory: this.mapper.getFieldsByCategory()
    };
  }

  /**
   * POST /api/vicidial/field-info
   * Get detailed info about a Vicidial field
   */
  getFieldInfo(fieldName) {
    const info = this.mapper.formatFieldInfo(fieldName);

    if (!info) {
      return {
        success: false,
        error: `Field "${fieldName}" not found`
      };
    }

    return {
      success: true,
      field: info
    };
  }
}

module.exports = APIHandlers;
