/**
 * Data Importer
 * Handles importing data from Excel, CSV, and plain text files
 */

const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { parse: csv } = require('csv-parse/sync');

class DataImporter {
  constructor() {
    this.importedData = null;
    this.sourceFormat = null;
    this.columns = [];
    this.rows = [];
    this.metadata = {};
  }

  /**
   * Detect file format from extension
   */
  detectFormat(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.xlsx':
      case '.xls':
        return 'excel';
      case '.csv':
        return 'csv';
      case '.txt':
        return 'text';
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  /**
   * Import Excel file (.xlsx)
   */
  importExcel(filePath, options = {}) {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = options.sheetName || workbook.SheetNames[0];
      
      if (!workbook.SheetNames.includes(sheetName)) {
        throw new Error(`Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
      }

      const worksheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json(worksheet, { blankrows: false });

      if (rawData.length === 0) {
        throw new Error('Excel sheet is empty');
      }

      this.columns = Object.keys(rawData[0]);
      this.rows = rawData;
      this.sourceFormat = 'excel';
      this.metadata = {
        filePath,
        fileName: path.basename(filePath),
        sheetName,
        totalSheets: workbook.SheetNames.length,
        availableSheets: workbook.SheetNames,
        rowCount: rawData.length,
        columnCount: this.columns.length,
        importedAt: new Date().toISOString()
      };

      return {
        success: true,
        columns: this.columns,
        rowCount: this.rows.length,
        metadata: this.metadata
      };
    } catch (err) {
      throw new Error(`Excel import failed: ${err.message}`);
    }
  }

  /**
   * Import CSV file
   */
  importCSV(filePath, options = {}) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const delimiter = options.delimiter || this.detectDelimiter(fileContent);

      const records = csv(fileContent, {
        columns: true,
        delimiter,
        skip_empty_lines: true,
        trim: true
      });

      if (records.length === 0) {
        throw new Error('CSV file is empty');
      }

      this.columns = Object.keys(records[0]);
      this.rows = records;
      this.sourceFormat = 'csv';
      this.metadata = {
        filePath,
        fileName: path.basename(filePath),
        delimiter,
        rowCount: records.length,
        columnCount: this.columns.length,
        importedAt: new Date().toISOString()
      };

      return {
        success: true,
        columns: this.columns,
        rowCount: this.rows.length,
        delimiter,
        metadata: this.metadata
      };
    } catch (err) {
      throw new Error(`CSV import failed: ${err.message}`);
    }
  }

  /**
   * Auto-detect CSV delimiter
   */
  detectDelimiter(fileContent) {
    const delimiters = [',', ';', '\t', '|'];
    const firstLine = fileContent.split('\n')[0];

    for (const delim of delimiters) {
      if (firstLine.includes(delim)) {
        return delim;
      }
    }

    return ','; // Default to comma
  }

  /**
   * Import plain text file with custom delimiter
   */
  importText(filePath, options = {}) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const delimiter = options.delimiter || '\t';
      const headerRow = options.headerRow !== false; // Default true

      const lines = fileContent.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        throw new Error('Text file is empty');
      }

      let columns = [];
      let startIdx = 0;

      if (headerRow) {
        columns = lines[0].split(delimiter).map(col => col.trim());
        startIdx = 1;
      } else {
        // Auto-generate column names
        const firstDataLine = lines[0].split(delimiter);
        columns = Array.from({ length: firstDataLine.length }, (_, i) => `Column${i + 1}`);
      }

      const records = [];
      for (let i = startIdx; i < lines.length; i++) {
        const values = lines[i].split(delimiter);
        const record = {};
        
        for (let j = 0; j < columns.length; j++) {
          record[columns[j]] = values[j] ? values[j].trim() : '';
        }
        
        records.push(record);
      }

      this.columns = columns;
      this.rows = records;
      this.sourceFormat = 'text';
      this.metadata = {
        filePath,
        fileName: path.basename(filePath),
        delimiter,
        hasHeader: headerRow,
        rowCount: records.length,
        columnCount: columns.length,
        importedAt: new Date().toISOString()
      };

      return {
        success: true,
        columns,
        rowCount: records.length,
        delimiter,
        metadata: this.metadata
      };
    } catch (err) {
      throw new Error(`Text import failed: ${err.message}`);
    }
  }

  /**
   * Universal import function - detects format and imports
   */
  import(filePath, options = {}) {
    const format = this.detectFormat(filePath);

    switch (format) {
      case 'excel':
        return this.importExcel(filePath, options);
      case 'csv':
        return this.importCSV(filePath, options);
      case 'text':
        return this.importText(filePath, options);
      default:
        throw new Error(`Unknown format: ${format}`);
    }
  }

  /**
   * Get imported data as JSON
   */
  getData() {
    return {
      columns: this.columns,
      rows: this.rows,
      format: this.sourceFormat,
      metadata: this.metadata
    };
  }

  /**
   * Get specific columns
   */
  getColumns(columnNames = null) {
    if (!columnNames) {
      return this.columns;
    }

    return this.rows.map(row => {
      const record = {};
      columnNames.forEach(col => {
        record[col] = row[col] || null;
      });
      return record;
    });
  }

  /**
   * Filter rows by criteria
   */
  filterRows(predicate) {
    return this.rows.filter(predicate);
  }

  /**
   * Get row count
   */
  getRowCount() {
    return this.rows.length;
  }

  /**
   * Get column count
   */
  getColumnCount() {
    return this.columns.length;
  }

  /**
   * Get sample data (first N rows)
   */
  getSample(limit = 5) {
    return {
      columns: this.columns,
      rows: this.rows.slice(0, limit),
      total: this.rows.length,
      sample: limit
    };
  }

  /**
   * Export to different format
   */
  exportTo(format, outputPath) {
    const data = {
      columns: this.columns,
      rows: this.rows
    };

    switch (format.toLowerCase()) {
      case 'json':
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        break;

      case 'csv':
        const csv = [
          this.columns.join(','),
          ...this.rows.map(row => 
            this.columns.map(col => {
              const value = row[col] || '';
              return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value;
            }).join(',')
          )
        ].join('\n');
        fs.writeFileSync(outputPath, csv);
        break;

      case 'xlsx':
        const ws = xlsx.utils.json_to_sheet(this.rows);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Data');
        xlsx.writeFile(wb, outputPath);
        break;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    return { success: true, outputPath, format };
  }

  /**
   * Get data statistics
   */
  getStatistics() {
    const stats = {
      totalRows: this.rows.length,
      totalColumns: this.columns.length,
      columnStats: {}
    };

    // Calculate per-column statistics
    for (const col of this.columns) {
      const values = this.rows.map(row => row[col]);
      const nonEmpty = values.filter(v => v && v.toString().trim() !== '');

      stats.columnStats[col] = {
        name: col,
        total: values.length,
        filled: nonEmpty.length,
        empty: values.length - nonEmpty.length,
        fillRate: `${Math.round((nonEmpty.length / values.length) * 100)}%`,
        sampleValues: nonEmpty.slice(0, 3)
      };
    }

    return stats;
  }

  /**
   * Trim all string values (remove leading/trailing whitespace)
   */
  trimAllValues() {
    this.rows = this.rows.map(row => {
      const trimmedRow = {};
      for (const [key, value] of Object.entries(row)) {
        trimmedRow[key] = typeof value === 'string' ? value.trim() : value;
      }
      return trimmedRow;
    });
    return this;
  }

  /**
   * Remove empty rows
   */
  removeEmptyRows() {
    this.rows = this.rows.filter(row => {
      return Object.values(row).some(val => val && val.toString().trim() !== '');
    });
    return this;
  }

  /**
   * Clear imported data
   */
  clear() {
    this.importedData = null;
    this.sourceFormat = null;
    this.columns = [];
    this.rows = [];
    this.metadata = {};
    return this;
  }

  /**
   * Get Excel sheet names without importing full data
   */
  getExcelSheetNames(filePath) {
    try {
      const workbook = xlsx.readFile(filePath);
      return {
        sheets: workbook.SheetNames,
        default: workbook.SheetNames[0]
      };
    } catch (err) {
      throw new Error(`Failed to read Excel sheets: ${err.message}`);
    }
  }
}

module.exports = DataImporter;
