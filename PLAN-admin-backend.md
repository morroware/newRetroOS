# Admin Backend Plan for IlluminatOS!

## Problem Statement

Every configurable value in IlluminatOS! is currently hardcoded across 20+ JavaScript files. A web admin has no way to customize branding, default desktop icons, filesystem content, feature behavior, or UI text without editing source code. We need a PHP-backed admin panel that externalizes these into a single config, served to the frontend at boot time.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    Browser (Client)                   │
│                                                      │
│  index.html ──► boot ──► fetch /api/config.php       │
│                              │                       │
│                    ┌─────────▼──────────┐            │
│                    │  window.__OS_CONFIG │            │
│                    └─────────┬──────────┘            │
│                              │                       │
│         ┌────────────────────┼────────────────┐      │
│         ▼                    ▼                ▼      │
│   StateManager         Constants        Features     │
│   (default icons,      (branding,       (clippy,     │
│    settings)            paths, UI)       pets, etc.)  │
│                                                      │
│  localStorage still owns per-USER state (positions,  │
│  achievements, saved files, etc.)                    │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                   Server (PHP)                        │
│                                                      │
│  /admin/index.php ──► Admin Panel SPA                │
│  /api/config.php  ──► Serves merged config JSON      │
│  /api/save.php    ──► Saves admin edits              │
│  /config/                                            │
│    ├── defaults.json   (ships with repo, read-only)  │
│    └── overrides.json  (admin edits, gitignored)     │
└──────────────────────────────────────────────────────┘
```

### Key Principle: Two-Layer Config

- **`defaults.json`** — Ships in the repo. Contains every configurable value with sensible defaults matching current behavior. Never edited by the admin panel. Acts as documentation and fallback.
- **`overrides.json`** — Created/edited by the admin panel. Only contains keys the admin has explicitly changed. Gitignored so deployments don't clobber admin customizations.
- **`/api/config.php`** — Deep-merges `defaults.json` + `overrides.json` and serves the result as JSON. The frontend fetches this once at boot.

### What Stays Client-Side (Not Touched)

- **User localStorage**: Icon positions, saved files, achievements, CRT/sound preferences, filesystem modifications — all per-user state remains in localStorage exactly as-is.
- **App logic**: No app behavior changes. Apps still extend AppBase, features still extend FeatureBase.
- **Plugin system**: PluginLoader still works as-is. The config just controls which plugins are enabled by default.

---

## Config Schema

The config JSON is organized into logical sections. Below is the full schema with every value that gets externalized.

### Section 1: `branding`
Currently scattered across index.html, Terminal.js, StartMenuRenderer.js, Screensaver.js, SystemDialogs.js.

```json
{
  "branding": {
    "osName": "IlluminatOS!",
    "version": "95.0",
    "buildNumber": "1995",
    "versionString": "Version 95.0 - Modular Edition",
    "sidebarText": "IlluminatOS!",
    "bootMessage": "Starting Windows 95...",
    "screensaverText": "IlluminatOS! - The Nostalgia Machine",
    "bsodTitle": "IlluminatOS!",
    "terminalBanner": "IlluminatOS! [Version 95.0.1995]",
    "biosVersion": "IlluminatOS BIOS v2.1",
    "shutdownMessage": "It is now safe to turn off your computer.",
    "aboutText": "Version 95.0 Build 1995"
  }
}
```

### Section 2: `bootTips`
Currently in index.js lines 44-51.

```json
{
  "bootTips": [
    "Loading your personalized experience...",
    "Initializing desktop icons...",
    "Starting Windows Manager...",
    "Loading system tray...",
    "Preparing applications...",
    "Almost ready..."
  ]
}
```

### Section 3: `desktopIcons`
Currently DEFAULT_ICONS in StateManager.js lines 17-26. These are the icons shown on first load (before the user has any localStorage).

```json
{
  "desktopIcons": [
    { "id": "mycomputer", "label": "My Computer", "emoji": "💻", "type": "app" },
    { "id": "recyclebin", "label": "Recycle Bin", "emoji": "🗑️", "type": "app" },
    { "id": "terminal", "label": "Terminal", "emoji": "📟", "type": "app" },
    { "id": "ciphers", "label": "Cipher Decoder", "emoji": "🔍", "type": "link", "url": "https://sethmorrow.com/ciphers" },
    { "id": "music", "label": "Music", "emoji": "🎵", "type": "link", "url": "https://sethmorrow.com/music" },
    { "id": "videos", "label": "Videos", "emoji": "📺", "type": "link", "url": "https://sethmorrow.com/videos" },
    { "id": "books", "label": "Books", "emoji": "📚", "type": "link", "url": "https://sethmorrow.com/books" },
    { "id": "audiobooks", "label": "Audiobooks", "emoji": "🎧", "type": "link", "url": "https://sethmorrow.com/audiobooks" }
  ]
}
```

### Section 4: `defaults`
Currently in StateManager.js constructor (lines 74-82) and Constants.js.

```json
{
  "defaults": {
    "sound": false,
    "crtEffect": true,
    "petEnabled": false,
    "petType": "neko",
    "screensaverDelay": 300000,
    "desktopBg": "#008080",
    "wallpaper": "space",
    "colorScheme": "slate",
    "userName": "User"
  }
}
```

### Section 5: `quickLaunch`
Currently hardcoded in TaskbarRenderer.js lines 85-89 and index.html lines 82-84.

```json
{
  "quickLaunch": [
    { "type": "app", "appId": "terminal", "icon": "💻", "title": "Terminal" },
    { "type": "app", "appId": "notepad", "icon": "📝", "title": "Notepad" },
    { "type": "link", "url": "https://sethmorrow.com", "icon": "🌀", "title": "Internet" }
  ]
}
```

### Section 6: `wallpapers`
Currently hardcoded in index.js applySettings() lines 318-347.

```json
{
  "wallpapers": {
    "clouds": { "label": "Clouds", "css": "radial-gradient(...)" },
    "tiles": { "label": "Tiles", "css": "repeating-linear-gradient(...)" },
    "waves": { "label": "Waves", "css": "..." },
    "forest": { "label": "Forest", "css": "..." },
    "space": { "label": "Space", "css": "..." }
  }
}
```

### Section 7: `colorSchemes`
Currently hardcoded in index.js applySettings() lines 357-363.

```json
{
  "colorSchemes": {
    "win95": { "label": "Windows 95", "window": "#c0c0c0", "titlebar": "#000080" },
    "highcontrast": { "label": "High Contrast", "window": "#000000", "titlebar": "#800080" },
    "desert": { "label": "Desert", "window": "#d4c4a8", "titlebar": "#8b7355" },
    "ocean": { "label": "Ocean", "window": "#b0c4de", "titlebar": "#003366" },
    "rose": { "label": "Rose", "window": "#e8d0d0", "titlebar": "#8b4560" },
    "slate": { "label": "Slate", "window": "#a0a0b0", "titlebar": "#404050" }
  }
}
```

### Section 8: `features`
Currently hardcoded per-feature in their constructors + features/config.json.

```json
{
  "features": {
    "soundsystem": { "enabled": true, "config": { "masterVolume": 0.5, "enableMp3": true } },
    "achievements": { "enabled": true, "config": { "showToasts": true, "toastDuration": 3000 } },
    "clippy": { "enabled": true, "config": { "appearanceChance": 0.15, "autoHideDelay": 8000 } },
    "desktoppet": { "enabled": false, "config": { "petType": "neko" } },
    "screensaver": { "enabled": true, "config": { "idleTimeout": 300000, "mode": "toasters" } },
    "eastereggs": { "enabled": true, "config": { "enableKonami": true, "enableCheats": true } },
    "dvd-bouncer": { "enabled": true, "config": { "autoStart": false, "speed": 2, "logoSize": 80 } }
  }
}
```

### Section 9: `filesystem`
Currently the 16 hardcoded files in FileSystemManager.js getDefaultFileSystem() (lines 58-298).

```json
{
  "filesystem": {
    "welcomeFile": {
      "path": ["C:", "Users", "User", "Desktop", "Welcome.txt"],
      "content": "Welcome to IlluminatOS!..."
    },
    "documentFiles": [
      { "path": ["C:", "Users", "User", "Documents", "resume.txt"], "content": "..." },
      { "path": ["C:", "Users", "User", "Documents", "ideas.txt"], "content": "..." }
    ],
    "secretFiles": [
      { "path": ["C:", "Users", "User", "Secret", "aperture.log"], "content": "..." },
      { "path": ["C:", "Users", "User", "Secret", "hal9000.txt"], "content": "..." }
    ]
  }
}
```

### Section 10: `apps`
Controls which apps are enabled and visible. Currently all apps are always registered.

```json
{
  "apps": {
    "disabledApps": [],
    "startMenuOverrides": {}
  }
}
```

### Section 11: `plugins`
Currently hardcoded in index.js lines 223-232.

```json
{
  "plugins": [
    { "path": "../plugins/features/dvd-bouncer/index.js", "enabled": true }
  ]
}
```

---

## Implementation Plan — Ordered Steps

### Phase 1: Config Infrastructure (Server-Side)

**Step 1.1: Create directory structure**

```
/admin/
  index.php          ← Admin panel entry point
  auth.php           ← Simple auth check (session-based)
  assets/
    admin.css        ← Admin panel styles (Win95-themed)
    admin.js         ← Admin panel client logic
/api/
  config.php         ← GET: serve merged config JSON
  save.php           ← POST: save overrides
  auth.php           ← POST: login/logout
/config/
  defaults.json      ← Full default config (committed to repo)
  overrides.json     ← Admin changes (gitignored)
  .htaccess          ← Deny direct access to JSON files
```

**Step 1.2: Create `config/defaults.json`**

Extract every hardcoded value identified above into this single JSON file, organized by the schema sections above. This is a manual extraction from the existing source files — no logic changes yet.

**Step 1.3: Create `/api/config.php`**

Simple PHP script that:
1. Reads `config/defaults.json`
2. Reads `config/overrides.json` (if it exists)
3. Deep-merges overrides on top of defaults
4. Returns `Content-Type: application/json` with the result
5. Sets appropriate CORS headers for same-origin
6. Caches the merge result (optional file cache with mtime check)

**Step 1.4: Create `/api/save.php`**

POST endpoint that:
1. Validates admin session (see Step 1.5)
2. Accepts JSON body with a section key and data
3. Reads current `overrides.json`
4. Merges the new section data
5. Writes updated `overrides.json` atomically (write to temp, then rename)
6. Returns success/error JSON

**Step 1.5: Create `/api/auth.php` and `/admin/auth.php`**

Simple session-based auth:
- Admin password stored in `config/admin-credentials.php` (returns array, gitignored)
- Ships with a default that forces password change on first login
- Uses PHP sessions, password_hash/password_verify
- No database needed

---

### Phase 2: Frontend Config Loader

**Step 2.1: Create `core/ConfigLoader.js`**

New module that:
1. Fetches `/api/config.php` at boot (before any other initialization)
2. Stores result in `window.__OS_CONFIG`
3. Exports a `getConfig(path, defaultValue)` helper using dot-notation
4. Falls back gracefully: if the fetch fails (e.g., running without PHP), uses inline defaults so the OS still works as a pure static site

```javascript
// core/ConfigLoader.js
let _config = null;

export async function loadConfig() {
    try {
        const resp = await fetch('/api/config.php');
        if (resp.ok) {
            _config = await resp.json();
        }
    } catch (e) {
        console.warn('[ConfigLoader] No backend config, using inline defaults');
    }
    if (!_config) {
        _config = {}; // Empty = everything falls through to hardcoded defaults
    }
    window.__OS_CONFIG = _config;
    return _config;
}

export function getConfig(path, defaultValue) {
    if (!_config) return defaultValue;
    const value = path.split('.').reduce((obj, key) =>
        obj && obj[key] !== undefined ? obj[key] : undefined, _config);
    return value !== undefined ? value : defaultValue;
}

export default { loadConfig, getConfig };
```

**Step 2.2: Integrate into boot sequence (`index.js`)**

Add config loading as **Phase -1** (before Phase 0), so every subsequent module can use `getConfig()`:

```javascript
// At the very start of initializeOS():
import { loadConfig } from './core/ConfigLoader.js';

// Phase -1: Load server config (or fall back to defaults)
await loadConfig();
```

This is the only change to index.js's control flow. Everything else is value substitutions.

---

### Phase 3: Wire Config into Existing Modules

Each step below replaces a hardcoded value with a `getConfig()` call. The existing hardcoded value becomes the fallback default, so behavior is identical if no backend exists.

**Step 3.1: `core/StateManager.js` — Default icons + settings**

Replace:
```javascript
const DEFAULT_ICONS = [ ... hardcoded ... ];
```
With:
```javascript
import { getConfig } from './ConfigLoader.js';
// In initialize():
const configIcons = getConfig('desktopIcons', null);
const defaultIcons = configIcons
    ? configIcons.map(icon => ({ ...icon }))  // from config
    : [...DEFAULT_ICONS];                      // inline fallback
this.state.icons = savedIcons || arrangeDefaultIcons(defaultIcons);
```

Similarly for default settings (sound, CRT, pet, screensaverDelay):
```javascript
const defaults = getConfig('defaults', {});
this.state.settings.sound = defaults.sound ?? false;
// etc.
```

**Step 3.2: `index.js` — Boot tips, wallpapers, color schemes, branding**

Replace the `BOOT_TIPS` array:
```javascript
const BOOT_TIPS = getConfig('bootTips', [ ...existing fallback... ]);
```

Replace the `WALLPAPER_PATTERNS` and `COLOR_SCHEMES` objects in `applySettings()` with config-loaded versions.

**Step 3.3: `index.html` — Boot screen branding**

This is the one file that can't easily use JS config (it renders before JS loads). Two options:
- **(A) PHP template**: Rename to `index.php` and inject branding server-side: `<?= $config['branding']['osName'] ?>`. Simple, zero-latency.
- **(B) JS patching**: Leave as HTML, patch DOM elements in the boot sequence after config loads. Slight flash of default text.

**Recommendation: Option A** — rename `index.html` → `index.php`. The only PHP in it is 3-4 `<?= ?>` tags for boot screen text. Everything else stays identical. The file is still valid HTML when served statically (PHP tags are ignored if no PHP is running, or we provide a static fallback).

**Step 3.4: `ui/TaskbarRenderer.js` — Quick launch buttons**

Replace hardcoded quick launch buttons with config-driven rendering:
```javascript
const quickLaunch = getConfig('quickLaunch', [
    { type: 'app', appId: 'terminal', icon: '💻', title: 'Terminal' },
    { type: 'app', appId: 'notepad', icon: '📝', title: 'Notepad' },
    { type: 'link', url: 'https://sethmorrow.com', icon: '🌀', title: 'Internet' }
]);
```

**Step 3.5: `ui/StartMenuRenderer.js` — Sidebar text**

```javascript
const sidebarText = getConfig('branding.sidebarText', 'IlluminatOS!');
```

**Step 3.6: `core/FileSystemManager.js` — Default filesystem files**

In `getDefaultFileSystem()`, read file content from config where available:
```javascript
const fsConfig = getConfig('filesystem', {});
const welcomeContent = fsConfig.welcomeFile?.content || '...existing default...';
```

This only affects first-launch content. Returning users keep their localStorage filesystem untouched.

**Step 3.7: Feature defaults**

In `FeatureRegistry.initializeAll()` (or in each feature's constructor), check config:
```javascript
const featureConfig = getConfig(`features.${this.id}`, null);
if (featureConfig) {
    if (featureConfig.config) Object.assign(this.config, featureConfig.config);
    if (featureConfig.enabled === false) this.enabled = false;
}
```

**Step 3.8: Plugin manifest**

In index.js Phase 2.5, read plugin list from config instead of hardcoding:
```javascript
const pluginList = getConfig('plugins', [
    { path: '../plugins/features/dvd-bouncer/index.js', enabled: true }
]);
```

---

### Phase 4: Admin Panel

**Step 4.1: Admin panel authentication page**

Simple login form at `/admin/index.php`. Session-based. Win95-themed to match the OS aesthetic.

**Step 4.2: Admin panel dashboard**

Single-page layout with sidebar navigation matching the config sections:
- Branding
- Desktop Icons
- Default Settings
- Quick Launch
- Wallpapers & Themes
- Features
- Filesystem (default files)
- Plugins

**Step 4.3: Section editors**

Each section gets a purpose-built form:

| Section | Editor Type | Notes |
|---------|------------|-------|
| Branding | Text inputs | OS name, version, messages |
| Boot Tips | Sortable text list | Add/remove/reorder |
| Desktop Icons | Card list with drag | Add/remove icons, set app/link type, URL |
| Default Settings | Toggles + dropdowns | Sound, CRT, pet, screensaver |
| Quick Launch | Card list | Add/remove, app or link type |
| Wallpapers | CSS editor + preview | Name, label, CSS gradient value |
| Color Schemes | Color pickers | Window color, titlebar color per scheme |
| Features | Toggle + config per feature | Uses the settings schema from FeatureBase |
| Filesystem | File tree + text editor | Edit default file contents |
| Plugins | Toggle list | Enable/disable registered plugins |

**Step 4.4: Save and preview flow**

- Each section form has a **Save** button that POSTs to `/api/save.php`
- A **Preview** button opens the OS in a new tab with `?preview=1` query param (loads overrides immediately)
- A **Reset Section** button removes that section from `overrides.json` (reverts to defaults)

---

### Phase 5: Safety and Backwards Compatibility

**Step 5.1: Static fallback guarantee**

The OS MUST continue to work as a static site (no PHP). This is ensured by:
- `getConfig()` always has a hardcoded fallback value as the second argument
- If `/api/config.php` returns 404 or fails, the OS boots with current behavior
- No existing module import chains are broken

**Step 5.2: User state isolation**

Admin config only affects **defaults for new users** (empty localStorage). Existing users keep their state:
- Desktop icon positions → localStorage `desktopIcons` (unchanged)
- File system modifications → localStorage `fileSystem` (unchanged)
- Sound/CRT/pet preferences → localStorage per-key (unchanged)
- Achievements → localStorage `achievements` (unchanged)

The config sets the "factory defaults", not the runtime state.

**Step 5.3: Config versioning**

`defaults.json` includes a `_version` field. If the schema changes in a future update, `config.php` can migrate old `overrides.json` data.

**Step 5.4: Input validation**

`/api/save.php` validates all input:
- Branding strings: max length, no HTML/script injection
- URLs: must be valid HTTP(S)
- Numbers: within expected ranges
- Colors: valid hex format
- CSS: sanitized (wallpaper gradients only, no `url()` or `expression()`)

**Step 5.5: File security**

- `config/.htaccess` denies direct access to JSON files
- `admin-credentials.php` returns a PHP array (not JSON), so it can't be served raw
- Admin panel checks session on every page load
- CSRF token on all POST requests

---

## File Change Summary

### New files to create:
```
config/defaults.json          ← Full config with all current defaults
config/.htaccess              ← Deny direct JSON access
config/admin-credentials.php  ← Default admin password (gitignored template)
api/config.php                ← Serve merged config
api/save.php                  ← Save admin edits
api/auth.php                  ← Login/logout endpoint
admin/index.php               ← Admin panel
admin/auth.php                ← Auth check helper
admin/assets/admin.css        ← Admin styles
admin/assets/admin.js         ← Admin client logic
core/ConfigLoader.js          ← Frontend config loader
.gitignore                    ← Add overrides.json, admin-credentials.php
```

### Existing files to modify:
```
index.html → index.php        ← Add 3-4 PHP tags for boot screen branding
                                 (with static fallback)
index.js                      ← Add Phase -1 config load (3 lines)
                                 Replace BOOT_TIPS, WALLPAPER_PATTERNS,
                                 COLOR_SCHEMES with getConfig() calls
core/StateManager.js           ← Import getConfig, use for DEFAULT_ICONS
                                 and default settings
core/FileSystemManager.js      ← Use getConfig for default file contents
                                 in getDefaultFileSystem()
ui/TaskbarRenderer.js          ← Use getConfig for quick launch buttons
ui/StartMenuRenderer.js        ← Use getConfig for sidebar text
features/Screensaver.js        ← Use getConfig for screensaver text
features/ClippyAssistant.js    ← Use getConfig for Clippy defaults
apps/Terminal.js               ← Use getConfig for branding strings
```

### Files NOT modified:
```
core/EventBus.js               ← No config values
core/WindowManager.js          ← No admin-facing config
core/IconSystem.js             ← No admin-facing config
core/PluginLoader.js           ← Plugin list comes from index.js
core/FeatureBase.js            ← Base class, no hardcoded values
core/FeatureRegistry.js        ← Registry logic, no hardcoded values
apps/AppBase.js                ← Base class, no hardcoded values
apps/*.js (individual apps)    ← App logic stays as-is (except Terminal)
ui/ContextMenuRenderer.js      ← Dynamic menus, no hardcoded config
ui/DesktopRenderer.js          ← Uses Constants.js values (already centralized)
All CSS files                  ← Untouched
All plugin files               ← Untouched
```

---

## Implementation Order (Suggested)

1. **Phase 1** (Server infra) — Create config/, api/, admin/ directories and PHP files
2. **Phase 2** (ConfigLoader) — Create core/ConfigLoader.js, add Phase -1 to boot
3. **Phase 3.1-3.2** (Core wiring) — StateManager + index.js config integration
4. **Phase 3.3** (index.php) — Rename and add branding tags
5. **Phase 3.4-3.5** (UI wiring) — Taskbar + StartMenu config integration
6. **Phase 3.6-3.8** (Features/FS wiring) — FileSystem, features, plugins
7. **Phase 4.1-4.2** (Admin shell) — Auth + dashboard layout
8. **Phase 4.3** (Section editors) — Build each config editor
9. **Phase 4.4** (Save/preview) — Wire up save flow
10. **Phase 5** (Hardening) — Validation, CSRF, testing

Each phase is independently deployable and testable. The OS works at every intermediate step.

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking static-site users | Every `getConfig()` has inline fallback; OS works without PHP |
| Breaking existing user data | Config only affects factory defaults; localStorage untouched |
| Module import order issues | ConfigLoader loaded in Phase -1, before any module reads config |
| index.html → index.php rename | PHP tags use short echo `<?= ?>` with htmlspecialchars; file works as static HTML if PHP not available (tags show as empty) |
| Race condition on config fetch | `loadConfig()` is awaited before initialization proceeds |
| Admin edits breaking OS | Validation in save.php; Reset button per section; defaults.json is read-only fallback |
| Security of admin panel | Session auth, CSRF tokens, input validation, .htaccess on config dir |
