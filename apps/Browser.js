/**
 * Browser App - Internet Explorer Style
 * A retro web browser using iframes
 */

import AppBase from './AppBase.js';
import WindowManager from '../core/WindowManager.js';
import EventBus from '../core/EventBus.js';

class Browser extends AppBase {
    constructor() {
        super({
            id: 'browser',
            name: 'Internet Explorer',
            icon: '🌐',
            width: 800,
            height: 600,
            resizable: true,
            singleton: true,
            category: 'internet'
        });

        this.history = [];
        this.historyIndex = -1;
        this.homepage = 'https://www.wikipedia.org';
        this.initialUrl = null;

        // Register semantic event commands
        this.registerCommands();
        this.registerQueries();
    }

    registerCommands() {
        this.registerCommand('navigate', (url) => {
            if (!url || typeof url !== 'string') {
                return { success: false, error: 'URL required' };
            }
            try {
                this.navigate(url);
                EventBus.emit('browser:navigated', { appId: this.id, url, timestamp: Date.now() });
                return { success: true, url };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        this.registerCommand('back', () => {
            if (this.historyIndex > 0) {
                this.goBack();
                return { success: true, url: this.history[this.historyIndex] };
            }
            return { success: false, error: 'No previous page' };
        });

        this.registerCommand('forward', () => {
            if (this.historyIndex < this.history.length - 1) {
                this.goForward();
                return { success: true, url: this.history[this.historyIndex] };
            }
            return { success: false, error: 'No next page' };
        });

        this.registerCommand('refresh', () => {
            this.refresh();
            return { success: true };
        });

        this.registerCommand('home', () => {
            this.navigate(this.homepage);
            return { success: true, url: this.homepage };
        });
    }

    registerQueries() {
        this.registerQuery('getCurrentUrl', () => {
            return { url: this.history[this.historyIndex] || this.homepage };
        });

        this.registerQuery('getHistory', () => {
            return { history: [...this.history], currentIndex: this.historyIndex };
        });

        this.registerQuery('getHomepage', () => {
            return { homepage: this.homepage };
        });
    }

    setParams(params) {
        if (params && params.url) {
            this.initialUrl = params.url;
        }
    }

    onOpen() {
        return `
            <style>
                /* Override window-content padding for proper sizing */
                #window-browser .window-content {
                    padding: 0 !important;
                    overflow: hidden !important;
                }
                .browser-app {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #c0c0c0;
                }
                .browser-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px;
                    background: #c0c0c0;
                    border-bottom: 1px solid #808080;
                }
                .browser-btn {
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
                .browser-btn:active {
                    border-style: inset;
                }
                .browser-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .browser-address-bar {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .browser-address-label {
                    font-size: 12px;
                    font-weight: bold;
                }
                .browser-address-input {
                    flex: 1;
                    height: 22px;
                    border: 2px inset #fff;
                    padding: 0 4px;
                    font-size: 12px;
                    font-family: 'Segoe UI', Tahoma, sans-serif;
                }
                .browser-content {
                    flex: 1;
                    background: #fff;
                    border: 2px inset #808080;
                    margin: 4px;
                    position: relative;
                    overflow: hidden;
                }
                .browser-iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                .browser-status {
                    height: 20px;
                    padding: 2px 8px;
                    font-size: 11px;
                    background: #c0c0c0;
                    border-top: 1px solid #808080;
                    display: flex;
                    align-items: center;
                }
                .browser-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 14px;
                    color: #666;
                }
                .browser-bookmarks {
                    display: flex;
                    gap: 8px;
                    padding: 4px 8px;
                    background: #d4d0c8;
                    border-bottom: 1px solid #808080;
                    font-size: 11px;
                }
                .browser-bookmark {
                    cursor: pointer;
                    color: #00c;
                    text-decoration: underline;
                }
                .browser-bookmark:hover {
                    color: #c00;
                }
            </style>
            <div class="browser-app">
                <div class="browser-toolbar">
                    <button class="browser-btn" id="btnBack" title="Back">◀</button>
                    <button class="browser-btn" id="btnForward" title="Forward">▶</button>
                    <button class="browser-btn" id="btnRefresh" title="Refresh">↻</button>
                    <button class="browser-btn" id="btnHome" title="Home">🏠</button>
                    <div class="browser-address-bar">
                        <span class="browser-address-label">Address:</span>
                        <input type="text" class="browser-address-input" id="addressInput" value="${this.initialUrl || this.homepage}">
                    </div>
                    <button class="browser-btn" id="btnGo" title="Go">→</button>
                </div>
                <div class="browser-bookmarks">
                    <span class="browser-bookmark" data-url="https://www.wikipedia.org">Wikipedia</span>
                    <span class="browser-bookmark" data-url="https://archive.org">Internet Archive</span>
                    <span class="browser-bookmark" data-url="https://www.google.com">Google</span>
                    <span class="browser-bookmark" data-url="https://news.ycombinator.com">Hacker News</span>
                </div>
                <div class="browser-content">
                    <div class="browser-loading" id="loadingMsg">Loading...</div>
                    <iframe class="browser-iframe" id="browserFrame" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
                </div>
                <div class="browser-status" id="statusBar">Ready</div>
            </div>
        `;
    }

    onMount() {
        // Maximize browser window on open for better viewing
        const windowId = this.getCurrentWindowId();
        if (windowId) {
            WindowManager.maximize(windowId);
        }

        const addressInput = this.getElement('#addressInput');
        const frame = this.getElement('#browserFrame');
        const loading = this.getElement('#loadingMsg');

        // Navigation buttons
        this.addHandler(this.getElement('#btnBack'), 'click', () => this.goBack());
        this.addHandler(this.getElement('#btnForward'), 'click', () => this.goForward());
        this.addHandler(this.getElement('#btnRefresh'), 'click', () => this.refresh());
        this.addHandler(this.getElement('#btnHome'), 'click', () => this.goHome());
        this.addHandler(this.getElement('#btnGo'), 'click', () => this.navigate(addressInput.value));

        // Address bar enter key
        this.addHandler(addressInput, 'keydown', (e) => {
            if (e.key === 'Enter') {
                this.navigate(addressInput.value);
            }
        });

        // Bookmarks
        this.getElements('.browser-bookmark').forEach(el => {
            this.addHandler(el, 'click', () => {
                this.navigate(el.dataset.url);
            });
        });

        // Frame load events
        this.addHandler(frame, 'load', () => {
            if (loading) loading.style.display = 'none';
            this.updateStatus('Done');
            this.updateNavButtons();
        });

        // Navigate to initial URL or homepage
        this.navigate(this.initialUrl || this.homepage);
        this.initialUrl = null; // Reset after use
    }

    navigate(url) {
        if (!url) return;

        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const frame = this.getElement('#browserFrame');
        const addressInput = this.getElement('#addressInput');
        const loading = this.getElement('#loadingMsg');

        if (frame) {
            if (loading) loading.style.display = 'block';
            this.updateStatus('Loading ' + url + '...');

            // Update history
            if (this.historyIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.historyIndex + 1);
            }
            this.history.push(url);
            this.historyIndex = this.history.length - 1;

            frame.src = url;
            if (addressInput) addressInput.value = url;
            this.updateNavButtons();
        }
    }

    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const url = this.history[this.historyIndex];
            const frame = this.getElement('#browserFrame');
            const addressInput = this.getElement('#addressInput');

            if (frame) frame.src = url;
            if (addressInput) addressInput.value = url;
            this.updateStatus('Loading ' + url + '...');
            this.updateNavButtons();
        }
    }

    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const url = this.history[this.historyIndex];
            const frame = this.getElement('#browserFrame');
            const addressInput = this.getElement('#addressInput');

            if (frame) frame.src = url;
            if (addressInput) addressInput.value = url;
            this.updateStatus('Loading ' + url + '...');
            this.updateNavButtons();
        }
    }

    refresh() {
        const frame = this.getElement('#browserFrame');
        if (frame) {
            this.updateStatus('Refreshing...');
            frame.src = frame.src;
        }
    }

    goHome() {
        this.navigate(this.homepage);
    }

    updateStatus(text) {
        const status = this.getElement('#statusBar');
        if (status) status.textContent = text;
    }

    updateNavButtons() {
        const btnBack = this.getElement('#btnBack');
        const btnForward = this.getElement('#btnForward');

        if (btnBack) btnBack.disabled = this.historyIndex <= 0;
        if (btnForward) btnForward.disabled = this.historyIndex >= this.history.length - 1;
    }
}

export default Browser;
