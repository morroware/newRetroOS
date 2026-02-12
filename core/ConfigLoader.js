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
let _backendAvailable = false;

/**
 * Resolve the API base path relative to the document's location.
 * Handles subdirectory deployments (e.g. /retro/) by deriving the
 * base from the current page URL rather than assuming root.
 * @returns {string} Base path ending with '/' (e.g. '/' or '/retro/')
 */
function getApiBasePath() {
    // For the main app, the document is at the root of the deployment.
    // For admin/index.php, the document is at <base>/admin/index.php.
    // We detect the base by finding the path up to (but not including) known subdirs.
    const path = window.location.pathname;

    // If we're inside the admin panel, strip '/admin/...' to get the base
    const adminIdx = path.indexOf('/admin');
    if (adminIdx !== -1) {
        return path.substring(0, adminIdx + 1);
    }

    // For the main app, use the directory of the current page
    const lastSlash = path.lastIndexOf('/');
    return path.substring(0, lastSlash + 1);
}

/**
 * Load config from the server.
 * Should be called once during boot, before any module reads config.
 * If the fetch fails (no PHP, network error, etc.), the OS still works —
 * every getConfig() call has a fallback default.
 *
 * @returns {Promise<Object>} The loaded config (or empty object on failure)
 */
export async function loadConfig() {
    const basePath = getApiBasePath();
    const configUrl = `${basePath}api/config.php`;

    try {
        const resp = await fetch(configUrl);
        if (resp.ok) {
            _config = await resp.json();
            _backendAvailable = true;
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

/**
 * Check if the PHP backend responded successfully.
 * Returns false when running on a static server or when the API is unreachable.
 * @returns {boolean}
 */
export function isBackendAvailable() {
    return _backendAvailable;
}

export { getApiBasePath };

export default { loadConfig, getConfig, hasServerConfig, isBackendAvailable, getApiBasePath };
