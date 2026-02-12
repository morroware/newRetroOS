/**
 * IlluminatOS! - Main Entry Point
 * Windows 95 Style Desktop Environment
 *
 * This file initializes all core systems, UI renderers, and features
 * in the correct order to boot the operating system.
 */

// === CONFIG LOADER (must be first) ===
import { loadConfig, getConfig, isBackendAvailable } from './core/ConfigLoader.js';

// === CORE SYSTEMS ===
import StorageManager from './core/StorageManager.js';
import StateManager from './core/StateManager.js';
import EventBus, { Events } from './core/EventBus.js';
import WindowManager from './core/WindowManager.js';
import FileSystemManager from './core/FileSystemManager.js';
import CommandBus from './core/CommandBus.js';
import ScriptEngine from './core/script/ScriptEngine.js';

// === UI RENDERERS ===
import TaskbarRenderer from './ui/TaskbarRenderer.js';
import DesktopRenderer from './ui/DesktopRenderer.js';
import StartMenuRenderer from './ui/StartMenuRenderer.js';
import ContextMenuRenderer from './ui/ContextMenuRenderer.js';

// === APPLICATIONS ===
import AppRegistry from './apps/AppRegistry.js';

// === FEATURES ===
import FeatureRegistry from './core/FeatureRegistry.js';
import SoundSystem from './features/SoundSystem.js';
import AchievementSystem from './features/AchievementSystem.js';
import EasterEggs from './features/EasterEggs.js';
import ClippyAssistant from './features/ClippyAssistant.js';
import DesktopPet from './features/DesktopPet.js';
import Screensaver from './features/Screensaver.js';
import SystemDialogs from './features/SystemDialogs.js';

// === PLUGIN SYSTEM ===
import PluginLoader from './core/PluginLoader.js';

// Log successful module loading
console.log('[IlluminatOS!] All modules imported successfully');

// === BOOT TIPS ===
// Inline defaults used if no server config is available
const DEFAULT_BOOT_TIPS = [
    'Loading your personalized experience...',
    'Initializing desktop icons...',
    'Starting Windows Manager...',
    'Loading system tray...',
    'Preparing applications...',
    'Almost ready...'
];

// Resolved after loadConfig() in initializeOS
let BOOT_TIPS = DEFAULT_BOOT_TIPS;

/**
 * Boot sequence - animates the loading screen
 */
class BootSequence {
    constructor() {
        this.bootScreen = document.getElementById('bootScreen');
        this.bootTip = document.getElementById('bootTip');
        this.loadingFill = document.querySelector('.loading-fill');
        this.progress = 0;
        this.tipIndex = 0;
    }

    /**
     * Run the boot animation
     * @returns {Promise} Resolves when boot is complete
     */
    async run() {
        return new Promise((resolve) => {
            // Animate loading bar
            const progressInterval = setInterval(() => {
                this.progress += Math.random() * 15 + 5;
                if (this.progress >= 100) {
                    this.progress = 100;
                    clearInterval(progressInterval);
                    clearInterval(tipInterval);

                    // Finish boot
                    setTimeout(() => {
                        this.complete();
                        resolve();
                    }, 500);
                }

                if (this.loadingFill) {
                    this.loadingFill.style.width = `${this.progress}%`;
                }
            }, 200);

            // Cycle through boot tips
            const tipInterval = setInterval(() => {
                this.tipIndex = (this.tipIndex + 1) % BOOT_TIPS.length;
                if (this.bootTip) {
                    this.bootTip.textContent = BOOT_TIPS[this.tipIndex];
                }
            }, 800);
        });
    }

    /**
     * Complete boot sequence - hide boot screen
     */
    complete() {
        if (this.bootScreen) {
            this.bootScreen.classList.add('fade-out');
            setTimeout(() => {
                this.bootScreen.style.display = 'none';
            }, 500);
        }

        // Emit boot complete event
        EventBus.emit(Events.BOOT_COMPLETE, { timestamp: Date.now() });

        // Play startup sound
        EventBus.emit(Events.SOUND_PLAY, { type: 'startup' });

        console.log('[IlluminatOS!] Boot complete!');
    }
}

/**
 * Initialize a single component with error handling
 * @param {string} name - Component name for logging
 * @param {Function} initFn - Initialization function (can be async)
 */
async function initComponent(name, initFn) {
    try {
        console.log(`[IlluminatOS!]   - Initializing ${name}...`);
        await initFn();
    } catch (error) {
        console.error(`[IlluminatOS!] FAILED to initialize ${name}:`, error);
        throw new Error(`Failed to initialize ${name}: ${error.message}`);
    }
}

/**
 * Initialize all OS components in the correct order
 * @param {Function} onProgress - Callback for progress updates
 */
async function initializeOS(onProgress = () => {}) {
    console.log('[IlluminatOS!] Starting initialization...');

    // === Phase -1: Load server config (or fall back to defaults) ===
    console.log('[IlluminatOS!] Phase -1: Config Loader');
    await loadConfig();

    if (!isBackendAvailable()) {
        console.warn('[IlluminatOS!] ⚠ PHP backend not available — running with inline defaults. Admin config changes will not take effect. To enable the backend, serve the app with PHP (e.g. php -S localhost:8000).');
    }

    BOOT_TIPS = getConfig('bootTips', DEFAULT_BOOT_TIPS);

    // Patch boot screen branding from config (JS patching approach — keeps index.html static)
    const bootLogo = document.querySelector('.boot-logo');
    const bootVersion = document.querySelector('.boot-version');
    if (bootLogo) bootLogo.textContent = getConfig('branding.osName', 'IlluminatOS!');
    if (bootVersion) bootVersion.textContent = getConfig('branding.versionString', 'Version 95.0 - Modular Edition');
    const bsodTitle = document.querySelector('.bsod-content h1');
    if (bsodTitle) bsodTitle.textContent = getConfig('branding.bsodTitle', 'IlluminatOS!');
    document.title = getConfig('branding.osName', 'IlluminatOS!') + ' - Desktop';

    // === Phase 0: App Registry (CRITICAL - was running outside error handling!) ===
    console.log('[IlluminatOS!] Phase 0: App Registry');
    onProgress(5, 'Registering applications...');
    await initComponent('AppRegistry', () => AppRegistry.initialize());

    // === Phase 1: Core Systems ===
    console.log('[IlluminatOS!] Phase 1: Core Systems');
    onProgress(15, 'Loading core systems...');
    await initComponent('StorageManager', () => StorageManager.initialize());
    await initComponent('StateManager', () => StateManager.initialize());
    await initComponent('WindowManager', () => WindowManager.initialize());

    // Initialize scripting infrastructure
    await initComponent('CommandBus', () => CommandBus.initialize());
    await initComponent('ScriptEngine', () => ScriptEngine.initialize({
        FileSystemManager,
        EventBus,
        CommandBus,
        WindowManager,
        AppRegistry,
        StateManager,
        StorageManager
    }));

    // === Phase 1.5: Sync Filesystem with Apps and Desktop ===
    console.log('[IlluminatOS!] Phase 1.5: Filesystem Sync');
    onProgress(25, 'Syncing filesystem...');
    await initComponent('FilesystemSync', () => {
        // Sync desktop icons into filesystem as .lnk files
        // This allows Terminal and MyComputer to see all desktop items
        const icons = StateManager.getState('icons');
        FileSystemManager.syncDesktopIcons(icons);

        // Sync installed apps into Program Files
        const apps = AppRegistry.getAll();
        FileSystemManager.syncInstalledApps(apps);

        // Save the updated filesystem
        FileSystemManager.saveFileSystem();
    });

    // === Phase 2: Features ===
    console.log('[IlluminatOS!] Phase 2: Features');
    onProgress(35, 'Loading features...');

    // Register all features with FeatureRegistry
    await initComponent('FeatureRegistry', () => {
        // Debug: Log features before registration
        const featuresToRegister = [
            SoundSystem,
            AchievementSystem,
            SystemDialogs,
            Screensaver,
            ClippyAssistant,
            DesktopPet,
            EasterEggs
        ];

        console.log('[IlluminatOS!] Features to register:', featuresToRegister.map(f => f?.id || 'UNDEFINED'));

        // Verify each feature is valid
        featuresToRegister.forEach((feature, i) => {
            if (!feature) {
                console.error(`[IlluminatOS!] Feature at index ${i} is undefined/null!`);
            } else if (!feature.id) {
                console.error(`[IlluminatOS!] Feature at index ${i} has no id:`, feature);
            }
        });

        FeatureRegistry.registerAll(featuresToRegister);
    });

    // === Phase 2.5: Load Plugins ===
    console.log('[IlluminatOS!] Phase 2.5: Plugin System');
    onProgress(45, 'Loading plugins...');
    await initComponent('PluginLoader', async () => {
        // Load plugin list from config or use inline default
        const configPlugins = getConfig('plugins', [
            { path: './plugins/features/dvd-bouncer/index.js', enabled: true }
        ]);

        // Merge config with existing manifest to preserve runtime toggles
        // (e.g., user disabled a plugin at runtime — that state survives reboot)
        const existingManifest = PluginLoader.getPluginManifest();
        const existingByPath = {};
        for (const p of (existingManifest.plugins || [])) {
            existingByPath[p.path] = p;
        }

        const manifest = { plugins: [] };
        for (const plugin of configPlugins) {
            const existing = existingByPath[plugin.path];
            manifest.plugins.push({
                path: plugin.path,
                enabled: existing !== undefined ? existing.enabled : (plugin.enabled !== false)
            });
        }

        PluginLoader.savePluginManifest(manifest);

        // Load all plugins (registers plugin features with FeatureRegistry)
        await PluginLoader.loadAllPlugins();

        // Log status for debugging
        console.log('[IlluminatOS!] Plugins loaded:');
        PluginLoader.logStatus();
    });

    // === Phase 2.7: Initialize All Features (Core + Plugin) ===
    console.log('[IlluminatOS!] Phase 2.7: Initializing all features');
    onProgress(50, 'Initializing features...');
    await initComponent('FeatureRegistry.initializeAll', async () => {
        await FeatureRegistry.initializeAll();
    });

    // === Phase 3: UI Renderers ===
    console.log('[IlluminatOS!] Phase 3: UI Renderers');
    onProgress(60, 'Rendering desktop...');
    await initComponent('TaskbarRenderer', () => TaskbarRenderer.initialize());
    await initComponent('DesktopRenderer', () => DesktopRenderer.initialize());
    await initComponent('StartMenuRenderer', () => StartMenuRenderer.initialize());
    await initComponent('ContextMenuRenderer', () => ContextMenuRenderer.initialize());

    // === Phase 4: Apply saved settings ===
    console.log('[IlluminatOS!] Phase 4: Applying settings');
    onProgress(80, 'Applying settings...');
    await initComponent('Settings', () => applySettings());

    // === Phase 5: Setup global handlers ===
    console.log('[IlluminatOS!] Phase 5: Global handlers');
    onProgress(90, 'Setting up handlers...');
    await initComponent('GlobalHandlers', () => setupGlobalHandlers());

    // === Phase 5.5: Run Autoexec Script ===
    console.log('[IlluminatOS!] Phase 5.5: Autoexec Scripts');
    onProgress(95, 'Running startup scripts...');
    await initComponent('Autoexec', async () => {
        try {
            const { runAutoexec } = await import('./core/script/AutoexecLoader.js');
            await runAutoexec({
                FileSystemManager,
                EventBus,
                CommandBus,
                StateManager,
                WindowManager
            });
        } catch (error) {
            // Autoexec errors should not prevent boot
            console.warn('[IlluminatOS!] Autoexec error (non-fatal):', error);
        }
    });

    // Mark as visited
    if (!StateManager.getState('user.hasVisited')) {
        StateManager.setState('user.hasVisited', true, true);
    }

    // Emit deferred storage fallback warning now that UI is ready
    StorageManager.emitFallbackWarning();

    onProgress(100, 'Ready!');
    console.log('[IlluminatOS!] Initialization complete');
}

/**
 * Apply saved user settings
 */
function applySettings() {
    // Apply CRT effect
    const crtEnabled = StateManager.getState('settings.crtEffect');
    const crtOverlay = document.getElementById('crtOverlay');
    if (crtOverlay) {
        crtOverlay.style.display = crtEnabled ? 'block' : 'none';
    }

    // Apply desktop background color if saved
    const savedBg = StorageManager.get('desktopBg');
    const desktop = document.getElementById('desktop');
    if (savedBg && desktop) {
        desktop.style.backgroundColor = savedBg;
    }

    // Apply wallpaper pattern (default from admin config, fallback: space)
    const savedWallpaper = StorageManager.get('desktopWallpaper') ?? getConfig('defaults.wallpaper', 'space');
    if (savedWallpaper && desktop) {
        // Inline fallback patterns (used if no server config)
        const INLINE_WALLPAPERS = {
            'clouds': 'radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.8) 0%, transparent 50%), radial-gradient(ellipse at 80% 40%, rgba(255,255,255,0.6) 0%, transparent 40%), radial-gradient(ellipse at 50% 70%, rgba(255,255,255,0.7) 0%, transparent 45%), radial-gradient(ellipse at 10% 80%, rgba(255,255,255,0.5) 0%, transparent 35%), linear-gradient(180deg, #87CEEB 0%, #4A90D9 100%)',
            'tiles': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
            'waves': 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.15) 20px, rgba(255,255,255,0.15) 40px), repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 40px), linear-gradient(135deg, #1a5276 0%, #2980b9 50%, #1a5276 100%)',
            'forest': 'linear-gradient(180deg, #228B22 0%, #006400 30%, #004d00 60%, #003300 100%)',
            'space': 'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.8) 0%, transparent 1%), radial-gradient(ellipse at 80% 30%, rgba(255,255,255,0.6) 0%, transparent 1%), radial-gradient(ellipse at 40% 60%, rgba(255,255,255,0.9) 0%, transparent 1%), radial-gradient(ellipse at 60% 80%, rgba(255,255,255,0.5) 0%, transparent 1%), radial-gradient(ellipse at 10% 70%, rgba(255,255,255,0.7) 0%, transparent 1%), radial-gradient(ellipse at 90% 60%, rgba(255,255,255,0.4) 0%, transparent 1%), radial-gradient(ellipse at 30% 90%, rgba(255,255,255,0.6) 0%, transparent 1%), radial-gradient(ellipse at 70% 10%, rgba(255,255,255,0.8) 0%, transparent 1%), linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 50%, #0a0a2e 100%)'
        };

        // Try server config first, fall back to inline
        const configWallpapers = getConfig('wallpapers', null);
        const pattern = configWallpapers?.[savedWallpaper]?.css
            || INLINE_WALLPAPERS[savedWallpaper];
        if (pattern) {
            desktop.style.backgroundImage = pattern;
        }
    }

    // Apply color scheme (default from admin config, fallback: slate)
    const colorScheme = StorageManager.get('colorScheme') ?? getConfig('defaults.colorScheme', 'slate');
    if (colorScheme && colorScheme !== 'win95') {
        const INLINE_COLOR_SCHEMES = {
            highcontrast: { window: '#000000', titlebar: '#800080' },
            desert: { window: '#d4c4a8', titlebar: '#8b7355' },
            ocean: { window: '#b0c4de', titlebar: '#003366' },
            rose: { window: '#e8d0d0', titlebar: '#8b4560' },
            slate: { window: '#a0a0b0', titlebar: '#404050' }
        };
        const configSchemes = getConfig('colorSchemes', null);
        const scheme = configSchemes?.[colorScheme] || INLINE_COLOR_SCHEMES[colorScheme];
        if (scheme) {
            document.documentElement.style.setProperty('--win95-gray', scheme.window);
            document.documentElement.style.setProperty('--win95-blue', scheme.titlebar);
            document.documentElement.style.setProperty('--accent-color', scheme.titlebar);
            document.body.classList.add(`scheme-${colorScheme}`);
        }
    }

    // Apply display effects settings
    const windowAnimations = StorageManager.get('windowAnimations');
    const menuShadows = StorageManager.get('menuShadows');
    const smoothScrolling = StorageManager.get('smoothScrolling');
    const iconSize = StorageManager.get('iconSize') || 'medium';
    const energySaving = StorageManager.get('energySaving');

    // Apply animation setting (default is enabled)
    if (windowAnimations === false) {
        document.body.classList.add('no-animations');
    }

    // Apply shadows setting (default is enabled)
    if (menuShadows === false) {
        document.body.classList.add('no-shadows');
    }

    // Apply smooth scrolling setting (default is enabled)
    if (smoothScrolling === false) {
        document.body.classList.add('no-smooth-scroll');
    }

    // Apply icon size
    document.body.classList.add(`icon-size-${iconSize}`);

    // Apply energy saving mode
    if (energySaving) {
        document.body.classList.add('energy-saving');
    }

    // Subscribe to CRT setting changes
    StateManager.subscribe('settings.crtEffect', (enabled) => {
        const overlay = document.getElementById('crtOverlay');
        if (overlay) {
            overlay.style.display = enabled ? 'block' : 'none';
        }
    });
}

/**
 * Setup global event handlers
 */
function setupGlobalHandlers() {
    // NOTE: dialog:alert is now handled exclusively by SystemDialogs feature
    // The legacy showDialog() function below is kept for fallback but not subscribed
    // to avoid duplicate dialogs appearing when scripts emit dialog:alert events.

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('[IlluminatOS!] Unhandled promise rejection:', event.reason);
        EventBus.emit('system:error', {
            type: 'unhandledrejection',
            error: event.reason?.message || String(event.reason)
        });
    });

    // Handle BSOD (Blue Screen of Death)
    EventBus.on('bsod:trigger', () => {
        showBSOD();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+T = Terminal
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            AppRegistry.launch('terminal');
        }

        // Escape closes context menu and start menu
        if (e.key === 'Escape') {
            EventBus.emit(Events.CONTEXT_MENU_HIDE);
            const startMenu = document.getElementById('startMenu');
            if (startMenu && startMenu.classList.contains('active')) {
                EventBus.emit(Events.START_MENU_TOGGLE, { open: false });
            }
        }
    });

    // Prevent default context menu on body (except inputs)
    document.body.addEventListener('contextmenu', (e) => {
        if (!e.target.closest('input, textarea')) {
            e.preventDefault();
        }
    });
}

/**
 * Show a dialog box
 */
function showDialog(message, icon = 'info') {
    const overlay = document.getElementById('dialogOverlay');
    const dialogIcon = document.getElementById('dialogIcon');
    const dialogText = document.getElementById('dialogText');
    const dialogOk = document.getElementById('dialogOk');

    if (!overlay || !dialogText) return;

    const icons = {
        'info': 'i',
        'warning': '!',
        'error': 'X',
        'question': '?'
    };

    if (dialogIcon) {
        dialogIcon.textContent = icons[icon] || icons.info;
    }
    dialogText.textContent = message;
    overlay.classList.add('active');

    const closeDialog = () => {
        overlay.classList.remove('active');
        dialogOk.removeEventListener('click', closeDialog);
    };

    dialogOk.addEventListener('click', closeDialog);

    // Close on escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeDialog();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Show Blue Screen of Death
 */
function showBSOD() {
    const bsod = document.getElementById('bsod');
    if (bsod) {
        bsod.classList.add('active');

        // Any key to dismiss
        const dismissHandler = () => {
            bsod.classList.remove('active');
            document.removeEventListener('keydown', dismissHandler);
            document.removeEventListener('click', dismissHandler);
        };

        setTimeout(() => {
            document.addEventListener('keydown', dismissHandler);
            document.addEventListener('click', dismissHandler);
        }, 1000);
    }
}

// === MAIN EXECUTION ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[IlluminatOS!] DOM Ready - Starting boot sequence');

    // Signal that the real boot sequence has started (stops fallback animation)
    window.bootSequenceStarted = true;

    // Create boot sequence
    const boot = new BootSequence();

    // Track initialization progress
    let initProgress = 0;
    let initTip = 'Starting up...';
    let initComplete = false;
    let initError = null;

    // Start boot animation IMMEDIATELY (don't wait for init)
    // This ensures users see progress even if init has issues
    const bootPromise = new Promise((resolve) => {
        let cleaned = false;
        const cleanup = () => {
            if (cleaned) return;
            cleaned = true;
            clearInterval(progressInterval);
            clearInterval(tipInterval);
        };

        const progressInterval = setInterval(() => {
            // Use actual init progress if available, otherwise animate slowly
            if (initComplete) {
                boot.progress = 100;
            } else if (initError) {
                cleanup();
                resolve();
                return;
            } else {
                // Smoothly animate towards init progress
                const targetProgress = Math.min(initProgress, 95); // Cap at 95% until init completes
                boot.progress = Math.min(boot.progress + 2, targetProgress);
            }

            if (boot.loadingFill) {
                boot.loadingFill.style.width = `${boot.progress}%`;
            }

            if (boot.progress >= 100) {
                cleanup();
                setTimeout(() => {
                    boot.complete();
                    resolve();
                }, 300);
            }
        }, 100);

        // Update tips from init progress
        const tipInterval = setInterval(() => {
            if (boot.bootTip && initTip) {
                boot.bootTip.textContent = initTip;
            }
        }, 200);
    });

    try {
        // Initialize OS with progress callbacks and timeout safety
        const INIT_TIMEOUT = 30000; // 30 seconds max for initialization

        const initPromise = initializeOS((progress, tip) => {
            initProgress = progress;
            initTip = tip;
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Initialization timed out after ${INIT_TIMEOUT/1000} seconds. Last progress: ${initProgress}% - "${initTip}"`));
            }, INIT_TIMEOUT);
        });

        // Race between init completing and timeout
        await Promise.race([initPromise, timeoutPromise]);

        initComplete = true;

        // Wait for boot animation to finish
        await bootPromise;

        console.log('[IlluminatOS!] System ready!');
    } catch (error) {
        console.error('[IlluminatOS!] Boot failed with error:', error);
        initError = error;

        // Show error to user and allow recovery
        const bootScreen = document.getElementById('bootScreen');
        if (bootScreen) {
            bootScreen.innerHTML = `
                <div style="color: white; text-align: center; padding: 20px; font-family: 'Courier New', monospace;">
                    <h2 style="color: #ff6b6b;">⚠️ IlluminatOS! Boot Error</h2>
                    <p style="color: #aaa; margin: 15px 0;">An error occurred during startup:</p>
                    <pre style="background: #1a1a1a; padding: 15px; margin: 15px auto; border-radius: 4px; text-align: left; max-width: 600px; overflow: auto; border: 1px solid #333; color: #ff6b6b; font-size: 12px;">${error.message}</pre>
                    <p style="color: #888; font-size: 12px; margin: 10px 0;">Check browser console (F12) for full details</p>
                    <button onclick="location.reload()" style="padding: 12px 24px; cursor: pointer; margin-top: 15px; background: #4a4a4a; color: white; border: 2px outset #666; font-size: 14px;">
                        🔄 Restart IlluminatOS!
                    </button>
                    <button onclick="localStorage.clear(); location.reload()" style="padding: 12px 24px; cursor: pointer; margin-top: 15px; margin-left: 10px; background: #8b0000; color: white; border: 2px outset #666; font-size: 14px;">
                        🗑️ Reset & Restart
                    </button>
                </div>
            `;
        }
    }
});
