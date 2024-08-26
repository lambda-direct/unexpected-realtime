import type {
  Config,
  Message,
  QueryNextRequest,
  QueryRequest,
  QueryUnsubscribeRequest,
  WebSocketMessage,
} from "./types";
import { createSet } from "./utils";

class LiveQueryClient {
  private connection: WebSocket | null = null;
  private timeout: NodeJS.Timeout | null = null;
  private queryDataset = new Map<string, ReturnType<typeof createSet>>();
  private queryParams = new Map<string, QueryRequest["params"]>();
  private queries = new Set<string>();
  /**
   * Connects to the LiveQuery server
   * @constructor
   */
  constructor(private projectId: string, private config: Config) {
    this.projectId = projectId;
    this.config = config;
    this.connection = this.connect();
  }

  /**
   * Connects to the LiveQuery server
   * @private
   */
  private connect = (): WebSocket => {
    const connectionUrl = `wss://unexpected-live-query-${this.projectId}.alex-blokh.workers.dev/ws/connect`;
    const ws = new WebSocket(connectionUrl);

    ws.onopen = () => {
      this.sendMessage({
        type: "authenticate",
        data: this.config.authenticate,
      });
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as WebSocketMessage;

      if (message.type === "authenticate") {
        if (message.result === "fail") {
          ws.close();
          throw new Error("Authentication failed");
        }
      } else if (message.type === "query") {
        const { queryName, data } = message;

        if (!this.queryDataset.has(queryName)) {
          this.queryDataset.set(
            queryName,
            createSet(this.queryParams.get(queryName)!.order)
          );
        }

        const set = this.queryDataset.get(queryName)!;
        set.set([...set.get(), ...data]);

        if (this.config.onChange) {
          this.config.onChange({ queryName, data: set.get() });
        }
      } else if (message.type === "update") {
        const { queryName, items } = message;

        const set = this.queryDataset.get(queryName)!;

        set.update(items);

        if (this.config.onChange) {
          this.config.onChange({ queryName, data: set.get() });
        }
      }
    };

    return ws;
  };

  /**
   * Sends a message to the server
   * @private
   */
  private sendMessage = (message: Message): void => {
    if (!this.connection) {
      throw new Error("Trying to send message without connection");
    }
    this.connection.send(JSON.stringify(message));
  };

  /**
   * Disconnects from the LiveQuery server
   * @private
   */
  private disconnect = (): void => {
    this.connection?.close();
    this.connection = null;
  };

  /**
   * Subscribes to a specific query
   * @example liveQueryClient.subscribe("query-name", { order: "asc", limit: 10 });
   */
  subscribe = (queryName: string, params: QueryRequest["params"]): void => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (!this.connection) {
      this.connection = this.connect();
    }
    if (!this.connection) {
      setTimeout(() => this.subscribe(queryName, params), 200);
      return;
    }
    this.sendMessage({
      type: "query",
      queryName,
      params,
    } satisfies QueryRequest);
    this.queryParams.set(queryName, params);
    this.queries.add(queryName);
  };

  /**
   * Unsubscribes from a specific query
   * @example liveQueryClient.unsubscribe("query-name");
   */
  unsubscribe = (queryName: string): void => {
    this.sendMessage({
      type: "queryUnsubscribe",
      queryName,
    } satisfies QueryUnsubscribeRequest);
    this.queryDataset.delete(queryName);
    this.queryParams.delete(queryName);
    this.queries.delete(queryName);

    // disconnect if no more queries
    if (this.queries.size === 0) {
      this.timeout = setTimeout(() => {
        if (this.queries.size === 0) {
          this.disconnect();
        }
      }, 2000);
    }
  };

  /**
   * Fetches the next page of the query
   * @example liveQueryClient.next("query-name");
   */
  next = (queryName: string): void => {
    this.sendMessage({
      type: "queryNext",
      queryName,
    } satisfies QueryNextRequest);
  };
}

export default LiveQueryClient;
