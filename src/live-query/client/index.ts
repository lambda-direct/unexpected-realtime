import {
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
  private queryParams: Map<string, QueryRequest["params"]> = new Map<
    string,
    QueryRequest["params"]
  >();

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
    const connectionUrl = `wss://${this.projectId}-lq-worker.lunaxodd.workers.dev/ws/connect`;
    const ws = new WebSocket(connectionUrl);

    const setMap = new Map<string, ReturnType<typeof createSet>>();

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

        if (!setMap.has(queryName)) {
          setMap.set(
            queryName,
            createSet(this.queryParams.get(queryName)!.order)
          );
        }

        const set = setMap.get(queryName)!;
        set.set([...set.get(), ...data]);

        if (this.config.onChange) {
          this.config.onChange({ queryName, data: set.get() });
        }
      } else if (message.type === "update") {
        const { queryName, items } = message;

        const set = setMap.get(queryName)!;

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
   * Subscribes to a specific query
   * @example liveQueryClient.subscribe("query-name", { order: "asc", limit: 10 });
   */
  subscribe = (queryName: string, params: QueryRequest["params"]): void => {
    this.sendMessage({
      type: "query",
      queryName,
      params,
    } satisfies QueryRequest);
    this.queryParams.set(queryName, params);
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
    this.queryParams.delete(queryName);
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
