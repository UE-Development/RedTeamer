/**
 * HexStrike AI WebSocket Service
 * Real-time communication with backend server
 */

import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8888';

type EventCallback = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<EventCallback>> = new Map();
  // private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      // this.reconnectAttempts = 0;
      this.emit('connection', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.emit('connection', { connected: false, reason });
    });

    this.socket.on('authenticated', (data) => {
      console.log('WebSocket authenticated');
      this.emit('authenticated', data);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });

    // Agent events
    this.socket.on('agent:message', (data) => this.emit('agent:message', data));
    this.socket.on('agent:response', (data) => this.emit('agent:response', data));
    this.socket.on('agent:status_change', (data) => this.emit('agent:status_change', data));
    this.socket.on('agent:error', (data) => this.emit('agent:error', data));

    // Scan events
    this.socket.on('scan:started', (data) => this.emit('scan:started', data));
    this.socket.on('scan:progress', (data) => this.emit('scan:progress', data));
    this.socket.on('scan:phase_complete', (data) => this.emit('scan:phase_complete', data));
    this.socket.on('scan:completed', (data) => this.emit('scan:completed', data));
    this.socket.on('scan:error', (data) => this.emit('scan:error', data));

    // Tool events
    this.socket.on('tool:started', (data) => this.emit('tool:started', data));
    this.socket.on('tool:output', (data) => this.emit('tool:output', data));
    this.socket.on('tool:completed', (data) => this.emit('tool:completed', data));
    this.socket.on('tool:error', (data) => this.emit('tool:error', data));

    // Vulnerability events
    this.socket.on('vulnerability:found', (data) => this.emit('vulnerability:found', data));
    this.socket.on('vulnerability:updated', (data) => this.emit('vulnerability:updated', data));

    // System events
    this.socket.on('system:notification', (data) => this.emit('system:notification', data));
    this.socket.on('system:alert', (data) => this.emit('system:alert', data));
    this.socket.on('system:resource_usage', (data) => this.emit('system:resource_usage', data));
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
  }

  on(event: string, callback: EventCallback): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(callback);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  send(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('WebSocket not connected. Cannot send event:', event);
    }
  }

  // Convenience methods for common operations
  subscribeToScan(scanId: string): void {
    this.send('subscribe', { type: 'scan', id: scanId });
  }

  unsubscribeFromScan(scanId: string): void {
    this.send('unsubscribe', { type: 'scan', id: scanId });
  }

  subscribeToAgent(agentId: string): void {
    this.send('subscribe', { type: 'agent', id: agentId });
  }

  unsubscribeFromAgent(agentId: string): void {
    this.send('unsubscribe', { type: 'agent', id: agentId });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
export default wsService;
