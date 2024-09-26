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
        socket.emit('gameState', { board, currentPlayer, playerId: socket.id });

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

        const playerSymbol = players.indexOf(socket.id) === 0 ? 'X' : 'O';

        if (board[index] === null && playerSymbol === currentPlayer) {
            board[index] = playerSymbol;

            const winner = checkWinner();
            if (winner) {
                io.emit('gameState', { board, currentPlayer, winner });
                io.emit('message', { msg: `Player ${winner} wins!` });
                resetGame();
                return;
            }

            if (checkTie()) {
                io.emit('gameState', { board, currentPlayer });
                io.emit('message', { msg: "It's a tie!" });
                resetGame();
                return;
            }

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            io.emit('gameState', { board, currentPlayer });
        }
    });

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

// Helper functions for winner and tie checks
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function checkTie() {
    return board.every(cell => cell !== null);
}
