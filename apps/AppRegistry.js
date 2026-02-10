/**
 * AppRegistry - Central registry for all applications
 * Manages app registration, launching, and querying
 *
 * TO ADD A NEW APP:
 * 1. Create your app file extending AppBase (see DEVELOPER_GUIDE.md)
 * 2. Include 'category' in your app's constructor config
 * 3. Import your app below
 * 4. Add to the appropriate section in initialize()
 *
 * Example:
 *   // In your app file:
 *   super({ id: 'myapp', name: 'My App', icon: '📱', category: 'accessories' });
 *
 *   // In initialize():
 *   this.register(new MyApp());  // Category is auto-detected from app config!
 */

import EventBus, { Events } from '../core/EventBus.js';
import { CATEGORIES } from '../core/Constants.js';
import WindowManager from '../core/WindowManager.js';

// --- App Imports ---
import Calculator from './Calculator.js';
import Notepad from './Notepad.js';
import Terminal from './Terminal.js';
import Paint from './Paint.js';
import Minesweeper from './Minesweeper.js';
import Snake from './Snake.js';
import Asteroids from './Asteroids.js';
import Doom from './Doom.js';
import Solitaire from './Solitaire.js';
import MediaPlayer from './MediaPlayer.js';
import VideoPlayer from './VideoPlayer.js';
import Browser from './Browser.js';
import ControlPanel from './ControlPanel.js';
import AdminPanel from './AdminPanel.js';
import MyComputer from './MyComputer.js';
import RecycleBin from './RecycleBin.js';
import Winamp from './Winamp.js';
import Defrag from './Defrag.js';
import SkiFree from './SkiFree.js';
import ChatRoom from './ChatRoom.js';
import TaskManager from './TaskManager.js';
import DisplayProperties from './DisplayProperties.js';
import SoundSettings from './SoundSettings.js';
import FindFiles from './FindFiles.js';
import HelpSystem from './HelpSystem.js';
import Calendar from './Calendar.js';
import Clock from './Clock.js';
import FreeCell from './FreeCell.js';
import Zork from './Zork.js';
import HyperCard from './HyperCard.js';
import FeaturesSettings from './FeaturesSettings.js';
import ScriptRunner from './ScriptRunner.js';
// --- System App Placeholders (Simple implementations for completeness) ---
import AppBase from './AppBase.js';

class SimpleApp extends AppBase {
    constructor(id, name, icon, content, category = 'system', showInMenu = false) {
        super({ id, name, icon, width: 400, height: 300, category, showInMenu });
        this.content = content;
    }
    onOpen() {
        return `<div style="padding:20px;">${this.content || 'Coming soon...'}</div>`;
    }
}

class AppRegistryClass {
    constructor() {
        this.apps = new Map();
        this.metadata = new Map();
    }

    /**
     * Register an application
     * Apps can specify category and showInMenu in their constructor config,
     * eliminating the need to pass these as metadata.
     *
     * @param {AppBase} app - App instance
     * @param {Object} meta - Optional additional metadata (overrides app config)
     */
    register(app, meta = {}) {
        if (this.apps.has(app.id)) {
            console.warn(`[AppRegistry] App "${app.id}" already registered`);
            return;
        }

        this.apps.set(app.id, app);

        // Build metadata - app config takes precedence, meta can override
        const appConfig = app.config || {};
        this.metadata.set(app.id, {
            id: app.id,
            name: app.name,
            icon: app.icon,
            // Category: check app.category, then app.config.category, then meta, then default
            category: app.category || appConfig.category || meta.category || CATEGORIES.ACCESSORIES,
            // showInMenu: check app.showInMenu, then app.config.showInMenu, then meta, then default true
            showInMenu: app.showInMenu !== undefined ? app.showInMenu :
                       (appConfig.showInMenu !== undefined ? appConfig.showInMenu :
                       (meta.showInMenu !== undefined ? meta.showInMenu : true)),
            // Include any extra metadata
            ...meta
        });

        console.log(`[AppRegistry] Registered: ${app.name} (${app.id}) [${this.metadata.get(app.id).category}]`);
    }

    /**
     * Batch register multiple apps at once
     * @param {AppBase[]} apps - Array of app instances
     */
    registerAll(apps) {
        apps.forEach(app => this.register(app));
    }

    /**
     * Initialize and register all core apps
     * Apps are grouped by category for organization, but category is
     * determined from the app's own config, not the section it's in.
     */
    initialize() {
        // --- Accessories (Productivity Tools) ---
        this.registerAll([
            new Calculator(),
            new Notepad(),
            new Paint(),
            new Calendar(),
            new Clock(),
            new HyperCard(),
        ]);

        // --- System Tools (Utilities) ---
        this.registerAll([
            new Terminal(),
            new Defrag(),
            new TaskManager(),
            ScriptRunner,
        ]);

        // --- Games ---
        this.registerAll([
            new Minesweeper(),
            new Snake(),
            new Asteroids(),
            new Doom(),
            new Solitaire(),
            new FreeCell(),
            new SkiFree(),
            new Zork(),
        ]);

        // --- Multimedia ---
        this.registerAll([
            new MediaPlayer(),
            new VideoPlayer(),
            new Winamp(),
        ]);

        // --- Internet & Communication ---
        this.registerAll([
            new Browser(),
            new ChatRoom(),
        ]);

        // --- System Apps (category and showInMenu set in app config) ---
        this.registerAll([
            new MyComputer(),
            new RecycleBin(),
            new AdminPanel(),
        ]);

        // --- Settings ---
        // Register each settings app individually with error handling
        // to identify if any fail to load
        console.log('[AppRegistry] Registering Settings apps...');

        try { this.register(new ControlPanel()); }
        catch (e) { console.error('[AppRegistry] FAILED: ControlPanel:', e); }

        try { this.register(new DisplayProperties()); }
        catch (e) { console.error('[AppRegistry] FAILED: DisplayProperties:', e); }

        try { this.register(new SoundSettings()); }
        catch (e) { console.error('[AppRegistry] FAILED: SoundSettings:', e); }

        try {
            console.log('[AppRegistry] Creating FeaturesSettings...');
            const fs = new FeaturesSettings();
            console.log('[AppRegistry] FeaturesSettings created successfully:', fs.id);
            this.register(fs);
        } catch (e) {
            console.error('[AppRegistry] FAILED: FeaturesSettings:', e);
            console.error('[AppRegistry] FeaturesSettings error stack:', e.stack);
        }

        // --- Hidden System Apps ---
        this.registerAll([
            new FindFiles(),
            new HelpSystem(),
            new SimpleApp('run', 'Run', '▶️', 'Run command dialog.'),
            new SimpleApp('shutdown', 'Shut Down', '⏻', 'It is now safe to turn off your computer.'),
        ]);

        console.log(`[AppRegistry] Initialized with ${this.apps.size} apps`);
    }

    /**
     * Get an app instance by ID
     * @param {string} appId - App ID
     * @returns {AppBase|undefined} App instance
     */
    get(appId) {
        return this.apps.get(appId);
    }

    /**
     * Launch an application with comprehensive error handling
     * Implements Windows 95-style behavior:
     * - If app is already open and minimized, restore it instead of creating a new window
     * - If opening a file that's already open in an existing window, restore that window
     *
     * @param {string} appId - App ID to launch
     * @param {object} params - Launch parameters (e.g., { filePath: [...] } for file-based apps)
     * @returns {boolean} True if launch succeeded, false otherwise
     */
    launch(appId, params = {}) {
        // Validate input
        if (!appId || typeof appId !== 'string') {
            console.error('[AppRegistry] Invalid appId:', appId);
            EventBus.emit('app:launch:error', {
                appId: String(appId),
                error: 'Invalid app ID',
                type: 'validation'
            });
            return false;
        }

        const app = this.apps.get(appId);

        if (!app) {
            console.error(`[AppRegistry] Unknown app: ${appId}`);
            EventBus.emit('app:launch:error', {
                appId,
                error: 'App not found',
                type: 'not_found'
            });
            EventBus.emit('dialog:alert', {
                message: `Cannot find application: ${appId}`,
                title: 'Application Not Found',
                icon: 'error'
            });
            return false;
        }

        try {
            // Windows 95 behavior: Check if this file is already open in an existing window
            // This handles cases like double-clicking a .txt file when it's already open in Notepad
            if (params && params.filePath && Array.isArray(params.filePath)) {
                const existingWindowId = app.findWindowWithFile(params.filePath);
                if (existingWindowId) {
                    console.log(`[AppRegistry] File already open in window ${existingWindowId}, restoring...`);
                    WindowManager.focus(existingWindowId); // Will restore if minimized
                    return true;
                }
            }

            // Set parameters if provided
            if (params && typeof params === 'object') {
                if (typeof app.setParams === 'function') {
                    try {
                        app.setParams(params);
                    } catch (paramError) {
                        console.warn(`[AppRegistry] Error setting params for ${appId}:`, paramError);
                        // Continue anyway - params are optional
                    }
                }
            }

            // Launch the app (this is the critical operation)
            // Note: AppBase.launch() already handles singleton apps by focusing existing window
            // and calling onRelaunch() if params are provided
            if (typeof app.launch !== 'function') {
                throw new Error(`App ${appId} does not have a launch() method`);
            }

            app.launch();

            // Emit success event
            EventBus.emit('app:open', {
                appId: appId,
                windowId: app.windowId,
                instance: app.instanceCounter - 1,
                timestamp: Date.now()
            });

            console.log(`[AppRegistry] Successfully launched ${app.name} (${appId})`);
            return true;

        } catch (error) {
            // Comprehensive error logging
            console.error(`[AppRegistry] Failed to launch ${appId}:`, error);
            console.error('[AppRegistry] Error stack:', error.stack);

            // Emit semantic event for error tracking
            EventBus.emit('app:launch:error', {
                appId,
                appName: app.name,
                error: error.message,
                stack: error.stack,
                type: 'launch_failed',
                timestamp: Date.now()
            });

            // Show user-friendly error dialog
            EventBus.emit('dialog:alert', {
                message: `Failed to open ${app.name}:\n\n${error.message}`,
                title: 'Application Error',
                icon: 'error'
            });

            return false;
        }
    }

    /**
     * Close an application
     * @param {string} appId - App ID to close
     * @returns {boolean} True if close succeeded, false otherwise
     */
    close(appId) {
        if (!appId || typeof appId !== 'string') {
            console.error('[AppRegistry] Invalid appId for close:', appId);
            return false;
        }

        const app = this.apps.get(appId);
        if (!app) {
            console.warn(`[AppRegistry] Cannot close unknown app: ${appId}`);
            return false;
        }

        try {
            if (typeof app.close === 'function') {
                app.close();
            }
            EventBus.emit('app:close', {
                id: appId,
                timestamp: Date.now()
            });
            return true;
        } catch (error) {
            console.error(`[AppRegistry] Error closing ${appId}:`, error);
            EventBus.emit('app:close:error', {
                appId,
                error: error.message,
                timestamp: Date.now()
            });
            return false;
        }
    }

    /**
     * Get all registered app metadata
     */
    getAll() {
        return Array.from(this.metadata.values());
    }

    /**
     * Get apps by category
     */
    getByCategory(category) {
        const all = this.getAll();
        const filtered = all.filter(m => m.category === category);
        console.log(`[AppRegistry] getByCategory('${category}'):`, filtered);
        return filtered;
    }
}

// Singleton instance
const AppRegistry = new AppRegistryClass();

// NOTE: Do NOT auto-initialize here! This runs outside error handling.
// Initialization is now called explicitly from index.js inside the try-catch block.
// AppRegistry.initialize();

export default AppRegistry;