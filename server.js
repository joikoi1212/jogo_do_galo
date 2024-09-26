const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Set up the server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (like HTML, CSS, JS) from the public directory
app.use(express.static('public'));

// Store players and game state
let players = [];
let board = Array(9).fill(null);
let currentPlayer = 'X';

// Reset the game state
function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
}

// Handle connection
io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  // Add player to the game if there are less than 2 players
  if (players.length < 2) {
    players.push(socket.id);

    // Send game state to the connected player
    socket.emit('gameState', { board, currentPlayer, playerId: socket.id });

    // Notify the other player if there are 2 players connected
    if (players.length === 2) {
      io.emit('message', { msg: 'Game Start!' });
    }
  } else {
    socket.emit('message', { msg: 'Game is full!' });
    socket.disconnect();
    return;
  }
  socket.on('makeMove', (index) => {
    console.log(`Player ${socket.id} clicked cell ${index}`);

    // Verifique se o índice é válido e se a célula está vazia
    const playerSymbol = players.indexOf(socket.id) === 0 ? 'X' : 'O'; // Define o símbolo correto do jogador
    
    if (board[index] === null && playerSymbol === currentPlayer) {
      // Atualiza o tabuleiro com o símbolo do jogador
      board[index] = playerSymbol;

      // Alterna o jogador atual ('X' ou 'O')
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

      // Emite o novo estado do jogo para todos os clientes
      io.emit('gameState', { board, currentPlayer });
    }
  });
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A player disconnected:', socket.id);
    players = players.filter((player) => player !== socket.id);
    resetGame();
    io.emit('message', { msg: 'A player disconnected. Resetting game.' });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
