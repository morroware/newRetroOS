# Semantic Event System

RetrOS (IlluminatOS!) features a **comprehensive semantic event architecture** with 200+ events that enables typed, validated, and well-documented communication between all system components (31 apps, 7 features, 4 UI renderers, 15 core modules).

## Overview

The **SemanticEventBus** is an enhanced event system that provides:

- **200+ Semantic events** - Every action in the OS is an event
- **Event schema validation** - Automatic payload validation against defined schemas
- **Priority system** - Control handler execution order (SYSTEM → HIGH → NORMAL → LOW → SCRIPT)
- **Event cancellation** - Prevent event propagation for cancellable events
- **Request/Response** - Async operations with promise-based responses
- **Channels** - Scoped communication between components
- **Throttling/Debouncing** - Rate-limit high-frequency events
- **Pattern matching** - Subscribe with wildcards (`window:*`, `fs:*`)
- **Event streams** - Async iterators for event processing
- **Middleware support** - Intercept and transform events
- **CommandBus integration** - Execute commands via events for scripting
- **ScriptEngine support** - Power RetroScript automation
- **100% Backward compatible** - All existing code continues to work

## Quick Start

### Basic Usage

```javascript
import EventBus, { Events, Priority } from './core/SemanticEventBus.js';

// Subscribe to an event with type-safe constant
EventBus.on(Events.WINDOW_OPEN, (payload) => {
    console.log('Window opened:', payload.id);
});

// Subscribe with priority control
EventBus.on(Events.KEYBOARD_KEYDOWN, handler, { priority: Priority.HIGH });

// Pattern matching (wildcards)
EventBus.on('window:*', handler);  // All window events
EventBus.on('fs:*', handler);      // All file system events

// Emit an event
EventBus.emit(Events.WINDOW_OPEN, {
    id: 'window-notepad-1',
    appId: 'notepad'
});

// Unsubscribe
const unsubscribe = EventBus.on(Events.APP_LAUNCH, handler);
unsubscribe(); // or EventBus.off(Events.APP_LAUNCH, handler);
```

---

## Complete Event Reference

### Window Events (18 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `window:create` | `WINDOW_CREATE` | `{id, title, appId, width, height, x?, y?, resizable?, minimizable?, maximizable?}` | Window being created |
| `window:open` | `WINDOW_OPEN` | `{id, appId?, element?}` | Window opened in DOM |
| `window:close` | `WINDOW_CLOSE` | `{id, appId?}` | Window closing |
| `window:focus` | `WINDOW_FOCUS` | `{id, previousId?}` | Window focused |
| `window:minimize` | `WINDOW_MINIMIZE` | `{id}` | Window minimized |
| `window:maximize` | `WINDOW_MAXIMIZE` | `{id}` | Window maximized |
| `window:restore` | `WINDOW_RESTORE` | `{id}` | Window restored |
| `window:resize` | `WINDOW_RESIZE` | `{id, width, height}` | Window resized |
| `window:move` | `WINDOW_MOVE` | `{id, x, y}` | Window moved |
| `window:move:start` | `WINDOW_MOVE_START` | `{id, x, y}` | Window move started |
| `window:move:end` | `WINDOW_MOVE_END` | `{id, x, y}` | Window move ended |
| `window:resize:start` | `WINDOW_RESIZE_START` | `{id, width, height}` | Resize started |
| `window:resize:end` | `WINDOW_RESIZE_END` | `{id, width, height}` | Resize ended |
| `window:snap` | `WINDOW_SNAP` | `{id, position, width, height}` | Window snapped |
| `window:titlebar:click` | `WINDOW_TITLEBAR_CLICK` | `{id, button}` | Titlebar clicked |
| `window:shake` | `WINDOW_SHAKE` | `{id}` | Window shake animation |
| `window:flash` | `WINDOW_FLASH` | `{id}` | Window flash animation |

### App Events (12 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `app:launch` | `APP_LAUNCH` | `{appId, params?}` | App launch requested |
| `app:open` | `APP_OPEN` | `{appId, windowId, instance?}` | App opened successfully |
| `app:close` | `APP_CLOSE` | `{appId, windowId}` | App closing |
| `app:ready` | `APP_READY` | `{appId, windowId}` | App mounted and ready |
| `app:focus` | `APP_FOCUS` | `{appId, windowId}` | App gained focus |
| `app:blur` | `APP_BLUR` | `{appId, windowId}` | App lost focus |
| `app:busy` | `APP_BUSY` | `{appId, task?}` | App is busy |
| `app:idle` | `APP_IDLE` | `{appId}` | App is idle |
| `app:error` | `APP_ERROR` | `{appId, error, fatal?}` | App error occurred |
| `app:state:change` | `APP_STATE_CHANGE` | `{appId, key, value, oldValue?}` | App state changed |
| `app:message` | `APP_MESSAGE` | `{from, to, message, type?}` | App-to-app message |
| `app:broadcast` | `APP_BROADCAST` | `{from, message, type?}` | Broadcast to all apps |
| `app:registered` | `APP_REGISTERED` | `{appId, name, category?}` | App registered |

### System Events (18 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `system:boot` | `SYSTEM_BOOT` | `{timestamp, phase?}` | System boot started |
| `system:boot:phase` | `SYSTEM_BOOT_PHASE` | `{phase, progress?}` | Boot phase update |
| `system:ready` | `SYSTEM_READY` | `{timestamp, bootTime?}` | System fully initialized |
| `system:shutdown` | `SHUTDOWN` | `{reason?}` | System shutdown initiated |
| `system:idle` | `SYSTEM_IDLE` | `{idleTime, threshold}` | User idle (no activity) |
| `system:active` | `SYSTEM_ACTIVE` | `{idleDuration}` | User became active |
| `system:sleep` | `SYSTEM_SLEEP` | `{reason?}` | System sleeping (tab hidden) |
| `system:wake` | `SYSTEM_WAKE` | `{}` | System waking up |
| `system:focus` | `SYSTEM_FOCUS` | `{}` | Browser window focused |
| `system:blur` | `SYSTEM_BLUR` | `{}` | Browser window blurred |
| `system:visibility:change` | `SYSTEM_VISIBILITY_CHANGE` | `{visible, state}` | Visibility changed |
| `system:online` | `SYSTEM_ONLINE` | `{}` | Network connected |
| `system:offline` | `SYSTEM_OFFLINE` | `{}` | Network disconnected |
| `system:resize` | `SYSTEM_RESIZE` | `{width, height, previousWidth, previousHeight}` | Viewport resized |
| `system:fullscreen:enter` | `SYSTEM_FULLSCREEN_ENTER` | `{element}` | Entered fullscreen |
| `system:fullscreen:exit` | `SYSTEM_FULLSCREEN_EXIT` | `{}` | Exited fullscreen |
| `system:memory:warning` | `SYSTEM_MEMORY_WARNING` | `{usage, limit, percentage}` | High memory usage |
| `system:screensaver:start` | `SCREENSAVER_START` | `{mode?}` | Screensaver activated |
| `system:screensaver:end` | `SCREENSAVER_END` | `{}` | Screensaver deactivated |

### Mouse Events (10 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `mouse:move` | `MOUSE_MOVE` | `{x, y, deltaX, deltaY, target}` | Mouse moved |
| `mouse:click` | `MOUSE_CLICK` | `{x, y, button, target, targetType}` | Mouse clicked |
| `mouse:dblclick` | `MOUSE_DBLCLICK` | `{x, y, button, target}` | Double clicked |
| `mouse:down` | `MOUSE_DOWN` | `{x, y, button, target}` | Mouse button down |
| `mouse:up` | `MOUSE_UP` | `{x, y, button, target}` | Mouse button up |
| `mouse:contextmenu` | `MOUSE_CONTEXTMENU` | `{x, y, target, targetType}` | Right click |
| `mouse:scroll` | `MOUSE_SCROLL` | `{deltaX, deltaY, deltaZ, x, y, target}` | Scroll wheel |
| `mouse:enter` | `MOUSE_ENTER` | `{target}` | Mouse entered element |
| `mouse:leave` | `MOUSE_LEAVE` | `{target}` | Mouse left element |

### Keyboard Events (5 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `keyboard:keydown` | `KEYBOARD_KEYDOWN` | `{key, code, ctrl, alt, shift, meta, repeat, target}` | Key pressed |
| `keyboard:keyup` | `KEYBOARD_KEYUP` | `{key, code, ctrl, alt, shift, meta, target}` | Key released |
| `keyboard:input` | `KEYBOARD_INPUT` | `{key, value, target}` | Input received |
| `keyboard:combo` | `KEYBOARD_COMBO` | `{combo, keys, handled}` | Modifier combo (Ctrl+S) |
| `keyboard:shortcut` | `KEYBOARD_SHORTCUT` | `{shortcut, action}` | Registered shortcut triggered |

### Touch Events (4 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `touch:start` | `TOUCH_START` | `{touches, x, y, target}` | Touch started |
| `touch:move` | `TOUCH_MOVE` | `{touches, x, y, deltaX, deltaY, target}` | Touch moved |
| `touch:end` | `TOUCH_END` | `{touches, x, y, target}` | Touch ended |
| `touch:cancel` | `TOUCH_CANCEL` | `{touches, target}` | Touch cancelled |

### Gesture Events (6 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `gesture:tap` | `GESTURE_TAP` | `{x, y, target}` | Tap detected |
| `gesture:doubletap` | `GESTURE_DOUBLETAP` | `{x, y, target}` | Double tap |
| `gesture:longpress` | `GESTURE_LONGPRESS` | `{x, y, duration, target}` | Long press (800ms) |
| `gesture:swipe` | `GESTURE_SWIPE` | `{direction, startX, startY, endX, endY, velocity, target}` | Swipe gesture |
| `gesture:pinch` | `GESTURE_PINCH` | `{scale, centerX, centerY, target}` | Pinch/zoom |
| `gesture:rotate` | `GESTURE_ROTATE` | `{angle, centerX, centerY, target}` | Rotation gesture |

### File System Events (12 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `fs:file:create` | `FS_FILE_CREATE` | `{path, name, size?}` | File created |
| `fs:file:read` | `FS_FILE_READ` | `{path, name, size?}` | File read |
| `fs:file:update` | `FS_FILE_UPDATE` | `{path, name, size?, oldSize?}` | File updated |
| `fs:file:delete` | `FS_FILE_DELETE` | `{path, name}` | File deleted |
| `fs:file:rename` | `FS_FILE_RENAME` | `{path, oldName, newName}` | File renamed |
| `fs:file:move` | `FS_FILE_MOVE` | `{sourcePath, destPath, name}` | File moved |
| `fs:file:copy` | `FS_FILE_COPY` | `{sourcePath, destPath, name}` | File copied |
| `fs:directory:create` | `FS_DIRECTORY_CREATE` | `{path, name}` | Directory created |
| `fs:directory:delete` | `FS_DIRECTORY_DELETE` | `{path, name}` | Directory deleted |
| `fs:directory:rename` | `FS_DIRECTORY_RENAME` | `{path, oldName, newName}` | Directory renamed |
| `fs:directory:open` | `FS_DIRECTORY_OPEN` | `{path}` | Directory opened |
| `fs:error` | `FS_ERROR` | `{operation, path, error, code?}` | File system error |
| `fs:permission:denied` | `FS_PERMISSION_DENIED` | `{operation, path}` | Permission denied |
| `fs:watch:change` | `FS_WATCH_CHANGE` | `{path, changeType, name?}` | Watched file changed |
| `filesystem:changed` | `FILESYSTEM_CHANGED` | `{path?, operation?}` | File system changed |

### Feature Events (5 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `feature:initialize` | `FEATURE_INITIALIZE` | `{featureId, config?}` | Feature initializing |
| `feature:ready` | `FEATURE_READY` | `{featureId}` | Feature ready |
| `feature:enable` | `FEATURE_ENABLE` | `{featureId, name?}` | Feature enabled |
| `feature:disable` | `FEATURE_DISABLE` | `{featureId, name?}` | Feature disabled |
| `feature:error` | `FEATURE_ERROR` | `{featureId, error, fatal?}` | Feature error |
| `feature:config:change` | `FEATURE_CONFIG_CHANGE` | `{featureId, key, value, oldValue?}` | Config changed |

### Performance Events (5 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `perf:fps` | `PERF_FPS` | `{fps, frameTime}` | FPS measurement |
| `perf:fps:low` | `PERF_FPS_LOW` | `{fps, threshold}` | Low FPS warning |
| `perf:memory` | `PERF_MEMORY` | `{usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit}` | Memory stats |
| `perf:longtask` | `PERF_LONGTASK` | `{duration, startTime, source}` | Long task detected |
| `perf:measure` | `PERF_MEASURE` | `{name, duration, startMark, endMark}` | Performance measure |

### UI Events (7 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `ui:menu:start:toggle` | `START_MENU_TOGGLE` | `{}` | Start menu toggled |
| `ui:menu:start:open` | `START_MENU_OPEN` | `{}` | Start menu opened |
| `ui:menu:start:close` | `START_MENU_CLOSE` | `{}` | Start menu closed |
| `ui:menu:context:show` | `CONTEXT_MENU_SHOW` | `{x, y, items, target?}` | Context menu shown |
| `ui:menu:context:hide` | `CONTEXT_MENU_HIDE` | `{}` | Context menu hidden |
| `ui:menu:action` | `MENU_ACTION` | `{action, data?}` | Menu action triggered |
| `ui:taskbar:update` | `TASKBAR_UPDATE` | `{}` | Taskbar needs update |

### Dialog Events (8 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `dialog:alert` | `DIALOG_ALERT` | `{message, title?, type?}` | Alert dialog |
| `dialog:confirm` | `DIALOG_CONFIRM` | `{message, title?}` | Confirm dialog |
| `dialog:confirm:response` | `DIALOG_CONFIRM_RESPONSE` | `{confirmed}` | Confirm response |
| `dialog:prompt` | `DIALOG_PROMPT` | `{message, title?, defaultValue?}` | Prompt dialog |
| `dialog:prompt:response` | `DIALOG_PROMPT_RESPONSE` | `{value, cancelled}` | Prompt response |
| `dialog:file-open` | `DIALOG_FILE_OPEN` | `{title?, filter?, initialPath?}` | File open dialog |
| `dialog:file-open:response` | `DIALOG_FILE_OPEN_RESPONSE` | `{filename?, path?, cancelled}` | File open response |
| `dialog:file-save` | `DIALOG_FILE_SAVE` | `{title?, filter?, initialPath?, defaultFilename?}` | File save dialog |
| `dialog:file-save:response` | `DIALOG_FILE_SAVE_RESPONSE` | `{filename?, path?, cancelled}` | File save response |

### Audio Events (8 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `audio:play` | `AUDIO_PLAY` | `{url, title?}` | Audio play requested |
| `audio:stop` | `AUDIO_STOP` | `{}` | Audio stop requested |
| `audio:stopall` | `AUDIO_STOP_ALL` | `{}` | Stop all audio |
| `audio:pause` | `AUDIO_PAUSE` | `{}` | Audio paused |
| `audio:resume` | `AUDIO_RESUME` | `{}` | Audio resumed |
| `audio:ended` | `AUDIO_ENDED` | `{url?}` | Audio playback ended |
| `audio:error` | `AUDIO_ERROR` | `{error, url?}` | Audio error |
| `audio:loaded` | `AUDIO_LOADED` | `{url, duration?}` | Audio loaded |
| `audio:timeupdate` | `AUDIO_TIME_UPDATE` | `{currentTime, duration}` | Playback progress |
| `sound:play` | `SOUND_PLAY` | `{type, volume?}` | System sound |
| `sound:volume` | `VOLUME_CHANGE` | `{volume}` | Volume changed |

### Scripting Events (10 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `script:start` | `SCRIPT_START` | `{scriptId, name?}` | Script started |
| `script:execute` | `SCRIPT_EXECUTE` | `{scriptId, statement?}` | Script executing |
| `script:statement` | `SCRIPT_STATEMENT` | `{scriptId, statement, line?}` | Statement executed |
| `script:complete` | `SCRIPT_COMPLETE` | `{scriptId, result?}` | Script completed |
| `script:error` | `SCRIPT_ERROR` | `{scriptId, error, line?}` | Script error |
| `script:output` | `SCRIPT_OUTPUT` | `{scriptId, output}` | Script output |
| `script:variable:set` | `SCRIPT_VARIABLE_SET` | `{scriptId, name, value}` | Variable set |
| `script:function:call` | `SCRIPT_FUNCTION_CALL` | `{scriptId, name, args?}` | Function called |
| `script:event:subscribe` | `SCRIPT_EVENT_SUBSCRIBE` | `{scriptId, event}` | Event subscribed |
| `script:event:emit` | `SCRIPT_EVENT_EMIT` | `{scriptId, event, payload?}` | Event emitted |

### Session Events (3 events)

| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `session:start` | `SESSION_START` | `{sessionId, timestamp}` | Session started |
| `session:end` | `SESSION_END` | `{sessionId, duration, reason?}` | Session ended |
| `session:activity` | `SESSION_ACTIVITY` | `{sessionId, activity, timestamp}` | User activity |

### Additional Events

**Icon Events:**
| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `icon:click` | `ICON_CLICK` | `{iconId, appId?}` | Icon clicked |
| `icon:dblclick` | `ICON_DBLCLICK` | `{iconId, appId?}` | Icon double-clicked |
| `icon:move` | `ICON_MOVE` | `{iconId, x, y}` | Icon moved |
| `icon:delete` | `ICON_DELETE` | `{iconId}` | Icon deleted |

**Drag Events:**
| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `drag:start` | `DRAG_START` | `{source, type, data?}` | Drag started |
| `drag:move` | `DRAG_MOVE` | `{x, y, source}` | Dragging |
| `drag:end` | `DRAG_END` | `{target, source, data?}` | Drag ended |

**Achievement Events:**
| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `achievement:unlock` | `ACHIEVEMENT_UNLOCK` | `{id, name?, description?}` | Achievement unlocked |
| `achievement:progress` | `ACHIEVEMENT_PROGRESS` | `{id, progress, target}` | Progress updated |

**Notification Events:**
| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `notification:show` | `NOTIFICATION_SHOW` | `{message, type?, duration?}` | Show notification |
| `notification:dismiss` | `NOTIFICATION_DISMISS` | `{id}` | Dismiss notification |

**Clipboard Events:**
| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `clipboard:copy` | `CLIPBOARD_COPY` | `{data, type}` | Content copied |
| `clipboard:paste` | `CLIPBOARD_PASTE` | `{data, type}` | Content pasted |

**Theme Events:**
| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `theme:change` | `THEME_CHANGE` | `{theme, previous?}` | Theme changed |
| `theme:color:change` | `THEME_COLOR_CHANGE` | `{color, property}` | Color changed |

**History/Undo Events:**
| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `history:push` | `HISTORY_PUSH` | `{action, data}` | Action pushed |
| `history:undo` | `HISTORY_UNDO` | `{action}` | Undo performed |
| `history:redo` | `HISTORY_REDO` | `{action}` | Redo performed |

**Channel Events:**
| Event | Constant | Payload | Description |
|-------|----------|---------|-------------|
| `channel:message` | `CHANNEL_MESSAGE` | `{channel, message, sender}` | Channel message |
| `channel:subscribe` | `CHANNEL_SUBSCRIBE` | `{channel, subscriber}` | Joined channel |
| `channel:unsubscribe` | `CHANNEL_UNSUBSCRIBE` | `{channel, subscriber}` | Left channel |

---

## Advanced Features

### 1. Priority-based Subscriptions

Control the order handlers are executed:

```javascript
import { Priority } from './core/SemanticEventBus.js';

// System-level handler runs first
EventBus.on('window:close', handler, { priority: Priority.SYSTEM });

// Normal priority (default)
EventBus.on('window:close', handler, { priority: Priority.NORMAL });

// User scripts run last
EventBus.on('window:close', handler, { priority: Priority.SCRIPT });
```

Priority levels:
- `SYSTEM: 1000` - System handlers (run first)
- `HIGH: 100` - High priority
- `NORMAL: 0` - Default
- `LOW: -100` - Low priority
- `SCRIPT: -500` - User scripts (run last)

### 2. Event Cancellation

Prevent events from propagating:

```javascript
// Emit a cancellable event
const event = EventBus.emit('window:close', { id }, { cancellable: true });

// Handler can cancel
EventBus.on('window:close', (payload, metadata, event) => {
    if (hasUnsavedChanges) {
        event.cancel(); // Prevent other handlers from running
    }
}, { priority: Priority.HIGH });

// Check if cancelled
if (event.cancelled) {
    console.log('Window close was prevented');
}
```

### 3. Request/Response Pattern

Async operations with promises:

```javascript
// Request a confirmation dialog
const response = await EventBus.request('dialog:confirm', {
    message: 'Delete this file?',
    title: 'Confirm Delete'
}, { timeout: 30000 });

if (response.confirmed) {
    deleteFile();
}

// Respond to a request
EventBus.on('dialog:confirm', (payload) => {
    // Show dialog, then respond
    EventBus.respond('dialog:confirm:response', payload.requestId, {
        confirmed: true
    });
});
```

### 4. Channels (Scoped Communication)

Isolated messaging between components:

```javascript
// Create/join a channel
const channel = EventBus.channel('notepad-sync', 'notepad-1');

// Send messages
channel.send({ action: 'update', content: 'Hello' });

// Receive messages
channel.receive((message, sender) => {
    console.log(`From ${sender}:`, message);
});

// Leave channel when done
channel.leave();

// Broadcast to all channel subscribers
EventBus.broadcast('notepad-sync', { action: 'refresh' });
```

### 5. Throttling & Debouncing

Rate-limit high-frequency events:

```javascript
// Throttled - max once per 16ms (60fps)
EventBus.emitThrottled('drag:move', { x, y }, 16);

// Debounced - wait until quiet
EventBus.emitDebounced('search:query', { query }, 300);
```

### 6. Event Streams & Promises

Modern async patterns:

```javascript
// Wait for a specific event
const { payload } = await EventBus.waitFor('app:launch', {
    timeout: 5000,
    filter: p => p.appId === 'notepad'
});

// Async iterator for event streams
for await (const { payload } of EventBus.stream('window:*')) {
    console.log('Window event:', payload);
    if (payload.id === 'done') break;
}
```

### 7. Event Piping & Composition

Transform and combine events:

```javascript
// Pipe events with transformation
EventBus.pipe('drag:move', 'position:update', (payload) => ({
    x: Math.round(payload.x),
    y: Math.round(payload.y)
}));

// Filter events
EventBus.filter('window:*', p => p.appId === 'notepad', 'notepad:window');

// Combine multiple events
EventBus.combine(
    ['user:login', 'config:loaded'],
    'app:ready',
    (payloads) => ({ ...payloads['user:login'], ...payloads['config:loaded'] })
);
```

### 8. Wildcard Subscriptions

Subscribe to all events in a namespace:

```javascript
// Listen to ALL window events
EventBus.on('window:*', (payload, metadata) => {
    console.log('Window event:', metadata.name, payload);
});

// Listen to ALL file system events
EventBus.on('fs:*', (payload, metadata) => {
    console.log('FS event:', metadata.name, payload);
});
```

### 9. Event Middleware

Intercept and transform events:

```javascript
// Add logging middleware
EventBus.use((event, next) => {
    console.log(`[${event.name}]`, event.payload);
    next(); // Continue to listeners
});

// Add analytics middleware
EventBus.use((event, next) => {
    if (event.name.startsWith('app:')) {
        analytics.track(event.name, event.payload);
    }
    next();
});
```

---

## Debugging Tools

Access debugging tools via the browser console:

```javascript
// Enable event logging
__RETROS_DEBUG.enableLog();

// View recent events
__RETROS_DEBUG.showEventLog(20);

// List all available events (200+ events!)
__RETROS_DEBUG.listEvents();

// List all namespaces
__RETROS_DEBUG.listNamespaces();

// List events by namespace
__RETROS_DEBUG.listNamespace('window');
__RETROS_DEBUG.listNamespace('fs');
__RETROS_DEBUG.listNamespace('gesture');

// Show event schema
__RETROS_DEBUG.describeEvent('window:open');
__RETROS_DEBUG.describeEvent('gesture:swipe');

// Show statistics
__RETROS_DEBUG.showStats();

// Show active listeners
__RETROS_DEBUG.showListeners();

// Show active channels
__RETROS_DEBUG.showChannels();

// Interactive testing
await __RETROS_DEBUG.request('dialog:confirm', { message: 'Test?' });
__RETROS_DEBUG.emit('sound:play', { type: 'click' });
```

---

## Statistics

Track event bus usage:

```javascript
EventBus.getStats();
// => {
//   emitted: 1234,
//   validated: 1200,
//   validationErrors: 5,
//   validationWarnings: 0,
//   middlewareErrors: 0,
//   requestsTotal: 50,
//   requestsResolved: 48,
//   requestsTimedOut: 2,
//   eventsCancelled: 3
// }

EventBus.resetStats(); // Reset counters
```

---

## Best Practices

### 1. Use Event Constants

```javascript
import { Events } from './core/SemanticEventBus.js';

// GOOD - Type-safe, autocomplete-friendly
EventBus.on(Events.WINDOW_OPEN, handler);

// OK - Works but no type safety
EventBus.on('window:open', handler);
```

### 2. Use Priority Wisely

```javascript
// System handlers for critical logic
EventBus.on('window:close', saveState, { priority: Priority.SYSTEM });

// User scripts for customization
EventBus.on('window:close', userScript, { priority: Priority.SCRIPT });
```

### 3. Use Request/Response for Async

```javascript
// Instead of fire-and-forget
EventBus.emit('dialog:confirm', { message: 'OK?' });

// Use request/response
const result = await EventBus.request('dialog:confirm', { message: 'OK?' });
```

### 4. Use Channels for App Communication

```javascript
// Instead of global events
EventBus.emit('notepad:update', { content });

// Use channels for isolation
const channel = EventBus.channel('notepad-sync', this.id);
channel.send({ content });
```

### 5. Throttle High-Frequency Events

```javascript
// Instead of flooding listeners
EventBus.emit('drag:move', { x, y }); // Every mousemove!

// Throttle to 60fps
EventBus.emitThrottled('drag:move', { x, y }, 16);
```

### 6. Clean Up Listeners

```javascript
// AppBase and FeatureBase handle this automatically!
class MyApp extends AppBase {
    onMount() {
        this.onEvent('window:open', this.handleOpen); // Auto-cleanup on close!
    }
}
```

---

## Architecture Benefits

The semantic event system provides:

1. **Complete Observability** - 200+ events cover everything that happens
2. **Type Safety** - Payloads are validated automatically
3. **Priority Control** - Deterministic handler execution order
4. **Cancellation** - Prevent unwanted event propagation
5. **Async Support** - Request/response for complex interactions
6. **Isolation** - Channels for scoped communication
7. **Performance** - Throttling and debouncing built-in
8. **Discoverability** - Rich documentation and introspection
9. **Debuggability** - Console tools for debugging
10. **Scriptability** - Ready for automation and scripting
11. **Backward Compatible** - All existing code works unchanged

---

## Scripting Integration

### CommandBus

The CommandBus (`/core/CommandBus.js`) provides a command execution layer that enables scripting support:

```javascript
import CommandBus from './core/CommandBus.js';

// Execute a command
await CommandBus.execute('app:launch', { appId: 'notepad' });
await CommandBus.execute('window:close', { id: 'window-1' });
await CommandBus.execute('fs:create', { path: ['C:', 'test.txt'], content: 'Hello' });

// Available command namespaces:
// - app:* - Application commands (launch, close, focus)
// - window:* - Window commands (open, close, minimize, maximize)
// - fs:* - File system commands (create, read, update, delete)
// - dialog:* - Dialog commands (alert, confirm, prompt)
```

### ScriptEngine

The ScriptEngine (`/core/ScriptEngine.js`) enables RetroScript automation:

```javascript
import ScriptEngine from './core/ScriptEngine.js';

// Execute a script
const result = await ScriptEngine.execute(`
    let counter = 0
    app launch notepad
    wait 500
    emit custom:event { message: "Hello from script" }
`);

// Script features:
// - Variables and expressions
// - Conditionals (if/else)
// - Loops (while, for)
// - Event subscription
// - Command execution
// - Functions
```

---

**Built for RetrOS (IlluminatOS!) - Version 95.0**
