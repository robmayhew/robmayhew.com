const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');

const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

let board = [];
let currentPiece = null;
let score = 0;
let lines = 0;
let gameRunning = false;
let gameLoop = null;

const PIECES = [
    {
        shape: [[1, 1, 1, 1]],
        color: '#00FFFF'
    },
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#FFFF00'
    },
    {
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: '#800080'
    },
    {
        shape: [
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: '#FFA500'
    },
    {
        shape: [
            [0, 0, 1],
            [1, 1, 1]
        ],
        color: '#0000FF'
    },
    {
        shape: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: '#00FF00'
    },
    {
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: '#FF0000'
    }
];

function initBoard() {
    board = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        board[y] = [];
        for (let x = 0; x < BOARD_WIDTH; x++) {
            board[y][x] = 0;
        }
    }
}

function createPiece() {
    const pieceType = PIECES[Math.floor(Math.random() * PIECES.length)];
    return {
        shape: pieceType.shape,
        color: pieceType.color,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(pieceType.shape[0].length / 2),
        y: 0
    };
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
}

function drawPiece(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                drawBlock(piece.x + x, piece.y + y, piece.color);
            }
        }
    }
}

function isValidPosition(piece, newX, newY, rotation = null) {
    const shape = rotation || piece.shape;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardX = newX + x;
                const boardY = newY + y;
                
                if (boardX < 0 || boardX >= BOARD_WIDTH || 
                    boardY >= BOARD_HEIGHT || 
                    (boardY >= 0 && board[boardY][boardX])) {
                    return false;
                }
            }
        }
    }
    return true;
}

function rotatePiece(piece) {
    const rotated = [];
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    
    for (let x = 0; x < cols; x++) {
        rotated[x] = [];
        for (let y = 0; y < rows; y++) {
            rotated[x][y] = piece.shape[rows - 1 - y][x];
        }
    }
    
    return rotated;
}

function placePiece(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                board[piece.y + y][piece.x + x] = piece.color;
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(new Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * linesCleared;
        updateScore();
    }
}

function updateScore() {
    scoreElement.textContent = score;
    linesElement.textContent = lines;
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    alert('Game Over! Score: ' + score);
}

function update() {
    if (!currentPiece) {
        currentPiece = createPiece();
        if (!isValidPosition(currentPiece, currentPiece.x, currentPiece.y)) {
            gameOver();
            return;
        }
    }
    
    if (isValidPosition(currentPiece, currentPiece.x, currentPiece.y + 1)) {
        currentPiece.y++;
    } else {
        placePiece(currentPiece);
        clearLines();
        currentPiece = null;
    }
    
    drawBoard();
    if (currentPiece) {
        drawPiece(currentPiece);
    }
}

function startGame() {
    if (gameRunning) return;
    
    initBoard();
    currentPiece = null;
    score = 0;
    lines = 0;
    updateScore();
    gameRunning = true;
    
    gameLoop = setInterval(update, 500);
}

function pauseGame() {
    if (gameRunning) {
        clearInterval(gameLoop);
        gameRunning = false;
    } else {
        gameLoop = setInterval(update, 500);
        gameRunning = true;
    }
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning || !currentPiece) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            if (isValidPosition(currentPiece, currentPiece.x - 1, currentPiece.y)) {
                currentPiece.x--;
            }
            break;
        case 'ArrowRight':
            if (isValidPosition(currentPiece, currentPiece.x + 1, currentPiece.y)) {
                currentPiece.x++;
            }
            break;
        case 'ArrowDown':
            if (isValidPosition(currentPiece, currentPiece.x, currentPiece.y + 1)) {
                currentPiece.y++;
                score++;
                updateScore();
            }
            break;
        case 'ArrowUp':
            const rotated = rotatePiece(currentPiece);
            if (isValidPosition(currentPiece, currentPiece.x, currentPiece.y, rotated)) {
                currentPiece.shape = rotated;
            }
            break;
    }
    
    drawBoard();
    drawPiece(currentPiece);
});

initBoard();
drawBoard();