/**
 * ConfigLoader - Frontend configuration loader for IlluminatOS!
 *
 * Fetches server-side config at boot and provides a getConfig() helper.
 * Falls back gracefully if no backend is available (static site mode).
 *
 * Usage:
 *   import { loadConfig, getConfig } from './core/ConfigLoader.js';
 *
 *   await loadConfig();                              // Call once at boot
 *   const osName = getConfig('branding.osName', 'IlluminatOS!');
 */

let _config = null;

/**
 * Load config from the server.
 * Should be called once during boot, before any module reads config.
 * If the fetch fails (no PHP, network error, etc.), the OS still works —
 * every getConfig() call has a fallback default.
 *
 * @returns {Promise<Object>} The loaded config (or empty object on failure)
 */
export async function loadConfig() {
    try {
        const resp = await fetch('/api/config.php');
        if (resp.ok) {
            _config = await resp.json();
            console.log('[ConfigLoader] Server config loaded successfully');
        } else {
            console.warn(`[ConfigLoader] Server returned ${resp.status}, using inline defaults`);
            _config = {};
        }
    } catch (e) {
        console.warn('[ConfigLoader] No backend config available, using inline defaults');
        _config = {};
    }

    window.__OS_CONFIG = _config;
    return _config;
}

/**
 * Get a config value by dot-notation path.
 *
 * @param {string} path - Dot-notation key path (e.g. 'branding.osName')
 * @param {*} defaultValue - Fallback if the key is not in the config
 * @returns {*} The config value or the default
 *
 * @example
 *   getConfig('branding.osName', 'IlluminatOS!')
 *   getConfig('bootTips', ['Loading...'])
 *   getConfig('wallpapers.space.css', '')
 */
export function getConfig(path, defaultValue) {
    if (!_config) return defaultValue;

    const value = path.split('.').reduce((obj, key) =>
        obj && obj[key] !== undefined ? obj[key] : undefined, _config);

    return value !== undefined ? value : defaultValue;
}

/**
 * Check if any server config was loaded (i.e., backend is available)
 * @returns {boolean}
 */
export function hasServerConfig() {
    return _config !== null && Object.keys(_config).length > 0;
}

export default { loadConfig, getConfig, hasServerConfig };
