#!/usr/bin/env python3
"""
Mock Backend Server for HexStrike AI Frontend Development
Provides basic API endpoints for testing frontend functionality
"""

import argparse
import socket
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
from datetime import datetime
from typing import Optional

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend development

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Default API configuration
DEFAULT_PORT = 8889
DEFAULT_HOST = "0.0.0.0"


def is_port_available(port: int, host: str = "0.0.0.0") -> bool:
    """Check if a port is available for binding"""
    try:
        test_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        test_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        test_socket.bind((host, port))
        test_socket.close()
        return True
    except OSError:
        return False


def find_available_port(start_port: int, max_attempts: int = 10, host: str = "0.0.0.0") -> int:
    """Find an available port starting from start_port"""
    for offset in range(max_attempts):
        port = start_port + offset
        if is_port_available(port, host):
            return port
    return -1


def get_process_using_port(port: int) -> Optional[str]:
    """Try to identify what process is using a port"""
    try:
        import psutil
        for conn in psutil.net_connections(kind='inet'):
            # Check if laddr exists and has the port we're looking for
            if conn.laddr and hasattr(conn.laddr, 'port') and conn.laddr.port == port:
                if conn.pid:
                    try:
                        process = psutil.Process(conn.pid)
                        return f"{process.name()} (PID: {conn.pid})"
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        return f"PID: {conn.pid}"
    except ImportError:
        # psutil not available
        pass
    except PermissionError:
        # Permission denied to access network connections
        pass
    except Exception:
        # Handle any psutil.AccessDenied or other psutil exceptions
        pass
    return None

# Mock data
MOCK_AGENTS = [
    {
        "id": "1",
        "name": "BugBounty Agent",
        "type": "bugbounty",
        "status": "active",
        "capabilities": ["Vulnerability scanning", "Subdomain enumeration"],
        "lastActive": datetime.now().isoformat(),
        "description": "Bug bounty hunting automation"
    },
    {
        "id": "2",
        "name": "CTF Solver",
        "type": "ctf",
        "status": "standby",
        "capabilities": ["Challenge solving", "Crypto analysis"],
        "lastActive": datetime.now().isoformat(),
        "description": "CTF competition assistance"
    }
]

MOCK_TOOLS = [
    {
        "id": "1",
        "name": "Nmap",
        "category": "network",
        "version": "7.94",
        "description": "Advanced port scanner",
        "installed": True,
        "usageCount": 245
    },
    {
        "id": "2",
        "name": "Nuclei",
        "category": "web",
        "version": "3.0.0",
        "description": "Vulnerability scanner",
        "installed": True,
        "usageCount": 189
    }
]

MOCK_SCANS = [
    {
        "id": "1",
        "target": "example.com",
        "type": "Comprehensive",
        "status": "running",
        "progress": 78,
        "currentPhase": "Phase 2: Scanning",
        "vulnerabilitiesFound": 3,
        "toolsUsed": ["Nmap", "Amass", "Nuclei"]
    }
]

MOCK_VULNERABILITIES = [
    {
        "id": "1",
        "title": "SQL Injection",
        "description": "Authentication bypass via SQL injection",
        "severity": "critical",
        "cvssScore": 9.8,
        "location": "example.com/admin/login.php",
        "discoveredBy": "BugBounty Agent",
        "discoveredAt": datetime.now().isoformat(),
        "status": "new"
    }
]

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "version": "6.0.0",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/agents/list', methods=['GET'])
def list_agents():
    """List all AI agents"""
    return jsonify({"agents": MOCK_AGENTS, "count": len(MOCK_AGENTS)})

@app.route('/api/agents/<agent_id>/activate', methods=['POST'])
def activate_agent(agent_id):
    """Activate an agent"""
    for agent in MOCK_AGENTS:
        if agent['id'] == agent_id:
            agent['status'] = 'active'
            return jsonify({"success": True, "agent": agent})
    return jsonify({"success": False, "error": "Agent not found"}), 404

@app.route('/api/agents/<agent_id>/message', methods=['POST'])
def send_message(agent_id):
    """Send message to agent"""
    data = request.json
    message = data.get('message', '')
    
    response = {
        "id": f"msg-{datetime.now().timestamp()}",
        "agentId": agent_id,
        "agentName": "BugBounty Agent",
        "content": f"Received: {message}. Processing your request...",
        "timestamp": datetime.now().isoformat(),
        "isUser": False
    }
    
    return jsonify({"success": True, "response": response})

@app.route('/api/tools/list', methods=['GET'])
def list_tools():
    """List all security tools"""
    return jsonify({"tools": MOCK_TOOLS, "count": len(MOCK_TOOLS)})

@app.route('/api/tools/<tool_id>/execute', methods=['POST'])
def execute_tool(tool_id):
    """Execute a security tool"""
    data = request.json
    return jsonify({
        "success": True,
        "executionId": f"exec-{datetime.now().timestamp()}",
        "status": "started"
    })

@app.route('/api/scans/list', methods=['GET'])
def list_scans():
    """List all scans"""
    return jsonify({"scans": MOCK_SCANS, "count": len(MOCK_SCANS)})

@app.route('/api/scans/create', methods=['POST'])
def create_scan():
    """Create a new scan"""
    data = request.json
    new_scan = {
        "id": f"scan-{datetime.now().timestamp()}",
        "target": data.get('target', 'unknown'),
        "type": data.get('type', 'Standard'),
        "status": "queued",
        "progress": 0,
        "currentPhase": "Initializing",
        "vulnerabilitiesFound": 0,
        "toolsUsed": []
    }
    MOCK_SCANS.append(new_scan)
    return jsonify({"success": True, "scan": new_scan})

@app.route('/api/vulnerabilities/list', methods=['GET'])
def list_vulnerabilities():
    """List all vulnerabilities"""
    return jsonify({"vulnerabilities": MOCK_VULNERABILITIES, "count": len(MOCK_VULNERABILITIES)})

@app.route('/api/dashboard/metrics', methods=['GET'])
def dashboard_metrics():
    """Get dashboard metrics"""
    return jsonify({
        "activeScans": 3,
        "toolsUsed": 45,
        "vulnerabilitiesFound": 12,
        "projectsActive": 5,
        "agentsOnline": 8
    })

if __name__ == "__main__":
    import os
    
    parser = argparse.ArgumentParser(description="Run the Mock HexStrike AI Backend Server")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"Port for the API server (default: {DEFAULT_PORT})")
    parser.add_argument("--host", type=str, default=DEFAULT_HOST, help=f"Host to bind the server to (default: {DEFAULT_HOST})")
    parser.add_argument("--no-auto-port", action="store_true", help="Disable automatic port selection when the specified port is in use")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    args = parser.parse_args()
    
    # Debug mode can also be set via environment variable
    debug_mode = args.debug or os.environ.get('FLASK_DEBUG', '0') == '1'
    
    api_port = args.port
    server_host = args.host
    
    # Automatic port fallback is enabled by default
    auto_port_enabled = not args.no_auto_port
    
    # Check if the requested port is available
    original_port = api_port
    if not is_port_available(api_port, server_host):
        process_info = get_process_using_port(api_port)
        if process_info:
            logger.warning(f"⚠️  Port {api_port} is in use by: {process_info}")
        else:
            logger.warning(f"⚠️  Port {api_port} is already in use")
        
        if auto_port_enabled:
            # Automatically find an available port (default behavior)
            new_port = find_available_port(api_port + 1, host=server_host)
            if new_port > 0:
                logger.info(f"🔄 Auto-switching to available port: {new_port}")
                api_port = new_port
            else:
                logger.error(f"❌ Could not find an available port after checking ports {api_port + 1} to {api_port + 11}")
                logger.error("   Please free up a port or specify a different port with --port")
                sys.exit(1)
        else:
            logger.error(f"❌ Port {api_port} is already in use!")
            logger.error("")
            logger.error("   To fix this issue, you can:")
            logger.error(f"   1. Kill the process using port {api_port}")
            logger.error(f"   2. Use a different port: python mock_backend.py --port=9000")
            logger.error(f"   3. Remove --no-auto-port to enable automatic port selection")
            logger.error("")
            sys.exit(1)
    
    port_note = ""
    if original_port != api_port:
        port_note = f"\n║   Note: Requested port {original_port} was in use           ║"
    
    # Use consistent field widths that accommodate typical values
    field_width = 48
    host_display = str(server_host)[:field_width]
    port_display = str(api_port)
    debug_display = 'Enabled' if debug_mode else 'Disabled'
    auto_port_display = 'Enabled' if auto_port_enabled else 'Disabled'
    
    print(f"""
╔══════════════════════════════════════════════════════════╗
║   Mock HexStrike AI Backend Server                      ║
║   Frontend Development Mode                              ║
╠══════════════════════════════════════════════════════════╣
║   Host: {host_display:<{field_width}} ║
║   Port: {port_display:<{field_width}} ║
║   CORS: Enabled                                          ║
║   Debug: {debug_display:<{field_width - 1}} ║
║   Auto-Port: {auto_port_display:<{field_width - 5}} ║{port_note}
║   Status: Ready for frontend development                 ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    app.run(host=server_host, port=api_port, debug=debug_mode)
