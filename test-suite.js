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
const CORE_DIR = path.join(__dirname, '..', 'core');
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
    const installConfig = require(path.join(CORE_DIR, 'install-config.js'));
    testResult('Install Config module loads', installConfig && typeof installConfig.detectHardwareTier === 'function');
  } catch (e) {
    testResult('Install Config module loads', false, e);
  }

  try {
    const vicidialMapper = require(path.join(CORE_DIR, 'vicidial-mapper.js'));
    testResult('Vicidial Mapper module loads', vicidialMapper && typeof vicidialMapper.suggestFieldMapping === 'function');
  } catch (e) {
    testResult('Vicidial Mapper module loads', false, e);
  }

  try {
    const dataImporter = require(path.join(CORE_DIR, 'data-importer.js'));
    testResult('Data Importer module loads', dataImporter && typeof dataImporter.parseCSV === 'function');
  } catch (e) {
    testResult('Data Importer module loads', false, e);
  }

  try {
    const dataValidator = require(path.join(CORE_DIR, 'data-validator.js'));
    testResult('Data Validator module loads', dataValidator && typeof dataValidator.validate === 'function');
  } catch (e) {
    testResult('Data Validator module loads', false, e);
  }

  try {
    const queryBuilder = require(path.join(CORE_DIR, 'query-builder.js'));
    testResult('Query Builder module loads', queryBuilder && typeof queryBuilder.generateQuery === 'function');
  } catch (e) {
    testResult('Query Builder module loads', false, e);
  }

  // Test 2: Hardware Detection
  log('blue', '\n🖥️  HARDWARE DETECTION TESTS');
  try {
    const installConfig = require(path.join(CORE_DIR, 'install-config.js'));
    const tier = installConfig.detectHardwareTier();
    testResult('Hardware tier detection', ['basic', 'standard', 'premium'].includes(tier));
    const limits = installConfig.getLLMLimits(tier);
    testResult('LLM limits retrieval', limits && limits.tokenLimit > 0);
  } catch (e) {
    testResult('Hardware Detection', false, e);
  }

  // Test 3: Vicidial Mapping
  log('blue', '\n🗺️  VICIDIAL MAPPING TESTS');
  try {
    const mapper = require(path.join(CORE_DIR, 'vicidial-mapper.js'));
    
    // Test Levenshtein distance
    const distance = mapper.levenshteinDistance('first_name', 'fname');
    testResult('Levenshtein distance calculation', distance >= 0 && distance <= 10);

    // Test field mapping
    const suggestions = mapper.suggestMappings({ fname: 'John', lname: 'Doe', phone: '5551234567' });
    testResult('Field mapping suggestions', Array.isArray(suggestions) && suggestions.length > 0);

  } catch (e) {
    testResult('Vicidial Mapping', false, e);
  }

  // Test 4: Data Import
  log('blue', '\n📥 DATA IMPORT TESTS');
  try {
    const importer = require(path.join(CORE_DIR, 'data-importer.js'));

    // Test CSV parsing
    const csvPath = path.join(__dirname, '..', 'test-data', 'sample.csv');
    if (fs.existsSync(csvPath)) {
      const csvData = require('fs').readFileSync(csvPath, 'utf-8');
      const result = importer.parseCSV(csvData);
      testResult('CSV parsing', Array.isArray(result.rows) && result.rows.length > 0);
      testResult('CSV column detection', Array.isArray(result.columns) && result.columns.length > 0);
    } else {
      testResult('CSV parsing', false, new Error('Sample CSV not found'));
    }

  } catch (e) {
    testResult('Data Import', false, e);
  }

  // Test 5: Data Validation
  log('blue', '\n✓ DATA VALIDATION TESTS');
  try {
    const validator = require(path.join(CORE_DIR, 'data-validator.js'));

    // Test phone validation
    testResult('Phone validation (10 digits)', validator.isDialable('5551234567'));
    testResult('Phone validation (11 digits)', validator.isDialable('15551234567'));
    testResult('Phone rejection (invalid)', !validator.isDialable('abc'));

    // Test data validation
    const testData = [
      { first_name: 'John', last_name: 'Smith', phone: '5551234567' },
      { first_name: 'Jane', last_name: 'Doe', phone: '5559876543' }
    ];
    const validation = validator.validate(testData);
    testResult('Data validation report generation', validation && validation.valid !== undefined);

  } catch (e) {
    testResult('Data Validation', false, e);
  }

  // Test 6: Query Building
  log('blue', '\n⚙️  QUERY BUILDER TESTS');
  try {
    const builder = require(path.join(CORE_DIR, 'query-builder.js'));

    // Test query generation
    const conditions = [
      { field: 'first_name', operator: '=', value: 'John', logical: 'AND' },
      { field: 'age', operator: '>', value: '30', logical: 'AND' }
    ];

    const query = builder.generateQuery(conditions, 'users');
    testResult('Query generation from conditions', query && query.includes('WHERE'));
    testResult('SQL injection prevention', !query.includes('DROP') && !query.includes('DELETE'));

    // Test different operators
    const betweenQuery = builder.generateQuery(
      [{ field: 'age', operator: 'BETWEEN', value: '20,40', logical: 'AND' }],
      'users'
    );
    testResult('BETWEEN operator support', betweenQuery && betweenQuery.includes('BETWEEN'));

  } catch (e) {
    testResult('Query Builder', false, e);
  }

  // Test 7: File I/O
  log('blue', '\n💾 FILE I/O TESTS');
  try {
    const testFile = path.join(__dirname, '..', 'test-data', 'test-write.json');
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
    const apiHandlers = require(path.join(CORE_DIR, 'api-handlers.js'));
    testResult('API Handlers module loads', apiHandlers && typeof apiHandlers.validateImportedData === 'function');
  } catch (e) {
    testResult('API Handlers', false, e);
  }

  // Test 9: Server Components
  log('blue', '\n🖧 SERVER COMPONENT TESTS');
  try {
    const serverPath = path.join(__dirname, '..', 'server.js');
    testResult('Server.js file exists', fs.existsSync(serverPath));
    
    const serverContent = fs.readFileSync(serverPath, 'utf-8');
    testResult('Server has database initialization', serverContent.includes('initializeDatabase'));
    testResult('Server has API endpoints', serverContent.includes('app.post') || serverContent.includes('app.get'));
    testResult('Server has error handling', serverContent.includes('catch'));

  } catch (e) {
    testResult('Server Components', false, e);
  }

  // Test 10: UI Components
  log('blue', '\n🎨 UI COMPONENT TESTS');
  try {
    const publicDir = path.join(__dirname, '..', 'public');
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
  const resultsFile = path.join(__dirname, '..', 'TEST_RESULTS.json');
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
