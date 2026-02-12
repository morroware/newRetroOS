# RetroScript Guide (Current Runtime)

RetroScript is IlluminatOS’s built-in automation and interactive scripting language.

This guide reflects the current modular runtime in `core/script/*` and built-in integration with apps, events, terminal, filesystem, dialogs, and startup autoexec.

## Table of contents
1. Runtime model
2. Running scripts
3. Autoexec behavior
4. Language essentials
5. Events and reactive scripting
6. Filesystem scripting
7. App/system control
8. Terminal scripting bridge
9. Creating script-based apps/experiences
10. Reliability and safety tips

---

## 1) Runtime model

Script execution stack:
- **Lexer** (`core/script/lexer`) → tokenizes source
- **Parser** (`core/script/parser`) → builds AST
- **Interpreter** (`core/script/interpreter`) → executes AST
- **Built-ins** (`core/script/builtins`) → expose system capabilities

Built-in modules include:
- math, string, array, object, type, time
- system/dialog/json/debug
- terminal integration

---

## 2) Running scripts

You can run `.retro` scripts via:
1. **Script Runner app**
2. **Terminal** command (`retro <path>` / related aliases)
3. **Double-clicking `.retro` files** in desktop/file explorer flows
4. **Autoexec** startup script

---

## 3) Autoexec behavior

Startup loader: `core/script/AutoexecLoader.js`

Search order (first found is executed):
1. `./autoexec.retro` (repo root via fetch)
2. `C:/Windows/autoexec.retro`
3. `C:/Scripts/autoexec.retro`
4. `C:/Users/User/autoexec.retro`

Use autoexec for:
- boot customization
- initial file deployment
- guided onboarding
- script-driven ARG systems

---

## 4) Language essentials

### Variables and assignment
```retro
set $name = "User"
$count = 3
set $items = ["a", "b"]
set $profile = { role: "admin", active: true }
```

### Control flow
```retro
if $count > 0 then {
  print "positive"
} else {
  print "zero"
}

loop 5 {
  print "tick " + $i
}
```

### Functions
```retro
def greet($who) {
  print "Hello " + $who
}

call greet "Agent"
```

### Errors
```retro
try {
  read "C:/missing.txt" into $content
} catch {
  print "file missing"
}
```

---

## 5) Events and reactive scripting

Reactive handlers make scripts feel like apps:

```retro
on window:open {
  print "Window opened: " + $event.appId
}

on app:notepad:saved {
  notify "Notepad save detected"
}
```

Guidelines:
- Keep handler bodies short and resilient
- Validate `$event` properties before use
- Use namespaced custom events for your own systems

Emit custom events:
```retro
emit myquest:phaseChanged phase=2 label="Unlocked"
```

---

## 6) Filesystem scripting

Core operations:
```retro
mkdir "C:/Users/User/Documents/Quest"
write "hello" to "C:/Users/User/Documents/Quest/note.txt"
read "C:/Users/User/Documents/Quest/note.txt" into $text
```

Use filesystem as player-visible state for narrative or tool automation.

---

## 7) App/system control

Examples:
```retro
launch notepad
wait 500
close notepad

notify "System ready"
play notify

emit dialog:alert title="Done" message="Task complete"
```

Use command/event-oriented control rather than hard-coding UI assumptions.

---

## 8) Terminal scripting bridge

Terminal-specific built-ins are registered in `TerminalBuiltins`.
Common functions:
- `terminalOpen`, `terminalExecute`, `terminalExecuteSequence`
- `terminalPrint`, `terminalClear`, `terminalGetOutput`
- `terminalReadFile`, `terminalWriteFile`, `terminalDir`
- `terminalAlias`, env var helpers, terminal state helpers

See `docs/TERMINAL_SCRIPTING.md` for full terminal workflows.

---

## 9) Creating script-based apps/experiences

A “RetroScript app” can be:
1. A single launchable script users run on demand
2. A startup autoexec flow that installs files + handlers
3. A hybrid where JS app UI emits events consumed by script logic

Suggested pattern:
1. Create root folder in user desktop/documents
2. Write initial content files
3. Register event handlers for progression
4. Emit notifications/dialogs as feedback
5. Persist progress to files so state survives reload

---

## 10) Reliability and safety tips

- Guard all file reads with `try/catch`
- Use `wait` between sequential UI-heavy operations
- Don’t assume a window is open; launch/focus before interacting
- Keep long scripts modular (separate files for content phases)
- Prefer deterministic paths and explicit event names

