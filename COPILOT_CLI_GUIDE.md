# GitHub Copilot CLI Integration Guide

## 🚀 Overview

The Claude Prompt Engine now includes comprehensive GitHub Copilot CLI integration. This guide shows you how to use the Copilot CLI features directly from the web interface to automate environment setup, test prompts, and generate CI/CD workflows.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [CLI Status Checker](#cli-status-checker)
3. [Install Script Generator](#install-script-generator)
4. [Prompt Testing](#prompt-testing)
5. [GitHub Actions Workflow Generation](#github-actions-workflow-generation)
6. [Command Reference](#command-reference)

---

## Getting Started

### Prerequisites

- Node.js 18+ or Python 3.8+
- GitHub account
- GitHub CLI (`gh`) installed
- GitHub Copilot CLI extension

### Installation Steps

1. **Install GitHub CLI**
   ```bash
   # macOS
   brew install gh
   
   # Linux
   sudo apt-get install gh
   
   # Windows
   choco install gh
   ```

2. **Link Your GitHub Account**
   ```bash
   gh auth login
   ```

3. **Install Copilot Extension**
   ```bash
   gh extension install github/gh-copilot
   ```

4. **Verify Installation**
   ```bash
   gh copilot status
   ```

---

## CLI Status Checker

### Checking Your CLI Status

1. Navigate to the **🚀 Copilot CLI** tab in the web interface
2. Click the **🔄 Check Status** button
3. View your current CLI configuration status

### Understanding Status Output

- **Installed**: Shows if GitHub CLI and Copilot extension are installed
- **Status**: Current status message
- **Message**: Detailed explanation of your setup

Example output:
```
Status: ready
Message: GitHub Copilot CLI ready for use
```

---

## Install Script Generator

### Generating Installation Scripts

The Install Script Generator creates platform-specific setup scripts that automate your development environment setup.

### Available Platforms

#### 1. **Node.js**
Generates a bash script that:
- Creates project directory
- Initializes npm project
- Installs dependencies (eslint, jest, nodemon)
- Creates directory structure (src, tests, config)
- Sets up GitHub Actions CI/CD workflow
- Creates `.env` and `.gitignore` files

**Use when**: Building Node.js applications, APIs, or microservices

#### 2. **Python**
Generates a bash script that:
- Creates project directory
- Sets up Python virtual environment
- Upgrades pip
- Installs dependencies (Flask, pytest, pylint, black)
- Creates directory structure
- Initializes Git repository

**Use when**: Building Python applications, data science projects, or ML pipelines

#### 3. **LAMP Stack**
Generates a bash script that:
- Creates Apache configuration
- Sets up PHP environment
- Configures MySQL database
- Creates directory structure (public_html, config, includes)
- Sets up permissions
- Creates database init script

**Use when**: Building traditional web applications with Apache/PHP/MySQL

#### 4. **Docker**
Generates a bash script that:
- Creates Dockerfile with multi-stage builds
- Sets up Docker Compose configuration
- Creates .dockerignore file
- Configures volume mounts
- Sets up network configuration

**Use when**: Containerizing applications for deployment

#### 5. **Full-Stack**
Generates a comprehensive bash script that:
- Combines Node.js backend setup
- Adds React/Vue frontend scaffolding
- Configures Docker containerization
- Sets up Nginx reverse proxy
- Creates GitHub Actions workflows
- Includes deployment scripts

**Use when**: Building complete full-stack applications

### How to Use

1. Click on the desired platform button (📦 Node.js, 🐍 Python, etc.)
2. The install script will generate in the output area
3. Click **📥 Download Installation Script** to download
4. Run the script in your terminal:
   ```bash
   bash install-script.sh
   ```

### Script Features

All scripts include:
- **Error handling** (`set -e` for bash)
- **Progress indicators** (emojis and clear output)
- **Directory structure** (organized project layout)
- **Configuration files** (.env, .gitignore)
- **CI/CD workflows** (GitHub Actions integration)
- **Documentation** (inline comments)

---

## Prompt Testing

### Validating Your Prompts

Use the Prompt Testing feature to validate and improve your generated prompts before using them with Copilot.

### How to Test

1. Generate a prompt using the main prompt engine
2. Go to the **🚀 Copilot CLI** tab
3. Paste your prompt in the **Test Generated Prompt** input field
4. Select your target model from the model selector
5. Click **🧪 Test Prompt**

### Test Results

The system analyzes your prompt and provides:

- **Status**: `success` or `needs-improvement`
- **Model**: The target model specified
- **Timestamp**: When the test was run
- **Recommendations**: Suggestions for improvement

Example recommendations:
- Add error handling
- Include type definitions
- Add unit tests
- Consider edge cases

### Best Practices

1. **Be Specific**: Include context and requirements
2. **Add Examples**: Show input/output examples
3. **Specify Format**: Indicate desired output format (JSON, XML, code)
4. **Set Constraints**: Include performance or size requirements

---

## GitHub Actions Workflow Generation

### Creating CI/CD Workflows

Automatically generate GitHub Actions workflows for your projects.

### Available Workflows

#### 1. **Node.js CI/CD**
- Node version: 18+
- Steps:
  - Checkout code
  - Setup Node.js
  - Install dependencies
  - Run linting
  - Run tests
  - Build application

#### 2. **Python CI/CD**
- Python version: 3.9+
- Steps:
  - Checkout code
  - Setup Python
  - Create virtual environment
  - Install dependencies
  - Run tests
  - Generate coverage report

#### 3. **LAMP CI/CD**
- PHP version: 8.0+
- Steps:
  - Checkout code
  - Setup PHP
  - Install Composer dependencies
  - Run PHPUnit tests
  - Deploy to staging

### How to Use

1. Go to the **🚀 Copilot CLI** tab
2. Scroll to **Generate GitHub Actions Workflow**
3. Click the desired workflow button
4. The workflow YAML will generate
5. Click **📋 Copy Workflow** to copy to clipboard
6. Create file: `.github/workflows/ci.yml` in your repository
7. Paste the workflow content
8. Commit and push to GitHub

### Workflow Structure

All workflows include:
- **Triggers**: `on: [push, pull_request]`
- **Events**: Run on code changes and pull requests
- **Environment**: Consistent versions
- **Caching**: Dependencies caching for speed
- **Status badges**: For displaying build status

### Customization

Edit the workflow YAML to:
- Change node/python versions
- Add additional steps
- Configure environment variables
- Set up notifications
- Add deployment steps

---

## Command Reference

### Web Interface Commands

#### Status Check
```
GET /api/copilot/status
```
Returns: CLI installation status and ready state

#### Generate Install Script
```
POST /api/copilot/install-script
{
  "platform": "nodejs|python|lamp|docker|full-stack",
  "options": {
    "name": "project-name"
  }
}
```
Returns: Platform-specific installation script

#### Test Prompt
```
POST /api/copilot/test-prompt
{
  "prompt": "your prompt here",
  "model": "Claude|GPT-4|Llama|etc"
}
```
Returns: Validation results and recommendations

#### Generate Workflow
```
POST /api/copilot/github-workflow
{
  "projectType": "nodejs|python|lamp"
}
```
Returns: GitHub Actions workflow YAML

### CLI Commands

```bash
# Check Copilot status
gh copilot status

# Ask Copilot for help
gh copilot explain "your question"

# Generate shell commands
gh copilot suggest "what you want to do"

# Get version
gh copilot version
```

---

## Examples

### Example 1: Setup Node.js Project

1. Click **📦 Node.js** button
2. Copy the generated script to `setup.sh`
3. Run: `bash setup.sh`
4. Project is ready with all dependencies and CI/CD

### Example 2: Test Your Prompt Before Deployment

1. Generate a prompt about "Creating user authentication"
2. Go to Copilot CLI tab
3. Enter the prompt in test field
4. Get recommendations:
   - Add error handling
   - Include type definitions
   - Add unit tests
5. Update prompt accordingly
6. Re-test until "success" status

### Example 3: Auto-Generate CI/CD Workflow

1. Click **Python CI/CD** button
2. Copy the YAML workflow
3. Create `.github/workflows/test.yml`
4. Commit and push
5. GitHub Actions automatically runs tests on every commit

---

## Troubleshooting

### Issue: CLI Not Detected

**Solution**: 
1. Verify GitHub CLI is installed: `which gh`
2. Verify Copilot extension: `gh extension list`
3. Login to GitHub: `gh auth login`
4. Reinstall extension: `gh extension install github/gh-copilot`

### Issue: Permission Denied

**Solution**:
1. Make scripts executable: `chmod +x script.sh`
2. Check directory permissions: `ls -la`
3. Try with sudo if needed: `sudo bash script.sh`

### Issue: Generate Command Fails

**Solution**:
1. Check command syntax in the prompt
2. Ensure all parameters are specified
3. Try simpler command first
4. Check GitHub API rate limits

### Issue: Workflow Not Running

**Solution**:
1. Verify `.github/workflows/` directory exists
2. Check workflow YAML syntax: `gh workflow list`
3. Enable workflows in repository settings
4. Check Actions tab for logs

---

## Advanced Usage

### Custom Install Scripts

Modify generated scripts to add:
- Database migrations
- Environment setup
- Custom dependencies
- Pre-deployment tasks

### Multiple Workflows

Create separate workflows for:
- Testing
- Building
- Deploying
- Security scanning
- Performance testing

### Workflow Integration

Connect with:
- Slack notifications
- Email alerts
- Deployment triggers
- Code review automation

---

## Security Best Practices

1. **Never commit secrets** to your repository
2. **Use GitHub Secrets** for API keys and tokens
3. **Validate all inputs** before execution
4. **Review generated scripts** before running
5. **Use minimal permissions** for CI/CD runners
6. **Keep dependencies updated** regularly
7. **Monitor workflow logs** for suspicious activity

---

## Performance Tips

1. **Cache dependencies** in workflows
2. **Use matrix builds** for multiple versions
3. **Parallelize tests** when possible
4. **Skip CI for documentation** changes
5. **Use conditional workflows** to avoid redundant runs
6. **Optimize Docker images** for faster deployments

---

## Resources

- [GitHub CLI Documentation](https://cli.github.com/)
- [GitHub Copilot CLI Extension](https://github.com/github/gh-copilot)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Claude Prompt Engine Repository](https://github.com/your-repo)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review GitHub Copilot documentation
3. Check GitHub CLI issues: https://github.com/cli/cli/issues
4. File an issue in the Claude Prompt Engine repository

---

## Version History

**v1.0** - Initial release
- CLI status checker
- Install script generation (5 platforms)
- Prompt testing
- GitHub Actions workflow generation

---

## License

This guide and the Claude Prompt Engine are provided as-is for educational and development purposes.

---

**Happy coding with GitHub Copilot CLI! 🚀**
