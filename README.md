# IlluminatOS!

A retro desktop operating system simulator built with vanilla JavaScript, HTML, and CSS.

## What this project is today

IlluminatOS! is a browser-hosted OS simulation with:
- A complete desktop shell (boot screen, desktop, taskbar, start menu, context menus, windows)
- A virtual multi-drive filesystem with persistence
- A large app suite (productivity, system tools, games, media, internet)
- A modular feature runtime (core features + plugin features)
- A semantic event bus and command bus for loose coupling
- A full scripting language (RetroScript) with autoexec startup support
- Optional PHP backend for centralized admin configuration/auth

## Current architecture at a glance

### Boot pipeline
`index.js` initializes the system in ordered phases:
1. Load config (`ConfigLoader`)
2. Register apps (`AppRegistry`)
3. Initialize core services (`StorageManager`, `StateManager`, `WindowManager`, `CommandBus`, `ScriptEngine`)
4. Sync filesystem shortcuts and installed apps
5. Register and initialize features (`FeatureRegistry`)
6. Load plugin manifest and plugin features (`PluginLoader`)
7. Initialize UI renderers
8. Apply persisted settings
9. Install global handlers
10. Run `autoexec.retro`

### Core systems
- `core/EventBus.js` + `core/SemanticEventBus.js`: semantic pub/sub layer
- `core/CommandBus.js`: scriptable system command endpoint
- `core/FileSystemManager.js`: virtual filesystem and file operations
- `core/StateManager.js`: runtime state + persistence hooks
- `core/WindowManager.js`: window lifecycle and focus/z-order management
- `core/FeatureRegistry.js` + `core/FeatureBase.js`: feature lifecycle/runtime toggling
- `core/PluginLoader.js`: plugin manifest, dynamic load/unload
- `core/script/*`: RetroScript lexer/parser/interpreter/builtins

### Major extension points
- **Apps:** `/apps/*.js`, registered in `apps/AppRegistry.js`
- **Features:** classes extending `core/FeatureBase.js`
- **Plugins:** manifests in `/plugins/features/<plugin>/index.js`
- **Scripts:** `.retro` files run via Script Runner, terminal, or autoexec

## Project structure

```text
.
├── index.js / index.html          # boot + shell
├── apps/                          # first-party apps
├── core/                          # platform runtime systems
│   └── script/                    # RetroScript engine internals
├── features/                      # built-in system features
├── plugins/features/              # plugin-based features
├── ui/                            # desktop/taskbar/start/context renderers
├── styles/                        # modular CSS
├── config/                        # defaults + backend override examples
├── api/                           # PHP API for config/auth/save
├── admin/                         # web admin panel
├── docs/                          # focused docs (terminal scripting, etc.)
├── DEVELOPER_GUIDE.md
└── SCRIPTING_GUIDE.md
```

## Run locally

### Frontend only
```bash
python -m http.server 8000
# open http://localhost:8000
```

### With PHP backend (recommended for admin panel and server config)
```bash
php -S localhost:8000
# open http://localhost:8000
```

### Queue API for remote turn-based control
When running with PHP, `/api/queue.php` provides a server-authoritative queue with:
- Atomic updates via file locking (`flock`) for concurrent users
- Automatic purge of timed-out queued users
- Automatic expiry/rotation of active turns
- Deterministic next-player promotion

Basic usage:
```bash
# Join queue
curl -X POST -d 'action=join&userId=user123&name=Player%201' http://localhost:8000/api/queue.php

# Keepalive heartbeat (queued or active users)
curl -X POST -d 'action=heartbeat&userId=user123' http://localhost:8000/api/queue.php

# Complete turn and promote next player
curl -X POST -d 'action=complete&userId=user123' http://localhost:8000/api/queue.php

# Read shared queue/turn state for all clients/watchers
curl 'http://localhost:8000/api/queue.php?action=status'
```

## Documentation map

- `DEVELOPER_GUIDE.md` — authoritative guide for adding apps, features, plugins, and script-driven experiences
- `SCRIPTING_GUIDE.md` — RetroScript language, runtime, events, and patterns
- `docs/TERMINAL_SCRIPTING.md` — terminal-specific scripting built-ins and workflows
- `plugins/features/dvd-bouncer/README.md` — concrete plugin example

## Adding new capabilities quickly

### Add an app
1. Create `apps/MyApp.js` extending `AppBase`
2. Register it in `apps/AppRegistry.js`
3. Add styling in `styles/apps/my-app.css` and import it from `styles/main.css` when needed

### Add a feature
1. Create a class extending `FeatureBase`
2. Register via `FeatureRegistry.register(...)` in boot flow or via plugin
3. Define settings metadata if you want runtime configuration UI

### Add a plugin
1. Create `plugins/features/my-plugin/`
2. Add manifest `index.js` exporting `{ id, features, apps?, onLoad?, onUnload? }`
3. Add plugin path to config (`config/defaults.json` plugin list) or manifest source

### Add RetroScript automation / “script apps”
1. Create a `.retro` script under a virtual path (e.g. `C:/Scripts`) or repo root for autoexec
2. Use events (`on ...`), built-ins (`launch`, `emit`, `read`, `write`, `terminal*`) and command bus integrations
3. Launch from Script Runner, terminal (`retro <path>`), or autoexec

## Notes on current state

- The project is dependency-light and buildless (native ES modules).
- The PHP backend is optional; frontend works without it using defaults/fallbacks.
- Plugin loading currently uses a config-driven manifest generated during boot.
- RetroScript and app/plugin systems are fully integrated through event + command layers.
