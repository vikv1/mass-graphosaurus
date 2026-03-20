# Quick Start

## 1. Install and Build

```bash
npm install
npm run build
```

## 2. Start the Server

```bash
npm run server
```

Server listens on `ws://localhost:8080` (WebSocket) and `http://localhost:8080` (HTTP).

## 3. Open the Viewer

Open `viewer.html` in a browser. It auto-connects to the WebSocket server and waits for data.

## 4. Send Some Messages

With the server running, try sending messages via HTTP to see the viewer in action:

```bash
# Add nodes
curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"add_node","id":"n1","position":[0,0,0],"color":16711680}'

curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"add_node","id":"n2","position":[2,1,0],"color":65280}'

# Add an edge
curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"add_edge","fromNodeId":"n1","toNodeId":"n2"}'

# Spawn an agent and move it
curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"spawn_agent","nodeId":"n1","id":"a1","color":16776960}'

curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"move_agent","agentId":"a1","targetNodeId":"n2","speed":1.0}'
```

Or use the test scripts:

```bash
# Windows
test-messages.bat

# Unix/Mac
./test-messages.sh
```

## Documentation

- [README.md](README.md) -- Overview and server API
- [MESSAGE_API.md](MESSAGE_API.md) -- Complete message format reference
- [DEMO.md](DEMO.md) -- Testing guide

## Troubleshooting

**WebSocket won't connect:** Make sure the server is running (`npm run server`) and port 8080 is free.

**Nothing appears:** The viewer starts empty. Send `add_node` messages to build the graph.

**Build fails:** Delete `node_modules` and run `npm install` again.
