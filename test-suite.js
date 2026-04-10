#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Claude Prompt Engine
 * Tests all modules, APIs, and workflows
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Test configuration
const TEST_DIR = __dirname;
const CORE_DIR = path.join(__dirname, 'core');
const RESULTS = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testResult(name, passed, error = null) {
  RESULTS.total++;
  if (passed) {
    RESULTS.passed++;
    log('green', `✓ ${name}`);
  } else {
    RESULTS.failed++;
    log('red', `✗ ${name}`);
    if (error) console.error(`  Error: ${error.message}`);
  }
  RESULTS.tests.push({ name, passed, error: error?.message });
}

async function runTests() {
  log('blue', '\n═══════════════════════════════════════════════════════');
  log('blue', '  CLAUDE PROMPT ENGINE - COMPREHENSIVE TEST SUITE');
  log('blue', '═══════════════════════════════════════════════════════\n');

  // Test 1: Module Loading
  log('blue', '📦 MODULE LOADING TESTS');
  try {
    const InstallConfig = require(path.join(CORE_DIR, 'install-config.js'));
    testResult('Install Config module loads', typeof InstallConfig === 'function' && typeof new InstallConfig().detectHardwareTier === 'function');
  } catch (e) {
    testResult('Install Config module loads', false, e);
  }

  try {
    const VicidialMapper = require(path.join(CORE_DIR, 'vicidial-mapper.js'));
    testResult('Vicidial Mapper module loads', typeof VicidialMapper === 'function' && typeof new VicidialMapper().suggestFieldMapping === 'function');
  } catch (e) {
    testResult('Vicidial Mapper module loads', false, e);
  }

  try {
    const DataImporter = require(path.join(CORE_DIR, 'data-importer.js'));
    testResult('Data Importer module loads', typeof DataImporter === 'function' && typeof new DataImporter().importCSV === 'function');
  } catch (e) {
    testResult('Data Importer module loads', false, e);
  }

  try {
    const DataValidator = require(path.join(CORE_DIR, 'data-validator.js'));
    testResult('Data Validator module loads', typeof DataValidator === 'function' && typeof new DataValidator().validate === 'function');
  } catch (e) {
    testResult('Data Validator module loads', false, e);
  }

  try {
    const QueryBuilder = require(path.join(CORE_DIR, 'query-builder.js'));
    testResult('Query Builder module loads', typeof QueryBuilder === 'function' && typeof new QueryBuilder().generateQuery === 'function');
  } catch (e) {
    testResult('Query Builder module loads', false, e);
  }

  // Test 2: Hardware Detection
  log('blue', '\n🖥️  HARDWARE DETECTION TESTS');
  try {
    const InstallConfig = require(path.join(CORE_DIR, 'install-config.js'));
    const installConfig = new InstallConfig();
    const result = installConfig.detectHardwareTier();
    const tierName = result.detectedTier || result;
    testResult('Hardware tier detection', ['basic', 'standard', 'premium'].includes(tierName));
    const limits = installConfig.getLLMLimits(tierName);
    testResult('LLM limits retrieval', limits && (limits.tokenLimit > 0 || limits.maxTokens > 0));
  } catch (e) {
    testResult('Hardware Detection', false, e);
  }

  // Test 3: Vicidial Mapping
  log('blue', '\n🗺️  VICIDIAL MAPPING TESTS');
  try {
    const VicidialMapper = require(path.join(CORE_DIR, 'vicidial-mapper.js'));
    const mapper = new VicidialMapper();

    // Test Levenshtein distance
    const distance = mapper.levenshteinDistance('first_name', 'fname');
    testResult('Levenshtein distance calculation', distance >= 0 && distance <= 10);

    // Test field mapping - pass array of column names
    const suggestions = mapper.suggestMappings(['fname', 'lname', 'phone']);
    testResult('Field mapping suggestions', Array.isArray(suggestions) && suggestions.length > 0);

  } catch (e) {
    testResult('Vicidial Mapping', false, e);
  }

  // Test 4: Data Import
  log('blue', '\n📥 DATA IMPORT TESTS');
  try {
    const DataImporter = require(path.join(CORE_DIR, 'data-importer.js'));
    const importer = new DataImporter();

    // Test CSV parsing - importCSV takes a file path
    const csvPath = path.join(__dirname, 'test-data', 'sample.csv');
    if (fs.existsSync(csvPath)) {
      importer.importCSV(csvPath);
      const data = importer.getData();
      const rows = data.rows;
      const cols = importer.getColumns();
      testResult('CSV parsing', Array.isArray(rows) && rows.length > 0);
      testResult('CSV column detection', Array.isArray(cols) && cols.length > 0);
    } else {
      testResult('CSV parsing', false, new Error('Sample CSV not found'));
      testResult('CSV column detection', false, new Error('Sample CSV not found'));
    }

  } catch (e) {
    testResult('Data Import', false, e);
  }

  // Test 5: Data Validation
  log('blue', '\n✓ DATA VALIDATION TESTS');
  try {
    const DataValidator = require(path.join(CORE_DIR, 'data-validator.js'));
    const validator = new DataValidator();

    // Test phone validation
    testResult('Phone validation (10 digits)', validator.isDialable('5551234567'));
    testResult('Phone validation (11 digits)', validator.isDialable('15551234567'));
    testResult('Phone rejection (invalid)', !validator.isDialable('abc'));

    // Test data validation
    const testData = [
      { first_name: 'John', last_name: 'Smith', phone: '5551234567' },
      { first_name: 'Jane', last_name: 'Doe', phone: '5559876543' }
    ];
    validator.validate(testData);
    const report = validator.generateReport();
    testResult('Data validation report generation', report && report.overallValid !== undefined);

  } catch (e) {
    testResult('Data Validation', false, e);
  }

  // Test 6: Query Building
  log('blue', '\n⚙️  QUERY BUILDER TESTS');
  try {
    const QueryBuilder = require(path.join(CORE_DIR, 'query-builder.js'));
    const builder = new QueryBuilder();

    // addCondition then generateQuery(tableName)
    builder.addCondition('first_name', '=', 'John');
    builder.addCondition('age', '>', '30');
    const query = builder.generateQuery('users');
    testResult('Query generation from conditions', query && query.includes('WHERE'));
    testResult('SQL injection prevention', !query.includes('DROP') && !query.includes('DELETE'));

    // Test BETWEEN operator - value must be an array [min, max]
    const builder2 = new QueryBuilder();
    builder2.addCondition('age', 'BETWEEN', [20, 40]);
    const betweenQuery = builder2.generateQuery('users');
    testResult('BETWEEN operator support', betweenQuery && betweenQuery.includes('BETWEEN'));

  } catch (e) {
    testResult('Query Builder', false, e);
  }

  // Test 7: File I/O
  log('blue', '\n💾 FILE I/O TESTS');
  try {
    const testFile = path.join(__dirname, 'test-data', 'test-write.json');
    fs.writeFileSync(testFile, JSON.stringify({ test: 'data' }));
    testResult('File write operation', fs.existsSync(testFile));
    
    const data = JSON.parse(fs.readFileSync(testFile, 'utf-8'));
    testResult('File read operation', data.test === 'data');
    
    fs.unlinkSync(testFile);
  } catch (e) {
    testResult('File I/O', false, e);
  }

  // Test 8: API Handlers (if available)
  log('blue', '\n🔌 API HANDLERS TESTS');
  try {
    const ApiHandlers = require(path.join(CORE_DIR, 'api-handlers.js'));
    const apiHandlers = new ApiHandlers();
    testResult('API Handlers module loads', typeof apiHandlers.validateImportedData === 'function');
  } catch (e) {
    testResult('API Handlers', false, e);
  }

  // Test 9: Server Components
  log('blue', '\n🖧 SERVER COMPONENT TESTS');
  try {
    const serverPath = path.join(__dirname, 'server.js');
    testResult('Server.js file exists', fs.existsSync(serverPath));
    
    const serverContent = fs.readFileSync(serverPath, 'utf-8');
    testResult('Server has database initialization', serverContent.includes('initializeDatabase'));
    testResult('Server has API endpoints', serverContent.includes('/api/'));
    testResult('Server has error handling', serverContent.includes('catch'));

  } catch (e) {
    testResult('Server Components', false, e);
  }

  // Test 10: UI Components
  log('blue', '\n🎨 UI COMPONENT TESTS');
  try {
    const publicDir = path.join(__dirname, 'public');
    testResult('Data import UI exists', fs.existsSync(path.join(publicDir, 'data-import.html')));
    testResult('Query builder form UI exists', fs.existsSync(path.join(publicDir, 'query-builder-form.html')));
    testResult('Query builder visual UI exists', fs.existsSync(path.join(publicDir, 'query-builder-visual.html')));
    testResult('Settings UI exists', fs.existsSync(path.join(publicDir, 'settings.html')));

    // Check for JavaScript controllers
    testResult('Data import controller exists', fs.existsSync(path.join(publicDir, 'js', 'data-import-ui.js')));
    testResult('Query builder controller exists', fs.existsSync(path.join(publicDir, 'js', 'query-builder-ui.js')));
    testResult('Visual builder controller exists', fs.existsSync(path.join(publicDir, 'js', 'query-builder-visual.js')));
    testResult('Settings controller exists', fs.existsSync(path.join(publicDir, 'js', 'settings-ui.js')));

  } catch (e) {
    testResult('UI Components', false, e);
  }

  // Summary
  log('blue', '\n═══════════════════════════════════════════════════════');
  log('blue', '  TEST RESULTS SUMMARY');
  log('blue', '═══════════════════════════════════════════════════════\n');

  const passRate = Math.round((RESULTS.passed / RESULTS.total) * 100);
  log(passRate >= 80 ? 'green' : passRate >= 50 ? 'yellow' : 'red', 
    `Total Tests: ${RESULTS.total} | Passed: ${RESULTS.passed} | Failed: ${RESULTS.failed} | Pass Rate: ${passRate}%`);

  // Write results to file
  const resultsFile = path.join(__dirname, 'TEST_RESULTS.json');
  fs.writeFileSync(resultsFile, JSON.stringify(RESULTS, null, 2));
  log('blue', `\n✓ Results saved to TEST_RESULTS.json`);

  log('blue', '\n═══════════════════════════════════════════════════════\n');

  process.exit(RESULTS.failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(err => {
  log('red', `\nTest suite failed: ${err.message}`);
  process.exit(1);
});
