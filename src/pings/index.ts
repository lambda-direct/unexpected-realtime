class PingsClient {
  private connection: WebSocket | null = null;
  private channels: Record<string, () => void> = {};
  private isConnected: boolean = false;
  private projectId: string;
  private timeout: NodeJS.Timeout | null = null;
  constructor(projectId: string) {
    this.projectId = projectId;
    this.connection = this.connect(projectId);
  }

  /**
   * Connects to the LiveQuery server
   * @private
   * */
  private connect = (projectId: string): WebSocket => {
    const connectionUrl = `wss://unexpected-realtime-${projectId}.lunaxodd.workers.dev`;
    const webSocket = new WebSocket(connectionUrl);
    webSocket.onopen = () => {
      this.isConnected = true;
    };
    webSocket.onclose = () => {
      this.isConnected = false;
    };
    webSocket.onmessage = (event: { data: string }) => {
      const data = JSON.parse(event.data);
      if (!data.channel) return;
      const handler = this.channels[data.channel];
      if (handler) {
        handler();
      }
    };
    return webSocket;
  };

  /**
   * Disconnects from the LiveQuery server
   * @private
   * */
  private disconnect = (): void => {
    this.connection?.close();
    this.isConnected = false;
    this.connection = null;
  };

  /**
   * Subscribes to a specific channel
   * @example client.subscribe("channel-name", () => console.log("Ping"));
   */
  subscribe = (channelName: string, handler: () => void): void => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (!this.connection) {
      this.connection = this.connect(this.projectId);
    }
    if (!this.isConnected) {
      setTimeout(() => this.subscribe(channelName, handler), 200);
      return;
    }
    if (this.channels[channelName]) {
      this.channels[channelName] = handler;
      return;
    }

    const data = {
      type: "channel-subscribe",
      channel: channelName,
    };
    this.connection.send(JSON.stringify(data));
    this.channels[channelName] = handler;
  };

  /**
   * Unsubscribes from a specific channel
   * @example client.unsubscribe("channel-name");
   */
  unsubscribe = (channelName: string): void => {
    const message = {
      type: "channel-unsubscribe",
      channel: channelName,
    };
    this.connection!.send(JSON.stringify(message));
    delete this.channels[channelName];

    if (Object.keys(this.channels).length === 0) {
      this.timeout = setTimeout(() => {
        if (Object.keys(this.channels).length === 0) {
          this.disconnect();
        }
      }, 2000);
    }
  };
}

export default PingsClient;
