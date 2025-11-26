/**
 * HexStrike AI Frontend - Type Definitions
 * Based on FEATURES.md data models
 */

// ============================================================================
// Agent Types
// ============================================================================

export type AgentStatus = 'active' | 'standby' | 'busy' | 'error';

export type AgentType =
  | 'bugbounty'
  | 'ctf'
  | 'cve_intelligence'
  | 'exploit_generator'
  | 'web_security'
  | 'auth_testing'
  | 'mobile_security'
  | 'cloud_security'
  | 'binary_analysis'
  | 'osint'
  | 'network_recon'
  | 'report_generator';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];
  currentTask?: string;
  lastActive: string; // ISO date string for Redux compatibility
  description?: string;
  icon?: string;
}

// ============================================================================
// Tool Types
// ============================================================================

export type ToolCategory =
  | 'network'
  | 'web'
  | 'binary'
  | 'cloud'
  | 'ctf'
  | 'osint'
  | 'password';

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  required: boolean;
  default?: any;
  options?: string[];
}

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  version: string;
  description: string;
  installed: boolean;
  parameters: ToolParameter[];
  usageCount: number;
  lastUsed?: Date;
  rating?: number;
}

// ============================================================================
// Scan Types
// ============================================================================

export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export type ScanType = 'quick' | 'standard' | 'deep' | 'custom';

export interface ScanPhase {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  results?: any;
}

export interface ScanResults {
  vulnerabilitiesFound: number;
  hostsDiscovered: number;
  portsOpen: number;
  servicesIdentified: number;
  findings: any[];
}

export interface Scan {
  id: string;
  target: string;
  type: ScanType;
  status: ScanStatus;
  progress: number;
  startTime: Date;
  endTime?: Date;
  currentPhase: string;
  phases: ScanPhase[];
  toolsUsed: string[];
  vulnerabilitiesFound: number;
  results?: ScanResults;
  estimatedTimeRemaining?: number;
}

// ============================================================================
// Vulnerability Types
// ============================================================================

export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type VulnerabilityStatus = 'new' | 'confirmed' | 'false_positive' | 'remediated';

export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: VulnerabilitySeverity;
  cvssScore: number;
  cveId?: string;
  cweId?: string;
  location: string;
  discoveredBy: string;
  discoveredAt: string; // ISO string for JSON serialization
  status: VulnerabilityStatus;
  remediation?: string;
  proofOfConcept?: string;
  references?: string[];
  affectedAssets?: string[];
}

// ============================================================================
// Project Types
// ============================================================================

export type ProjectStatus = 'active' | 'completed' | 'archived';

export interface Target {
  id: string;
  hostname: string;
  ipAddress?: string;
  ports?: number[];
  services?: string[];
  notes?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'online' | 'offline' | 'away';
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  client?: string;
  status: ProjectStatus;
  progress: number;
  targets: Target[];
  scans: Scan[];
  vulnerabilities: Vulnerability[];
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Report Types
// ============================================================================

export type ReportType = 'comprehensive' | 'executive' | 'technical' | 'compliance';

export type ReportFormat = 'pdf' | 'html' | 'json' | 'markdown';

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  included: boolean;
}

export interface Report {
  id: string;
  projectId: string;
  type: ReportType;
  formats: ReportFormat[];
  sections: ReportSection[];
  createdAt: Date;
  generatedBy: string;
  downloadUrl?: string;
}

// ============================================================================
// Message/Chat Types
// ============================================================================

export interface AgentMessage {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: string; // ISO date string for Redux compatibility
  isUser: boolean;
  metadata?: {
    toolsUsed?: string[];
    progress?: number;
    status?: string;
  };
}

// ============================================================================
// Dashboard/Metrics Types
// ============================================================================

export interface DashboardMetrics {
  activeScans: number;
  toolsUsed: number;
  vulnerabilitiesFound: number;
  projectsActive: number;
  agentsOnline: number;
}

export interface ActivityItem {
  id: string;
  type: 'scan' | 'vulnerability' | 'report' | 'agent';
  title: string;
  description: string;
  timestamp: Date;
  severity?: VulnerabilitySeverity;
  status?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
