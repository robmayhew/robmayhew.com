const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

let gameRunning = false;
let gameLoop = null;
let score = 0;
let lives = 3;
let level = 1;

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 30,
    speed: 5,
    color: '#00FF00'
};

let bullets = [];
let invaders = [];
let invaderBullets = [];
let keys = {};

const INVADER_ROWS = 5;
const INVADER_COLS = 10;
const INVADER_SIZE = 30;
const INVADER_SPACING = 40;

function createInvaders() {
    invaders = [];
    for (let row = 0; row < INVADER_ROWS; row++) {
        for (let col = 0; col < INVADER_COLS; col++) {
            invaders.push({
                x: col * INVADER_SPACING + 50,
                y: row * INVADER_SPACING + 50,
                width: INVADER_SIZE,
                height: INVADER_SIZE,
                color: row < 2 ? '#FF0000' : row < 4 ? '#FFFF00' : '#00FFFF',
                points: row < 2 ? 30 : row < 4 ? 20 : 10,
                alive: true
            });
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.fillRect(player.x + 20, player.y - 10, 10, 10);
}

function drawInvaders() {
    invaders.forEach(invader => {
        if (invader.alive) {
            ctx.fillStyle = invader.color;
            ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
            
            ctx.fillStyle = '#FFF';
            ctx.fillRect(invader.x + 5, invader.y + 5, 5, 5);
            ctx.fillRect(invader.x + 20, invader.y + 5, 5, 5);
            
            ctx.fillRect(invader.x + 10, invader.y + 15, 10, 5);
        }
    });
}

function drawBullets() {
    ctx.fillStyle = '#FFFFFF';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    ctx.fillStyle = '#FF0000';
    invaderBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > 0;
    });
    
    invaderBullets = invaderBullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y < canvas.height;
    });
}

function updateInvaders() {
    let moveDown = false;
    let direction = 1;
    
    const aliveInvaders = invaders.filter(inv => inv.alive);
    if (aliveInvaders.length === 0) {
        nextLevel();
        return;
    }
    
    const leftMost = Math.min(...aliveInvaders.map(inv => inv.x));
    const rightMost = Math.max(...aliveInvaders.map(inv => inv.x + inv.width));
    
    if (leftMost <= 0 || rightMost >= canvas.width) {
        moveDown = true;
        direction = leftMost <= 0 ? 10 : -10;
    }
    
    invaders.forEach(invader => {
        if (invader.alive) {
            if (moveDown) {
                invader.y += 20;
                invader.direction = direction;
                invader.x += direction;
            } else {
                invader.x += (invader.direction || 1) * 0.5;
            }
            
            if (Math.random() < 0.001) {
                invaderBullets.push({
                    x: invader.x + invader.width / 2,
                    y: invader.y + invader.height,
                    width: 3,
                    height: 10,
                    speed: 3
                });
            }
        }
    });
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        invaders.forEach((invader, invaderIndex) => {
            if (invader.alive && 
                bullet.x < invader.x + invader.width &&
                bullet.x + bullet.width > invader.x &&
                bullet.y < invader.y + invader.height &&
                bullet.y + bullet.height > invader.y) {
                
                invader.alive = false;
                bullets.splice(bulletIndex, 1);
                score += invader.points;
                updateScore();
            }
        });
    });
    
    invaderBullets.forEach((bullet, bulletIndex) => {
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
            
            invaderBullets.splice(bulletIndex, 1);
            lives--;
            updateScore();
            
            if (lives <= 0) {
                gameOver();
            }
        }
    });
    
    const lowestInvader = Math.max(...invaders.filter(inv => inv.alive).map(inv => inv.y));
    if (lowestInvader + INVADER_SIZE >= player.y) {
        gameOver();
    }
}

function shoot() {
    if (bullets.length < 3) {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7
        });
    }
}

function nextLevel() {
    level++;
    createInvaders();
    bullets = [];
    invaderBullets = [];
    
    invaders.forEach(invader => {
        invader.direction = 1;
    });
}

function updateScore() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    alert('Game Over! Final Score: ' + score);
}

function gameStep() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateBullets();
    updateInvaders();
    checkCollisions();
    
    drawPlayer();
    drawInvaders();
    drawBullets();
}

function startGame() {
    if (gameRunning) return;
    
    score = 0;
    lives = 3;
    level = 1;
    bullets = [];
    invaderBullets = [];
    
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 60;
    
    createInvaders();
    updateScore();
    
    gameRunning = true;
    gameLoop = setInterval(gameStep, 1000/60);
}

function pauseGame() {
    if (gameRunning) {
        clearInterval(gameLoop);
        gameRunning = false;
    } else {
        gameLoop = setInterval(gameStep, 1000/60);
        gameRunning = true;
    }
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        if (gameRunning) {
            shoot();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

ctx.fillStyle = '#FFFFFF';
ctx.font = '20px Arial';
ctx.textAlign = 'center';
ctx.fillText('Press Start Game to begin!', canvas.width / 2, canvas.height / 2);