/**
 * FreeCell App
 * Classic Windows FreeCell solitaire card game
 *
 * Rules:
 * - 4 free cells (top left) - can hold one card each
 * - 4 foundation piles (top right) - build up by suit from Ace to King
 * - 8 tableau columns - build down in alternating colors
 * - All cards face up, can move single cards or sequences
 */

import AppBase from './AppBase.js';
import EventBus from '../core/SemanticEventBus.js';

class FreeCell extends AppBase {
    constructor() {
        super({
            id: 'freecell',
            name: 'FreeCell',
            icon: '🃏',
            width: 750,
            height: 580,
            resizable: false,
            category: 'games',
            singleton: true
        });
    }

    onOpen() {
        this.resetState();

        return `
            <div class="freecell-app">
                <div class="freecell-header">
                    <button class="fc-btn" id="fcNewGame">New Game</button>
                    <button class="fc-btn" id="fcUndo" disabled>Undo</button>
                    <div class="fc-spacer"></div>
                    <div class="fc-stats">
                        <span class="fc-stat">Moves: <span id="fcMoves">0</span></span>
                        <span class="fc-stat">Time: <span id="fcTime">0:00</span></span>
                    </div>
                </div>

                <div class="freecell-board">
                    <div class="fc-top-row">
                        <div class="fc-cells">
                            ${[0, 1, 2, 3].map(i => `
                                <div class="fc-cell free-cell" id="cell${i}" data-type="cell" data-index="${i}"></div>
                            `).join('')}
                        </div>
                        <div class="fc-foundations">
                            ${[0, 1, 2, 3].map(i => `
                                <div class="fc-cell foundation" id="found${i}" data-type="foundation" data-index="${i}">
                                    <span class="fc-suit-hint">${['♠', '♥', '♣', '♦'][i]}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="fc-tableau">
                        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `
                            <div class="fc-column" id="col${i}" data-type="column" data-index="${i}"></div>
                        `).join('')}
                    </div>
                </div>

                <!-- Win Screen -->
                <div class="fc-win-screen" id="fcWinScreen">
                    <div class="fc-win-content">
                        <div class="fc-win-title">🎉 You Win! 🎉</div>
                        <div class="fc-win-stats">
                            <div>Moves: <span id="fcWinMoves">0</span></div>
                            <div>Time: <span id="fcWinTime">0:00</span></div>
                        </div>
                        <button class="btn fc-win-btn" id="fcPlayAgain">Play Again</button>
                    </div>
                </div>
            </div>
        `;
    }

    resetState() {
        this.deck = [];
        this.cells = [null, null, null, null]; // 4 free cells
        this.foundations = [[], [], [], []];   // 4 foundation piles (one per suit)
        this.columns = [[], [], [], [], [], [], [], []]; // 8 tableau columns
        this.moves = 0;
        this.time = 0;
        this.timer = null;
        this.moveHistory = [];
        this.selectedCard = null; // { source, sourceIndex, cardIndex }
        this.suitOrder = ['♠', '♥', '♣', '♦'];
    }

    onMount() {
        // Game controls
        this.addHandler(this.getElement('#fcNewGame'), 'click', () => this.startNewGame());
        this.addHandler(this.getElement('#fcUndo'), 'click', () => this.undoMove());
        this.addHandler(this.getElement('#fcPlayAgain'), 'click', () => this.startNewGame());

        // Card interactions - clicks
        this.addHandler(this.getElement('.freecell-board'), 'click', (e) => this.handleClick(e));

        // Keyboard
        this.addHandler(document, 'keydown', (e) => {
            if (!this.getWindow()?.classList.contains('active')) return;
            if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.undoMove();
            } else if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.startNewGame();
            }
        });

        this.startNewGame();
    }

    onClose() {
        if (this.timer) clearInterval(this.timer);
    }

    // --- Game Logic ---

    startNewGame() {
        if (this.timer) clearInterval(this.timer);
        this.resetState();

        // Hide win screen
        this.getElement('#fcWinScreen').classList.remove('active');

        // Build and shuffle deck
        this.deck = [];
        this.suitOrder.forEach((suit, suitIdx) => {
            for (let rank = 1; rank <= 13; rank++) {
                this.deck.push({
                    suit,
                    suitIndex: suitIdx,
                    rank,
                    value: this.getRankDisplay(rank),
                    color: (suit === '♥' || suit === '♦') ? 'red' : 'black',
                    id: `${suit}${rank}`
                });
            }
        });

        // Shuffle using Fisher-Yates
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }

        // Deal to 8 columns (4 columns get 7 cards, 4 get 6)
        let cardIndex = 0;
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 8; col++) {
                if (row < 6 || col < 4) {
                    this.columns[col].push(this.deck[cardIndex++]);
                }
            }
        }

        // Start timer
        this.time = 0;
        this.timer = setInterval(() => {
            this.time++;
            this.updateDisplay();
        }, 1000);

        this.renderBoard();
        this.updateDisplay();

        // Emit game started event
        EventBus.emit('game:start', {
            appId: 'freecell',
            settings: { type: 'freecell' }
        });
    }

    getRankDisplay(rank) {
        const faces = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
        return faces[rank] || rank.toString();
    }

    handleClick(e) {
        const target = e.target.closest('.fc-card, .fc-cell, .fc-column');
        if (!target) return;

        const card = e.target.closest('.fc-card');
        const cell = target.closest('.fc-cell');
        const column = target.closest('.fc-column');

        if (card) {
            // Clicked on a card
            this.handleCardClick(card, cell, column);
        } else if (cell || column) {
            // Clicked on empty cell or column
            this.handleEmptyClick(cell, column);
        }
    }

    handleCardClick(cardEl, cell, column) {
        const source = cardEl.dataset.source;
        const sourceIndex = parseInt(cardEl.dataset.sourceIndex);
        const cardIndex = parseInt(cardEl.dataset.cardIndex);

        // Double-click auto-move to foundation
        if (cardEl.classList.contains('selected')) {
            this.autoMoveToFoundation(source, sourceIndex, cardIndex);
            this.clearSelection();
            return;
        }

        // First click - select card
        if (!this.selectedCard) {
            // Can only select top card from cell, or any card from column (as sequence start)
            if (source === 'cell' || source === 'foundation') {
                // Only top card
                this.selectCard(source, sourceIndex, cardIndex);
            } else if (source === 'column') {
                // Check if valid sequence from this card down
                const col = this.columns[sourceIndex];
                if (this.isValidSequence(col, cardIndex)) {
                    this.selectCard(source, sourceIndex, cardIndex);
                }
            }
        } else {
            // Second click - try to move
            this.tryMove(source, sourceIndex, cardIndex);
        }
    }

    handleEmptyClick(cell, column) {
        if (!this.selectedCard) return;

        if (cell) {
            const type = cell.dataset.type;
            const index = parseInt(cell.dataset.index);

            if (type === 'cell') {
                this.tryMoveToCell(index);
            } else if (type === 'foundation') {
                this.tryMoveToFoundation(index);
            }
        } else if (column) {
            const index = parseInt(column.dataset.index);
            this.tryMoveToColumn(index);
        }
    }

    selectCard(source, sourceIndex, cardIndex) {
        this.clearSelection();
        this.selectedCard = { source, sourceIndex, cardIndex };

        // Highlight selected cards
        const selector = `.fc-card[data-source="${source}"][data-source-index="${sourceIndex}"]`;
        this.getElements(selector).forEach(card => {
            if (parseInt(card.dataset.cardIndex) >= cardIndex) {
                card.classList.add('selected');
            }
        });
    }

    clearSelection() {
        this.selectedCard = null;
        this.getElements('.fc-card.selected').forEach(c => c.classList.remove('selected'));
    }

    tryMove(destSource, destSourceIndex, destCardIndex) {
        if (!this.selectedCard) return;

        if (destSource === 'column') {
            this.tryMoveToColumn(destSourceIndex);
        } else if (destSource === 'foundation') {
            this.tryMoveToFoundation(destSourceIndex);
        } else if (destSource === 'cell') {
            this.tryMoveToCell(destSourceIndex);
        }
    }

    tryMoveToCell(cellIndex) {
        if (!this.selectedCard) return;
        if (this.cells[cellIndex] !== null) {
            this.clearSelection();
            return;
        }

        const { source, sourceIndex, cardIndex } = this.selectedCard;

        // Can only move single card to cell
        if (source === 'column') {
            const col = this.columns[sourceIndex];
            if (cardIndex !== col.length - 1) {
                this.clearSelection();
                return; // Not bottom card
            }
        }

        // Get the card
        const card = this.getCardAt(source, sourceIndex, cardIndex);
        if (!card) {
            this.clearSelection();
            return;
        }

        // Save for undo
        this.saveMove();

        // Move card
        this.removeCard(source, sourceIndex, cardIndex);
        this.cells[cellIndex] = card;
        this.moves++;

        // Emit cell occupy event
        EventBus.emit('freecell:cell:occupy', {
            card: `${card.value}${card.suit}`,
            cell: cellIndex,
            freeCellsRemaining: this.cells.filter(c => c === null).length
        });

        // Emit card move event
        EventBus.emit('freecell:card:move', {
            card: `${card.value}${card.suit}`,
            from: `${source}:${sourceIndex}`,
            to: `cell:${cellIndex}`,
            moves: this.moves
        });

        this.clearSelection();
        this.renderBoard();
        this.updateDisplay();
        this.playSound('click');
    }

    tryMoveToFoundation(foundIndex) {
        if (!this.selectedCard) return;
        const { source, sourceIndex, cardIndex } = this.selectedCard;

        // Can only move single card to foundation
        if (source === 'column') {
            const col = this.columns[sourceIndex];
            if (cardIndex !== col.length - 1) {
                this.clearSelection();
                return;
            }
        }

        const card = this.getCardAt(source, sourceIndex, cardIndex);
        if (!card) {
            this.clearSelection();
            return;
        }

        // Check if valid foundation move
        const foundation = this.foundations[foundIndex];
        if (foundation.length === 0) {
            // Must be Ace
            if (card.rank !== 1) {
                this.clearSelection();
                return;
            }
        } else {
            const topCard = foundation[foundation.length - 1];
            // Must be same suit and next rank
            if (card.suit !== topCard.suit || card.rank !== topCard.rank + 1) {
                this.clearSelection();
                return;
            }
        }

        // Valid move
        this.saveMove();
        this.removeCard(source, sourceIndex, cardIndex);
        this.foundations[foundIndex].push(card);
        this.moves++;

        // Emit foundation add event
        EventBus.emit('freecell:foundation:add', {
            card: `${card.value}${card.suit}`,
            foundation: foundIndex,
            count: this.foundations[foundIndex].length
        });

        // Emit card move event
        EventBus.emit('freecell:card:move', {
            card: `${card.value}${card.suit}`,
            from: `${source}:${sourceIndex}`,
            to: `foundation:${foundIndex}`,
            moves: this.moves
        });

        this.clearSelection();
        this.renderBoard();
        this.updateDisplay();
        this.playSound('click');
        this.checkWin();
    }

    tryMoveToColumn(colIndex) {
        if (!this.selectedCard) return;
        const { source, sourceIndex, cardIndex } = this.selectedCard;

        const destCol = this.columns[colIndex];
        const card = this.getCardAt(source, sourceIndex, cardIndex);
        if (!card) {
            this.clearSelection();
            return;
        }

        // Count cards to move
        let cardsToMove = 1;
        if (source === 'column') {
            cardsToMove = this.columns[sourceIndex].length - cardIndex;
        }

        // Check if we have enough free cells/columns for the move
        const maxMovable = this.getMaxMovable(colIndex);
        if (cardsToMove > maxMovable) {
            this.clearSelection();
            return;
        }

        // Check if valid move
        if (destCol.length === 0) {
            // Any card (or sequence) can go on empty column
        } else {
            const topCard = destCol[destCol.length - 1];
            // Must be opposite color and one rank lower
            if (card.color === topCard.color || card.rank !== topCard.rank - 1) {
                this.clearSelection();
                return;
            }
        }

        // Valid move
        this.saveMove();

        // Move cards
        const cards = [];
        if (source === 'column') {
            for (let i = cardIndex; i < this.columns[sourceIndex].length; i++) {
                cards.push(this.columns[sourceIndex][i]);
            }
            this.columns[sourceIndex].splice(cardIndex);
        } else if (source === 'cell') {
            cards.push(this.cells[sourceIndex]);
            this.cells[sourceIndex] = null;
        } else if (source === 'foundation') {
            cards.push(this.foundations[sourceIndex].pop());
        }

        this.columns[colIndex].push(...cards);
        this.moves++;

        this.clearSelection();
        this.renderBoard();
        this.updateDisplay();
        this.playSound('click');
    }

    autoMoveToFoundation(source, sourceIndex, cardIndex) {
        const card = this.getCardAt(source, sourceIndex, cardIndex);
        if (!card) return;

        // Can only auto-move single card
        if (source === 'column') {
            const col = this.columns[sourceIndex];
            if (cardIndex !== col.length - 1) return;
        }

        // Find matching foundation
        for (let i = 0; i < 4; i++) {
            const foundation = this.foundations[i];
            if (foundation.length === 0) {
                if (card.rank === 1) {
                    // Move ace
                    this.selectedCard = { source, sourceIndex, cardIndex };
                    this.tryMoveToFoundation(i);
                    return;
                }
            } else {
                const topCard = foundation[foundation.length - 1];
                if (card.suit === topCard.suit && card.rank === topCard.rank + 1) {
                    this.selectedCard = { source, sourceIndex, cardIndex };
                    this.tryMoveToFoundation(i);
                    return;
                }
            }
        }
    }

    getCardAt(source, sourceIndex, cardIndex) {
        if (source === 'cell') {
            return this.cells[sourceIndex];
        } else if (source === 'foundation') {
            const f = this.foundations[sourceIndex];
            return f.length > 0 ? f[f.length - 1] : null;
        } else if (source === 'column') {
            return this.columns[sourceIndex][cardIndex];
        }
        return null;
    }

    removeCard(source, sourceIndex, cardIndex) {
        if (source === 'cell') {
            this.cells[sourceIndex] = null;
        } else if (source === 'foundation') {
            this.foundations[sourceIndex].pop();
        } else if (source === 'column') {
            this.columns[sourceIndex].splice(cardIndex);
        }
    }

    isValidSequence(column, fromIndex) {
        for (let i = fromIndex; i < column.length - 1; i++) {
            const current = column[i];
            const next = column[i + 1];
            if (current.color === next.color || current.rank !== next.rank + 1) {
                return false;
            }
        }
        return true;
    }

    getMaxMovable(destColIndex) {
        // Formula: (1 + free cells) * 2^(empty columns)
        const freeCells = this.cells.filter(c => c === null).length;
        let emptyColumns = this.columns.filter((col, i) => col.length === 0 && i !== destColIndex).length;

        return (1 + freeCells) * Math.pow(2, emptyColumns);
    }

    // --- Undo System ---

    saveMove() {
        this.moveHistory.push({
            cells: this.cells.map(c => c ? { ...c } : null),
            foundations: this.foundations.map(f => f.map(c => ({ ...c }))),
            columns: this.columns.map(col => col.map(c => ({ ...c }))),
            moves: this.moves
        });

        // Limit history
        if (this.moveHistory.length > 50) {
            this.moveHistory.shift();
        }

        this.getElement('#fcUndo').disabled = false;
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;

        const state = this.moveHistory.pop();
        this.cells = state.cells;
        this.foundations = state.foundations;
        this.columns = state.columns;
        this.moves = state.moves;

        // Emit undo event
        EventBus.emit('freecell:undo', {
            card: 'unknown',
            moves: this.moves
        });

        if (this.moveHistory.length === 0) {
            this.getElement('#fcUndo').disabled = true;
        }

        this.clearSelection();
        this.renderBoard();
        this.updateDisplay();
    }

    // --- Win Check ---

    checkWin() {
        const totalInFoundations = this.foundations.reduce((sum, f) => sum + f.length, 0);
        if (totalInFoundations === 52) {
            this.gameWon();
        }
    }

    gameWon() {
        if (this.timer) clearInterval(this.timer);

        this.getElement('#fcWinMoves').textContent = this.moves;
        this.getElement('#fcWinTime').textContent = this.formatTime(this.time);
        this.getElement('#fcWinScreen').classList.add('active');

        this.playSound('achievement');

        // Emit win events
        EventBus.emit('freecell:win', {
            moves: this.moves,
            time: this.time
        });
        EventBus.emit('game:over', {
            appId: 'freecell',
            won: true,
            time: this.time,
            stats: { moves: this.moves }
        });

        // Victory animation - cascade cards
        this.cascadeVictory();
    }

    cascadeVictory() {
        const board = this.getElement('.freecell-board');
        const cards = [];

        // Create falling cards
        for (let i = 0; i < 52; i++) {
            setTimeout(() => {
                const card = document.createElement('div');
                card.className = 'fc-victory-card';
                card.style.left = Math.random() * 100 + '%';
                card.style.animationDuration = (2 + Math.random() * 2) + 's';
                card.innerHTML = ['♠', '♥', '♣', '♦'][i % 4];
                card.style.color = (i % 4 === 1 || i % 4 === 3) ? 'red' : 'black';
                board.appendChild(card);
                cards.push(card);

                // Clean up
                setTimeout(() => card.remove(), 4000);
            }, i * 50);
        }
    }

    // --- Rendering ---

    renderBoard() {
        // Render free cells
        for (let i = 0; i < 4; i++) {
            const cellEl = this.getElement(`#cell${i}`);
            if (this.cells[i]) {
                cellEl.innerHTML = this.createCardHTML(this.cells[i], 'cell', i, 0);
            } else {
                cellEl.innerHTML = '';
            }
        }

        // Render foundations
        for (let i = 0; i < 4; i++) {
            const foundEl = this.getElement(`#found${i}`);
            const pile = this.foundations[i];
            if (pile.length > 0) {
                const topCard = pile[pile.length - 1];
                foundEl.innerHTML = this.createCardHTML(topCard, 'foundation', i, pile.length - 1);
            } else {
                foundEl.innerHTML = `<span class="fc-suit-hint">${this.suitOrder[i]}</span>`;
            }
        }

        // Render columns
        for (let i = 0; i < 8; i++) {
            const colEl = this.getElement(`#col${i}`);
            const column = this.columns[i];
            colEl.innerHTML = column.map((card, cardIdx) =>
                this.createCardHTML(card, 'column', i, cardIdx)
            ).join('');
        }
    }

    createCardHTML(card, source, sourceIndex, cardIndex) {
        const offset = source === 'column' ? cardIndex * 25 : 0;
        return `
            <div class="fc-card ${card.color}"
                 data-source="${source}"
                 data-source-index="${sourceIndex}"
                 data-card-index="${cardIndex}"
                 style="top: ${offset}px">
                <div class="fc-card-corner top-left">${card.value}${card.suit}</div>
                <div class="fc-card-center">${card.suit}</div>
                <div class="fc-card-corner bottom-right">${card.value}${card.suit}</div>
            </div>
        `;
    }

    updateDisplay() {
        const movesEl = this.getElement('#fcMoves');
        const timeEl = this.getElement('#fcTime');

        if (movesEl) movesEl.textContent = this.moves;
        if (timeEl) timeEl.textContent = this.formatTime(this.time);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }
}

export default FreeCell;
