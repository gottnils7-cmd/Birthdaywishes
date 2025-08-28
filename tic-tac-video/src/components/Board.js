import React from 'react';

function Board({ board, currentPlayer, winner, gameEnded, onCellClick, onRestart }) {
  const renderCell = (index) => (
    <button
      key={index}
      className="cell"
      onClick={() => onCellClick(index)}
      disabled={board[index] || gameEnded}
    >
      {board[index]}
    </button>
  );

  const getGameStatus = () => {
    if (winner) {
      return `🏆 Player ${winner} Wins!`;
    } else if (gameEnded) {
      return "🤝 It's a Tie!";
    } else {
      return `🎯 Current Player: ${currentPlayer}`;
    }
  };

  return (
    <div className="board-section">
      <h2>Game Board</h2>
      <div className={`game-status ${winner ? 'winner' : ''}`}>
        {getGameStatus()}
      </div>
      <div className="board">
        {board.map((_, index) => renderCell(index))}
      </div>
      <button className="restart-btn" onClick={onRestart}>
        🔄 New Game
      </button>
    </div>
  );
}

export default Board;