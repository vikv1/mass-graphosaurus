@echo off
REM Test script for sending messages to Graphosaurus via HTTP (Windows)
REM Usage: test-messages.bat [server_url]

if "%1"=="" (
    set SERVER_URL=http://localhost:8080
) else (
    set SERVER_URL=%1
)

echo ==========================================
echo Graphosaurus Message Test Script
echo Server: %SERVER_URL%
echo ==========================================
echo.

echo 1. Health Check
curl -s "%SERVER_URL%/health"
echo.
echo.

timeout /t 1 /nobreak >nul

echo 2. Spawn Red Agent at Center
curl -X POST "%SERVER_URL%/message" -H "Content-Type: application/json" -d "{\"type\":\"spawn_agent\",\"nodeId\":\"center\",\"id\":\"agent-red\",\"color\":16711680,\"shape\":\"sphere\",\"data\":{\"name\":\"Red Agent\"}}"
echo.
echo.

timeout /t 1 /nobreak >nul

echo 3. Spawn Green Agent at Node 0
curl -X POST "%SERVER_URL%/message" -H "Content-Type: application/json" -d "{\"type\":\"spawn_agent\",\"nodeId\":\"node-0\",\"id\":\"agent-green\",\"color\":65280,\"shape\":\"cube\",\"data\":{\"name\":\"Green Agent\"}}"
echo.
echo.

timeout /t 1 /nobreak >nul

echo 4. Move Red Agent to Node 1
curl -X POST "%SERVER_URL%/message" -H "Content-Type: application/json" -d "{\"type\":\"move_agent\",\"agentId\":\"agent-red\",\"targetNodeId\":\"node-1\",\"speed\":1.5}"
echo.
echo.

timeout /t 2 /nobreak >nul

echo 5. Spawn Blue Cone Agent with Auto-Move
curl -X POST "%SERVER_URL%/message" -H "Content-Type: application/json" -d "{\"type\":\"spawn_agent\",\"nodeId\":\"center\",\"id\":\"agent-blue\",\"color\":255,\"shape\":\"cone\",\"targetNodeId\":\"node-3\",\"speed\":2.0,\"data\":{\"name\":\"Fast Blue Agent\"}}"
echo.
echo.

timeout /t 3 /nobreak >nul

echo 6. Remove Green Agent
curl -X POST "%SERVER_URL%/message" -H "Content-Type: application/json" -d "{\"type\":\"remove_agent\",\"agentId\":\"agent-green\"}"
echo.
echo.

echo ==========================================
echo Test Complete!
echo ==========================================

