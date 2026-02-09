/**
 * EventBus - Central event messaging system
 * NOW POWERED BY: SemanticEventBus with validation, middleware, and enhanced features!
 *
 * This file provides backward compatibility - all existing code continues to work
 * while gaining the benefits of semantic events, validation, and better debugging.
 *
 * Usage (all still work):
 *   EventBus.on('window:open', handler)
 *   EventBus.emit('window:open', { id: 'notepad' })
 *   EventBus.off('window:open', handler)
 *
 * New features:
 *   EventBus.on('window:*', handler)  // Wildcard subscriptions
 *   EventBus.use(middleware)          // Add middleware
 *   EventBus.getEventLog()            // View event history
 *   EventBus.getEventSchema('window:open')  // Get event documentation
 */

import SemanticEventBus, { Priority as EventPriority } from './SemanticEventBus.js';

// Re-export SemanticEventBus as EventBus for backward compatibility
// All existing code will now use the enhanced semantic event bus!
const EventBus = SemanticEventBus;

// Export priority levels for convenience
export const Priority = EventPriority;

// Legacy event constants - mapped to new semantic events for compatibility
// Old code using these constants will automatically use new event names
export const Events = {
    // Window events
    WINDOW_OPEN: 'window:open',
    WINDOW_CLOSE: 'window:close',
    WINDOW_FOCUS: 'window:focus',
    WINDOW_MINIMIZE: 'window:minimize',
    WINDOW_MAXIMIZE: 'window:maximize',
    WINDOW_RESTORE: 'window:restore',
    WINDOW_RESIZE: 'window:resize',
    WINDOW_SNAP: 'window:snap',
    WINDOW_SHAKE: 'window:shake',

    // Taskbar events
    TASKBAR_UPDATE: 'ui:taskbar:update',

    // Icon events
    ICON_CLICK: 'icon:click',
    ICON_DBLCLICK: 'icon:dblclick',
    ICON_MOVE: 'icon:move',
    ICON_DELETE: 'icon:delete',

    // App events
    APP_LAUNCH: 'app:launch',
    APP_OPEN: 'app:open',
    APP_CLOSE: 'app:close',
    APP_REGISTERED: 'app:registered',
    APP_READY: 'app:ready',
    APP_FOCUS: 'app:focus',
    APP_BLUR: 'app:blur',
    APP_ERROR: 'app:error',
    APP_STATE_CHANGE: 'app:state:change',
    APP_BUSY: 'app:busy',
    APP_IDLE: 'app:idle',
    APP_MESSAGE: 'app:message',
    APP_BROADCAST: 'app:broadcast',

    // Menu events
    START_MENU_TOGGLE: 'ui:menu:start:toggle',
    START_MENU_CLOSE: 'ui:menu:start:close',
    CONTEXT_MENU_SHOW: 'ui:menu:context:show',
    CONTEXT_MENU_HIDE: 'ui:menu:context:hide',
    MENU_ACTION: 'ui:menu:action',

    // System events (note: boot:complete now maps to system:ready)
    BOOT_COMPLETE: 'system:ready',
    SYSTEM_READY: 'system:ready',
    SHUTDOWN: 'system:shutdown',
    SCREENSAVER_START: 'system:screensaver:start',
    SCREENSAVER_END: 'system:screensaver:end',
    SYSTEM_ERROR: 'system:error',
    SYSTEM_ONLINE: 'system:online',
    SYSTEM_OFFLINE: 'system:offline',
    SYSTEM_FULLSCREEN_ENTER: 'system:fullscreen:enter',
    SYSTEM_FULLSCREEN_EXIT: 'system:fullscreen:exit',
    SYSTEM_MEMORY_WARNING: 'system:memory:warning',
    SYSTEM_STORAGE_WARNING: 'system:storage:warning',

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

    // Video playback events (for VideoPlayer app)
    VIDEO_PLAY: 'videoplayer:play',
    VIDEO_PAUSE: 'videoplayer:pause',
    VIDEO_STOP: 'videoplayer:stop',
    VIDEO_ENDED: 'videoplayer:ended',
    VIDEO_LOADED: 'videoplayer:loaded',
    VIDEO_ERROR: 'videoplayer:error',
    VIDEO_SEEK: 'videoplayer:seek',
    VIDEO_TIME_UPDATE: 'videoplayer:timeupdate',
    VIDEO_FULLSCREEN: 'videoplayer:fullscreen',
    VIDEO_PLAYING: 'videoplayer:playing',
    VIDEO_PLAYLIST_ADD: 'videoplayer:playlist:add',
    VIDEO_PLAYLIST_ENDED: 'videoplayer:playlist:ended',

    // State events
    STATE_CHANGE: 'state:change',

    // Drag events
    DRAG_START: 'drag:start',
    DRAG_MOVE: 'drag:move',
    DRAG_END: 'drag:end',

    // Pet events
    PET_TOGGLE: 'feature:pet:toggle',
    PET_CHANGE: 'feature:pet:change',

    // Setting events
    SETTING_CHANGED: 'setting:changed',

    // Desktop events
    DESKTOP_RENDER: 'desktop:render',
    DESKTOP_REFRESH: 'desktop:refresh',
    DESKTOP_ARRANGE: 'desktop:arrange',
    DESKTOP_BG_CHANGE: 'desktop:bg-change',
    DESKTOP_SETTINGS_CHANGE: 'desktop:settings-change',

    // Screensaver events (settings/control)
    SCREENSAVER_START: 'screensaver:start',
    SCREENSAVER_UPDATE_DELAY: 'screensaver:update-delay',
    SCREENSAVER_UPDATE_TYPE: 'screensaver:update-type',

    // Dialog events
    DIALOG_ALERT: 'dialog:alert',
    DIALOG_ALERT_RESPONSE: 'dialog:alert:response',
    DIALOG_CONFIRM: 'dialog:confirm',
    DIALOG_CONFIRM_RESPONSE: 'dialog:confirm:response',
    DIALOG_PROMPT: 'dialog:prompt',
    DIALOG_PROMPT_RESPONSE: 'dialog:prompt:response',
    DIALOG_FILE_OPEN: 'dialog:file-open',
    DIALOG_FILE_OPEN_RESPONSE: 'dialog:file-open:response',
    DIALOG_FILE_SAVE: 'dialog:file-save',
    DIALOG_FILE_SAVE_RESPONSE: 'dialog:file-save:response',

    // Filesystem events
    FILESYSTEM_CHANGED: 'filesystem:changed',
    FS_FILE_CREATE: 'fs:file:create',
    FS_FILE_UPDATE: 'fs:file:update',
    FS_FILE_DELETE: 'fs:file:delete',
    FS_FILE_RENAME: 'fs:file:rename',
    FS_FILE_COPY: 'fs:file:copy',
    FS_DIRECTORY_CREATE: 'fs:directory:create',

    // Recycle bin events
    RECYCLEBIN_UPDATE: 'recyclebin:update',
    RECYCLEBIN_RECYCLE_FILE: 'recyclebin:recycle-file',
    RECYCLEBIN_RESTORE: 'recyclebin:restore',
    RECYCLEBIN_EMPTY: 'recyclebin:empty',

    // Notification events
    NOTIFICATION_SHOW: 'notification:show',
    NOTIFICATION_DISMISS: 'notification:dismiss',

    // Clipboard events
    CLIPBOARD_COPY: 'clipboard:copy',
    CLIPBOARD_PASTE: 'clipboard:paste',

    // Keyboard events
    KEYBOARD_SHORTCUT: 'keyboard:shortcut',

    // Script/automation events
    SCRIPT_EXECUTE: 'script:execute',
    SCRIPT_COMPLETE: 'script:complete',
    SCRIPT_ERROR: 'script:error',

    // Channel events
    CHANNEL_MESSAGE: 'channel:message',
    CHANNEL_SUBSCRIBE: 'channel:subscribe',
    CHANNEL_UNSUBSCRIBE: 'channel:unsubscribe',

    // Feature lifecycle events
    FEATURE_INITIALIZE: 'feature:initialize',
    FEATURE_READY: 'feature:ready',
    FEATURE_ENABLE: 'feature:enable',
    FEATURE_DISABLE: 'feature:disable',
    FEATURE_ENABLED: 'feature:enabled',
    FEATURE_DISABLED: 'feature:disabled',
    FEATURE_ERROR: 'feature:error',
    FEATURE_REGISTERED: 'feature:registered',
    FEATURE_CONFIG_CHANGE: 'feature:config:change',
    FEATURE_CONFIG_CHANGED: 'feature:config-changed',
    FEATURE_CONFIG_RESET: 'feature:config-reset',
    FEATURES_INITIALIZED: 'features:initialized',

    // Terminal events
    TERMINAL_COMMAND: 'terminal:command',
    TERMINAL_OUTPUT: 'terminal:output',
    TERMINAL_ERROR: 'terminal:error',
    TERMINAL_MATRIX: 'terminal:matrix',

    // BSOD events
    BSOD_SHOW: 'bsod:show'
};

// Also register legacy event names that might be used directly as strings
// This ensures backward compatibility for code using old event names
const LEGACY_EVENT_MAPPING = {
    'startmenu:toggle': 'ui:menu:start:toggle',
    'contextmenu:show': 'ui:menu:context:show',
    'contextmenu:hide': 'ui:menu:context:hide',
    'taskbar:update': 'ui:taskbar:update',
    'menu:action': 'ui:menu:action',
    'boot:complete': 'system:ready',
    // Screensaver events - keep these separate (system vs user-config)
    'screensaver:end': 'system:screensaver:end',
    // Pet events - map short form to full semantic form
    'pet:toggle': 'feature:pet:toggle',
    'pet:change': 'feature:pet:change',
    // Settings events
    'setting:changed': 'setting:changed',
    'desktop:render': 'desktop:render'
};

// Wrap emit to automatically map legacy event names
const originalEmit = EventBus.emit.bind(EventBus);
EventBus.emit = function(eventName, payload, options) {
    // Map legacy event names to new semantic ones
    const mappedEventName = LEGACY_EVENT_MAPPING[eventName] || eventName;
    return originalEmit(mappedEventName, payload, options);
};

// Wrap on to automatically map legacy event names
const originalOn = EventBus.on.bind(EventBus);
EventBus.on = function(eventName, callback) {
    // Map legacy event names to new semantic ones
    const mappedEventName = LEGACY_EVENT_MAPPING[eventName] || eventName;
    return originalOn(mappedEventName, callback);
};

// Wrap once to automatically map legacy event names
const originalOnce = EventBus.once.bind(EventBus);
EventBus.once = function(eventName, callback) {
    // Map legacy event names to new semantic ones
    const mappedEventName = LEGACY_EVENT_MAPPING[eventName] || eventName;
    return originalOnce(mappedEventName, callback);
};

// Wrap off to automatically map legacy event names
const originalOff = EventBus.off.bind(EventBus);
EventBus.off = function(eventName, callback) {
    // Map legacy event names to new semantic ones
    const mappedEventName = LEGACY_EVENT_MAPPING[eventName] || eventName;
    return originalOff(mappedEventName, callback);
};

export { EventBus };
export default EventBus;
