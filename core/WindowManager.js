/**
 * WindowManager - Central window lifecycle management
 * Handles create, focus, minimize, maximize, close, drag, resize
 * All window operations go through this manager
 */

import EventBus, { Events } from './EventBus.js';
import StateManager from './StateManager.js';

class WindowManagerClass {
    constructor() {
        // Currently dragging window
        this.draggedWindow = null;
        // Currently resizing window
        this.resizingWindow = null;
        // Drag offset
        this.dragOffset = { x: 0, y: 0 };
        // Window counter for z-index
        this.zCounter = 1000;
        // Minimum window dimensions
        this.minWidth = 300;
        this.minHeight = 200;
        // Resize direction for multi-edge resizing
        this.resizeDirection = null;
        // Initial resize state
        this.resizeStart = null;
        // Pre-maximize positions for restore
        this.preMaximizeState = new Map();
        // Snap preview element
        this.snapPreview = null;
        // Bound handlers for cleanup
        this.boundDragMove = this.handleDragMove.bind(this);
        this.boundDragEnd = this.handleDragEnd.bind(this);
        this.boundResizeMove = this.handleResizeMove.bind(this);
        this.boundResizeEnd = this.handleResizeEnd.bind(this);
        // Touch handlers
        this.boundTouchDragMove = this.handleTouchDragMove.bind(this);
        this.boundTouchDragEnd = this.handleTouchDragEnd.bind(this);
        this.boundTouchResizeMove = this.handleTouchResizeMove.bind(this);
        this.boundTouchResizeEnd = this.handleTouchResizeEnd.bind(this);
    }

    /**
     * Initialize window manager
     */
    initialize() {
        // Listen for state changes to update taskbar
        StateManager.subscribe('windows', () => {
            EventBus.emit(Events.TASKBAR_UPDATE);
        });

        // Create snap preview element
        this.snapPreview = document.createElement('div');
        this.snapPreview.className = 'snap-preview';
        document.body.appendChild(this.snapPreview);
    }

    /**
     * Create a new window
     * @param {Object} config - Window configuration
     * @returns {HTMLElement} Window element
     */
    create(config) {
        const {
            id,
            title,
            content,
            width = 500,
            height = 'auto',
            icon = '&#128196;',  // HTML entity for page emoji - safe encoding
            resizable = true,
            onClose = null
        } = config;

        // Check if window already exists
        const existing = document.getElementById(`window-${id}`);
        if (existing) {
            this.focus(id);
            return existing;
        }

        // Play open sound
        EventBus.emit(Events.SOUND_PLAY, { type: 'open' });

        // Create window element
        const windowEl = document.createElement('div');
        windowEl.id = `window-${id}`;
        windowEl.className = 'window open active opening'; // Add 'opening' for animation
        windowEl.style.width = typeof width === 'number' ? `${width}px` : width;
        if (height !== 'auto') {
            windowEl.style.height = typeof height === 'number' ? `${height}px` : height;
        }

        // Calculate position with improved cascade
        const position = this.calculateCascadePosition(width, height);
        windowEl.style.left = `${position.left}px`;
        windowEl.style.top = `${position.top}px`;
        windowEl.style.zIndex = ++this.zCounter;

        // Build window HTML - using ASCII-safe characters for buttons
        windowEl.innerHTML = `
            <div class="title-bar" data-window-id="${id}">
                <span class="title-text">
                    <span style="margin-right: 5px;">${icon}</span>
                    ${title}
                </span>
            <div class="window-controls">
                    <button class="window-button" data-action="minimize" title="Minimize">_</button>
                    <button class="window-button" data-action="maximize" title="Maximize">[ ]</button>
                    <button class="window-button" data-action="close" title="Close">X</button>
                </div>
            </div>
            <div class="window-content">${content}</div>
            ${resizable ? this.createResizeHandles(id) : ''}
        `;

        // Add to DOM
        document.body.appendChild(windowEl);

        // Remove opening animation class after it completes
        setTimeout(() => {
            windowEl.classList.remove('opening');
        }, 150);

        // Setup event listeners
        this.setupWindowEvents(windowEl, id, onClose);

        // Add to state
        StateManager.addWindow({
            id,
            title: `${icon} ${title}`,
            element: windowEl,
            onClose
        });

        // Emit open event
        EventBus.emit(Events.WINDOW_OPEN, { id, title });

        // Check achievement
        if (StateManager.getState('windows').length >= 10) {
            StateManager.unlockAchievement('multitasker');
        }

        return windowEl;
    }

    /**
     * Create resize handles for all 8 directions
     * @param {string} id - Window ID
     * @returns {string} HTML for resize handles
     */
    createResizeHandles(id) {
        const directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
        return directions.map(dir =>
            `<div class="resize-handle resize-handle-${dir}" data-window-id="${id}" data-direction="${dir}"></div>`
        ).join('');
    }

    /**
     * Calculate cascade position for new window
     * @param {number} width - Window width
     * @param {number} height - Window height
     * @returns {{left: number, top: number}}
     */
    calculateCascadePosition(width, height) {
        const windowCount = StateManager.getState('windows').length;
        const cascadeOffset = 30;
        const maxCascade = 10; // Reset cascade after 10 windows
        const cascadeIndex = windowCount % maxCascade;

        const baseWidth = typeof width === 'number' ? width : 500;
        const baseLeft = Math.max(50, (window.innerWidth - baseWidth) / 2);
        const baseTop = 80;

        let left = baseLeft + (cascadeIndex * cascadeOffset);
        let top = baseTop + (cascadeIndex * cascadeOffset);

        // Ensure window stays visible
        const maxLeft = window.innerWidth - 200;
        const maxTop = window.innerHeight - 200;

        if (left > maxLeft) left = 50 + ((left - maxLeft) % (maxLeft - 50));
        if (top > maxTop) top = 80 + ((top - maxTop) % (maxTop - 80));

        return { left, top };
    }

    /**
     * Setup event listeners for a window
     * @param {HTMLElement} windowEl - Window element
     * @param {string} id - Window ID
     * @param {Function} onClose - Close callback
     */
    setupWindowEvents(windowEl, id, onClose) {
        const titleBar = windowEl.querySelector('.title-bar');
        const controls = windowEl.querySelector('.window-controls');
        const resizeHandles = windowEl.querySelectorAll('.resize-handle');

        // Title bar drag (mouse)
        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            this.startDrag(e, id);
        });

        // Title bar drag (touch)
        titleBar.addEventListener('touchstart', (e) => {
            if (e.target.closest('.window-controls')) return;
            this.startTouchDrag(e, id);
        }, { passive: false });

        // Double-click/tap to maximize
        titleBar.addEventListener('dblclick', () => this.maximize(id));

        // Window controls
        controls.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'minimize') this.minimize(id);
            else if (action === 'maximize') this.maximize(id);
            else if (action === 'close') this.close(id);
        });

        // Resize handles - all 8 directions (mouse)
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                const direction = handle.dataset.direction;
                this.startResize(e, id, direction);
            });
            // Touch support for resize
            handle.addEventListener('touchstart', (e) => {
                const direction = handle.dataset.direction;
                this.startTouchResize(e, id, direction);
            }, { passive: false });
        });

        // Click to focus
        windowEl.addEventListener('mousedown', () => this.focus(id));
    }

    /**
     * Focus a window (bring to front)
     * If the window is minimized, it will be restored automatically (Windows 95 behavior)
     * @param {string} id - Window ID
     */
    focus(id) {
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        // If minimized, restore it first (Windows 95 behavior)
        if (this.isMinimized(id)) {
            this.restore(id);
            return; // restore() already calls focus()
        }

        // Remove active from all windows
        document.querySelectorAll('.window').forEach(w => {
            w.classList.remove('active');
        });

        // Activate this window
        windowEl.classList.add('active');
        windowEl.style.zIndex = ++this.zCounter;

        // Update state
        StateManager.focusWindow(id);

        // Emit focus event
        EventBus.emit(Events.WINDOW_FOCUS, { id });
    }

    /**
     * Minimize a window
     * @param {string} id - Window ID
     */
    minimize(id) {
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        windowEl.classList.add('minimizing');

        setTimeout(() => {
            windowEl.classList.remove('active', 'minimizing');
            windowEl.classList.add('minimized'); // Hide the window
            StateManager.updateWindow(id, { minimized: true });
            EventBus.emit(Events.WINDOW_MINIMIZE, { id });
        }, 200);

        EventBus.emit(Events.SOUND_PLAY, { type: 'click' });
    }

    /**
     * Restore a minimized window
     * @param {string} id - Window ID
     */
    restore(id) {
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        windowEl.classList.remove('minimized'); // Show the window
        windowEl.classList.add('restoring');

        setTimeout(() => {
            windowEl.classList.remove('restoring');
        }, 200);

        StateManager.updateWindow(id, { minimized: false });
        this.focus(id);

        EventBus.emit(Events.WINDOW_RESTORE, { id });
    }

    /**
     * Toggle maximize state with smooth animation
     * @param {string} id - Window ID
     */
    maximize(id) {
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        const isMaximized = windowEl.classList.contains('maximized');

        if (!isMaximized) {
            // Store current position and size before maximizing
            this.preMaximizeState.set(id, {
                left: windowEl.style.left,
                top: windowEl.style.top,
                width: windowEl.style.width,
                height: windowEl.style.height
            });

            // Add animation class
            windowEl.classList.add('maximizing');

            // Small delay to ensure transition class is applied
            requestAnimationFrame(() => {
                windowEl.classList.add('maximized');
            });

            // Remove animation class after transition
            setTimeout(() => {
                windowEl.classList.remove('maximizing');
            }, 150);
        } else {
            // Restore previous position and size
            const prevState = this.preMaximizeState.get(id);

            windowEl.classList.add('maximizing');
            windowEl.classList.remove('maximized');

            if (prevState) {
                windowEl.style.left = prevState.left;
                windowEl.style.top = prevState.top;
                windowEl.style.width = prevState.width;
                windowEl.style.height = prevState.height;
            }

            setTimeout(() => {
                windowEl.classList.remove('maximizing');
            }, 150);
        }

        StateManager.updateWindow(id, { maximized: !isMaximized });
        EventBus.emit(Events.WINDOW_MAXIMIZE, { id, maximized: !isMaximized });
    }

    /**
     * Close a window
     * @param {string} id - Window ID
     */
    close(id) {
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        // Get window data for callback
        const windowData = StateManager.getWindow(id);

        // Play close sound
        EventBus.emit(Events.SOUND_PLAY, { type: 'close' });

        // Animate out
        windowEl.classList.add('minimizing');

        setTimeout(() => {
            // Call onClose callback if provided
            if (windowData && windowData.onClose) {
                windowData.onClose();
            }

            // Remove from DOM
            windowEl.remove();

            // Remove from state
            StateManager.removeWindow(id);

            // Clean up pre-maximize state
            this.preMaximizeState.delete(id);

            // Emit close event
            EventBus.emit(Events.WINDOW_CLOSE, { id });
        }, 200);
    }

    /**
     * Close all windows
     */
    closeAll() {
        const windows = [...StateManager.getState('windows')];
        windows.forEach(w => this.close(w.id));
    }

    // ===== DRAG HANDLING =====

    /**
     * Start dragging a window
     * @param {MouseEvent} e - Mouse event
     * @param {string} id - Window ID
     */
    startDrag(e, id) {
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        // If maximized, un-maximize first with smart positioning
        if (windowEl.classList.contains('maximized')) {
            const prevState = this.preMaximizeState.get(id);
            windowEl.classList.remove('maximized');

            // Position window so mouse is in the same relative position on the title bar
            if (prevState) {
                const prevWidth = parseInt(prevState.width) || 500;
                const mouseXRatio = e.clientX / window.innerWidth;
                const newLeft = e.clientX - (prevWidth * mouseXRatio);

                windowEl.style.left = `${Math.max(0, newLeft)}px`;
                windowEl.style.top = '0px';
                windowEl.style.width = prevState.width;
                windowEl.style.height = prevState.height;
            }

            StateManager.updateWindow(id, { maximized: false });
        }

        this.draggedWindow = { element: windowEl, id };
        const rect = windowEl.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        // Add dragging class and body state
        windowEl.classList.add('dragging');
        document.body.classList.add('window-dragging');

        document.addEventListener('mousemove', this.boundDragMove);
        document.addEventListener('mouseup', this.boundDragEnd);

        EventBus.emit(Events.DRAG_START, {
            itemId: id,
            itemType: 'window',
            x: e.clientX,
            y: e.clientY
        });
    }

    /**
     * Handle window drag movement
     * @param {MouseEvent} e - Mouse event
     */
    handleDragMove(e) {
        if (!this.draggedWindow) return;

        let x = e.clientX - this.dragOffset.x;
        let y = e.clientY - this.dragOffset.y;

        // Keep window accessible - at least 100px visible on each side
        // and title bar must stay within viewport
        const windowEl = this.draggedWindow.element;
        const windowWidth = windowEl.offsetWidth || 300;

        x = Math.max(100 - windowWidth, Math.min(x, window.innerWidth - 100));
        y = Math.max(0, Math.min(y, window.innerHeight - 50));

        windowEl.style.left = `${x}px`;
        windowEl.style.top = `${y}px`;

        // Check for snap zones
        if (e.clientY <= 5) {
            this.showSnapPreview('maximize');
        } else if (e.clientX <= 5) {
            this.showSnapPreview('left');
        } else if (e.clientX >= window.innerWidth - 5) {
            this.showSnapPreview('right');
        } else {
            this.hideSnapPreview();
        }
    }

    /**
     * Show snap preview overlay
     * @param {string} type - Snap type ('maximize', 'left', 'right')
     */
    showSnapPreview(type) {
        if (!this.snapPreview) return;

        this.currentSnapType = type;

        if (type === 'maximize') {
            this.snapPreview.style.top = '0';
            this.snapPreview.style.left = '0';
            this.snapPreview.style.width = '100%';
            this.snapPreview.style.height = 'calc(100vh - 50px)';
        } else if (type === 'left') {
            this.snapPreview.style.top = '0';
            this.snapPreview.style.left = '0';
            this.snapPreview.style.width = '50%';
            this.snapPreview.style.height = 'calc(100vh - 50px)';
        } else if (type === 'right') {
            this.snapPreview.style.top = '0';
            this.snapPreview.style.left = '50%';
            this.snapPreview.style.width = '50%';
            this.snapPreview.style.height = 'calc(100vh - 50px)';
        }

        this.snapPreview.classList.add('active');
    }

    /**
     * Hide snap preview overlay
     */
    hideSnapPreview() {
        if (this.snapPreview) {
            this.snapPreview.classList.remove('active');
        }
        this.currentSnapType = null;
    }

    /**
     * End window drag
     * @param {MouseEvent} e - Mouse event
     */
    handleDragEnd(e) {
        if (this.draggedWindow) {
            const { element, id } = this.draggedWindow;

            // Apply snap if in a snap zone
            if (this.currentSnapType) {
                // Store current position before snapping
                this.preMaximizeState.set(id, {
                    left: element.style.left,
                    top: element.style.top,
                    width: element.style.width,
                    height: element.style.height
                });

                if (this.currentSnapType === 'maximize') {
                    element.classList.add('maximized');
                    StateManager.updateWindow(id, { maximized: true });
                } else if (this.currentSnapType === 'left') {
                    element.classList.remove('maximized');
                    element.style.top = '0px';
                    element.style.left = '0px';
                    element.style.width = '50%';
                    element.style.height = 'calc(100vh - 50px)';
                    StateManager.updateWindow(id, { snapped: 'left' });
                } else if (this.currentSnapType === 'right') {
                    element.classList.remove('maximized');
                    element.style.top = '0px';
                    element.style.left = '50%';
                    element.style.width = '50%';
                    element.style.height = 'calc(100vh - 50px)';
                    StateManager.updateWindow(id, { snapped: 'right' });
                }
            }

            // Remove dragging class
            element.classList.remove('dragging');
            document.body.classList.remove('window-dragging');

            this.hideSnapPreview();
            EventBus.emit(Events.DRAG_END, {
                itemId: id,
                x: e.clientX,
                y: e.clientY,
                target: this.currentSnapType || 'desktop'
            });
        }

        this.draggedWindow = null;
        document.removeEventListener('mousemove', this.boundDragMove);
        document.removeEventListener('mouseup', this.boundDragEnd);
    }

    // ===== TOUCH DRAG HANDLING =====

    /**
     * Start touch dragging a window
     * @param {TouchEvent} e - Touch event
     * @param {string} id - Window ID
     */
    startTouchDrag(e, id) {
        if (e.touches.length !== 1) return;
        e.preventDefault();

        const touch = e.touches[0];
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        // If maximized, un-maximize first
        if (windowEl.classList.contains('maximized')) {
            const prevState = this.preMaximizeState.get(id);
            windowEl.classList.remove('maximized');

            if (prevState) {
                const prevWidth = parseInt(prevState.width) || 500;
                const touchXRatio = touch.clientX / window.innerWidth;
                const newLeft = touch.clientX - (prevWidth * touchXRatio);

                windowEl.style.left = `${Math.max(0, newLeft)}px`;
                windowEl.style.top = '0px';
                windowEl.style.width = prevState.width;
                windowEl.style.height = prevState.height;
            }

            StateManager.updateWindow(id, { maximized: false });
        }

        this.draggedWindow = { element: windowEl, id };
        const rect = windowEl.getBoundingClientRect();
        this.dragOffset = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };

        windowEl.classList.add('dragging');
        document.body.classList.add('window-dragging');

        document.addEventListener('touchmove', this.boundTouchDragMove, { passive: false });
        document.addEventListener('touchend', this.boundTouchDragEnd);
        document.addEventListener('touchcancel', this.boundTouchDragEnd);
    }

    /**
     * Handle touch drag movement
     * @param {TouchEvent} e - Touch event
     */
    handleTouchDragMove(e) {
        if (!this.draggedWindow || e.touches.length !== 1) return;
        e.preventDefault();

        const touch = e.touches[0];
        let x = touch.clientX - this.dragOffset.x;
        let y = touch.clientY - this.dragOffset.y;

        x = Math.max(-50, Math.min(x, window.innerWidth - 100));
        y = Math.max(0, Math.min(y, window.innerHeight - 50));

        this.draggedWindow.element.style.left = `${x}px`;
        this.draggedWindow.element.style.top = `${y}px`;

        // Snap preview for touch
        if (touch.clientY <= 20) {
            this.showSnapPreview('maximize');
        } else {
            this.hideSnapPreview();
        }
    }

    /**
     * End touch drag
     * @param {TouchEvent} e - Touch event
     */
    handleTouchDragEnd(e) {
        if (this.draggedWindow) {
            const { element, id } = this.draggedWindow;

            // Check for snap-to-maximize (finger released near top)
            const touch = e.changedTouches?.[0];
            if (touch && touch.clientY <= 20) {
                this.hideSnapPreview();
                this.preMaximizeState.set(id, {
                    left: element.style.left,
                    top: element.style.top,
                    width: element.style.width,
                    height: element.style.height
                });
                element.classList.add('maximized');
                StateManager.updateWindow(id, { maximized: true });
            }

            element.classList.remove('dragging');
            document.body.classList.remove('window-dragging');
            this.hideSnapPreview();
        }

        this.draggedWindow = null;
        document.removeEventListener('touchmove', this.boundTouchDragMove);
        document.removeEventListener('touchend', this.boundTouchDragEnd);
        document.removeEventListener('touchcancel', this.boundTouchDragEnd);
    }

    // ===== RESIZE HANDLING =====

    /**
     * Start resizing a window
     * @param {MouseEvent} e - Mouse event
     * @param {string} id - Window ID
     * @param {string} direction - Resize direction (n, s, e, w, ne, nw, se, sw)
     */
    startResize(e, id, direction = 'se') {
        e.preventDefault();
        e.stopPropagation();

        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        const rect = windowEl.getBoundingClientRect();

        this.resizingWindow = { element: windowEl, id };
        this.resizeDirection = direction;
        this.resizeStart = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top
        };

        // Add resizing class
        windowEl.classList.add('resizing');
        document.body.classList.add('window-resizing', `window-resizing-${direction}`);

        document.addEventListener('mousemove', this.boundResizeMove);
        document.addEventListener('mouseup', this.boundResizeEnd);
    }

    /**
     * Handle resize movement for all 8 directions
     * @param {MouseEvent} e - Mouse event
     */
    handleResizeMove(e) {
        if (!this.resizingWindow || !this.resizeStart) return;

        const { element } = this.resizingWindow;
        const { mouseX, mouseY, width, height, left, top } = this.resizeStart;
        const dir = this.resizeDirection;

        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;

        let newWidth = width;
        let newHeight = height;
        let newLeft = left;
        let newTop = top;

        // Handle horizontal resizing
        if (dir.includes('e')) {
            newWidth = Math.max(this.minWidth, width + deltaX);
        }
        if (dir.includes('w')) {
            const potentialWidth = width - deltaX;
            if (potentialWidth >= this.minWidth) {
                newWidth = potentialWidth;
                newLeft = left + deltaX;
            }
        }

        // Handle vertical resizing
        if (dir.includes('s')) {
            newHeight = Math.max(this.minHeight, height + deltaY);
        }
        if (dir.includes('n')) {
            const potentialHeight = height - deltaY;
            if (potentialHeight >= this.minHeight) {
                newHeight = potentialHeight;
                newTop = top + deltaY;
            }
        }

        // Apply changes
        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;

        if (dir.includes('w')) {
            element.style.left = `${newLeft}px`;
        }
        if (dir.includes('n')) {
            element.style.top = `${newTop}px`;
        }

        // Emit resize event for apps to react
        EventBus.emit(Events.WINDOW_RESIZE, {
            id: this.resizingWindow.id,
            width: newWidth,
            height: newHeight,
            isResizing: true
        });
    }

    /**
     * End resize
     */
    handleResizeEnd() {
        if (this.resizingWindow) {
            const { id, element } = this.resizingWindow;
            const rect = element.getBoundingClientRect();

            // Remove resizing classes
            element.classList.remove('resizing');
            document.body.classList.remove('window-resizing');
            document.body.classList.remove(`window-resizing-${this.resizeDirection}`);

            // Emit final resize event
            EventBus.emit(Events.WINDOW_RESIZE, {
                id,
                width: rect.width,
                height: rect.height,
                isResizing: false
            });
        }

        this.resizingWindow = null;
        this.resizeDirection = null;
        this.resizeStart = null;
        document.removeEventListener('mousemove', this.boundResizeMove);
        document.removeEventListener('mouseup', this.boundResizeEnd);
    }

    // ===== TOUCH RESIZE HANDLING =====

    /**
     * Start touch resizing a window
     * @param {TouchEvent} e - Touch event
     * @param {string} id - Window ID
     * @param {string} direction - Resize direction
     */
    startTouchResize(e, id, direction = 'se') {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        const rect = windowEl.getBoundingClientRect();

        this.resizingWindow = { element: windowEl, id };
        this.resizeDirection = direction;
        this.resizeStart = {
            mouseX: touch.clientX,
            mouseY: touch.clientY,
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top
        };

        windowEl.classList.add('resizing');
        document.body.classList.add('window-resizing', `window-resizing-${direction}`);

        document.addEventListener('touchmove', this.boundTouchResizeMove, { passive: false });
        document.addEventListener('touchend', this.boundTouchResizeEnd);
        document.addEventListener('touchcancel', this.boundTouchResizeEnd);
    }

    /**
     * Handle touch resize movement
     * @param {TouchEvent} e - Touch event
     */
    handleTouchResizeMove(e) {
        if (!this.resizingWindow || !this.resizeStart || e.touches.length !== 1) return;
        e.preventDefault();

        const touch = e.touches[0];
        const { element } = this.resizingWindow;
        const { mouseX, mouseY, width, height, left, top } = this.resizeStart;
        const dir = this.resizeDirection;

        const deltaX = touch.clientX - mouseX;
        const deltaY = touch.clientY - mouseY;

        let newWidth = width;
        let newHeight = height;
        let newLeft = left;
        let newTop = top;

        if (dir.includes('e')) {
            newWidth = Math.max(this.minWidth, width + deltaX);
        }
        if (dir.includes('w')) {
            const potentialWidth = width - deltaX;
            if (potentialWidth >= this.minWidth) {
                newWidth = potentialWidth;
                newLeft = left + deltaX;
            }
        }
        if (dir.includes('s')) {
            newHeight = Math.max(this.minHeight, height + deltaY);
        }
        if (dir.includes('n')) {
            const potentialHeight = height - deltaY;
            if (potentialHeight >= this.minHeight) {
                newHeight = potentialHeight;
                newTop = top + deltaY;
            }
        }

        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;

        if (dir.includes('w')) {
            element.style.left = `${newLeft}px`;
        }
        if (dir.includes('n')) {
            element.style.top = `${newTop}px`;
        }

        EventBus.emit(Events.WINDOW_RESIZE, {
            id: this.resizingWindow.id,
            width: newWidth,
            height: newHeight,
            isResizing: true
        });
    }

    /**
     * End touch resize
     */
    handleTouchResizeEnd() {
        if (this.resizingWindow) {
            const { id, element } = this.resizingWindow;
            const rect = element.getBoundingClientRect();

            element.classList.remove('resizing');
            document.body.classList.remove('window-resizing');
            document.body.classList.remove(`window-resizing-${this.resizeDirection}`);

            EventBus.emit(Events.WINDOW_RESIZE, {
                id,
                width: rect.width,
                height: rect.height,
                isResizing: false
            });
        }

        this.resizingWindow = null;
        this.resizeDirection = null;
        this.resizeStart = null;
        document.removeEventListener('touchmove', this.boundTouchResizeMove);
        document.removeEventListener('touchend', this.boundTouchResizeEnd);
        document.removeEventListener('touchcancel', this.boundTouchResizeEnd);
    }

    // ===== UTILITY METHODS =====

    /**
     * Get window element by ID
     * @param {string} id - Window ID
     * @returns {HTMLElement|null}
     */
    getElement(id) {
        return document.getElementById(`window-${id}`);
    }

    /**
     * Check if window is open
     * @param {string} id - Window ID
     * @returns {boolean}
     */
    isOpen(id) {
        return !!document.getElementById(`window-${id}`);
    }

    /**
     * Check if window is minimized
     * @param {string} id - Window ID
     * @returns {boolean}
     */
    isMinimized(id) {
        const win = StateManager.getWindow(id);
        return win ? win.minimized : false;
    }

    /**
     * Toggle window visibility
     * @param {string} id - Window ID
     */
    toggle(id) {
        if (this.isMinimized(id)) {
            this.restore(id);
        } else if (this.isActive(id)) {
            this.minimize(id);
        } else {
            this.focus(id);
        }
    }

    /**
     * Check if window is active
     * @param {string} id - Window ID
     * @returns {boolean}
     */
    isActive(id) {
        return StateManager.getState('ui.activeWindow') === id;
    }

    /**
     * Get all open window IDs
     * @returns {string[]}
     */
    getOpenIds() {
        return StateManager.getState('windows').map(w => w.id);
    }

    /**
     * Find all windows for a specific app type
     * @param {string} appId - Base app ID (e.g., 'notepad', 'mycomputer')
     * @returns {Object[]} Array of window state objects
     */
    findWindowsByApp(appId) {
        const windows = StateManager.getState('windows') || [];
        return windows.filter(w => w.id === appId || w.id.startsWith(`${appId}-`));
    }

    /**
     * Find a window for an app and optionally restore/focus it
     * Returns the window ID if found and restored, null otherwise
     * @param {string} appId - Base app ID
     * @param {boolean} restoreIfFound - Whether to restore/focus if found
     * @returns {string|null} Window ID if found
     */
    findAndRestoreApp(appId, restoreIfFound = true) {
        const windows = this.findWindowsByApp(appId);
        if (windows.length > 0) {
            const windowId = windows[0].id;
            if (restoreIfFound) {
                this.focus(windowId); // Will restore if minimized
            }
            return windowId;
        }
        return null;
    }
}

// Singleton instance
const WindowManager = new WindowManagerClass();

export default WindowManager;
