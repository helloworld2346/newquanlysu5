export interface WebSocketOptions {
  url: string;
  onMessage?: (data: unknown) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectInterval?: number;
}

export class WebSocketManager {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private manuallyClosed = false;
  private options: WebSocketOptions;

  constructor(options: WebSocketOptions) {
    this.options = options;
  }

  connect() {
    this.manuallyClosed = false;
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.socket = new WebSocket(this.options.url);

    this.socket.onopen = () => this.options.onOpen?.();

    this.socket.onmessage = (event) => {
      try {
        this.options.onMessage?.(JSON.parse(event.data));
      } catch {
        this.options.onMessage?.(event.data);
      }
    };

    this.socket.onclose = () => {
      this.options.onClose?.();
      if (this.manuallyClosed) return;
      this.reconnectTimer = window.setTimeout(
        () => this.connect(),
        this.options.reconnectInterval ?? 3000,
      );
    };

    this.socket.onerror = () => {
      if (import.meta.env.DEV) console.error("WebSocket Error");
    };
  }

  send(data: unknown) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }

  disconnect() {
    this.manuallyClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close(1000, "Manual Close");
  }

  setOnOpen(cb: () => void) {
    this.options.onOpen = cb;
  }
  setOnMessage(cb: (data: unknown) => void) {
    this.options.onMessage = cb;
  }
  setOnClose(cb: () => void) {
    this.options.onClose = cb;
  }
  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

function resolveWsUrl(): string {
  const envUrl = import.meta.env.VITE_WS_URL;
  if (envUrl) return envUrl;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

export const wsClient = new WebSocketManager({
  url: resolveWsUrl(),
  reconnectInterval: 3000,
});
