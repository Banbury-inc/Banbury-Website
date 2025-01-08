import { CONFIG } from "../config/config";

class WebSocketService {
  private socket: WebSocket | null = null;
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log('WebSocket Connected');
          resolve();
        };

        this.socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('Received:', data);
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket Error:', error);
          reject(error);
        };

        this.socket.onclose = () => {
          console.log('WebSocket Disconnected');
        };
      } else if (this.socket.readyState === WebSocket.OPEN) {
        // If already connected, resolve immediately
        resolve();
      } else {
        reject(new Error('WebSocket connection failed'));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create and export a singleton instance
export const webSocketService = new WebSocketService(CONFIG.url_ws);

// Export the class if you need to create multiple instances
export default WebSocketService;

