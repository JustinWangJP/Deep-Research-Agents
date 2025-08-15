/**
 * WebSocketサービスのユニットテスト
 * Socket.IO通信、再接続、イベントハンドリングをテスト
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { io } from 'socket.io-client';
import { webSocketService } from '../websocket';

// socket.io-clientのモック
vi.mock('socket.io-client');
const mockSocket = {
  connected: false,
  disconnect: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
};

const mockIo = vi.fn().mockReturnValue(mockSocket);
vi.mocked(io).mockImplementation(mockIo);

describe('WebSocketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // サービスをリセット
    (webSocketService as unknown as { socket: unknown }).socket = null;
    (webSocketService as unknown as { reconnectAttempts: number }).reconnectAttempts = 0;
  });

  afterEach(() => {
    webSocketService.disconnect();
  });

  describe('connect', () => {
    it('should connect to WebSocket server', () => {
      webSocketService.connect('ws://localhost:8000');

      expect(mockIo).toHaveBeenCalledWith('ws://localhost:8000', {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('reconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('reconnect_failed', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should not connect if already connected', () => {
      mockSocket.connected = true;
      
      webSocketService.connect('ws://localhost:8000');
      
      expect(mockIo).toHaveBeenCalledTimes(1);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from WebSocket server', () => {
      webSocketService.connect('ws://localhost:8000');
      webSocketService.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect((webSocketService as unknown as { socket: unknown }).socket).toBeNull();
    });

    it('should handle disconnect when socket is null', () => {
      webSocketService.disconnect();
      
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('event handling', () => {
    it('should register event listeners', () => {
      webSocketService.connect('ws://localhost:8000');

      const callback = vi.fn();
      webSocketService.on('event-name', callback);

      expect(mockSocket.on).toHaveBeenCalledWith('event-name', callback);
    });

    it('should not register listeners when socket is null', () => {
      const callback = vi.fn();
      webSocketService.on('event-name', callback);

      expect(mockSocket.on).not.toHaveBeenCalled();
    });

    it('should remove event listeners', () => {
      webSocketService.connect('ws://localhost:8000');

      const callback = vi.fn();
      webSocketService.off('event-name', callback);

      expect(mockSocket.off).toHaveBeenCalledWith('event-name', callback);
    });

    it('should not remove listeners when socket is null', () => {
      const callback = vi.fn();
      webSocketService.off('event-name', callback);

      expect(mockSocket.off).not.toHaveBeenCalled();
    });
  });

  describe('emit', () => {
    it('should emit events', () => {
      webSocketService.connect('ws://localhost:8000');

      const data = { message: 'test data' };
      webSocketService.emit('event-name', data);

      expect(mockSocket.emit).toHaveBeenCalledWith('event-name', data);
    });

    it('should not emit when socket is null', () => {
      const data = { message: 'test data' };
      webSocketService.emit('event-name', data);

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      webSocketService.connect('ws://localhost:8000');
    });

    it('should register agent update listener', () => {
      const callback = vi.fn();
      webSocketService.onAgentUpdate(callback);

      expect(mockSocket.on).toHaveBeenCalledWith('agent_update', callback);
    });

    it('should register search result listener', () => {
      const callback = vi.fn();
      webSocketService.onSearchResult(callback);

      expect(mockSocket.on).toHaveBeenCalledWith('search_result', callback);
    });

    it('should register memory update listener', () => {
      const callback = vi.fn();
      webSocketService.onMemoryUpdate(callback);

      expect(mockSocket.on).toHaveBeenCalledWith('memory_update', callback);
    });

    it('should register log message listener', () => {
      const callback = vi.fn();
      webSocketService.onLogMessage(callback);

      expect(mockSocket.on).toHaveBeenCalledWith('log_message', callback);
    });
  });

  describe('isConnected', () => {
    it('should return connection status', () => {
      mockSocket.connected = true;
      webSocketService.connect('ws://localhost:8000');

      expect(webSocketService.isConnected()).toBe(true);
    });

    it('should return false when not connected', () => {
      mockSocket.connected = false;
      webSocketService.connect('ws://localhost:8000');

      expect(webSocketService.isConnected()).toBe(false);
    });

    it('should return false when socket is null', () => {
      expect(webSocketService.isConnected()).toBe(false);
    });
  });

  describe('ping', () => {
    it('should send ping with timestamp', () => {
      webSocketService.connect('ws://localhost:8000');

      const originalDate = global.Date;
      const mockDate = { now: vi.fn().mockReturnValue(123456789) };
      global.Date = mockDate as typeof global.Date;

      webSocketService.ping();

      expect(mockSocket.emit).toHaveBeenCalledWith('ping', { timestamp: 123456789 });

      global.Date = originalDate;
    });

    it('should not ping when socket is null', () => {
      webSocketService.ping();

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });
});