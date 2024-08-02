import { AuthContextProducer, QueryProducer } from "./types";

export const createQuery = (
  triggerTable: string,
  queryProducer: QueryProducer
) => ({
  queryProducer,
  triggerTable,
});

export const setupLive = (data: {
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
