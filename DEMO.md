# Graphosaurus Demo Guide

Complete guide to running the interactive agent visualization demos with WebSocket and HTTP message support.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Message Server

```bash
npm run server
```

The server will start on http://localhost:8080 with both WebSocket and HTTP endpoints.

### 3. Open the Demo

Open `message-demo.html` in your browser and click "Connect" to connect to the WebSocket server.

## Demo Files

- **`message-demo.html`** - Full-featured demo with WebSocket, HTTP, and manual controls
- **`agent-demo.html`** - Interactive agent spawning with buttons
- **`demo.html`** - Basic clickable nodes and edges

## Server API

### WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'spawn_agent',
    nodeId: 'center',
    color: 0xFF0000
  }));
};

ws.onmessage = (event) => {
  console.log('Received:', event.data);
};
```

### HTTP POST Endpoint

**Endpoint:** `POST /message`

**Example using curl:**

```bash
curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"spawn_agent","nodeId":"center","color":16711680}'
```

**Example using PowerShell:**

```powershell
$body = @{
    type = "spawn_agent"
    nodeId = "center"
    color = 16711680
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8080/message -Method Post -Body $body -ContentType "application/json"
```

**Example using fetch (JavaScript):**

```javascript
fetch('http://localhost:8080/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'spawn_agent',
    nodeId: 'center',
    color: 0xFF0000
  })
});
```

### Health Check

**Endpoint:** `GET /health`

```bash
curl http://localhost:8080/health
```

**Response:**
```json
{
  "status": "ok",
  "clients": 2
}
```

## Message Types

### Spawn Agent

Creates a new agent at a specified node.

```json
{
  "type": "spawn_agent",
  "nodeId": "center",
  "id": "agent-1",
  "color": 16711680,
  "shape": "sphere",
  "size": 20,
  "targetNodeId": "node-1",
  "speed": 1.5,
  "data": {
    "name": "My Agent",
    "custom": "metadata"
  }
}
```

**Fields:**
- `nodeId` (required) - ID of start node
- `id` (optional) - Unique agent ID for later reference
- `color` (optional) - Hex color (e.g., 0xFF0000 for red)
- `shape` (optional) - "sphere", "cube", or "cone" (default: "sphere")
- `size` (optional) - Size of agent (default: 20)
- `targetNodeId` (optional) - Auto-move to this node
- `speed` (optional) - Movement speed (default: 1.0)
- `data` (optional) - Custom metadata object

**Color Reference:**
- Red: `16711680` (0xFF0000)
- Green: `65280` (0x00FF00)
- Blue: `255` (0x0000FF)
- Yellow: `16776960` (0xFFFF00)
- Magenta: `16711935` (0xFF00FF)
- Cyan: `65535` (0x00FFFF)

### Move Agent

Moves an existing agent to a target node.

```json
{
  "type": "move_agent",
  "agentId": "agent-1",
  "targetNodeId": "node-3",
  "speed": 2.0
}
```

**Fields:**
- `agentId` (required) - ID of agent to move
- `targetNodeId` (required) - Target node ID
- `speed` (optional) - Movement speed (default: 1.0)

### Remove Agent

Removes an agent from the graph.

```json
{
  "type": "remove_agent",
  "agentId": "agent-1"
}
```

**Fields:**
- `agentId` (required) - ID of agent to remove

## Testing

### Automated Tests

**Linux/Mac:**
```bash
chmod +x test-messages.sh
./test-messages.sh
```

**Windows:**
```batch
test-messages.bat
```

### Manual Testing

#### Using curl (Cross-platform)

```bash
# Spawn agent
curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"spawn_agent","nodeId":"center","id":"test-1","color":16711680}'

# Move agent
curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"move_agent","agentId":"test-1","targetNodeId":"node-0","speed":1.5}'

# Remove agent
curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"remove_agent","agentId":"test-1"}'
```

#### Using PowerShell (Windows)

```powershell
# Spawn agent
$body = @{type="spawn_agent"; nodeId="center"; id="test-1"; color=16711680} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8080/message -Method Post -Body $body -ContentType "application/json"

# Move agent
$body = @{type="move_agent"; agentId="test-1"; targetNodeId="node-0"; speed=1.5} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8080/message -Method Post -Body $body -ContentType "application/json"

# Remove agent
$body = @{type="remove_agent"; agentId="test-1"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8080/message -Method Post -Body $body -ContentType "application/json"
```

## Integration Examples

### Python Example

```python
import requests
import json

SERVER = "http://localhost:8080"

def spawn_agent(node_id, agent_id, color=0xFF0000):
    message = {
        "type": "spawn_agent",
        "nodeId": node_id,
        "id": agent_id,
        "color": color
    }
    response = requests.post(f"{SERVER}/message", json=message)
    return response.json()

# Usage
result = spawn_agent("center", "python-agent-1", 0x00FF00)
print(result)
```

### Node.js Example

```javascript
const axios = require('axios');

const SERVER = 'http://localhost:8080';

async function spawnAgent(nodeId, agentId, color = 0xFF0000) {
  const message = {
    type: 'spawn_agent',
    nodeId,
    id: agentId,
    color
  };
  
  const response = await axios.post(`${SERVER}/message`, message);
  return response.data;
}

// Usage
spawnAgent('center', 'nodejs-agent-1', 0x0000FF)
  .then(result => console.log(result));
```

### WebSocket Client (Node.js)

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected');
  
  // Send message
  ws.send(JSON.stringify({
    type: 'spawn_agent',
    nodeId: 'center',
    color: 0xFF0000
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received:', message);
});
```

## Available Node IDs

The demo graph has the following node IDs available:
- `center` - Central hub (red)
- `node-0` through `node-7` - Ring nodes (various colors)

## Troubleshooting

### Server Won't Start

**Error:** `EADDRINUSE`
```
Solution: Port 8080 is already in use. Stop the other process or use a different port:
PORT=8081 npm run server
```

### Connection Refused

**Error:** WebSocket connection failed
```
Solution: Make sure the server is running:
npm run server
```

### CORS Errors

The server has CORS enabled by default. If you still see CORS errors, make sure you're:
1. Running the server
2. Accessing the demo from a file:// or http:// URL (not chrome-extension://)

### Messages Not Appearing

1. Check the browser console for errors
2. Verify the server is receiving messages (check server console output)
3. Make sure you're using valid node IDs
4. Check the Message Log in the demo interface

## Performance Tips

1. **Limit concurrent agents** - The visualization performs best with <50 agents
2. **Use appropriate speeds** - Speed values between 0.5 and 2.0 work best
3. **Clean up agents** - Remove agents when they're no longer needed
4. **Batch messages** - If sending many messages, space them out slightly

## Next Steps

- Read `MESSAGE_API.md` for complete API documentation
- Check `examples/` directory for more demos
- Integrate with your graph database (Neo4j, ArangoDB, etc.)
- Build custom simulations for your use case

## Support

For issues or questions:
1. Check the documentation in `MESSAGE_API.md`
2. Review the example demos
3. Check server console output for errors
4. Open an issue on GitHub

