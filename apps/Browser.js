/**
 * Browser App - Internet Explorer Style
 * A retro web browser using iframes
 *
 * SCRIPTING SUPPORT:
 *   Commands: navigate, back, forward, refresh, home,
 *             setHomepage, addBookmark, removeBookmark,
 *             setStatusText, setAddressBar, reset
 *   Queries:  getCurrentUrl, getHistory, getHomepage,
 *             getBookmarks, getConfig
 *   Events:   browser:navigated,
 *             app:browser:bookmarkAdded, app:browser:bookmarkRemoved,
 *             app:browser:homepageChanged
 */

import AppBase from './AppBase.js';
import WindowManager from '../core/WindowManager.js';
import EventBus from '../core/EventBus.js';
import { escapeHtml, isSafeHttpUrl } from '../core/Sanitize.js';

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

        // Bookmarks for scripting
        this.bookmarks = [
            { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
            { name: 'Internet Archive', url: 'https://archive.org' },
            { name: 'Google', url: 'https://www.google.com' },
            { name: 'Hacker News', url: 'https://news.ycombinator.com' }
        ];

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

        // === ARG SCRIPTING COMMANDS ===

        this.registerCommand('setHomepage', (payload) => {
            const url = payload.url || payload.value;
            if (!url) return { success: false, error: 'URL required' };
            this.homepage = url;
            this.emitAppEvent('homepageChanged', { url });
            return { success: true, homepage: url };
        });

        this.registerCommand('addBookmark', (payload) => {
            const name = payload.name || payload.label;
            const url = payload.url;
            if (!name || !url) return { success: false, error: 'Name and URL required' };
            if (this.bookmarks.find(b => b.url === url)) {
                return { success: false, error: 'Bookmark already exists' };
            }
            this.bookmarks.push({ name, url });
            this._renderBookmarks();
            this.emitAppEvent('bookmarkAdded', { name, url });
            return { success: true, name, url };
        });

        this.registerCommand('removeBookmark', (payload) => {
            const url = payload.url;
            const name = payload.name;
            const idx = this.bookmarks.findIndex(b =>
                (url && b.url === url) || (name && b.name === name)
            );
            if (idx === -1) return { success: false, error: 'Bookmark not found' };
            const removed = this.bookmarks.splice(idx, 1)[0];
            this._renderBookmarks();
            this.emitAppEvent('bookmarkRemoved', { name: removed.name, url: removed.url });
            return { success: true };
        });

        this.registerCommand('setStatusText', (payload) => {
            const text = payload.text || payload.value || '';
            const statusBar = this.getElement('#statusBar');
            if (statusBar) statusBar.textContent = text;
            return { success: true };
        });

        this.registerCommand('setAddressBar', (payload) => {
            const text = payload.text || payload.url || '';
            const addressInput = this.getElement('#addressInput');
            if (addressInput) addressInput.value = text;
            return { success: true };
        });

        this.registerCommand('reset', () => {
            this.history = [];
            this.historyIndex = -1;
            this.homepage = 'https://www.wikipedia.org';
            this.bookmarks = [
                { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
                { name: 'Internet Archive', url: 'https://archive.org' },
                { name: 'Google', url: 'https://www.google.com' },
                { name: 'Hacker News', url: 'https://news.ycombinator.com' }
            ];
            this._renderBookmarks();
            const statusBar = this.getElement('#statusBar');
            if (statusBar) statusBar.textContent = 'Ready';
            return { success: true };
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

        this.registerQuery('getBookmarks', () => {
            return this.bookmarks.map(b => ({ ...b }));
        });

        this.registerQuery('getConfig', () => {
            return {
                homepage: this.homepage,
                currentUrl: this.history[this.historyIndex] || null,
                historyLength: this.history.length,
                bookmarkCount: this.bookmarks.length
            };
        });
    }

    setParams(params) {
        if (params && params.url) {
            this.initialUrl = params.url;
        }
    }

    onOpen() {
        return `
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
                <div class="browser-bookmarks" id="bookmarksBar">
                    ${this.bookmarks.map(b => `<span class="browser-bookmark" data-url="${escapeHtml(b.url)}">${escapeHtml(b.name)}</span>`).join('')}
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

    _renderBookmarks() {
        const bar = this.getElement('#bookmarksBar');
        if (!bar) return;
        bar.innerHTML = '';
        this.bookmarks.forEach(b => {
            const span = document.createElement('span');
            span.className = 'browser-bookmark';
            span.textContent = b.name;
            span.dataset.url = b.url;
            this.addHandler(span, 'click', () => {
                if (isSafeHttpUrl(span.dataset.url)) {
                    this.navigate(span.dataset.url);
                }
            });
            bar.appendChild(span);
        });
    }
}

export default Browser;
