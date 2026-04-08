/**
 * Database Schema Migration for Data Import System
 * Creates SQLite tables for storing imports, mappings, validation results, and queries
 */

const migrations = `

-- Table for storing import metadata
CREATE TABLE IF NOT EXISTS data_imports (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_format TEXT,
  record_count INTEGER,
  validation_status TEXT DEFAULT 'pending',
  mapping_json TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for column mappings (source column -> Vicidial field)
CREATE TABLE IF NOT EXISTS column_mappings (
  id TEXT PRIMARY KEY,
  import_id TEXT NOT NULL,
  source_column TEXT NOT NULL,
  vicidial_field TEXT NOT NULL,
  data_type TEXT,
  confidence REAL,
  is_required INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (import_id) REFERENCES data_imports(id) ON DELETE CASCADE,
  UNIQUE(import_id, source_column)
);

-- Table for validation results
CREATE TABLE IF NOT EXISTS validation_results (
  id TEXT PRIMARY KEY,
  import_id TEXT NOT NULL,
  row_number INTEGER NOT NULL,
  issue_type TEXT,
  field_name TEXT,
  field_value TEXT,
  message TEXT,
  severity TEXT DEFAULT 'warning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (import_id) REFERENCES data_imports(id) ON DELETE CASCADE
);

-- Table for duplicate detection
CREATE TABLE IF NOT EXISTS duplicate_records (
  id TEXT PRIMARY KEY,
  import_id TEXT NOT NULL,
  row_number_1 INTEGER,
  row_number_2 INTEGER,
  phone_number TEXT,
  first_name TEXT,
  last_name TEXT,
  duplicate_type TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (import_id) REFERENCES data_imports(id) ON DELETE CASCADE
);

-- Table for storing saved queries
CREATE TABLE IF NOT EXISTS saved_queries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  import_id TEXT,
  conditions_json TEXT NOT NULL,
  query_output TEXT NOT NULL,
  selected_columns TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (import_id) REFERENCES data_imports(id) ON DELETE SET NULL
);

-- Table for query history
CREATE TABLE IF NOT EXISTS query_history (
  id TEXT PRIMARY KEY,
  saved_query_id TEXT,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  execution_status TEXT,
  row_count INTEGER,
  error_message TEXT,
  FOREIGN KEY (saved_query_id) REFERENCES saved_queries(id) ON DELETE SET NULL
);

-- Table for deployment configuration
CREATE TABLE IF NOT EXISTS deployment_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  data_type TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for hardware profile
CREATE TABLE IF NOT EXISTS hardware_profile (
  key TEXT PRIMARY KEY,
  value TEXT,
  data_type TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_imports_date ON data_imports(import_date);
CREATE INDEX IF NOT EXISTS idx_data_imports_status ON data_imports(validation_status);
CREATE INDEX IF NOT EXISTS idx_column_mappings_import ON column_mappings(import_id);
CREATE INDEX IF NOT EXISTS idx_validation_results_import ON validation_results(import_id);
CREATE INDEX IF NOT EXISTS idx_validation_results_type ON validation_results(issue_type);
CREATE INDEX IF NOT EXISTS idx_duplicate_records_import ON duplicate_records(import_id);
CREATE INDEX IF NOT EXISTS idx_saved_queries_import ON saved_queries(import_id);
CREATE INDEX IF NOT EXISTS idx_saved_queries_created ON saved_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_query_history_query ON query_history(saved_query_id);

`;

module.exports = migrations;
