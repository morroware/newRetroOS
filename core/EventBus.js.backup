/**
 * EventBus - Central event messaging system
 * Enables decoupled communication between all OS components
 * 
 * Usage:
 *   EventBus.on('window:open', handler)
 *   EventBus.emit('window:open', { id: 'notepad' })
 *   EventBus.off('window:open', handler)
 */

class EventBusClass {
    constructor() {
        // Map of event names to arrays of listener functions
        this.listeners = new Map();
        // Debug mode logs all events
        this.debug = false;
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name (e.g., 'window:open')
     * @param {Function} callback - Handler function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
        // Return unsubscribe function for easy cleanup
        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event only once
     * @param {string} event - Event name
     * @param {Function} callback - Handler function
     */
    once(event, callback) {
        const wrapper = (data) => {
            this.off(event, wrapper);
            callback(data);
        };
        this.on(event, wrapper);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Handler to remove
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Emit an event to all subscribers
     * @param {string} event - Event name
     * @param {*} data - Data to pass to handlers
     */
    emit(event, data = null) {
        if (this.debug) {
            console.log(`[EventBus] ${event}`, data);
        }

        if (!this.listeners.has(event)) return;
        
        // Copy array to prevent issues if handler modifies listeners
        const callbacks = [...this.listeners.get(event)];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[EventBus] Error in handler for "${event}":`, error);
            }
        });
    }

    /**
     * Remove all listeners for an event (or all events)
     * @param {string} [event] - Optional event name
     */
    clear(event = null) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Get count of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Listener count
     */
    listenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).length : 0;
    }
}

// Singleton instance - all modules share this
const EventBus = new EventBusClass();

// Common event names (for documentation/autocomplete)
export const Events = {
    // Window events
    WINDOW_OPEN: 'window:open',
    WINDOW_CLOSE: 'window:close',
    WINDOW_FOCUS: 'window:focus',
    WINDOW_MINIMIZE: 'window:minimize',
    WINDOW_MAXIMIZE: 'window:maximize',
    WINDOW_RESTORE: 'window:restore',
    WINDOW_RESIZE: 'window:resize',

    // Taskbar events
    TASKBAR_UPDATE: 'taskbar:update',
    
    // Icon events
    ICON_CLICK: 'icon:click',
    ICON_DBLCLICK: 'icon:dblclick',
    ICON_MOVE: 'icon:move',
    ICON_DELETE: 'icon:delete',
    
    // App events
    APP_LAUNCH: 'app:launch',
    APP_OPEN: 'app:open',
    APP_CLOSE: 'app:close',
    
    // Menu events
    START_MENU_TOGGLE: 'startmenu:toggle',
    CONTEXT_MENU_SHOW: 'contextmenu:show',
    CONTEXT_MENU_HIDE: 'contextmenu:hide',
    
    // System events
    BOOT_COMPLETE: 'boot:complete',
    SHUTDOWN: 'shutdown',
    SCREENSAVER_START: 'screensaver:start',
    SCREENSAVER_END: 'screensaver:end',
    
    // Achievement events
    ACHIEVEMENT_UNLOCK: 'achievement:unlock',
    
    // Sound events
    SOUND_PLAY: 'sound:play',
    VOLUME_CHANGE: 'sound:volume',

    // Audio playback events (for MP3/media files)
    AUDIO_PLAY: 'audio:play',
    AUDIO_STOP: 'audio:stop',
    AUDIO_STOP_ALL: 'audio:stopall',
    AUDIO_PAUSE: 'audio:pause',
    AUDIO_RESUME: 'audio:resume',
    AUDIO_ENDED: 'audio:ended',
    AUDIO_ERROR: 'audio:error',
    AUDIO_LOADED: 'audio:loaded',
    AUDIO_TIME_UPDATE: 'audio:timeupdate',
    
    // State events
    STATE_CHANGE: 'state:change',
    
    // Drag events
    DRAG_START: 'drag:start',
    DRAG_MOVE: 'drag:move',
    DRAG_END: 'drag:end',
    
    // Menu action events
    MENU_ACTION: 'menu:action',
    
    // App registration
    APP_REGISTERED: 'app:registered',
    
    // Pet events
    PET_TOGGLE: 'pet:toggle',
    PET_CHANGE: 'pet:change',
    
    // Setting events
    SETTING_CHANGED: 'setting:changed'
};

export { EventBus };
export default EventBus;
