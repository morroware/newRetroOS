/**
 * EventSchema - Semantic event definitions with validation
 * Provides type safety, documentation, and validation for all system events
 *
 * Each event has:
 * - namespace: Event category (window, app, system, ui, etc.)
 * - action: What the event does
 * - description: Human-readable description
 * - payload: Expected payload schema (field: type, '?' suffix = optional)
 * - example: Example payload for documentation
 */

export const EventSchema = {
    // ==========================================
    // WINDOW EVENTS
    // ==========================================
    'window:create': {
        namespace: 'window',
        action: 'create',
        description: 'Triggered when a new window is being created',
        payload: {
            id: 'string',
            title: 'string',
            appId: 'string',
            width: 'number',
            height: 'number',
            x: 'number?',
            y: 'number?',
            resizable: 'boolean?',
            minimizable: 'boolean?',
            maximizable: 'boolean?'
        },
        example: {
            id: 'window-notepad-1',
            title: 'Notepad',
            appId: 'notepad',
            width: 500,
            height: 400,
            resizable: true
        }
    },

    'window:open': {
        namespace: 'window',
        action: 'open',
        description: 'Triggered after window is opened and rendered in DOM',
        payload: {
            id: 'string',
            appId: 'string?',
            element: 'HTMLElement?'
        },
        example: {
            id: 'window-notepad-1',
            appId: 'notepad'
        }
    },

    'window:close': {
        namespace: 'window',
        action: 'close',
        description: 'Triggered when window is closing',
        payload: {
            id: 'string',
            appId: 'string?'
        },
        example: {
            id: 'window-notepad-1',
            appId: 'notepad'
        }
    },

    'window:focus': {
        namespace: 'window',
        action: 'focus',
        description: 'Triggered when window receives focus',
        payload: {
            id: 'string',
            previousId: 'string?'
        },
        example: {
            id: 'window-calculator-1',
            previousId: 'window-notepad-1'
        }
    },

    'window:minimize': {
        namespace: 'window',
        action: 'minimize',
        description: 'Triggered when window is minimized',
        payload: {
            id: 'string'
        },
        example: {
            id: 'window-notepad-1'
        }
    },

    'window:maximize': {
        namespace: 'window',
        action: 'maximize',
        description: 'Triggered when window is maximized',
        payload: {
            id: 'string'
        },
        example: {
            id: 'window-notepad-1'
        }
    },

    'window:restore': {
        namespace: 'window',
        action: 'restore',
        description: 'Triggered when window is restored from minimized/maximized',
        payload: {
            id: 'string'
        },
        example: {
            id: 'window-notepad-1'
        }
    },

    'window:resize': {
        namespace: 'window',
        action: 'resize',
        description: 'Triggered when window is resized',
        payload: {
            id: 'string',
            width: 'number',
            height: 'number'
        },
        example: {
            id: 'window-notepad-1',
            width: 600,
            height: 500
        }
    },

    // ==========================================
    // APP EVENTS
    // ==========================================
    'app:launch': {
        namespace: 'app',
        action: 'launch',
        description: 'Request to launch an application',
        payload: {
            appId: 'string',
            params: 'object?'
        },
        example: {
            appId: 'notepad',
            params: { file: 'readme.txt' }
        }
    },

    'app:open': {
        namespace: 'app',
        action: 'open',
        description: 'Triggered when app successfully opens',
        payload: {
            appId: 'string',
            windowId: 'string',
            instance: 'number?'
        },
        example: {
            appId: 'notepad',
            windowId: 'window-notepad-1',
            instance: 0
        }
    },

    'app:close': {
        namespace: 'app',
        action: 'close',
        description: 'Triggered when app closes',
        payload: {
            appId: 'string',
            windowId: 'string'
        },
        example: {
            appId: 'notepad',
            windowId: 'window-notepad-1'
        }
    },

    'app:launched': {
        namespace: 'app',
        action: 'launched',
        description: 'Triggered after app launch completes (from scripting/automation)',
        payload: {
            appId: 'string',
            windowId: 'string?',
            success: 'boolean?'
        },
        example: {
            appId: 'calculator',
            windowId: 'window-calculator-1',
            success: true
        }
    },

    'app:registered': {
        namespace: 'app',
        action: 'registered',
        description: 'Triggered when app is registered in AppRegistry',
        payload: {
            appId: 'string',
            name: 'string',
            category: 'string?'
        },
        example: {
            appId: 'notepad',
            name: 'Notepad',
            category: 'accessories'
        }
    },

    // ==========================================
    // SYSTEM EVENTS
    // ==========================================
    'system:boot': {
        namespace: 'system',
        action: 'boot',
        description: 'System boot sequence started',
        payload: {
            timestamp: 'number',
            phase: 'string?'
        },
        example: {
            timestamp: 1234567890,
            phase: 'initialization'
        }
    },

    'system:ready': {
        namespace: 'system',
        action: 'ready',
        description: 'System fully initialized and ready (formerly boot:complete)',
        payload: {
            timestamp: 'number',
            bootTime: 'number?'
        },
        example: {
            timestamp: 1234567890,
            bootTime: 2500
        }
    },

    'system:shutdown': {
        namespace: 'system',
        action: 'shutdown',
        description: 'System shutdown initiated',
        payload: {
            reason: 'string?'
        },
        example: {
            reason: 'user_requested'
        }
    },

    'system:screensaver:start': {
        namespace: 'system',
        action: 'screensaver:start',
        description: 'Screensaver activated',
        payload: {
            mode: 'string?'
        },
        example: {
            mode: 'flying-toasters'
        }
    },

    'system:screensaver:end': {
        namespace: 'system',
        action: 'screensaver:end',
        description: 'Screensaver deactivated',
        payload: {},
        example: {}
    },

    // ==========================================
    // SCREENSAVER EVENTS (Settings & Control)
    // ==========================================
    'screensaver:start': {
        namespace: 'screensaver',
        action: 'start',
        description: 'Request to start screensaver (from settings)',
        payload: {},
        example: {}
    },

    'screensaver:update-delay': {
        namespace: 'screensaver',
        action: 'update-delay',
        description: 'Screensaver delay/timeout changed',
        payload: {
            delay: 'number'
        },
        example: {
            delay: 300000
        }
    },

    'screensaver:update-type': {
        namespace: 'screensaver',
        action: 'update-type',
        description: 'Screensaver type/mode changed',
        payload: {
            type: 'string'
        },
        example: {
            type: 'flying-toasters'
        }
    },

    // ==========================================
    // UI EVENTS
    // ==========================================
    'ui:menu:start:open': {
        namespace: 'ui',
        action: 'menu:start:open',
        description: 'Start menu opened',
        payload: {},
        example: {}
    },

    'ui:menu:start:close': {
        namespace: 'ui',
        action: 'menu:start:close',
        description: 'Start menu closed',
        payload: {},
        example: {}
    },

    'ui:menu:start:toggle': {
        namespace: 'ui',
        action: 'menu:start:toggle',
        description: 'Start menu toggled',
        payload: {},
        example: {}
    },

    'ui:menu:context:show': {
        namespace: 'ui',
        action: 'menu:context:show',
        description: 'Context menu shown - type determines which menu to display',
        payload: {
            x: 'number',
            y: 'number',
            type: 'string',         // Menu type: 'desktop', 'icon', 'taskbar', 'explorer-file', etc.
            icon: 'object?',        // Icon data for icon context menus
            windowId: 'string?',    // Window ID for taskbar context menus
            item: 'object?',        // Item data for explorer context menus
            currentPath: 'array?'   // Current path for explorer context menus
        },
        example: {
            x: 100,
            y: 200,
            type: 'icon',
            icon: { id: 'notepad', type: 'app', label: 'Notepad' }
        }
    },

    'ui:menu:context:hide': {
        namespace: 'ui',
        action: 'menu:context:hide',
        description: 'Context menu hidden',
        payload: {},
        example: {}
    },

    'ui:menu:action': {
        namespace: 'ui',
        action: 'menu:action',
        description: 'Menu action triggered',
        payload: {
            action: 'string',
            data: 'any?'
        },
        example: {
            action: 'open',
            data: { fileId: 'readme.txt' }
        }
    },

    'ui:taskbar:update': {
        namespace: 'ui',
        action: 'taskbar:update',
        description: 'Taskbar needs to update',
        payload: {},
        example: {}
    },

    // ==========================================
    // ICON EVENTS
    // ==========================================
    'icon:click': {
        namespace: 'icon',
        action: 'click',
        description: 'Icon clicked (single click)',
        payload: {
            iconId: 'string',
            appId: 'string?'
        },
        example: {
            iconId: 'notepad-icon',
            appId: 'notepad'
        }
    },

    'icon:dblclick': {
        namespace: 'icon',
        action: 'dblclick',
        description: 'Icon double-clicked',
        payload: {
            iconId: 'string',
            appId: 'string?'
        },
        example: {
            iconId: 'notepad-icon',
            appId: 'notepad'
        }
    },

    'icon:move': {
        namespace: 'icon',
        action: 'move',
        description: 'Icon moved on desktop',
        payload: {
            iconId: 'string',
            x: 'number',
            y: 'number'
        },
        example: {
            iconId: 'notepad-icon',
            x: 100,
            y: 150
        }
    },

    'icon:delete': {
        namespace: 'icon',
        action: 'delete',
        description: 'Icon deleted',
        payload: {
            iconId: 'string'
        },
        example: {
            iconId: 'notepad-icon'
        }
    },

    // ==========================================
    // STATE EVENTS
    // ==========================================
    'state:change': {
        namespace: 'state',
        action: 'change',
        description: 'State value changed',
        payload: {
            path: 'string',
            value: 'any',
            oldValue: 'any?'
        },
        example: {
            path: 'settings.sound',
            value: true,
            oldValue: false
        }
    },

    // ==========================================
    // SOUND EVENTS
    // ==========================================
    'sound:play': {
        namespace: 'sound',
        action: 'play',
        description: 'Play a system sound',
        payload: {
            type: 'string',
            volume: 'number?'
        },
        example: {
            type: 'open',
            volume: 0.5
        }
    },

    'sound:volume': {
        namespace: 'sound',
        action: 'volume',
        description: 'Volume changed',
        payload: {
            volume: 'number'
        },
        example: {
            volume: 0.7
        }
    },

    // ==========================================
    // AUDIO PLAYBACK EVENTS (Media files)
    // ==========================================
    'audio:play': {
        namespace: 'audio',
        action: 'play',
        description: 'Start audio playback',
        payload: {
            url: 'string',
            title: 'string?'
        },
        example: {
            url: '/music/song.mp3',
            title: 'My Favorite Song'
        }
    },

    'audio:pause': {
        namespace: 'audio',
        action: 'pause',
        description: 'Pause audio playback',
        payload: {},
        example: {}
    },

    'audio:resume': {
        namespace: 'audio',
        action: 'resume',
        description: 'Resume audio playback',
        payload: {},
        example: {}
    },

    'audio:stop': {
        namespace: 'audio',
        action: 'stop',
        description: 'Stop audio playback',
        payload: {},
        example: {}
    },

    'audio:stopall': {
        namespace: 'audio',
        action: 'stopall',
        description: 'Stop all audio playback',
        payload: {},
        example: {}
    },

    'audio:ended': {
        namespace: 'audio',
        action: 'ended',
        description: 'Audio playback ended',
        payload: {
            url: 'string?'
        },
        example: {
            url: '/music/song.mp3'
        }
    },

    'audio:error': {
        namespace: 'audio',
        action: 'error',
        description: 'Audio playback error',
        payload: {
            error: 'string',
            url: 'string?'
        },
        example: {
            error: 'Failed to load audio',
            url: '/music/song.mp3'
        }
    },

    'audio:loaded': {
        namespace: 'audio',
        action: 'loaded',
        description: 'Audio file loaded',
        payload: {
            url: 'string',
            duration: 'number?'
        },
        example: {
            url: '/music/song.mp3',
            duration: 180
        }
    },

    'audio:timeupdate': {
        namespace: 'audio',
        action: 'timeupdate',
        description: 'Audio playback time updated',
        payload: {
            currentTime: 'number',
            duration: 'number'
        },
        example: {
            currentTime: 45,
            duration: 180
        }
    },

    // ==========================================
    // FEATURE EVENTS
    // ==========================================
    'feature:enable': {
        namespace: 'feature',
        action: 'enable',
        description: 'Feature enabled',
        payload: {
            featureId: 'string'
        },
        example: {
            featureId: 'clippy'
        }
    },

    'feature:disable': {
        namespace: 'feature',
        action: 'disable',
        description: 'Feature disabled',
        payload: {
            featureId: 'string'
        },
        example: {
            featureId: 'clippy'
        }
    },

    'feature:pet:toggle': {
        namespace: 'feature',
        action: 'pet:toggle',
        description: 'Desktop pet toggled',
        payload: {},
        example: {}
    },

    'feature:pet:change': {
        namespace: 'feature',
        action: 'pet:change',
        description: 'Desktop pet changed',
        payload: {
            petType: 'string'
        },
        example: {
            petType: 'cat'
        }
    },

    // ==========================================
    // ACHIEVEMENT EVENTS
    // ==========================================
    'achievement:unlock': {
        namespace: 'achievement',
        action: 'unlock',
        description: 'Achievement unlocked',
        payload: {
            achievementId: 'string',
            title: 'string',
            description: 'string?'
        },
        example: {
            achievementId: 'first_app',
            title: 'First Steps',
            description: 'Opened your first app'
        }
    },

    // ==========================================
    // FILESYSTEM EVENTS
    // ==========================================
    'fs:file:create': {
        namespace: 'fs',
        action: 'file:create',
        description: 'File created in virtual filesystem',
        payload: {
            path: 'string',
            type: 'string',
            content: 'any?'
        },
        example: {
            path: '/documents/readme.txt',
            type: 'file',
            content: 'Hello world'
        }
    },

    'fs:file:update': {
        namespace: 'fs',
        action: 'file:update',
        description: 'File updated',
        payload: {
            path: 'string',
            content: 'any'
        },
        example: {
            path: '/documents/readme.txt',
            content: 'Updated content'
        }
    },

    'fs:file:delete': {
        namespace: 'fs',
        action: 'file:delete',
        description: 'File deleted',
        payload: {
            path: 'string'
        },
        example: {
            path: '/documents/readme.txt'
        }
    },

    'fs:directory:create': {
        namespace: 'fs',
        action: 'directory:create',
        description: 'Directory created',
        payload: {
            path: 'string'
        },
        example: {
            path: '/documents/projects'
        }
    },

    // ==========================================
    // DRAG & DROP EVENTS
    // ==========================================
    'drag:start': {
        namespace: 'drag',
        action: 'start',
        description: 'Drag operation started',
        payload: {
            itemId: 'string',
            itemType: 'string',
            x: 'number',
            y: 'number'
        },
        example: {
            itemId: 'notepad-icon',
            itemType: 'icon',
            x: 100,
            y: 100
        }
    },

    'drag:move': {
        namespace: 'drag',
        action: 'move',
        description: 'Item being dragged',
        payload: {
            itemId: 'string',
            x: 'number',
            y: 'number'
        },
        example: {
            itemId: 'notepad-icon',
            x: 150,
            y: 125
        }
    },

    'drag:end': {
        namespace: 'drag',
        action: 'end',
        description: 'Drag operation ended',
        payload: {
            itemId: 'string',
            x: 'number',
            y: 'number',
            target: 'string?'
        },
        example: {
            itemId: 'notepad-icon',
            x: 200,
            y: 150,
            target: 'desktop'
        }
    },

    // ==========================================
    // SETTING EVENTS
    // ==========================================
    'setting:changed': {
        namespace: 'setting',
        action: 'changed',
        description: 'Setting value changed',
        payload: {
            key: 'string',
            value: 'any',
            oldValue: 'any?'
        },
        example: {
            key: 'sound',
            value: true,
            oldValue: false
        }
    },

    // ==========================================
    // DESKTOP EVENTS
    // ==========================================
    'desktop:render': {
        namespace: 'desktop',
        action: 'render',
        description: 'Desktop needs to re-render',
        payload: {},
        example: {}
    },

    'desktop:refresh': {
        namespace: 'desktop',
        action: 'refresh',
        description: 'Desktop refresh requested',
        payload: {},
        example: {}
    },

    'desktop:arrange': {
        namespace: 'desktop',
        action: 'arrange',
        description: 'Arrange desktop icons',
        payload: {
            mode: 'string?'
        },
        example: {
            mode: 'auto'
        }
    },

    'desktop:bg-change': {
        namespace: 'desktop',
        action: 'bg-change',
        description: 'Desktop background changed',
        payload: {
            color: 'string?',
            wallpaper: 'string?'
        },
        example: {
            color: '#008080',
            wallpaper: 'clouds.jpg'
        }
    },

    'desktop:settings-change': {
        namespace: 'desktop',
        action: 'settings-change',
        description: 'Desktop settings changed',
        payload: {
            bgColor: 'string?',
            wallpaper: 'string?',
            iconSize: 'number?',
            textColor: 'string?'
        },
        example: {
            bgColor: '#008080',
            wallpaper: 'clouds.jpg',
            iconSize: 32
        }
    },

    // ==========================================
    // DIALOG EVENTS
    // ==========================================
    'dialog:alert': {
        namespace: 'dialog',
        action: 'alert',
        description: 'Show an alert dialog',
        payload: {
            message: 'string',
            title: 'string?',
            icon: 'string?',
            requestId: 'string?'
        },
        example: {
            message: 'File saved successfully',
            title: 'Success',
            icon: '✅'
        }
    },

    'dialog:alert:response': {
        namespace: 'dialog',
        action: 'alert:response',
        description: 'Response when alert dialog is dismissed',
        payload: {
            requestId: 'string',
            acknowledged: 'boolean?'
        },
        example: {
            requestId: 'alert-123',
            acknowledged: true
        }
    },

    'dialog:confirm': {
        namespace: 'dialog',
        action: 'confirm',
        description: 'Show a confirmation dialog',
        payload: {
            message: 'string',
            title: 'string?',
            confirmText: 'string?',
            cancelText: 'string?',
            requestId: 'string?'
        },
        example: {
            message: 'Are you sure you want to delete this file?',
            title: 'Confirm Delete',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        }
    },

    'dialog:confirm:response': {
        namespace: 'dialog',
        action: 'confirm:response',
        description: 'Response from a confirmation dialog',
        payload: {
            requestId: 'string',
            confirmed: 'boolean'
        },
        example: {
            requestId: 'confirm-123',
            confirmed: true
        }
    },

    'dialog:prompt': {
        namespace: 'dialog',
        action: 'prompt',
        description: 'Show an input prompt dialog',
        payload: {
            message: 'string',
            title: 'string?',
            defaultValue: 'string?',
            placeholder: 'string?',
            requestId: 'string?'
        },
        example: {
            message: 'Enter file name:',
            title: 'New File',
            defaultValue: 'untitled.txt'
        }
    },

    'dialog:prompt:response': {
        namespace: 'dialog',
        action: 'prompt:response',
        description: 'Response from a prompt dialog',
        payload: {
            requestId: 'string',
            value: 'string?',
            cancelled: 'boolean'
        },
        example: {
            requestId: 'prompt-123',
            value: 'myfile.txt',
            cancelled: false
        }
    },

    'dialog:file-open': {
        namespace: 'dialog',
        action: 'file-open',
        description: 'Show file open dialog',
        payload: {
            title: 'string?',
            filter: 'string?',
            directory: 'string?',
            requestId: 'string?'
        },
        example: {
            title: 'Open File',
            filter: '.txt,.md',
            directory: '/documents'
        }
    },

    'dialog:file-open:response': {
        namespace: 'dialog',
        action: 'file-open:response',
        description: 'Response from file open dialog',
        payload: {
            requestId: 'string',
            path: 'string?',
            cancelled: 'boolean'
        },
        example: {
            requestId: 'file-open-123',
            path: '/documents/readme.txt',
            cancelled: false
        }
    },

    'dialog:file-save': {
        namespace: 'dialog',
        action: 'file-save',
        description: 'Show file save dialog',
        payload: {
            title: 'string?',
            defaultName: 'string?',
            filter: 'string?',
            directory: 'string?',
            requestId: 'string?'
        },
        example: {
            title: 'Save File',
            defaultName: 'document.txt',
            directory: '/documents'
        }
    },

    'dialog:file-save:response': {
        namespace: 'dialog',
        action: 'file-save:response',
        description: 'Response from file save dialog',
        payload: {
            requestId: 'string',
            path: 'string?',
            cancelled: 'boolean'
        },
        example: {
            requestId: 'file-save-123',
            path: '/documents/document.txt',
            cancelled: false
        }
    },

    // ==========================================
    // FILESYSTEM CHANGE EVENTS (broader than fs:*)
    // ==========================================
    'filesystem:changed': {
        namespace: 'filesystem',
        action: 'changed',
        description: 'General filesystem change notification (triggers UI refresh)',
        payload: {
            path: 'string?',
            type: 'string?'
        },
        example: {
            path: '/documents',
            type: 'file'
        }
    },

    // ==========================================
    // RECYCLE BIN EVENTS
    // ==========================================
    'recyclebin:update': {
        namespace: 'recyclebin',
        action: 'update',
        description: 'Recycle bin contents changed',
        payload: {
            count: 'number?'
        },
        example: {
            count: 5
        }
    },

    'recyclebin:recycle-file': {
        namespace: 'recyclebin',
        action: 'recycle-file',
        description: 'File moved to recycle bin',
        payload: {
            iconId: 'string',
            path: 'string?',
            originalPath: 'string?'
        },
        example: {
            iconId: 'icon-readme',
            path: '/recyclebin/readme.txt',
            originalPath: '/documents/readme.txt'
        }
    },

    'recyclebin:restore': {
        namespace: 'recyclebin',
        action: 'restore',
        description: 'File restored from recycle bin',
        payload: {
            iconId: 'string',
            originalPath: 'string'
        },
        example: {
            iconId: 'icon-readme',
            originalPath: '/documents/readme.txt'
        }
    },

    'recyclebin:empty': {
        namespace: 'recyclebin',
        action: 'empty',
        description: 'Recycle bin emptied',
        payload: {
            count: 'number?'
        },
        example: {
            count: 3
        }
    },

    // ==========================================
    // NOTIFICATION EVENTS
    // ==========================================
    'notification:show': {
        namespace: 'notification',
        action: 'show',
        description: 'Show a notification toast',
        payload: {
            message: 'string',
            title: 'string?',
            type: 'string?',
            duration: 'number?',
            icon: 'string?'
        },
        example: {
            message: 'File saved',
            title: 'Success',
            type: 'success',
            duration: 3000
        }
    },

    'notification:dismiss': {
        namespace: 'notification',
        action: 'dismiss',
        description: 'Dismiss a notification',
        payload: {
            id: 'string?'
        },
        example: {
            id: 'notification-123'
        }
    },

    // ==========================================
    // CLIPBOARD EVENTS
    // ==========================================
    'clipboard:copy': {
        namespace: 'clipboard',
        action: 'copy',
        description: 'Content copied to clipboard',
        payload: {
            content: 'any',
            type: 'string?'
        },
        example: {
            content: 'Hello world',
            type: 'text'
        }
    },

    'clipboard:paste': {
        namespace: 'clipboard',
        action: 'paste',
        description: 'Paste from clipboard requested',
        payload: {
            target: 'string?'
        },
        example: {
            target: 'notepad-1'
        }
    },

    // ==========================================
    // KEYBOARD/INPUT EVENTS
    // ==========================================
    'keyboard:shortcut': {
        namespace: 'keyboard',
        action: 'shortcut',
        description: 'Keyboard shortcut triggered',
        payload: {
            key: 'string',
            ctrl: 'boolean?',
            alt: 'boolean?',
            shift: 'boolean?',
            meta: 'boolean?'
        },
        example: {
            key: 's',
            ctrl: true
        }
    },

    // ==========================================
    // SCRIPT/AUTOMATION EVENTS
    // ==========================================
    'script:execute': {
        namespace: 'script',
        action: 'execute',
        description: 'Execute a script',
        payload: {
            scriptId: 'string',
            params: 'object?',
            requestId: 'string?'
        },
        example: {
            scriptId: 'auto-backup',
            params: { destination: '/backup' }
        }
    },

    'script:complete': {
        namespace: 'script',
        action: 'complete',
        description: 'Script execution completed',
        payload: {
            scriptId: 'string',
            requestId: 'string?',
            result: 'any?',
            error: 'string?'
        },
        example: {
            scriptId: 'auto-backup',
            requestId: 'req-123',
            result: { filesBackedUp: 5 }
        }
    },

    'script:error': {
        namespace: 'script',
        action: 'error',
        description: 'Script execution error',
        payload: {
            scriptId: 'string',
            requestId: 'string?',
            error: 'string',
            line: 'number?'
        },
        example: {
            scriptId: 'auto-backup',
            error: 'Permission denied',
            line: 15
        }
    },

    'script:output': {
        namespace: 'script',
        action: 'output',
        description: 'Script print/log output',
        payload: {
            message: 'string'
        },
        example: {
            message: 'Hello from script!'
        }
    },

    // ==========================================
    // CHANNEL/SCOPE EVENTS (for isolated communication)
    // ==========================================
    'channel:message': {
        namespace: 'channel',
        action: 'message',
        description: 'Message sent to a specific channel',
        payload: {
            channel: 'string',
            message: 'any',
            sender: 'string?'
        },
        example: {
            channel: 'notepad-sync',
            message: { action: 'update', content: 'Hello' },
            sender: 'notepad-1'
        }
    },

    'channel:subscribe': {
        namespace: 'channel',
        action: 'subscribe',
        description: 'Subscription to a channel',
        payload: {
            channel: 'string',
            subscriber: 'string'
        },
        example: {
            channel: 'notepad-sync',
            subscriber: 'notepad-2'
        }
    },

    'channel:unsubscribe': {
        namespace: 'channel',
        action: 'unsubscribe',
        description: 'Unsubscription from a channel',
        payload: {
            channel: 'string',
            subscriber: 'string'
        },
        example: {
            channel: 'notepad-sync',
            subscriber: 'notepad-2'
        }
    },

    // ==========================================
    // COMMAND EVENTS (for scripting - trigger actions)
    // ==========================================
    'command:app:launch': {
        namespace: 'command',
        action: 'app:launch',
        description: 'Command to launch an application',
        payload: {
            appId: 'string',
            params: 'object?',
            requestId: 'string?'
        },
        example: {
            appId: 'notepad',
            params: { filePath: ['C:', 'Users', 'User', 'readme.txt'] }
        }
    },

    'command:app:close': {
        namespace: 'command',
        action: 'app:close',
        description: 'Command to close an application window',
        payload: {
            windowId: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:window:focus': {
        namespace: 'command',
        action: 'window:focus',
        description: 'Command to focus a window',
        payload: {
            windowId: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:window:minimize': {
        namespace: 'command',
        action: 'window:minimize',
        description: 'Command to minimize a window',
        payload: {
            windowId: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:window:maximize': {
        namespace: 'command',
        action: 'window:maximize',
        description: 'Command to maximize a window',
        payload: {
            windowId: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:window:restore': {
        namespace: 'command',
        action: 'window:restore',
        description: 'Command to restore a window from minimized/maximized',
        payload: {
            windowId: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:window:close': {
        namespace: 'command',
        action: 'window:close',
        description: 'Command to close a window',
        payload: {
            windowId: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:fs:read': {
        namespace: 'command',
        action: 'fs:read',
        description: 'Command to read a file',
        payload: {
            path: 'string',
            requestId: 'string?'
        },
        example: {
            path: 'C:/Users/User/readme.txt'
        }
    },

    'command:fs:write': {
        namespace: 'command',
        action: 'fs:write',
        description: 'Command to write to a file',
        payload: {
            path: 'string',
            content: 'string',
            requestId: 'string?'
        },
        example: {
            path: 'C:/Users/User/newfile.txt',
            content: 'Hello world'
        }
    },

    'command:fs:delete': {
        namespace: 'command',
        action: 'fs:delete',
        description: 'Command to delete a file',
        payload: {
            path: 'string',
            requestId: 'string?'
        },
        example: {
            path: 'C:/Users/User/oldfile.txt'
        }
    },

    'command:fs:mkdir': {
        namespace: 'command',
        action: 'fs:mkdir',
        description: 'Command to create a directory',
        payload: {
            path: 'string',
            requestId: 'string?'
        },
        example: {
            path: 'C:/Users/User/NewFolder'
        }
    },

    'command:dialog:show': {
        namespace: 'command',
        action: 'dialog:show',
        description: 'Command to show a dialog',
        payload: {
            type: 'string',
            message: 'string',
            title: 'string?',
            options: 'object?',
            requestId: 'string?'
        },
        example: {
            type: 'alert',
            message: 'Hello from script!',
            title: 'Script Message'
        }
    },

    'command:sound:play': {
        namespace: 'command',
        action: 'sound:play',
        description: 'Command to play a sound',
        payload: {
            type: 'string',
            volume: 'number?',
            requestId: 'string?'
        },
        example: {
            type: 'notify',
            volume: 0.5
        }
    },

    'command:setting:set': {
        namespace: 'command',
        action: 'setting:set',
        description: 'Command to change a setting',
        payload: {
            key: 'string',
            value: 'any',
            requestId: 'string?'
        },
        example: {
            key: 'sound',
            value: true
        }
    },

    'command:desktop:refresh': {
        namespace: 'command',
        action: 'desktop:refresh',
        description: 'Command to refresh the desktop',
        payload: {
            requestId: 'string?'
        },
        example: {}
    },

    'command:notification:show': {
        namespace: 'command',
        action: 'notification:show',
        description: 'Command to show a notification',
        payload: {
            message: 'string',
            title: 'string?',
            type: 'string?',
            duration: 'number?',
            requestId: 'string?'
        },
        example: {
            message: 'Task completed!',
            title: 'Script',
            type: 'success'
        }
    },

    // ==========================================
    // QUERY EVENTS (for scripting - get state)
    // ==========================================
    'query:windows': {
        namespace: 'query',
        action: 'windows',
        description: 'Query for list of open windows',
        payload: {
            requestId: 'string'
        },
        example: {
            requestId: 'query-123'
        }
    },

    'query:windows:response': {
        namespace: 'query',
        action: 'windows:response',
        description: 'Response with list of open windows',
        payload: {
            requestId: 'string',
            windows: 'array'
        },
        example: {
            requestId: 'query-123',
            windows: [{ id: 'notepad-1', title: 'Notepad', appId: 'notepad' }]
        }
    },

    'query:apps': {
        namespace: 'query',
        action: 'apps',
        description: 'Query for list of available apps',
        payload: {
            requestId: 'string'
        },
        example: {
            requestId: 'query-456'
        }
    },

    'query:apps:response': {
        namespace: 'query',
        action: 'apps:response',
        description: 'Response with list of available apps',
        payload: {
            requestId: 'string',
            apps: 'array'
        },
        example: {
            requestId: 'query-456',
            apps: [{ id: 'notepad', name: 'Notepad', category: 'accessories' }]
        }
    },

    'query:fs:list': {
        namespace: 'query',
        action: 'fs:list',
        description: 'Query directory listing',
        payload: {
            path: 'string',
            requestId: 'string'
        },
        example: {
            path: 'C:/Users/User',
            requestId: 'query-789'
        }
    },

    'query:fs:list:response': {
        namespace: 'query',
        action: 'fs:list:response',
        description: 'Response with directory listing',
        payload: {
            requestId: 'string',
            items: 'array',
            path: 'string'
        },
        example: {
            requestId: 'query-789',
            path: 'C:/Users/User',
            items: [{ name: 'Documents', type: 'directory' }]
        }
    },

    'query:fs:read': {
        namespace: 'query',
        action: 'fs:read',
        description: 'Query to read file contents',
        payload: {
            path: 'string',
            requestId: 'string'
        },
        example: {
            path: 'C:/Users/User/readme.txt',
            requestId: 'query-abc'
        }
    },

    'query:fs:read:response': {
        namespace: 'query',
        action: 'fs:read:response',
        description: 'Response with file contents',
        payload: {
            requestId: 'string',
            content: 'string',
            path: 'string',
            error: 'string?'
        },
        example: {
            requestId: 'query-abc',
            path: 'C:/Users/User/readme.txt',
            content: 'File content here'
        }
    },

    'query:fs:exists': {
        namespace: 'query',
        action: 'fs:exists',
        description: 'Query if a path exists',
        payload: {
            path: 'string',
            requestId: 'string'
        },
        example: {
            path: 'C:/Users/User/readme.txt',
            requestId: 'query-def'
        }
    },

    'query:fs:exists:response': {
        namespace: 'query',
        action: 'fs:exists:response',
        description: 'Response with existence check',
        payload: {
            requestId: 'string',
            exists: 'boolean',
            path: 'string',
            type: 'string?'
        },
        example: {
            requestId: 'query-def',
            path: 'C:/Users/User/readme.txt',
            exists: true,
            type: 'file'
        }
    },

    'query:settings': {
        namespace: 'query',
        action: 'settings',
        description: 'Query current settings',
        payload: {
            key: 'string?',
            requestId: 'string'
        },
        example: {
            key: 'sound',
            requestId: 'query-ghi'
        }
    },

    'query:settings:response': {
        namespace: 'query',
        action: 'settings:response',
        description: 'Response with settings values',
        payload: {
            requestId: 'string',
            settings: 'object'
        },
        example: {
            requestId: 'query-ghi',
            settings: { sound: true, crt: false }
        }
    },

    'query:state': {
        namespace: 'query',
        action: 'state',
        description: 'Query system state by path',
        payload: {
            path: 'string',
            requestId: 'string'
        },
        example: {
            path: 'windows',
            requestId: 'query-jkl'
        }
    },

    'query:state:response': {
        namespace: 'query',
        action: 'state:response',
        description: 'Response with state value',
        payload: {
            requestId: 'string',
            path: 'string',
            value: 'any'
        },
        example: {
            requestId: 'query-jkl',
            path: 'windows',
            value: []
        }
    },

    // ==========================================
    // ACTION RESULT EVENTS (for scripting - command responses)
    // ==========================================
    'action:result': {
        namespace: 'action',
        action: 'result',
        description: 'Result of a command action',
        payload: {
            requestId: 'string',
            success: 'boolean',
            data: 'any?',
            error: 'string?'
        },
        example: {
            requestId: 'cmd-123',
            success: true,
            data: { windowId: 'notepad-1' }
        }
    },

    // ==========================================
    // MACRO/AUTOMATION EVENTS
    // ==========================================
    'macro:record:start': {
        namespace: 'macro',
        action: 'record:start',
        description: 'Start recording a macro',
        payload: {
            macroId: 'string?'
        },
        example: {
            macroId: 'my-macro'
        }
    },

    'macro:record:stop': {
        namespace: 'macro',
        action: 'record:stop',
        description: 'Stop recording a macro',
        payload: {},
        example: {}
    },

    'macro:play': {
        namespace: 'macro',
        action: 'play',
        description: 'Play a recorded macro',
        payload: {
            macroId: 'string',
            speed: 'number?'
        },
        example: {
            macroId: 'my-macro',
            speed: 1.0
        }
    },

    'macro:save': {
        namespace: 'macro',
        action: 'save',
        description: 'Save a macro to storage',
        payload: {
            macroId: 'string',
            events: 'array'
        },
        example: {
            macroId: 'my-macro',
            events: []
        }
    },

    // ==========================================
    // APP-SPECIFIC COMMAND EVENTS
    // ==========================================
    'command:notepad:new': {
        namespace: 'command',
        action: 'notepad:new',
        description: 'Command to create a new document in Notepad',
        payload: {
            windowId: 'string?',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:notepad:open': {
        namespace: 'command',
        action: 'notepad:open',
        description: 'Command to open a file in Notepad',
        payload: {
            windowId: 'string?',
            path: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1',
            path: 'C:/Users/User/readme.txt'
        }
    },

    'command:notepad:save': {
        namespace: 'command',
        action: 'notepad:save',
        description: 'Command to save current document in Notepad',
        payload: {
            windowId: 'string?',
            path: 'string?',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1',
            path: 'C:/Users/User/saved.txt'
        }
    },

    'command:notepad:setText': {
        namespace: 'command',
        action: 'notepad:setText',
        description: 'Command to set text content in Notepad',
        payload: {
            windowId: 'string?',
            text: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1',
            text: 'Hello from script!'
        }
    },

    'query:notepad:getText': {
        namespace: 'query',
        action: 'notepad:getText',
        description: 'Query to get current text from Notepad',
        payload: {
            windowId: 'string?',
            requestId: 'string'
        },
        example: {
            windowId: 'notepad-1',
            requestId: 'query-notepad-1'
        }
    },

    'query:notepad:getText:response': {
        namespace: 'query',
        action: 'notepad:getText:response',
        description: 'Response with Notepad text content',
        payload: {
            requestId: 'string',
            text: 'string',
            windowId: 'string'
        },
        example: {
            requestId: 'query-notepad-1',
            windowId: 'notepad-1',
            text: 'Document content'
        }
    },

    'command:calculator:clear': {
        namespace: 'command',
        action: 'calculator:clear',
        description: 'Command to clear Calculator',
        payload: {
            windowId: 'string?',
            requestId: 'string?'
        },
        example: {
            windowId: 'calculator-1'
        }
    },

    'command:calculator:input': {
        namespace: 'command',
        action: 'calculator:input',
        description: 'Command to input value/operator to Calculator',
        payload: {
            windowId: 'string?',
            value: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'calculator-1',
            value: '5'
        }
    },

    'query:calculator:getValue': {
        namespace: 'query',
        action: 'calculator:getValue',
        description: 'Query Calculator display value',
        payload: {
            windowId: 'string?',
            requestId: 'string'
        },
        example: {
            windowId: 'calculator-1',
            requestId: 'query-calc-1'
        }
    },

    'command:terminal:execute': {
        namespace: 'command',
        action: 'terminal:execute',
        description: 'Command to execute a terminal command',
        payload: {
            windowId: 'string?',
            command: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'terminal-1',
            command: 'dir'
        }
    },

    'command:browser:navigate': {
        namespace: 'command',
        action: 'browser:navigate',
        description: 'Command to navigate Browser to URL',
        payload: {
            windowId: 'string?',
            url: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'browser-1',
            url: 'https://example.com'
        }
    },

    // ==========================================
    // TIMER/SCHEDULE EVENTS (for scripting)
    // ==========================================
    'timer:set': {
        namespace: 'timer',
        action: 'set',
        description: 'Set a timer to fire an event',
        payload: {
            timerId: 'string',
            delay: 'number',
            event: 'string',
            payload: 'object?',
            repeat: 'boolean?'
        },
        example: {
            timerId: 'my-timer',
            delay: 5000,
            event: 'custom:timer-fired',
            repeat: false
        }
    },

    'timer:clear': {
        namespace: 'timer',
        action: 'clear',
        description: 'Clear a timer',
        payload: {
            timerId: 'string'
        },
        example: {
            timerId: 'my-timer'
        }
    },

    'timer:fired': {
        namespace: 'timer',
        action: 'fired',
        description: 'Timer has fired',
        payload: {
            timerId: 'string'
        },
        example: {
            timerId: 'my-timer'
        }
    },

    // ==========================================
    // SYSTEM LIFECYCLE EVENTS (Extended)
    // ==========================================
    'system:boot:phase': {
        namespace: 'system',
        action: 'boot:phase',
        description: 'System boot phase changed',
        payload: {
            phase: 'string',
            phaseNumber: 'number',
            totalPhases: 'number',
            phaseName: 'string?'
        },
        example: {
            phase: 'core-systems',
            phaseNumber: 1,
            totalPhases: 5,
            phaseName: 'Initializing Core Systems'
        }
    },

    'system:idle': {
        namespace: 'system',
        action: 'idle',
        description: 'System entered idle state (user inactive)',
        payload: {
            idleTime: 'number',
            threshold: 'number'
        },
        example: {
            idleTime: 60000,
            threshold: 60000
        }
    },

    'system:active': {
        namespace: 'system',
        action: 'active',
        description: 'System returned to active state (user activity detected)',
        payload: {
            idleDuration: 'number'
        },
        example: {
            idleDuration: 120000
        }
    },

    'system:sleep': {
        namespace: 'system',
        action: 'sleep',
        description: 'System entering sleep/screensaver mode',
        payload: {
            reason: 'string?'
        },
        example: {
            reason: 'idle_timeout'
        }
    },

    'system:wake': {
        namespace: 'system',
        action: 'wake',
        description: 'System waking from sleep/screensaver',
        payload: {
            sleepDuration: 'number?'
        },
        example: {
            sleepDuration: 300000
        }
    },

    'system:error': {
        namespace: 'system',
        action: 'error',
        description: 'System-level error occurred',
        payload: {
            error: 'string',
            code: 'string?',
            source: 'string?',
            fatal: 'boolean?',
            stack: 'string?'
        },
        example: {
            error: 'Failed to initialize subsystem',
            code: 'INIT_FAILED',
            source: 'WindowManager',
            fatal: false
        }
    },

    'system:warning': {
        namespace: 'system',
        action: 'warning',
        description: 'System warning issued',
        payload: {
            message: 'string',
            code: 'string?',
            source: 'string?'
        },
        example: {
            message: 'Storage quota approaching limit',
            code: 'STORAGE_WARNING',
            source: 'StorageManager'
        }
    },

    'system:memory:warning': {
        namespace: 'system',
        action: 'memory:warning',
        description: 'Memory usage exceeded threshold',
        payload: {
            usage: 'number',
            limit: 'number',
            percentage: 'number'
        },
        example: {
            usage: 450000000,
            limit: 512000000,
            percentage: 88
        }
    },

    'system:storage:warning': {
        namespace: 'system',
        action: 'storage:warning',
        description: 'Storage space running low',
        payload: {
            used: 'number',
            total: 'number',
            percentage: 'number'
        },
        example: {
            used: 4500000,
            total: 5000000,
            percentage: 90
        }
    },

    'system:storage:full': {
        namespace: 'system',
        action: 'storage:full',
        description: 'Storage is full',
        payload: {
            used: 'number',
            total: 'number'
        },
        example: {
            used: 5000000,
            total: 5000000
        }
    },

    'system:focus': {
        namespace: 'system',
        action: 'focus',
        description: 'Browser/tab gained focus',
        payload: {},
        example: {}
    },

    'system:blur': {
        namespace: 'system',
        action: 'blur',
        description: 'Browser/tab lost focus',
        payload: {},
        example: {}
    },

    'system:visibility:change': {
        namespace: 'system',
        action: 'visibility:change',
        description: 'Page visibility changed',
        payload: {
            visible: 'boolean',
            state: 'string'
        },
        example: {
            visible: true,
            state: 'visible'
        }
    },

    'system:online': {
        namespace: 'system',
        action: 'online',
        description: 'Network connection restored',
        payload: {},
        example: {}
    },

    'system:offline': {
        namespace: 'system',
        action: 'offline',
        description: 'Network connection lost',
        payload: {},
        example: {}
    },

    'system:resize': {
        namespace: 'system',
        action: 'resize',
        description: 'Browser/viewport resized',
        payload: {
            width: 'number',
            height: 'number',
            previousWidth: 'number?',
            previousHeight: 'number?'
        },
        example: {
            width: 1920,
            height: 1080
        }
    },

    'system:fullscreen:enter': {
        namespace: 'system',
        action: 'fullscreen:enter',
        description: 'Entered fullscreen mode',
        payload: {
            element: 'string?'
        },
        example: {
            element: 'desktop'
        }
    },

    'system:fullscreen:exit': {
        namespace: 'system',
        action: 'fullscreen:exit',
        description: 'Exited fullscreen mode',
        payload: {},
        example: {}
    },

    // ==========================================
    // INPUT EVENTS - MOUSE
    // ==========================================
    'mouse:move': {
        namespace: 'mouse',
        action: 'move',
        description: 'Mouse moved',
        payload: {
            x: 'number',
            y: 'number',
            deltaX: 'number?',
            deltaY: 'number?',
            target: 'string?'
        },
        example: {
            x: 500,
            y: 300,
            deltaX: 5,
            deltaY: -2
        }
    },

    'mouse:click': {
        namespace: 'mouse',
        action: 'click',
        description: 'Mouse clicked',
        payload: {
            x: 'number',
            y: 'number',
            button: 'number',
            target: 'string?',
            targetType: 'string?'
        },
        example: {
            x: 500,
            y: 300,
            button: 0,
            target: 'desktop',
            targetType: 'element'
        }
    },

    'mouse:dblclick': {
        namespace: 'mouse',
        action: 'dblclick',
        description: 'Mouse double-clicked',
        payload: {
            x: 'number',
            y: 'number',
            button: 'number',
            target: 'string?'
        },
        example: {
            x: 500,
            y: 300,
            button: 0
        }
    },

    'mouse:down': {
        namespace: 'mouse',
        action: 'down',
        description: 'Mouse button pressed',
        payload: {
            x: 'number',
            y: 'number',
            button: 'number',
            target: 'string?'
        },
        example: {
            x: 500,
            y: 300,
            button: 0
        }
    },

    'mouse:up': {
        namespace: 'mouse',
        action: 'up',
        description: 'Mouse button released',
        payload: {
            x: 'number',
            y: 'number',
            button: 'number',
            target: 'string?'
        },
        example: {
            x: 500,
            y: 300,
            button: 0
        }
    },

    'mouse:contextmenu': {
        namespace: 'mouse',
        action: 'contextmenu',
        description: 'Context menu triggered (right-click)',
        payload: {
            x: 'number',
            y: 'number',
            target: 'string?',
            targetType: 'string?'
        },
        example: {
            x: 500,
            y: 300,
            target: 'desktop-icon-1',
            targetType: 'icon'
        }
    },

    'mouse:scroll': {
        namespace: 'mouse',
        action: 'scroll',
        description: 'Mouse wheel scrolled',
        payload: {
            deltaX: 'number',
            deltaY: 'number',
            deltaZ: 'number?',
            x: 'number',
            y: 'number',
            target: 'string?'
        },
        example: {
            deltaX: 0,
            deltaY: -120,
            x: 500,
            y: 300
        }
    },

    'mouse:enter': {
        namespace: 'mouse',
        action: 'enter',
        description: 'Mouse entered element',
        payload: {
            target: 'string',
            targetType: 'string?',
            x: 'number',
            y: 'number'
        },
        example: {
            target: 'window-notepad-1',
            targetType: 'window',
            x: 100,
            y: 50
        }
    },

    'mouse:leave': {
        namespace: 'mouse',
        action: 'leave',
        description: 'Mouse left element',
        payload: {
            target: 'string',
            targetType: 'string?',
            x: 'number',
            y: 'number'
        },
        example: {
            target: 'window-notepad-1',
            targetType: 'window',
            x: 600,
            y: 50
        }
    },

    // ==========================================
    // INPUT EVENTS - KEYBOARD
    // ==========================================
    'keyboard:keydown': {
        namespace: 'keyboard',
        action: 'keydown',
        description: 'Key pressed down',
        payload: {
            key: 'string',
            code: 'string',
            ctrl: 'boolean',
            alt: 'boolean',
            shift: 'boolean',
            meta: 'boolean',
            repeat: 'boolean',
            target: 'string?'
        },
        example: {
            key: 'a',
            code: 'KeyA',
            ctrl: false,
            alt: false,
            shift: false,
            meta: false,
            repeat: false
        }
    },

    'keyboard:keyup': {
        namespace: 'keyboard',
        action: 'keyup',
        description: 'Key released',
        payload: {
            key: 'string',
            code: 'string',
            ctrl: 'boolean',
            alt: 'boolean',
            shift: 'boolean',
            meta: 'boolean',
            target: 'string?'
        },
        example: {
            key: 'a',
            code: 'KeyA',
            ctrl: false,
            alt: false,
            shift: false,
            meta: false
        }
    },

    'keyboard:input': {
        namespace: 'keyboard',
        action: 'input',
        description: 'Text input received',
        payload: {
            data: 'string',
            inputType: 'string?',
            target: 'string?'
        },
        example: {
            data: 'Hello',
            inputType: 'insertText',
            target: 'notepad-textarea'
        }
    },

    'keyboard:combo': {
        namespace: 'keyboard',
        action: 'combo',
        description: 'Key combination pressed',
        payload: {
            combo: 'string',
            keys: 'array',
            handled: 'boolean?'
        },
        example: {
            combo: 'Ctrl+Shift+S',
            keys: ['Control', 'Shift', 'S'],
            handled: true
        }
    },

    // ==========================================
    // INPUT EVENTS - TOUCH
    // ==========================================
    'touch:start': {
        namespace: 'touch',
        action: 'start',
        description: 'Touch started',
        payload: {
            touches: 'array',
            x: 'number',
            y: 'number',
            target: 'string?'
        },
        example: {
            touches: [{ x: 100, y: 200, id: 0 }],
            x: 100,
            y: 200
        }
    },

    'touch:move': {
        namespace: 'touch',
        action: 'move',
        description: 'Touch moved',
        payload: {
            touches: 'array',
            x: 'number',
            y: 'number',
            deltaX: 'number?',
            deltaY: 'number?',
            target: 'string?'
        },
        example: {
            touches: [{ x: 150, y: 250, id: 0 }],
            x: 150,
            y: 250,
            deltaX: 50,
            deltaY: 50
        }
    },

    'touch:end': {
        namespace: 'touch',
        action: 'end',
        description: 'Touch ended',
        payload: {
            touches: 'array',
            x: 'number',
            y: 'number',
            target: 'string?'
        },
        example: {
            touches: [],
            x: 150,
            y: 250
        }
    },

    'touch:cancel': {
        namespace: 'touch',
        action: 'cancel',
        description: 'Touch cancelled',
        payload: {
            touches: 'array',
            target: 'string?'
        },
        example: {
            touches: []
        }
    },

    // ==========================================
    // GESTURE EVENTS
    // ==========================================
    'gesture:tap': {
        namespace: 'gesture',
        action: 'tap',
        description: 'Tap gesture detected',
        payload: {
            x: 'number',
            y: 'number',
            target: 'string?'
        },
        example: {
            x: 100,
            y: 200
        }
    },

    'gesture:doubletap': {
        namespace: 'gesture',
        action: 'doubletap',
        description: 'Double tap gesture detected',
        payload: {
            x: 'number',
            y: 'number',
            target: 'string?'
        },
        example: {
            x: 100,
            y: 200
        }
    },

    'gesture:longpress': {
        namespace: 'gesture',
        action: 'longpress',
        description: 'Long press gesture detected',
        payload: {
            x: 'number',
            y: 'number',
            duration: 'number',
            target: 'string?'
        },
        example: {
            x: 100,
            y: 200,
            duration: 800
        }
    },

    'gesture:swipe': {
        namespace: 'gesture',
        action: 'swipe',
        description: 'Swipe gesture detected',
        payload: {
            direction: 'string',
            startX: 'number',
            startY: 'number',
            endX: 'number',
            endY: 'number',
            velocity: 'number',
            target: 'string?'
        },
        example: {
            direction: 'left',
            startX: 300,
            startY: 200,
            endX: 100,
            endY: 200,
            velocity: 1.5
        }
    },

    'gesture:pinch': {
        namespace: 'gesture',
        action: 'pinch',
        description: 'Pinch gesture detected',
        payload: {
            scale: 'number',
            centerX: 'number',
            centerY: 'number',
            target: 'string?'
        },
        example: {
            scale: 0.8,
            centerX: 200,
            centerY: 200
        }
    },

    'gesture:rotate': {
        namespace: 'gesture',
        action: 'rotate',
        description: 'Rotation gesture detected',
        payload: {
            angle: 'number',
            centerX: 'number',
            centerY: 'number',
            target: 'string?'
        },
        example: {
            angle: 45,
            centerX: 200,
            centerY: 200
        }
    },

    // ==========================================
    // FILESYSTEM EVENTS (Extended)
    // ==========================================
    'fs:file:read': {
        namespace: 'fs',
        action: 'file:read',
        description: 'File read operation',
        payload: {
            path: 'string',
            size: 'number?'
        },
        example: {
            path: 'C:/Documents/readme.txt',
            size: 1024
        }
    },

    'fs:file:rename': {
        namespace: 'fs',
        action: 'file:rename',
        description: 'File renamed',
        payload: {
            oldPath: 'string',
            newPath: 'string',
            oldName: 'string',
            newName: 'string'
        },
        example: {
            oldPath: 'C:/Documents/old.txt',
            newPath: 'C:/Documents/new.txt',
            oldName: 'old.txt',
            newName: 'new.txt'
        }
    },

    'fs:file:move': {
        namespace: 'fs',
        action: 'file:move',
        description: 'File moved to new location',
        payload: {
            sourcePath: 'string',
            destPath: 'string',
            fileName: 'string'
        },
        example: {
            sourcePath: 'C:/Documents/file.txt',
            destPath: 'C:/Backup/file.txt',
            fileName: 'file.txt'
        }
    },

    'fs:file:copy': {
        namespace: 'fs',
        action: 'file:copy',
        description: 'File copied',
        payload: {
            sourcePath: 'string',
            destPath: 'string',
            fileName: 'string'
        },
        example: {
            sourcePath: 'C:/Documents/file.txt',
            destPath: 'C:/Backup/file.txt',
            fileName: 'file.txt'
        }
    },

    'fs:directory:delete': {
        namespace: 'fs',
        action: 'directory:delete',
        description: 'Directory deleted',
        payload: {
            path: 'string',
            recursive: 'boolean?'
        },
        example: {
            path: 'C:/Documents/OldFolder',
            recursive: true
        }
    },

    'fs:directory:rename': {
        namespace: 'fs',
        action: 'directory:rename',
        description: 'Directory renamed',
        payload: {
            oldPath: 'string',
            newPath: 'string',
            oldName: 'string',
            newName: 'string'
        },
        example: {
            oldPath: 'C:/Documents/OldName',
            newPath: 'C:/Documents/NewName',
            oldName: 'OldName',
            newName: 'NewName'
        }
    },

    'fs:directory:open': {
        namespace: 'fs',
        action: 'directory:open',
        description: 'Directory opened/browsed',
        payload: {
            path: 'string',
            itemCount: 'number?'
        },
        example: {
            path: 'C:/Documents',
            itemCount: 15
        }
    },

    'fs:error': {
        namespace: 'fs',
        action: 'error',
        description: 'Filesystem error occurred',
        payload: {
            operation: 'string',
            path: 'string',
            error: 'string',
            code: 'string?'
        },
        example: {
            operation: 'write',
            path: 'C:/System/protected.txt',
            error: 'Permission denied',
            code: 'EPERM'
        }
    },

    'fs:permission:denied': {
        namespace: 'fs',
        action: 'permission:denied',
        description: 'File operation permission denied',
        payload: {
            operation: 'string',
            path: 'string'
        },
        example: {
            operation: 'delete',
            path: 'C:/Windows/System32/kernel.dll'
        }
    },

    'fs:watch:change': {
        namespace: 'fs',
        action: 'watch:change',
        description: 'Watched path changed',
        payload: {
            path: 'string',
            changeType: 'string',
            fileName: 'string?'
        },
        example: {
            path: 'C:/Documents',
            changeType: 'modified',
            fileName: 'document.txt'
        }
    },

    // ==========================================
    // APP EVENTS (Extended)
    // ==========================================
    'app:focus': {
        namespace: 'app',
        action: 'focus',
        description: 'App window received focus',
        payload: {
            appId: 'string',
            windowId: 'string',
            previousAppId: 'string?'
        },
        example: {
            appId: 'notepad',
            windowId: 'notepad-1',
            previousAppId: 'calculator'
        }
    },

    'app:blur': {
        namespace: 'app',
        action: 'blur',
        description: 'App window lost focus',
        payload: {
            appId: 'string',
            windowId: 'string'
        },
        example: {
            appId: 'notepad',
            windowId: 'notepad-1'
        }
    },

    'app:state:change': {
        namespace: 'app',
        action: 'state:change',
        description: 'App internal state changed',
        payload: {
            appId: 'string',
            windowId: 'string',
            key: 'string',
            value: 'any',
            oldValue: 'any?'
        },
        example: {
            appId: 'notepad',
            windowId: 'notepad-1',
            key: 'modified',
            value: true,
            oldValue: false
        }
    },

    'app:error': {
        namespace: 'app',
        action: 'error',
        description: 'App error occurred',
        payload: {
            appId: 'string',
            windowId: 'string?',
            error: 'string',
            stack: 'string?'
        },
        example: {
            appId: 'browser',
            windowId: 'browser-1',
            error: 'Failed to load page'
        }
    },

    'app:message': {
        namespace: 'app',
        action: 'message',
        description: 'App sent a message to another app',
        payload: {
            fromAppId: 'string',
            toAppId: 'string',
            message: 'any',
            messageType: 'string?'
        },
        example: {
            fromAppId: 'notepad',
            toAppId: 'spellcheck',
            message: { text: 'Hello world' },
            messageType: 'check-spelling'
        }
    },

    'app:broadcast': {
        namespace: 'app',
        action: 'broadcast',
        description: 'App broadcast message to all apps',
        payload: {
            fromAppId: 'string',
            message: 'any',
            messageType: 'string?'
        },
        example: {
            fromAppId: 'settings',
            message: { theme: 'dark' },
            messageType: 'theme-change'
        }
    },

    'app:ready': {
        namespace: 'app',
        action: 'ready',
        description: 'App finished initialization and is ready',
        payload: {
            appId: 'string',
            windowId: 'string'
        },
        example: {
            appId: 'notepad',
            windowId: 'notepad-1'
        }
    },

    'app:busy': {
        namespace: 'app',
        action: 'busy',
        description: 'App is busy processing',
        payload: {
            appId: 'string',
            windowId: 'string',
            task: 'string?'
        },
        example: {
            appId: 'browser',
            windowId: 'browser-1',
            task: 'Loading page'
        }
    },

    'app:idle': {
        namespace: 'app',
        action: 'idle',
        description: 'App finished processing and is idle',
        payload: {
            appId: 'string',
            windowId: 'string'
        },
        example: {
            appId: 'browser',
            windowId: 'browser-1'
        }
    },

    // ==========================================
    // WINDOW EVENTS (Extended)
    // ==========================================
    'window:move': {
        namespace: 'window',
        action: 'move',
        description: 'Window position changed',
        payload: {
            id: 'string',
            x: 'number',
            y: 'number',
            previousX: 'number?',
            previousY: 'number?'
        },
        example: {
            id: 'notepad-1',
            x: 200,
            y: 150
        }
    },

    'window:move:start': {
        namespace: 'window',
        action: 'move:start',
        description: 'Window drag started',
        payload: {
            id: 'string',
            x: 'number',
            y: 'number'
        },
        example: {
            id: 'notepad-1',
            x: 100,
            y: 100
        }
    },

    'window:move:end': {
        namespace: 'window',
        action: 'move:end',
        description: 'Window drag ended',
        payload: {
            id: 'string',
            x: 'number',
            y: 'number'
        },
        example: {
            id: 'notepad-1',
            x: 200,
            y: 150
        }
    },

    'window:resize:start': {
        namespace: 'window',
        action: 'resize:start',
        description: 'Window resize started',
        payload: {
            id: 'string',
            width: 'number',
            height: 'number',
            handle: 'string?'
        },
        example: {
            id: 'notepad-1',
            width: 400,
            height: 300,
            handle: 'se'
        }
    },

    'window:resize:end': {
        namespace: 'window',
        action: 'resize:end',
        description: 'Window resize ended',
        payload: {
            id: 'string',
            width: 'number',
            height: 'number'
        },
        example: {
            id: 'notepad-1',
            width: 600,
            height: 400
        }
    },

    'window:snap': {
        namespace: 'window',
        action: 'snap',
        description: 'Window snapped to edge/position',
        payload: {
            id: 'string',
            snapType: 'string',
            x: 'number',
            y: 'number',
            width: 'number',
            height: 'number'
        },
        example: {
            id: 'notepad-1',
            snapType: 'left-half',
            x: 0,
            y: 0,
            width: 960,
            height: 1080
        }
    },

    'window:titlebar:click': {
        namespace: 'window',
        action: 'titlebar:click',
        description: 'Window titlebar clicked',
        payload: {
            id: 'string',
            button: 'string?'
        },
        example: {
            id: 'notepad-1',
            button: 'minimize'
        }
    },

    'window:shake': {
        namespace: 'window',
        action: 'shake',
        description: 'Window shake animation (e.g., for error feedback)',
        payload: {
            id: 'string',
            reason: 'string?'
        },
        example: {
            id: 'notepad-1',
            reason: 'validation-error'
        }
    },

    'window:flash': {
        namespace: 'window',
        action: 'flash',
        description: 'Window flash/blink for attention',
        payload: {
            id: 'string',
            count: 'number?'
        },
        example: {
            id: 'notepad-1',
            count: 3
        }
    },

    // ==========================================
    // FEATURE/PLUGIN EVENTS (Extended)
    // ==========================================
    'feature:initialize': {
        namespace: 'feature',
        action: 'initialize',
        description: 'Feature is initializing',
        payload: {
            featureId: 'string',
            config: 'object?'
        },
        example: {
            featureId: 'clippy',
            config: { character: 'clippy' }
        }
    },

    'feature:ready': {
        namespace: 'feature',
        action: 'ready',
        description: 'Feature finished initialization',
        payload: {
            featureId: 'string'
        },
        example: {
            featureId: 'clippy'
        }
    },

    'feature:error': {
        namespace: 'feature',
        action: 'error',
        description: 'Feature error occurred',
        payload: {
            featureId: 'string',
            error: 'string',
            fatal: 'boolean?'
        },
        example: {
            featureId: 'clippy',
            error: 'Failed to load animation',
            fatal: false
        }
    },

    'feature:config:change': {
        namespace: 'feature',
        action: 'config:change',
        description: 'Feature configuration changed (command)',
        payload: {
            featureId: 'string',
            key: 'string',
            value: 'any',
            oldValue: 'any?'
        },
        example: {
            featureId: 'pet',
            key: 'type',
            value: 'cat',
            oldValue: 'dog'
        }
    },

    'feature:config-changed': {
        namespace: 'feature',
        action: 'config-changed',
        description: 'Feature configuration was changed (notification)',
        payload: {
            featureId: 'string',
            key: 'string',
            value: 'any'
        },
        example: {
            featureId: 'pet',
            key: 'type',
            value: 'cat'
        }
    },

    'feature:config-reset': {
        namespace: 'feature',
        action: 'config-reset',
        description: 'Feature configuration was reset to defaults',
        payload: {
            featureId: 'string'
        },
        example: {
            featureId: 'pet'
        }
    },

    'feature:enabled': {
        namespace: 'feature',
        action: 'enabled',
        description: 'Feature was enabled (notification)',
        payload: {
            featureId: 'string'
        },
        example: {
            featureId: 'clippy'
        }
    },

    'feature:disabled': {
        namespace: 'feature',
        action: 'disabled',
        description: 'Feature was disabled (notification)',
        payload: {
            featureId: 'string'
        },
        example: {
            featureId: 'clippy'
        }
    },

    'feature:registered': {
        namespace: 'feature',
        action: 'registered',
        description: 'Feature registered with the system',
        payload: {
            featureId: 'string',
            name: 'string?',
            category: 'string?'
        },
        example: {
            featureId: 'clippy',
            name: 'Clippy Assistant',
            category: 'enhancement'
        }
    },

    'features:initialized': {
        namespace: 'features',
        action: 'initialized',
        description: 'All features have been initialized',
        payload: {
            count: 'number?',
            features: 'array?'
        },
        example: {
            count: 7,
            features: ['soundsystem', 'achievements', 'clippy']
        }
    },

    'plugin:load': {
        namespace: 'plugin',
        action: 'load',
        description: 'Plugin loading started',
        payload: {
            pluginId: 'string',
            path: 'string?'
        },
        example: {
            pluginId: 'dvd-bouncer',
            path: '/plugins/dvd-bouncer'
        }
    },

    'plugin:loaded': {
        namespace: 'plugin',
        action: 'loaded',
        description: 'Plugin loaded successfully',
        payload: {
            pluginId: 'string',
            name: 'string',
            version: 'string?'
        },
        example: {
            pluginId: 'dvd-bouncer',
            name: 'DVD Bouncer Screensaver',
            version: '1.0.0'
        }
    },

    'plugin:error': {
        namespace: 'plugin',
        action: 'error',
        description: 'Plugin loading/execution error',
        payload: {
            pluginId: 'string',
            error: 'string'
        },
        example: {
            pluginId: 'dvd-bouncer',
            error: 'Failed to initialize'
        }
    },

    'plugin:unload': {
        namespace: 'plugin',
        action: 'unload',
        description: 'Plugin unloaded',
        payload: {
            pluginId: 'string'
        },
        example: {
            pluginId: 'dvd-bouncer'
        }
    },

    'plugins:loaded': {
        namespace: 'plugins',
        action: 'loaded',
        description: 'All plugins have been loaded',
        payload: {
            count: 'number?',
            plugins: 'array?'
        },
        example: {
            count: 1,
            plugins: ['dvd-bouncer']
        }
    },

    // ==========================================
    // DVD BOUNCER EVENTS
    // ==========================================
    'dvd-bouncer:started': {
        namespace: 'dvd-bouncer',
        action: 'started',
        description: 'DVD bouncer screensaver started',
        payload: {
            timestamp: 'number'
        },
        example: {
            timestamp: 1704456000000
        }
    },

    'dvd-bouncer:stopped': {
        namespace: 'dvd-bouncer',
        action: 'stopped',
        description: 'DVD bouncer screensaver stopped',
        payload: {
            cornerHits: 'number',
            timestamp: 'number'
        },
        example: {
            cornerHits: 3,
            timestamp: 1704456300000
        }
    },

    // ==========================================
    // PERFORMANCE EVENTS
    // ==========================================
    'perf:fps': {
        namespace: 'perf',
        action: 'fps',
        description: 'FPS update',
        payload: {
            fps: 'number',
            frameTime: 'number?'
        },
        example: {
            fps: 60,
            frameTime: 16.67
        }
    },

    'perf:fps:low': {
        namespace: 'perf',
        action: 'fps:low',
        description: 'FPS dropped below threshold',
        payload: {
            fps: 'number',
            threshold: 'number'
        },
        example: {
            fps: 15,
            threshold: 30
        }
    },

    'perf:memory': {
        namespace: 'perf',
        action: 'memory',
        description: 'Memory usage update',
        payload: {
            usedJSHeapSize: 'number',
            totalJSHeapSize: 'number',
            jsHeapSizeLimit: 'number?'
        },
        example: {
            usedJSHeapSize: 50000000,
            totalJSHeapSize: 100000000,
            jsHeapSizeLimit: 2000000000
        }
    },

    'perf:longtask': {
        namespace: 'perf',
        action: 'longtask',
        description: 'Long task detected (blocking main thread)',
        payload: {
            duration: 'number',
            startTime: 'number',
            source: 'string?'
        },
        example: {
            duration: 150,
            startTime: 1234567890,
            source: 'script-execution'
        }
    },

    'perf:measure': {
        namespace: 'perf',
        action: 'measure',
        description: 'Performance measurement recorded',
        payload: {
            name: 'string',
            duration: 'number',
            startMark: 'string?',
            endMark: 'string?'
        },
        example: {
            name: 'app-launch-notepad',
            duration: 45,
            startMark: 'launch-start',
            endMark: 'launch-end'
        }
    },

    // ==========================================
    // DEBUG EVENTS
    // ==========================================
    'debug:log': {
        namespace: 'debug',
        action: 'log',
        description: 'Debug log message',
        payload: {
            level: 'string',
            message: 'string',
            source: 'string?',
            data: 'any?'
        },
        example: {
            level: 'info',
            message: 'App initialized',
            source: 'notepad'
        }
    },

    'debug:breakpoint': {
        namespace: 'debug',
        action: 'breakpoint',
        description: 'Script breakpoint hit',
        payload: {
            scriptId: 'string',
            line: 'number',
            variables: 'object?'
        },
        example: {
            scriptId: 'my-script',
            line: 15,
            variables: { x: 5, y: 10 }
        }
    },

    'debug:step': {
        namespace: 'debug',
        action: 'step',
        description: 'Script debug step',
        payload: {
            scriptId: 'string',
            line: 'number',
            statement: 'string?'
        },
        example: {
            scriptId: 'my-script',
            line: 16,
            statement: 'set $x = 10'
        }
    },

    'debug:variable:change': {
        namespace: 'debug',
        action: 'variable:change',
        description: 'Script variable changed (debug mode)',
        payload: {
            scriptId: 'string',
            name: 'string',
            value: 'any',
            oldValue: 'any?'
        },
        example: {
            scriptId: 'my-script',
            name: '$counter',
            value: 5,
            oldValue: 4
        }
    },

    // ==========================================
    // UI FEEDBACK EVENTS
    // ==========================================
    'feedback:toast': {
        namespace: 'feedback',
        action: 'toast',
        description: 'Show toast notification',
        payload: {
            message: 'string',
            type: 'string?',
            duration: 'number?',
            position: 'string?'
        },
        example: {
            message: 'File saved!',
            type: 'success',
            duration: 3000,
            position: 'bottom-right'
        }
    },

    'feedback:flash': {
        namespace: 'feedback',
        action: 'flash',
        description: 'Flash screen effect',
        payload: {
            color: 'string?',
            duration: 'number?'
        },
        example: {
            color: 'white',
            duration: 100
        }
    },

    'feedback:shake': {
        namespace: 'feedback',
        action: 'shake',
        description: 'Shake effect',
        payload: {
            target: 'string?',
            intensity: 'number?'
        },
        example: {
            target: 'window-notepad-1',
            intensity: 5
        }
    },

    'feedback:vibrate': {
        namespace: 'feedback',
        action: 'vibrate',
        description: 'Vibration feedback (mobile)',
        payload: {
            pattern: 'array?',
            duration: 'number?'
        },
        example: {
            pattern: [100, 50, 100],
            duration: 200
        }
    },

    'feedback:progress:start': {
        namespace: 'feedback',
        action: 'progress:start',
        description: 'Progress indicator started',
        payload: {
            id: 'string',
            message: 'string?',
            total: 'number?'
        },
        example: {
            id: 'file-copy',
            message: 'Copying files...',
            total: 100
        }
    },

    'feedback:progress:update': {
        namespace: 'feedback',
        action: 'progress:update',
        description: 'Progress indicator updated',
        payload: {
            id: 'string',
            current: 'number',
            total: 'number?',
            message: 'string?'
        },
        example: {
            id: 'file-copy',
            current: 50,
            total: 100,
            message: 'Copying file 50 of 100...'
        }
    },

    'feedback:progress:end': {
        namespace: 'feedback',
        action: 'progress:end',
        description: 'Progress indicator ended',
        payload: {
            id: 'string',
            success: 'boolean?',
            message: 'string?'
        },
        example: {
            id: 'file-copy',
            success: true,
            message: 'Copy complete!'
        }
    },

    // ==========================================
    // ANIMATION EVENTS
    // ==========================================
    'animation:start': {
        namespace: 'animation',
        action: 'start',
        description: 'Animation started',
        payload: {
            id: 'string',
            target: 'string',
            name: 'string',
            duration: 'number?'
        },
        example: {
            id: 'anim-1',
            target: 'window-notepad-1',
            name: 'fadeIn',
            duration: 300
        }
    },

    'animation:end': {
        namespace: 'animation',
        action: 'end',
        description: 'Animation ended',
        payload: {
            id: 'string',
            target: 'string',
            name: 'string'
        },
        example: {
            id: 'anim-1',
            target: 'window-notepad-1',
            name: 'fadeIn'
        }
    },

    'animation:cancel': {
        namespace: 'animation',
        action: 'cancel',
        description: 'Animation cancelled',
        payload: {
            id: 'string',
            target: 'string',
            name: 'string'
        },
        example: {
            id: 'anim-1',
            target: 'window-notepad-1',
            name: 'fadeIn'
        }
    },

    // ==========================================
    // THEME EVENTS
    // ==========================================
    'theme:change': {
        namespace: 'theme',
        action: 'change',
        description: 'Theme changed',
        payload: {
            theme: 'string',
            previousTheme: 'string?'
        },
        example: {
            theme: 'dark',
            previousTheme: 'light'
        }
    },

    'theme:color:change': {
        namespace: 'theme',
        action: 'color:change',
        description: 'Theme color changed',
        payload: {
            property: 'string',
            value: 'string',
            oldValue: 'string?'
        },
        example: {
            property: '--accent-color',
            value: '#0078d4',
            oldValue: '#0066cc'
        }
    },

    // ==========================================
    // ACCESSIBILITY EVENTS
    // ==========================================
    'a11y:announce': {
        namespace: 'a11y',
        action: 'announce',
        description: 'Screen reader announcement',
        payload: {
            message: 'string',
            priority: 'string?'
        },
        example: {
            message: 'File saved successfully',
            priority: 'polite'
        }
    },

    'a11y:focus:change': {
        namespace: 'a11y',
        action: 'focus:change',
        description: 'Focus changed for accessibility',
        payload: {
            target: 'string',
            label: 'string?'
        },
        example: {
            target: 'save-button',
            label: 'Save File'
        }
    },

    'a11y:mode:change': {
        namespace: 'a11y',
        action: 'mode:change',
        description: 'Accessibility mode changed',
        payload: {
            mode: 'string',
            enabled: 'boolean'
        },
        example: {
            mode: 'high-contrast',
            enabled: true
        }
    },

    // ==========================================
    // HISTORY/UNDO EVENTS
    // ==========================================
    'history:push': {
        namespace: 'history',
        action: 'push',
        description: 'Action pushed to history stack',
        payload: {
            actionType: 'string',
            data: 'any',
            description: 'string?'
        },
        example: {
            actionType: 'text:insert',
            data: { text: 'Hello', position: 0 },
            description: 'Insert text'
        }
    },

    'history:undo': {
        namespace: 'history',
        action: 'undo',
        description: 'Undo action performed',
        payload: {
            actionType: 'string',
            data: 'any'
        },
        example: {
            actionType: 'text:insert',
            data: { text: 'Hello', position: 0 }
        }
    },

    'history:redo': {
        namespace: 'history',
        action: 'redo',
        description: 'Redo action performed',
        payload: {
            actionType: 'string',
            data: 'any'
        },
        example: {
            actionType: 'text:insert',
            data: { text: 'Hello', position: 0 }
        }
    },

    'history:clear': {
        namespace: 'history',
        action: 'clear',
        description: 'History stack cleared',
        payload: {
            scope: 'string?'
        },
        example: {
            scope: 'notepad-1'
        }
    },

    // ==========================================
    // SELECTION EVENTS
    // ==========================================
    'selection:change': {
        namespace: 'selection',
        action: 'change',
        description: 'Selection changed',
        payload: {
            items: 'array',
            source: 'string?',
            selectionType: 'string?'
        },
        example: {
            items: ['icon-1', 'icon-2'],
            source: 'desktop',
            selectionType: 'multi'
        }
    },

    'selection:clear': {
        namespace: 'selection',
        action: 'clear',
        description: 'Selection cleared',
        payload: {
            source: 'string?'
        },
        example: {
            source: 'desktop'
        }
    },

    'selection:all': {
        namespace: 'selection',
        action: 'all',
        description: 'Select all triggered',
        payload: {
            source: 'string',
            count: 'number?'
        },
        example: {
            source: 'desktop',
            count: 10
        }
    },

    // ==========================================
    // SEARCH EVENTS
    // ==========================================
    'search:query': {
        namespace: 'search',
        action: 'query',
        description: 'Search query submitted',
        payload: {
            query: 'string',
            scope: 'string?',
            filters: 'object?'
        },
        example: {
            query: 'readme',
            scope: 'files',
            filters: { type: 'txt' }
        }
    },

    'search:results': {
        namespace: 'search',
        action: 'results',
        description: 'Search results received',
        payload: {
            query: 'string',
            results: 'array',
            count: 'number',
            duration: 'number?'
        },
        example: {
            query: 'readme',
            results: [{ name: 'readme.txt', path: 'C:/Documents/readme.txt' }],
            count: 1,
            duration: 15
        }
    },

    'search:clear': {
        namespace: 'search',
        action: 'clear',
        description: 'Search cleared',
        payload: {},
        example: {}
    },

    // ==========================================
    // NETWORK EVENTS
    // ==========================================
    'network:request': {
        namespace: 'network',
        action: 'request',
        description: 'Network request initiated',
        payload: {
            id: 'string',
            url: 'string',
            method: 'string',
            headers: 'object?'
        },
        example: {
            id: 'req-1',
            url: 'https://api.example.com/data',
            method: 'GET'
        }
    },

    'network:response': {
        namespace: 'network',
        action: 'response',
        description: 'Network response received',
        payload: {
            id: 'string',
            url: 'string',
            status: 'number',
            duration: 'number',
            size: 'number?'
        },
        example: {
            id: 'req-1',
            url: 'https://api.example.com/data',
            status: 200,
            duration: 150,
            size: 1024
        }
    },

    'network:error': {
        namespace: 'network',
        action: 'error',
        description: 'Network request failed',
        payload: {
            id: 'string',
            url: 'string',
            error: 'string',
            status: 'number?'
        },
        example: {
            id: 'req-1',
            url: 'https://api.example.com/data',
            error: 'Connection refused'
        }
    },

    // ==========================================
    // GAME/ACHIEVEMENT EVENTS (Extended)
    // ==========================================
    'achievement:progress': {
        namespace: 'achievement',
        action: 'progress',
        description: 'Achievement progress updated',
        payload: {
            achievementId: 'string',
            current: 'number',
            target: 'number',
            percentage: 'number?'
        },
        example: {
            achievementId: 'files_created',
            current: 5,
            target: 10,
            percentage: 50
        }
    },

    'achievement:check': {
        namespace: 'achievement',
        action: 'check',
        description: 'Achievement condition check triggered',
        payload: {
            achievementId: 'string',
            condition: 'string?'
        },
        example: {
            achievementId: 'first_app',
            condition: 'app_launched'
        }
    },

    // ==========================================
    // SCRIPT EVENTS (Extended)
    // ==========================================
    'script:start': {
        namespace: 'script',
        action: 'start',
        description: 'Script execution starting',
        payload: {
            scriptId: 'string',
            source: 'string?',
            params: 'object?'
        },
        example: {
            scriptId: 'startup-script',
            source: 'file',
            params: {}
        }
    },

    'script:statement': {
        namespace: 'script',
        action: 'statement',
        description: 'Script statement executed',
        payload: {
            scriptId: 'string',
            line: 'number',
            statement: 'string',
            result: 'any?'
        },
        example: {
            scriptId: 'my-script',
            line: 5,
            statement: 'launch notepad',
            result: { windowId: 'notepad-1' }
        }
    },

    'script:variable:set': {
        namespace: 'script',
        action: 'variable:set',
        description: 'Script variable set',
        payload: {
            scriptId: 'string',
            name: 'string',
            value: 'any',
            type: 'string?'
        },
        example: {
            scriptId: 'my-script',
            name: '$counter',
            value: 10,
            type: 'number'
        }
    },

    'script:function:call': {
        namespace: 'script',
        action: 'function:call',
        description: 'Script function called',
        payload: {
            scriptId: 'string',
            functionName: 'string',
            args: 'array?',
            result: 'any?'
        },
        example: {
            scriptId: 'my-script',
            functionName: 'add',
            args: [5, 3],
            result: 8
        }
    },

    'script:event:subscribe': {
        namespace: 'script',
        action: 'event:subscribe',
        description: 'Script subscribed to event',
        payload: {
            scriptId: 'string',
            eventName: 'string'
        },
        example: {
            scriptId: 'my-script',
            eventName: 'window:open'
        }
    },

    'script:event:emit': {
        namespace: 'script',
        action: 'event:emit',
        description: 'Script emitted event',
        payload: {
            scriptId: 'string',
            eventName: 'string',
            payload: 'object?'
        },
        example: {
            scriptId: 'my-script',
            eventName: 'custom:my-event',
            payload: { data: 'test' }
        }
    },

    // ==========================================
    // USER EVENTS
    // ==========================================
    'user:action': {
        namespace: 'user',
        action: 'action',
        description: 'Generic user action for analytics',
        payload: {
            actionType: 'string',
            target: 'string?',
            data: 'any?'
        },
        example: {
            actionType: 'button_click',
            target: 'save-button',
            data: { appId: 'notepad' }
        }
    },

    'user:preference:change': {
        namespace: 'user',
        action: 'preference:change',
        description: 'User preference changed',
        payload: {
            key: 'string',
            value: 'any',
            oldValue: 'any?'
        },
        example: {
            key: 'theme',
            value: 'dark',
            oldValue: 'light'
        }
    },

    // ==========================================
    // SESSION EVENTS
    // ==========================================
    'session:start': {
        namespace: 'session',
        action: 'start',
        description: 'Session started',
        payload: {
            sessionId: 'string',
            timestamp: 'number'
        },
        example: {
            sessionId: 'sess-12345',
            timestamp: 1234567890
        }
    },

    'session:end': {
        namespace: 'session',
        action: 'end',
        description: 'Session ended',
        payload: {
            sessionId: 'string',
            duration: 'number',
            reason: 'string?'
        },
        example: {
            sessionId: 'sess-12345',
            duration: 3600000,
            reason: 'user_closed'
        }
    },

    'session:activity': {
        namespace: 'session',
        action: 'activity',
        description: 'Session activity recorded',
        payload: {
            sessionId: 'string',
            activity: 'string',
            timestamp: 'number'
        },
        example: {
            sessionId: 'sess-12345',
            activity: 'app_launch',
            timestamp: 1234567890
        }
    },

    // ==========================================
    // GAME EVENTS - Generic
    // ==========================================
    'game:start': {
        namespace: 'game',
        action: 'start',
        description: 'Game started',
        payload: {
            appId: 'string',
            difficulty: 'string?',
            settings: 'object?'
        },
        example: {
            appId: 'minesweeper',
            difficulty: 'beginner',
            settings: { rows: 9, cols: 9, mines: 10 }
        }
    },

    'game:pause': {
        namespace: 'game',
        action: 'pause',
        description: 'Game paused',
        payload: {
            appId: 'string',
            time: 'number?',
            score: 'number?'
        },
        example: {
            appId: 'snake',
            time: 45,
            score: 120
        }
    },

    'game:resume': {
        namespace: 'game',
        action: 'resume',
        description: 'Game resumed',
        payload: {
            appId: 'string'
        },
        example: {
            appId: 'snake'
        }
    },

    'game:over': {
        namespace: 'game',
        action: 'over',
        description: 'Game ended',
        payload: {
            appId: 'string',
            won: 'boolean',
            score: 'number?',
            time: 'number?',
            stats: 'object?'
        },
        example: {
            appId: 'minesweeper',
            won: true,
            score: 100,
            time: 45
        }
    },

    'game:score': {
        namespace: 'game',
        action: 'score',
        description: 'Score changed',
        payload: {
            appId: 'string',
            score: 'number',
            delta: 'number?',
            reason: 'string?'
        },
        example: {
            appId: 'asteroids',
            score: 1500,
            delta: 100,
            reason: 'asteroid_destroyed'
        }
    },

    'game:highscore': {
        namespace: 'game',
        action: 'highscore',
        description: 'New high score achieved',
        payload: {
            appId: 'string',
            score: 'number',
            previousScore: 'number?'
        },
        example: {
            appId: 'snake',
            score: 500,
            previousScore: 350
        }
    },

    'game:level': {
        namespace: 'game',
        action: 'level',
        description: 'Level changed',
        payload: {
            appId: 'string',
            level: 'number',
            previousLevel: 'number?'
        },
        example: {
            appId: 'asteroids',
            level: 5,
            previousLevel: 4
        }
    },

    'game:lives': {
        namespace: 'game',
        action: 'lives',
        description: 'Lives changed',
        payload: {
            appId: 'string',
            lives: 'number',
            delta: 'number?'
        },
        example: {
            appId: 'asteroids',
            lives: 2,
            delta: -1
        }
    },

    'game:state': {
        namespace: 'game',
        action: 'state',
        description: 'Game state changed',
        payload: {
            appId: 'string',
            state: 'string',
            previousState: 'string?',
            data: 'object?'
        },
        example: {
            appId: 'skifree',
            state: 'playing',
            previousState: 'menu'
        }
    },

    // ==========================================
    // MINESWEEPER EVENTS
    // ==========================================
    'minesweeper:cell:reveal': {
        namespace: 'minesweeper',
        action: 'cell:reveal',
        description: 'Cell revealed',
        payload: {
            row: 'number',
            col: 'number',
            value: 'number',
            isMine: 'boolean'
        },
        example: { row: 3, col: 5, value: 2, isMine: false }
    },

    'minesweeper:cell:flag': {
        namespace: 'minesweeper',
        action: 'cell:flag',
        description: 'Cell flagged or unflagged',
        payload: {
            row: 'number',
            col: 'number',
            flagged: 'boolean',
            minesRemaining: 'number'
        },
        example: { row: 2, col: 4, flagged: true, minesRemaining: 8 }
    },

    'minesweeper:mine:hit': {
        namespace: 'minesweeper',
        action: 'mine:hit',
        description: 'Mine hit - game over',
        payload: {
            row: 'number',
            col: 'number',
            time: 'number'
        },
        example: { row: 5, col: 3, time: 32 }
    },

    'minesweeper:win': {
        namespace: 'minesweeper',
        action: 'win',
        description: 'Game won - all safe cells revealed',
        payload: {
            time: 'number',
            difficulty: 'string?',
            rows: 'number',
            cols: 'number',
            mines: 'number'
        },
        example: { time: 45, difficulty: 'beginner', rows: 9, cols: 9, mines: 10 }
    },

    'minesweeper:timer': {
        namespace: 'minesweeper',
        action: 'timer',
        description: 'Timer updated',
        payload: {
            time: 'number'
        },
        example: { time: 15 }
    },

    // ==========================================
    // ASTEROIDS EVENTS
    // ==========================================
    'asteroids:asteroid:destroy': {
        namespace: 'asteroids',
        action: 'asteroid:destroy',
        description: 'Asteroid destroyed',
        payload: {
            size: 'string',
            points: 'number',
            x: 'number',
            y: 'number',
            combo: 'number?'
        },
        example: { size: 'large', points: 20, x: 200, y: 150, combo: 3 }
    },

    'asteroids:ufo:spawn': {
        namespace: 'asteroids',
        action: 'ufo:spawn',
        description: 'UFO spawned',
        payload: {
            type: 'string?'
        },
        example: { type: 'small' }
    },

    'asteroids:ufo:destroy': {
        namespace: 'asteroids',
        action: 'ufo:destroy',
        description: 'UFO destroyed',
        payload: {
            points: 'number'
        },
        example: { points: 200 }
    },

    'asteroids:powerup:spawn': {
        namespace: 'asteroids',
        action: 'powerup:spawn',
        description: 'Power-up spawned',
        payload: {
            type: 'string',
            x: 'number',
            y: 'number'
        },
        example: { type: 'shield', x: 300, y: 200 }
    },

    'asteroids:powerup:collect': {
        namespace: 'asteroids',
        action: 'powerup:collect',
        description: 'Power-up collected',
        payload: {
            type: 'string',
            duration: 'number?'
        },
        example: { type: 'triple', duration: 10000 }
    },

    'asteroids:powerup:expire': {
        namespace: 'asteroids',
        action: 'powerup:expire',
        description: 'Power-up expired',
        payload: {
            type: 'string'
        },
        example: { type: 'shield' }
    },

    'asteroids:ship:explode': {
        namespace: 'asteroids',
        action: 'ship:explode',
        description: 'Player ship exploded',
        payload: {
            livesRemaining: 'number',
            x: 'number',
            y: 'number'
        },
        example: { livesRemaining: 2, x: 400, y: 300 }
    },

    'asteroids:combo': {
        namespace: 'asteroids',
        action: 'combo',
        description: 'Combo updated',
        payload: {
            combo: 'number',
            multiplier: 'number'
        },
        example: { combo: 5, multiplier: 2.5 }
    },

    // ==========================================
    // SNAKE EVENTS
    // ==========================================
    'snake:food:eat': {
        namespace: 'snake',
        action: 'food:eat',
        description: 'Food eaten',
        payload: {
            x: 'number',
            y: 'number',
            score: 'number',
            length: 'number'
        },
        example: { x: 10, y: 5, score: 10, length: 5 }
    },

    'snake:collision': {
        namespace: 'snake',
        action: 'collision',
        description: 'Snake collision detected',
        payload: {
            type: 'string',
            x: 'number',
            y: 'number'
        },
        example: { type: 'wall', x: 0, y: 10 }
    },

    'snake:direction': {
        namespace: 'snake',
        action: 'direction',
        description: 'Direction changed',
        payload: {
            direction: 'string',
            previousDirection: 'string?'
        },
        example: { direction: 'up', previousDirection: 'left' }
    },

    'snake:speed': {
        namespace: 'snake',
        action: 'speed',
        description: 'Speed increased',
        payload: {
            speed: 'number',
            previousSpeed: 'number?'
        },
        example: { speed: 150, previousSpeed: 200 }
    },

    // ==========================================
    // SOLITAIRE EVENTS
    // ==========================================
    'solitaire:card:move': {
        namespace: 'solitaire',
        action: 'card:move',
        description: 'Card moved',
        payload: {
            card: 'string',
            from: 'string',
            to: 'string',
            moves: 'number'
        },
        example: { card: 'AS', from: 'tableau:3', to: 'foundation:0', moves: 15 }
    },

    'solitaire:stock:draw': {
        namespace: 'solitaire',
        action: 'stock:draw',
        description: 'Card drawn from stock',
        payload: {
            card: 'string',
            stockRemaining: 'number'
        },
        example: { card: 'KH', stockRemaining: 20 }
    },

    'solitaire:stock:recycle': {
        namespace: 'solitaire',
        action: 'stock:recycle',
        description: 'Waste pile recycled to stock',
        payload: {
            cardsRecycled: 'number'
        },
        example: { cardsRecycled: 24 }
    },

    'solitaire:foundation:add': {
        namespace: 'solitaire',
        action: 'foundation:add',
        description: 'Card added to foundation',
        payload: {
            card: 'string',
            foundation: 'number',
            count: 'number'
        },
        example: { card: '2S', foundation: 2, count: 2 }
    },

    'solitaire:win': {
        namespace: 'solitaire',
        action: 'win',
        description: 'Game won',
        payload: {
            moves: 'number',
            time: 'number'
        },
        example: { moves: 95, time: 180 }
    },

    'solitaire:invalid:move': {
        namespace: 'solitaire',
        action: 'invalid:move',
        description: 'Invalid move attempted',
        payload: {
            card: 'string',
            from: 'string',
            to: 'string',
            reason: 'string?'
        },
        example: { card: 'QH', from: 'waste', to: 'tableau:5', reason: 'wrong_color' }
    },

    // ==========================================
    // FREECELL EVENTS
    // ==========================================
    'freecell:card:move': {
        namespace: 'freecell',
        action: 'card:move',
        description: 'Card moved',
        payload: {
            card: 'string',
            from: 'string',
            to: 'string',
            moves: 'number'
        },
        example: { card: '7D', from: 'column:3', to: 'cell:1', moves: 12 }
    },

    'freecell:cell:occupy': {
        namespace: 'freecell',
        action: 'cell:occupy',
        description: 'Free cell occupied',
        payload: {
            card: 'string',
            cell: 'number',
            freeCellsRemaining: 'number'
        },
        example: { card: 'JC', cell: 0, freeCellsRemaining: 3 }
    },

    'freecell:foundation:add': {
        namespace: 'freecell',
        action: 'foundation:add',
        description: 'Card added to foundation',
        payload: {
            card: 'string',
            foundation: 'number',
            count: 'number'
        },
        example: { card: 'AS', foundation: 0, count: 1 }
    },

    'freecell:undo': {
        namespace: 'freecell',
        action: 'undo',
        description: 'Move undone',
        payload: {
            card: 'string',
            moves: 'number'
        },
        example: { card: '5H', moves: 11 }
    },

    'freecell:win': {
        namespace: 'freecell',
        action: 'win',
        description: 'Game won',
        payload: {
            moves: 'number',
            time: 'number'
        },
        example: { moves: 82, time: 240 }
    },

    // ==========================================
    // SKIFREE EVENTS
    // ==========================================
    'skifree:distance': {
        namespace: 'skifree',
        action: 'distance',
        description: 'Distance updated',
        payload: {
            distance: 'number',
            delta: 'number?'
        },
        example: { distance: 1500, delta: 10 }
    },

    'skifree:obstacle:hit': {
        namespace: 'skifree',
        action: 'obstacle:hit',
        description: 'Obstacle collision',
        payload: {
            type: 'string',
            x: 'number',
            y: 'number'
        },
        example: { type: 'tree', x: 200, y: 500 }
    },

    'skifree:jump': {
        namespace: 'skifree',
        action: 'jump',
        description: 'Player jumped',
        payload: {
            x: 'number',
            y: 'number',
            points: 'number?'
        },
        example: { x: 300, y: 600, points: 50 }
    },

    'skifree:yeti:spawn': {
        namespace: 'skifree',
        action: 'yeti:spawn',
        description: 'Yeti spawned',
        payload: {
            distance: 'number'
        },
        example: { distance: 2000 }
    },

    'skifree:yeti:caught': {
        namespace: 'skifree',
        action: 'yeti:caught',
        description: 'Player caught by yeti',
        payload: {
            distance: 'number',
            score: 'number'
        },
        example: { distance: 2100, score: 420 }
    },

    // ==========================================
    // PAINT EVENTS
    // ==========================================
    'paint:tool:change': {
        namespace: 'paint',
        action: 'tool:change',
        description: 'Tool changed',
        payload: {
            tool: 'string',
            previousTool: 'string?'
        },
        example: { tool: 'eraser', previousTool: 'brush' }
    },

    'paint:color:change': {
        namespace: 'paint',
        action: 'color:change',
        description: 'Color changed',
        payload: {
            color: 'string',
            previousColor: 'string?'
        },
        example: { color: '#FF0000', previousColor: '#000000' }
    },

    'paint:brush:size': {
        namespace: 'paint',
        action: 'brush:size',
        description: 'Brush size changed',
        payload: {
            size: 'number',
            previousSize: 'number?'
        },
        example: { size: 8, previousSize: 4 }
    },

    'paint:stroke:start': {
        namespace: 'paint',
        action: 'stroke:start',
        description: 'Stroke started',
        payload: {
            x: 'number',
            y: 'number',
            tool: 'string'
        },
        example: { x: 100, y: 50, tool: 'brush' }
    },

    'paint:stroke:end': {
        namespace: 'paint',
        action: 'stroke:end',
        description: 'Stroke ended',
        payload: {
            x: 'number',
            y: 'number'
        },
        example: { x: 200, y: 150 }
    },

    'paint:canvas:clear': {
        namespace: 'paint',
        action: 'canvas:clear',
        description: 'Canvas cleared',
        payload: {},
        example: {}
    },

    'paint:file:save': {
        namespace: 'paint',
        action: 'file:save',
        description: 'Image saved',
        payload: {
            path: 'array',
            filename: 'string'
        },
        example: { path: ['C:', 'Users', 'User', 'Pictures'], filename: 'drawing.png' }
    },

    'paint:file:open': {
        namespace: 'paint',
        action: 'file:open',
        description: 'Image opened',
        payload: {
            path: 'array',
            filename: 'string'
        },
        example: { path: ['C:', 'Users', 'User', 'Pictures'], filename: 'photo.png' }
    },

    // ==========================================
    // WINAMP/MEDIA EVENTS
    // ==========================================
    'media:track:change': {
        namespace: 'media',
        action: 'track:change',
        description: 'Track changed',
        payload: {
            track: 'string',
            index: 'number',
            duration: 'number?'
        },
        example: { track: 'Song Title', index: 3, duration: 180 }
    },

    'media:play': {
        namespace: 'media',
        action: 'play',
        description: 'Playback started',
        payload: {
            track: 'string',
            position: 'number?'
        },
        example: { track: 'My Song', position: 0 }
    },

    'media:pause': {
        namespace: 'media',
        action: 'pause',
        description: 'Playback paused',
        payload: {
            track: 'string',
            position: 'number'
        },
        example: { track: 'My Song', position: 45 }
    },

    'media:stop': {
        namespace: 'media',
        action: 'stop',
        description: 'Playback stopped',
        payload: {
            track: 'string?'
        },
        example: { track: 'My Song' }
    },

    'media:volume': {
        namespace: 'media',
        action: 'volume',
        description: 'Volume changed',
        payload: {
            volume: 'number',
            previousVolume: 'number?'
        },
        example: { volume: 0.8, previousVolume: 0.5 }
    },

    'media:position': {
        namespace: 'media',
        action: 'position',
        description: 'Playback position changed',
        payload: {
            position: 'number',
            duration: 'number'
        },
        example: { position: 60, duration: 180 }
    },

    // ==========================================
    // TERMINAL EVENTS
    // ==========================================
    'terminal:command': {
        namespace: 'terminal',
        action: 'command',
        description: 'Command executed',
        payload: {
            command: 'string',
            args: 'array?',
            cwd: 'string?'
        },
        example: { command: 'dir', args: ['/w'], cwd: 'C:\\Users\\User' }
    },

    'terminal:output': {
        namespace: 'terminal',
        action: 'output',
        description: 'Output generated',
        payload: {
            text: 'string',
            type: 'string?'
        },
        example: { text: 'Directory listing...', type: 'normal' }
    },

    'terminal:error': {
        namespace: 'terminal',
        action: 'error',
        description: 'Error occurred',
        payload: {
            message: 'string',
            command: 'string?'
        },
        example: { message: 'Command not found', command: 'xyz' }
    },

    'terminal:cwd:change': {
        namespace: 'terminal',
        action: 'cwd:change',
        description: 'Directory changed',
        payload: {
            cwd: 'string',
            previousCwd: 'string?'
        },
        example: { cwd: 'C:\\Users\\User\\Documents', previousCwd: 'C:\\Users\\User' }
    },

    'terminal:matrix': {
        namespace: 'terminal',
        action: 'matrix',
        description: 'Trigger Matrix screen effect (easter egg)',
        payload: {},
        example: {}
    },

    'terminal:command:executed': {
        namespace: 'terminal',
        action: 'command:executed',
        description: 'Terminal command successfully executed',
        payload: {
            appId: 'string',
            windowId: 'string?',
            command: 'string',
            timestamp: 'number?'
        },
        example: { appId: 'terminal', windowId: 'win-1', command: 'dir', timestamp: 1700000000000 }
    },

    'terminal:command:error': {
        namespace: 'terminal',
        action: 'command:error',
        description: 'Terminal command execution error',
        payload: {
            appId: 'string',
            command: 'string',
            error: 'string'
        },
        example: { appId: 'terminal', command: 'badcmd', error: 'Command not found' }
    },

    'terminal:cleared': {
        namespace: 'terminal',
        action: 'cleared',
        description: 'Terminal screen cleared',
        payload: {
            appId: 'string',
            windowId: 'string?',
            timestamp: 'number?'
        },
        example: { appId: 'terminal', windowId: 'win-1', timestamp: 1700000000000 }
    },

    'terminal:directory:changed': {
        namespace: 'terminal',
        action: 'directory:changed',
        description: 'Terminal working directory changed',
        payload: {
            appId: 'string',
            path: 'array',
            timestamp: 'number?'
        },
        example: { appId: 'terminal', path: ['C:', 'Users', 'User'], timestamp: 1700000000000 }
    },

    'app:terminal:opened': {
        namespace: 'app',
        action: 'terminal:opened',
        description: 'Terminal window opened',
        payload: {
            appId: 'string',
            windowId: 'string?',
            currentPath: 'array?',
            pathString: 'string?',
            timestamp: 'number?'
        },
        example: { appId: 'terminal', windowId: 'win-1', pathString: 'C:\\Users\\User' }
    },

    'app:terminal:command': {
        namespace: 'app',
        action: 'terminal:command',
        description: 'Terminal command processed with full context',
        payload: {
            appId: 'string',
            windowId: 'string?',
            command: 'string',
            cmd: 'string?',
            args: 'array?',
            output: 'string?',
            currentPath: 'array?',
            pathString: 'string?',
            timestamp: 'number?'
        },
        example: { appId: 'terminal', command: 'dir /w', cmd: 'dir', args: ['/w'] }
    },

    'app:terminal:closed': {
        namespace: 'app',
        action: 'terminal:closed',
        description: 'Terminal window closed',
        payload: {
            appId: 'string',
            windowId: 'string?',
            commandHistory: 'array?',
            historyCount: 'number?',
            timestamp: 'number?'
        },
        example: { appId: 'terminal', windowId: 'win-1', historyCount: 42 }
    },

    'app:launch:error': {
        namespace: 'app',
        action: 'launch:error',
        description: 'App launch failed with error',
        payload: {
            appId: 'string',
            appName: 'string?',
            error: 'string',
            stack: 'string?',
            timestamp: 'number?'
        },
        example: { appId: 'notepad', error: 'Failed to initialize' }
    },

    // ==========================================
    // BSOD EVENTS (Blue Screen of Death)
    // ==========================================
    'bsod:show': {
        namespace: 'bsod',
        action: 'show',
        description: 'Show Blue Screen of Death effect',
        payload: {
            error: 'string?',
            code: 'string?'
        },
        example: {
            error: 'CRITICAL_PROCESS_DIED',
            code: '0x0000007E'
        }
    },

    // ==========================================
    // BROWSER EVENTS
    // ==========================================
    'browser:navigate': {
        namespace: 'browser',
        action: 'navigate',
        description: 'Navigation started',
        payload: {
            url: 'string',
            previousUrl: 'string?'
        },
        example: { url: 'https://example.com', previousUrl: 'about:blank' }
    },

    'browser:load': {
        namespace: 'browser',
        action: 'load',
        description: 'Page loaded',
        payload: {
            url: 'string',
            title: 'string?'
        },
        example: { url: 'https://example.com', title: 'Example Site' }
    },

    'browser:bookmark:add': {
        namespace: 'browser',
        action: 'bookmark:add',
        description: 'Bookmark added',
        payload: {
            url: 'string',
            title: 'string'
        },
        example: { url: 'https://example.com', title: 'Example' }
    }
};

/**
 * Get event schema for a given event name
 * @param {string} eventName - Event name
 * @returns {object|null} Event schema or null
 */
export function getEventSchema(eventName) {
    return EventSchema[eventName] || null;
}

/**
 * Get all events in a namespace
 * @param {string} namespace - Namespace (e.g., 'window', 'app')
 * @returns {string[]} Array of event names
 */
export function getEventsByNamespace(namespace) {
    return Object.keys(EventSchema).filter(
        eventName => EventSchema[eventName].namespace === namespace
    );
}

/**
 * Get all registered event names
 * @returns {string[]} Array of all event names
 */
export function getAllEvents() {
    return Object.keys(EventSchema);
}

/**
 * Check if an event is registered
 * @param {string} eventName - Event name
 * @returns {boolean} True if event exists
 */
export function isEventRegistered(eventName) {
    return EventSchema.hasOwnProperty(eventName);
}

export default EventSchema;
