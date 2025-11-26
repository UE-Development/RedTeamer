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

# Functions
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
    echo "║            ${BOLD}HexStrike AI v6.0 - Auto Installer${NC}${RED}                            ║"
    echo "║                  AI-Powered Cybersecurity Platform                        ║"
    echo "║                                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
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

# Main installation process
main() {
    print_banner
    
    log_step "Step 1/6: Checking System Requirements"
    
    # Check for Python 3.8+
    log_info "Checking Python version..."
    PYTHON_CMD=""
    for cmd in python3 python python3.11 python3.10 python3.9 python3.8; do
        if PYTHON_CMD=$(check_python_version "$cmd"); then
            log_success "Found compatible Python: $PYTHON_CMD ($(${PYTHON_CMD} --version))"
            break
        fi
    done
    
    if [ -z "$PYTHON_CMD" ]; then
        log_error "Python 3.8 or higher is required but not found!"
        log_info "Please install Python 3.8+ and try again."
        exit 1
    fi
    
    # Check for pip
    log_info "Checking pip..."
    if ! $PYTHON_CMD -m pip --version &> /dev/null; then
        log_warning "pip not found, attempting to install..."
        $PYTHON_CMD -m ensurepip --upgrade || {
            log_error "Failed to install pip. Please install pip manually."
            exit 1
        }
    fi
    log_success "pip is available"
    
    # Check for Node.js and npm (optional for frontend)
    log_info "Checking Node.js and npm..."
    NODE_AVAILABLE=false
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        NODE_VERSION=$(node --version)
        NPM_VERSION=$(npm --version)
        log_success "Node.js $NODE_VERSION and npm $NPM_VERSION found"
        NODE_AVAILABLE=true
    else
        log_warning "Node.js/npm not found. Frontend will not be installed."
        log_info "Install Node.js 18+ for the web frontend: https://nodejs.org/"
    fi
    
    log_step "Step 2/6: Creating Python Virtual Environment"
    
    if [ -d "$VENV_DIR" ]; then
        log_warning "Virtual environment already exists at $VENV_DIR"
        read -p "Do you want to recreate it? (y/N): " recreate
        if [[ "$recreate" =~ ^[Yy]$ ]]; then
            log_info "Removing existing virtual environment..."
            rm -rf "$VENV_DIR"
        else
            log_info "Using existing virtual environment"
        fi
    fi
    
    if [ ! -d "$VENV_DIR" ]; then
        log_info "Creating virtual environment..."
        $PYTHON_CMD -m venv "$VENV_DIR"
        log_success "Virtual environment created at $VENV_DIR"
    fi
    
    # Activate virtual environment
    log_info "Activating virtual environment..."
    source "$VENV_DIR/bin/activate"
    log_success "Virtual environment activated"
    
    log_step "Step 3/6: Installing Python Dependencies"
    
    log_info "Upgrading pip..."
    pip install --upgrade pip --quiet
    
    log_info "Installing dependencies from requirements.txt..."
    pip install -r "$SCRIPT_DIR/requirements.txt" --quiet
    log_success "Python dependencies installed successfully"
    
    log_step "Step 4/6: Installing Frontend Dependencies (Optional)"
    
    if [ "$NODE_AVAILABLE" = true ] && [ -d "$FRONTEND_DIR" ]; then
        log_info "Installing frontend dependencies..."
        cd "$FRONTEND_DIR"
        npm install --silent 2>/dev/null || {
            log_warning "Frontend dependency installation failed. You can try manually later."
        }
        cd "$SCRIPT_DIR"
        log_success "Frontend dependencies installed"
    else
        log_info "Skipping frontend installation (Node.js not available or frontend directory missing)"
    fi
    
    log_step "Step 5/6: Checking Security Tools Availability"
    
    log_info "Checking for installed security tools..."
    echo ""
    
    # Essential tools
    echo -e "${BOLD}Essential Network Tools:${NC}"
    check_command nmap || true
    check_command masscan || true
    check_command rustscan || true
    
    echo ""
    echo -e "${BOLD}Web Application Tools:${NC}"
    check_command gobuster || true
    check_command feroxbuster || true
    check_command ffuf || true
    check_command nikto || true
    check_command nuclei || true
    check_command sqlmap || true
    
    echo ""
    echo -e "${BOLD}Password & Authentication Tools:${NC}"
    check_command hydra || true
    check_command john || true
    check_command hashcat || true
    
    echo ""
    echo -e "${BOLD}Subdomain & OSINT Tools:${NC}"
    check_command amass || true
    check_command subfinder || true
    
    echo ""
    echo -e "${BOLD}SMB & Network Enumeration:${NC}"
    check_command enum4linux || true
    check_command smbmap || true
    check_command netexec || true
    
    echo ""
    log_warning "Note: Missing tools can be installed from your distribution's package manager"
    log_info "On Kali Linux, most tools are pre-installed"
    log_info "On Ubuntu/Debian: sudo apt install <tool-name>"
    
    log_step "Step 6/6: Creating Startup Scripts"
    
    # Create start-server.sh
    cat > "$SCRIPT_DIR/start-server.sh" << 'EOF'
#!/bin/bash
# HexStrike AI - Start Server Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/hexstrike-env"

# Activate virtual environment
if [ -f "$VENV_DIR/bin/activate" ]; then
    source "$VENV_DIR/bin/activate"
else
    echo "Error: Virtual environment not found. Run install.sh first."
    exit 1
fi

# Parse arguments
PORT="${1:-8888}"
DEBUG=""

for arg in "$@"; do
    case $arg in
        --debug)
            DEBUG="--debug"
            ;;
        --port=*)
            PORT="${arg#*=}"
            ;;
    esac
done

echo "🚀 Starting HexStrike AI Server on port $PORT..."
python3 "$SCRIPT_DIR/hexstrike_server.py" --port "$PORT" $DEBUG
EOF
    chmod +x "$SCRIPT_DIR/start-server.sh"
    log_success "Created start-server.sh"
    
    # Create start-frontend.sh
    if [ -d "$FRONTEND_DIR" ]; then
        cat > "$SCRIPT_DIR/start-frontend.sh" << 'EOF'
#!/bin/bash
# HexStrike AI - Start Frontend Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "Error: Frontend dependencies not installed. Run install.sh first."
    exit 1
fi

cd "$FRONTEND_DIR"
echo "🌐 Starting HexStrike AI Frontend on http://localhost:3000..."
npm run dev
EOF
        chmod +x "$SCRIPT_DIR/start-frontend.sh"
        log_success "Created start-frontend.sh"
    fi
    
    # Create start-all.sh
    cat > "$SCRIPT_DIR/start-all.sh" << 'EOF'
#!/bin/bash
# HexStrike AI - Start All Services Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting HexStrike AI - All Services"
echo ""

# Start server in background
echo "📡 Starting backend server..."
"$SCRIPT_DIR/start-server.sh" &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Backend server failed to start"
    exit 1
fi

echo "✅ Backend server running on http://localhost:8888"

# Start frontend if available
if [ -f "$SCRIPT_DIR/start-frontend.sh" ]; then
    echo ""
    echo "🌐 Starting frontend..."
    "$SCRIPT_DIR/start-frontend.sh" &
    FRONTEND_PID=$!
    
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  HexStrike AI is running!"
    echo ""
    echo "  📡 Backend API:    http://localhost:8888"
    echo "  🌐 Frontend:       http://localhost:3000"
    echo ""
    echo "  Press Ctrl+C to stop all services"
    echo "═══════════════════════════════════════════════════════════"
else
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  HexStrike AI Server is running!"
    echo ""
    echo "  📡 Backend API:    http://localhost:8888"
    echo ""
    echo "  Press Ctrl+C to stop the server"
    echo "═══════════════════════════════════════════════════════════"
fi

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping services...'; kill $SERVER_PID 2>/dev/null; [ -n \"$FRONTEND_PID\" ] && kill $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
EOF
    chmod +x "$SCRIPT_DIR/start-all.sh"
    log_success "Created start-all.sh"
    
    # Generate MCP configuration
    cat > "$SCRIPT_DIR/hexstrike-mcp-config.json" << EOF
{
  "mcpServers": {
    "hexstrike-ai": {
      "command": "$VENV_DIR/bin/python3",
      "args": [
        "$SCRIPT_DIR/hexstrike_mcp.py",
        "--server",
        "http://127.0.0.1:8888"
      ],
      "description": "HexStrike AI v6.0 - Advanced Cybersecurity Automation Platform",
      "timeout": 300,
      "alwaysAllow": []
    }
  }
}
EOF
    log_success "Created hexstrike-mcp-config.json (MCP client configuration)"
    
    # Deactivate virtual environment
    deactivate
    
    # Print summary
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
    echo ""
    echo -e "  ${CYAN}2.${NC} Start the frontend (optional):"
    echo -e "     ${YELLOW}./start-frontend.sh${NC}"
    echo ""
    echo -e "  ${CYAN}3.${NC} Or start everything at once:"
    echo -e "     ${YELLOW}./start-all.sh${NC}"
    echo ""
    echo -e "${BOLD}MCP Client Configuration:${NC}"
    echo -e "  Copy the content of ${YELLOW}hexstrike-mcp-config.json${NC} to your MCP client config."
    echo ""
    echo -e "${BOLD}Documentation:${NC}"
    echo -e "  📖 README.md          - Full documentation"
    echo -e "  📖 FRONTEND_SETUP.md  - Frontend setup guide"
    echo ""
    echo -e "${RED}${BOLD}Happy Hacking! 🔥${NC}"
    echo ""
}

# Run main function
main "$@"
