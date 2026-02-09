# IlluminatOS!

<div align="center">

**A Retro Operating System Simulator**

*Version 95.0*

[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-f7df1e?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen?style=flat-square)](https://github.com/morroware/RetrOS)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Features](#features) | [Installation](#installation) | [Usage](#usage) | [Applications](#applications) | [Plugin System](#plugin-system) | [Scripting](#scripting) | [Architecture](#architecture)

</div>

---

## Overview

IlluminatOS! is a fully-functional retro desktop environment simulator built entirely with vanilla JavaScript, HTML5, and CSS3. Experience nostalgic computing right in your web browser, complete with draggable windows, classic applications, retro games, a virtual file system, and plenty of hidden surprises.

This project demonstrates advanced JavaScript patterns, event-driven architecture, and sophisticated UI/UX implementation—all without any external frameworks or dependencies.

**Project Stats:**
- **~59,000+ lines of JavaScript** across 127+ files
- **~5,300+ lines of modular CSS** across 37 files
- **31 fully-functional applications**
- **200+ semantic events** for complete system observability
- **15 core system modules** powering the OS
- **Extensible plugin system** with example plugins
- **Full scripting support** via RetroScript language with autoexec support
- **Zero external dependencies** - pure vanilla JavaScript

---

## Features

### Desktop Environment
- **Authentic Retro Interface** - Classic desktop recreation with attention to detail
- **Draggable & Resizable Windows** - Full window management with minimize, maximize, and close
- **Desktop Icons** - Drag to reposition, double-click to launch, right-click for context menus
- **Selection Box** - Click and drag to multi-select desktop icons
- **Start Menu** - Fully functional start menu with 7 categories and submenus
- **Taskbar** - Window buttons, quick launch area, and system tray with live clock
- **Context Menus** - Right-click anywhere for contextual options
- **CRT Effect** - Optional retro scanline overlay for that authentic monitor feel
- **Custom Dialogs** - Retro-style alert, confirm, and prompt dialogs
- **Window Snapping** - Drag windows to screen edges for snap preview

### Virtual File System
- **Multi-Drive Support** - C: (Local Disk), D: (CD-ROM), A: (Floppy)
- **Full Directory Structure** - System folders with default files
- **File Operations** - Create, read, edit, delete, move, copy, and rename files
- **Persistent Storage** - Files saved to localStorage persist across sessions
- **File Type Support** - Text files (.txt), images (.png), shortcuts (.lnk), executables, scripts (.retro)
- **File Associations** - Notepad opens .txt files, Paint opens .png files automatically

### Technical Features
- **Zero Dependencies** - 100% vanilla JavaScript with ES6+ modules
- **LocalStorage Persistence** - Settings, files, and high scores are saved
- **Web Audio API** - Synthesized sound effects
- **Responsive Windows** - Apps resize properly when windows are resized
- **Touch Support** - Mobile and tablet compatible
- **Modular Architecture** - Clean, maintainable codebase with separation of concerns

### Event System & Scripting
- **200+ Semantic Events** - Everything that happens in the OS is an event
- **Event Validation** - Schema-based payload validation
- **Priority System** - Control handler execution order
- **Request/Response Pattern** - Async operations with promises
- **Event Channels** - Scoped communication between components
- **Throttling/Debouncing** - Rate-limit high-frequency events
- **Pattern Matching** - Subscribe with wildcards (e.g., `window:*`)
- **SystemMonitor** - Tracks all input, activity, and performance events
- **RetroScript Language** - Full scripting support for automation
- **Autoexec Support** - Startup scripts run automatically on boot

---

## Installation

### Quick Start (No Build Required)

IlluminatOS! requires no build process, package installation, or compilation. Simply:

1. **Clone the repository**
   ```bash
   git clone https://github.com/morroware/RetrOS.git
   cd RetrOS
   ```

2. **Open in browser**

   Option A - Local HTTP server (recommended):
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx http-server

   # Using PHP
   php -S localhost:8000
   ```
   Then navigate to `http://localhost:8000`

   Option B - Direct file access:
   ```bash
   # Simply open index.html in your browser
   open index.html        # macOS
   xdg-open index.html    # Linux
   ```

### Browser Requirements

| Browser | Minimum Version |
|---------|-----------------|
| Chrome  | 61+             |
| Firefox | 60+             |
| Safari  | 11+             |
| Edge    | 79+             |

**Required Browser APIs:**
- ES6 Modules
- Canvas 2D
- Web Audio API
- LocalStorage
- CSS Grid/Flexbox
- ResizeObserver

---

## Usage

### Boot Sequence

When you first load IlluminatOS!, you'll experience an authentic boot sequence:
1. BIOS-style startup screen
2. Loading bar animation with tips
3. System initialization messages
4. Desktop loads with icons
5. Autoexec script runs (if present)
6. Welcome dialog with tips (first visit only)

### Desktop Navigation

| Action | Result |
|--------|--------|
| Double-click icon | Launch application |
| Single-click icon | Select icon |
| Drag icon | Reposition on desktop |
| Click + drag on desktop | Selection box for multiple icons |
| Right-click desktop | Open context menu |
| Right-click icon | Icon-specific options |
| Click Start button | Open Start Menu |
| Click taskbar window | Focus/restore window |

### Window Controls

| Button | Function |
|--------|----------|
| `_` | Minimize to taskbar |
| `[]` | Maximize/Restore |
| `X` | Close window |
| Title bar drag | Move window |
| Edge/corner drag | Resize window (8 directions) |

### Keyboard Shortcuts

| Shortcut | Application | Action |
|----------|-------------|--------|
| `Ctrl+R` | Global | Open Run dialog |
| `Ctrl+S` | Notepad/Paint | Save file |
| `0-9`, `+-*/` | Calculator | Input |
| `Enter` | Calculator | Calculate |
| `Escape` | Calculator | Clear |
| `Arrow Keys` | Snake/SkiFree | Move |
| `WASD` | Snake | Move (alt) |
| `Arrow Keys` | Terminal | Command history |
| `Space` | SkiFree | Start/Restart |
| `F` | SkiFree | Speed boost |
| `P` | SkiFree | Pause |

---

## Applications

IlluminatOS! includes 31 fully-functional applications organized into categories:

### Productivity (6 apps)

| App | Description |
|-----|-------------|
| **Notepad** | Text editor with file system integration (New, Open, Save, Save As, Download) |
| **Calculator** | Full arithmetic operations with keyboard support, multiple instances |
| **Paint** | Drawing application with brush, eraser, bucket fill, color picker, and file save/load |
| **Calendar** | Monthly calendar with date selection and navigation |
| **Clock** | Analog clock display with timezone support |
| **HyperCard** | Stack-based information system for creating interactive content |

### System Applications (7 apps)

| App | Description |
|-----|-------------|
| **My Computer** | File explorer with grid/list views and drag-and-drop |
| **Control Panel** | System settings for display, sound, desktop pet, and screensaver |
| **Display Properties** | Display settings with Background, Screensaver, Appearance, and Effects tabs |
| **Sound Settings** | Audio control panel |
| **Features Settings** | Configure and manage system features and plugins |
| **Admin Panel** | Advanced administration for icons, security, achievements, and diagnostics |
| **Recycle Bin** | View, restore, or permanently delete removed items |

### Games (8 apps)

| App | Description |
|-----|-------------|
| **Snake** | Classic snake game with high score tracking and increasing difficulty |
| **Minesweeper** | Complete implementation with timer, mine counter, and first-click safety |
| **Asteroids** | Space shooter with smooth physics, particle effects, and 60 FPS gameplay |
| **Solitaire** | Klondike card game with drag-and-drop and move counter |
| **FreeCell** | Card game variant with 8 foundation piles |
| **SkiFree** | Classic skiing game with obstacles - watch out for the Yeti! |
| **DOOM** | Classic 1993 FPS via WebAssembly (Chocolate Doom port) |
| **Zork** | Classic text adventure game - explore the Great Underground Empire |

### Multimedia (2 apps)

| App | Description |
|-----|-------------|
| **Winamp** | Legendary music player with visualizer, playlist, 8-band EQ, shuffle/repeat |
| **Media Player** | Audio/video player |

### Internet & Communication (2 apps)

| App | Description |
|-----|-------------|
| **Internet Explorer** | Web browser with bookmarks, history, and address bar |
| **Chat Room** | 90s AOL/IRC style chat room simulator with bot users |

### Utilities (6 apps)

| App | Description |
|-----|-------------|
| **Terminal** | Command line with 30+ commands |
| **Disk Defragmenter** | Classic satisfying block-moving defrag visualization |
| **Task Manager** | Process viewer and management |
| **Find Files** | File search utility across the virtual file system |
| **Help System** | Built-in help documentation |
| **Script Runner** | Execute and test RetroScript automation scripts |

---

### Application Details

#### Terminal

A command-line interface with extensive command set.

**Core Commands:**

| Command | Description |
|---------|-------------|
| `help` | Display available commands |
| `dir` / `ls` | List directory contents |
| `cd <path>` | Change directory |
| `cat <file>` | Display file contents |
| `cls` / `clear` | Clear screen |
| `echo <text>` | Print text |
| `date` | Display current date |
| `time` | Display current time |
| `ver` | Show system version |
| `exit` | Close terminal |

**File System Commands:**

| Command | Description |
|---------|-------------|
| `tree` | Display directory tree |
| `type <file>` | Display file contents |
| `mkdir <name>` | Create directory |
| `del <file>` | Delete file |
| `copy <src> <dst>` | Copy file |
| `move <src> <dst>` | Move file |
| `find <text>` | Search for text |
| `ping <host>` | Simulate network ping |
| `run <script.retro>` | Execute a RetroScript file |

**Fun Commands:**

| Command | Description |
|---------|-------------|
| `matrix` | Enter the Matrix |
| `disco` | Start disco mode |
| `zork` | Play text adventure |
| `bsod` | Blue Screen of Death |
| `fortune` | Random fortune |
| `cowsay <text>` | ASCII cow says text |

#### Winamp

The legendary MP3 player clone - it really whips the llama's ass!

**Features:**
- Classic Winamp skin with LCD display
- Real-time audio visualizer
- 8-track playlist with synthesized music
- Volume and balance sliders
- 8-band EQ display
- Shuffle and repeat modes
- Play, pause, stop, next, previous controls

#### Chat Room

Experience the golden age of internet chat with this retro chat room simulator!

**Commands:**
- `/me [action]` - Perform an action
- `/nick [name]` - Change your screen name
- `/clear` - Clear the chat window
- `/users` - List users in the room
- `/help` - Show available commands

---

## Scripting

IlluminatOS! includes a powerful scripting system called **RetroScript** for automation and creating interactive experiences.

### Running Scripts

Scripts can be run from:
1. **Script Runner app** - Open via Start Menu > Programs > Script Runner
2. **Terminal** - Use the `run` command with a `.retro` file path
3. **Double-click** - `.retro` files on the desktop or in file explorer
4. **Autoexec** - Place `autoexec.retro` in specific locations for automatic execution on boot

### Autoexec Scripts

Autoexec scripts run automatically when the system boots. The system checks these locations in order:

1. **`./autoexec.retro`** - Project root directory (checked first via HTTP)
2. **`C:/Windows/autoexec.retro`** - System-level startup
3. **`C:/Scripts/autoexec.retro`** - User scripts folder
4. **`C:/Users/User/autoexec.retro`** - User home folder

Only the first found script is executed.

**Example autoexec.retro:**
```retro
# System startup script
print "Welcome to IlluminatOS!"

# Create directories
mkdir "C:/Users/User/Desktop/MyFolder"

# Launch an app on startup
launch calculator

# Play startup sound
play notify

# Display notification
notify "System ready!"
```

### RetroScript Quick Reference

```retro
# Variables
set $name = "Alice"
set $count = 0
set $items = [1, 2, 3]

# Arithmetic
set $result = 5 + 3 * 2

# Control flow
if $count > 5 then {
    print "High count"
} else {
    print "Low count"
}

# Loops
loop 10 {
    print "Iteration: $i"
}

# Functions
def greet($name) {
    print "Hello, " + $name
}
call greet "World"

# Event handlers
on window:open {
    print "Window opened!"
}

# File operations
write "Hello" to "C:/file.txt"
read "C:/file.txt" into $content

# System commands
launch notepad
wait 1000
close notepad

# Dialogs
emit dialog:alert message="It works!" title="Success"
```

See [SCRIPTING_GUIDE.md](SCRIPTING_GUIDE.md) for complete documentation.

---

## Special Features

### Clippy Assistant

The iconic Clippy assistant makes an appearance! Clippy randomly spawns when you boot up and offers "helpful" advice.

**Clippy's Personality:**
- Offers random tips and commentary
- Becomes progressively annoyed if dismissed repeatedly
- Eventually gives up entirely if you keep dismissing him

### Desktop Pet

An animated companion that walks across your desktop.

**Activation:**
- Enter the Konami Code, or
- Enable via Control Panel > Desktop Pet

**Available Pets:**
| Pet | Emoji |
|-----|-------|
| Dog | 🐕 |
| Cat | 🐈 |
| Rabbit | 🐇 |
| Hamster | 🐹 |
| Fox | 🦊 |
| Raccoon | 🦝 |
| Squirrel | 🐿️ |
| Hedgehog | 🦔 |

**Features:**
- Walks continuously across the screen
- Click for random fortune cookie messages
- Customizable in Control Panel

### Screensaver

Activates after configurable inactivity period (1, 3, 5, 10 minutes, or never). Configure via Control Panel or Display Properties.

### Achievement System

Unlock achievements by performing various actions:

| Achievement | How to Unlock |
|-------------|---------------|
| First Boot | Launch IlluminatOS! for the first time |
| Konami Master | Enter the Konami Code |
| Disco Fever | Click the clock 10 times |
| Multitasker | Open 10+ windows simultaneously |
| Clippy Hater | Dismiss Clippy 5 times |
| Neo | Enter Matrix mode in Terminal |

Achievements persist between sessions and display as toast notifications when unlocked.

### DVD Bouncer Screensaver

A nostalgic bouncing DVD logo screensaver plugin!

**Features:**
- Classic bouncing DVD logo animation
- Color changes on every wall bounce
- Corner hit tracking with celebration messages
- Configurable speed, size, and idle timeout
- Auto-start after period of inactivity

**Configuration (Settings > Features > DVD Bouncer):**
| Setting | Range | Description |
|---------|-------|-------------|
| Bounce Speed | 1-10 | How fast the logo bounces |
| Logo Size | 40-200px | Size of the DVD logo |
| Idle Timeout | 10-300s | Seconds before auto-start |
| Auto-start | On/Off | Enable idle activation |

---

## Easter Eggs

IlluminatOS! contains several hidden features and easter eggs. Here's how to discover them:

### Konami Code

Enter the famous Konami Code to unlock a special surprise:
```
↑ ↑ ↓ ↓ ← → ← → B A
```
**Reward:** Celebration animation + unlocks Desktop Pet

### Rosebud Cheat

Type `rosebud` anywhere to gain admin access (SimCity/The Sims reference).

### Terminal Secrets

Enter these commands in the Terminal:

| Command | Effect |
|---------|--------|
| `matrix` | Green "digital rain" effect from The Matrix |
| `disco` | Colorful disco mode |
| `zork` | Play the classic text adventure |
| `bsod` | Trigger a Blue Screen of Death |

### Hidden Files

Explore the file system to find secret files:
- `C:/Users/User/Secret/aperture.log` - Portal reference
- `C:/Users/User/Secret/hal9000.txt` - 2001: A Space Odyssey reference

### Clock Easter Egg

Click the taskbar clock **10 times** to trigger Disco Fever mode and unlock an achievement.

---

## Plugin System

IlluminatOS! features a powerful plugin system for extending functionality without modifying core code.

### Architecture

```
plugins/
├── features/                    # Feature plugins
│   ├── dvd-bouncer/            # DVD Bouncer screensaver
│   │   ├── index.js            # Plugin manifest
│   │   ├── DVDBouncerFeature.js # Feature implementation
│   │   └── README.md           # Documentation
│   └── example-plugin/         # Example template
└── apps/                        # App plugins (future)
```

### Creating Plugins

Plugins can provide new features, apps, and integrate with existing systems:

1. **Create a feature class** extending `FeatureBase`
2. **Create a plugin manifest** with metadata and exports
3. **Register in boot sequence** via `PluginLoader`

See the [Developer Guide](DEVELOPER_GUIDE.md#plugin-system) for comprehensive documentation.

### Plugin Features

| Capability | Description |
|------------|-------------|
| **FeatureBase** | Base class with lifecycle hooks, config management, event helpers |
| **FeatureRegistry** | Central registry with dependency resolution |
| **PluginLoader** | Dynamic loading from manifest |
| **Settings UI** | Auto-generated settings from feature definitions |
| **Event Integration** | Emit/subscribe to system events |
| **Auto-cleanup** | Handlers automatically cleaned on disable |

### Example: Feature Plugin

```javascript
// plugins/features/my-plugin/MyFeature.js
import FeatureBase from '../../../core/FeatureBase.js';

class MyFeature extends FeatureBase {
    constructor() {
        super({
            id: 'my-feature',
            name: 'My Feature',
            category: 'plugin',
            config: { speed: 2, enabled: true },
            settings: [
                { key: 'speed', label: 'Speed', type: 'number', min: 1, max: 10 },
                { key: 'enabled', label: 'Enabled', type: 'checkbox' }
            ]
        });
    }

    async initialize() {
        this.subscribe('window:open', () => this.onWindowOpen());
        this.addHandler(document, 'mousemove', () => this.onUserActivity());
    }

    async enable() { /* Enable at runtime */ }
    async disable() { /* Disable at runtime */ }
}
```

---

## System Dialogs

IlluminatOS! features authentic retro-style dialog boxes that replace browser modals.

### Run Dialog
- Open with **Ctrl+R** or from Start Menu
- Type application names (notepad, calc, cmd, paint, etc.)
- Enter URLs to open in browser
- Click Browse to open My Computer

### Shutdown Dialog
- Access from Start Menu > Shut Down
- **Shut down** - Shows "It's now safe to turn off your computer"
- **Restart** - Reloads the page
- **Log off** - Clears session and shows welcome

### File Dialogs
- Retro-style Open and Save As dialogs
- Browse virtual file system
- Navigate folders, create new folders
- Filter by file type

---

## Architecture

### Project Structure

```
IlluminatOS!/
├── index.html              # Main entry point with boot screen and UI
├── index.js                # Boot sequence & system initialization
├── autoexec.retro          # Optional startup script
│
├── styles/                 # Modular CSS architecture (~5300 lines, 37 files)
│   ├── main.css            # Entry point that imports all modules
│   ├── core/               # Base styles and CSS variables
│   ├── apps/               # App-specific styles
│   ├── components/         # Reusable UI components
│   ├── features/           # Feature styles
│   ├── layout/             # Layout components
│   ├── effects/            # Animations and color schemes
│   └── utilities/          # Helper utilities
│
├── apps/                   # Application implementations (31 apps)
│   ├── AppBase.js          # Base class for all apps
│   ├── AppRegistry.js      # Central app registry & launcher
│   └── [App].js            # Individual app implementations
│
├── core/                   # Core system modules (15 modules)
│   ├── SemanticEventBus.js # Event bus with validation, priorities
│   ├── EventSchema.js      # 200+ event definitions
│   ├── SystemMonitor.js    # System monitoring
│   ├── StateManager.js     # Centralized state management
│   ├── WindowManager.js    # Window lifecycle & operations
│   ├── StorageManager.js   # LocalStorage abstraction
│   ├── FileSystemManager.js # Virtual file system
│   ├── IconSystem.js       # FontAwesome + emoji icons
│   ├── Constants.js        # Centralized configuration
│   ├── PluginLoader.js     # Plugin loading & management
│   ├── FeatureRegistry.js  # Feature registration & lifecycle
│   ├── FeatureBase.js      # Base class for features
│   ├── ScriptEngine.js     # Scripting engine for automation
│   ├── CommandBus.js       # Command execution layer
│   └── script/             # Modular script engine
│       ├── AutoexecLoader.js # Autoexec file loader
│       ├── lexer/          # Tokenizer
│       ├── parser/         # Recursive descent parser
│       ├── interpreter/    # AST visitor & executor
│       ├── builtins/       # Built-in functions (9 modules)
│       └── errors/         # Error types
│
├── features/               # Core system features (7 modules)
│   ├── ClippyAssistant.js  # Clippy helper popup
│   ├── DesktopPet.js       # Desktop pet companion
│   ├── Screensaver.js      # Screensaver module
│   ├── EasterEggs.js       # Hidden triggers
│   ├── AchievementSystem.js # Achievement tracking
│   ├── SoundSystem.js      # Web Audio sound effects
│   ├── SystemDialogs.js    # Retro-style dialogs
│   └── config.json         # Feature configuration
│
├── plugins/                # Third-party plugins
│   └── features/           # Feature plugins
│       ├── dvd-bouncer/    # DVD Bouncer screensaver
│       └── example-plugin/ # Example template
│
└── ui/                     # UI rendering components (4 renderers)
    ├── DesktopRenderer.js  # Desktop icons
    ├── TaskbarRenderer.js  # Taskbar & system tray
    ├── StartMenuRenderer.js # Start menu
    └── ContextMenuRenderer.js # Right-click menus
```

### Design Patterns

**Event-Driven Architecture**
```javascript
import EventBus, { Events, Priority } from './core/SemanticEventBus.js';

// Subscribe with priority control
EventBus.on(Events.WINDOW_OPEN, (payload) => {
    console.log(`Window opened: ${payload.id}`);
}, { priority: Priority.NORMAL });

// Pattern matching (wildcards)
EventBus.on('window:*', handler);  // All window events

// Request/response for async operations
const result = await EventBus.request('dialog:confirm', { message: 'OK?' });
```

**Base Class Pattern**
```javascript
// Consistent app interface with multi-instance support
class MyApp extends AppBase {
    onOpen() { return '<div>App content</div>'; }
    onMount() { /* setup event listeners */ }
    onClose() { /* cleanup */ }
}
```

### Data Flow

```
User Action
    ↓
UI Renderer (captures event)
    ↓
EventBus (broadcasts event)
    ↓
Handlers (process event)
    ↓
StateManager (updates state)
    ↓
StorageManager (persists to localStorage)
    ↓
Subscribers (react to state changes)
    ↓
UI Updates
```

### Key Technologies

| Category | Technology |
|----------|------------|
| Language | JavaScript ES6+ (classes, modules, async/await) |
| Markup | HTML5 |
| Styling | CSS3 (Grid, Flexbox, Variables, Animations) |
| Graphics | HTML5 Canvas 2D API |
| Audio | Web Audio API |
| Storage | LocalStorage |
| Icons | FontAwesome 6.5.1 (with emoji fallback) |
| Fonts | VT323 (Google Fonts) for retro terminal feel |
| Build | None required (native ES modules) |

---

## Configuration

### Settings

Settings are stored in localStorage and can be modified via Control Panel:

| Setting | Default | Description |
|---------|---------|-------------|
| `sound` | `false` | Enable/disable sound effects |
| `crtEffect` | `true` | Enable/disable CRT scanline overlay |
| `pet.enabled` | `false` | Show/hide desktop pet |
| `pet.type` | `🐕` | Current pet emoji |
| `screensaverDelay` | `300000` | Screensaver delay (ms) |

### LocalStorage Keys

IlluminatOS! uses the prefix `smos_` for all stored data:

| Key | Purpose |
|-----|---------|
| `smos_desktopIcons` | Icon positions |
| `smos_achievements` | Unlocked achievements |
| `smos_snakeHigh` | Snake high score |
| `smos_soundEnabled` | Sound preference |
| `smos_crtEnabled` | CRT effect preference |
| `smos_petEnabled` | Pet visibility |
| `smos_currentPet` | Selected pet type |
| `smos_fileSystem` | Virtual file system data |
| `smos_recycledItems` | Recycle bin contents |
| `smos_adminPassword` | Admin panel password |

### Clearing Data

To reset IlluminatOS! to default state:

```javascript
// In browser console
Object.keys(localStorage)
    .filter(key => key.startsWith('smos_'))
    .forEach(key => localStorage.removeItem(key));
location.reload();
```

Or use the Terminal:
```
reset --factory
```

Or use Control Panel > Advanced > Reset

---

## Event System

IlluminatOS! features a comprehensive event system with 200+ semantic events organized into namespaces.

### Event Namespaces

| Namespace | Events | Description |
|-----------|--------|-------------|
| `window` | 18 | Window lifecycle (create, open, close, focus, resize, move, snap) |
| `app` | 12 | App lifecycle (launch, ready, close, focus, blur, state, messaging) |
| `system` | 18 | System events (boot, ready, idle, sleep, wake, network, fullscreen) |
| `mouse` | 10 | Mouse input (move, click, dblclick, down, up, scroll, contextmenu) |
| `keyboard` | 5 | Keyboard input (keydown, keyup, combo, shortcut, input) |
| `touch` | 4 | Touch input (start, move, end, cancel) |
| `gesture` | 6 | Gesture detection (tap, doubletap, swipe, pinch, rotate, longpress) |
| `fs` | 12 | File system (create, read, update, delete, rename, move, copy) |
| `feature` | 5 | Feature lifecycle (initialize, ready, enable, disable, config) |
| `script` | 10 | Script execution (start, statement, complete, error, output) |
| `audio` | 8 | Audio playback (play, pause, resume, stop, ended, error) |
| `dialog` | 8 | System dialogs (alert, confirm, prompt, file dialogs) |

See [SEMANTIC_EVENTS.md](SEMANTIC_EVENTS.md) for complete documentation.

### Quick Example

```javascript
import EventBus, { Events, Priority } from './core/SemanticEventBus.js';

// Listen to all file system events
EventBus.on('fs:*', (payload, metadata) => {
    console.log(`File operation: ${metadata.name}`, payload);
});

// Wait for an event
const { payload } = await EventBus.waitFor(Events.SYSTEM_READY);
```

---

## Development

For detailed information on creating new applications, see the [Developer Guide](DEVELOPER_GUIDE.md).

### Quick Start: Adding New Applications

1. Create a new file in `/apps/`:

```javascript
// apps/MyApp.js
import AppBase from './AppBase.js';

class MyApp extends AppBase {
    constructor() {
        super({
            id: 'myapp',
            name: 'My Application',
            icon: 'fa-solid fa-star',
            width: 400,
            height: 300,
            resizable: true,
            singleton: false,
            category: 'accessories'
        });
    }

    onOpen() {
        return `<div class="myapp-container"><h1>Hello World!</h1></div>`;
    }

    onMount() {
        // Setup event listeners after DOM is ready
    }

    onClose() {
        // Cleanup when window closes
    }
}

export default MyApp;
```

2. Register in `AppRegistry.js`:

```javascript
import MyApp from './MyApp.js';
AppRegistry.register(new MyApp(), { category: 'accessories' });
```

---

## Browser Compatibility

### Tested Browsers

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 90+ | Full Support | Recommended |
| Firefox 88+ | Full Support | |
| Safari 14+ | Full Support | |
| Edge 90+ | Full Support | |
| Opera 76+ | Full Support | |

### Required Features

- ES6 Modules (`<script type="module">`)
- CSS Custom Properties (CSS Variables)
- LocalStorage API
- Canvas 2D Context
- Web Audio API (for sounds)
- Pointer Events
- ResizeObserver API

---

## Credits

- **DOOM Port:** Chocolate Doom WebAssembly
- **Icons:** FontAwesome 6.5.1
- **Font:** VT323 (Google Fonts)
- **Clippy:** The classic Office Assistant (RIP)

---

## License

This project is available under the MIT License. See [LICENSE](LICENSE) for details.

---

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">

**Built with nostalgia and JavaScript**

*"It looks like you're reading a README. Would you like help?"* - Clippy

</div>
