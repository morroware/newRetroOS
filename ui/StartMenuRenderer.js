/**
 * StartMenuRenderer - Renders and manages the Windows 95 style Start Menu
 * Updated to dynamically load apps by category with proper event cleanup
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';
import AppRegistry from '../apps/AppRegistry.js';
import { getConfig } from '../core/ConfigLoader.js';

class StartMenuRendererClass {
    constructor() {
        this.element = null;
        this.startButton = null;
        this.isOpen = false;
        this.initialized = false;

        // Plugin-registered custom categories for the Programs submenu
        this._customCategories = [];

        // Bound handlers for cleanup
        this.boundHandleOutsideClick = this.handleOutsideClick.bind(this);
        this.boundHandleStartClick = this.handleStartClick.bind(this);
        this.boundHandleMenuClick = this.handleMenuClick.bind(this);
    }

    /**
     * Register a custom category in the Programs submenu.
     * Plugins can call this to add their own app categories.
     * @param {{ id: string, label: string, icon: string }} category
     */
    registerCategory(category) {
        if (!category || !category.id || !category.label) {
            console.error('[StartMenuRenderer] registerCategory requires { id, label, icon }');
            return;
        }
        // Avoid duplicates
        if (!this._customCategories.find(c => c.id === category.id)) {
            this._customCategories.push(category);
        }
    }

    initialize() {
        if (this.initialized) {
            console.warn('[StartMenuRenderer] Already initialized');
            return;
        }

        this.element = document.getElementById('startMenu');
        this.startButton = document.getElementById('startButton');

        if (!this.element || !this.startButton) return;

        // Start button click - using bound handler
        this.startButton.addEventListener('click', this.boundHandleStartClick);

        // Event delegation for menu items
        this.element.addEventListener('click', this.boundHandleMenuClick);

        EventBus.on(Events.START_MENU_TOGGLE, (data) => {
            if (data && data.open !== undefined && data.open !== this.isOpen) {
                if (data.open) this.open(); else this.close();
            }
        });

        // Outside click to close - using bound handler
        document.addEventListener('click', this.boundHandleOutsideClick);

        EventBus.on(Events.WINDOW_OPEN, () => this.close());
        StateManager.subscribe('menuItems', () => this.render());
        StateManager.subscribe('user.isAdmin', () => this.render());

        this.render();
        this.initialized = true;
    }

    /**
     * Handle start button click
     */
    handleStartClick(e) {
        e.stopPropagation();
        this.toggle();
        EventBus.emit(Events.START_MENU_TOGGLE, { open: this.isOpen });
    }

    /**
     * Handle outside click to close menu
     */
    handleOutsideClick(e) {
        if (this.isOpen && !this.element.contains(e.target) && !this.startButton.contains(e.target)) {
            this.close();
        }
    }

    /**
     * Handle menu item clicks via event delegation
     */
    handleMenuClick(e) {
        const appItem = e.target.closest('[data-app]');
        const linkItem = e.target.closest('[data-link]');

        if (appItem) {
            e.stopPropagation();
            AppRegistry.launch(appItem.dataset.app);
            this.close();
        } else if (linkItem) {
            e.stopPropagation();
            AppRegistry.launch('browser', { url: linkItem.dataset.link });
            this.close();
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (!this.initialized) return;

        document.removeEventListener('click', this.boundHandleOutsideClick);

        if (this.startButton) {
            this.startButton.removeEventListener('click', this.boundHandleStartClick);
        }

        if (this.element) {
            this.element.removeEventListener('click', this.boundHandleMenuClick);
        }

        this.initialized = false;
        console.log('[StartMenuRenderer] Destroyed');
    }

    toggle() { this.isOpen ? this.close() : this.open(); }

    open() {
        this.isOpen = true;
        this.element.classList.add('active');
        this.startButton.classList.add('active');
        EventBus.emit(Events.SOUND_PLAY, { type: 'click' });
    }

    close() {
        this.isOpen = false;
        this.element.classList.remove('active');
        this.startButton.classList.remove('active');
    }

    render() {
        if (!this.element) return;
        const isAdmin = StateManager.getState('user.isAdmin');

        console.log('[StartMenuRenderer] render() called - building menu HTML');

        const sidebarText = getConfig('branding.sidebarText', 'IlluminatOS!');
        this.element.innerHTML = `
            <div class="start-menu-sidebar">
                <span class="sidebar-text">${sidebarText}</span>
            </div>
            <div class="start-menu-content">
                <div class="start-menu-items">
                    ${this.renderProgramsSection()}
                    ${this.renderDocumentsSection()}
                    ${this.renderSettingsSection()}
                    ${this.renderQuickItems()}
                    <div class="start-menu-divider"></div>
                    ${this.renderAdminItem(isAdmin)}
                    <div class="start-menu-divider"></div>
                    ${this.renderShutdownItem()}
                </div>
            </div>
        `;

        // Debug: verify Settings submenu items in DOM
        const settingsSubmenu = this.element.querySelector('[data-app="controlpanel"]')?.closest('.start-submenu');
        if (settingsSubmenu) {
            const items = settingsSubmenu.querySelectorAll('[data-app]');
            const itemList = Array.from(items).map(i => i.dataset.app);
            console.log('[StartMenuRenderer] Settings submenu items in DOM:', itemList);

            // Verify all expected items are present
            const expected = ['controlpanel', 'display', 'sounds', 'features-settings'];
            const missing = expected.filter(id => !itemList.includes(id));
            if (missing.length > 0) {
                console.error('[StartMenuRenderer] MISSING Settings items:', missing);
            } else {
                console.log('[StartMenuRenderer] All 4 Settings items present ✓');
            }
        } else {
            console.error('[StartMenuRenderer] Settings submenu NOT found in DOM!');
        }

        // Attach only submenu positioning (click handlers use event delegation)
        this.attachSubmenuPositioning();
    }

    renderProgramsSection() {
        // Dynamically fetch apps by category
        const accessories = AppRegistry.getByCategory('accessories').filter(a => a.showInMenu !== false);
        const gamesRaw = AppRegistry.getByCategory('games');
        const games = gamesRaw.filter(a => a.showInMenu !== false);
        console.log('[StartMenu] Games raw:', gamesRaw);
        console.log('[StartMenu] Games filtered:', games);
        console.log('[StartMenu] Zork in games?', games.find(g => g.id === 'zork'));
        const multimedia = AppRegistry.getByCategory('multimedia').filter(a => a.showInMenu !== false);
        const internet = AppRegistry.getByCategory('internet').filter(a => a.showInMenu !== false);
        const systemtools = AppRegistry.getByCategory('systemtools').filter(a => a.showInMenu !== false);

        const links = (StateManager.getState('icons') || []).filter(i => i.type === 'link');

        const renderAppList = (list) => list.map(app => `
            <div class="start-menu-item" data-app="${app.id}">
                <span class="start-menu-icon">${app.icon}</span>
                <span>${app.name}</span>
            </div>
        `).join('');

        return `
            <div class="start-menu-item submenu-trigger">
                <span class="start-menu-icon">📂</span>
                <span>Programs</span>
                <span class="submenu-arrow">▶</span>
                <div class="start-submenu">
                    ${internet.length > 0 ? `
                    <div class="start-menu-item submenu-trigger">
                        <span class="start-menu-icon">🌐</span>
                        <span>Internet</span>
                        <span class="submenu-arrow">▶</span>
                        <div class="start-submenu">
                            ${renderAppList(internet)}
                        </div>
                    </div>
                    ` : ''}

                    ${multimedia.length > 0 ? `
                    <div class="start-menu-item submenu-trigger">
                        <span class="start-menu-icon">🎵</span>
                        <span>Multimedia</span>
                        <span class="submenu-arrow">▶</span>
                        <div class="start-submenu">
                            ${renderAppList(multimedia)}
                        </div>
                    </div>
                    ` : ''}

                    <div class="start-menu-item submenu-trigger">
                        <span class="start-menu-icon">📝</span>
                        <span>Accessories</span>
                        <span class="submenu-arrow">▶</span>
                        <div class="start-submenu">
                            ${renderAppList(accessories)}
                        </div>
                    </div>

                    ${systemtools.length > 0 ? `
                    <div class="start-menu-item submenu-trigger">
                        <span class="start-menu-icon">🔧</span>
                        <span>System Tools</span>
                        <span class="submenu-arrow">▶</span>
                        <div class="start-submenu">
                            ${renderAppList(systemtools)}
                        </div>
                    </div>
                    ` : ''}

                    <div class="start-menu-item submenu-trigger">
                        <span class="start-menu-icon">🎮</span>
                        <span>Games</span>
                        <span class="submenu-arrow">▶</span>
                        <div class="start-submenu">
                            ${renderAppList(games)}
                        </div>
                    </div>

                    ${this._customCategories.map(cat => {
                        const catApps = AppRegistry.getByCategory(cat.id).filter(a => a.showInMenu !== false);
                        if (catApps.length === 0) return '';
                        return `
                        <div class="start-menu-item submenu-trigger">
                            <span class="start-menu-icon">${cat.icon || '📂'}</span>
                            <span>${cat.label}</span>
                            <span class="submenu-arrow">▶</span>
                            <div class="start-submenu">
                                ${renderAppList(catApps)}
                            </div>
                        </div>`;
                    }).join('')}

                    ${links.length > 0 ? `
                        <div class="start-menu-divider"></div>
                        ${links.map(link => `
                            <div class="start-menu-item" data-link="${link.url}">
                                <span class="start-menu-icon">${link.emoji}</span>
                                <span>${link.label}</span>
                            </div>
                        `).join('')}
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderDocumentsSection() {
        return `
            <div class="start-menu-item submenu-trigger">
                <span class="start-menu-icon">📄</span>
                <span>Documents</span>
                <span class="submenu-arrow">▶</span>
                <div class="start-submenu">
                    <div class="start-menu-item" data-app="notepad">
                        <span class="start-menu-icon">📝</span>
                        <span>README.txt</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderSettingsSection() {
        const settingsHtml = `
            <div class="start-menu-item submenu-trigger">
                <span class="start-menu-icon">⚙️</span>
                <span>Settings</span>
                <span class="submenu-arrow">▶</span>
                <div class="start-submenu">
                    <div class="start-menu-item" data-app="controlpanel">
                        <span class="start-menu-icon">🎛️</span>
                        <span>Control Panel</span>
                    </div>
                    <div class="start-menu-item" data-app="display">
                        <span class="start-menu-icon">🖥️</span>
                        <span>Display</span>
                    </div>
                    <div class="start-menu-item" data-app="sounds">
                        <span class="start-menu-icon">🔊</span>
                        <span>Sounds</span>
                    </div>
                    <div class="start-menu-item" data-app="features-settings">
                        <span class="start-menu-icon">⚡</span>
                        <span>Features</span>
                    </div>
                </div>
            </div>
        `;
        // Debug: log that we're rendering with all 4 items
        console.log('[StartMenuRenderer] Settings section rendered with 4 items: controlpanel, display, sounds, features-settings');
        return settingsHtml;
    }

    renderQuickItems() {
        return `
            <div class="start-menu-item" data-app="find">
                <span class="start-menu-icon">🔍</span>
                <span>Find...</span>
            </div>
            <div class="start-menu-item" data-app="help">
                <span class="start-menu-icon">❓</span>
                <span>Help</span>
            </div>
            <div class="start-menu-item" data-app="run">
                <span class="start-menu-icon">▶️</span>
                <span>Run...</span>
            </div>
        `;
    }

    renderAdminItem(isAdmin) {
        return isAdmin ? `
            <div class="start-menu-item" data-app="adminpanel">
                <span class="start-menu-icon">⚙️</span>
                <span>Admin Panel</span>
            </div>` : `
            <div class="start-menu-item" data-app="adminpanel">
                <span class="start-menu-icon">🗝️</span>
                <span>Admin Login</span>
            </div>`;
    }

    renderShutdownItem() {
        return `
            <div class="start-menu-item" data-app="shutdown">
                <span class="start-menu-icon">⏻</span>
                <span>Shut Down...</span>
            </div>
        `;
    }

    /**
     * Attach hover handlers to reposition submenus that would go off-screen
     * Note: Click handlers are handled via event delegation in handleMenuClick()
     */
    attachSubmenuPositioning() {
        const submenuTriggers = this.element.querySelectorAll('.submenu-trigger');

        submenuTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', () => {
                const submenu = trigger.querySelector(':scope > .start-submenu');
                if (submenu) {
                    this.positionSubmenu(trigger, submenu);
                }
            });

            // Note: We intentionally don't reset positioning on mouseleave
            // because the submenu is a child of the trigger - resetting position
            // while hovering the submenu would cause it to jump away.
            // The CSS handles hiding the submenu when the parent loses hover state.
        });
    }

    /**
     * Position a submenu so it stays on screen
     * Uses fixed positioning to avoid clipping by overflow:auto parents
     * @param {HTMLElement} trigger - The parent menu item
     * @param {HTMLElement} submenu - The submenu element
     */
    positionSubmenu(trigger, submenu) {
        const triggerRect = trigger.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const taskbarHeight = 50;
        const availableHeight = viewportHeight - taskbarHeight;

        // Position submenu to the right of the trigger
        let left = triggerRect.right;
        let top = triggerRect.top;

        // Debug: log submenu info
        const triggerName = trigger.querySelector('span:not(.submenu-arrow):not(.start-menu-icon)')?.textContent || 'unknown';
        const itemCount = submenu.querySelectorAll('.start-menu-item').length;
        console.log(`[StartMenuRenderer] Positioning submenu for "${triggerName}" with ${itemCount} items`);

        // Temporarily show to measure
        const wasHidden = getComputedStyle(submenu).display === 'none';
        if (wasHidden) {
            submenu.style.visibility = 'hidden';
            submenu.style.display = 'block';
        }

        const submenuRect = submenu.getBoundingClientRect();

        // Check if submenu would overflow to the right
        if (left + submenuRect.width > viewportWidth) {
            // Position to the left of trigger instead
            left = triggerRect.left - submenuRect.width;
            if (left < 0) left = 0;
        }

        // Check if submenu would overflow below taskbar
        if (top + submenuRect.height > availableHeight) {
            // Shift up to fit
            top = availableHeight - submenuRect.height;
            if (top < 0) {
                // Submenu is taller than available space, pin to top and limit height
                top = 0;
                submenu.style.maxHeight = `${availableHeight - 10}px`;
            }
        }

        // Apply positioning
        submenu.style.left = `${left}px`;
        submenu.style.top = `${top}px`;

        // Restore visibility
        if (wasHidden) {
            submenu.style.visibility = '';
            submenu.style.display = '';
        }
    }
}

const StartMenuRenderer = new StartMenuRendererClass();
export default StartMenuRenderer;