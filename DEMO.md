# Testing Guide

## Setup

```bash
npm install
npm run build
npm run server
```

Open `viewer.html` in a browser. It auto-connects to `ws://localhost:8080`.

## Server Endpoints

### WebSocket

Connect to `ws://localhost:8080`. All messages are broadcast to every connected client.

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'add_node',
    id: 'n1',
    position: [0, 0, 0],
    color: 0xFF0000
  }));
};

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
```

### HTTP POST

`POST /message` with a JSON body.

```bash
curl -X POST http://localhost:8080/message \
  -H "Content-Type: application/json" \
  -d '{"type":"add_node","id":"n1","position":[0,0,0],"color":16711680}'
```

PowerShell:

```powershell
$body = @{type="add_node"; id="n1"; position=@(0,0,0); color=16711680} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8080/message -Method Post -Body $body -ContentType "application/json"
```

### Health Check

```bash
curl http://localhost:8080/health
```

```json
{ "status": "ok", "clients": 2 }
```

## Test Scripts

Automated scripts that send a sequence of agent messages:

**Windows:**
```bash
test-messages.bat
```

**Unix/Mac:**
```bash
chmod +x test-messages.sh
./test-messages.sh
```

These scripts assume the graph already has nodes (e.g. from a connected client streaming data).

## Message Reference

See [MESSAGE_API.md](MESSAGE_API.md) for the complete list of message types, fields, and alternative key names.

## Performance Tips

- The visualization performs best with fewer than 50 concurrent agents
- Speed values between 0.5 and 2.0 work well for visual clarity
- Remove agents when they are no longer needed
