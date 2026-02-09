/**
 * PluginLoader - Loads and manages third-party plugins
 * Plugins can provide new features, apps, themes, and more
 *
 * Plugin Structure:
 *   /plugins/features/my-plugin/
 *     ├── index.js           (plugin entry point)
 *     ├── MyFeature.js       (feature implementation)
 *     └── README.md          (plugin documentation)
 *
 * Plugin Export Format:
 *   export default {
 *       id: 'my-plugin',
 *       name: 'My Plugin',
 *       version: '1.0.0',
 *       author: 'Author Name',
 *       features: [new MyFeature()],
 *       apps: [new MyApp()],
 *       onLoad: () => { },
 *       onUnload: () => { }
 *   };
 */

import FeatureRegistry from './FeatureRegistry.js';
import EventBus from './EventBus.js';
import StorageManager from './StorageManager.js';

class PluginLoaderClass {
    constructor() {
        // Map of plugin id -> plugin object
        this.plugins = new Map();

        // Map of feature id -> plugin id (track which plugin provides which feature)
        this.pluginFeatures = new Map();

        // Map of app id -> plugin id (track which plugin provides which app)
        this.pluginApps = new Map();

        // Loaded state
        this.initialized = false;
    }

    /**
     * Load a plugin from a module
     * @param {Object} pluginModule - Imported plugin module
     * @returns {boolean} Success status
     */
    async loadPlugin(pluginModule) {
        try {
            const plugin = pluginModule.default || pluginModule;

            // Validate plugin structure
            if (!plugin || !plugin.id) {
                console.error('[PluginLoader] Invalid plugin structure - missing id');
                return false;
            }

            // Check if already loaded
            if (this.plugins.has(plugin.id)) {
                console.warn(`[PluginLoader] Plugin "${plugin.id}" already loaded`);
                return false;
            }

            // Register plugin
            this.plugins.set(plugin.id, {
                ...plugin,
                loaded: true,
                loadTime: Date.now()
            });

            // Register features if provided
            if (plugin.features && Array.isArray(plugin.features)) {
                for (const feature of plugin.features) {
                    // Mark feature as plugin-provided
                    feature.category = 'plugin';
                    feature.pluginId = plugin.id;

                    FeatureRegistry.register(feature);
                    this.pluginFeatures.set(feature.id, plugin.id);
                }
            }

            // Register apps if provided (if AppRegistry is available)
            if (plugin.apps && Array.isArray(plugin.apps)) {
                // Import AppRegistry dynamically to avoid circular dependencies
                const { default: AppRegistry } = await import('../apps/AppRegistry.js');
                for (const app of plugin.apps) {
                    app.pluginId = plugin.id;
                    AppRegistry.register(app);
                    this.pluginApps.set(app.id, plugin.id);
                }
            }

            // Call plugin's onLoad hook if provided
            if (typeof plugin.onLoad === 'function') {
                try {
                    await plugin.onLoad();
                } catch (error) {
                    console.error(`[PluginLoader] Error in plugin ${plugin.id} onLoad:`, error);
                }
            }

            console.log(`[PluginLoader] Loaded plugin: ${plugin.name || plugin.id} v${plugin.version || '1.0.0'}`);

            // Emit event
            EventBus.emit('plugin:loaded', {
                pluginId: plugin.id,
                name: plugin.name,
                version: plugin.version
            });

            return true;
        } catch (error) {
            console.error('[PluginLoader] Failed to load plugin:', error);
            return false;
        }
    }

    /**
     * Load a plugin from a path (dynamic import)
     * @param {string} pluginPath - Path to plugin module
     * @returns {boolean} Success status
     */
    async loadPluginFromPath(pluginPath) {
        try {
            const pluginModule = await import(pluginPath);
            return await this.loadPlugin(pluginModule);
        } catch (error) {
            console.error(`[PluginLoader] Failed to load plugin from ${pluginPath}:`, error);
            return false;
        }
    }

    /**
     * Load all plugins from the manifest
     */
    async loadAllPlugins() {
        console.log('[PluginLoader] Loading plugins...');

        // Get plugin manifest from storage
        const manifest = this.getPluginManifest();

        if (!manifest || !manifest.plugins || manifest.plugins.length === 0) {
            console.log('[PluginLoader] No plugins configured');
            return;
        }

        // Load each plugin
        for (const pluginConfig of manifest.plugins) {
            if (pluginConfig.enabled !== false) {
                await this.loadPluginFromPath(pluginConfig.path);
            }
        }

        this.initialized = true;
        console.log(`[PluginLoader] Loaded ${this.plugins.size} plugins`);

        EventBus.emit('plugins:loaded', { count: this.plugins.size });
    }

    /**
     * Unload a plugin
     * @param {string} pluginId - Plugin ID
     * @returns {boolean} Success status
     */
    async unloadPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            console.warn(`[PluginLoader] Plugin "${pluginId}" not found`);
            return false;
        }

        try {
            // Disable all features from this plugin
            for (const [featureId, pid] of this.pluginFeatures) {
                if (pid === pluginId) {
                    await FeatureRegistry.disable(featureId);
                    this.pluginFeatures.delete(featureId);
                }
            }

            // Call plugin's onUnload hook if provided
            if (typeof plugin.onUnload === 'function') {
                try {
                    await plugin.onUnload();
                } catch (error) {
                    console.error(`[PluginLoader] Error in plugin ${pluginId} onUnload:`, error);
                }
            }

            this.plugins.delete(pluginId);

            console.log(`[PluginLoader] Unloaded plugin: ${pluginId}`);

            EventBus.emit('plugin:unloaded', { id: pluginId });

            return true;
        } catch (error) {
            console.error(`[PluginLoader] Failed to unload plugin ${pluginId}:`, error);
            return false;
        }
    }

    /**
     * Get plugin manifest from storage
     * @returns {Object} Plugin manifest
     */
    getPluginManifest() {
        return StorageManager.get('plugin_manifest') || { plugins: [] };
    }

    /**
     * Save plugin manifest to storage
     * @param {Object} manifest - Plugin manifest
     */
    savePluginManifest(manifest) {
        StorageManager.set('plugin_manifest', manifest);
    }

    /**
     * Add a plugin to the manifest
     * @param {Object} pluginConfig - Plugin configuration { path, enabled }
     */
    addToManifest(pluginConfig) {
        const manifest = this.getPluginManifest();

        // Check if already exists
        const existing = manifest.plugins.find(p => p.path === pluginConfig.path);
        if (existing) {
            Object.assign(existing, pluginConfig);
        } else {
            manifest.plugins.push(pluginConfig);
        }

        this.savePluginManifest(manifest);
    }

    /**
     * Remove a plugin from the manifest
     * @param {string} pluginPath - Path to remove
     */
    removeFromManifest(pluginPath) {
        const manifest = this.getPluginManifest();
        manifest.plugins = manifest.plugins.filter(p => p.path !== pluginPath);
        this.savePluginManifest(manifest);
    }

    /**
     * Get all loaded plugins
     * @returns {Array} Array of plugin objects
     */
    getAll() {
        return Array.from(this.plugins.values());
    }

    /**
     * Get a specific plugin
     * @param {string} pluginId - Plugin ID
     * @returns {Object|undefined} Plugin object
     */
    get(pluginId) {
        return this.plugins.get(pluginId);
    }

    /**
     * Check if a plugin is loaded
     * @param {string} pluginId - Plugin ID
     * @returns {boolean}
     */
    isLoaded(pluginId) {
        return this.plugins.has(pluginId);
    }

    /**
     * Get features provided by a plugin
     * @param {string} pluginId - Plugin ID
     * @returns {string[]} Array of feature IDs
     */
    getPluginFeatures(pluginId) {
        const features = [];
        for (const [featureId, pid] of this.pluginFeatures) {
            if (pid === pluginId) {
                features.push(featureId);
            }
        }
        return features;
    }

    /**
     * Get the plugin that provides a feature
     * @param {string} featureId - Feature ID
     * @returns {string|undefined} Plugin ID
     */
    getFeaturePlugin(featureId) {
        return this.pluginFeatures.get(featureId);
    }

    /**
     * Get debug info about plugins
     * @returns {Object}
     */
    getDebugInfo() {
        return {
            initialized: this.initialized,
            pluginCount: this.plugins.size,
            plugins: Array.from(this.plugins.entries()).map(([id, plugin]) => ({
                id,
                name: plugin.name,
                version: plugin.version,
                author: plugin.author,
                features: this.getPluginFeatures(id)
            }))
        };
    }

    /**
     * Log plugin status to console
     */
    logStatus() {
        console.group('[PluginLoader] Status');
        console.log('Total plugins:', this.plugins.size);

        for (const [id, plugin] of this.plugins) {
            console.log(`  ${plugin.name || id} v${plugin.version || '1.0.0'} by ${plugin.author || 'Unknown'}`);
            const features = this.getPluginFeatures(id);
            if (features.length > 0) {
                console.log(`    Features: ${features.join(', ')}`);
            }
        }

        console.groupEnd();
    }
}

// Singleton instance
const PluginLoader = new PluginLoaderClass();

export default PluginLoader;
