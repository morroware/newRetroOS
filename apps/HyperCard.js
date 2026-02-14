import AppBase from './AppBase.js';

class HyperCard extends AppBase {
    constructor() {
        super({
            id: 'hypercard',
            name: 'HyperCard',
            icon: '📇',
            width: 720,
            height: 540,
            resizable: true,
            category: 'accessories',
            showInMenu: true
        });

        // Register scriptability hooks
        this.registerCommands();
        this.registerQueries();
    }

    /**
     * Register commands for script control
     */
    registerCommands() {
        this.registerCommand('reload', () => {
            this.refresh();
            return { success: true };
        });

        this.registerCommand('goHome', () => {
            this.goHome();
            return { success: true };
        });
    }

    /**
     * Register queries for reading state
     */
    registerQueries() {
        this.registerQuery('getState', () => {
            const statusBar = this.getElement('#statusBar');
            return { status: statusBar ? statusBar.textContent : 'Unknown' };
        });
    }

    onOpen() {
        return `
            <style>
                /* Override window-content padding for proper sizing */
                #window-hypercard .window-content {
                    padding: 0 !important;
                    overflow: hidden !important;
                }
                .hypercard-app {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #c0c0c0;
                }
                .hypercard-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 4px;
                    background: #c0c0c0;
                    border-bottom: 1px solid #808080;
                }
                .hypercard-btn {
                    width: 28px;
                    height: 28px;
                    border: 2px outset #fff;
                    background: #c0c0c0;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .hypercard-btn:active {
                    border-style: inset;
                }
                .hypercard-info {
                    flex: 1;
                    font-size: 12px;
                    color: #000;
                    padding: 0 8px;
                }
                .hypercard-content {
                    flex: 1;
                    background: #000;
                    position: relative;
                    overflow: hidden;
                }
                .hypercard-iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                .hypercard-status {
                    height: 20px;
                    padding: 2px 8px;
                    font-size: 12px;
                    background: #c0c0c0;
                    border-top: 1px solid #808080;
                    display: flex;
                    align-items: center;
                }
                .hypercard-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 14px;
                    color: #666;
                }
            </style>
            <div class="hypercard-app">
                <div class="hypercard-toolbar">
                    <button class="hypercard-btn" id="btnHome" title="Home">🏠</button>
                    <button class="hypercard-btn" id="btnRefresh" title="Refresh">↻</button>
                    <div class="hypercard-info">
                        <span>Classic Macintosh System 7 with HyperCard 2.4</span>
                    </div>
                </div>

                <div class="hypercard-content">
                    <div class="hypercard-loading" id="loadingMsg">Loading Macintosh System 7...</div>
                    <iframe class="hypercard-iframe" id="hyperCardFrame"
                            src="https://archive.org/embed/HyperCardBootSystem7"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                            allowfullscreen webkitallowfullscreen mozallowfullscreen>
                    </iframe>
                </div>

                <div class="hypercard-status" id="statusBar">Ready</div>
            </div>
        `;
    }

    onMount() {
        const frame = this.getElement('#hyperCardFrame');
        const loadingMsg = this.getElement('#loadingMsg');

        // Handle iframe load
        this.addHandler(frame, 'load', () => {
            if (loadingMsg) loadingMsg.style.display = 'none';
            this.updateStatus('Ready');
            this.emitAppEvent('loaded', {});
        });

        // Toolbar buttons
        this.addHandler(this.getElement('#btnHome'), 'click', () => {
            this.goHome();
        });

        this.addHandler(this.getElement('#btnRefresh'), 'click', () => {
            this.refresh();
        });

        // Update initial status
        this.updateStatus('Loading Macintosh System 7...');
    }

    goHome() {
        const frame = this.getElement('#hyperCardFrame');
        frame.src = 'https://archive.org/embed/HyperCardBootSystem7';
        this.updateStatus('Loading home...');
    }

    refresh() {
        const frame = this.getElement('#hyperCardFrame');
        frame.src = frame.src;
        this.updateStatus('Refreshing...');
    }

    updateStatus(message) {
        const statusBar = this.getElement('#statusBar');
        if (statusBar) {
            statusBar.textContent = message;
        }
    }

    onResize({ width, height }) {
        // Iframe will auto-resize with CSS
    }
}

export default HyperCard;
