# Claude Prompt Engine - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [System Architecture](#system-architecture)
4. [Installation](#installation)
5. [Features](#features)
6. [API Reference](#api-reference)
7. [User Guide](#user-guide)
8. [Configuration](#configuration)
9. [Troubleshooting](#troubleshooting)
10. [Development](#development)

---

## Project Overview

**Claude Prompt Engine** is a comprehensive, enterprise-grade platform for:
- 📊 **Data Import & Processing** - Import CSV, Excel, and text files with intelligent validation
- 🔍 **Intelligent Query Building** - Visual and form-based SQL query builders
- 📱 **Vicidial Integration** - Map data fields to Vicidial telephony standard
- ⚙️ **Hardware-Aware Deployment** - Auto-detect system resources and optimize configuration
- 🖧 **REST API** - Full-featured API for programmatic access
- 🎨 **Modern UI** - Glasmorphic design with responsive layouts
- 🔒 **Data Validation** - Phone validation, duplicate detection, data quality checks

### Use Cases
- Contact center data management
- Telephony platform configuration
- Bulk data import and mapping
- Complex query generation for databases
- Multi-deployment scenario support (local, server, cloud)

---

## Quick Start

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- 4GB RAM minimum (8GB recommended)

### Installation (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/claude-prompt-engine.git
cd claude-prompt-engine

# 2. Install dependencies
npm install

# 3. Start the server
npm run web

# 4. Open in browser
# Navigate to: http://localhost:3000
```

### First Run
1. Visit `http://localhost:3000/settings.html` to configure hardware tier
2. Go to `http://localhost:3000/data-import.html` to import your first dataset
3. Use `http://localhost:3000/query-builder-form.html` to build queries
4. Check `http://localhost:3000/query-builder-visual.html` for visual query design

---

## System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│         PRESENTATION LAYER                  │
│  (HTML/CSS/JavaScript - Browser UI)        │
│  • data-import.html                        │
│  • query-builder-form.html                 │
│  • query-builder-visual.html               │
│  • settings.html                           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│         CONTROLLER LAYER                    │
│  (JavaScript Controllers - DOM Interaction)│
│  • data-import-ui.js (562 lines)           │
│  • query-builder-ui.js (518 lines)         │
│  • query-builder-visual.js (370 lines)     │
│  • settings-ui.js (570 lines)              │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│         REST API LAYER                      │
│  (Express-like HTTP handlers)              │
│  • 27 API endpoints                        │
│  • CORS enabled                            │
│  • Error handling middleware               │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│         BUSINESS LOGIC LAYER                │
│  (Core Modules - 6 modules, 50K+ lines)   │
│  • install-config.js (Hardware detection)  │
│  • vicidial-mapper.js (Field mapping)      │
│  • data-importer.js (File parsing)         │
│  • data-validator.js (Validation engine)   │
│  • query-builder.js (Query generation)     │
│  • api-handlers.js (API orchestration)     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│         DATA ACCESS LAYER                   │
│  (SQLite Database)                         │
│  • 8 tables with 9 indexes                 │
│  • Transactional integrity                 │
│  • Data persistence                        │
└─────────────────────────────────────────────┘
```

### Core Module Dependencies

```
data-importer.js
      ↓
data-validator.js
      ↓
vicidial-mapper.js ← install-config.js
      ↓
query-builder.js
      ↓
api-handlers.js
      ↓
server.js → SQLite Database
```

---

## Installation

### Option 1: NPM Installation (Recommended)

```bash
git clone https://github.com/yourusername/claude-prompt-engine.git
cd claude-prompt-engine
npm install
npm run web
```

### Option 2: Docker Installation

```bash
docker build -t claude-prompt-engine .
docker run -p 3000:3000 claude-prompt-engine
```

### Option 3: Self-Contained Installer (Windows/Mac/Linux)

```bash
# For Windows
installer/claude-prompt-engine-installer.exe

# For Mac
installer/claude-prompt-engine-installer.dmg

# For Linux
chmod +x installer/claude-prompt-engine-installer.sh
./installer/claude-prompt-engine-installer.sh
```

### Option 4: Cloud Deployment

```bash
# Heroku
git push heroku main

# AWS Lambda / Google Cloud / Azure
See deployment-guides/ directory
```

---

## Features

### 1. Data Import Wizard (5-Step Process)
- **Step 1**: Upload files (CSV, Excel, TXT)
- **Step 2**: Generate field mappings
- **Step 3**: Preview data
- **Step 4**: Validate and deduplicate
- **Step 5**: Confirm and save

Supported formats:
- Excel (.xlsx, .xls)
- CSV (auto-delimiter detection)
- Tab-delimited text

### 2. Query Builders (2 Modes)

#### Form-Based Builder
- Condition management (add/edit/remove)
- Multiple operators (=, !=, <, >, IN, NOT IN, LIKE, BETWEEN)
- Logical operators (AND, OR)
- Real-time query preview
- Save/load queries

#### Visual Builder
- Drag-and-drop interface
- Visual condition creation
- Dynamic query generation
- Execute and view results

### 3. Vicidial Integration
- 10 standard Vicidial fields + 2 custom fields
- Fuzzy field matching (Levenshtein distance)
- Confidence scoring (0.0-1.0)
- Field alias support
- Automatic mapping suggestions

### 4. Hardware Detection System
- Auto-detect RAM and CPU
- Three tier system:
  - **Basic** (< 4GB RAM): 1K token limit, 1 LLM
  - **Standard** (4-16GB RAM): 4K tokens, 3 LLMs
  - **Premium** (> 16GB RAM): Unlimited tokens, 6 LLMs
- Manual tier override
- Hardware profile tracking

### 5. Deployment Options
- **Local** - Standalone system on single machine
- **Server** - Dedicated server deployment
- **Cloud** - AWS/Azure/GCP support

### 6. Data Validation
- Phone format validation (10-15 digits)
- Duplicate detection (phone + name combo)
- Validation reports with row-level tracking
- Data quality scoring

### 7. REST API (27 Endpoints)
- Import management (5 endpoints)
- Query building (5 endpoints)
- Validation (4 endpoints)
- Configuration (4 endpoints)
- Hardware detection (3 endpoints)
- Plus legacy endpoints

---

## API Reference

### Authentication
None required for local deployment. Production deployments should add JWT middleware.

### Base URL
```
http://localhost:3000/api
```

### Core Endpoints

#### Import Management
```
POST /api/import/upload
POST /api/import/validate
POST /api/import/mapping
GET  /api/import/history
POST /api/import/confirm
```

#### Query Building
```
POST /api/query-builder/generate
POST /api/query-builder/execute
GET  /api/query-builder/saved
POST /api/query-builder/save
POST /api/query-builder/delete
```

#### Validation
```
POST /api/validation/validate-phone
POST /api/validation/check-duplicates
POST /api/validation/data-quality
POST /api/validation/report
```

#### Configuration
```
GET  /api/config/current
POST /api/config/update
POST /api/config/hardware-tier
GET  /api/config/detect-hardware
```

### Example Requests

#### Upload File
```bash
curl -X POST http://localhost:3000/api/import/upload \
  -F "file=@sample.csv"
```

#### Generate Query
```bash
curl -X POST http://localhost:3000/api/query-builder/generate \
  -H "Content-Type: application/json" \
  -d '{
    "conditions": [
      {"field": "first_name", "operator": "=", "value": "John", "logical": "AND"},
      {"field": "age", "operator": ">", "value": "30", "logical": "AND"}
    ],
    "table": "contacts"
  }'
```

---

## User Guide

### Data Import Workflow

1. **Navigate to Import Page**
   - Go to `http://localhost:3000/data-import.html`

2. **Upload File**
   - Click "Select File" or drag-drop
   - Supported: CSV, Excel, TXT

3. **Map Fields**
   - System auto-suggests mappings
   - Adjust manually if needed
   - Confirm field mappings

4. **Preview Data**
   - Review first 10 rows
   - Check column extraction
   - Verify data format

5. **Validate Data**
   - System checks:
     - Phone format validity
     - Duplicate detection
     - Data completeness
   - Review validation report

6. **Confirm & Save**
   - Data saved to database
   - Mapping saved for future imports
   - Success confirmation

### Query Building Workflow

#### Form-Based
1. Select data source table
2. Add conditions (field, operator, value)
3. Choose logical operators (AND/OR)
4. Preview generated query
5. Execute and view results
6. Save query for reuse

#### Visual-Based
1. Drag conditions onto builder
2. Configure each condition
3. Watch query update in real-time
4. Execute from preview
5. Export results

### Settings Configuration

1. **Deployment Mode**
   - Select: Local / Server / Cloud
   - Configure connection parameters

2. **Hardware Tier**
   - Auto-detected or manual override
   - View current limits
   - Adjust if needed

3. **Advanced Settings**
   - Database configuration
   - API security settings
   - Performance tuning
   - Data validation rules

---

## Configuration

### Environment Variables
```bash
# Port configuration
PORT=3000

# Database
DB_PATH=./prompt_engine.db

# API Security
API_KEY=your-secure-key-here
CORS_ORIGIN=http://localhost:3000

# Hardware
FORCE_TIER=standard  # basic, standard, or premium
MAX_FILE_SIZE=104857600  # 100MB
```

### Config File (config.json)
```json
{
  "port": 3000,
  "database": {
    "path": "./prompt_engine.db",
    "maxSize": 1000000000
  },
  "api": {
    "maxBodySize": "1mb",
    "corsEnabled": true
  },
  "hardware": {
    "autoDetect": true,
    "forceTier": null
  },
  "validation": {
    "phoneMinDigits": 10,
    "phoneMaxDigits": 15,
    "checkDuplicates": true
  },
  "deployment": {
    "mode": "local",
    "environment": "development"
  }
}
```

---

## Troubleshooting

### Port Already in Use
```bash
# Change port
PORT=3001 npm run web

# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error
```bash
# Reset database
rm prompt_engine.db
npm run web

# Check database permissions
ls -la prompt_engine.db
chmod 644 prompt_engine.db
```

### File Upload Issues
- Check file size (max 100MB)
- Verify file format (CSV/Excel/TXT)
- Check disk space
- Try smaller sample file

### Query Execution Errors
- Verify table name exists
- Check column names match
- Ensure valid SQL operators
- Check for special characters in values

### Performance Issues
- Check available RAM (minimum 4GB)
- Reduce file size for import
- Clear browser cache
- Check database size
- Review server logs

### CORS Errors
- Ensure API listening on correct port
- Check CORS headers in response
- Verify cross-origin configuration
- Test with curl first

---

## Development

### Project Structure
```
claude-prompt-engine/
├── core/                          # Core business logic (6 modules)
│   ├── install-config.js         # Hardware detection
│   ├── vicidial-mapper.js        # Field mapping
│   ├── data-importer.js          # File parsing
│   ├── data-validator.js         # Data validation
│   ├── query-builder.js          # Query generation
│   └── api-handlers.js           # API orchestration
├── public/                        # Browser UI (4 pages + JS)
│   ├── data-import.html          # Import wizard
│   ├── query-builder-form.html   # Form-based builder
│   ├── query-builder-visual.html # Visual builder
│   ├── settings.html             # Configuration
│   ├── js/
│   │   ├── data-import-ui.js
│   │   ├── query-builder-ui.js
│   │   ├── query-builder-visual.js
│   │   └── settings-ui.js
│   └── css/                      # Glasmorphic styles
├── migrations/                    # Database schema
├── test-data/                     # Sample files
├── server.js                      # HTTP server + routing
├── package.json                   # Dependencies
└── README.md                      # This file
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test
npm test -- --grep "import"

# Generate test report
npm test -- --reporter json > test-report.json
```

### Building for Production
```bash
# Build
npm run build

# Test production build
npm run build && npm start

# Create distribution
npm run dist
```

### Adding New API Endpoints

1. Add handler to `core/api-handlers.js`
2. Add route in `server.js` handleAPI()
3. Update API documentation
4. Add tests
5. Update changelog

### Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## License

MIT License - See LICENSE file for details

## Support

- 📧 Email: support@claudepromptengine.com
- 🐛 Issues: GitHub Issues
- 📚 Documentation: /docs
- 💬 Community: Discord Server

---

**Version**: 3.0.0  
**Last Updated**: April 2026  
**Status**: Production Ready
