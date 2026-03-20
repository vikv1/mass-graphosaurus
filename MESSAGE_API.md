# Message-Driven Agent Control API

Graphosaurus now supports message-driven agent control, allowing you to spawn and control agents from WebSockets.

## Quick Start

```javascript
// Initialize graph with message handlers
var graph = G.graph({
  antialias: true,
  bgColor: 0xffffff
});

// Send a message to spawn an agent
graph.handleMessage({
  type: 'spawn_agent',
  nodeId: 'center',
  id: 'agent-1',
  color: 0xFF0000,
  shape: 'sphere',
  data: { name: 'My Agent' }
});
```

## Built-in Message Types

### 1. Spawn Agent

Spawns a new agent at a specified node.

```javascript
{
  type: 'spawn_agent',
  nodeId: 'node-123',          // ID of start node (required)
  id: 'agent-1',               // Agent ID for later reference (optional)
  color: 0xFF0000,             // Color (hex) (optional, default: 0xFFFF00)
  size: 20,                    // Size (optional, default: 20)
  shape: 'sphere',             // 'sphere', 'cube', or 'cone' (optional, default: 'sphere')
  targetNodeId: 'node-456',    // Auto-move to this node (optional)
  speed: 1.5,                  // Movement speed (optional, default: 1.0)
  data: {                      // Custom data (optional)
    name: 'Query Agent',
    type: 'CypherQuery'
  }
}
```

**Alternative key names supported:**
- `node_id` instead of `nodeId`
- `target_node_id` instead of `targetNodeId`
- `agentId` instead of `id`

### 2. Move Agent

Moves an existing agent to a target node.

```javascript
{
  type: 'move_agent',
  agentId: 'agent-1',          // ID of agent to move (required)
  targetNodeId: 'node-789',    // Target node ID (required)
  speed: 1.2                   // Movement speed (optional, default: 1.0)
}
```

**Alternative key names:**
- `agent_id` or `id` instead of `agentId`
- `target_node_id` instead of `targetNodeId`

### 3. Remove Agent

Removes an agent from the graph.

```javascript
{
  type: 'remove_agent',
  agentId: 'agent-1'           // ID of agent to remove (required)
}
```

**Alternative key names:**
- `agent_id` or `id` instead of `agentId`

## Custom Message Handlers

Register your own message handlers for custom events:

```javascript
// Register a custom handler
graph.onMessage('custom_event', function(message) {
  console.log('Received custom event:', message);
  // Handle your custom logic here
});

// Send a custom message
graph.handleMessage({
  type: 'custom_event',
  data: { foo: 'bar' }
});

// Remove a handler
graph.offMessage('custom_event', handlerFunction);
```

## Integration Examples

### WebSocket Integration

```javascript
var ws = new WebSocket('ws://localhost:8080');

ws.onmessage = function(event) {
  var message = JSON.parse(event.data);
  graph.handleMessage(message);
};

// Server sends:
// {"type": "spawn_agent", "nodeId": "user-123", "color": 0x00FF00}
```

### Batch Message Processing

```javascript
var messageBatch = [
  { type: 'spawn_agent', nodeId: 'n1', id: 'a1', color: 0xFF0000 },
  { type: 'spawn_agent', nodeId: 'n2', id: 'a2', color: 0x00FF00 },
  { type: 'spawn_agent', nodeId: 'n3', id: 'a3', color: 0x0000FF }
];

messageBatch.forEach(msg => graph.handleMessage(msg));
```

## Message Format Best Practices

1. **Always include `type`** - Required for message routing
2. **Use consistent ID formats** - Makes tracking easier
3. **Include metadata in `data`** - Store context about the agent
4. **Handle errors gracefully** - Invalid messages are silently ignored
5. **Use snake_case or camelCase** - Both are supported

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

## Demo

- `viewer.html` - WebSocket-driven visualizer with message controls and agent tracking
