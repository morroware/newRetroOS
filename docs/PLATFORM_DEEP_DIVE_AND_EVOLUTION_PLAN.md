# IlluminatOS Current-State Deep Dive & Non-Breaking Evolution Plan

## 1) Executive Summary

This document captures the **current system behavior**, the most likely root cause of your autoexec/EREBUS failures, and a phased plan to improve extensibility without regressing existing functionality.

### Key finding (high confidence)

Your EREBUS autoexec script is executing only its immediate boot-time commands (directory/file creation, initial prints, timers), but its long-lived behavior does not persist because `on ... {}` handlers are removed when the script invocation completes.

That aligns exactly with the symptoms you reported:
- `Desktop/EREBUS` is created (synchronous boot segment runs).
- No delayed first-contact notification appears (registered `on erebus:firstcontact` handler does not survive).
- Solving puzzle files in Notepad has no effect (registered `on app:notepad:saved` handler does not survive).

---

## 2) Current Platform Architecture (How pieces work together today)

## 2.1 Boot + initialization orchestration

`index.js` performs a phased system bring-up: core, plugin registration, feature initialization, UI renderer mount, settings, global handlers, then autoexec execution near the end of boot.

This sequencing is good for extensibility because startup scripts run after core services and event channels are already available.

## 2.2 Event-driven backbone

`core/EventBus.js` re-exports `SemanticEventBus`, giving one canonical event substrate. `core/CommandBus.js` binds command/event flows, including timer abstractions (`timer:set`, `timer:clear`) used heavily by scripts.

This architecture is already extension-friendly:
- apps/features/plugins communicate via events rather than direct coupling,
- timers/events let scripts orchestrate experiences,
- request/response style handlers exist for cross-system queries.

## 2.3 Virtual filesystem as shared state surface

`core/FileSystemManager.js` is effectively the shared world-state for apps and scripts. EREBUS progression writes and reads files under `C:/Users/User/Desktop/EREBUS/...`, then relies on app events to verify player actions.

Because file operations and app events are already integrated into the system, this is a strong foundation for future app ecosystems and scripted campaigns.

## 2.4 Script execution model

`core/script/AutoexecLoader.js` fetches `./autoexec.retro` first, then falls back to virtual FS locations. It executes through `ScriptEngine.run(...)`.

`core/script/ScriptEngine.js` creates a fresh interpreter for each invocation and always calls `interpreter.cleanup()` in `finally`.

`core/script/interpreter/Interpreter.js` registers `on` handlers onto EventBus during execution, but `cleanup()` explicitly removes those handlers.

That means autoexec behaves as a one-shot script runner rather than a persistent runtime process.

---

## 3) Why EREBUS currently breaks (directly tied to your symptoms)

## 3.1 Symptom A: folder exists, no notification

In `autoexec.retro`, folder creation and setup are done in top-level statements and run immediately. Delayed UX is implemented through event handlers such as:
- `on erebus:firstcontact { ... notification/dialog ... }`
- timer emits set by `emit timer:set ... event="erebus:firstcontact"`

Timer events continue to fire globally, but no script handler remains attached after autoexec invocation teardown.

## 3.2 Symptom B: first puzzle solve has no effect

Puzzle progression depends on:
- `on app:notepad:saved { ... read answer1.txt ... unlockPhase2 ... }`

Notepad emits app-scoped save events (`app:notepad:saved`) via `emitAppEvent('saved', ...)`, so the producer side appears present. But the EREBUS consumer handler from autoexec is removed after execution cleanup.

## 3.3 Additional signal

`AutoexecLoader.js` defines `AUTOEXEC_OPTIONS` (including timeout), but does not pass it to `ScriptEngine.run(...)` when executing the real file path. This is not the primary failure here, but it indicates a drift between intended and actual autoexec policy.

---

## 4) Current-state strengths to preserve

1. **Clear modular boundaries** across core, apps, UI, features, plugins.
2. **Event-first architecture** that is naturally extensible.
3. **Shared virtual filesystem contracts** enabling low-friction app/script interoperability.
4. **Plugin + feature registry model** that already supports progressive expansion.

These should remain untouched conceptually while improving reliability.

---

## 5) Non-breaking improvement plan

## Phase 0 — Safety net + observability (do first)

Goal: improve diagnosability before behavior changes.

1. Add lifecycle telemetry for script handlers:
   - when handler registered (`script:handler:registered`)
   - when handler removed (`script:handler:removed`)
   - active handler counts by script invocation
2. Emit explicit autoexec summary event:
   - source path, parse/exec duration, handlers registered, handlers retained
3. Add boot diagnostics panel entry for autoexec status and errors.

**Why first:** reduces regression risk by making script-runtime behavior visible.

## Phase 1 — Introduce persistent autoexec session

Goal: make `on`-based autoexec narratives work exactly as authored.

1. Add a dedicated ScriptEngine entrypoint for persistent sessions, e.g.:
   - `runPersistent(source, options)` returning `sessionId` and stop handle.
2. For autoexec only, keep interpreter/session alive after top-level execution so event handlers continue to receive events.
3. Store session metadata in a `ScriptSessionManager`:
   - script source/path
   - registration count
   - startedAt/uptime
   - stop/restart capability
4. Keep existing `run()` semantics unchanged for one-shot scripts (ScriptRunner, ad hoc execution).

**Compatibility strategy:**
- Default behavior remains one-shot unless explicitly persistent.
- Existing scripts/apps unaffected unless they opt in (autoexec should opt in by default).

## Phase 2 — Handler lifecycle policy + ownership

Goal: prevent leaks while allowing long-lived scripts.

1. Scope EventBus handlers by owner (`scriptSessionId`).
2. Replace global cleanup with owner-targeted cleanup only when session stops.
3. Add max-handler + max-session guards with clear error messages.
4. On reboot/reload, stop all prior persistent sessions deterministically.

## Phase 3 — Autoexec contract hardening

Goal: eliminate ambiguity and hidden behavior.

1. Ensure `AUTOEXEC_OPTIONS` is actually applied (timeout/variables policy).
2. Define explicit autoexec mode in docs:
   - startup phase
   - allowed operations
   - persistence semantics
   - failure behavior
3. Add `autoexec:healthcheck` event after boot with script status snapshot.

## Phase 4 — Regression-proof extension foundation

Goal: make future app/features additions safer.

1. Create a contract test suite for event-driven interactions:
   - app emits `app:<id>:saved`
   - persistent script consumes and mutates FS
   - timer-driven events reach handlers
2. Add golden-path integration tests for EREBUS progression:
   - boot => first-contact notification
   - write `answer1.txt` + Notepad save => phase2 artifacts appear
3. Add plugin/script compatibility matrix in docs.

---

## 6) Suggested verification matrix (before/after each phase)

## Core functional checks

1. Boot with `autoexec.retro` present:
   - EREBUS folder + initial files exist.
2. Wait >12s after boot:
   - first-contact notification/dialog appears.
3. Save `DECODED/answer1.txt` with `REMEMBER` in Notepad:
   - phase transition triggers (`unlockPhase2` artifacts + notification).
4. Reload page:
   - no duplicate handler explosions, no stale sessions.

## Stability checks

1. Open/close apps repeatedly while persistent autoexec is active.
2. Run ScriptRunner one-shot scripts concurrently with autoexec session.
3. Validate no memory growth from orphan handlers after restart.

---

## 7) Risk analysis + rollback

## Key risks

1. **Handler leaks** if persistent sessions are not stop-managed.
2. **Double-processing** if multiple autoexec sessions are accidentally started.
3. **Behavior drift** if one-shot scripts are inadvertently made persistent.

## Mitigations

1. Session ownership + deterministic stop APIs.
2. Singleton guard for autoexec persistent session.
3. Keep one-shot `run()` path untouched and covered by tests.
4. Feature-flag persistent autoexec for staged rollout.

## Rollback strategy

- Toggle feature flag back to one-shot autoexec.
- Keep telemetry and diagnostics in place to retain observability even when rolled back.

---

## 8) Recommended implementation order (pragmatic)

1. Phase 0 telemetry.
2. Minimal Phase 1 persistent autoexec for event handlers.
3. Phase 2 ownership-based cleanup.
4. Phase 3 contract/doc cleanup.
5. Phase 4 regression/integration coverage.

This order gives you rapid fix value for the current EREBUS issue while containing risk to the rest of the platform.

---

## 9) Definition of done

The platform is ready for safe extension when:

1. EREBUS progression works end-to-end on a clean boot.
2. Autoexec has explicit, observable lifecycle state.
3. No regressions in one-shot script execution paths.
4. Integration tests validate timer + app-event + filesystem choreography.
5. App/plugin developers have a stable documented contract for script/session behavior.
