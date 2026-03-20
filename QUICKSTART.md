# Graphosaurus Quick Start Guide

WebSocket-driven 3D graph visualizer for MASS agent simulations.

## Setup

### 1. Install

```bash
npm install
```

### 2. Build

```bash
npm run build
```

This generates `dist/graphosaurus.js`.

### 3. Start the Message Server

```bash
npm run server
```

The server starts on `http://localhost:8080` with WebSocket support.

### 4. Open the Viewer

Open `viewer.html` in your browser. It auto-connects to `ws://localhost:8080` and waits for graph data.

## Usage

### Send Messages from the UI

Use the built-in UI to send messages:

1. **Spawn Agent**: Creates an agent at a node
2. **Move Agent**: Moves an agent to another node  
3. **Remove Agent**: Removes an agent

### Send Messages via HTTP

```bash
# Spawn an agent
curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"spawn_agent","nodeId":"center","id":"agent-1","color":16711680}'

# Move an agent
curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"move_agent","agentId":"agent-1","targetNodeId":"node-1","speed":1.5}'

# Remove an agent
curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"remove_agent","agentId":"agent-1"}'
```

### Send Messages via WebSocket

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  // Spawn agent
  ws.send(JSON.stringify({
    type: 'spawn_agent',
    nodeId: 'center',
    id: 'agent-1',
    color: 0xFF0000,
    shape: 'sphere'
  }));
  
  // Move agent after 2 seconds
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'move_agent',
      agentId: 'agent-1',
      targetNodeId: 'node-1',
      speed: 1.5
    }));
  }, 2000);
};
```

## Message Types

### Spawn Agent
```json
{
  "type": "spawn_agent",
  "nodeId": "center",
  "id": "agent-1",
  "color": 16711680,
  "shape": "sphere",
  "targetNodeId": "node-1",
  "speed": 1.5
}
```

### Move Agent
```json
{
  "type": "move_agent",
  "agentId": "agent-1",
  "targetNodeId": "node-2",
  "speed": 1.2
}
```

### Remove Agent
```json
{
  "type": "remove_agent",
  "agentId": "agent-1"
}
```

## Documentation

- [MESSAGE_API.md](MESSAGE_API.md) - Complete message format documentation
- [DEMO.md](DEMO.md) - Detailed demo and integration guide

## Testing with Scripts

Windows:
```bash
test-messages.bat
```

Unix/Linux/Mac:
```bash
./test-messages.sh
```

These scripts send example messages to the server for testing.

## Troubleshooting

**WebSocket won't connect:**
- Make sure the server is running: `npm run server`
- Check the port isn't in use: default is 8080
- Check browser console for errors

**Agents don't appear:**
- Ensure nodeId matches an existing node in your graph
- Check the message format is valid JSON
- Look at the Message Log in the viewer UI

**Build fails:**
- Make sure Node.js and npm are installed
- Try deleting `node_modules` and running `npm install` again