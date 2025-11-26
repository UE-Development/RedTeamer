#!/usr/bin/env python3
"""
Mock Backend Server for HexStrike AI Frontend Development
Provides basic API endpoints for testing frontend functionality
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend development

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    
    # Only enable debug mode if explicitly set via environment variable
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    
    print("""
╔══════════════════════════════════════════════════════════╗
║   Mock HexStrike AI Backend Server                      ║
║   Frontend Development Mode                              ║
╠══════════════════════════════════════════════════════════╣
║   Port: 8888                                             ║
║   CORS: Enabled                                          ║
║   Debug: {}                                       ║
║   Status: Ready for frontend development                 ║
╚══════════════════════════════════════════════════════════╝
    """.format('Enabled' if debug_mode else 'Disabled'))
    
    app.run(host="0.0.0.0", port=8888, debug=debug_mode)
