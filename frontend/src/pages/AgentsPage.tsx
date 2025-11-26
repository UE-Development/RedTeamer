/**
 * AI Agents Page
 * Main interface for interacting with HexStrike AI agents
 */

import { useEffect, useCallback, useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatIcon from '@mui/icons-material/Chat';
import HistoryIcon from '@mui/icons-material/History';
import SpeedIcon from '@mui/icons-material/Speed';
import { useAppSelector, useAppDispatch } from '../store';
import {
  setAgents,
  setSelectedAgent,
  addMessage,
  updateAgent,
  setLoading,
  clearMessages,
} from '../store/slices/agentsSlice';
import {
  AgentSelectorPanel,
  AgentChatInterface,
  ConversationHistory,
  AgentPerformanceMetrics,
} from '../components/agents';
import type { Agent, AgentMessage } from '../types';

// Mock agents data based on FEATURES.md
const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'BugBounty Agent',
    type: 'bugbounty',
    status: 'active',
    capabilities: ['Vulnerability scanning', 'Subdomain enumeration', 'Port scanning', 'Web testing'],
    lastActive: new Date().toISOString(),
    description: 'Comprehensive bug bounty hunting automation',
  },
  {
    id: '2',
    name: 'CTF Solver',
    type: 'ctf',
    status: 'standby',
    capabilities: ['Challenge solving', 'Crypto analysis', 'Reverse engineering', 'Forensics'],
    lastActive: new Date().toISOString(),
    description: 'CTF competition assistance and challenge solving',
  },
  {
    id: '3',
    name: 'CVE Intelligence',
    type: 'cve_intelligence',
    status: 'standby',
    capabilities: ['CVE lookup', 'Exploit research', 'Vulnerability tracking', 'Threat intelligence'],
    lastActive: new Date().toISOString(),
    description: 'CVE database research and vulnerability intelligence',
  },
  {
    id: '4',
    name: 'Exploit Generator',
    type: 'exploit_generator',
    status: 'standby',
    capabilities: ['PoC generation', 'Payload crafting', 'Exploit development'],
    lastActive: new Date().toISOString(),
    description: 'Automated exploit and PoC generation',
  },
  {
    id: '5',
    name: 'Web Security Agent',
    type: 'web_security',
    status: 'active',
    capabilities: ['XSS detection', 'SQL injection', 'CSRF testing', 'API security'],
    lastActive: new Date().toISOString(),
    description: 'Web application security testing and analysis',
  },
  {
    id: '6',
    name: 'Auth Testing Agent',
    type: 'auth_testing',
    status: 'standby',
    capabilities: ['Authentication bypass', 'Session management', 'Privilege escalation'],
    lastActive: new Date().toISOString(),
    description: 'Authentication and authorization testing',
  },
  {
    id: '7',
    name: 'Mobile Security',
    type: 'mobile_security',
    status: 'standby',
    capabilities: ['Android security', 'iOS security', 'Mobile app analysis'],
    lastActive: new Date().toISOString(),
    description: 'Mobile application security assessment',
  },
  {
    id: '8',
    name: 'Cloud Security',
    type: 'cloud_security',
    status: 'standby',
    capabilities: ['AWS security', 'Azure security', 'GCP security', 'Cloud misconfiguration'],
    lastActive: new Date().toISOString(),
    description: 'Cloud infrastructure security assessment',
  },
  {
    id: '9',
    name: 'Binary Analysis',
    type: 'binary_analysis',
    status: 'standby',
    capabilities: ['Disassembly', 'Decompilation', 'Malware analysis', 'Binary exploitation'],
    lastActive: new Date().toISOString(),
    description: 'Binary and malware analysis',
  },
  {
    id: '10',
    name: 'OSINT Agent',
    type: 'osint',
    status: 'standby',
    capabilities: ['Social engineering', 'Data gathering', 'Reconnaissance', 'Digital footprinting'],
    lastActive: new Date().toISOString(),
    description: 'Open source intelligence gathering',
  },
  {
    id: '11',
    name: 'Network Recon',
    type: 'network_recon',
    status: 'active',
    capabilities: ['Port scanning', 'Service detection', 'Network mapping', 'Vulnerability scanning'],
    lastActive: new Date().toISOString(),
    description: 'Network reconnaissance and mapping',
  },
  {
    id: '12',
    name: 'Report Generator',
    type: 'report_generator',
    status: 'standby',
    capabilities: ['PDF reports', 'HTML reports', 'Executive summaries', 'Technical documentation'],
    lastActive: new Date().toISOString(),
    description: 'Automated security report generation',
  },
];

const AgentsPage = () => {
  const dispatch = useAppDispatch();
  const { agents, selectedAgent, messages, loading } = useAppSelector((state) => state.agents);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Initialize with mock agents
    dispatch(setAgents(mockAgents));
  }, [dispatch]);

  const handleSelectAgent = useCallback((agent: Agent) => {
    dispatch(setSelectedAgent(agent));
  }, [dispatch]);

  const handleToggleAgent = useCallback((agent: Agent) => {
    const newStatus: Agent['status'] = agent.status === 'active' || agent.status === 'busy' ? 'standby' : 'active';
    dispatch(updateAgent({ ...agent, status: newStatus }));
  }, [dispatch]);

  const handleSendMessage = useCallback((content: string) => {
    if (!selectedAgent) return;

    // Add user message
    const userMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      content,
      timestamp: new Date().toISOString(),
      isUser: true,
    };
    dispatch(addMessage(userMessage));
    dispatch(setLoading(true));

    // Simulate agent response after a delay
    setTimeout(() => {
      const agentResponse: AgentMessage = {
        id: `msg-${Date.now() + 1}`,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        content: generateMockResponse(content, selectedAgent),
        timestamp: new Date().toISOString(),
        isUser: false,
        metadata: {
          toolsUsed: getToolsForCommand(content),
          progress: 100,
          status: 'completed',
        },
      };
      dispatch(addMessage(agentResponse));
      dispatch(setLoading(false));
    }, 1500);
  }, [dispatch, selectedAgent]);

  const handleClearHistory = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Chat
        return (
          <AgentChatInterface
            messages={messages}
            selectedAgent={selectedAgent}
            onSendMessage={handleSendMessage}
            loading={loading}
          />
        );
      case 1: // History
        return (
          <ConversationHistory
            messages={messages}
            onClearHistory={handleClearHistory}
          />
        );
      case 2: // Metrics
        return <AgentPerformanceMetrics agent={selectedAgent} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        <SmartToyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        AI Agents
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
          gap: 2,
          height: 'calc(100% - 60px)',
        }}
      >
        {/* Agent Selector Panel */}
        <AgentSelectorPanel
          agents={agents}
          selectedAgent={selectedAgent}
          onSelectAgent={handleSelectAgent}
          onToggleAgent={handleToggleAgent}
        />

        {/* Main Content Area with Tabs */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Tabs */}
          <Paper sx={{ mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab
                icon={<ChatIcon />}
                label="Chat"
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
              <Tab
                icon={<HistoryIcon />}
                label="History"
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
              <Tab
                icon={<SpeedIcon />}
                label="Metrics"
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {renderTabContent()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Helper function to generate mock responses
function generateMockResponse(command: string, agent: Agent): string {
  const lowerCommand = command.toLowerCase();
  
  if (lowerCommand.includes('scan') || lowerCommand.includes('test')) {
    return `🎯 Initiating security assessment...

I'll analyze the target using multiple security tools:
├─ Running subdomain enumeration (Amass, Subfinder)
├─ Port scanning with Nmap
├─ Web application testing (Nuclei, Nikto)
└─ Vulnerability assessment

📊 Preliminary Results:
• Subdomains found: 23
• Open ports detected: 8
• Potential vulnerabilities: 3

The full assessment is in progress. I'll provide detailed findings once complete.

💡 Tip: You can ask me to focus on specific areas like "test for SQL injection" or "check XSS vulnerabilities" for deeper analysis.`;
  }
  
  if (lowerCommand.includes('cve') || lowerCommand.includes('vulnerability')) {
    return `🔍 CVE Intelligence Analysis

I've queried our CVE database and threat intelligence sources:

📋 Recent Critical CVEs:
• CVE-2024-1234 - Remote Code Execution (CVSS: 9.8)
• CVE-2024-5678 - SQL Injection (CVSS: 8.5)
• CVE-2024-9012 - Authentication Bypass (CVSS: 7.5)

🎯 Recommended Actions:
1. Patch affected systems immediately
2. Enable additional monitoring
3. Review access controls

Would you like me to provide detailed exploit information or remediation steps for any specific CVE?`;
  }
  
  if (lowerCommand.includes('report') || lowerCommand.includes('summary')) {
    return `📊 Security Report Generation

I'm preparing a comprehensive security report:

✅ Report Sections:
├─ Executive Summary
├─ Vulnerability Analysis
├─ Risk Assessment
├─ Technical Details
└─ Remediation Recommendations

📁 Available Formats:
• PDF (Executive)
• HTML (Interactive)
• JSON (Technical)
• Markdown (Documentation)

The report will be ready shortly. Would you like to customize any specific sections?`;
  }

  // Default response based on agent type
  return `✨ ${agent.name} Ready

I've received your request: "${command}"

🔄 Processing with my specialized capabilities:
${agent.capabilities.map((cap) => `  • ${cap}`).join('\n')}

I'm analyzing the request and will provide detailed results. This may involve:
1. Target reconnaissance
2. Security testing
3. Data analysis
4. Report generation

Feel free to ask follow-up questions or provide additional targets for analysis.`;
}

// Helper function to get tools based on command
function getToolsForCommand(command: string): string[] {
  const lowerCommand = command.toLowerCase();
  const tools: string[] = [];

  if (lowerCommand.includes('scan') || lowerCommand.includes('port')) {
    tools.push('Nmap', 'Rustscan');
  }
  if (lowerCommand.includes('web') || lowerCommand.includes('http')) {
    tools.push('Nuclei', 'Nikto');
  }
  if (lowerCommand.includes('subdomain') || lowerCommand.includes('domain')) {
    tools.push('Amass', 'Subfinder');
  }
  if (lowerCommand.includes('sql') || lowerCommand.includes('injection')) {
    tools.push('SQLMap');
  }
  if (lowerCommand.includes('xss')) {
    tools.push('XSSHunter', 'Dalfox');
  }
  if (lowerCommand.includes('cve') || lowerCommand.includes('vulnerability')) {
    tools.push('NVD API', 'CVE Search');
  }

  return tools.length > 0 ? tools : ['Analysis Engine'];
}

export default AgentsPage;
