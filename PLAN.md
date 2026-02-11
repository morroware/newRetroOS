# Plan: Harden Remaining Issues for Rock-Solid Extensibility

## Overview

7 concrete bugs were already fixed and pushed. This plan addresses the 10 remaining design-level issues identified during the deep-dive review, organized by priority and grouped by subsystem.

---

## 1. ScriptEngine: Allow Concurrent Script Execution

**Problem:** `ScriptEngine` is a singleton with a boolean `isRunning` flag (line 99). If a script is running and something else tries to `ScriptEngine.run()` (e.g., a user clicks "Run" in ScriptRunner while an autoexec script is still going), it gets back `{ success: false, error: 'Script already running' }` with no way to queue or run in parallel.

**Solution:** Replace the singleton execution model with per-invocation Interpreter instances. Each call to `run()` creates its own Interpreter, registers builtins on it, and executes independently. This is safe because each Interpreter has its own Environment (variable scope), event handlers, and user functions.

**Changes in `ScriptEngine.js`:**
- Remove the `isRunning` flag entirely.
- In `run()`, instead of checking `this.isRunning`, create a **new Interpreter instance** for each invocation:
  ```
  const interpreter = new Interpreter({
      limits: this.limits,
      context: this.context,
      onOutput: (message) => this.emitOutput(message),
      onError: (error) => this.emitError(error)
  });
  registerAllBuiltins(interpreter);
  ```
- Execute on that local interpreter instead of `this.interpreter`.
- Keep `this.interpreter` as the "primary" instance for `getVariables()`, `defineFunction()`, and `reset()`.
- The `stop()` method should track active interpreters in a `Set` and call `stop()` on all of them.
- Add a `stopAll()` method and an optional `id` parameter to `stop(id)` for targeted cancellation.

**Why this is safe:** JavaScript is single-threaded. Two scripts can't literally run at the same time. But they CAN be interleaved via `await` (e.g., `wait 1000` yields control). With separate Interpreter instances, their environments are isolated.

---

## 2. Interpreter: Event Handler Closure Environment Fix

**Problem:** In `visitOnStatement` (line 373), the event handler closure uses `closureEnv` captured at registration time. But the handler body executes `this.visitStatement(s)` which uses `this.currentEnv`. If the handler fires while another operation is modifying `this.currentEnv`, the handler's `previousEnv` restore could clobber state.

**Solution:** Each event handler should save/restore the full interpreter state, not just `this.currentEnv`.

**Changes in `Interpreter.js` `visitOnStatement`:**
- The handler function should save/restore full interpreter state:
  ```
  const handler = async (eventData) => {
      const handlerEnv = closureEnv.extend();
      handlerEnv.set('event', eventData);

      // Save full interpreter state
      const savedEnv = this.currentEnv;
      const savedControlFlow = this.controlFlow;
      const savedReturnValue = this.returnValue;

      this.currentEnv = handlerEnv;
      this.controlFlow = ControlFlow.NONE;
      this.returnValue = null;

      try {
          for (const s of stmt.body) {
              await this.visitStatement(s);
              if (this.controlFlow !== ControlFlow.NONE) break;
          }
      } catch (error) {
          this.onError(error.message);
      } finally {
          // Restore full interpreter state
          this.currentEnv = savedEnv;
          this.controlFlow = savedControlFlow;
          this.returnValue = savedReturnValue;
      }
  };
  ```
- This prevents a `return` inside a handler from leaking into the outer script, and prevents environment corruption.

---

## 3. FileSystemManager: Make deleteDirectoryRecursive Emit Events

**Problem:** `deleteDirectoryRecursive` (line 699) walks the tree but does nothing useful. The actual deletion happens at line 686 with `delete children[dirName]`. Meanwhile, apps that have files open in the deleted directory get no notification that their files were removed.

**Solution:** Make the recursive walk emit `FS_FILE_DELETE` and `FS_DIRECTORY_DELETE` events for each child, so the rest of the system can react (e.g., close open editors, update file explorers).

**Changes in `FileSystemManager.js`:**
- Update `deleteDirectoryRecursive` to emit events for every child:
  ```
  deleteDirectoryRecursive(path) {
      const node = this.getNode(path);
      if (!node || !node.children) return;

      for (const [name, item] of Object.entries(node.children)) {
          const itemPath = [...path, name];
          if (item.type === 'directory') {
              this.deleteDirectoryRecursive(itemPath);
              EventBus.emit(Events.FS_DIRECTORY_DELETE, {
                  path: itemPath.join('/'),
                  recursive: true
              });
          } else {
              EventBus.emit(Events.FS_FILE_DELETE, {
                  path: itemPath.join('/')
              });
          }
      }
  }
  ```
- This makes the recursive walk useful and gives the system proper cascading delete notifications.

---

## 4. FileSystemManager: Make syncDesktopIcons / syncInstalledApps Self-Contained

**Problem:** `syncDesktopIcons` (line 1025) and `syncInstalledApps` (line 1074) modify the filesystem tree but don't call `saveFileSystem()`. The caller in `index.js` Phase 1.5 (line 182) has to remember to save. If anyone else calls these methods, the changes are lost on reload.

**Solution:** Have each method call `saveFileSystem()` at the end.

**Changes in `FileSystemManager.js`:**
- Add `this.saveFileSystem()` as the last line of `syncDesktopIcons()` (after the for loop at ~line 1067).
- Add `this.saveFileSystem()` as the last line of `syncInstalledApps()` (after the for loop at ~line 1111).
- Remove the explicit `FileSystemManager.saveFileSystem()` call from `index.js` Phase 1.5 (line 182) since it's now redundant, OR leave it as a harmless safety net.

---

## 5. FileSystemManager: Make moveItem Atomic

**Problem:** `moveItem` (line 786) deep-copies the node via `JSON.parse(JSON.stringify(node))` then deletes the original. If the copy succeeds but the delete fails (e.g., permission error or the source was already deleted), the file gets duplicated. Also, deep copy via JSON loses any non-serializable properties.

**Solution:** Use reference move (like `renameItem` does) instead of deep copy.

**Changes in `FileSystemManager.js` `moveItem`:**
- Replace the JSON deep copy with a direct reference transfer:
  ```
  // Get reference to source node (not a copy)
  const sourceNode = sourceChildren[sourceFileName];

  // Add to destination
  destNode.children[sourceFileName] = sourceNode;

  // Remove from source (same reference, just removing the key)
  delete sourceChildren[sourceFileName];

  // Update modified timestamp
  sourceNode.modified = new Date().toISOString();
  ```
- This is atomic in the sense that no intermediate state can exist where the file is in both places (single-threaded JS). It also preserves all properties on the node, including non-JSON-serializable ones.
- Keep the existing validation (source exists, dest is directory, no name collision) unchanged.

---

## 6. FileSystemManager: Add Basic Access Control

**Problem:** Any app or script can read/write/delete anything, including system files in `C:/Windows/System32`. A buggy or malicious `.retro` script could wipe the filesystem.

**Solution:** Add a simple permission system with protected paths and an override flag.

**Changes in `FileSystemManager.js`:**
- Add a `PROTECTED_PATHS` constant:
  ```
  const PROTECTED_PATHS = [
      'C:/Windows/System32',
      'C:/Windows/Media',
      'C:/Program Files'
  ];
  ```
- Add a private `_checkWritePermission(path)` method that throws if the path starts with any protected path and no override is active:
  ```
  _checkWritePermission(pathStr) {
      if (this.godMode) return; // Admin override
      for (const protectedPath of PROTECTED_PATHS) {
          if (pathStr.startsWith(protectedPath)) {
              throw new Error(`Permission denied: ${pathStr} is a protected system path`);
          }
      }
  }
  ```
- Call `_checkWritePermission` at the top of `writeFile`, `deleteFile`, `deleteDirectory`, `moveItem`, and `renameItem`.
- Add a `godMode` property (default `false`) that can be set by the Terminal's `godmode` command or admin authentication.
- The `syncDesktopIcons` and `syncInstalledApps` methods should temporarily set `godMode = true` since they write to protected paths during boot.

---

## 7. WindowManager: Reset z-index Periodically

**Problem:** `zCounter` starts at 1000 and increments on every focus operation (line 261). It never resets. After millions of focus operations it could theoretically overflow, but more practically it just grows unbounded.

**Solution:** Periodically compact z-indices.

**Changes in `WindowManager.js`:**
- Add a `compactZIndices()` method that renumbers all open windows:
  ```
  compactZIndices() {
      const windows = document.querySelectorAll('.window:not(.minimized)');
      const sorted = [...windows].sort((a, b) =>
          parseInt(a.style.zIndex || 0) - parseInt(b.style.zIndex || 0)
      );
      this.zCounter = 1000;
      sorted.forEach(w => {
          w.style.zIndex = ++this.zCounter;
      });
  }
  ```
- Call `compactZIndices()` inside `focus()` when `this.zCounter > 10000` (i.e., every ~9000 focus operations). This keeps the values in a sane range with zero user-visible effect.

---

## 8. AppBase: Log Errors from Commands Without requestId

**Problem:** In `registerCommand` (line 670), if a handler throws and no `requestId` is present, the error is silently caught and discarded (lines 693-700 only emit if `payload.requestId` exists). This makes debugging script-to-app communication very difficult.

**Solution:** Always log errors, and optionally emit a generic error event.

**Changes in `AppBase.js` `registerCommand`:**
- Add a `console.error` and an `APP_ERROR` event emission in the catch block regardless of requestId:
  ```
  } catch (error) {
      console.error(`[${this.id}] Command '${action}' failed:`, error.message);
      EventBus.emit(Events.APP_ERROR, {
          appId: this.id,
          windowId: capturedWindowId,
          error: error.message,
          command: action
      });
      if (payload.requestId) {
          EventBus.emit('action:result', {
              requestId: payload.requestId,
              success: false,
              error: error.message
          });
      }
  }
  ```
- This ensures errors are always visible in the console and through the event system, while preserving the existing requestId-based response pattern for scripts that need it.

---

## 9. Constants: Add .retro to FILE_TYPES Arrays

**Problem:** The `FILE_TYPES` constant object (line 189) has arrays for TEXT, IMAGE, AUDIO, VIDEO, EXECUTABLE, etc., but `.retro` files aren't listed anywhere. Code that checks `FILE_TYPES.EXECUTABLE.includes(ext)` or iterates through file type arrays won't recognize `.retro` files.

**Solution:** Add a SCRIPT category to FILE_TYPES.

**Changes in `Constants.js`:**
- Add a new `SCRIPT` array to `FILE_TYPES`:
  ```
  SCRIPT: Object.freeze(['retro', 'bat', 'cmd']),
  ```
- Move `'bat'` and `'cmd'` from EXECUTABLE to SCRIPT (they're scripts, not compiled executables):
  ```
  EXECUTABLE: Object.freeze(['exe']),
  SCRIPT: Object.freeze(['retro', 'bat', 'cmd']),
  ```
- This gives the system a proper way to identify script files. Apps like MyComputer and Terminal can check `FILE_TYPES.SCRIPT.includes(ext)` to decide how to handle them.

---

## 10. Environment: Document the Scoping Semantics (No Code Change)

**Problem:** The `update()` method (line 67) creates variables in the current scope when not found anywhere in the chain. This was flagged as "making all variables effectively global," but after deeper analysis, this behavior is actually correct and intentional for RetroScript's design:

- `set $x = 5` inside a function where `$x` doesn't exist yet creates it in the function's scope (current scope), NOT the global scope.
- `set $x = 10` inside a function where `$x` already exists in the global scope updates the global one.
- This matches shell-scripting conventions (bash, etc.) where variables are implicitly global unless explicitly scoped.

**Conclusion:** No code change needed. The `update()` method behaves correctly for RetroScript's shell-like semantics. The only improvement would be to add a `local` keyword for explicit local scoping in a future version, but that's a feature addition, not a bug fix.

---

## Implementation Order

| Priority | Fix | Risk | Effort |
|----------|-----|------|--------|
| 1 | **#8** AppBase: Log command errors | Zero risk, immediate debugging value | Small |
| 2 | **#4** syncDesktopIcons/syncInstalledApps save | Zero risk, prevents data loss | Small |
| 3 | **#3** deleteDirectoryRecursive emit events | Low risk, enables cascading notifications | Small |
| 4 | **#5** moveItem atomic reference transfer | Low risk, simpler and more correct | Small |
| 5 | **#9** Constants: Add SCRIPT file type | Low risk, improves file type handling | Small |
| 6 | **#2** Interpreter: Event handler state isolation | Medium risk, fixes subtle async bugs | Medium |
| 7 | **#7** WindowManager: z-index compaction | Low risk, defensive measure | Small |
| 8 | **#1** ScriptEngine: Per-invocation interpreters | Medium risk, architectural change | Medium |
| 9 | **#6** FileSystemManager: Access control | Medium risk, new feature addition | Medium |
| 10 | **#10** Environment: No change, document only | Zero risk | None |
