<div align="center" >
  <h3>Realtime client for 
    <a href="https://unexpected.app" style="display: inline-flex; align-items: center; gap: 4px">
  Unexpected Cloud 
      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="currentColor" d="M12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5l1.53.11A2.98 2.98 0 0 1 22 15c0 1.65-1.35 3-3 3H6c-2.21 0-4-1.79-4-4c0-2.05 1.53-3.76 3.56-3.97l1.07-.11l.5-.95A5.469 5.469 0 0 1 12 6m0-2C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96A7.49 7.49 0 0 0 12 4"/></svg>
    </a> 
  </h3>
</div>

### What is real-time?

**Real-time** this is the approach that refers to the ability of a system to process data and provide responses instantaneously as events occur. Real-time web applications allow users to receive updated information without needing to refresh the page or use polling(periodically data refetching).

### How it works?

Unexpected Cloud offers the capability for the server to notify clients about changes. The platform creates a worker with a WebSocket server and establishes a WebSocket connection. To monitor changes to a specific entity within a single WebSocket connection, the platform utilizes channels. To notify the WebSocket server about changes, simply make an HTTP request and specify the relevant channels. Once the server is notified of a change in a channel, it will send a ping message to all clients subscribed to that channel.

## Getting Started

Create project on [Unexpected Cloud](https://unexpected.app) and install NPM package.

```sh
npm i unexpected-realtime
```

`projectId` can be found in the project menu in the **Details** tab or in the **Realtime** tab within the connection code snippet.

## Pings
### Server 
Ping the client from the server using POST request with Fetch API or with Unexpected Cloud Custom Worker.

`secretKey` can be found in the project menu in the **Details** tab or in the **Realtime** tab within the connection code snippet.
```js
// env.REALTIME_WORKER.fetch for Custom Workers
fetch(
  `https://unexpected-realtime-${projectId}.lunaxodd.workers.dev/ping`,
  {
    method: 'POST',
    body: JSON.stringify({
      secret: secretKey,
      channels: ['channel']
    })
  }
);
```
### Client
Pings API allows to notify clients about changes.
```js
import PingsClient from "unexpected-realtime/pings";

// Instance declaration of PingsClient, creates connection to realtime server.
const pingsClient = new PingsClient(projectId);
```

### RealtimeClient

| Method        | Description                       | Arguments              |
| :------------ | :-------------------------------- | :--------------------- |
| `subscribe`   | Subscribe to specific channel     | `channelName, handler` |
| `unsubscribe` | Unsubscribe from specific channel | `channelName`          |

## Live Query
Live Query API allows clients to retrieve data from the server securely when it changes.

### Server

```js
import { createQuery, setupLive } from "unexpected-realtime/live-query/server";

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
```
#### `createQuery` arguments:
1. `qb` (Query builder) builds the query.
2. `auth` (Auth context) contains the data returned from the getAuthContext function. Allows to filter data for specific users in query builder.
3. `params` (Query parameters) includes essential information such as order and limit. It can also contain custom parameters specific to your query needs.

#### Deployment
1. Install unexpected-cli-sandbox: 
```sh
npm i -g unexpected-cli-sandbox
```
2. Create table trigger for `posts` table:
```sh
unexpected-cli-sandbox set-trigger --table posts
```
3. Deploy Live Query Worker:
```sh
unexpected-cli-sandbox deploy-live-query
```


### Client

```js
import LiveQueryClient from "unexpected-realtime/live-query/client";

// Instance declaration of LiveQueryClient, creates connection to live server.
const liveQueryClient = new LiveQueryClient(projectId);
```
**LiveQueryClient**

| Method        | Description                        | Arguments           |
| :------------ | :--------------------------------- | :------------------ |
| `subscribe`   | Subscribe to specific query        | `queryName, params` |
| `unsubscribe` | Unsubscribe from specific query    | `queryName`         |
| `next`        | Fetches the next page of the query | `queryName`         |
