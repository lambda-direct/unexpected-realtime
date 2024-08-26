import { Order } from "../../types";
import { SelectQuery, SerializableQueryBuilder, WhereStatement } from "./types";

export class SelectQueryBuilder implements SerializableQueryBuilder {
  constructor(private query: SelectQuery) {}

  where(statement: WhereStatement): Omit<typeof this, "where"> {
    this.query.where = statement;

    return this;
  }

  order(direction: Order): Omit<typeof this, "order"> {
    this.query.order = direction;

    return this;
  }

  limit(value: number): Omit<typeof this, "limit"> {
    this.query.limit = value;

    return this;
  }

  private mapWhere(statement?: WhereStatement): string | undefined {
    if (!statement) {
      return;
    }

    if ("and" in statement) {
      const mapped = statement.and.map((item) => this.mapWhere(item));

      if (!mapped.length) {
        return;
      }

      return `(${mapped.join(" AND ")})`;
    } else if ("or" in statement) {
      const mapped = statement.or.map((item) => this.mapWhere(item));

      if (!mapped.length) {
        return;
      }

      return `(${mapped.join(" OR ")})`;
    }

    const { column, ...ops } = statement;

    const [[op, value]] = Object.entries(ops);
    const map: Record<Exclude<keyof typeof statement, "column">, string> = {
      gt: ">",
      gte: ">=",
      lt: "<",
      lte: "<=",
      eq: "=",
      neq: "!=",
      like: "like",
      ilike: "ilike",
    };

    let realValue = value;

    if (typeof realValue === "string") {
      realValue = `'${realValue}'`;
    }

    return `${statement.column} ${map[op as keyof typeof map]} ${realValue}`;
  }

  serialize(): string {
    const where = this.mapWhere(this.query.where);

    return `
            SELECT rowid, t.* from ${this.query.from} as t
            ${where ? `WHERE ${where}` : ``}
            ORDER BY rowid ${this.query.order}
    
            ${this.query.limit ? `LIMIT ${this.query.limit}` : ``}
        `;
  }
}

export class QueryBuilder {
  select(table: string) {
    return new SelectQueryBuilder({ from: table, order: Order.DESC });
  }
}
