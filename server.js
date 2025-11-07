#!/usr/bin/env node

/**
 * Simple Message Server for Graphosaurus Agent Demo
 * Supports both WebSocket and HTTP POST requests
 */

const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', clients: wss.clients.size }));
    return;
  }

  // POST endpoint to send messages
  if (req.method === 'POST' && req.url === '/message') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const message = JSON.parse(body);
        console.log('HTTP message received:', message);
        
        // Broadcast to all WebSocket clients
        broadcastMessage(message);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Message broadcasted',
          clients: wss.clients.size 
        }));
      } catch (error) {
        console.error('Error parsing message:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message 
        }));
      }
    });
    
    return;
  }

  // Default response
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Graphosaurus Message Server\n\nEndpoints:\n' +
          'POST /message - Send a message\n' +
          'GET  /health  - Health check\n' +
          'WS   /        - WebSocket connection\n');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected. Total clients:', wss.clients.size);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Graphosaurus Message Server',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('WebSocket message received:', message);
      
      // Broadcast to all clients (including sender)
      broadcastMessage(message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected. Total clients:', wss.clients.size);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function broadcastMessage(message) {
  const messageStr = JSON.stringify(message);
  let sentCount = 0;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
      sentCount++;
    }
  });
  
  console.log(`Broadcasted to ${sentCount} clients:`, message);
}

// Start server
server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('Graphosaurus Message Server Started');
  console.log('='.repeat(60));
  console.log(`HTTP Server:      http://localhost:${PORT}`);
  console.log(`WebSocket Server: ws://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('\nExample usage:');
  console.log('\n1. WebSocket (from browser):');
  console.log('   const ws = new WebSocket("ws://localhost:8080");');
  console.log('   ws.send(JSON.stringify({type: "spawn_agent", nodeId: "center"}));');
  console.log('\n2. HTTP POST (from terminal):');
  console.log('   curl -X POST http://localhost:8080/message \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"type":"spawn_agent","nodeId":"center","color":16711680}\'');
  console.log('\n3. Health Check:');
  console.log('   curl http://localhost:8080/health');
  console.log('\n' + '='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

