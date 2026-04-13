import { io } from 'socket.io-client';

const normalizeBaseUrl = (url) => String(url || '').replace(/\/+$/, '');

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL || 'http://localhost:4001');
const SOCKET_URL = normalizeBaseUrl(import.meta.env.VITE_SOCKET_URL || API_BASE_URL || 'http://localhost:4001');

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.registeredUid = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['polling', 'websocket'],
        upgrade: true,
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.connectionAttempts = 0;

        if (this.registeredUid) {
          this.socket.emit('register_user', this.registeredUid);
          this.socket.emit('get_online_users');
        }
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        this.connectionAttempts++;
        console.error('Connection error:', error.message);
        this.isConnected = false;
      });

      this.socket.on('reconnect_attempt', (attempt) => {
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionAttempts = 0;
      this.registeredUid = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  registerUser(uid) {
    if (!uid) return;
    this.registeredUid = uid;

    if (this.socket && this.socket.connected) {
      this.socket.emit('register_user', uid);
      this.socket.emit('get_online_users');
    }
  }

  requestOnlineUsers() {
    if (this.socket) {
      this.socket.emit('get_online_users');
    }
  }

  // Fix: This was conflicting with the property
  getIsConnected() {
    return this.isConnected;
  }
}

export default new SocketService();