class RacingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.player = {
            x: this.width / 2 - 15,
            y: this.height - 100,
            width: 30,
            height: 50,
            speed: 0,
            maxSpeed: 8,
            acceleration: 0.2,
            friction: 0.1,
            direction: 0
        };
        
        this.fuel = 100;
        this.score = 0;
        this.roadOffset = 0;
        this.roadSpeed = 2;
        
        this.roadConditions = ['dry', 'wet', 'construction'];
        this.currentCondition = 'dry';
        this.conditionChangeTimer = 0;
        
        this.obstacles = [];
        this.gasStations = [];
        this.roadMarkers = [];
        
        this.keys = {};
        
        this.initializeRoad();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    initializeRoad() {
        for (let i = 0; i < 20; i++) {
            this.roadMarkers.push({
                x: this.width / 2,
                y: i * 60,
                width: 6,
                height: 30
            });
        }
        
        this.spawnObstacle();
        this.spawnGasStation();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    spawnObstacle() {
        if (Math.random() < 0.3) {
            const lanes = [200, 300, 400, 500];
            const obstacleTypes = ['car', 'barrier', 'pothole'];
            
            this.obstacles.push({
                x: lanes[Math.floor(Math.random() * lanes.length)],
                y: -60,
                width: 30,
                height: 50,
                type: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
            });
        }
    }
    
    spawnGasStation() {
        if (Math.random() < 0.1) {
            this.gasStations.push({
                x: 150,
                y: -80,
                width: 60,
                height: 40,
                active: true
            });
        }
    }
    
    updatePlayer() {
        if (this.keys['ArrowUp']) {
            this.player.speed = Math.min(this.player.speed + this.player.acceleration, this.player.maxSpeed);
            this.fuel = Math.max(0, this.fuel - 0.05);
        } else if (this.keys['ArrowDown']) {
            this.player.speed = Math.max(this.player.speed - this.player.acceleration * 2, -this.player.maxSpeed / 2);
        } else {
            this.player.speed *= (1 - this.player.friction);
        }
        
        if (this.keys['ArrowLeft']) {
            this.player.x = Math.max(150, this.player.x - 4);
        }
        if (this.keys['ArrowRight']) {
            this.player.x = Math.min(550, this.player.x + 4);
        }
        
        this.roadSpeed = Math.max(2, this.player.speed);
        this.score += Math.floor(this.roadSpeed);
    }
    
    updateRoadConditions() {
        this.conditionChangeTimer++;
        if (this.conditionChangeTimer > 600) {
            this.currentCondition = this.roadConditions[Math.floor(Math.random() * this.roadConditions.length)];
            this.conditionChangeTimer = 0;
            
            switch(this.currentCondition) {
                case 'wet':
                    this.player.friction = 0.05;
                    break;
                case 'construction':
                    this.player.maxSpeed = 5;
                    break;
                default:
                    this.player.friction = 0.1;
                    this.player.maxSpeed = 8;
            }
        }
    }
    
    updateObstacles() {
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.y += this.roadSpeed;
            
            if (this.checkCollision(this.player, obstacle)) {
                this.fuel = Math.max(0, this.fuel - 20);
                return false;
            }
            
            return obstacle.y < this.height + 100;
        });
        
        if (Math.random() < 0.02) {
            this.spawnObstacle();
        }
    }
    
    updateGasStations() {
        this.gasStations = this.gasStations.filter(station => {
            station.y += this.roadSpeed;
            
            if (this.checkCollision(this.player, station) && station.active) {
                this.fuel = Math.min(100, this.fuel + 30);
                station.active = false;
            }
            
            return station.y < this.height + 100;
        });
        
        if (Math.random() < 0.005) {
            this.spawnGasStation();
        }
    }
    
    updateRoadMarkers() {
        this.roadOffset += this.roadSpeed;
        
        this.roadMarkers.forEach(marker => {
            marker.y += this.roadSpeed;
            if (marker.y > this.height) {
                marker.y = -30;
            }
        });
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    drawRoad() {
        this.ctx.fillStyle = this.getRoadColor();
        this.ctx.fillRect(150, 0, 400, this.height);
        
        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(145, 0, 5, this.height);
        this.ctx.fillRect(550, 0, 5, this.height);
        
        this.ctx.fillStyle = '#fff';
        this.roadMarkers.forEach(marker => {
            this.ctx.fillRect(marker.x - marker.width/2, marker.y, marker.width, marker.height);
        });
    }
    
    getRoadColor() {
        switch(this.currentCondition) {
            case 'wet': return '#333';
            case 'construction': return '#654321';
            default: return '#444';
        }
    }
    
    drawPlayer() {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(this.player.x + 5, this.player.y, 5, 10);
        this.ctx.fillRect(this.player.x + 20, this.player.y, 5, 10);
    }
    
    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            switch(obstacle.type) {
                case 'car':
                    this.ctx.fillStyle = '#0066cc';
                    break;
                case 'barrier':
                    this.ctx.fillStyle = '#ff6600';
                    break;
                case 'pothole':
                    this.ctx.fillStyle = '#111';
                    break;
            }
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }
    
    drawGasStations() {
        this.gasStations.forEach(station => {
            if (station.active) {
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillRect(station.x, station.y, station.width, station.height);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px Arial';
                this.ctx.fillText('GAS', station.x + 15, station.y + 25);
            }
        });
    }
    
    drawUI() {
        this.ctx.fillStyle = this.currentCondition === 'wet' ? '#4444ff' : 
                            this.currentCondition === 'construction' ? '#ff4444' : '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Road: ${this.currentCondition.toUpperCase()}`, 20, 30);
        
        if (this.fuel <= 0) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '48px Arial';
            this.ctx.fillText('OUT OF FUEL!', this.width/2 - 150, this.height/2);
        }
    }
    
    updateUI() {
        document.getElementById('speed').textContent = Math.floor(this.player.speed * 10);
        document.getElementById('fuel').textContent = Math.floor(this.fuel);
        document.getElementById('score').textContent = this.score;
    }
    
    gameLoop() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        if (this.fuel > 0) {
            this.updatePlayer();
            this.updateRoadConditions();
            this.updateObstacles();
            this.updateGasStations();
            this.updateRoadMarkers();
        }
        
        this.drawRoad();
        this.drawPlayer();
        this.drawObstacles();
        this.drawGasStations();
        this.drawUI();
        this.updateUI();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new RacingGame();
});