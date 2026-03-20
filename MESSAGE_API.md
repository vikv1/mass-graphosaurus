# Message API

Messages are JSON objects with a `type` field that determines how they are handled. Messages arrive over WebSocket from the relay server (`server.js`) or can be sent directly via `graph.handleMessage(msg)` in JavaScript.

## Built-in Message Types

### 1. Add Node

Adds a vertex to the graph. If a node with the same ID already exists, the message is ignored.

```json
{
  "type": "add_node",
  "id": "vertex-123",
  "color": 8947848,
  "position": [0.5, -1.2, 0.8],
  "data": { "vertexId": 123 }
}
```

**Fields:**
- `id` or `nodeId` (optional) - Unique identifier for the node
- `color` (optional) - Hex color as integer (default: `0x888888`)
- `position` (optional) - `[x, y, z]` array; if omitted, a random position is generated
- `radius` (optional) - Radius for random position generation (default: `10`)
- `data` (optional) - Custom metadata object stored on `node.data`

### 2. Add Edge

Adds an edge between two existing nodes. Both nodes must already exist in the graph.

```json
{
  "type": "add_edge",
  "fromNodeId": "vertex-123",
  "toNodeId": "vertex-456",
  "color": 13421772,
  "data": { "relationship": "KNOWS" }
}
```

**Fields:**
- `fromNodeId` or `from_node_id` (required) - ID of the source node
- `toNodeId` or `to_node_id` (required) - ID of the target node
- `color` (optional) - Hex color as integer (default: `0xCCCCCC`)
- `data` (optional) - Custom metadata object stored on `edge.data`

### 3. Spawn Agent

Spawns a new agent at a specified node.

```json
{
  "type": "spawn_agent",
  "nodeId": "vertex-123",
  "id": "agent-456",
  "color": 16711680,
  "shape": "sphere",
  "data": { "agentId": 456 }
}
```

**Fields:**
- `nodeId` or `node_id` (required) - ID of start node
- `id` or `agentId` (optional) - Unique agent ID for later reference
- `color` (optional) - Hex color as integer (default: `0xFFFF00`)
- `size` (optional) - Size of agent marker (default: `20`)
- `shape` (optional) - `"sphere"`, `"cube"`, or `"cone"` (default: `"sphere"`)
- `targetNodeId` or `target_node_id` (optional) - Auto-move to this node after spawning
- `speed` (optional) - Movement speed (default: `1.0`)
- `data` (optional) - Custom metadata object

### 4. Move Agent

Moves an existing agent to a target node.

```json
{
  "type": "move_agent",
  "agentId": "agent-456",
  "targetNodeId": "vertex-789",
  "speed": 1.0
}
```

**Fields:**
- `agentId`, `agent_id`, or `id` (required) - ID of agent to move
- `targetNodeId` or `target_node_id` (required) - Target node ID
- `speed` (optional) - Movement speed (default: `1.0`)

### 5. Remove Agent

Removes an agent from the graph.

```json
{
  "type": "remove_agent",
  "agentId": "agent-456"
}
```

**Fields:**
- `agentId`, `agent_id`, or `id` (required) - ID of agent to remove

### 6. Agent List

Full sync of agent state. Used by the viewer side panel to display agent history. This message type is handled by `viewer.html` only (not by the graph library).

```json
{
  "type": "agent_list",
  "agents": [
    {
      "id": "agent-456",
      "currentNode": "vertex-789",
      "color": 16776960,
      "visitHistory": ["vertex-123", "vertex-789"],
      "removed": false
    }
  ]
}
```

## Custom Message Handlers

Register your own message handlers for custom events:

```javascript
graph.onMessage('custom_event', function(message) {
  console.log('Received custom event:', message);
});

graph.handleMessage({
  type: 'custom_event',
  data: { foo: 'bar' }
});

graph.offMessage('custom_event', handlerFunction);
```

## API Reference

### `graph.handleMessage(message)`

Process a message and trigger appropriate handlers.

**Parameters:**
- `message` (Object) - Message object with `type` property

**Returns:** Graph instance (chainable)

### `graph.onMessage(messageType, handler)`

Register a custom message handler.

**Parameters:**
- `messageType` (String) - Type of message to handle
- `handler` (Function) - Callback function `function(message) {}`

**Returns:** Graph instance (chainable)

### `graph.offMessage(messageType, handler)`

Remove a registered message handler.

**Parameters:**
- `messageType` (String) - Type of message
- `handler` (Function) - Handler function to remove

**Returns:** Graph instance (chainable)

## Color Reference

- Red: `16711680` (0xFF0000)
- Green: `65280` (0x00FF00)
- Blue: `255` (0x0000FF)
- Yellow: `16776960` (0xFFFF00)
- Magenta: `16711935` (0xFF00FF)
- Cyan: `65535` (0x00FFFF)

## Message Format Notes

- **Always include `type`** - Required for message routing
- **Both snake_case and camelCase are supported** for field names (e.g. `nodeId` or `node_id`)
- **Invalid messages are silently ignored** - missing required fields won't cause errors
- **`data` fields are stored as-is** on the node/edge/agent and accessible in the viewer popups
