#!/usr/bin/env bash
# ============================================================
#  iAI Key Setup Wizard — Linux / macOS
#  Opens the correct websites, collects API keys, validates
#  them, and writes them to .env
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# ── Helpers ─────────────────────────────────────────────────

open_browser() {
  local url="$1"
  if command -v xdg-open &>/dev/null; then
    xdg-open "$url" 2>/dev/null &
  elif command -v open &>/dev/null; then   # macOS
    open "$url"
  else
    echo -e "  ${YELLOW}→ Open manually:${NC} $url"
  fi
}

print_header() {
  echo ""
  echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${CYAN}║        iAI Key Setup Wizard — Claude Prompt Engine   ║${NC}"
  echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
  echo ""
}

section() {
  echo ""
  echo -e "${BOLD}${CYAN}── $1 ─────────────────────────────────────────────────${NC}"
  echo ""
}

ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "  ${RED}❌ $1${NC}"; }
info() { echo -e "  ${CYAN}ℹ  $1${NC}"; }

read_key() {
  local prompt="$1"
  local varname="$2"
  local current="${!varname:-}"
  if [[ -n "$current" ]]; then
    echo -e "  Current: ${YELLOW}${current:0:20}…${NC} (press Enter to keep)"
  fi
  printf "  %s: " "$prompt"
  read -rs INPUT
  echo ""
  if [[ -n "$INPUT" ]]; then
    eval "$varname='$INPUT'"
  fi
}

# Load existing .env
OPENAI_API_KEY=""
GH_TOKEN=""
TELNYX_API_KEY=""
MYSQL_HOST="localhost"
MYSQL_USER="root"
MYSQL_PASS=""
MYSQL_DB="vicidial"

if [[ -f "$ENV_FILE" ]]; then
  while IFS='=' read -r key val; do
    [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
    case "$key" in
      OPENAI_API_KEY) OPENAI_API_KEY="$val" ;;
      GH_TOKEN)       GH_TOKEN="$val" ;;
      TELNYX_API_KEY) TELNYX_API_KEY="$val" ;;
      MYSQL_HOST)     MYSQL_HOST="$val" ;;
      MYSQL_USER)     MYSQL_USER="$val" ;;
      MYSQL_PASS)     MYSQL_PASS="$val" ;;
      MYSQL_DB)       MYSQL_DB="$val" ;;
    esac
  done < "$ENV_FILE"
fi

# ── Check dependencies ───────────────────────────────────────

print_header

section "Checking System Dependencies"

check_dep() {
  if command -v "$1" &>/dev/null; then
    ok "$1 $(command -v "$1")"
    return 0
  else
    warn "$1 not found"
    return 1
  fi
}

check_dep node   || { err "Node.js required. Install from https://nodejs.org"; open_browser "https://nodejs.org/en/download/"; }
check_dep npm    || true
check_dep git    || warn "git not found — version control disabled"
check_dep curl   || warn "curl not found — key validation will be skipped"

NODE_VER=$(node --version 2>/dev/null || echo "unknown")
info "Node.js version: $NODE_VER"

NPM_DEPS=$(node -e "const p=require('./package.json'); const ins=Object.keys(p.dependencies||{}); const miss=ins.filter(d=>{try{require.resolve(d);return false}catch{return true}}); console.log(miss.join(','))" 2>/dev/null || echo "")
if [[ -n "$NPM_DEPS" ]]; then
  warn "Missing npm packages: $NPM_DEPS"
  echo ""
  printf "  Install missing packages now? (Y/n): "
  read -r REPLY
  if [[ ! "$REPLY" =~ ^[Nn]$ ]]; then
    npm install --prefix "$SCRIPT_DIR" && ok "npm packages installed"
  fi
else
  ok "All npm packages present"
fi

# ── OpenAI API Key ───────────────────────────────────────────

section "Step 1 — OpenAI API Key (PRIMARY AI ENGINE)"

echo -e "  OpenAI powers iAI's chat intelligence."
echo -e "  You need a paid account with billing credit."
echo ""

if [[ -n "$OPENAI_API_KEY" ]]; then
  ok "Key already set: ${OPENAI_API_KEY:0:20}…"
  printf "  Replace it? (y/N): "
  read -r REPLACE
  if [[ ! "$REPLACE" =~ ^[Yy]$ ]]; then
    SKIP_OPENAI=true
  fi
fi

if [[ "${SKIP_OPENAI:-false}" != "true" ]]; then
  echo ""
  echo -e "  ${BOLD}Opening:${NC} https://platform.openai.com/api-keys"
  echo -e "  Instructions:"
  echo -e "   1. Sign in (or create account)"
  echo -e "   2. Click ${BOLD}+ Create new secret key${NC}"
  echo -e "   3. Name it: claude-prompt-engine-iai"
  echo -e "   4. Copy the key and paste it below"
  echo ""
  open_browser "https://platform.openai.com/api-keys"
  sleep 2
  read_key "Paste OpenAI API key (sk-proj-…)" OPENAI_API_KEY

  if [[ -n "$OPENAI_API_KEY" ]] && command -v curl &>/dev/null; then
    echo ""
    printf "  Validating key…"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      https://api.openai.com/v1/models 2>/dev/null || echo "000")
    if [[ "$STATUS" == "200" ]]; then
      ok " Valid! API key accepted."
      # Check billing/quota
      QUOTA_RESP=$(curl -s -H "Authorization: Bearer $OPENAI_API_KEY" \
        -H "Content-Type: application/json" \
        -X POST https://api.openai.com/v1/chat/completions \
        -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"ok"}],"max_tokens":3}' 2>/dev/null || echo "{}")
      if echo "$QUOTA_RESP" | grep -q '"choices"'; then
        ok " Chat completions: working!"
      elif echo "$QUOTA_RESP" | grep -q 'insufficient_quota'; then
        warn " Key valid but BILLING QUOTA EXCEEDED."
        echo ""
        echo -e "  ${YELLOW}→ Add billing credit at:${NC} https://platform.openai.com/settings/organization/billing/overview"
        open_browser "https://platform.openai.com/settings/organization/billing/overview"
      else
        warn " Could not verify chat completions."
      fi
    elif [[ "$STATUS" == "401" ]]; then
      err " Invalid API key."
    else
      warn " Validation returned HTTP $STATUS — check your internet connection."
    fi
  fi
fi

# ── GitHub Token ─────────────────────────────────────────────

section "Step 2 — GitHub Personal Access Token"

echo -e "  Used for: repo access, GitHub API, Copilot (if subscribed)."
echo ""

if [[ -n "$GH_TOKEN" ]]; then
  ok "Token already set: ${GH_TOKEN:0:20}…"
  printf "  Replace it? (y/N): "
  read -r REPLACE
  [[ "$REPLACE" =~ ^[Yy]$ ]] || SKIP_GH=true
fi

if [[ "${SKIP_GH:-false}" != "true" ]]; then
  echo ""
  echo -e "  ${BOLD}Opening:${NC} https://github.com/settings/tokens/new"
  echo -e "  Instructions:"
  echo -e "   1. Name: claude-prompt-engine"
  echo -e "   2. Expiration: 90 days (or No expiration)"
  echo -e "   3. Scopes: ${BOLD}repo${NC}, ${BOLD}read:user${NC}, ${BOLD}read:org${NC}"
  echo -e "   4. For GitHub Copilot: also check ${BOLD}copilot${NC}"
  echo -e "   5. Click Generate token → Copy"
  echo ""
  open_browser "https://github.com/settings/tokens/new"
  sleep 2
  read_key "Paste GitHub token (ghp_…)" GH_TOKEN

  if [[ -n "$GH_TOKEN" ]] && command -v curl &>/dev/null; then
    printf "  Validating token…"
    GH_USER=$(curl -s -H "Authorization: token $GH_TOKEN" https://api.github.com/user 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('login','?'))" 2>/dev/null || echo "?")
    if [[ "$GH_USER" != "?" && "$GH_USER" != "null" ]]; then
      ok " Authenticated as: $GH_USER"
    else
      warn " Could not verify token."
    fi
  fi
fi

# ── Telnyx API Key (optional) ────────────────────────────────

section "Step 3 — Telnyx API Key (Optional — Telephony)"

echo -e "  Required only for VoIP/SIP/Vicidial telephony features."
echo ""

if [[ -n "$TELNYX_API_KEY" ]]; then
  ok "Key already set: ${TELNYX_API_KEY:0:20}…"
  printf "  Replace it? (y/N): "
  read -r REPLACE
  [[ "$REPLACE" =~ ^[Yy]$ ]] || SKIP_TELNYX=true
fi

if [[ "${SKIP_TELNYX:-false}" != "true" ]]; then
  printf "  Configure Telnyx now? (y/N): "
  read -r DO_TELNYX
  if [[ "$DO_TELNYX" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "  ${BOLD}Opening:${NC} https://portal.telnyx.com/#/app/api-keys"
    echo -e "  Instructions:"
    echo -e "   1. Sign in or create a Telnyx account"
    echo -e "   2. Go to Auth → API Keys → Create"
    echo -e "   3. Copy the KEY_…  value"
    echo ""
    open_browser "https://portal.telnyx.com/#/app/api-keys"
    sleep 2
    read_key "Paste Telnyx API key (KEY_…)" TELNYX_API_KEY
  fi
fi

# ── MySQL / Vicidial ─────────────────────────────────────────

section "Step 4 — MySQL / Vicidial Database"

echo -e "  Connection settings for your Vicidial database."
echo ""

printf "  MySQL Host [%s]: " "$MYSQL_HOST"
read -r INPUT; [[ -n "$INPUT" ]] && MYSQL_HOST="$INPUT"

printf "  MySQL User [%s]: " "$MYSQL_USER"
read -r INPUT; [[ -n "$INPUT" ]] && MYSQL_USER="$INPUT"

printf "  MySQL Password: "
read -rs INPUT; echo ""
[[ -n "$INPUT" ]] && MYSQL_PASS="$INPUT"

printf "  MySQL Database [%s]: " "$MYSQL_DB"
read -r INPUT; [[ -n "$INPUT" ]] && MYSQL_DB="$INPUT"

# ── Write .env ───────────────────────────────────────────────

section "Writing .env"

cat > "$ENV_FILE" << EOF
# Claude Prompt Engine — Environment Variables
# Generated by setup-keys.sh on $(date)
# ⚠  NEVER commit this file to version control

# ── AI Engine ────────────────────────────────────────────────
# OpenAI API (primary iAI engine — requires billing credit)
# Generate: https://platform.openai.com/api-keys
OPENAI_API_KEY=${OPENAI_API_KEY:-}

# GitHub Token (Copilot API fallback + GitHub API access)
# Generate: https://github.com/settings/tokens/new
GH_TOKEN=${GH_TOKEN:-}

# ── Telephony (Optional) ─────────────────────────────────────
# Telnyx SIP/VoIP integration
# Generate: https://portal.telnyx.com/#/app/api-keys
TELNYX_API_KEY=${TELNYX_API_KEY:-}

# ── Database ─────────────────────────────────────────────────
MYSQL_HOST=${MYSQL_HOST}
MYSQL_USER=${MYSQL_USER}
MYSQL_PASS=${MYSQL_PASS}
MYSQL_DB=${MYSQL_DB}

# ── App ──────────────────────────────────────────────────────
PORT=3000
NODE_ENV=development
EOF

ok ".env written to: $ENV_FILE"

# Ensure .env is gitignored
if ! grep -q '^\.env$' "$SCRIPT_DIR/.gitignore" 2>/dev/null; then
  echo ".env" >> "$SCRIPT_DIR/.gitignore"
  ok ".env added to .gitignore"
fi

# ── Optional: Additional Software ───────────────────────────

section "Step 5 — Optional: Additional Software"

install_optional() {
  local name="$1"; local url="$2"; local check_cmd="$3"
  if command -v "$check_cmd" &>/dev/null; then
    ok "$name already installed"
  else
    printf "  Install %s? (y/N): " "$name"
    read -r REPLY
    if [[ "$REPLY" =~ ^[Yy]$ ]]; then
      open_browser "$url"
      warn "$name: follow browser instructions"
    fi
  fi
}

install_optional "GitHub CLI (gh)" "https://cli.github.com/" "gh"
install_optional "MySQL Client"    "https://dev.mysql.com/downloads/" "mysql"

# ── Start server ─────────────────────────────────────────────

section "Setup Complete!"

ok "Keys saved to .env"
ok "iAI engine priority: OpenAI → Copilot API → gh CLI"
echo ""
echo -e "  ${BOLD}Next steps:${NC}"
echo -e "   • Start the server:  ${CYAN}npm start${NC}"
echo -e "   • Open iAI:          ${CYAN}http://localhost:3000/iai.html${NC}"
echo -e "   • Web key wizard:    ${CYAN}http://localhost:3000/setup.html${NC}"
echo ""

printf "  Start the server now? (y/N): "
read -r START_NOW
if [[ "$START_NOW" =~ ^[Yy]$ ]]; then
  cd "$SCRIPT_DIR"
  exec npm start
fi
