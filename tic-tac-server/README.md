# Tic-Tac-Server Backend

Node.js + Express + Socket.IO backend for the Tic-Tac-Toe game with video calling signaling.

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Features

- Real-time game state management
- Socket.IO for multiplayer communication
- WebRTC signaling for video calls
- Game logic with winner detection
- CORS enabled for frontend connection

## API Endpoints

- `GET /` - Server status and current game state
- `GET /status` - Detailed server information

## Socket Events

### Game Events
- `makeMove` - Player makes a move
- `restartGame` - Restart the game
- `gameState` - Broadcast current game state

### Video Call Events
- `callUser` - Initiate a call
- `answerCall` - Answer incoming call
- `endCall` - End active call

## Dependencies

- Express.js
- Socket.IO
- CORS
- UUID

## Usage

This server handles both game logic and video call signaling. Connect your React frontend to this server for full functionality.