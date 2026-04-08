# Self-Learning & Auto-Update System

Claude Prompt Engine can now **self-learn and automatically update**! 

## 🧠 What It Learns

### 1. **Prompt Effectiveness**
- Tracks which prompts work best
- Measures success rates by model/language/project type
- Identifies patterns in high-performing prompts
- Suggests improvements for low-performing ones

### 2. **User Preferences**
- Records your favorite models, languages, project types
- Learns your coding style and experience level
- Tracks average ratings you give
- Personalizes future recommendations

### 3. **Successful Combinations**
- Learns which model + language + project type combos work best
- Identifies most frequently used combinations
- Recommends best combinations automatically
- Updates recommendations based on feedback

### 4. **Model Performance**
- Tracks how each AI model performs
- Measures quality, reliability, speed
- Compares models for specific tasks
- Suggests best model for your use case

### 5. **Code Quality**
- Analyzes generated code execution success
- Tracks errors and issues in generated code
- Learns from failed attempts
- Improves prompt generation accordingly

## 📊 Learning Features

### Self-Learning Capabilities

```javascript
// Record prompt usage
POST /api/learning/record-usage
{
  promptId: "uuid",
  promptText: "generate a React component...",
  model: "claude",
  language: "javascript",
  projectType: "web-app",
  purpose: "ui-component"
}

// Submit feedback
POST /api/learning/feedback
{
  userId: "user123",
  promptId: "uuid",
  rating: 5,  // 1-5 stars
  comment: "Great suggestion!",
  helpful: true,
  codeQuality: "excellent",
  executionSuccess: true
}

// Get personalized recommendations
GET /api/learning/recommendations?userId=user123&limit=5

// Get top performing prompts
GET /api/learning/top-prompts?limit=10

// Get user profile
GET /api/learning/user-profile?userId=user123

// Get model analytics
GET /api/learning/analytics

// Get learning statistics
GET /api/learning/stats

// Get improvement suggestions
GET /api/learning/suggestions
```

### What the System Learns From

1. **Your Ratings**
   - Prompts you rate highly are marked as successful
   - Low ratings trigger improvement analysis
   - System learns your preferences

2. **Your Feedback**
   - Comments and suggestions improve future prompts
   - Issue reports help identify problem areas
   - Success stories provide examples

3. **Code Execution**
   - Tracks if generated code runs successfully
   - Monitors runtime errors
   - Learns from failed implementations

4. **Usage Patterns**
   - Notices which combinations you use most
   - Recommends frequently successful combinations
   - Suggests alternatives for struggling cases

5. **Time-Based Learning**
   - Improves over time with more usage
   - Becomes more personalized to your needs
   - Adapts to your coding style

## 🔄 Auto-Update Features

### Update Checking

The system automatically checks for updates:

```javascript
// Check for available updates
GET /api/updates/check
// Response: { available: true, version: "1.1.0", releaseNotes: "..." }

// Get update status
GET /api/updates/status
// Response: { currentVersion: "1.0.0", updateAvailable: true, ... }
```

### Automatic Update Process

1. **Check** - Looks for new versions on GitHub
2. **Download** - Gets the update package
3. **Verify** - Checks integrity via SHA256
4. **Backup** - Creates backup before updating
5. **Apply** - Installs update and dependencies
6. **Verify** - Confirms update succeeded

### Update Management

```javascript
// Download update
POST /api/updates/download

// Apply update (requires downloaded file)
POST /api/updates/apply
{
  updatePath: "./updates/update-1.1.0.zip"
}

// Rollback to previous version
POST /api/updates/rollback
{
  backupPath: "./updates/backup-2024-01-15"
}

// Get available backups
GET /api/updates/backups

// Get update history
GET /api/updates/history

// Toggle auto-update
POST /api/updates/toggle-auto-update
{
  enabled: true
}
```

## 📈 Learning Database Tables

### prompt_metrics
Tracks prompt performance:
```
- prompt_id (unique)
- prompt_text
- model, language, project_type, purpose
- user_rating (avg 1-5)
- success_score (0-1)
- usage_count
- errors_count
```

### user_preferences
Stores user learning profile:
```
- user_id (unique)
- preferred_models, languages, project_types, purposes
- coding_style
- experience_level
- avg_rating
- total_prompts_used
```

### prompt_iterations
Tracks prompt improvements:
```
- prompt_id, version
- original_text, improved_text
- improvement_reason
- effectiveness_gain
- user_feedback
```

### user_feedback
Records all user feedback:
```
- user_id, prompt_id
- rating, comment
- helpful, issues_found, suggestions
- generated_code_quality
- execution_success, execution_error
```

### pattern_analysis
Identifies best combinations:
```
- model, language, project_type, purpose
- frequency (how often used)
- avg_success_rate
- recommended
```

### model_performance
Compares AI models:
```
- model
- total_uses, avg_success_rate, avg_rating
- quality_score, reliability_score, speed_score
- recommendations_count
```

## 🎯 Usage Examples

### Example 1: Learning From Feedback

```javascript
// User generates prompt for React component
POST /api/generate-prompt
{
  model: "claude",
  language: "javascript",
  projectType: "web-app",
  purpose: "ui-component"
}
// Returns: { prompt: "Write a React button component...", promptId: "abc123" }

// Record usage
POST /api/learning/record-usage
{
  promptId: "abc123",
  promptText: "Write a React button component...",
  model: "claude",
  language: "javascript",
  projectType: "web-app",
  purpose: "ui-component"
}

// User tests generated code, then rates it
POST /api/learning/feedback
{
  userId: "user456",
  promptId: "abc123",
  rating: 4,
  helpful: true,
  codeQuality: "very-good",
  executionSuccess: true,
  comment: "Generated code works but needs styling"
}

// Next time user generates similar prompt
GET /api/learning/recommendations?userId=user456
// Returns: [
//   { prompt: "Better React button with styling...", rating: 4.5 },
//   { prompt: "React button with accessibility...", rating: 4.8 }
// ]
```

### Example 2: Getting Insights

```javascript
// See what's working best
GET /api/learning/analytics
// Returns top performing models with statistics

// Get improvement suggestions
GET /api/learning/suggestions
// Returns: [
//   {
//     type: "IMPROVE_PROMPT",
//     target: "prompt123",
//     reason: "Low success rate (45%) after 10 uses",
//     recommendation: "Consider revising prompt structure"
//   }
// ]

// See your personal profile
GET /api/learning/user-profile?userId=user456
// Returns: {
//   preferred_models: ["claude", "gpt4"],
//   preferred_languages: ["javascript", "python"],
//   avg_rating: 4.2,
//   total_prompts_used: 47
// }
```

### Example 3: Auto-Updates

```javascript
// System checks automatically every 24 hours
// If new version found:

GET /api/updates/status
// Returns: {
//   currentVersion: "1.0.0",
//   updateAvailable: true,
//   latestVersion: "1.1.0",
//   releaseNotes: "Added new features..."
// }

// Download update
POST /api/updates/download

// Apply update (creates backup automatically)
POST /api/updates/apply
{ updatePath: "./updates/update-1.1.0.zip" }

// If something breaks, rollback
POST /api/updates/rollback
{ backupPath: "./updates/backup-2024-01-15" }
```

## 🧠 How Self-Learning Works

### Step 1: Collect Data
```
┌─────────────────────────────────────┐
│ User generates prompt               │
│ Uses Claude Prompt Engine           │
│ Rates the results                   │
│ Provides feedback                   │
└──────────┬──────────────────────────┘
           │
           ▼
```

### Step 2: Store & Analyze
```
┌─────────────────────────────────────┐
│ Data stored in learning database    │
│ - Prompt performance                │
│ - User preferences                  │
│ - Success metrics                   │
│ - Patterns identified               │
└──────────┬──────────────────────────┘
           │
           ▼
```

### Step 3: Generate Insights
```
┌─────────────────────────────────────┐
│ System analyzes patterns            │
│ - Top performing prompts            │
│ - Best model combinations           │
│ - User preferences                  │
│ - Improvement suggestions           │
└──────────┬──────────────────────────┘
           │
           ▼
```

### Step 4: Personalize Experience
```
┌─────────────────────────────────────┐
│ Next time user generates prompt:    │
│ - Recommends best options           │
│ - Suggests proven successful prompts│
│ - Personalizes to their style       │
│ - Learns continuously               │
└─────────────────────────────────────┘
```

## 🔄 How Auto-Updates Work

### Update Check Cycle

```
START
  │
  ├─→ Check GitHub for new release
  │
  ├─→ Compare versions
  │    ├─→ Same version: Skip
  │    └─→ New version: Download
  │
  ├─→ Verify integrity (SHA256)
  │
  ├─→ Create backup of current
  │
  ├─→ Apply update
  │    ├─→ Extract files
  │    ├─→ Install npm dependencies
  │    └─→ Verify installation
  │
  └─→ Continue running
```

### Configuration

In `.env`:
```bash
# Enable/disable auto-update
AUTO_UPDATE=true

# Check interval (milliseconds)
UPDATE_CHECK_INTERVAL=86400000  # 24 hours

# Backup location
UPDATE_BACKUP_DIR=./updates/backups

# Auto-apply updates (vs just notify)
AUTO_APPLY_UPDATES=false
```

## 📊 Learning Dashboard (Future UI)

The web interface will show:

```
LEARNING INSIGHTS
├─ Your Performance
│  ├─ Prompts Generated: 247
│  ├─ Avg Rating: 4.2/5
│  └─ Success Rate: 87%
│
├─ Top Models
│  ├─ Claude: 92% success
│  ├─ GPT-4: 88% success
│  └─ Gemini: 85% success
│
├─ Best Combinations
│  ├─ Python + Data Analysis: 95%
│  ├─ JavaScript + Web App: 91%
│  └─ Go + API: 89%
│
└─ Suggestions
   ├─ Improve React prompts
   ├─ Try Claude for APIs
   └─ Upgrade GPT-4 available
```

## 🔒 Privacy & Security

- **Local Storage**: All learning data stored locally by default
- **Optional Cloud Sync**: Can sync to cloud (opt-in)
- **Data Export**: Full export available anytime
- **Anonymous Option**: Can use anonymously
- **Update Verification**: SHA256 checksums verify integrity
- **Backup Before Update**: Automatic rollback capability

## 📈 Benefits

✅ **Smarter Recommendations** - System learns what works for you  
✅ **Improved Prompts** - Gets better with each use  
✅ **Time Savings** - Skips trying what doesn't work  
✅ **Personalization** - Adapts to your coding style  
✅ **Automatic Updates** - Stay current without manual work  
✅ **Safe Updates** - Automatic backups enable easy rollback  
✅ **Continuous Improvement** - System improves daily  
✅ **Data Insights** - Understand your patterns  

## ⚙️ Configuration

### Learning Engine Config

```javascript
const learningEngine = new LearningEngine({
  dbPath: './memory/learning.db',
  autoAnalyze: true,
  analysisInterval: 3600000  // 1 hour
});
```

### Update Manager Config

```javascript
const updateManager = new UpdateManager({
  repoOwner: 'yourusername',
  repoName: 'claude-prompt-engine',
  checkInterval: 86400000,  // 24 hours
  autoUpdate: true,
  updateDir: './updates'
});
```

## 📝 API Summary

### Learning Endpoints
- `POST /api/learning/record-usage` - Track prompt use
- `POST /api/learning/feedback` - Submit feedback
- `GET /api/learning/recommendations` - Get suggestions
- `GET /api/learning/top-prompts` - See best prompts
- `GET /api/learning/user-profile` - Your preferences
- `GET /api/learning/analytics` - Model performance
- `GET /api/learning/stats` - Learning statistics
- `GET /api/learning/suggestions` - Improvement ideas
- `POST /api/learning/analyze-patterns` - Analyze patterns
- `GET /api/learning/export` - Export all data

### Update Endpoints
- `GET /api/updates/check` - Check for updates
- `GET /api/updates/status` - Current status
- `POST /api/updates/download` - Download update
- `POST /api/updates/apply` - Install update
- `POST /api/updates/rollback` - Restore previous
- `GET /api/updates/backups` - List backups
- `GET /api/updates/history` - View history
- `POST /api/updates/toggle-auto-update` - Enable/disable

---

**Version 1.0** | Self-Learning & Auto-Update System  
Your Claude Prompt Engine now learns and improves continuously! 🚀
