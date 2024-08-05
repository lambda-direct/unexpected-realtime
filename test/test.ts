import { createQuery, setupLive } from "../src/live-query/server";

// type AuthContext = Awaited<ReturnType<typeof getAuthContext>>;
// type SearchPostsParams = {
//   limit: number;
//   order: Order;
//   lastId?: number;
// };

// export const searchPosts = createQuery(
//   "posts",
//   (qb, auth: AuthContext, params: SearchPostsParams) => {
//     const conditions: WhereStatement[] = [];

//     if (params.lastId) {
//       conditions.push({
//         column: "rowid",
//         [params.order === "asc" ? "gt" : "lt"]: params.lastId,
//       });
//     }

//     return qb
//       .select("posts")
//       .where({
//         and: conditions,
//       })
//       .limit(params.limit)
//       .order(params.order);
//   }
// );

export const searchPosts = createQuery("posts", (qb, auth, params) => {
  const conditions = [];

  if (params.lastId) {
    conditions.push({
      column: "rowid",
      [params.order === "asc" ? "gt" : "lt"]: params.lastId,
    });
  }

  return qb
    .select("posts")
    .where({
      and: conditions,
    })
    .limit(params.limit)
    .order(params.order);
});

export const getAuthContext = async (env, data) => {
  return {
    id: 1,
    username: "test",
  };
};

export default setupLive({
  getAuthContext,
  queries: {
    searchPosts,
  },
});
