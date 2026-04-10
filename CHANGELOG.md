# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-04-10

### Added
- **iAI intelligent assistant** — full conversational AI powered by GitHub Copilot API with gh CLI fallback
- **iAI memory system** (`core/iai-memory.js`) — three-tier memory: episodic (per-session JSONL), semantic (SQLite FTS), procedural (tool usage stats + dream log)
- **iAI memory integration in chat** — relevant memories auto-recalled and injected into system prompt before every AI call; exchanges auto-saved after reply
- **iAI tool execution pipeline** — AI responses parsed for `[TOOL: name(args)]` markers; 27 tools executed automatically with results fed back for final reply
- **iAI browse module** (`core/iai-browse.js`) — DuckDuckGo Instant Answer web search + HTTPS page fetch/extract (no API key required)
- **iAI chat UI** (`public/iai.html`) — glasmorphic chat interface with voice input (Web Speech API), TTS output (OpenAI or browser fallback), context/model selectors, tool execution chips, memory recall badge
- **🧠 Memory modal** in iAI UI — live search of semantic memory, session stats
- **New API routes**: `/api/iai/memory/summary|recall|sessions|export|remember`, `/api/iai/browse/search|fetch`, `/api/iai/update/check|apply`
- `status()` endpoint now reports `memoryReady` and `toolsReady` flags
- Graceful `EADDRINUSE` error handling — clear message instead of crash when port is in use

### Changed
- **package.json**: version 1.1.0 → 1.2.0; added `express`, removed unused `axios`; added `start`, `test`, `stop` scripts; added `engines`, `keywords`, `repository` fields
- **README.md**: updated repo URL, version badge, feature list, project structure, API table, iAI setup instructions
- **server.js**: startup banner now shows iAI URL and version; wires `IAIMemory`, `IAITools`, `IAIBrowse` into handler

### Fixed
- Port `EADDRINUSE` crash replaced with actionable error message and clean `process.exit`



### Added
- Complete data import wizard with 5-step process
- Form-based and visual query builders
- Vicidial field mapping with fuzzy matching
- Hardware tier detection system
- REST API with 27 endpoints
- SQLite database integration
- Glasmorphic UI design
- Data validation and duplicate detection
- Phone format validation
- Multi-deployment support (local/server/cloud)

### Changed
- Complete architectural redesign for scalability
- Improved database schema with 9 indexes
- Enhanced error handling and logging
- Updated API response formats

### Fixed
- Async/await handling in server routes
- CORS configuration
- Database connection pooling

### Security
- SQL injection prevention
- Input validation on all endpoints
- File upload size limits
- Request body size limits

## [2.0.0] - 2026-03-15

### Added
- Initial UI framework
- Basic API structure
- Database schema

## [1.0.0] - 2026-03-01

### Added
- Project initialization
- Core module structure
- Build configuration
