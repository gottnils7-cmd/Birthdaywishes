import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import VideoCall from './components/VideoCall';
import { io } from 'socket.io-client';
import './index.css';

const socket = io('http://localhost:5000');

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [me, setMe] = useState('');
  const [callUser, setCallUser] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [call, setCall] = useState({});

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('me', (id) => {
      setMe(id);
    });

    socket.on('gameState', (gameState) => {
      setBoard(gameState.board);
      setCurrentPlayer(gameState.currentPlayer);
      setWinner(gameState.winner);
      setGameEnded(gameState.gameEnded);
    });

    socket.on('callUser', ({ from, signal }) => {
      setCall({ isReceivingCall: true, from, signal });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('me');
      socket.off('gameState');
      socket.off('callUser');
    };
  }, []);

  const handleCellClick = (index) => {
    if (board[index] || gameEnded) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    
    socket.emit('makeMove', { board: newBoard, index, player: currentPlayer });
  };

  const restartGame = () => {
    socket.emit('restartGame');
  };

  const calculateWinner = (squares) => {
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
  };

  return (
    <div className="app">
      <div className="header">
        <h1>🎮 Tic-Tac-Toe Video Game</h1>
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <span>{isConnected ? 'Connected to Server' : 'Connecting...'}</span>
        </div>
      </div>

      <div className="game-container">
        <VideoCall
          socket={socket}
          me={me}
          callUser={callUser}
          setCallUser={setCallUser}
          callAccepted={callAccepted}
          setCallAccepted={setCallAccepted}
          callEnded={callEnded}
          setCallEnded={setCallEnded}
          call={call}
          setCall={setCall}
          localStream={localStream}
          setLocalStream={setLocalStream}
          remoteStream={remoteStream}
          setRemoteStream={setRemoteStream}
        />

        <Board
          board={board}
          currentPlayer={currentPlayer}
          winner={winner}
          gameEnded={gameEnded}
          onCellClick={handleCellClick}
          onRestart={restartGame}
        />

        <VideoCall
          socket={socket}
          me={me}
          callUser={callUser}
          setCallUser={setCallUser}
          callAccepted={callAccepted}
          setCallAccepted={setCallAccepted}
          callEnded={callEnded}
          setCallEnded={setCallEnded}
          call={call}
          setCall={setCall}
          localStream={localStream}
          setLocalStream={setLocalStream}
          remoteStream={remoteStream}
          setRemoteStream={setRemoteStream}
          isRemote={true}
        />
      </div>
    </div>
  );
}

export default App;