<div align="center" >
  <h3>Realtime client for 
    <a href="https://unexpected.app" style="display: inline-flex; align-items: center; gap: 4px">
  Unexpected Cloud 
      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="currentColor" d="M12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5l1.53.11A2.98 2.98 0 0 1 22 15c0 1.65-1.35 3-3 3H6c-2.21 0-4-1.79-4-4c0-2.05 1.53-3.76 3.56-3.97l1.07-.11l.5-.95A5.469 5.469 0 0 1 12 6m0-2C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96A7.49 7.49 0 0 0 12 4"/></svg>
    </a> 
  </h3>
</div>

### What is realtime?
The real-time web is a network web using technologies and practices that enable users to receive information as soon as it is published by its authors, rather than requiring that they or their software check a source periodically for updates.

### How it works?
Unexpected Cloud offers the capability for the server to notify clients about changes. The platform creates a worker with a WebSocket server and establishes a WebSocket connection. To monitor changes to a specific entity within a single WebSocket connection, the platform utilizes channels. To notify the WebSocket server about changes, simply make an HTTP request and specify the relevant channels. Once the server is notified of a change in a channel, it will send a ping message to all clients subscribed to that channel.

## Getting Started
  1. Create project on [Unexpected Cloud](https://unexpected.app).
  2. Install NPM package.
```sh
npm i unexpected-realtime
```
  3. Import RealtimeClient and create connection.

The `projectId` can be found in the project menu in the **Details** tab or in the **Realtime** tab within the connection code snippet.
```typescript
import RealtimeClient from "unexpected-realtime";

// Instance declaration of RealtimeClient, creates a WebSocket connection.
const realtimeClient: RealtimeClient = new RealtimeClient(projectId);
```
### RealtimeClient
|Method|Description|Arguments|Result|
|:-|:-|:-|:-|
|`subscribe`| Subscribe to specific channel | `channelName: string, handler: () => void`  |`void`|
|`unsubscribe`| Unsubscribe from specific channel | `channelName: string, handler: () => void`  |`void`|

