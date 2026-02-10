/**
 * Solitaire (Klondike)
 * Fixed: Window decorations (title bar/buttons) are now visible.
 * Layout: Flexbox-based to fit inside the window body correctly.
 */

import AppBase from './AppBase.js';
import StateManager from '../core/StateManager.js';
import EventBus from '../core/EventBus.js';

class Solitaire extends AppBase {
    constructor() {
        super({
            id: 'solitaire',
            name: 'Solitaire',
            icon: '🃏',
            width: 765,
            height: 625,
            resizable: false,
            category: 'games',
            singleton: true // One game at a time
        });

        this.resetState();
    }

    resetState() {
        this.deck = [];
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.moves = 0;
        this.time = 0;
        this.timer = null;
        this.isWon = false;
        this.draggedData = null;
    }

    onOpen() {
        // The root class .solitaire-app now fills the parent container naturally
        return `
            <div class="solitaire-app">
                <div class="solitaire-bar">
                    <button class="win95-btn" id="btnNew">New Game</button>
                    <div style="flex:1"></div>
                    <div class="status-box">Time: <span id="timer">0</span></div>
                    <div class="status-box">Score: <span id="score">0</span></div>
                </div>
                
                <div class="solitaire-table" id="gameTable">
                    <div class="top-area">
                        <div class="pile-group left">
                            <div class="card-slot stock-slot" id="stock"></div>
                            <div class="card-slot waste-slot" id="waste"></div>
                        </div>
                        <div class="pile-group right">
                            <div class="card-slot foundation-slot" id="f0"></div>
                            <div class="card-slot foundation-slot" id="f1"></div>
                            <div class="card-slot foundation-slot" id="f2"></div>
                            <div class="card-slot foundation-slot" id="f3"></div>
                        </div>
                    </div>

                    <div class="tableau-area">
                        ${[0,1,2,3,4,5,6].map(i => `
                            <div class="tableau-col" id="t${i}" data-col="${i}"></div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    onMount() {
        this.getElement('#btnNew').addEventListener('click', () => this.startNewGame());
        this.getElement('#stock').addEventListener('click', () => this.drawStock());
        this.setupDropZones();
        this.startNewGame();
    }

    setupDropZones() {
        const allowDrop = (e) => e.preventDefault();
        
        [0,1,2,3].forEach(i => {
            const el = this.getElement(`#f${i}`);
            el.addEventListener('dragover', allowDrop);
            el.addEventListener('drop', (e) => this.handleDrop(e, 'foundation', i));
        });

        [0,1,2,3,4,5,6].forEach(i => {
            const el = this.getElement(`#t${i}`);
            el.addEventListener('dragover', allowDrop);
            el.addEventListener('drop', (e) => this.handleDrop(e, 'tableau', i));
        });
    }

    onClose() {
        clearInterval(this.timer);
    }

    // --- Logic ---
    startNewGame() {
        clearInterval(this.timer);
        this.resetState();
        this.updateHeader();

        // Build Deck
        this.deck = [];
        this.suits.forEach(suit => {
            this.values.forEach((val, idx) => {
                this.deck.push({
                    suit, val,
                    rank: idx + 1,
                    color: this.colors[suit],
                    faceUp: false,
                    id: Math.random().toString(36).substr(2, 9)
                });
            });
        });
        this.deck.sort(() => Math.random() - 0.5);

        // Deal
        this.stock = [...this.deck];
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j <= i; j++) {
                let card = this.stock.pop();
                if (j === i) card.faceUp = true;
                this.tableau[i].push(card);
            }
        }

        this.renderAll();
        this.timer = setInterval(() => { this.time++; this.updateHeader(); }, 1000);

        // Emit game started event
        EventBus.emit('game:start', {
            appId: 'solitaire',
            settings: { type: 'klondike' }
        });
    }

    drawStock() {
        if (this.stock.length === 0) {
            if (this.waste.length === 0) return;
            const cardsRecycled = this.waste.length;
            this.stock = this.waste.reverse().map(c => ({...c, faceUp: false}));
            this.waste = [];

            // Emit stock recycle event
            EventBus.emit('solitaire:stock:recycle', { cardsRecycled });
        } else {
            let card = this.stock.pop();
            card.faceUp = true;
            this.waste.push(card);

            // Emit stock draw event
            EventBus.emit('solitaire:stock:draw', {
                card: `${card.val}${card.suit}`,
                stockRemaining: this.stock.length
            });
        }
        this.renderStock();
        this.renderWaste();
    }

    // --- Drag Logic ---
    handleDragStart(e, card, source, pileIdx, cardIdx) {
        const data = JSON.stringify({ source, pileIdx, cardIdx });
        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.effectAllowed = 'move';
        this.draggedData = { card, source, pileIdx, cardIdx };
    }

    handleDrop(e, targetType, targetIdx) {
        e.preventDefault();
        e.stopPropagation();
        if (!this.draggedData) return;

        const { card, source, pileIdx, cardIdx } = this.draggedData;
        const targetPile = targetType === 'tableau' ? this.tableau[targetIdx] : this.foundations[targetIdx];
        let valid = false;

        if (targetType === 'tableau') {
            if (targetPile.length === 0) {
                if (card.rank === 13) valid = true;
            } else {
                const top = targetPile[targetPile.length - 1];
                if (top.color !== card.color && top.rank === card.rank + 1) valid = true;
            }
        } else if (targetType === 'foundation') {
            if (source === 'tableau') {
                const tableauCol = this.tableau[pileIdx];
                if (cardIdx !== tableauCol.length - 1) return; 
            }
            if (targetPile.length === 0) {
                if (card.rank === 1) valid = true;
            } else {
                const top = targetPile[targetPile.length - 1];
                if (top.suit === card.suit && top.rank === card.rank - 1) valid = true;
            }
        }

        if (valid) {
            this.executeMove(source, pileIdx, cardIdx, targetType, targetIdx);
        }
        this.draggedData = null;
    }

    executeMove(fromType, fromIdx, fromCardIdx, toType, toIdx) {
        let cardsToMove = [];
        if (fromType === 'waste') cardsToMove = [this.waste.pop()];
        else if (fromType === 'foundation') cardsToMove = [this.foundations[fromIdx].pop()];
        else if (fromType === 'tableau') {
            const col = this.tableau[fromIdx];
            cardsToMove = col.splice(fromCardIdx);
            if (col.length > 0) col[col.length - 1].faceUp = true;
        }

        if (toType === 'tableau') this.tableau[toIdx].push(...cardsToMove);
        else if (toType === 'foundation') {
            this.foundations[toIdx].push(...cardsToMove);

            // Emit foundation add event
            EventBus.emit('solitaire:foundation:add', {
                card: `${cardsToMove[0].val}${cardsToMove[0].suit}`,
                foundation: toIdx,
                count: this.foundations[toIdx].length
            });
        }

        this.moves++;

        // Emit card move event
        EventBus.emit('solitaire:card:move', {
            card: `${cardsToMove[0].val}${cardsToMove[0].suit}`,
            from: `${fromType}:${fromIdx}`,
            to: `${toType}:${toIdx}`,
            moves: this.moves
        });

        this.renderAll();
        this.checkWin();
    }

    handleDblClick(card, source, pileIdx) {
        for (let i = 0; i < 4; i++) {
            const pile = this.foundations[i];
            let valid = false;
            if (pile.length === 0) {
                if (card.rank === 1) valid = true;
            } else {
                const top = pile[pile.length - 1];
                if (top.suit === card.suit && top.rank === card.rank - 1) valid = true;
            }

            if (valid) {
                let cIdx = 0;
                if (source === 'tableau') cIdx = this.tableau[pileIdx].length - 1;
                this.executeMove(source, pileIdx, cIdx, 'foundation', i);
                return;
            }
        }
    }

    checkWin() {
        const total = this.foundations.reduce((acc, f) => acc + f.length, 0);
        if (total === 52 && !this.isWon) {
            this.isWon = true;
            clearInterval(this.timer);
            if (StateManager.unlockAchievement) StateManager.unlockAchievement('solitaire_master');

            // Emit win events
            EventBus.emit('solitaire:win', {
                moves: this.moves,
                time: this.time
            });
            EventBus.emit('game:over', {
                appId: 'solitaire',
                won: true,
                score: this.moves * 5,
                time: this.time,
                stats: { moves: this.moves }
            });

            this.alert("You Won!");
        }
    }

    // --- Render ---
    updateHeader() {
        const t = this.getElement('#timer');
        const s = this.getElement('#score');
        if(t) t.innerText = this.time;
        if(s) s.innerText = this.moves * 5;
    }

    renderAll() {
        this.renderStock();
        this.renderWaste();
        [0,1,2,3].forEach(i => {
            const el = this.getElement(`#f${i}`);
            el.innerHTML = '';
            const pile = this.foundations[i];
            if (pile.length === 0) el.innerHTML = `<div class="placeholder">A</div>`;
            else el.appendChild(this.createCardElement(pile[pile.length - 1], 'foundation', i, pile.length - 1));
        });
        [0,1,2,3,4,5,6].forEach(i => {
            const el = this.getElement(`#t${i}`);
            el.innerHTML = '';
            this.tableau[i].forEach((card, idx) => {
                const cardEl = this.createCardElement(card, 'tableau', i, idx);
                cardEl.style.top = (idx * 25) + 'px'; 
                el.appendChild(cardEl);
            });
        });
    }

    renderStock() {
        const el = this.getElement('#stock');
        el.innerHTML = this.stock.length ? `<div class="sol-card sol-back"></div>` : `<div class="placeholder">↻</div>`;
    }
    renderWaste() {
        const el = this.getElement('#waste');
        el.innerHTML = '';
        if (this.waste.length) el.appendChild(this.createCardElement(this.waste[this.waste.length - 1], 'waste', 0, this.waste.length-1));
    }

    createCardElement(card, source, pileIdx, cardIdx) {
        const div = document.createElement('div');
        div.className = `sol-card ${card.color}`;
        if (!card.faceUp) {
            div.classList.add('sol-back');
            return div;
        }
        div.innerHTML = `
            <div class="card-corner top-left">${card.val} ${card.suit}</div>
            <div class="card-center">${card.suit}</div>
            <div class="card-corner btm-right">${card.val} ${card.suit}</div>
        `;
        div.draggable = true;
        div.addEventListener('dragstart', (e) => this.handleDragStart(e, card, source, pileIdx, cardIdx));
        div.addEventListener('dblclick', () => this.handleDblClick(card, source, pileIdx));
        return div;
    }

    // Constants
    get suits() { return ['♠', '♥', '♦', '♣']; }
    get colors() { return { '♠': 'black', '♥': 'red', '♦': 'red', '♣': 'black' }; }
    get values() { return ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']; }
}

// --- CSS FIXES ---
const style = document.createElement('style');
style.textContent = `
    /* Main container is relative now, allowing it to sit INSIDE the window body */
    .solitaire-app {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        background-color: #008000;
        font-family: 'Segoe UI', sans-serif;
        overflow: hidden;
    }

    .solitaire-bar {
        flex: 0 0 35px;
        background: #c0c0c0;
        display: flex;
        align-items: center;
        padding: 0 5px;
        border-bottom: 2px solid white;
    }

    /* Scrollable game area */
    .solitaire-table {
        flex: 1;
        overflow-y: auto; 
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        position: relative;
    }

    .top-area {
        display: flex;
        justify-content: space-between;
        height: 100px;
        flex-shrink: 0;
    }

    .tableau-area {
        display: flex;
        justify-content: space-between;
        flex: 1;
        min-height: 400px;
        padding-bottom: 50px;
    }

    .tableau-col {
        width: 13%;
        max-width: 80px;
        position: relative;
        min-height: 100px;
    }

    /* Cards */
    .card-slot { width: 64px; height: 90px; border-radius: 4px; position: relative; }
    .stock-slot, .foundation-slot { border: 2px inset #005500; }
    .placeholder { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: rgba(255,255,255,0.3); font-size: 20px; }
    
    .sol-card {
        width: 64px; height: 90px;
        background: white; border: 1px solid #333; border-radius: 4px;
        position: absolute; box-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        cursor: grab; box-sizing: border-box; z-index: 10;
    }
    .sol-card:active { cursor: grabbing; }
    .sol-back { background: repeating-linear-gradient(45deg, #000080, #000080 5px, #002060 5px, #002060 10px); border: 2px solid white; }
    .sol-card.red { color: #d00000; }
    .sol-card.black { color: #000; }
    
    .card-corner { position: absolute; font-size: 12px; font-weight: bold; line-height: 1; }
    .top-left { top: 4px; left: 4px; }
    .btm-right { bottom: 4px; right: 4px; transform: rotate(180deg); }
    .card-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 28px; }
    
    .win95-btn { border: 2px outset white; background: #c0c0c0; cursor: pointer; padding: 2px 8px; font-weight: bold; font-size: 11px; }
    .win95-btn:active { border-style: inset; }
    .status-box { background: black; color: lime; font-family: monospace; padding: 2px 5px; border: 2px inset grey; font-size: 12px; margin-left: 5px; }
    .pile-group { display: flex; gap: 10px; }
`;

if (!document.getElementById('solitaire-css')) {
    style.id = 'solitaire-css';
    document.head.appendChild(style);
}

export default Solitaire;