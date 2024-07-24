class RealtimeClient {
  connection: WebSocket | null = null;
  channels: Record<string, () => void> = {};
  isConnected: boolean = false;
  projectId: string;
  timeout: NodeJS.Timeout | null = null;
  constructor(projectId: string) {
    this.projectId = projectId;
    this.connection = this.connect(projectId);
  }

  private connect = (projectId: string) => {
    console.log("Connecting to Realtime Server");

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

  private disconnect = () => {
    this.connection?.close();
    this.isConnected = false;
    this.connection = null;
  };

  subscribe = (channelName: string, handler: () => void) => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (!this.connection) {
      this.connection = this.connect(this.projectId);
    }
    if (!this.isConnected) {
      return setTimeout(() => this.subscribe(channelName, handler), 200);
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

  unsubscribe = (channelName: string) => {
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

export default RealtimeClient;
