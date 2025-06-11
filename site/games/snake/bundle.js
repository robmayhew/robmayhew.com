var Map = /** @class */ (function () {
    function Map() {
        this.width = 6;
        this.height = 6;
    }
    return Map;
}());
var SnakeCell = /** @class */ (function () {
    function SnakeCell(xIn, yIn) {
        this.xIn = xIn;
        this.yIn = yIn;
        this.x = 0;
        this.y = 0;
        this.x = xIn;
        this.y = yIn;
    }
    return SnakeCell;
}());
var Apple = /** @class */ (function () {
    function Apple() {
        this.x = 1;
        this.y = 1;
    }
    Apple.prototype.move = function () {
        var good = true;
        var ix;
        var iy = 0;
        var openCells = [];
        var close = [];
        for (ix = 0; ix < MAP.width; ix++) {
            for (iy = 0; iy < MAP.height; iy++) {
                good = true;
                for (var _i = 0, _a = SNAKE.cells; _i < _a.length; _i++) {
                    var cell = _a[_i];
                    if (ix == cell.x && iy == cell.y) {
                        good = false;
                    }
                }
                if (good) {
                    openCells.push(new SnakeCell(ix, iy));
                    var sx = SNAKE.x - ix;
                    var sy = SNAKE.y - iy;
                    if (sx < 1)
                        sx = sx * -1;
                    if (sy < 1)
                        sy = sy * -1;
                    if (sx < 5 && sy < 5) {
                        close.push(new SnakeCell(ix, iy));
                    }
                }
            }
        }
        if (openCells.length == 0) {
            SNAKE.win = true;
            return;
        }
        if (close.length > 0) {
            var ii = Math.floor(Math.random() * close.length);
            if (ii == close.length)
                ii--;
            var c = close[ii];
            APPLE.x = c.x;
            APPLE.y = c.y;
        }
        else {
            var i = Math.floor(Math.random() * openCells.length);
            var c = openCells[i];
            APPLE.x = c.x;
            APPLE.y = c.y;
        }
    };
    return Apple;
}());
var Snake = /** @class */ (function () {
    function Snake() {
        this.dx = 1;
        this.dy = 0;
        this.waitingDelta = [];
        this.x = 1;
        this.y = 1;
        this.lastTick = 0;
        this.tickTime = 250;
        this.gameOver = false;
        this.lastScored = false;
        this.score = 0;
        this.highScore = 0;
        this.damageed = false;
        this.win = false;
        this.cells = [
            new SnakeCell(1, 1)
        ];
    }
    Snake.prototype.isCellOccupied = function (x, y) {
        return this.cells.some(function (cell) { return cell.x === x && cell.y === y; });
    };
    Snake.prototype.tick = function () {
        var now = new Date().getTime();
        var passed = now - this.lastTick;
        if (passed < this.tickTime) {
            return;
        }
        this.lastTick = now;
        if (this.win) {
            this.gameOver = true;
        }
        if (this.gameOver)
            return;
        if (this.waitingDelta.length > 0) {
            var w = this.waitingDelta.shift();
            if (w == 'w' || w == 'W') {
                this.dx = 0;
                this.dy = -1;
            }
            else if (w == 'a' || w == 'A') {
                this.dx = -1;
                this.dy = 0;
            }
            else if (w == 's' || w == 'S') {
                this.dx = 0;
                this.dy = 1;
            }
            else if (w == 'd' || w == 'D') {
                this.dx = 1;
                this.dy = 0;
            }
        }
        var nx = this.x + this.dx;
        var ny = this.y + this.dy;
        var hit = false;
        if (nx < 0 || ny < 0 || ny >= MAP.height || nx >= MAP.width) {
            if (this.cells.length < 2) {
                this.gameOver = true;
                return;
            }
            else {
                hit = true;
            }
        }
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (nx == cell.x && ny == cell.y) {
                if (this.cells.length < 2) {
                    this.gameOver = true;
                    return;
                }
                else {
                    hit = true;
                }
            }
        }
        SNAKE.damageed = false;
        if (hit) {
            SNAKE.score--;
            SNAKE.damageed = true;
            var newCells = [];
            for (var i = 0; i < this.cells.length; i++) {
                if (i != this.cells.length - 1) {
                    newCells.push(this.cells[i]);
                }
            }
            nx = this.x;
            ny = this.y;
            this.cells = newCells;
        }
        var score = (nx == APPLE.x && ny == APPLE.y);
        var lastCell = new SnakeCell(nx, ny);
        if (!hit) {
            for (var _b = 0, _c = this.cells; _b < _c.length; _b++) {
                var cell = _c[_b];
                var orig = new SnakeCell(cell.x, cell.y);
                cell.x = lastCell.x;
                cell.y = lastCell.y;
                lastCell = orig;
            }
        }
        if (this.lastScored) {
            this.lastScored = false;
            this.cells.push(lastCell);
        }
        if (score) {
            SNAKE.score++;
            if (SNAKE.score > SNAKE.highScore)
                SNAKE.highScore = SNAKE.score;
            this.lastScored = true;
            APPLE.move();
        }
        if (Math.random() < 0.10) {
            // Move the apple at random?
            //      APPLE.move();
        }
        this.x = nx;
        this.y = ny;
        if (MAP.width < 12 && SNAKE.cells.length > (MAP.width - 1) * (MAP.height - 1)) {
            MAP.height++;
            MAP.width++;
            MAP.height++;
            MAP.width++;
            resizeCanvas();
        }
    };
    return Snake;
}());
var SNAKE = new Snake();
var APPLE = new Apple();
var MAP = new Map();
var ctx;
var canvas;
var neverStarted = true;
var keyPressed = false;
function keyPress(key) {
    neverStarted = false;
    if (SNAKE.gameOver) {
        restart();
    }
    else {
        SNAKE.waitingDelta.push(key);
    }
}
function go() {
    console.log("Go!");
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    window.onkeydown = function (e) {
        keyPress(e.key);
    };
    document.getElementById('up-btn').addEventListener('click', function () { keyPress('w'); });
    document.getElementById('down-btn').addEventListener('click', function () { keyPress('s'); });
    document.getElementById('left-btn').addEventListener('click', function () { keyPress('a'); });
    document.getElementById('right-btn').addEventListener('click', function () { keyPress('d'); });
    var slider = document.getElementById('speed-slider');
    slider.addEventListener('input', function (event) {
        var target = event.target;
        var value = parseInt(target.value, 10);
        SNAKE.tickTime = 1000 - value; // Assuming value corresponds to newTickTime
        console.log('Speed:', value);
        // Adjust game speed here based on slider value
    });
    // Resize canvas to fit the screen
    window.addEventListener("resize", resizeCanvas);
    // Initial resize
    resizeCanvas();
    requestAnimationFrame(tick);
}
function restart() {
    var lastTickTime = SNAKE.tickTime;
    SNAKE = new Snake();
    SNAKE.tickTime = lastTickTime;
    APPLE = new Apple();
    MAP = new Map();
}
// Idea have the snake turn in the best direction
// function turn() {
//     // w a s d
//     const directions = ["w", "a", "s", "d"];
//     const currentIndex = directions.indexOf(
//         SNAKE.dx === 1 ? "d" :
//             SNAKE.dx === -1 ? "a" :
//                 SNAKE.dy === 1 ? "s" : "w"
//     );
//     const otherIndices = directions
//         .map((_, index) => index)
//         .filter(index => index !== currentIndex);
//
//
// // Function to check if a direction hits something
//     function hitsObstacle(snake, direction) {
//         const nextPosition = {
//             x: snake.x + (direction === "d" ? 1 : direction === "a" ? -1 : 0),
//             y: snake.y + (direction === "s" ? 1 : direction === "w" ? -1 : 0)
//         };
//
//         function isObstacle(nx: any, ny: any) {
//             if (nx < 0 || ny < 0 || ny >= MAP.height || nx >= MAP.width) {
//                 return true;
//             }
//             if (SNAKE.isCellOccupied(nx, ny)) {
//                 return true;
//             }
//             return false;
//         }
//
//         // Replace `isObstacle` with your logic to check if there's an obstacle
//         return isObstacle(nextPosition.x, nextPosition.y);
//     }
//
//     const openDirections = otherIndices
//         .map((_, index) => index)
//         .filter(index => !hitsObstacle(SNAKE, directions[index]));
//
//     console.log(("Turn result " + directions[openDirections[0]]));
//     SNAKE.waitingDelta.push(directions[openDirections[0]]);
//
//
//     // Position on the board
//     // The last turn that has been made
//
//     // can turn left / or right
//
//
// }
function resizeCanvas() {
    var size = 20; // Base size for a single cell
    var header = 20; // Header height
    // Calculate canvas size based on the window dimensions and map size
    var availableWidth = window.innerWidth * .85;
    var availableHeight = window.innerHeight * .55;
    var gameWidth = MAP.width * size;
    var gameHeight = MAP.height * size + header;
    // Calculate scaling factor to maintain aspect ratio
    var scaleWidth = availableWidth / gameWidth;
    var scaleHeight = availableHeight / gameHeight;
    var scale = Math.min(scaleWidth, scaleHeight);
    // Resize canvas and apply scaling
    canvas.width = gameWidth * scale;
    canvas.height = gameHeight * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0); // Apply scaling transformation
}
function tick() {
    SNAKE.tick();
    ctx.fillStyle = "#000000";
    var size = 20; // Base size for a single cell
    var header = 20; // Header height
    ctx.clearRect(0, 0, MAP.width * size, MAP.height * size + header);
    ctx.strokeRect(0, header, MAP.width * size, MAP.height * size);
    ctx.font = 'bold 12px sans-serif'; // Font style, size, and family
    ctx.fillStyle = 'black'; // Text color
    if (neverStarted) {
        ctx.strokeText("Press Any ", 10, 50);
        ctx.strokeText("Direction to ", 10, 70);
        ctx.strokeText("Start ", 10, 90);
    }
    else if (SNAKE.win) {
        ctx.strokeText("YOU WIN!", 10, 50);
    }
    else if (SNAKE.gameOver) {
        ctx.strokeText("Game Over!", 10, 50);
    }
    else {
        ctx.strokeText("Score: " + SNAKE.score + " High: " + SNAKE.highScore, 10, 10);
        var percent = 0;
        for (var _i = 0, _a = SNAKE.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            var startColor = "#000000";
            if (SNAKE.damageed) {
                startColor = "#FF0000";
            }
            ctx.fillStyle = blendColors(startColor, "#00ff00", percent);
            var x = cell.x * size;
            var y = cell.y * size + header;
            ctx.fillRect(x, y, size - 1, size - 1);
            percent = percent + 0.01;
            if (percent >= 0.9)
                percent = 0.9;
        }
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(APPLE.x * size, APPLE.y * size + header, size - 1, size - 1);
        keyPressed = false;
    }
    requestAnimationFrame(tick);
}
function blendColors(c0, c1, p) {
    var f = parseInt(c0.slice(1), 16), t = parseInt(c1.slice(1), 16), R1 = f >> 16, G1 = (f >> 8) & 0x00ff, B1 = f & 0x0000ff, R2 = t >> 16, G2 = (t >> 8) & 0x00ff, B2 = t & 0x0000ff;
    return ("#" +
        (0x1000000 +
            (Math.round((R2 - R1) * p) + R1) * 0x10000 +
            (Math.round((G2 - G1) * p) + G1) * 0x100 +
            (Math.round((B2 - B1) * p) + B1))
            .toString(16)
            .slice(1));
}
