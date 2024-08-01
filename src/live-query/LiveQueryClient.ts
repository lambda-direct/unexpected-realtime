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
  constructor(private projectId: string, private config: Config) {
    this.projectId = projectId;
    this.config = config;
    this.connect();
  }

  private connect = () => {
    const connectionUrl = `wss://${this.projectId}-lq-worker.lunaxodd.workers.dev/ws/connect`;
    const ws = new WebSocket(connectionUrl);
    this.connection = ws;

    const setMap = new Map<string, ReturnType<typeof createSet>>();

    this.connection.onopen = () => {
      this.sendMessage({
        type: "authenticate",
        data: this.config.authenticate,
      });
    };

    this.connection.onmessage = (event) => {
      const message = JSON.parse(event.data) as WebSocketMessage;

      if (message.type === "authenticate") {
        if (message.result === "fail") {
          this.connection.close();

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

        this.config.onChange({ queryName, data: set.get() });
      } else if (message.type === "update") {
        const { queryName, items } = message;

        const set = setMap.get(queryName)!;

        set.update(items);

        this.config.onChange({ queryName, data: set.get() });
      }
    };

    return {
      next: (queryName: string) => {
        this.sendMessage({
          type: "queryNext",
          queryName,
        } satisfies QueryNextRequest);
      },
    };
  };

  private sendMessage(message: Message) {
    if (!this.connection) return;
    this.connection.send(JSON.stringify(message));
  }

  subscribe = (queryName: string, params: QueryRequest["params"]) => {
    this.sendMessage({
      type: "query",
      queryName,
      params,
    } satisfies QueryRequest);
    this.queryParams.set(queryName, params);
  };

  unsubscribe = (queryName: string) => {
    this.sendMessage({
      type: "queryUnsubscribe",
      queryName,
    } satisfies QueryUnsubscribeRequest);
    this.queryParams.delete(queryName);
  };
}

export default LiveQueryClient;
