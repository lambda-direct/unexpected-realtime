import type { AuthContextProducer, QueryProducer } from "./types";

const createQuery = (
  triggerTable: string,
  queryProducer: QueryProducer
) => ({
  queryProducer,
  triggerTable,
});

const setupLive = (data: {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  getAuthContext: AuthContextProducer<any>;
  queries: Record<
    string,
    { triggerTable: string; queryProducer: QueryProducer }
  >;
}) => {
  return {
    getAuthContext: data.getAuthContext,
    queries: data.queries,
  };
};

export { createQuery, setupLive };
