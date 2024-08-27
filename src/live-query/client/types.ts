import type { Order } from "../types";

type DataSetItem = { id: number; [key: string]: unknown };

type Config = {
	authenticate: unknown;
	onAuthenticate?: () => AuthenticateResponse;
	onChange?: (data: { queryName: string; data: DataSetItem[] }) => void;
};

type RealtimeEvent<T extends DataSetItem> = {
	id: number;
	entity: string;
	entityId: number;
	operation: "insert" | "update" | "delete";
	data: T;
};

type Message<
	Type extends string = string,
	Payload extends Record<string, unknown> = Record<string, unknown>,
> = { type: Type } & Payload;

type QueryRequest = Message<
	"query",
	{
		queryName: string;
		params: { limit: number; order: Order };
	}
>;

type QueryNextRequest = Message<"queryNext", { queryName: string }>;

type QueryUnsubscribeRequest = Message<
	"queryUnsubscribe",
	{ queryName: string }
>;

type UpdateResponse<T extends DataSetItem = { id: number }> = Message<
	"update",
	{ queryName: string; items: RealtimeEvent<T>[] }
>;

type QueryResponse<T extends DataSetItem = { id: number }> = Message<
	"query",
	{ queryName: string; data: T[] }
>;

type WebSocketMessage = AuthenticateResponse | QueryResponse | UpdateResponse;

type AuthenticateResponse = Message<"authenticate", { result: "ok" | "fail" }>;

export type {
	AuthenticateResponse,
	Config,
	DataSetItem,
	Message,
	QueryNextRequest,
	QueryRequest,
	QueryResponse,
	QueryUnsubscribeRequest,
	RealtimeEvent,
	UpdateResponse,
	WebSocketMessage,
};
