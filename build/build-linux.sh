#!/bin/bash

################################################################################
#  SIMPLIFIED LINUX INSTALLER BUILDER
#  Creates .deb packages directly without fpm dependency
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_NAME="claude-prompt-engine"
VERSION="${1:-1.0.0}"
BUILD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${BUILD_DIR}/dist"
TEMP_BUILD="${BUILD_DIR}/.build-temp"

log_info() { echo -e "${BLUE}[INFO]${NC} $1" >&2; }
log_success() { echo -e "${GREEN}[✓]${NC} $1" >&2; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1" >&2; }
log_error() { echo -e "${RED}[✗]${NC} $1" >&2; }

print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  $1"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
}

################################################################################
# SETUP
################################################################################

setup_build_env() {
    print_header "SETTING UP BUILD ENVIRONMENT"
    
    log_info "Creating build directories..."
    mkdir -p "$DIST_DIR"
    mkdir -p "$TEMP_BUILD"
    
    log_info "Installing npm dependencies..."
    cd "$BUILD_DIR"
    if [ ! -d "node_modules" ]; then
        npm install --production --silent
    fi
    
    log_success "Build environment ready"
}

################################################################################
# PREPARE PACKAGE FILES
################################################################################

prepare_package_files() {
    local staging="$TEMP_BUILD/package"
    rm -rf "$staging"
    mkdir -p "$staging"
    
    log_info "Copying application files..."
    cp -r public "$staging/" 2>/dev/null || true
    cp -r core "$staging/" 2>/dev/null || true
    cp -r cli "$staging/" 2>/dev/null || true
    cp -r configs "$staging/" 2>/dev/null || true
    cp -r memory "$staging/" 2>/dev/null || true
    cp package.json "$staging/" || true
    cp package-lock.json "$staging/" 2>/dev/null || true
    cp server.js "$staging/" || true
    cp .env.example "$staging/.env" 2>/dev/null || true
    cp README.md "$staging/" 2>/dev/null || true
    
    mkdir -p "$staging/logs"
    mkdir -p "$staging/.github/workflows"
    
    log_success "Package files prepared at: $staging"
    echo "$staging"
}

################################################################################
# BUILD DEBIAN PACKAGE
################################################################################

build_deb_package() {
    print_header "BUILDING DEBIAN PACKAGE (.deb)"
    
    local staging="$1"
    local pkg_dir="${TEMP_BUILD}/deb-package"
    local ctrl_dir="${pkg_dir}/DEBIAN"
    
    log_info "Creating package directory structure..."
    mkdir -p "$pkg_dir/opt/${PROJECT_NAME}"
    mkdir -p "$ctrl_dir"
    
    # Copy files
    log_info "Copying application to /opt/${PROJECT_NAME}..."
    cp -r "$staging"/* "$pkg_dir/opt/${PROJECT_NAME}/"
    
    # Create control file
    log_info "Creating control metadata..."
    cat > "$ctrl_dir/control" << 'CONTROL'
Package: claude-prompt-engine
Version: VERSION_PLACEHOLDER
Architecture: amd64
Maintainer: Your Name <your.email@example.com>
Homepage: https://github.com/yourusername/claude-prompt-engine
Description: Claude Prompt Engine with GitHub Copilot CLI Integration
 Generate AI prompts intelligently with multi-model support,
 automatic learning, and self-updating capabilities.
Depends: nodejs (>= 14)
CONTROL
    
    sed -i "s/VERSION_PLACEHOLDER/${VERSION}/g" "$ctrl_dir/control"
    chmod 644 "$ctrl_dir/control"
    
    # Create post-install script
    log_info "Creating post-install script..."
    cat > "$ctrl_dir/postinst" << 'POSTINST'
#!/bin/bash
set -e

APP_DIR="/opt/claude-prompt-engine"
APP_USER="claude-engine"

# Create system user
if ! id "$APP_USER" &>/dev/null 2>&1; then
    useradd -r -s /bin/bash -m -d /var/lib/claude-engine "$APP_USER" || true
fi

# Install npm dependencies
echo "Installing npm dependencies..."
cd "$APP_DIR"
npm install --production --silent || npm install --production

# Set permissions
chown -R "$APP_USER:$APP_USER" "$APP_DIR" || true
chmod -R 755 "$APP_DIR" || true
mkdir -p "$APP_DIR/logs"
chmod 755 "$APP_DIR/logs"

# Create systemd service
cat > /etc/systemd/system/claude-prompt-engine.service << 'EOF'
[Unit]
Description=Claude Prompt Engine
After=network.target

[Service]
Type=simple
User=claude-engine
WorkingDirectory=/opt/claude-prompt-engine
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/node /opt/claude-prompt-engine/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload 2>/dev/null || true
systemctl enable claude-prompt-engine 2>/dev/null || true

echo "✓ Claude Prompt Engine installed!"
echo "  Start service: sudo systemctl start claude-prompt-engine"
echo "  Access at: http://localhost:3000"

exit 0
POSTINST
    
    chmod 755 "$ctrl_dir/postinst"
    
    # Create pre-remove script
    cat > "$ctrl_dir/prerm" << 'PRERM'
#!/bin/bash
systemctl stop claude-prompt-engine 2>/dev/null || true
exit 0
PRERM
    
    chmod 755 "$ctrl_dir/prerm"
    
    # Build deb
    log_info "Building .deb package..."
    local deb_file="${DIST_DIR}/${PROJECT_NAME}-${VERSION}.deb"
    
    # Calculate size
    local size=$(du -sk "$pkg_dir/opt/${PROJECT_NAME}" | cut -f1)
    sed -i "s/^Installed-Size:.*/Installed-Size: $size/" "$ctrl_dir/control"
    
    # Build package
    dpkg-deb --build "$pkg_dir" "$deb_file" 2>&1 | grep -v "^$" || true
    
    if [ -f "$deb_file" ]; then
        local size_mb=$(du -h "$deb_file" | cut -f1)
        log_success "DEB package created: ${PROJECT_NAME}-${VERSION}.deb ($size_mb)"
        return 0
    else
        log_error "Failed to create .deb package"
        return 1
    fi
}

################################################################################
# BUILD RPM PACKAGE
################################################################################

build_rpm_package() {
    print_header "BUILDING RPM PACKAGE (.rpm)"
    
    local staging="$1"
    local pkg_dir="${TEMP_BUILD}/rpm-package"
    
    mkdir -p "$pkg_dir/opt/${PROJECT_NAME}"
    cp -r "$staging"/* "$pkg_dir/opt/${PROJECT_NAME}/"
    
    log_info "Creating RPM spec file..."
    
    cat > "${TEMP_BUILD}/claude-engine.spec" << 'SPECFILE'
Name:           claude-prompt-engine
Version:        VERSION_PLACEHOLDER
Release:        1%{?dist}
Summary:        Claude Prompt Engine with GitHub Copilot CLI Integration
License:        MIT
URL:            https://github.com/yourusername/claude-prompt-engine

Requires:       nodejs >= 14
Requires(pre):  /usr/sbin/useradd
Requires(post): /usr/bin/systemctl

%description
Generate AI prompts intelligently with multi-model support,
automatic learning, and self-updating capabilities.

%prep
# No prep needed - using pre-built files

%install
mkdir -p %{buildroot}/opt/claude-prompt-engine
cp -r STAGING_DIR/* %{buildroot}/opt/claude-prompt-engine/

%pre
if ! id claude-engine &>/dev/null 2>&1; then
    useradd -r -s /bin/bash -m -d /var/lib/claude-engine claude-engine || true
fi

%post
chown -R claude-engine:claude-engine /opt/claude-prompt-engine
chmod -R 755 /opt/claude-prompt-engine

cat > /etc/systemd/system/claude-prompt-engine.service << 'EOF'
[Unit]
Description=Claude Prompt Engine
After=network.target

[Service]
Type=simple
User=claude-engine
WorkingDirectory=/opt/claude-prompt-engine
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/node /opt/claude-prompt-engine/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload 2>/dev/null || true
systemctl enable claude-prompt-engine 2>/dev/null || true

%preun
systemctl stop claude-prompt-engine 2>/dev/null || true

%files
/opt/claude-prompt-engine

%changelog
* Tue Apr 08 2026 Your Name <your.email@example.com> - VERSION_PLACEHOLDER-1
- Initial release
SPECFILE
    
    sed -i "s/VERSION_PLACEHOLDER/${VERSION}/g" "${TEMP_BUILD}/claude-engine.spec"
    sed -i "s|STAGING_DIR|$staging|g" "${TEMP_BUILD}/claude-engine.spec"
    
    log_info "Building RPM package..."
    
    if command -v rpmbuild &> /dev/null; then
        # Try using rpmbuild
        mkdir -p ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
        cp "${TEMP_BUILD}/claude-engine.spec" ~/rpmbuild/SPECS/
        
        rpmbuild -bb ~/rpmbuild/SPECS/claude-engine.spec 2>&1 | grep -v "^$" || true
        
        if [ -f ~/rpmbuild/RPMS/x86_64/*claude*.rpm ]; then
            cp ~/rpmbuild/RPMS/x86_64/*claude*.rpm "$DIST_DIR/" 2>/dev/null || true
            log_success "RPM package created"
        else
            log_warn "RPM build skipped (rpmbuild not properly configured)"
        fi
    else
        log_warn "rpmbuild not found - skipping RPM build"
    fi
}

################################################################################
# VERIFICATION
################################################################################

verify_packages() {
    print_header "VERIFYING PACKAGES"
    
    local found=0
    
    for pkg in "$DIST_DIR"/*; do
        if [ -f "$pkg" ]; then
            local size=$(du -h "$pkg" | cut -f1)
            local name=$(basename "$pkg")
            log_success "$name ($size)"
            ((found++))
        fi
    done
    
    if [ $found -eq 0 ]; then
        log_warn "No packages created"
        return 1
    fi
    
    log_success "$found package(s) created successfully"
}

create_checksums() {
    print_header "CREATING CHECKSUMS"
    
    cd "$DIST_DIR"
    log_info "Generating SHA256 checksums..."
    sha256sum * > SHA256SUMS 2>/dev/null || shasum -a 256 * > SHA256SUMS
    log_success "Checksums created"
    cd "$BUILD_DIR"
}

cleanup() {
    print_header "CLEANUP"
    
    log_info "Removing temporary files..."
    rm -rf "$TEMP_BUILD"
    
    log_success "Cleanup complete"
}

################################################################################
# MAIN
################################################################################

main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                                                                ║"
    echo "║  LINUX INSTALLER BUILDER                                      ║"
    echo "║  Claude Prompt Engine v${VERSION}                                  ║"
    echo "║                                                                ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    setup_build_env || exit 1
    local staging=$(prepare_package_files) || exit 1
    
    build_deb_package "$staging" || true
    build_rpm_package "$staging" || true
    
    verify_packages || true
    create_checksums
    cleanup
    
    print_header "BUILD COMPLETE"
    log_success "Installers ready in: $DIST_DIR"
    echo ""
    log_info "Installation commands:"
    echo ""
    echo "  Debian/Ubuntu:"
    echo "    sudo apt-get install ./${PROJECT_NAME}-${VERSION}.deb"
    echo ""
    echo "  Fedora/RHEL:"
    echo "    sudo dnf install ./${PROJECT_NAME}-${VERSION}.rpm"
    echo ""
}

main "$@"
