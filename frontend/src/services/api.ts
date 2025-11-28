/**
 * HexStrike AI API Client
 * Handles all communication with the backend server
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { ApiResponse } from '../types';

// Get API URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8889';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = sessionStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          sessionStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // Health Check
  // ============================================================================

  async checkHealth(): Promise<ApiResponse> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // ============================================================================
  // Agent Management
  // ============================================================================

  async listAgents(): Promise<ApiResponse> {
    const response = await this.client.get('/api/agents/list');
    return response.data;
  }

  async getAgentStatus(agentId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/api/agents/${agentId}/status`);
    return response.data;
  }

  async activateAgent(agentId: string): Promise<ApiResponse> {
    const response = await this.client.post(`/api/agents/${agentId}/activate`);
    return response.data;
  }

  async deactivateAgent(agentId: string): Promise<ApiResponse> {
    const response = await this.client.post(`/api/agents/${agentId}/deactivate`);
    return response.data;
  }

  async sendAgentMessage(agentId: string, message: string, aiConfig?: {
    openRouterApiKey?: string;
    openRouterModel?: string;
    openRouterEnabled?: boolean;
  }): Promise<ApiResponse> {
    const response = await this.client.post(`/api/agents/${agentId}/message`, { 
      message,
      aiConfig: aiConfig || undefined
    });
    return response.data;
  }

  async getAIModels(apiKey?: string, providerFilter?: string, providerType?: string): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (apiKey) params.append('api_key', apiKey);
    if (providerFilter) params.append('provider', providerFilter);
    if (providerType) params.append('provider_type', providerType);
    const response = await this.client.get(`/api/agents/models?${params.toString()}`);
    return response.data;
  }

  // ============================================================================
  // Tool Management
  // ============================================================================

  async listTools(): Promise<ApiResponse> {
    const response = await this.client.get('/api/tools/list');
    return response.data;
  }

  async getTool(toolId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/api/tools/${toolId}`);
    return response.data;
  }

  async executeTool(toolId: string, parameters: any): Promise<ApiResponse> {
    const response = await this.client.post(`/api/tools/${toolId}/execute`, parameters);
    return response.data;
  }

  async getToolStatus(toolId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/api/tools/${toolId}/status`);
    return response.data;
  }

  async stopTool(toolId: string): Promise<ApiResponse> {
    const response = await this.client.post(`/api/tools/${toolId}/stop`);
    return response.data;
  }

  // ============================================================================
  // Scan Management
  // ============================================================================

  async createScan(scanData: any): Promise<ApiResponse> {
    const response = await this.client.post('/api/scans/create', scanData);
    return response.data;
  }

  async listScans(): Promise<ApiResponse> {
    const response = await this.client.get('/api/scans/list');
    return response.data;
  }

  async getScan(scanId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/api/scans/${scanId}`);
    return response.data;
  }

  async deleteScan(scanId: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/api/scans/${scanId}`);
    return response.data;
  }

  async getScanProgress(scanId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/api/scans/${scanId}/progress`);
    return response.data;
  }

  async getScanResults(scanId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/api/scans/${scanId}/results`);
    return response.data;
  }

  // ============================================================================
  // Vulnerability Management
  // ============================================================================

  async listVulnerabilities(): Promise<ApiResponse> {
    const response = await this.client.get('/api/vulnerabilities/list');
    return response.data;
  }

  async getVulnerability(vulnId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/api/vulnerabilities/${vulnId}`);
    return response.data;
  }

  async updateVulnerability(vulnId: string, updates: any): Promise<ApiResponse> {
    const response = await this.client.put(`/api/vulnerabilities/${vulnId}`, updates);
    return response.data;
  }

  async getRemediation(vulnId: string): Promise<ApiResponse> {
    const response = await this.client.post(`/api/vulnerabilities/${vulnId}/remediation`);
    return response.data;
  }

  // ============================================================================
  // Report Generation
  // ============================================================================

  async generateReport(reportData: any): Promise<ApiResponse> {
    const response = await this.client.post('/api/reports/generate', reportData);
    return response.data;
  }

  async listReports(): Promise<ApiResponse> {
    const response = await this.client.get('/api/reports/list');
    return response.data;
  }

  async getReport(reportId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/api/reports/${reportId}`);
    return response.data;
  }

  async downloadReport(reportId: string): Promise<Blob> {
    const response = await this.client.get(`/api/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // ============================================================================
  // Project Management
  // ============================================================================

  async createProject(projectData: any): Promise<ApiResponse> {
    const response = await this.client.post('/api/projects/create', projectData);
    return response.data;
  }

  async listProjects(): Promise<ApiResponse> {
    const response = await this.client.get('/api/projects/list');
    return response.data;
  }

  async getProject(projectId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/api/projects/${projectId}`);
    return response.data;
  }

  async updateProject(projectId: string, updates: any): Promise<ApiResponse> {
    const response = await this.client.put(`/api/projects/${projectId}`, updates);
    return response.data;
  }

  async deleteProject(projectId: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/api/projects/${projectId}`);
    return response.data;
  }

  // ============================================================================
  // CVE Intelligence
  // ============================================================================

  async getCVE(cveId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/api/intelligence/cve/${cveId}`);
    return response.data;
  }

  async searchIntelligence(query: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/intelligence/search', { query });
    return response.data;
  }

  async getTrendingVulnerabilities(): Promise<ApiResponse> {
    const response = await this.client.get('/api/intelligence/trending');
    return response.data;
  }

  // ============================================================================
  // Target Analysis
  // ============================================================================

  async analyzeTarget(target: string, analysisType: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/intelligence/analyze-target', {
      target,
      analysis_type: analysisType,
    });
    return response.data;
  }

  // ============================================================================
  // Settings & Configuration
  // ============================================================================

  async getSettings(): Promise<ApiResponse> {
    const response = await this.client.get('/api/config/settings');
    return response.data;
  }

  async updateSettings(settings: any): Promise<ApiResponse> {
    const response = await this.client.put('/api/config/settings', settings);
    return response.data;
  }

  async getMCPServerStatus(): Promise<ApiResponse> {
    const response = await this.client.get('/api/config/mcp-status');
    return response.data;
  }

  async updateMCPServerSettings(settings: any): Promise<ApiResponse> {
    const response = await this.client.put('/api/config/mcp-server', settings);
    return response.data;
  }

  async setExternalAccess(enabled: boolean, host?: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/config/external-access', {
      enabled,
      host: host || '0.0.0.0',
    });
    return response.data;
  }

  async generateApiKey(): Promise<ApiResponse> {
    const response = await this.client.post('/api/config/generate-api-key');
    return response.data;
  }

  // ============================================================================
  // System Resources & Monitoring
  // ============================================================================

  /**
   * Get current system resource usage (CPU, memory, disk, network)
   * This returns live data from the server
   */
  async getResourceUsage(): Promise<ApiResponse> {
    const response = await this.client.get('/api/process/resource-usage');
    return response.data;
  }

  /**
   * Get performance dashboard data including resource usage, process pool stats,
   * cache stats, and system health
   */
  async getPerformanceDashboard(): Promise<ApiResponse> {
    const response = await this.client.get('/api/process/performance-dashboard');
    return response.data;
  }

  /**
   * Get process health check with comprehensive system stats
   */
  async getProcessHealthCheck(): Promise<ApiResponse> {
    const response = await this.client.get('/api/process/health-check');
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
