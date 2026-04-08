# Advanced MySQL Query Generator - Data Analysis Based

## Overview

The **Advanced MySQL Query Generator** analyzes imported data files and intelligently generates optimized MySQL queries based on detected data patterns. This goes beyond manual query building by:

1. **Analyzing Data** - Examines imported records to detect columns, data types, and patterns
2. **Profiling Columns** - Identifies phone numbers, emails, dates, numeric ranges
3. **Suggesting Queries** - Proposes optimized queries for common use cases
4. **Generating Queries** - Creates MySQL queries based on analyzed data characteristics
5. **Vicidial Mapping** - Applies Vicidial field mapping to generated queries

---

## Features

### 1. Automatic Data Analysis

```javascript
// Analyze imported data
const generator = new AdvancedMySQLQueryGenerator(vicidialMapper);
const analysis = generator.analyzeData(importedRows, columnNames);

// Returns analysis profile with:
// - Column statistics (min, max, distinct values)
// - Detected data types (phone, email, date, number, string)
// - Suggested queries for each column
// - Data quality metrics
```

### 2. Intelligent Data Type Detection

| Data Type | Detection Method | Example Values |
|-----------|-----------------|-----------------|
| **phone** | Pattern matching | 5551234567, (555)123-4567, +1-555-123-4567 |
| **email** | Regex validation | user@example.com, john.doe@company.co.uk |
| **date** | Format detection | 2026-04-08, 04/08/2026, 04-08-26 |
| **number** | Numeric test | 42, 3.14, -100, 9999999 |
| **string** | Default | Any text value |

### 3. Automatic Query Suggestions

For each analyzed column, generates:

```javascript
{
  type: 'phone_query',
  title: 'Find records by phone number',
  description: 'Query phone numbers from column_name',
  template: { /* query template */ },
  field: 'column_name'
}
```

### 4. Data-Aware Query Generation

```javascript
// Generate query for phone column
const query = generator.generateQuery(
  'phone',                    // Column name
  '=',                       // Operator
  '5551234567',              // Value
  'contacts',                // Table
  ['first_name', 'phone']    // Columns to select
);

// Returns: SELECT first_name, phone FROM contacts WHERE phone = '5551234567';
```

---

## Usage Examples

### Basic Analysis

```javascript
// Import data
const importer = new DataImporter();
const result = importer.parseCSV(csvContent);

// Create generator
const mapper = new VicidialMapper();
const generator = new AdvancedMySQLQueryGenerator(mapper);

// Analyze
const analysis = generator.analyzeData(result.rows, result.columns);

// Get suggestions
console.log(analysis.suggestedQueries);
```

### Generate Query by Data Type

```javascript
// Phone query
const phoneQuery = generator.generateQuery(
  'phone',
  '=',
  '5551234567',
  'contacts'
);
// Result: SELECT * FROM contacts WHERE phone = '5551234567';

// Date range query
const dateQuery = generator.generateQuery(
  'created_date',
  'BETWEEN',
  ['2026-01-01', '2026-12-31'],
  'contacts'
);
// Result: SELECT * FROM contacts WHERE created_date BETWEEN '2026-01-01' AND '2026-12-31';

// Multiple values query
const multiQuery = generator.generateQuery(
  'status',
  'IN',
  ['Active', 'Pending', 'Review'],
  'contacts'
);
// Result: SELECT * FROM contacts WHERE status IN ('Active', 'Pending', 'Review');
```

### With Vicidial Mapping

```javascript
// Automatically maps field names to Vicidial standards
const query = generator.generateQuery(
  'first_name',              // Input column
  '=',
  'John',
  'contacts'
);

// Result: SELECT * FROM vicidial_list WHERE first_name = 'John';
// (first_name automatically mapped from analysis)
```

### Bulk Query Generation

```javascript
// Generate multiple queries
const queries = generator.generateBulkQueries([
  { columnName: 'phone', operator: '=', value: '5551234567' },
  { columnName: 'age', operator: '>', value: '30' },
  { columnName: 'status', operator: 'IN', value: ['Active', 'Pending'] }
]);

// Returns array of generated queries
```

### Get Analysis Report

```javascript
// Detailed analysis report
const report = generator.getAnalysisReport();

// Contains:
// {
//   summary: { totalRows, totalColumns, columns },
//   columnStats: { /* stats for each column */ },
//   dataTypes: { /* detected types */ },
//   suggestedQueries: [ /* all suggestions */ ],
//   timestamp: '2026-04-08T...'
// }
```

---

## Column Type Support

### Phone Numbers

**Detection**: 10-15 digit patterns with optional formatting

**Operators**: `=`, `!=`, `LIKE`, `IN`, `NOT IN`, `IS NULL`, `IS NOT NULL`

**Examples**:
```sql
SELECT * FROM contacts WHERE phone = '5551234567';
SELECT * FROM contacts WHERE phone LIKE '555%';
SELECT * FROM contacts WHERE phone IN ('5551234567', '5559876543');
```

### Email Addresses

**Detection**: Standard email format validation

**Operators**: `=`, `!=`, `LIKE`, `IN`, `NOT IN`, `IS NULL`, `IS NOT NULL`

**Examples**:
```sql
SELECT * FROM contacts WHERE email = 'john@example.com';
SELECT * FROM contacts WHERE email LIKE '%example.com%';
SELECT * FROM contacts WHERE email LIKE '%gmail.com%';
```

### Numeric Values

**Detection**: Integer and float values

**Operators**: `=`, `!=`, `<`, `>`, `<=`, `>=`, `BETWEEN`, `IN`, `NOT IN`

**Examples**:
```sql
SELECT * FROM contacts WHERE age > 30;
SELECT * FROM contacts WHERE salary BETWEEN 50000 AND 100000;
SELECT * FROM contacts WHERE score IN (85, 90, 95);
```

### Date Values

**Detection**: ISO format or common date patterns

**Operators**: `=`, `!=`, `<`, `>`, `<=`, `>=`, `BETWEEN`

**Examples**:
```sql
SELECT * FROM contacts WHERE created_date = '2026-04-08';
SELECT * FROM contacts WHERE created_date > '2026-01-01';
SELECT * FROM contacts WHERE birth_date BETWEEN '1990-01-01' AND '2000-12-31';
```

### String/Text Values

**Detection**: Non-numeric text, low distinct count

**Operators**: `=`, `!=`, `LIKE`, `IN`, `NOT IN`, `IS NULL`, `IS NOT NULL`

**Examples**:
```sql
SELECT * FROM contacts WHERE status = 'Active';
SELECT * FROM contacts WHERE city IN ('New York', 'Los Angeles', 'Chicago');
SELECT * FROM contacts WHERE name LIKE '%Smith%';
```

---

## API Reference

### Constructor

```javascript
new AdvancedMySQLQueryGenerator(vicidialMapper = null)
```

**Parameters**:
- `vicidialMapper` (optional): VicidialMapper instance for field mapping

### Methods

#### `analyzeData(rows, columns)`

Analyze imported data to extract metadata for query generation.

```javascript
const analysis = generator.analyzeData(rows, columns);
```

**Returns**: 
```javascript
{
  totalRows: number,
  columns: string[],
  columnStats: Object,
  distinctValues: Object,
  dataTypes: Object,
  suggestedQueries: Array
}
```

#### `generateQuery(columnName, operator, value, tableName, selectColumns)`

Generate MySQL query based on analyzed data.

```javascript
const query = generator.generateQuery(
  'phone',                   // columnName
  '=',                      // operator
  '5551234567',             // value
  'contacts',               // tableName (default)
  ['first_name', 'phone']   // selectColumns (default: *)
);
```

**Returns**: MySQL query string

**Supported Operators**:
- Comparison: `=`, `!=`, `<>`, `<`, `>`, `<=`, `>=`
- Pattern: `LIKE`, `NOT LIKE`
- List: `IN`, `NOT IN`
- Range: `BETWEEN`
- Null: `IS NULL`, `IS NOT NULL`

#### `generateBulkQueries(queryDefinitions, tableName)`

Generate multiple queries.

```javascript
const queries = generator.generateBulkQueries([
  { columnName: 'phone', operator: '=', value: '5551234567' },
  { columnName: 'age', operator: '>', value: '30' }
]);
```

**Returns**: Array of query strings

#### `getAnalysisReport()`

Get detailed analysis report.

```javascript
const report = generator.getAnalysisReport();
```

**Returns**: Complete analysis profile

#### `getSuggestedQuery(columnName)`

Get suggested queries for specific column.

```javascript
const suggestions = generator.getSuggestedQuery('phone');
```

**Returns**: Array of suggested query objects

#### `exportAnalysis()`

Export analysis as JSON.

```javascript
const json = generator.exportAnalysis();
```

**Returns**: JSON string

---

## Integration with Existing System

### In Data Import Workflow

```javascript
// Step 1: Import data
const importer = new DataImporter();
const imported = importer.parseCSV(csvContent);

// Step 2: Validate data
const validator = new DataValidator();
const validation = validator.validate(imported.rows);

// Step 3: Analyze for queries
const queryGen = new AdvancedMySQLQueryGenerator(vicidialMapper);
const analysis = queryGen.analyzeData(imported.rows, imported.columns);

// Step 4: Present suggestions to user
displaySuggestedQueries(analysis.suggestedQueries);

// Step 5: Generate query when user selects
const query = queryGen.generateQuery(userSelection);
```

### In REST API

```javascript
// POST /api/query-builder/analyze
app.post('/api/query-builder/analyze', (req, res) => {
  const generator = new AdvancedMySQLQueryGenerator(vicidialMapper);
  const analysis = generator.analyzeData(req.body.rows, req.body.columns);
  res.json(analysis);
});

// POST /api/query-builder/generate-from-analysis
app.post('/api/query-builder/generate-from-analysis', (req, res) => {
  const generator = new AdvancedMySQLQueryGenerator(vicidialMapper);
  generator.analyzeData(req.body.rows, req.body.columns);
  
  const query = generator.generateQuery(
    req.body.columnName,
    req.body.operator,
    req.body.value,
    req.body.tableName
  );
  
  res.json({ query });
});
```

---

## Performance Characteristics

| Operation | Time | Rows |
|-----------|------|------|
| Data Analysis | < 100ms | 10,000 |
| Query Generation | < 10ms | Any |
| Bulk Generation (10 queries) | < 50ms | Any |
| Type Detection | < 50ms | 10,000 |

---

## Error Handling

```javascript
try {
  const analysis = generator.analyzeData(rows, columns);
} catch (error) {
  if (error.message.includes('No data')) {
    console.log('Import data first');
  }
}

try {
  const query = generator.generateQuery('unknown_col', '=', 'value');
} catch (error) {
  if (error.message.includes('not found')) {
    console.log('Column does not exist in analyzed data');
  }
}

try {
  const query = generator.generateQuery('phone', 'INVALID_OP', '555');
} catch (error) {
  if (error.message.includes('not valid')) {
    console.log('Operator not supported for this column type');
  }
}
```

---

## Future Enhancements

- [ ] Machine learning for query optimization
- [ ] Query performance prediction
- [ ] Advanced JOIN detection
- [ ] GROUP BY/HAVING suggestion
- [ ] Aggregate function suggestions
- [ ] Index optimization recommendations
- [ ] Query caching and history
- [ ] Multi-table query generation

---

## Related Documentation

- [Data Importer](./data-importer.md)
- [Data Validator](./data-validator.md)
- [Vicidial Mapper](./vicidial-mapper.md)
- [Query Builder (Basic)](./query-builder.md)
- [API Reference](../COMPREHENSIVE_DOCS.md#api-reference)

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: April 8, 2026
