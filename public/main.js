const socket = io();

// Variables to track game state
let board = [];
let currentPlayer = '';
let playerId = '';

const winningCombinations = [
    [0, 1, 2],  // First row
    [3, 4, 5],  // Second row
    [6, 7, 8],  // Third row
    [0, 3, 6],  // First column
    [1, 4, 7],  // Second column
    [2, 5, 8],  // Third column
    [0, 4, 8],  // Diagonal 1
    [2, 4, 6]   // Diagonal 2
  ];

// Update the UI with the current game state
function updateBoard(board) {
  document.querySelectorAll('.cell').forEach((cell, index) => {
    cell.textContent = board[index];
  });
}

// Function to check for a winner
function checkWinner() {
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]; // Return the symbol ('X' or 'O') of the winner
      }
    }
    return null; // No winner
  }

  // Function to check for a tie
function checkTie() {
    return board.every(cell => cell !== null);
  }

// Display message to the player
function showMessage(message) {
  document.getElementById('message').textContent = message;
}

// Handle the click event on each cell
document.querySelectorAll('.cell').forEach((cell) => {
  cell.addEventListener('click', () => {
    const index = cell.getAttribute('data-index');
    socket.emit('makeMove', index);
    console.log("click");
  });
});

socket.on('gameState', (gameState) => {
    console.log("Received gameState:", gameState); // Verifica se o evento está sendo recebido no cliente
    board = gameState.board;
    currentPlayer = gameState.currentPlayer;
    updateBoard(board);
    console.log("player1");
    
    if (socket.id === gameState.playerId) {
      showMessage(`You are player ${currentPlayer}`);
    }
  
    showMessage(`It's ${currentPlayer}'s turn`);
  });
  

// Receive messages from the server
socket.on('message', (data) => {
  showMessage(data.msg);
});
console.log("teste");