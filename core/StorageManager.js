/**
 * StorageManager - Abstraction layer for persistent storage
 * Provides localStorage wrapper with JSON serialization and fallbacks
 */

class StorageManagerClass {
    constructor() {
        this.prefix = 'illuminatos_'; // IlluminatOS! prefix
        this.available = this.checkAvailability();
        this.memoryFallback = new Map();
    }

    /**
     * Check if localStorage is available
     * @returns {boolean}
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('[StorageManager] localStorage not available, using memory fallback');
            return false;
        }
    }

    /**
     * Get prefixed key
     * @param {string} key - Key name
     * @returns {string} Prefixed key
     */
    getKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * Get a value from storage
     * @param {string} key - Key name
     * @param {*} defaultValue - Default if not found
     * @returns {*} Parsed value
     */
    get(key, defaultValue = null) {
        try {
            const prefixedKey = this.getKey(key);
            
            if (this.available) {
                const item = localStorage.getItem(prefixedKey);
                if (item === null) return defaultValue;
                return JSON.parse(item);
            } else {
                return this.memoryFallback.has(prefixedKey) 
                    ? this.memoryFallback.get(prefixedKey) 
                    : defaultValue;
            }
        } catch (e) {
            console.error(`[StorageManager] Error getting "${key}":`, e);
            return defaultValue;
        }
    }

    /**
     * Set a value in storage
     * @param {string} key - Key name
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    set(key, value) {
        try {
            const prefixedKey = this.getKey(key);
            const serialized = JSON.stringify(value);
            
            if (this.available) {
                localStorage.setItem(prefixedKey, serialized);
            } else {
                this.memoryFallback.set(prefixedKey, value);
            }
            return true;
        } catch (e) {
            // Handle quota exceeded
            if (e.name === 'QuotaExceededError') {
                console.error('[StorageManager] Storage quota exceeded');
                this.cleanup();
            } else {
                console.error(`[StorageManager] Error setting "${key}":`, e);
            }
            return false;
        }
    }

    /**
     * Remove a value from storage
     * @param {string} key - Key name
     */
    remove(key) {
        const prefixedKey = this.getKey(key);
        
        if (this.available) {
            localStorage.removeItem(prefixedKey);
        } else {
            this.memoryFallback.delete(prefixedKey);
        }
    }

    /**
     * Check if key exists
     * @param {string} key - Key name
     * @returns {boolean}
     */
    has(key) {
        const prefixedKey = this.getKey(key);
        
        if (this.available) {
            return localStorage.getItem(prefixedKey) !== null;
        } else {
            return this.memoryFallback.has(prefixedKey);
        }
    }

    /**
     * Get all keys (without prefix)
     * @returns {string[]} Array of keys
     */
    keys() {
        const keys = [];
        
        if (this.available) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    keys.push(key.substring(this.prefix.length));
                }
            }
        } else {
            this.memoryFallback.forEach((_, key) => {
                if (key.startsWith(this.prefix)) {
                    keys.push(key.substring(this.prefix.length));
                }
            });
        }
        
        return keys;
    }

    /**
     * Clear all app-specific storage
     */
    clear() {
        if (this.available) {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } else {
            this.memoryFallback.clear();
        }
    }

    /**
     * Get storage usage info
     * @returns {Object} Usage statistics
     */
    getUsage() {
        let used = 0;
        let total = 5 * 1024 * 1024; // Typical 5MB limit

        if (this.available) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                used += (key.length + value.length) * 2; // UTF-16
            }
        }

        return {
            used,
            total,
            available: total - used,
            percentUsed: ((used / total) * 100).toFixed(2)
        };
    }

    /**
     * Cleanup old/unnecessary data when storage is full
     * Removes the largest non-essential items to free space
     */
    cleanup() {
        console.log('[StorageManager] Running cleanup...');
        if (!this.available) return;

        // Collect all app items with their sizes
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                const value = localStorage.getItem(key);
                items.push({ key, size: (key.length + value.length) * 2 });
            }
        }

        // Sort by size descending - remove largest items first
        items.sort((a, b) => b.size - a.size);

        // Essential keys that should not be cleaned up
        const essential = new Set([
            this.getKey('desktopIcons'),
            this.getKey('soundEnabled'),
            this.getKey('crtEnabled'),
            this.getKey('petEnabled'),
            this.getKey('hasVisited'),
            this.getKey('achievements')
        ]);

        let freed = 0;
        for (const item of items) {
            if (essential.has(item.key)) continue;
            localStorage.removeItem(item.key);
            freed += item.size;
            console.log(`[StorageManager] Removed ${item.key} (${item.size} bytes)`);
            // Free at least 100KB
            if (freed > 100 * 1024) break;
        }

        console.log(`[StorageManager] Freed ~${Math.round(freed / 1024)}KB`);
    }

    /**
     * Export all data as JSON string
     * @returns {string} JSON export
     */
    exportAll() {
        const data = {};
        this.keys().forEach(key => {
            data[key] = this.get(key);
        });
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import data from JSON string
     * @param {string} json - JSON data
     * @returns {boolean} Success status
     */
    importAll(json) {
        try {
            const data = JSON.parse(json);
            Object.entries(data).forEach(([key, value]) => {
                this.set(key, value);
            });
            return true;
        } catch (e) {
            console.error('[StorageManager] Import failed:', e);
            return false;
        }
    }

    /**
     * Initialize storage (for consistency with other modules)
     */
    initialize() {
        console.log('[StorageManager] Initialized, available:', this.available);
    }
}

// Singleton instance
const StorageManager = new StorageManagerClass();

export { StorageManager };
export default StorageManager;
