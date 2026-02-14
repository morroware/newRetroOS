/**
 * Snake Game - Fixed Edges
 * The canvas now sits inside the bezel padding so edges aren't cut off.
 */

import AppBase from './AppBase.js';
import StorageManager from '../core/StorageManager.js';
import StateManager from '../core/StateManager.js';
import EventBus from '../core/EventBus.js';

class Snake extends AppBase {
    constructor() {
        super({
            id: 'snake',
            name: 'Snake',
            icon: '🐍',
            width: 360,
            height: 460,
            resizable: false,
            singleton: true, // One game at a time
            category: 'games'
        });

        // Config
        this.gridSize = 15; 
        this.tileCount = 20; // 300px / 15px = 20 tiles
        
        // State
        this.snake = [];
        this.food = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.moveQueue = [];
        this.score = 0;
        this.highScore = 0;
        
        this.gameLoopId = null;
        this.isGameRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameSpeed = 100;
        
        // Blink interval for "Press Start" text
        this.blinkInterval = null;
        this.showText = true;

        // Register semantic event commands for scriptability
        this.registerCommands();
        this.registerQueries();
    }

    registerCommands() {
        this.registerCommand('start', () => {
            if (!this.isGameRunning) {
                this.startGame();
            }
            return { success: true };
        });

        this.registerCommand('pause', () => {
            if (this.isGameRunning && !this.isPaused && !this.isGameOver) {
                this.togglePause();
            }
            return { success: true, isPaused: this.isPaused };
        });

        this.registerCommand('resume', () => {
            if (this.isGameRunning && this.isPaused) {
                this.togglePause();
            }
            return { success: true, isPaused: this.isPaused };
        });

        this.registerCommand('reset', () => {
            this.resetToTitle();
            return { success: true };
        });
    }

    registerQueries() {
        this.registerQuery('getState', () => {
            return {
                score: this.score,
                highScore: this.highScore,
                isGameRunning: this.isGameRunning,
                isPaused: this.isPaused,
                isGameOver: this.isGameOver,
                snakeLength: this.snake.length,
                gameSpeed: this.gameSpeed
            };
        });
    }

    onOpen() {
        this.highScore = StorageManager.get('snakeHigh') || 0;
        
        return `
            <div class="snake-app">
                <div class="snake-bar">
                    <div class="score-display">SCORE: <span id="s-score">0</span></div>
                    <div class="high-display">HI-SCORE: <span id="s-high">${this.highScore}</span></div>
                </div>

                <div class="game-wrapper">
                    <div class="game-bezel">
                        <div class="game-viewport">
                            <canvas id="snakeCanvas" width="300" height="300"></canvas>
                            <div class="scanlines"></div>
                            
                            <div id="overlay" class="snake-overlay hidden">
                                <div class="overlay-msg">GAME OVER</div>
                                <button class="win95-btn" id="btnRetry">INSERT COIN</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="snake-controls">
                    <button class="win95-btn small" id="btnPause">PAUSE</button>
                    <span class="hint">ARROWS / WASD</span>
                </div>
            </div>
        `;
    }

    onMount() {
        this.canvas = this.getElement('#snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Button Listeners
        this.getElement('#btnRetry').addEventListener('click', () => this.resetToTitle());
        this.getElement('#btnPause').addEventListener('click', () => this.togglePause());

        // Keyboard Listener
        this.addHandler(document, 'keydown', (e) => this.handleInput(e));

        this.resetToTitle();
    }

    onClose() {
        this.stopLoop();
        if (this.blinkInterval) clearInterval(this.blinkInterval);
    }

    // --- Game States ---

    resetToTitle() {
        this.stopLoop();
        this.isGameRunning = false;
        this.isGameOver = false;
        this.isPaused = false;
        this.score = 0;
        this.updateScoreUI();
        this.getElement('#overlay').classList.add('hidden');
        
        if (this.blinkInterval) clearInterval(this.blinkInterval);
        this.blinkInterval = setInterval(() => {
            this.showText = !this.showText;
            this.drawTitleScreen();
        }, 600);
        
        this.drawTitleScreen();
    }

    startGame() {
        if (this.blinkInterval) clearInterval(this.blinkInterval);
        this.isGameRunning = true;

        // Init Snake (Center-ish)
        this.snake = [
            { x: 10, y: 15 },
            { x: 10, y: 16 },
            { x: 10, y: 17 }
        ];
        this.velocity = { x: 0, y: -1 }; // Move up
        this.moveQueue = [];
        this.gameSpeed = 110;

        this.placeFood();
        this.gameLoop();

        this.emitAppEvent('game:start', {
            gridSize: this.gridSize,
            tileCount: this.tileCount
        });

        // Emit game started event
        EventBus.emit('game:start', {
            appId: 'snake',
            settings: { gridSize: this.gridSize, tileCount: this.tileCount }
        });
    }

    stopLoop() {
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
            this.gameLoopId = null;
        }
    }

    gameLoop() {
        if (!this.isPaused && !this.isGameOver && this.isGameRunning) {
            this.update();
            this.draw();
        }
        
        if (this.isGameRunning && !this.isGameOver) {
            this.gameLoopId = setTimeout(() => this.gameLoop(), this.gameSpeed);
        }
    }

    // --- Inputs ---

    handleInput(e) {
        if (!this.isOpen) return;

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }

        if (!this.isGameRunning) {
            this.startGame();
            return;
        }

        if (e.key === ' ' || e.key === 'Escape') {
            this.togglePause();
            return;
        }

        if (this.isPaused || this.isGameOver) return;

        const keyMap = {
            'ArrowUp': { x: 0, y: -1 }, 'w': { x: 0, y: -1 }, 'W': { x: 0, y: -1 },
            'ArrowDown': { x: 0, y: 1 }, 's': { x: 0, y: 1 }, 'S': { x: 0, y: 1 },
            'ArrowLeft': { x: -1, y: 0 }, 'a': { x: -1, y: 0 }, 'A': { x: -1, y: 0 },
            'ArrowRight': { x: 1, y: 0 }, 'd': { x: 1, y: 0 }, 'D': { x: 1, y: 0 }
        };

        const desiredDir = keyMap[e.key];
        if (desiredDir) {
            this.moveQueue.push(desiredDir);
        }
    }

    togglePause() {
        if (!this.isGameRunning || this.isGameOver) return;
        this.isPaused = !this.isPaused;
        this.getElement('#btnPause').innerText = this.isPaused ? "RESUME" : "PAUSE";

        // Emit pause/resume events
        EventBus.emit(this.isPaused ? 'game:pause' : 'game:resume', {
            appId: 'snake',
            time: null,
            score: this.score
        });

        if (this.isPaused) {
            this.ctx.fillStyle = "rgba(0,0,0,0.4)";
            this.ctx.fillRect(0, 0, 300, 300);
            this.ctx.fillStyle = "#fff";
            this.ctx.font = "20px 'Courier New'";
            this.ctx.textAlign = "center";
            this.ctx.fillText("PAUSED", 150, 150);
        } else {
            this.draw();
        }
    }

    // --- Core Logic ---

    update() {
        if (this.moveQueue.length > 0) {
            const nextDir = this.moveQueue.shift();
            if ((this.velocity.x === 0 && nextDir.x !== 0) || 
                (this.velocity.y === 0 && nextDir.y !== 0)) {
                this.velocity = nextDir;
            } else if (this.moveQueue.length > 0) {
                this.update(); 
                return;
            }
        }

        const head = {
            x: this.snake[0].x + this.velocity.x,
            y: this.snake[0].y + this.velocity.y
        };

        // Wall Collision - Strict check against tile count
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            EventBus.emit('snake:collision', { type: 'wall', x: head.x, y: head.y });
            this.gameOver();
            return;
        }

        // Self Collision
        for (let i = 0; i < this.snake.length - 1; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                EventBus.emit('snake:collision', { type: 'self', x: head.x, y: head.y });
                this.gameOver();
                return;
            }
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            const oldScore = this.score;
            this.score += 10;
            this.updateScoreUI();

            this.emitAppEvent('food:eaten', {
                x: this.food.x,
                y: this.food.y,
                score: this.score,
                snakeLength: this.snake.length
            });

            this.emitAppEvent('score:updated', {
                score: this.score,
                previousScore: oldScore,
                delta: 10
            });

            // Emit food eaten event
            EventBus.emit('snake:food:eat', {
                x: this.food.x,
                y: this.food.y,
                score: this.score,
                length: this.snake.length
            });

            // Emit score change event
            EventBus.emit('game:score', {
                appId: 'snake',
                score: this.score,
                delta: 10,
                reason: 'food_eaten'
            });

            this.placeFood();
            this.playSound('click');

            if (this.gameSpeed > 50) {
                const oldSpeed = this.gameSpeed;
                this.gameSpeed -= 2;
                // Emit speed change event
                EventBus.emit('snake:speed', {
                    speed: this.gameSpeed,
                    previousSpeed: oldSpeed
                });
            }
        } else {
            this.snake.pop();
        }
    }

    // --- Rendering ---

    drawTitleScreen() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#00AA00';
        this.ctx.fillRect(135, 120, 30, 15);
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(135, 105, 30, 15);

        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#00FF00";
        this.ctx.font = "bold 24px 'Courier New'";
        this.ctx.fillText("S N A K E", 150, 80);

        if (this.showText) {
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = "14px 'Courier New'";
            this.ctx.fillText("PRESS SPACE TO START", 150, 220);
        }
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Snake - Drawing within bounds guaranteed by logic
        this.snake.forEach((segment, i) => {
            this.ctx.fillStyle = i === 0 ? '#00FF00' : '#00AA00';
            // +1 offset and -2 size gives a 1px gap between tiles
            this.ctx.fillRect(
                segment.x * this.gridSize + 1, 
                segment.y * this.gridSize + 1, 
                this.gridSize - 2, 
                this.gridSize - 2
            );
        });

        // Food
        this.ctx.fillStyle = '#FF0000';
        const cx = (this.food.x * this.gridSize) + (this.gridSize/2);
        const cy = (this.food.y * this.gridSize) + (this.gridSize/2);
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, (this.gridSize/2) - 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    placeFood() {
        let valid = false;
        while (!valid) {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                // Ensure food is strictly within bounds (0-19)
                y: Math.floor(Math.random() * this.tileCount)
            };
            valid = !this.snake.some(s => s.x === this.food.x && s.y === this.food.y);
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.playSound('error');

        this.emitAppEvent('game:over', {
            score: this.score,
            snakeLength: this.snake.length
        });

        const isHighScore = this.score > this.highScore;
        if (isHighScore) {
            const previousScore = this.highScore;
            this.highScore = this.score;
            StorageManager.set('snakeHigh', this.score);
            this.getElement('#s-high').innerText = this.highScore;
            if(StateManager.unlockAchievement) StateManager.unlockAchievement('snake_master');

            // Emit high score event
            EventBus.emit('game:highscore', {
                appId: 'snake',
                score: this.score,
                previousScore: previousScore
            });
        }

        // Emit game over event
        EventBus.emit('game:over', {
            appId: 'snake',
            won: false,
            score: this.score,
            stats: { length: this.snake.length, isHighScore }
        });

        this.getElement('#overlay').classList.remove('hidden');
    }

    updateScoreUI() {
        this.getElement('#s-score').innerText = this.score;
    }
}

// Retro Styling - FIXES APPLIED HERE
const style = document.createElement('style');
style.textContent = `
    .snake-app {
        background: #c0c0c0;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 6px;
        box-sizing: border-box;
        font-family: 'Courier New', monospace;
        user-select: none;
    }

    .snake-bar {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        background: #000;
        border: 2px inset #808080;
        padding: 6px 10px;
        color: #00FF00;
        font-weight: bold;
        letter-spacing: 1px;
        flex-shrink: 0;
    }

    .game-wrapper {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #808080;
        border: 2px outset #fff;
        padding: 5px; /* Reduced padding */
    }

    /* The Bezel hold the thick border */
    .game-bezel {
        border: 4px inset #404040; /* Deep bezel */
        background: #000;
        padding: 2px; /* PADDING ADDED: This ensures the canvas isn't clipped by the bezel */
        box-shadow: inset 0 0 10px #000;
        display: inline-block;
    }

    /* The viewport holds the canvas and overlays */
    .game-viewport {
        position: relative;
        width: 300px;
        height: 300px;
        overflow: hidden;
    }

    /* CRT Scanline Effect */
    .scanlines {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.25) 50%
        );
        background-size: 100% 4px;
        pointer-events: none;
        z-index: 5;
    }

    canvas { display: block; background: #000; }

    .snake-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10;
        gap: 20px;
    }
    .snake-overlay.hidden { display: none; }
    
    .overlay-msg {
        color: #FF0000;
        font-size: 36px;
        font-weight: bold;
        letter-spacing: 3px;
        text-shadow: 2px 2px #550000;
        animation: blink 1s infinite;
    }

    .snake-controls {
        margin-top: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        color: #444;
        font-weight: bold;
        flex-shrink: 0;
    }

    .hint { margin-left: auto; color: #555; text-shadow: 1px 1px white; }

    .win95-btn {
        background: #c0c0c0;
        border: 2px outset #fff;
        padding: 5px 15px;
        cursor: pointer;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        text-transform: uppercase;
    }
    .win95-btn:active { border-style: inset; }

    @keyframes blink { 
        0% { opacity: 1; }
        50% { opacity: 0; }
        100% { opacity: 1; }
    }
`;
if (!document.getElementById('snake-styles')) {
    style.id = 'snake-styles';
    document.head.appendChild(style);
}

export default Snake;