#!/bin/bash

#############################################################################
#                                                                           #
#  ██╗  ██╗███████╗██╗  ██╗███████╗████████╗██████╗ ██╗██╗  ██╗███████╗    #
#  ██║  ██║██╔════╝╚██╗██╔╝██╔════╝╚══██╔══╝██╔══██╗██║██║ ██╔╝██╔════╝    #
#  ███████║█████╗   ╚███╔╝ ███████╗   ██║   ██████╔╝██║█████╔╝ █████╗      #
#  ██╔══██║██╔══╝   ██╔██╗ ╚════██║   ██║   ██╔══██╗██║██╔═██╗ ██╔══╝      #
#  ██║  ██║███████╗██╔╝ ██╗███████║   ██║   ██║  ██║██║██║  ██╗███████╗    #
#  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝    #
#                                                                           #
#  HexStrike AI v6.0 - Auto Installer                                       #
#  AI-Powered Cybersecurity Automation Platform                             #
#                                                                           #
#############################################################################

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/hexstrike-env"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Flags (defaults)
AUTO_INSTALL_SYSTEM_DEPS=true
WITH_OFFENSIVE_TOOLS=false
PRODUCTION_MODE=false
RECREATE_VENV=false
SKIP_FRONTEND=false
SKIP_TOOL_CHECK=false
SKIP_SECURITY_TOOLS=false
GENERATE_SYSTEMD=false

# Detected OS info
DETECTED_OS=""
DETECTED_DISTRO=""
IS_KALI=false

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

print_banner() {
    echo -e "${RED}"
    echo "╔═══════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                           ║"
    echo "║  ██╗  ██╗███████╗██╗  ██╗███████╗████████╗██████╗ ██╗██╗  ██╗███████╗    ║"
    echo "║  ██║  ██║██╔════╝╚██╗██╔╝██╔════╝╚══██╔══╝██╔══██╗██║██║ ██╔╝██╔════╝    ║"
    echo "║  ███████║█████╗   ╚███╔╝ ███████╗   ██║   ██████╔╝██║█████╔╝ █████╗      ║"
    echo "║  ██╔══██║██╔══╝   ██╔██╗ ╚════██║   ██║   ██╔══██╗██║██╔═██╗ ██╔══╝      ║"
    echo "║  ██║  ██║███████╗██╔╝ ██╗███████║   ██║   ██║  ██║██║██║  ██╗███████╗    ║"
    echo "║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝    ║"
    echo "║                                                                           ║"
    echo -e "║            ${BOLD}HexStrike AI v6.0 - Auto Installer${NC}${RED}                            ║"
    echo "║                  AI-Powered Cybersecurity Platform                        ║"
    echo "║                                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --skip-security-tools       Skip automatic installation of security tools"
    echo "  --with-offensive-tools      Install offensive tooling (pwntools, angr)"
    echo "  --production                Setup for production (gunicorn, systemd service)"
    echo "  --recreate-venv             Force recreation of the virtual environment"
    echo "  --skip-frontend             Skip frontend installation"
    echo "  --skip-tool-check           Skip security tool availability check"
    echo "  --generate-systemd          Generate systemd service file"
    echo "  -h, --help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                  # Install all security tools by default"
    echo "  $0 --skip-security-tools            # Skip security tool installation"
    echo "  $0 --with-offensive-tools           # Include binary exploitation tools"
    echo "  $0 --production --generate-systemd  # Production setup with systemd"
    echo ""
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}${BOLD}$1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

abort_with_message() {
    log_error "$1"
    echo ""
    echo -e "${YELLOW}Suggested action:${NC} $2"
    echo ""
    exit 1
}

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "  ${RED}✗${NC} $1 ${YELLOW}(not installed)${NC}"
        return 1
    fi
}

check_python_version() {
    local python_cmd="$1"
    if command -v "$python_cmd" &> /dev/null; then
        local version=$("$python_cmd" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
        local major=$(echo "$version" | cut -d. -f1)
        local minor=$(echo "$version" | cut -d. -f2)
        if [ "$major" -ge 3 ] && [ "$minor" -ge 8 ]; then
            echo "$python_cmd"
            return 0
        fi
    fi
    return 1
}

# ============================================================================
# OS DETECTION
# ============================================================================

detect_os() {
    log_info "Detecting operating system..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        DETECTED_OS="linux"
        
        # Detect specific distro
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DETECTED_DISTRO="$ID"
            
            # Check for Kali Linux
            if [[ "$ID" == "kali" ]]; then
                IS_KALI=true
                log_success "Detected Kali Linux - security tools likely pre-installed"
            elif [[ "$ID" == "ubuntu" ]] || [[ "$ID" == "debian" ]]; then
                log_success "Detected $NAME"
            elif [[ "$ID_LIKE" == *"debian"* ]] || [[ "$ID_LIKE" == *"ubuntu"* ]]; then
                log_success "Detected Debian-based distribution: $NAME"
                DETECTED_DISTRO="debian"
            else
                log_warning "Detected Linux distribution: $NAME (not officially supported, but may work)"
            fi
        else
            log_warning "Could not detect Linux distribution (/etc/os-release not found)"
            DETECTED_DISTRO="unknown"
        fi
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        DETECTED_OS="macos"
        DETECTED_DISTRO="macos"
        log_success "Detected macOS"
        
    else
        DETECTED_OS="unknown"
        abort_with_message "Unsupported operating system: $OSTYPE" \
            "HexStrike AI requires Linux (Ubuntu/Debian/Kali) or macOS."
    fi
}

# ============================================================================
# SYSTEM DEPENDENCY CHECKS
# ============================================================================

check_system_dependencies() {
    log_step "Checking System Dependencies"
    
    local missing_deps=()
    
    # Check Python 3.8+
    log_info "Checking Python version..."
    PYTHON_CMD=""
    for cmd in python3 python python3.11 python3.10 python3.9 python3.8; do
        if PYTHON_CMD=$(check_python_version "$cmd"); then
            log_success "Found compatible Python: $PYTHON_CMD ($(${PYTHON_CMD} --version))"
            break
        fi
    done
    
    if [ -z "$PYTHON_CMD" ]; then
        missing_deps+=("python3.8+")
    fi
    
    # Check for pip (do NOT assume ensurepip exists)
    log_info "Checking pip availability..."
    if [ -n "$PYTHON_CMD" ]; then
        if ! $PYTHON_CMD -m pip --version &> /dev/null; then
            # Try to find pip as a standalone command
            if command -v pip3 &> /dev/null; then
                log_success "Found pip3 command"
            elif command -v pip &> /dev/null; then
                log_success "Found pip command"
            else
                missing_deps+=("python3-pip")
            fi
        else
            log_success "pip is available via Python module"
        fi
    fi
    
    # Check for venv module (critical - cannot use ensurepip)
    log_info "Checking venv module..."
    if [ -n "$PYTHON_CMD" ]; then
        if ! $PYTHON_CMD -c "import venv" &> /dev/null; then
            missing_deps+=("python3-venv")
        else
            log_success "venv module is available"
        fi
    fi
    
    # If there are missing dependencies, handle them
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo ""
        log_error "Missing required system dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo -e "  ${RED}✗${NC} $dep"
        done
        echo ""
        
        if [ "$AUTO_INSTALL_SYSTEM_DEPS" = true ]; then
            install_system_dependencies "${missing_deps[@]}"
        else
            local install_cmd=""
            case "$DETECTED_DISTRO" in
                ubuntu|debian|kali)
                    install_cmd="sudo apt update && sudo apt install -y ${missing_deps[*]}"
                    ;;
                fedora)
                    install_cmd="sudo dnf install -y ${missing_deps[*]}"
                    ;;
                macos)
                    install_cmd="brew install ${missing_deps[*]}"
                    ;;
                *)
                    install_cmd="Install: ${missing_deps[*]}"
                    ;;
            esac
            
            abort_with_message "Required system dependencies are missing." \
                "Run: $install_cmd\n   Or re-run with: $0 --auto-install-system-deps"
        fi
    fi
}

install_system_dependencies() {
    local deps=("$@")
    log_info "Attempting to install system dependencies: ${deps[*]}"
    
    case "$DETECTED_DISTRO" in
        ubuntu|debian|kali)
            sudo apt update
            sudo apt install -y "${deps[@]}" || {
                abort_with_message "Failed to install system dependencies" \
                    "Please install manually: sudo apt install -y ${deps[*]}"
            }
            ;;
        fedora)
            sudo dnf install -y "${deps[@]}" || {
                abort_with_message "Failed to install system dependencies" \
                    "Please install manually: sudo dnf install -y ${deps[*]}"
            }
            ;;
        macos)
            brew install "${deps[@]}" || {
                abort_with_message "Failed to install system dependencies" \
                    "Please install manually: brew install ${deps[*]}"
            }
            ;;
        *)
            abort_with_message "Cannot auto-install on this OS: $DETECTED_DISTRO" \
                "Please install the following packages manually: ${deps[*]}"
            ;;
    esac
    
    log_success "System dependencies installed successfully"
}

# ============================================================================
# VENV MANAGEMENT
# ============================================================================

validate_venv_python_version() {
    if [ -d "$VENV_DIR" ] && [ -f "$VENV_DIR/bin/python" ]; then
        local venv_version=$("$VENV_DIR/bin/python" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
        local system_version=$($PYTHON_CMD -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
        
        if [ "$venv_version" != "$system_version" ]; then
            log_warning "Virtual environment Python version ($venv_version) differs from system ($system_version)"
            if [ "$RECREATE_VENV" = true ]; then
                log_info "Recreating virtual environment as requested..."
                rm -rf "$VENV_DIR"
            else
                log_warning "Consider running with --recreate-venv to update the virtual environment"
            fi
        fi
    fi
}

setup_venv() {
    log_step "Setting Up Python Virtual Environment"
    
    # Validate existing venv version if it exists
    validate_venv_python_version
    
    if [ -d "$VENV_DIR" ]; then
        if [ "$RECREATE_VENV" = true ]; then
            log_info "Removing existing virtual environment..."
            rm -rf "$VENV_DIR"
        else
            log_info "Using existing virtual environment at $VENV_DIR"
        fi
    fi
    
    if [ ! -d "$VENV_DIR" ]; then
        log_info "Creating virtual environment..."
        $PYTHON_CMD -m venv "$VENV_DIR" || {
            abort_with_message "Failed to create virtual environment" \
                "Ensure python3-venv is installed: sudo apt install python3-venv"
        }
        log_success "Virtual environment created at $VENV_DIR"
    fi
    
    # Activate virtual environment
    log_info "Activating virtual environment..."
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
        log_success "Virtual environment activated"
    else
        abort_with_message "Virtual environment activation script not found at $VENV_DIR/bin/activate" \
            "Please ensure you are running on a Unix-like system (Linux/macOS)"
    fi
}

# ============================================================================
# PYTHON DEPENDENCY INSTALLATION
# ============================================================================

install_python_dependencies() {
    log_step "Installing Python Dependencies"
    
    log_info "Upgrading pip..."
    pip install --upgrade pip --progress-bar off 2>&1 | tail -1
    
    # Install core dependencies
    log_info "Installing core dependencies from requirements-core.txt..."
    if [ -f "$SCRIPT_DIR/requirements-core.txt" ]; then
        if pip install -r "$SCRIPT_DIR/requirements-core.txt" --progress-bar off 2>&1 | tail -3; then
            log_success "Core Python dependencies installed successfully"
        else
            abort_with_message "Failed to install core Python dependencies" \
                "Check requirements-core.txt for compatibility issues"
        fi
    else
        # Fallback to requirements.txt if split files don't exist
        log_warning "requirements-core.txt not found, falling back to requirements.txt"
        if pip install -r "$SCRIPT_DIR/requirements.txt" --progress-bar off 2>&1 | tail -3; then
            log_success "Python dependencies installed successfully"
        else
            abort_with_message "Failed to install Python dependencies" \
                "Check requirements.txt for compatibility issues"
        fi
    fi
    
    # Install offensive tools if requested
    if [ "$WITH_OFFENSIVE_TOOLS" = true ]; then
        log_info "Installing offensive tooling dependencies from requirements-offensive.txt..."
        if [ -f "$SCRIPT_DIR/requirements-offensive.txt" ]; then
            if pip install -r "$SCRIPT_DIR/requirements-offensive.txt" --progress-bar off 2>&1 | tail -3; then
                log_success "Offensive tooling dependencies installed successfully"
            else
                log_warning "Some offensive tooling dependencies failed to install"
                log_info "These packages have complex dependencies and may require manual installation"
                log_info "You may need: sudo apt install libffi-dev libcapstone-dev"
            fi
        else
            log_warning "requirements-offensive.txt not found"
        fi
    fi
}

# ============================================================================
# FRONTEND INSTALLATION
# ============================================================================

check_frontend_prerequisites() {
    log_info "Checking Node.js and npm..."
    NODE_AVAILABLE=false
    
    if [ "$SKIP_FRONTEND" = true ]; then
        log_info "Skipping frontend check (--skip-frontend specified)"
        return
    fi
    
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        NODE_VERSION=$(node --version | sed 's/v//')
        NPM_VERSION=$(npm --version)
        NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
        
        if [ "$NODE_MAJOR" -ge 18 ]; then
            log_success "Node.js v$NODE_VERSION and npm $NPM_VERSION found"
            NODE_AVAILABLE=true
        else
            log_warning "Node.js version $NODE_VERSION is below minimum required (18+)"
            log_info "Frontend installation will be skipped. Install Node.js 18+ for frontend support."
        fi
    else
        log_warning "Node.js/npm not found. Frontend will not be installed."
        log_info "Install Node.js 18+ for the web frontend: https://nodejs.org/"
    fi
}

install_frontend_dependencies() {
    log_step "Installing Frontend Dependencies"
    
    if [ "$SKIP_FRONTEND" = true ]; then
        log_info "Skipping frontend installation (--skip-frontend specified)"
        return
    fi
    
    if [ "$NODE_AVAILABLE" = true ] && [ -d "$FRONTEND_DIR" ]; then
        log_info "Installing frontend dependencies..."
        cd "$FRONTEND_DIR"
        if npm install --loglevel warn 2>&1 | tail -5; then
            log_success "Frontend dependencies installed"
            FRONTEND_INSTALLED=true
        else
            log_warning "Frontend dependency installation had issues. Check npm output above."
            log_info "You can try running 'cd frontend && npm install' manually later."
            FRONTEND_INSTALLED=false
        fi
        cd "$SCRIPT_DIR"
    else
        log_info "Skipping frontend installation (Node.js not available or frontend directory missing)"
        FRONTEND_INSTALLED=false
    fi
}

# ============================================================================
# SECURITY TOOLS INSTALLATION
# ============================================================================

install_security_tools() {
    log_step "Installing Security Tools"
    
    local apt_tools=()
    local go_tools=()
    local rust_tools=()
    local pip_tools=()
    
    # Check which tools need to be installed and categorize them
    log_info "Checking which security tools need to be installed..."
    
    # Essential Network Tools (apt)
    command -v nmap &> /dev/null || apt_tools+=("nmap")
    command -v masscan &> /dev/null || apt_tools+=("masscan")
    
    # Web Application Tools (apt)
    command -v gobuster &> /dev/null || apt_tools+=("gobuster")
    command -v nikto &> /dev/null || apt_tools+=("nikto")
    command -v sqlmap &> /dev/null || apt_tools+=("sqlmap")
    
    # Password & Authentication Tools (apt)
    command -v hydra &> /dev/null || apt_tools+=("hydra")
    command -v john &> /dev/null || apt_tools+=("john")
    command -v hashcat &> /dev/null || apt_tools+=("hashcat")
    
    # SMB & Network Enumeration (apt)
    command -v smbmap &> /dev/null || apt_tools+=("smbmap")
    
    # Go-based tools
    command -v ffuf &> /dev/null || go_tools+=("github.com/ffuf/ffuf/v2@latest")
    command -v nuclei &> /dev/null || go_tools+=("github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest")
    command -v amass &> /dev/null || go_tools+=("github.com/owasp-amass/amass/v4/...@latest")
    command -v subfinder &> /dev/null || go_tools+=("github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest")
    
    # Rust-based tools
    command -v rustscan &> /dev/null || rust_tools+=("rustscan")
    command -v feroxbuster &> /dev/null || rust_tools+=("feroxbuster")
    
    # Git-based tools (installed via pip from GitHub)
    local git_tools=()
    command -v enum4linux-ng &> /dev/null || git_tools+=("enum4linux-ng:https://github.com/cddmp/enum4linux-ng.git")
    
    # Pip-based tools (available from PyPI via pipx)
    local pipx_tools=()
    command -v netexec &> /dev/null || pipx_tools+=("netexec")
    
    # Install apt-based tools
    if [ ${#apt_tools[@]} -gt 0 ]; then
        log_info "Installing apt-based security tools: ${apt_tools[*]}"
        case "$DETECTED_DISTRO" in
            ubuntu|debian|kali)
                sudo apt update
                sudo apt install -y "${apt_tools[@]}" || {
                    log_warning "Some apt packages failed to install. They may not be available in your repositories."
                }
                ;;
            fedora)
                sudo dnf install -y "${apt_tools[@]}" || {
                    log_warning "Some dnf packages failed to install. They may not be available in your repositories."
                }
                ;;
            macos)
                brew install "${apt_tools[@]}" || {
                    log_warning "Some brew packages failed to install."
                }
                ;;
            *)
                log_warning "Cannot auto-install apt-based tools on this OS: $DETECTED_DISTRO"
                log_info "Please install manually: ${apt_tools[*]}"
                ;;
        esac
    else
        log_info "All apt-based security tools are already installed"
    fi
    
    # Install Go-based tools
    if [ ${#go_tools[@]} -gt 0 ]; then
        # Install Go if not available
        if ! command -v go &> /dev/null; then
            log_info "Go is not installed. Installing Go..."
            case "$DETECTED_DISTRO" in
                ubuntu|debian|kali)
                    sudo apt update
                    sudo apt install -y golang-go || {
                        log_warning "Failed to install Go via apt"
                        log_info "Install Go manually from: https://golang.org/dl/"
                    }
                    ;;
                fedora)
                    sudo dnf install -y golang || {
                        log_warning "Failed to install Go via dnf"
                        log_info "Install Go manually from: https://golang.org/dl/"
                    }
                    ;;
                macos)
                    brew install go || {
                        log_warning "Failed to install Go via brew"
                        log_info "Install Go manually from: https://golang.org/dl/"
                    }
                    ;;
                *)
                    log_warning "Cannot auto-install Go on this OS: $DETECTED_DISTRO"
                    log_info "Install Go from: https://golang.org/dl/"
                    ;;
            esac
        fi
        
        if command -v go &> /dev/null; then
            log_info "Installing Go-based security tools..."
            
            # Set GOPATH if not set
            export GOPATH="${GOPATH:-$HOME/go}"
            export PATH="$PATH:$GOPATH/bin"
            
            for tool in "${go_tools[@]}"; do
                # Extract tool name from the path (e.g., github.com/ffuf/ffuf/v2@latest -> ffuf)
                tool_path="${tool%@*}"                    # Remove version suffix
                tool_name=$(echo "$tool_path" | sed 's|.*/||; s|/v[0-9]*$||')  # Get last component, remove version dir
                log_info "Installing $tool_name..."
                go install "$tool" || log_warning "Failed to install $tool_name"
            done
            
            log_info "Go tools installed to $GOPATH/bin"
            log_info "Add to your PATH: export PATH=\$PATH:$GOPATH/bin"
        else
            log_warning "Go is still not available. Skipping Go-based tools: ffuf, nuclei, amass, subfinder"
            log_info "Install Go from: https://golang.org/dl/"
            log_info "Then run: go install <tool>@latest"
        fi
    else
        log_info "All Go-based security tools are already installed"
    fi
    
    # Install Rust-based tools
    if [ ${#rust_tools[@]} -gt 0 ]; then
        # Install Rust/Cargo if not available
        if ! command -v cargo &> /dev/null; then
            log_info "Rust/Cargo not found. Installing Rust toolchain..."
            # Download rustup installer to temp file for verification before execution
            local rustup_script="/tmp/rustup-init-$$.sh"
            if curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs -o "$rustup_script"; then
                chmod +x "$rustup_script"
                "$rustup_script" -y || {
                    log_warning "Failed to install Rust toolchain"
                    log_info "Please install Rust manually from: https://rustup.rs/"
                }
                rm -f "$rustup_script"
            else
                log_warning "Failed to download Rust installer"
                log_info "Please install Rust manually from: https://rustup.rs/"
            fi
            # Source cargo environment and verify it's available
            if [ -f "$HOME/.cargo/env" ]; then
                source "$HOME/.cargo/env"
                if ! command -v cargo &> /dev/null; then
                    log_warning "Cargo still not available after sourcing environment"
                fi
            fi
        fi
        
        if command -v cargo &> /dev/null; then
            log_info "Installing Rust-based security tools..."
            for tool in "${rust_tools[@]}"; do
                log_info "Installing $tool..."
                cargo install "$tool" || log_warning "Failed to install $tool"
            done
        else
            log_warning "Cargo (Rust) is still not available. Skipping Rust-based tools: rustscan, feroxbuster"
            log_info "Install Rust from: https://rustup.rs/"
            log_info "Then run: cargo install rustscan"
        fi
    else
        log_info "All Rust-based security tools are already installed"
    fi
    
    # Install git-based tools (from GitHub repositories)
    if [ ${#git_tools[@]} -gt 0 ]; then
        log_info "Installing git-based security tools..."
        for tool_entry in "${git_tools[@]}"; do
            # Parse tool name and URL from format "name:url"
            tool_name="${tool_entry%%:*}"
            git_url="${tool_entry#*:}"
            
            log_info "Installing $tool_name from GitHub..."
            
            # Create a temporary directory for cloning
            local temp_dir="/tmp/${tool_name}-install-$$"
            
            if git clone "$git_url" "$temp_dir" 2>/dev/null; then
                # Check if the repository has a setup.py or pyproject.toml
                if [ -f "$temp_dir/setup.py" ] || [ -f "$temp_dir/pyproject.toml" ]; then
                    pip install "$temp_dir" && log_success "Installed $tool_name" || log_warning "Failed to install $tool_name"
                elif [ -f "$temp_dir/requirements.txt" ]; then
                    # Install requirements and copy the main script
                    if pip install -r "$temp_dir/requirements.txt"; then
                        # Look for executable script: try common patterns
                        local script_found=false
                        for script_pattern in "${tool_name}.py" "${tool_name}" "bin/${tool_name}" "bin/${tool_name}.py"; do
                            if [ -f "$temp_dir/$script_pattern" ]; then
                                chmod +x "$temp_dir/$script_pattern"
                                sudo cp "$temp_dir/$script_pattern" /usr/local/bin/"$tool_name" && {
                                    log_success "Installed $tool_name"
                                    script_found=true
                                    break
                                }
                            fi
                        done
                        
                        if [ "$script_found" = false ]; then
                            log_warning "Could not find executable script for $tool_name"
                        fi
                    else
                        log_warning "Failed to install $tool_name requirements, skipping"
                    fi
                else
                    log_warning "Could not find installation method for $tool_name"
                fi
                
                # Cleanup
                rm -rf "$temp_dir"
            else
                log_warning "Failed to clone $tool_name repository"
            fi
        done
    else
        log_info "All git-based security tools are already installed"
    fi
    
    # Install pipx-based tools (from PyPI using pipx)
    if [ ${#pipx_tools[@]} -gt 0 ]; then
        log_info "Installing pipx-based security tools: ${pipx_tools[*]}"
        # Use pipx if available, otherwise fall back to pip
        if command -v pipx &> /dev/null; then
            for tool in "${pipx_tools[@]}"; do
                log_info "Installing $tool with pipx..."
                pipx install "$tool" || log_warning "Failed to install $tool"
            done
        else
            log_info "pipx not available, installing via pip..."
            for tool in "${pipx_tools[@]}"; do
                log_info "Installing $tool with pip..."
                # Install in virtual environment if active, otherwise use system pip
                pip install "$tool" || log_warning "Failed to install $tool"
            done
        fi
    else
        log_info "All pipx-based security tools are already installed"
    fi
    
    log_success "Security tools installation completed"
}

# ============================================================================
# SECURITY TOOLS CHECK
# ============================================================================

check_security_tools() {
    if [ "$SKIP_TOOL_CHECK" = true ]; then
        log_info "Skipping security tool check (--skip-tool-check specified)"
        return
    fi
    
    # On Kali Linux, skip this entirely as tools are pre-installed
    if [ "$IS_KALI" = true ]; then
        log_step "Security Tools Check (Kali Linux)"
        log_success "Kali Linux detected - security tools are pre-installed"
        log_info "Run 'apt list --installed' to see available security tools"
        return
    fi
    
    log_step "Security Tools Availability"
    
    log_info "Checking for installed security tools..."
    echo ""
    
    local missing_tools=()
    local missing_go_tools=()
    local missing_rust_tools=()
    local missing_pip_tools=()
    
    # Essential tools
    echo -e "${BOLD}Essential Network Tools:${NC}"
    check_command nmap || missing_tools+=("nmap")
    check_command masscan || missing_tools+=("masscan")
    check_command rustscan || missing_rust_tools+=("rustscan")
    
    echo ""
    echo -e "${BOLD}Web Application Tools:${NC}"
    check_command gobuster || missing_tools+=("gobuster")
    check_command feroxbuster || missing_rust_tools+=("feroxbuster")
    check_command ffuf || missing_go_tools+=("ffuf")
    check_command nikto || missing_tools+=("nikto")
    check_command nuclei || missing_go_tools+=("nuclei")
    check_command sqlmap || missing_tools+=("sqlmap")
    
    echo ""
    echo -e "${BOLD}Password & Authentication Tools:${NC}"
    check_command hydra || missing_tools+=("hydra")
    check_command john || missing_tools+=("john")
    check_command hashcat || missing_tools+=("hashcat")
    
    echo ""
    echo -e "${BOLD}Subdomain & OSINT Tools:${NC}"
    check_command amass || missing_go_tools+=("amass")
    check_command subfinder || missing_go_tools+=("subfinder")
    
    echo ""
    echo -e "${BOLD}SMB & Network Enumeration:${NC}"
    check_command enum4linux-ng || missing_pip_tools+=("enum4linux-ng")
    check_command smbmap || missing_tools+=("smbmap")
    check_command netexec || missing_pip_tools+=("netexec")
    
    echo ""
    
    local apt_count=${#missing_tools[@]}
    local go_count=${#missing_go_tools[@]}
    local rust_count=${#missing_rust_tools[@]}
    local pip_count=${#missing_pip_tools[@]}
    local total_missing=$((apt_count + go_count + rust_count + pip_count))
    
    if [ $total_missing -gt 0 ]; then
        if [ "$AUTO_INSTALL_SYSTEM_DEPS" = true ] && [ "$SKIP_SECURITY_TOOLS" = false ]; then
            log_info "Auto-installing security tools..."
            install_security_tools
            
            # Re-check after installation
            log_info "Verifying installed tools..."
            echo ""
            echo -e "${BOLD}Essential Network Tools:${NC}"
            check_command nmap
            check_command masscan
            check_command rustscan
            echo ""
            echo -e "${BOLD}Web Application Tools:${NC}"
            check_command gobuster
            check_command feroxbuster
            check_command ffuf
            check_command nikto
            check_command nuclei
            check_command sqlmap
            echo ""
            echo -e "${BOLD}Password & Authentication Tools:${NC}"
            check_command hydra
            check_command john
            check_command hashcat
            echo ""
            echo -e "${BOLD}Subdomain & OSINT Tools:${NC}"
            check_command amass
            check_command subfinder
            echo ""
            echo -e "${BOLD}SMB & Network Enumeration:${NC}"
            check_command enum4linux-ng
            check_command smbmap
            check_command netexec
        else
            log_info "Some tools are not installed. To install them automatically, run this script again without the --skip-security-tools flag"
            echo ""
            log_info "Or install manually:"
            if [ ${#missing_tools[@]} -gt 0 ]; then
                case "$DETECTED_DISTRO" in
                    ubuntu|debian)
                        echo -e "  ${YELLOW}sudo apt install ${missing_tools[*]}${NC}"
                        ;;
                    *)
                        echo -e "  ${YELLOW}Install via package manager: ${missing_tools[*]}${NC}"
                        ;;
                esac
            fi
            if [ ${#missing_go_tools[@]} -gt 0 ]; then
                echo -e "  ${YELLOW}Go tools (requires Go): ${missing_go_tools[*]}${NC}"
            fi
            if [ ${#missing_rust_tools[@]} -gt 0 ]; then
                echo -e "  ${YELLOW}Rust tools (requires Cargo): ${missing_rust_tools[*]}${NC}"
            fi
            if [ ${#missing_pip_tools[@]} -gt 0 ]; then
                echo -e "  ${YELLOW}Python tools:${NC}"
                for tool in "${missing_pip_tools[@]}"; do
                    if [ "$tool" = "enum4linux-ng" ]; then
                        echo -e "    ${YELLOW}enum4linux-ng: pip install git+https://github.com/cddmp/enum4linux-ng.git${NC}"
                    else
                        echo -e "    ${YELLOW}$tool: pipx install $tool${NC}"
                    fi
                done
            fi
        fi
    else
        log_success "All security tools are installed"
    fi
    
    echo ""
    log_info "For a complete toolkit, consider using Kali Linux or installing tools from:"
    log_info "  - Official tool repositories (GitHub)"
    log_info "  - Go: go install github.com/<tool>@latest"
    log_info "  - Rust: cargo install <tool>"
}

# ============================================================================
# STARTUP SCRIPTS GENERATION
# ============================================================================

create_startup_scripts() {
    log_step "Creating Startup Scripts"
    
    # Create start-server.sh with production support
    cat > "$SCRIPT_DIR/start-server.sh" << 'EOFSERVER'
#!/bin/bash
# HexStrike AI - Start Server Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/hexstrike-env"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Activate virtual environment
if [ -f "$VENV_DIR/bin/activate" ]; then
    source "$VENV_DIR/bin/activate"
else
    echo -e "${RED}Error: Virtual environment not found. Run install.sh first.${NC}"
    exit 1
fi

# Use the virtual environment's python
PYTHON_CMD="$VENV_DIR/bin/python"

# Parse arguments
PORT="8889"
HOST="127.0.0.1"
DEBUG=""
PRODUCTION=false
# Automatic port fallback is now the default in hexstrike_server.py
# Use --no-auto-port to disable it
NO_AUTO_PORT=""

for arg in "$@"; do
    case $arg in
        --debug)
            DEBUG="--debug"
            ;;
        --port=*)
            PORT="${arg#*=}"
            ;;
        --host=*)
            HOST="${arg#*=}"
            ;;
        --production)
            PRODUCTION=true
            ;;
        --no-auto-port)
            NO_AUTO_PORT="--no-auto-port"  # Disable automatic port fallback
            ;;
        --auto-port)
            # Kept for backward compatibility - now a no-op since auto-port is the default
            ;;
    esac
done

# Warn if binding to 0.0.0.0
if [ "$HOST" = "0.0.0.0" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Server will be exposed publicly on all interfaces!${NC}"
    echo -e "${YELLOW}   Consider using --host=127.0.0.1 for local-only access.${NC}"
    echo ""
fi

if [ "$PRODUCTION" = true ]; then
    echo "🚀 Starting HexStrike AI Server in PRODUCTION mode on $HOST:$PORT..."
    
    # Check if gunicorn is available
    if ! "$PYTHON_CMD" -c "import gunicorn" &> /dev/null; then
        echo -e "${YELLOW}gunicorn not found, using built-in server${NC}"
        "$PYTHON_CMD" "$SCRIPT_DIR/hexstrike_server.py" --host "$HOST" --port "$PORT" $NO_AUTO_PORT
    else
        # Use gunicorn for production
        exec "$VENV_DIR/bin/gunicorn" \
            --bind "$HOST:$PORT" \
            --workers 4 \
            --timeout 300 \
            --access-logfile - \
            --error-logfile - \
            "hexstrike_server:app"
    fi
else
    echo "🚀 Starting HexStrike AI Server on $HOST:$PORT..."
    "$PYTHON_CMD" "$SCRIPT_DIR/hexstrike_server.py" --host "$HOST" --port "$PORT" $DEBUG $NO_AUTO_PORT
fi
EOFSERVER
    chmod +x "$SCRIPT_DIR/start-server.sh"
    log_success "Created start-server.sh"
    
    # Create start-frontend.sh with proper checks
    if [ -d "$FRONTEND_DIR" ]; then
        cat > "$SCRIPT_DIR/start-frontend.sh" << 'EOFFRONTEND'
#!/bin/bash
# HexStrike AI - Start Frontend Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo -e "${YELLOW}Install Node.js 18+ from: https://nodejs.org/${NC}"
    exit 1
fi

# Check node_modules exists
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${RED}Error: Frontend dependencies not installed.${NC}"
    echo -e "${YELLOW}Run: cd frontend && npm install${NC}"
    exit 1
fi

cd "$FRONTEND_DIR"
echo "🌐 Starting HexStrike AI Frontend on http://localhost:3000..."
npm run dev
EOFFRONTEND
        chmod +x "$SCRIPT_DIR/start-frontend.sh"
        log_success "Created start-frontend.sh"
    fi
    
    # Create improved start-all.sh with health checks and graceful shutdown
    cat > "$SCRIPT_DIR/start-all.sh" << 'EOFALL'
#!/bin/bash
# HexStrike AI - Start All Services Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Track PIDs
SERVER_PID=""
FRONTEND_PID=""

# Graceful shutdown handler
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    
    if [ -n "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
        wait $FRONTEND_PID 2>/dev/null
    fi
    
    if [ -n "$SERVER_PID" ] && kill -0 $SERVER_PID 2>/dev/null; then
        echo "Stopping backend server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null
        wait $SERVER_PID 2>/dev/null
    fi
    
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

# Set up trap for cleanup on SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Health check function - checks both requested port and actual port from file
check_server_health() {
    local host="${SERVER_HOST:-127.0.0.1}"
    local port="${SERVER_PORT:-8889}"
    # Increased to 15 attempts to allow time for server startup and port file write
    # when auto-port switching is needed
    local max_attempts=15
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        # First try the requested port
        if curl -s -o /dev/null -w "%{http_code}" "http://${host}:${port}/health" 2>/dev/null | grep -q "200"; then
            ACTUAL_SERVER_PORT="$port"
            return 0
        fi
        
        # Check if server wrote an actual port to file (in case of auto-port switch)
        if [ -f "$SCRIPT_DIR/.hexstrike_port" ]; then
            local actual_port=$(cat "$SCRIPT_DIR/.hexstrike_port" 2>/dev/null)
            if [ -n "$actual_port" ] && [ "$actual_port" != "$port" ]; then
                if curl -s -o /dev/null -w "%{http_code}" "http://${host}:${actual_port}/health" 2>/dev/null | grep -q "200"; then
                    ACTUAL_SERVER_PORT="$actual_port"
                    return 0
                fi
            fi
        fi
        
        sleep 1
        attempt=$((attempt + 1))
    done
    return 1
}

# Initialize actual port variable
ACTUAL_SERVER_PORT=""

# Frontend port
FRONTEND_PORT="3000"

# Parse arguments for custom host/port
SERVER_HOST="127.0.0.1"
SERVER_PORT="8889"
for arg in "$@"; do
    case $arg in
        --host=*)
            SERVER_HOST="${arg#*=}"
            ;;
        --port=*)
            SERVER_PORT="${arg#*=}"
            ;;
    esac
done

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           🚀 Starting HexStrike AI - All Services             ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if frontend can be started
FRONTEND_AVAILABLE=false
FRONTEND_SKIP_REASON=""
if [ -f "$SCRIPT_DIR/start-frontend.sh" ]; then
    # Check Node.js
    if command -v node &> /dev/null; then
        # Check node_modules
        if [ -d "$SCRIPT_DIR/frontend/node_modules" ]; then
            FRONTEND_AVAILABLE=true
        else
            echo -e "${YELLOW}⚠️  Frontend dependencies not installed. Skipping frontend.${NC}"
            echo -e "${YELLOW}   To install: cd frontend && npm install${NC}"
            FRONTEND_SKIP_REASON="dependencies"
        fi
    else
        echo -e "${YELLOW}⚠️  Node.js not found. Skipping frontend.${NC}"
        echo -e "${YELLOW}   Install Node.js 18+ from: https://nodejs.org/${NC}"
        FRONTEND_SKIP_REASON="nodejs"
    fi
else
    FRONTEND_SKIP_REASON="no-script"
fi

# Start server in background (pass along host/port if specified)
echo -e "${CYAN}📡 Starting backend server on ${SERVER_HOST}:${SERVER_PORT}...${NC}"
"$SCRIPT_DIR/start-server.sh" --host="$SERVER_HOST" --port="$SERVER_PORT" &
SERVER_PID=$!

# Health check for server
echo -n "   Waiting for server to be ready"
if check_server_health; then
    echo ""
    # Use actual port if different from requested (in case of auto-port switch)
    if [ -n "$ACTUAL_SERVER_PORT" ] && [ "$ACTUAL_SERVER_PORT" != "$SERVER_PORT" ]; then
        echo -e "${GREEN}✅ Backend server running on http://${SERVER_HOST}:${ACTUAL_SERVER_PORT}${NC}"
        echo -e "${YELLOW}   (Note: Requested port ${SERVER_PORT} was in use, using ${ACTUAL_SERVER_PORT})${NC}"
        SERVER_PORT="$ACTUAL_SERVER_PORT"
    else
        echo -e "${GREEN}✅ Backend server running on http://${SERVER_HOST}:${SERVER_PORT}${NC}"
    fi
else
    echo ""
    echo -e "${RED}❌ Backend server failed to start or is not responding${NC}"
    cleanup
fi

# Start frontend if available
FRONTEND_STARTED=false
if [ "$FRONTEND_AVAILABLE" = true ]; then
    echo ""
    echo -e "${CYAN}🌐 Starting frontend...${NC}"
    "$SCRIPT_DIR/start-frontend.sh" &
    FRONTEND_PID=$!
    
    # Wait for frontend to initialize and check if it's actually running
    # We check multiple times to catch early failures
    sleep 2
    
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        # Process is still running after 2 seconds, wait a bit more
        sleep 2
        
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            # Check if frontend is responding
            if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${FRONTEND_PORT}" 2>/dev/null | grep -qE "^[23]"; then
                echo -e "${GREEN}✅ Frontend running on http://localhost:${FRONTEND_PORT}${NC}"
                FRONTEND_STARTED=true
            else
                # Process running but not responding yet - give it more time
                sleep 3
                if kill -0 $FRONTEND_PID 2>/dev/null; then
                    echo -e "${GREEN}✅ Frontend running on http://localhost:${FRONTEND_PORT}${NC}"
                    FRONTEND_STARTED=true
                else
                    echo -e "${YELLOW}⚠️  Frontend process exited unexpectedly${NC}"
                    FRONTEND_PID=""
                fi
            fi
        else
            echo -e "${YELLOW}⚠️  Frontend failed to start, continuing with backend only${NC}"
            FRONTEND_PID=""
        fi
    else
        echo -e "${YELLOW}⚠️  Frontend failed to start, continuing with backend only${NC}"
        FRONTEND_PID=""
    fi
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  HexStrike AI is running!${NC}"
echo ""
echo -e "  ${CYAN}📡 Backend API:${NC}    http://${SERVER_HOST}:${SERVER_PORT}"
if [ "$FRONTEND_STARTED" = true ] && [ -n "$FRONTEND_PID" ]; then
    echo -e "  ${CYAN}🌐 Frontend:${NC}       http://localhost:${FRONTEND_PORT}"
elif [ -n "$FRONTEND_SKIP_REASON" ]; then
    case "$FRONTEND_SKIP_REASON" in
        nodejs)
            echo -e "  ${YELLOW}🌐 Frontend:${NC}       Unavailable (Node.js not installed)"
            ;;
        dependencies)
            echo -e "  ${YELLOW}🌐 Frontend:${NC}       Unavailable (run: cd frontend && npm install)"
            ;;
        *)
            echo -e "  ${YELLOW}🌐 Frontend:${NC}       Unavailable"
            ;;
    esac
fi
echo ""
echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop all services"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"

# Wait for processes
wait
EOFALL
    chmod +x "$SCRIPT_DIR/start-all.sh"
    log_success "Created start-all.sh (with health checks and graceful shutdown)"
    
    # Generate MCP configuration
    cat > "$SCRIPT_DIR/hexstrike-mcp-config.json" << EOFMCP
{
  "mcpServers": {
    "hexstrike-ai": {
      "command": "$VENV_DIR/bin/python",
      "args": [
        "$SCRIPT_DIR/hexstrike_mcp.py",
        "--server",
        "http://127.0.0.1:8889"
      ],
      "description": "HexStrike AI v6.0 - Advanced Cybersecurity Automation Platform",
      "timeout": 300,
      "alwaysAllow": []
    }
  }
}
EOFMCP
    log_success "Created hexstrike-mcp-config.json (MCP client configuration)"
}

# ============================================================================
# SYSTEMD SERVICE GENERATION
# ============================================================================

generate_systemd_service() {
    if [ "$GENERATE_SYSTEMD" != true ]; then
        return
    fi
    
    log_step "Generating systemd Service File"
    
    local service_file="$SCRIPT_DIR/hexstrike-ai.service"
    local user=$(whoami)
    
    cat > "$service_file" << EOFSYSTEMD
[Unit]
Description=HexStrike AI - Cybersecurity Automation Platform
After=network.target

[Service]
Type=simple
User=$user
WorkingDirectory=$SCRIPT_DIR
Environment=PATH=$VENV_DIR/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=$VENV_DIR/bin/gunicorn --bind 127.0.0.1:8889 --workers 4 --timeout 300 hexstrike_server:app
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOFSYSTEMD
    
    log_success "Created hexstrike-ai.service"
    echo ""
    log_info "To install the systemd service, run:"
    echo -e "  ${YELLOW}sudo cp $service_file /etc/systemd/system/${NC}"
    echo -e "  ${YELLOW}sudo systemctl daemon-reload${NC}"
    echo -e "  ${YELLOW}sudo systemctl enable hexstrike-ai${NC}"
    echo -e "  ${YELLOW}sudo systemctl start hexstrike-ai${NC}"
}

# ============================================================================
# PRINT SUMMARY
# ============================================================================

print_summary() {
    echo -e "\n${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                           ║"
    echo "║              ✅  INSTALLATION COMPLETED SUCCESSFULLY!  ✅                 ║"
    echo "║                                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${BOLD}Quick Start Guide:${NC}"
    echo ""
    echo -e "  ${CYAN}1.${NC} Start the HexStrike AI server:"
    echo -e "     ${YELLOW}./start-server.sh${NC}"
    if [ "$PRODUCTION_MODE" = true ]; then
        echo -e "     ${YELLOW}./start-server.sh --production${NC}  (gunicorn)"
    fi
    echo ""
    
    if [ -f "$SCRIPT_DIR/start-frontend.sh" ] && [ "$FRONTEND_INSTALLED" = true ]; then
        echo -e "  ${CYAN}2.${NC} Start the frontend:"
        echo -e "     ${YELLOW}./start-frontend.sh${NC}"
        echo ""
        echo -e "  ${CYAN}3.${NC} Or start everything at once:"
    else
        echo -e "  ${CYAN}2.${NC} Or start with:"
    fi
    echo -e "     ${YELLOW}./start-all.sh${NC}"
    echo ""
    
    echo -e "${BOLD}Server Options:${NC}"
    echo -e "  ${YELLOW}./start-server.sh --debug${NC}              # Debug mode"
    echo -e "  ${YELLOW}./start-server.sh --port=9999${NC}          # Custom port"
    echo -e "  ${YELLOW}./start-server.sh --host=0.0.0.0${NC}       # Expose publicly (⚠️ use with caution)"
    if [ "$PRODUCTION_MODE" = true ]; then
        echo -e "  ${YELLOW}./start-server.sh --production${NC}         # Production mode (gunicorn)"
    fi
    echo ""
    
    echo -e "${BOLD}MCP Client Configuration:${NC}"
    echo -e "  Copy the content of ${YELLOW}hexstrike-mcp-config.json${NC} to your MCP client config."
    echo ""
    
    if [ "$WITH_OFFENSIVE_TOOLS" = true ]; then
        echo -e "${BOLD}Offensive Tools:${NC}"
        echo -e "  Binary exploitation tools (pwntools, angr) are installed."
        echo ""
    fi
    
    echo -e "${BOLD}Documentation:${NC}"
    echo -e "  📖 README.md          - Full documentation"
    echo -e "  📖 FRONTEND_SETUP.md  - Frontend setup guide"
    echo ""
    echo -e "${RED}${BOLD}Happy Hacking! 🔥${NC}"
    echo ""
}

# ============================================================================
# ARGUMENT PARSING
# ============================================================================

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --auto-install-system-deps)
                # Kept for backward compatibility (this is now the default)
                AUTO_INSTALL_SYSTEM_DEPS=true
                shift
                ;;
            --skip-security-tools)
                SKIP_SECURITY_TOOLS=true
                shift
                ;;
            --with-offensive-tools)
                WITH_OFFENSIVE_TOOLS=true
                shift
                ;;
            --production)
                PRODUCTION_MODE=true
                shift
                ;;
            --recreate-venv)
                RECREATE_VENV=true
                shift
                ;;
            --skip-frontend)
                SKIP_FRONTEND=true
                shift
                ;;
            --skip-tool-check)
                SKIP_TOOL_CHECK=true
                shift
                ;;
            --generate-systemd)
                GENERATE_SYSTEMD=true
                PRODUCTION_MODE=true  # systemd implies production
                shift
                ;;
            -h|--help)
                print_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                print_usage
                exit 1
                ;;
        esac
    done
}

# ============================================================================
# MAIN INSTALLATION PROCESS
# ============================================================================

main() {
    # Parse command line arguments first
    parse_arguments "$@"
    
    # Show banner
    print_banner
    
    # Show current mode
    log_info "Installation mode: $([ "$PRODUCTION_MODE" = true ] && echo "Production" || echo "Development")"
    [ "$WITH_OFFENSIVE_TOOLS" = true ] && log_info "Including offensive tooling (pwntools, angr)"
    [ "$SKIP_FRONTEND" = true ] && log_info "Frontend installation will be skipped"
    [ "$SKIP_SECURITY_TOOLS" = true ] && log_info "Security tools installation will be skipped"
    [ "$AUTO_INSTALL_SYSTEM_DEPS" = true ] && [ "$SKIP_SECURITY_TOOLS" = false ] && log_info "Security tools will be auto-installed"
    echo ""
    
    # Step 1: Detect OS
    log_step "Step 1/7: Detecting Operating System"
    detect_os
    
    # Step 2: Check system dependencies
    log_step "Step 2/7: Checking System Dependencies"
    check_system_dependencies
    check_frontend_prerequisites
    
    # Step 3: Setup venv
    log_step "Step 3/7: Setting Up Python Virtual Environment"
    setup_venv
    
    # Step 4: Install Python dependencies
    log_step "Step 4/7: Installing Python Dependencies"
    install_python_dependencies
    
    # Step 5: Install frontend (if applicable)
    log_step "Step 5/7: Installing Frontend Dependencies"
    install_frontend_dependencies
    
    # Step 6: Check security tools
    log_step "Step 6/7: Checking Security Tools"
    check_security_tools
    
    # Step 7: Create startup scripts
    log_step "Step 7/7: Creating Startup Scripts"
    create_startup_scripts
    
    # Optional: Generate systemd service
    generate_systemd_service
    
    # Deactivate virtual environment
    deactivate 2>/dev/null || true
    
    # Print summary
    print_summary
}

# Run main function with all arguments
main "$@"
