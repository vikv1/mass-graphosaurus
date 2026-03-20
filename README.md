# Graphosaurus

WebSocket-driven 3D graph visualizer. Receives graph structure and agent messages over WebSocket and renders them in real time.

## Architecture

```
[Any Client] --WebSocket--> [server.js :8080] <--WebSocket--> [Browser viewer.html]
                                   |
                          Relays JSON messages
```

## Features

- On-demand graph building via `add_node` and `add_edge` messages
- Agent movement visualization: `spawn_agent`, `move_agent`, `remove_agent`
- Clickable nodes and edges with property popups
- Agent list panel with visit history tracking
- WebSocket and HTTP POST message ingestion

## Setup

```bash
npm install
npm run build
npm run server
```

Server defaults:

- HTTP: `http://localhost:8080`
- WebSocket: `ws://localhost:8080`
- Health check: `http://localhost:8080/health`

Open `viewer.html` in a browser. It auto-connects to `ws://localhost:8080`.

## Message Types

The viewer handles these message types (see [MESSAGE_API.md](MESSAGE_API.md) for full details):

- `add_node` -- add a vertex to the graph
- `add_edge` -- add an edge between two existing vertices
- `spawn_agent` -- spawn an agent at a node
- `move_agent` -- move an agent to a target node
- `remove_agent` -- remove an agent
- `agent_list` -- full sync of agent state (used by viewer side panel)

## Server API

### WebSocket

Connect to `ws://localhost:8080`. All messages are broadcast to every connected client.

### HTTP POST

`POST /message` with a JSON body:

```bash
curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"add_node","id":"n1","position":[0,0,0],"color":16711680}'
```

### Health Check

```bash
curl http://localhost:8080/health
# {"status":"ok","clients":1}
```

## Troubleshooting

- **Viewer stays empty** -- No messages have been received yet. Send `add_node` messages or connect a client that streams graph data.
- **Connection refused** -- Make sure the server is running: `npm run server`
- **Agents don't appear** -- The `nodeId` in `spawn_agent` must match an existing node's ID.

## Related Files

- `viewer.html` -- main visualizer UI
- `server.js` -- WebSocket/HTTP message relay server
- [MESSAGE_API.md](MESSAGE_API.md) -- message format reference
- [QUICKSTART.md](QUICKSTART.md) -- setup guide
- [DEMO.md](DEMO.md) -- testing guide
