/**
 * AI Agents Page
 * Main interface for interacting with HexStrike AI agents
 */

import { useEffect, useCallback, useState, useMemo } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatIcon from '@mui/icons-material/Chat';
import HistoryIcon from '@mui/icons-material/History';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupIcon from '@mui/icons-material/Group';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
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
  MultiAgentChat,
  AgentCollaborationView,
} from '../components/agents';
import type { CollaborationTask, CollaborationWorkflow } from '../components/agents';
import type { Agent, AgentMessage } from '../types';

// Tab indices for better maintainability
const TABS = {
  CHAT: 0,
  MULTI_AGENT: 1,
  COLLABORATION: 2,
  HISTORY: 3,
  METRICS: 4,
} as const;

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

// Mock collaboration workflow
const createMockWorkflow = (agents: Agent[]): CollaborationWorkflow => {
  const tasks: CollaborationTask[] = [
    {
      id: 'task-1',
      name: 'Network Reconnaissance',
      description: 'Scan target network for open ports and services',
      status: 'completed',
      progress: 100,
      assignedAgent: agents.find((a) => a.type === 'network_recon') || agents[0],
      dependencies: [],
      startTime: new Date(Date.now() - 30 * 60000).toISOString(),
      endTime: new Date(Date.now() - 20 * 60000).toISOString(),
    },
    {
      id: 'task-2',
      name: 'Web Application Scanning',
      description: 'Test web applications for common vulnerabilities',
      status: 'running',
      progress: 65,
      assignedAgent: agents.find((a) => a.type === 'web_security') || agents[0],
      dependencies: ['task-1'],
      startTime: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 'task-3',
      name: 'Bug Bounty Analysis',
      description: 'Deep analysis of discovered vulnerabilities',
      status: 'running',
      progress: 35,
      assignedAgent: agents.find((a) => a.type === 'bugbounty') || agents[0],
      dependencies: ['task-1'],
      startTime: new Date(Date.now() - 10 * 60000).toISOString(),
    },
    {
      id: 'task-4',
      name: 'CVE Correlation',
      description: 'Match findings with known CVEs',
      status: 'pending',
      progress: 0,
      assignedAgent: agents.find((a) => a.type === 'cve_intelligence') || agents[0],
      dependencies: ['task-2', 'task-3'],
    },
    {
      id: 'task-5',
      name: 'Report Generation',
      description: 'Generate comprehensive security report',
      status: 'pending',
      progress: 0,
      assignedAgent: agents.find((a) => a.type === 'report_generator') || agents[0],
      dependencies: ['task-4'],
    },
  ];

  return {
    id: 'workflow-1',
    name: 'Full Security Assessment',
    description: 'Comprehensive security assessment using multiple AI agents',
    status: 'running',
    tasks,
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    startedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  };
};

interface AgentChat {
  agent: Agent;
  messages: AgentMessage[];
  unreadCount: number;
}

const AgentsPage = () => {
  const dispatch = useAppDispatch();
  const { agents, selectedAgent, messages, loading } = useAppSelector((state) => state.agents);
  const [activeTab, setActiveTab] = useState(0);
  const [multiAgentChats, setMultiAgentChats] = useState<AgentChat[]>([]);
  // Use state with manual control for workflow updates
  const [workflow, setWorkflow] = useState<CollaborationWorkflow | null>(null);
  const [workflowInitialized, setWorkflowInitialized] = useState(false);

  useEffect(() => {
    // Initialize with mock agents
    dispatch(setAgents(mockAgents));
  }, [dispatch]);

  // Use useMemo to create initial workflow when agents are available
  const initialWorkflow = useMemo(() => {
    if (agents.length > 0) {
      return createMockWorkflow(agents);
    }
    return null;
  }, [agents]);

  // Set workflow once when initial workflow is computed
  useEffect(() => {
    if (initialWorkflow && !workflowInitialized) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorkflowInitialized(true);
      setWorkflow(initialWorkflow);
    }
  }, [initialWorkflow, workflowInitialized]);

  const handleSelectAgent = useCallback(
    (agent: Agent) => {
      dispatch(setSelectedAgent(agent));
      // When on Multi-Agent tab, also add the agent to the chat list
      if (activeTab === TABS.MULTI_AGENT) {
        setMultiAgentChats((prev) => {
          if (prev.find((c) => c.agent.id === agent.id)) {
            return prev; // Already exists
          }
          return [...prev, { agent, messages: [], unreadCount: 0 }];
        });
      }
    },
    [dispatch, activeTab]
  );

  const handleToggleAgent = useCallback(
    (agent: Agent) => {
      const newStatus: Agent['status'] = agent.status === 'active' || agent.status === 'busy' ? 'standby' : 'active';
      dispatch(updateAgent({ ...agent, status: newStatus }));
    },
    [dispatch]
  );

  const handleSendMessage = useCallback(
    (content: string) => {
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
    },
    [dispatch, selectedAgent]
  );

  const handleClearHistory = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // Multi-agent chat handlers
  const handleMultiAgentSendMessage = useCallback(
    (agentId: string, content: string) => {
      setMultiAgentChats((prev) => {
        const updatedChats = prev.map((chat) => {
          if (chat.agent.id === agentId) {
            const userMessage: AgentMessage = {
              id: `msg-${Date.now()}`,
              agentId: chat.agent.id,
              agentName: chat.agent.name,
              content,
              timestamp: new Date().toISOString(),
              isUser: true,
            };

            // Simulate agent response
            setTimeout(() => {
              setMultiAgentChats((innerPrev) =>
                innerPrev.map((innerChat) => {
                  if (innerChat.agent.id === agentId) {
                    const agentResponse: AgentMessage = {
                      id: `msg-${Date.now() + 1}`,
                      agentId: innerChat.agent.id,
                      agentName: innerChat.agent.name,
                      content: generateMockResponse(content, innerChat.agent),
                      timestamp: new Date().toISOString(),
                      isUser: false,
                      metadata: {
                        toolsUsed: getToolsForCommand(content),
                        progress: 100,
                        status: 'completed',
                      },
                    };
                    return {
                      ...innerChat,
                      messages: [...innerChat.messages, agentResponse],
                    };
                  }
                  return innerChat;
                })
              );
            }, 1500);

            return {
              ...chat,
              messages: [...chat.messages, userMessage],
            };
          }
          return chat;
        });
        return updatedChats;
      });
    },
    []
  );

  const handleRemoveChat = useCallback((agentId: string) => {
    setMultiAgentChats((prev) => prev.filter((c) => c.agent.id !== agentId));
  }, []);

  const handleBroadcastMessage = useCallback(
    (message: string, agentIds: string[]) => {
      agentIds.forEach((agentId) => {
        handleMultiAgentSendMessage(agentId, message);
      });
    },
    [handleMultiAgentSendMessage]
  );

  // Workflow handlers
  const handleStartWorkflow = useCallback(() => {
    setWorkflow((prev) => (prev ? { ...prev, status: 'running' } : null));
  }, []);

  const handlePauseWorkflow = useCallback(() => {
    setWorkflow((prev) => (prev ? { ...prev, status: 'paused' } : null));
  }, []);

  const handleStopWorkflow = useCallback(() => {
    setWorkflow((prev) => (prev ? { ...prev, status: 'idle' } : null));
  }, []);

  const handleRestartTask = useCallback((taskId: string) => {
    setWorkflow((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, status: 'running' as const, progress: 0 } : task
        ),
      };
    });
  }, []);

  // Simulate workflow progress
  useEffect(() => {
    if (workflow?.status !== 'running') return;

    const interval = setInterval(() => {
      setWorkflow((prev) => {
        if (!prev || prev.status !== 'running') return prev;

        const updatedTasks = prev.tasks.map((task) => {
          if (task.status === 'running' && task.progress < 100) {
            const newProgress = Math.min(task.progress + Math.random() * 5, 100);
            if (newProgress >= 100) {
              return { ...task, progress: 100, status: 'completed' as const };
            }
            return { ...task, progress: newProgress };
          }
          // Start pending tasks if dependencies are complete
          if (task.status === 'pending') {
            const dependenciesComplete = task.dependencies.every((depId) =>
              prev.tasks.find((t) => t.id === depId)?.status === 'completed'
            );
            if (dependenciesComplete) {
              return { ...task, status: 'running' as const };
            }
          }
          return task;
        });

        // Check if all tasks are complete
        const allComplete = updatedTasks.every((t) => t.status === 'completed');
        return {
          ...prev,
          tasks: updatedTasks,
          status: allComplete ? 'completed' : prev.status,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [workflow?.status]);

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.CHAT:
        return (
          <AgentChatInterface
            messages={messages}
            selectedAgent={selectedAgent}
            onSendMessage={handleSendMessage}
            loading={loading}
          />
        );
      case TABS.MULTI_AGENT:
        return (
          <MultiAgentChat
            activeChats={multiAgentChats}
            onSendMessage={handleMultiAgentSendMessage}
            onRemoveChat={handleRemoveChat}
            onBroadcastMessage={handleBroadcastMessage}
            loading={loading}
          />
        );
      case TABS.COLLABORATION:
        return (
          <AgentCollaborationView
            workflow={workflow}
            agents={agents}
            onStartWorkflow={handleStartWorkflow}
            onPauseWorkflow={handlePauseWorkflow}
            onStopWorkflow={handleStopWorkflow}
            onRestartTask={handleRestartTask}
          />
        );
      case TABS.HISTORY:
        return <ConversationHistory messages={messages} onClearHistory={handleClearHistory} />;
      case TABS.METRICS:
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
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<ChatIcon />} label="Chat" iconPosition="start" sx={{ minHeight: 48 }} />
              <Tab
                icon={<GroupIcon />}
                label="Multi-Agent"
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
              <Tab
                icon={<AccountTreeIcon />}
                label="Collaboration"
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
              <Tab icon={<HistoryIcon />} label="History" iconPosition="start" sx={{ minHeight: 48 }} />
              <Tab icon={<SpeedIcon />} label="Metrics" iconPosition="start" sx={{ minHeight: 48 }} />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <Box sx={{ flex: 1, minHeight: 0 }}>{renderTabContent()}</Box>
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
