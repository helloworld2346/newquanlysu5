import { storage } from "@/lib/storage";

export type WsMessage<T = unknown> = {
  type: string;
  payload: T;
};

type Listener = (msg: WsMessage) => void;

const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8080/api/ws";

class WsClient {
  private socket: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private manuallyClosed = false;
  private pingTimer: number | null = null;

  connect() {
    const token = storage.getToken();
    if (!token) return; // chưa đăng nhập thì không kết nối
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return; // đã kết nối rồi
    }

    this.manuallyClosed = false;
    const url = `${WS_BASE}?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.startPing();
    };

    socket.onmessage = (event) => {
      let msg: WsMessage;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return; // bỏ qua message không phải JSON (vd: "pong")
      }
      this.listeners.forEach((fn) => fn(msg));
    };

    socket.onclose = () => {
      this.stopPing();
      this.socket = null;
      if (!this.manuallyClosed) this.scheduleReconnect();
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer !== null) return;
    if (!storage.getToken()) return; // đã đăng xuất
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30_000);
    this.reconnectAttempts += 1;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = window.setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 25_000);
  }

  private stopPing() {
    if (this.pingTimer !== null) {
      window.clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  send(msg: WsMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    }
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  disconnect() {
    this.manuallyClosed = true;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPing();
    this.socket?.close();
    this.socket = null;
    this.reconnectAttempts = 0;
  }
}

export const wsClient = new WsClient();
