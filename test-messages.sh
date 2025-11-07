#!/bin/bash

# Test script for sending messages to Graphosaurus via HTTP
# Usage: ./test-messages.sh [server_url]

SERVER_URL=${1:-http://localhost:8080}

echo "=========================================="
echo "Graphosaurus Message Test Script"
echo "Server: $SERVER_URL"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Health Check${NC}"
curl -s "$SERVER_URL/health" | jq '.'
echo ""
echo ""

echo -e "${BLUE}2. Spawn Red Agent at Center${NC}"
curl -X POST "$SERVER_URL/message" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "spawn_agent",
    "nodeId": "center",
    "id": "agent-red",
    "color": 16711680,
    "shape": "sphere",
    "data": {"name": "Red Agent"}
  }' | jq '.'
echo ""
echo ""

sleep 1

echo -e "${BLUE}3. Spawn Green Agent at Node 0${NC}"
curl -X POST "$SERVER_URL/message" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "spawn_agent",
    "nodeId": "node-0",
    "id": "agent-green",
    "color": 65280,
    "shape": "cube",
    "data": {"name": "Green Agent"}
  }' | jq '.'
echo ""
echo ""

sleep 1

echo -e "${BLUE}4. Move Red Agent to Node 1${NC}"
curl -X POST "$SERVER_URL/message" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "move_agent",
    "agentId": "agent-red",
    "targetNodeId": "node-1",
    "speed": 1.5
  }' | jq '.'
echo ""
echo ""

sleep 2

echo -e "${BLUE}5. Spawn Blue Cone Agent with Auto-Move${NC}"
curl -X POST "$SERVER_URL/message" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "spawn_agent",
    "nodeId": "center",
    "id": "agent-blue",
    "color": 255,
    "shape": "cone",
    "targetNodeId": "node-3",
    "speed": 2.0,
    "data": {"name": "Fast Blue Agent"}
  }' | jq '.'
echo ""
echo ""

sleep 3

echo -e "${BLUE}6. Remove Green Agent${NC}"
curl -X POST "$SERVER_URL/message" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "remove_agent",
    "agentId": "agent-green"
  }' | jq '.'
echo ""
echo ""

echo -e "${GREEN}=========================================="
echo "Test Complete!"
echo "==========================================${NC}"

