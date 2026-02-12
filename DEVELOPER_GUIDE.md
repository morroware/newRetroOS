# IlluminatOS! Developer Guide

This guide documents the **current** development workflow for extending IlluminatOS with apps, features, plugins, and RetroScript-driven experiences.

## Table of contents
1. Development model
2. Local setup and validation
3. Platform architecture
4. Adding a new app
5. Adding a new feature
6. Adding a plugin
7. Building RetroScript “apps” and scripted experiences
8. Filesystem and persistence contracts
9. Event and command integration
10. Admin/backend integration points
11. Documentation and cleanup standards

---

## 1) Development model

IlluminatOS has four extension layers:

1. **Apps** (`/apps`) — user-launched windows extending `AppBase`
2. **Features** (`/features` or plugin-provided) — background capabilities extending `FeatureBase`
3. **Plugins** (`/plugins/features/...`) — packages that register features/apps at runtime
4. **RetroScript content** (`.retro`) — automation and event-driven runtime content

All layers interconnect via:
- Semantic events (`EventBus`)
- Command execution (`CommandBus`)
- Shared filesystem (`FileSystemManager`)
- Shared state (`StateManager`)

---

## 2) Local setup and validation

### Run locally

Frontend-only:
```bash
python -m http.server 8000
```

With PHP backend/admin support:
```bash
php -S localhost:8000
```

### Recommended validation loop
1. Start server
2. Open app and check boot console logs
3. Test launch from Start menu and terminal
4. Verify no uncaught errors in browser console
5. Test persistence by reload

---

## 3) Platform architecture

### Boot sequence (authoritative flow)
Boot orchestration lives in `index.js`:
- Config loading
- App registration
- Core service initialization
- Filesystem synchronization
- Feature registration and initialization
- Plugin loading + plugin feature registration
- UI renderer initialization
- Settings application
- Global handler setup
- Autoexec execution

### Key subsystems
- `apps/AppRegistry.js`: app registration + launch
- `core/WindowManager.js`: window lifecycle
- `core/FileSystemManager.js`: virtual filesystem
- `core/FeatureRegistry.js`: feature lifecycle and toggles
- `core/PluginLoader.js`: plugin manifest loading
- `core/script/ScriptEngine.js`: RetroScript runtime
- `core/CommandBus.js`: script/system command adapters

---

## 4) Adding a new app

### 4.1 Create the app class
Create `apps/MyApp.js`:

```js
import AppBase from './AppBase.js';

class MyApp extends AppBase {
  constructor() {
    super({
      id: 'myapp',
      name: 'My App',
      icon: 'fa-solid fa-star',
      width: 640,
      height: 420,
      resizable: true,
      singleton: false,
      category: 'accessories',
      showInMenu: true
    });
  }

  onOpen(params = {}) {
    this.setInstanceState('count', 0);
    return `<div class="myapp"><button id="inc">Increment</button><span id="out">0</span></div>`;
  }

  onMount() {
    this.addHandler(this.getElement('#inc'), 'click', () => {
      const next = this.getInstanceState('count', 0) + 1;
      this.setInstanceState('count', next);
      this.getElement('#out').textContent = String(next);
    });
  }
}

export default MyApp;
```

### 4.2 Register it
In `apps/AppRegistry.js`:
1. Import your app
2. Add `new MyApp()` in the right registration group

### 4.3 Add styling
- Create `styles/apps/myapp.css`
- Import it from `styles/main.css`

### 4.4 App quality checklist
- Uses `addHandler()` (not raw `addEventListener`) for cleanup safety
- Uses `instance state` for per-window state
- Handles keyboard shortcuts only when active window has focus
- Cleans timers/RAF loops in `onClose`

---

## 5) Adding a new feature

Features run in background and are toggled through `FeatureRegistry`.

### 5.1 Create feature class

```js
import FeatureBase from '../core/FeatureBase.js';

class MyFeature extends FeatureBase {
  constructor() {
    super({
      id: 'my-feature',
      name: 'My Feature',
      category: 'enhancement',
      config: { enabledThing: true, speed: 3 },
      settings: [
        { key: 'enabledThing', label: 'Enable Thing', type: 'checkbox' },
        { key: 'speed', label: 'Speed', type: 'number', min: 1, max: 10 }
      ]
    });
  }

  async initialize() {
    this.subscribe('window:open', (payload) => this.log('window opened', payload));
  }
}

export default new MyFeature();
```

### 5.2 Register feature
- Core feature: register during feature phase in `index.js`
- Plugin feature: export from plugin manifest and let `PluginLoader` handle registration

### 5.3 Feature checklist
- Uses `subscribe()` and `addHandler()` helpers for automatic cleanup
- Keeps config defaults stable
- Has explicit `enable/disable` behavior if runtime toggling changes stateful behavior

---

## 6) Adding a plugin

### 6.1 Directory layout

```text
plugins/features/my-plugin/
├── index.js
└── MyFeature.js
```

### 6.2 Manifest shape

```js
import MyFeature from './MyFeature.js';

export default {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  description: 'Example plugin',
  features: [new MyFeature()],
  apps: [],
  onLoad: async () => {},
  onUnload: async () => {}
};
```

### 6.3 Enable plugin
Preferred: add plugin path in config plugin list (`config/defaults.json`), then boot flow turns it into the runtime manifest.

### 6.4 Plugin safety checklist
- Unique `plugin id`
- Unique feature/app IDs
- No mutation of core globals outside lifecycle hooks
- Handles unload cleanly (removes listeners/timers/dom additions)

---

## 7) Building RetroScript “apps” and scripted experiences

You can ship fully interactive content as scripts, with optional helper windows/apps.

### 7.1 Delivery models
1. **Standalone script app**: a `.retro` file users run in Script Runner/Terminal
2. **Autoexec module**: startup script that bootstraps an experience
3. **Hybrid app + script**: JS app UI that calls ScriptEngine or exposes commands/events consumed by scripts

### 7.2 Script app best practices
- Namespace custom events (`myapp:*`)
- Store progression in filesystem (`C:/Users/User/...`) for visible state
- Use notifications/dialogs for user guidance
- Avoid hard-failing on missing files (`try/catch` blocks in RetroScript)

### 7.3 JS app ↔ script interoperability
In JS app code:
- Emit semantic events the script can subscribe to
- Register custom commands/queries for script control

In RetroScript:
- Use `on event:name {}` handlers
- Use `emit ...` and built-ins for app control/filesystem updates

---

## 8) Filesystem and persistence contracts

### Filesystem
Use `FileSystemManager` API for all file operations; avoid directly touching raw state.

### Persistence
- `StorageManager`: localStorage abstraction
- `StateManager`: state tree with optional persistence flags
- Use existing storage key conventions (prefixed by `illuminatos_`)

### Sync behavior
During boot, desktop icons and installed apps are synced into filesystem structures for cross-app consistency.

---

## 9) Event and command integration

### Events
- Subscribe via `EventBus`/`FeatureBase.subscribe`/`AppBase.onEvent`
- Prefer semantic event names (`namespace:action`)
- Keep payloads structured and explicit

### Commands
Use `CommandBus` for scriptable cross-system actions:
- app lifecycle actions
- window actions
- filesystem actions
- dialog/notification/sound/system settings actions

If you add app-specific script control, register commands from the app and document them.

---

## 10) Admin/backend integration points

When PHP backend is enabled:
- `api/config.php`: merged runtime config
- `api/auth.php`: admin auth
- `api/save.php`: admin config writes
- `admin/`: admin UI

When backend is unavailable, the frontend continues with defaults and logs warnings.

---

## 11) Documentation and cleanup standards

When you add/modify capabilities:
1. Update README overview if user-facing behavior changed
2. Update this guide for extension workflow changes
3. Update `SCRIPTING_GUIDE.md` for script-visible changes
4. Remove superseded planning/debug docs rather than leaving stale guidance

Use this rule: if a document is no longer actionable for contributors, archive it outside repo or delete it.

