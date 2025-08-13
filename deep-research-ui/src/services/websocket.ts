import { io, Socket } from 'socket.io-client';
import { WebSocketMessage } from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string = 'ws://localhost:8000') {
    if (this.socket?.connected) return;

    this.socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
    });

    this.socket.on('reconnect_failed', () => {
      console.log('Failed to reconnect to WebSocket server');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  emit(event: string, data: any) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Convenience methods for common events
  onAgentUpdate(callback: (data: any) => void) {
    this.on('agent_update', callback);
  }

  onSearchResult(callback: (data: any) => void) {
    this.on('search_result', callback);
  }

  onMemoryUpdate(callback: (data: any) => void) {
    this.on('memory_update', callback);
  }

  onLogMessage(callback: (data: any) => void) {
    this.on('log_message', callback);
  }

  ping() {
    this.emit('ping', { timestamp: Date.now() });
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;