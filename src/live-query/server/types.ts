import { Order } from "../../types";
import { QueryBuilder } from "./QueryBuilder";

export type WhereStatement =
  | { and: WhereStatement[] }
  | { or: WhereStatement[] }
  | {
      column: string;
      gt?: any;
      gte?: any;
      lt?: any;
      lte?: any;
      eq?: any;
      ilike?: any;
      like?: any;
      neq?: any;
    };

export interface Query {
  type: "select";
}

export interface SelectQuery {
  from: string;
  where?: WhereStatement;
  order: Order;
  limit?: string | number;
}

export interface SerializedQuery {
  query: SelectQuery;
}

export interface SerializableQueryBuilder {
  serialize: () => string;
}

export type AuthContextProducer<
  Env extends Record<string, unknown> = {},
  Data extends Record<string, unknown> = any,
  Return extends
    | Record<string, unknown>
    | Promise<Record<string, unknown>> = any
> = (env: Env, data: Data) => Return;

export type QueryProducer<Auth = any, Params = any> = (
  qb: QueryBuilder,
  auth: Auth,
  params: Params
) => SerializableQueryBuilder;
