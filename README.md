# Graphosaurus for MASS

This project is the WebSocket-driven 3D visualizer used by MASS graph simulations.
It receives graph and agent messages (nodes, edges, spawn/move/remove) and renders them in real time.

Use this document as the source of truth for running the visualizer with current MASS Graphosaurus integration.

## What This Supports

- Real-time graph updates from MASS over WebSocket
- Agent movement visualization (`spawn_agent`, `move_agent`, `remove_agent`)
- Incremental graph reveal (partial loading mode)
- Property graph metadata display (labels/properties on nodes and edges)
- Agent list/history synchronization via `agent_list`

## Prerequisites

- Node.js + npm
- MASS application built and runnable

## 1) Start Graphosaurus

From this directory:

```bash
npm install
npm run build
npm run server
```

Server defaults:

- HTTP: `http://localhost:8080`
- WebSocket: `ws://localhost:8080`
- Health check: `http://localhost:8080/health`

## 2) Open the Visualizer UI

Open:

- `viewer.html`

The viewer auto-connects to `ws://localhost:8080` and logs incoming messages.

## 3) Enable from MASS

You can enable visualization through system properties (recommended) or API calls.

### Option A: system properties (recommended)

Add JVM properties when starting MASS:

```text
-Dgraphosaurus.enabled=true
-Dgraphosaurus.websocket.url=ws://localhost:8080
-Dgraphosaurus.poll.interval=500
-Dgraphosaurus.partial.loading=false
```

### Option B: API calls in code

```java
graph.enableGraphosaurusVisualization("ws://localhost:8080", 500, false);
```

Disable at runtime:

```java
graph.disableGraphosaurusVisualization();
```

## Runtime Modes

### Full graph mode

- `graphosaurus.partial.loading=false`
- MASS sends complete graph structure, then agent updates.

### Partial loading mode

- `graphosaurus.partial.loading=true`
- MASS only sends nodes/edges as agents visit them.
- Best for very large graphs where full upfront transfer is expensive.

## Important Runtime Properties (MASS Side)

The following properties are read by the MASS listener integration:

- `graphosaurus.enabled` (default `false`)
- `graphosaurus.websocket.url` (default `ws://localhost:8080`)
- `graphosaurus.poll.interval` (default `500`)
- `graphosaurus.partial.loading` (default `false`)
- `graphosaurus.poll.global` (default `false`)
  - `false`: poll local places (lower overhead, recommended default)
  - `true`: poll full distributed graph every cycle
- `graphosaurus.queue.max` (default `20000`)
  - max buffered outbound messages before dropping oldest
- `graphosaurus.resync.on.reconnect` (default `true`)
  - resend graph/agent state after WebSocket reconnect
- `graphosaurus.sync.delay.ms` (default `1000`)
  - delay before reconnect resync starts

## Message Contract Used by MASS

The viewer handles these message types:

- `add_node`
- `add_edge`
- `spawn_agent`
- `move_agent`
- `remove_agent`
- `agent_list` (used by viewer side panel/state sync)

Representative payloads:

```json
{
  "type": "add_node",
  "id": "node-1",
  "color": 8947848,
  "position": [0.0, 0.0, 0.0],
  "data": { "name": "Node 1" }
}
```

```json
{
  "type": "add_edge",
  "fromNodeId": "node-1",
  "toNodeId": "node-2",
  "color": 13421772,
  "data": { "relationship": "KNOWS" }
}
```

```json
{
  "type": "spawn_agent",
  "nodeId": "node-1",
  "id": "agent-7",
  "color": 16776960,
  "shape": "sphere",
  "data": { "agentId": 7 }
}
```

```json
{
  "type": "move_agent",
  "agentId": "agent-7",
  "targetNodeId": "node-2",
  "speed": 1.0
}
```

```json
{
  "type": "remove_agent",
  "agentId": "agent-7"
}
```

```json
{
  "type": "agent_list",
  "agents": [
    {
      "id": "agent-7",
      "currentNode": "node-2",
      "color": 16776960,
      "visitHistory": ["node-1", "node-2"],
      "removed": false
    }
  ]
}
```

## Typical End-to-End Run

1. Start Graphosaurus server: `npm run server`
2. Open `viewer.html`
3. Start MASS with Graphosaurus enabled properties
4. Verify:
   - nodes/edges appear
   - agents spawn and move
   - list panel updates with agent history
5. Stop MASS or call `disableGraphosaurusVisualization()`

## Troubleshooting

- **Viewer stays empty**
  - Confirm MASS is started with `-Dgraphosaurus.enabled=true`
  - Check URL: `graphosaurus.websocket.url` must match server
  - Verify server health endpoint responds

- **Agents appear but graph structure is incomplete**
  - If partial mode is on, this is expected: only visited areas are shown
  - Turn off partial mode for full upfront graph

- **High message volume**
  - Increase `graphosaurus.queue.max`
  - Increase `graphosaurus.poll.interval`
  - Keep `graphosaurus.poll.global=false` unless you specifically need global polling

- **Reconnect happened and state looks stale**
  - Ensure `graphosaurus.resync.on.reconnect=true` (default)

## Related Files

- `viewer.html` - main visualizer UI
- `server.js` - WebSocket/HTTP message relay server
- `MESSAGE_API.md` - message API details
- `QUICKSTART.md` - setup guide
- `DEMO.md` - demo and integration guide
