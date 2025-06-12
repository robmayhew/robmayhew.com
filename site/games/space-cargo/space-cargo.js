class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    
    subtract(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    
    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
    
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    
    normalize() {
        const len = this.length();
        return len > 0 ? new Vector3(this.x / len, this.y / len, this.z / len) : new Vector3();
    }
    
    copy() {
        return new Vector3(this.x, this.y, this.z);
    }
}

class Matrix4 {
    constructor() {
        this.elements = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }
    
    perspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        
        this.elements = [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, 2 * far * near * nf, 0
        ];
        return this;
    }
    
    lookAt(eye, target, up) {
        const z = eye.subtract(target).normalize();
        const x = up.cross ? up.cross(z).normalize() : new Vector3(1, 0, 0);
        const y = z.cross ? z.cross(x) : new Vector3(0, 1, 0);
        
        this.elements = [
            x.x, y.x, z.x, 0,
            x.y, y.y, z.y, 0,
            x.z, y.z, z.z, 0,
            -x.dot(eye), -y.dot(eye), -z.dot(eye), 1
        ];
        return this;
    }
    
    translate(v) {
        this.elements[12] += v.x;
        this.elements[13] += v.y;
        this.elements[14] += v.z;
        return this;
    }
}

class SpaceCargoGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        this.camera = {
            position: new Vector3(0, 0, 10),
            rotation: { x: 0, y: 0 },
            fov: Math.PI / 3,
            near: 0.1,
            far: 1000
        };
        
        this.player = {
            position: new Vector3(0, 0, 0),
            velocity: new Vector3(0, 0, 0),
            rotation: { x: 0, y: 0, z: 0 },
            fuel: 100,
            cargo: 0,
            maxCargo: 5,
            isDocked: false,
            dockedStation: null
        };
        
        this.stations = [
            {
                id: 'alpha',
                name: 'Station Alpha',
                position: new Vector3(-50, 0, -20),
                size: 8,
                color: '#00ff00',
                missions: [],
                fuel: true
            },
            {
                id: 'beta',
                name: 'Station Beta',
                position: new Vector3(30, 20, -40),
                size: 6,
                color: '#0088ff',
                missions: [],
                fuel: false
            },
            {
                id: 'gamma',
                name: 'Station Gamma',
                position: new Vector3(0, -30, -60),
                size: 7,
                color: '#ff8800',
                missions: [],
                fuel: true
            }
        ];
        
        this.stars = [];
        this.missions = [];
        this.credits = 1000;
        this.currentMission = null;
        
        this.keys = {};
        this.mouse = { x: 0, y: 0, sensitivity: 0.002 };
        
        this.generateStars();
        this.generateMissions();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    generateStars() {
        for (let i = 0; i < 1000; i++) {
            this.stars.push({
                position: new Vector3(
                    (Math.random() - 0.5) * 2000,
                    (Math.random() - 0.5) * 2000,
                    (Math.random() - 0.5) * 2000
                ),
                brightness: Math.random()
            });
        }
    }
    
    generateMissions() {
        const missionTypes = [
            { from: 'alpha', to: 'beta', cargo: 2, reward: 500, description: 'Deliver medical supplies' },
            { from: 'beta', to: 'gamma', cargo: 3, reward: 750, description: 'Transport mining equipment' },
            { from: 'gamma', to: 'alpha', cargo: 1, reward: 300, description: 'Deliver ore samples' },
            { from: 'alpha', to: 'gamma', cargo: 4, reward: 900, description: 'Emergency supplies' },
            { from: 'beta', to: 'alpha', cargo: 2, reward: 600, description: 'Scientific data cores' }
        ];
        
        missionTypes.forEach((mission, index) => {
            this.missions.push({
                id: index,
                ...mission,
                active: false,
                completed: false
            });
        });
        
        this.currentMission = this.missions[0];
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key.toLowerCase() === 'f') {
                this.handleDocking();
            }
            if (e.key.toLowerCase() === 'r') {
                this.handleRefuel();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.addEventListener('mousemove', (e) => {
            const deltaX = e.movementX || e.clientX - this.mouse.x;
            const deltaY = e.movementY || e.clientY - this.mouse.y;
            
            this.camera.rotation.y -= deltaX * this.mouse.sensitivity;
            this.camera.rotation.x -= deltaY * this.mouse.sensitivity;
            
            this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
            
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock();
        });
    }
    
    handleDocking() {
        if (this.player.isDocked) {
            this.player.isDocked = false;
            this.player.dockedStation = null;
            return;
        }
        
        const nearbyStation = this.getNearbyStation();
        if (nearbyStation && this.getDistanceToStation(nearbyStation) < 15) {
            this.player.isDocked = true;
            this.player.dockedStation = nearbyStation;
            this.player.velocity = new Vector3(0, 0, 0);
            
            if (this.currentMission && !this.currentMission.active) {
                if (nearbyStation.id === this.currentMission.from) {
                    this.startMission();
                }
            } else if (this.currentMission && this.currentMission.active) {
                if (nearbyStation.id === this.currentMission.to) {
                    this.completeMission();
                }
            }
        }
    }
    
    handleRefuel() {
        if (this.player.isDocked && this.player.dockedStation.fuel && this.credits >= 100) {
            const fuelNeeded = 100 - this.player.fuel;
            const cost = Math.floor(fuelNeeded * 2);
            if (this.credits >= cost) {
                this.player.fuel = 100;
                this.credits -= cost;
            }
        }
    }
    
    startMission() {
        if (this.currentMission && this.player.cargo + this.currentMission.cargo <= this.player.maxCargo) {
            this.currentMission.active = true;
            this.player.cargo += this.currentMission.cargo;
        }
    }
    
    completeMission() {
        if (this.currentMission && this.currentMission.active) {
            this.currentMission.completed = true;
            this.currentMission.active = false;
            this.player.cargo -= this.currentMission.cargo;
            this.credits += this.currentMission.reward;
            
            const nextMission = this.missions.find(m => !m.completed);
            this.currentMission = nextMission || null;
        }
    }
    
    getNearbyStation() {
        let closest = null;
        let minDistance = Infinity;
        
        this.stations.forEach(station => {
            const distance = this.getDistanceToStation(station);
            if (distance < minDistance) {
                minDistance = distance;
                closest = station;
            }
        });
        
        return closest;
    }
    
    getDistanceToStation(station) {
        return this.player.position.subtract(station.position).length();
    }
    
    updatePlayer() {
        if (this.player.isDocked) return;
        
        const moveSpeed = 0.5;
        const rotationSpeed = 0.02;
        
        if (this.keys['w']) {
            const forward = new Vector3(
                Math.sin(this.camera.rotation.y) * Math.cos(this.camera.rotation.x),
                -Math.sin(this.camera.rotation.x),
                Math.cos(this.camera.rotation.y) * Math.cos(this.camera.rotation.x)
            );
            this.player.velocity = this.player.velocity.add(forward.multiply(moveSpeed));
            this.player.fuel = Math.max(0, this.player.fuel - 0.1);
        }
        
        if (this.keys['s']) {
            const backward = new Vector3(
                -Math.sin(this.camera.rotation.y) * Math.cos(this.camera.rotation.x),
                Math.sin(this.camera.rotation.x),
                -Math.cos(this.camera.rotation.y) * Math.cos(this.camera.rotation.x)
            );
            this.player.velocity = this.player.velocity.add(backward.multiply(moveSpeed * 0.5));
            this.player.fuel = Math.max(0, this.player.fuel - 0.05);
        }
        
        if (this.keys['a']) {
            const left = new Vector3(-Math.cos(this.camera.rotation.y), 0, Math.sin(this.camera.rotation.y));
            this.player.velocity = this.player.velocity.add(left.multiply(moveSpeed * 0.7));
            this.player.fuel = Math.max(0, this.player.fuel - 0.05);
        }
        
        if (this.keys['d']) {
            const right = new Vector3(Math.cos(this.camera.rotation.y), 0, -Math.sin(this.camera.rotation.y));
            this.player.velocity = this.player.velocity.add(right.multiply(moveSpeed * 0.7));
            this.player.fuel = Math.max(0, this.player.fuel - 0.05);
        }
        
        this.player.velocity = this.player.velocity.multiply(0.95);
        this.player.position = this.player.position.add(this.player.velocity);
        
        this.camera.position = this.player.position.add(new Vector3(0, 0, 10));
    }
    
    project3D(point) {
        const translated = point.subtract(this.camera.position);
        
        const cosY = Math.cos(this.camera.rotation.y);
        const sinY = Math.sin(this.camera.rotation.y);
        const cosX = Math.cos(this.camera.rotation.x);
        const sinX = Math.sin(this.camera.rotation.x);
        
        const x = translated.x * cosY - translated.z * sinY;
        const z = translated.x * sinY + translated.z * cosY;
        const y = translated.y * cosX - z * sinX;
        const finalZ = translated.y * sinX + z * cosX;
        
        if (finalZ <= 0) return null;
        
        const scale = (this.canvas.width / 2) / Math.tan(this.camera.fov / 2);
        const screenX = (x * scale / finalZ) + this.canvas.width / 2;
        const screenY = (y * scale / finalZ) + this.canvas.height / 2;
        
        return { x: screenX, y: screenY, z: finalZ };
    }
    
    drawStars() {
        this.stars.forEach(star => {
            const projected = this.project3D(star.position);
            if (projected && projected.z > 0 && projected.z < 500) {
                const alpha = star.brightness * (1 - projected.z / 500);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.fillRect(projected.x, projected.y, 1, 1);
            }
        });
    }
    
    drawStations() {
        this.stations.forEach(station => {
            const projected = this.project3D(station.position);
            if (projected && projected.z > 0) {
                const distance = this.getDistanceToStation(station);
                const size = Math.max(4, station.size * 100 / projected.z);
                
                this.ctx.fillStyle = station.color;
                this.ctx.fillRect(projected.x - size/2, projected.y - size/2, size, size);
                
                this.ctx.strokeStyle = distance < 15 ? '#ffff00' : station.color;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(projected.x - size/2, projected.y - size/2, size, size);
                
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Courier New';
                this.ctx.fillText(station.name, projected.x + size/2 + 5, projected.y);
                this.ctx.fillText(`${Math.floor(distance)}u`, projected.x + size/2 + 5, projected.y + 15);
            }
        });
    }
    
    drawCrosshair() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 10, centerY);
        this.ctx.lineTo(centerX + 10, centerY);
        this.ctx.moveTo(centerX, centerY - 10);
        this.ctx.lineTo(centerX, centerY + 10);
        this.ctx.stroke();
    }
    
    updateUI() {
        document.getElementById('velocity').textContent = this.player.velocity.length().toFixed(1);
        document.getElementById('cargo').textContent = this.player.cargo;
        document.getElementById('credits').textContent = this.credits;
        document.getElementById('fuel').textContent = Math.floor(this.player.fuel);
        
        const missionText = document.getElementById('missionText');
        const missionReward = document.getElementById('missionReward');
        
        if (this.currentMission) {
            if (!this.currentMission.active) {
                missionText.innerHTML = `<span class="mission-active">Pick up: ${this.currentMission.description}</span><br>From: Station ${this.currentMission.from.toUpperCase()}`;
                missionReward.textContent = `Reward: ${this.currentMission.reward} credits`;
            } else {
                missionText.innerHTML = `<span class="mission-active">Deliver: ${this.currentMission.description}</span><br>To: Station ${this.currentMission.to.toUpperCase()}`;
                missionReward.textContent = `Reward: ${this.currentMission.reward} credits`;
            }
        } else {
            missionText.innerHTML = '<span class="mission-complete">All missions completed!</span>';
            missionReward.textContent = '';
        }
        
        if (this.player.isDocked) {
            missionText.innerHTML += `<br><br>Docked at ${this.player.dockedStation.name}`;
            if (this.player.dockedStation.fuel) {
                missionText.innerHTML += '<br>Press R to refuel';
            }
        }
    }
    
    gameLoop() {
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.player.fuel > 0) {
            this.updatePlayer();
        }
        
        this.drawStars();
        this.drawStations();
        this.drawCrosshair();
        this.updateUI();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new SpaceCargoGame();
});