# Message-Driven Agent Control API

Graphosaurus now supports message-driven agent control, allowing you to spawn and control agents from any external source: WebSockets, REST APIs, message queues, or manual triggers.

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

### REST API Polling

```javascript
function pollAgentMessages() {
  fetch('https://api.example.com/graph/messages')
    .then(response => response.json())
    .then(messages => {
      messages.forEach(msg => graph.handleMessage(msg));
    });
}

setInterval(pollAgentMessages, 5000); // Poll every 5 seconds
```

### Server-Sent Events (SSE)

```javascript
var eventSource = new EventSource('https://api.example.com/events');

eventSource.onmessage = function(event) {
  var message = JSON.parse(event.data);
  graph.handleMessage(message);
};
```

### Message Queue (e.g., MQTT)

```javascript
var client = mqtt.connect('mqtt://broker.example.com');

client.on('message', function(topic, payload) {
  var message = JSON.parse(payload.toString());
  graph.handleMessage(message);
});

client.subscribe('graph/agents/#');
```

### Graph Database Change Streams

Monitor Neo4j, ArangoDB, or other graph databases and spawn agents based on changes:

```javascript
// Neo4j example
session.run('MATCH (n:Query) WHERE n.timestamp > $lastCheck RETURN n')
  .then(result => {
    result.records.forEach(record => {
      var query = record.get('n');
      
      graph.handleMessage({
        type: 'spawn_agent',
        nodeId: query.properties.startNode,
        id: query.properties.queryId,
        color: 0x00FF00,
        shape: 'cone',
        data: {
          query: query.properties.cypherQuery,
          timestamp: query.properties.timestamp
        }
      });
    });
  });
```

## Advanced Usage

### Sequential Agent Movements

Create a path for an agent to follow:

```javascript
function moveAlongPath(agentId, path, index) {
  if (index >= path.length) return;
  
  graph.handleMessage({
    type: 'move_agent',
    agentId: agentId,
    targetNodeId: path[index],
    speed: 1.0
  });
  
  setTimeout(() => moveAlongPath(agentId, path, index + 1), 1500);
}

// Spawn and move along path
graph.handleMessage({
  type: 'spawn_agent',
  nodeId: 'start',
  id: 'path-agent',
  color: 0xFF00FF
});

moveAlongPath('path-agent', ['node-1', 'node-2', 'node-3', 'end'], 0);
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

### Conditional Agent Spawning

```javascript
graph.onMessage('data_flow', function(message) {
  // Only spawn if threshold is met
  if (message.data.load > 0.8) {
    graph.handleMessage({
      type: 'spawn_agent',
      nodeId: message.data.sourceNode,
      targetNodeId: message.data.targetNode,
      color: 0xFF0000, // Red for high load
      data: { load: message.data.load }
    });
  }
});
```

## Message Format Best Practices

1. **Always include `type`** - Required for message routing
2. **Use consistent ID formats** - Makes tracking easier
3. **Include metadata in `data`** - Store context about the agent
4. **Handle errors gracefully** - Invalid messages are silently ignored
5. **Use snake_case or camelCase** - Both are supported

## Real-World Use Cases

### 1. Graph Database Query Visualization

```javascript
// Visualize Cypher query execution
ws.onmessage = function(event) {
  var queryEvent = JSON.parse(event.data);
  
  graph.handleMessage({
    type: 'spawn_agent',
    nodeId: queryEvent.startNode,
    id: queryEvent.queryId,
    color: 0x00FF00,
    shape: 'cone',
    data: {
      query: queryEvent.cypherQuery,
      user: queryEvent.userId
    }
  });
  
  // Move through query execution path
  queryEvent.executionPath.forEach((nodeId, index) => {
    setTimeout(() => {
      graph.handleMessage({
        type: 'move_agent',
        agentId: queryEvent.queryId,
        targetNodeId: nodeId,
        speed: 1.2
      });
    }, index * 1000);
  });
};
```

### 2. Network Traffic Visualization

```javascript
// Monitor network packets
setInterval(() => {
  fetch('/api/network/packets')
    .then(r => r.json())
    .then(packets => {
      packets.forEach(packet => {
        graph.handleMessage({
          type: 'spawn_agent',
          nodeId: packet.source,
          targetNodeId: packet.destination,
          id: packet.id,
          color: packet.protocol === 'HTTP' ? 0x00FF00 : 0xFF0000,
          size: Math.min(packet.size / 100, 30),
          speed: 2.0,
          data: {
            protocol: packet.protocol,
            size: packet.size
          }
        });
      });
    });
}, 1000);
```

### 3. Distributed System Monitoring

```javascript
// Track requests through microservices
mqtt.on('message', (topic, payload) => {
  var event = JSON.parse(payload);
  
  if (event.type === 'request_start') {
    graph.handleMessage({
      type: 'spawn_agent',
      nodeId: event.service,
      id: event.requestId,
      color: 0x2196F3,
      shape: 'sphere'
    });
  } else if (event.type === 'request_forward') {
    graph.handleMessage({
      type: 'move_agent',
      agentId: event.requestId,
      targetNodeId: event.nextService,
      speed: 1.5
    });
  } else if (event.type === 'request_complete') {
    setTimeout(() => {
      graph.handleMessage({
        type: 'remove_agent',
        agentId: event.requestId
      });
    }, 2000);
  }
});
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

## Demo Files

- `message-demo.html` - Full-featured demo with WebSocket support
- `agent-demo.html` - Interactive agent movement demo
- `demo.html` - Basic clickable nodes/edges demo

## See Also

- [Agent API Documentation](./AGENT_API.md)
- [Graph API Documentation](./doc/Graph.html)
- [Node API Documentation](./doc/Node.html)

