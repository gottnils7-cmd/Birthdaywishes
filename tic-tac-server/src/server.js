const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Game state management
let gameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
  gameEnded: false
};

// Connected users for video calling
const users = {};

// Game logic functions
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  
  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every(cell => cell !== null);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Assign unique ID to user
  users[socket.id] = socket.id;
  socket.emit('me', socket.id);
  
  // Send current game state to new user
  socket.emit('gameState', gameState);

  // Handle game moves
  socket.on('makeMove', (data) => {
    const { board, index, player } = data;
    
    // Validate move
    if (gameState.board[index] || gameState.gameEnded || gameState.currentPlayer !== player) {
      return;
    }
    
    // Update game state
    gameState.board[index] = player;
    gameState.winner = calculateWinner(gameState.board);
    gameState.gameEnded = gameState.winner !== null || isBoardFull(gameState.board);
    
    if (!gameState.gameEnded) {
      gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    }
    
    // Broadcast updated game state to all clients
    io.emit('gameState', gameState);
    
    console.log(`Move made by ${player} at position ${index}`);
    console.log('Current board:', gameState.board);
    if (gameState.winner) {
      console.log(`Game ended! Winner: ${gameState.winner}`);
    } else if (gameState.gameEnded) {
      console.log('Game ended in a tie!');
    }
  });

  // Handle game restart
  socket.on('restartGame', () => {
    gameState = {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      gameEnded: false
    };
    
    io.emit('gameState', gameState);
    console.log('Game restarted');
  });

  // Video calling functionality
  socket.on('callUser', ({ userToCall, signalData, from }) => {
    console.log(`Call initiated from ${from} to ${userToCall}`);
    io.to(userToCall).emit('callUser', { signal: signalData, from });
  });

  socket.on('answerCall', ({ signal, to }) => {
    console.log(`Call answered, sending signal to ${to}`);
    io.to(to).emit('callAccepted', signal);
  });

  socket.on('endCall', ({ to }) => {
    console.log(`Call ended between users`);
    if (to) {
      io.to(to).emit('callEnded');
    }
    socket.emit('callEnded');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete users[socket.id];
    
    // Notify other users about disconnection
    socket.broadcast.emit('callEnded');
  });
});

// Basic REST endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tic-Tac-Toe Server Running',
    gameState: gameState,
    connectedUsers: Object.keys(users).length
  });
});

app.get('/status', (req, res) => {
  res.json({
    server: 'running',
    connectedUsers: Object.keys(users).length,
    currentGame: gameState
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Tic-Tac-Toe server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled for real-time communication`);
  console.log(`🎮 Game state: ${JSON.stringify(gameState, null, 2)}`);
});