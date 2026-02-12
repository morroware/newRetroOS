# IlluminatOS Deep Reliability Audit

Date: 2026-02-12  
Scope reviewed: core runtime, filesystem, app registry, feature system, plugin loader, event bus, and PHP backend/auth/config save APIs.

---

## Executive Summary

The project has a strong modular foundation (clear registries, feature lifecycle abstractions, and a richer-than-average event bus), but there are several **high-impact reliability and safety defects** that should be addressed before scaling:

1. **Plugin loading path is misconfigured by default**, which can silently disable plugin functionality in production.
2. **Plugin app registration can unregister core apps on plugin unload** due to tracking logic that does not verify registration success.
3. **Filesystem sync routines are additive-only**, causing stale desktop shortcuts and stale installed-app artifacts to accumulate.
4. **Protected-path enforcement is prefix/string-based**, allowing edge-case bypasses and false positives.
5. **CSRF verification in `save.php` uses non-constant-time comparison**, inconsistent with `auth.php` hardening.
6. **No atomic lock around config read/merge/write lifecycle**, which risks lost updates under concurrent admin requests.

Recommendation: treat these as release-blocking for a "solid foundation" milestone.

---

## Architecture Review by Subsystem

### 1) File System System (`core/FileSystemManager.js`)

### Strengths
- Rich operation coverage (read/write/move/copy/rename/delete/mkdir/rmdir).
- Event emission on most mutations.
- Storage persistence is centralized.

### Critical and High Findings

#### FS-1 (High): Protected-path enforcement is string-prefix only
- Write protection uses `pathStr.startsWith(protectedPath)` semantics.
- This can produce false positives (e.g., `C:/Program FilesX`) and can be bypassed with path normalization mismatches (case/slash variants or non-canonical forms).

**Fix**
- Canonicalize path first (normalize separators, collapse dot segments, consistent case policy).
- Compare on path segments instead of raw string prefixes.
- Add tests for edge paths (`System32X`, trailing slash, mixed slashes, case variants).

#### FS-2 (High): Desktop/app filesystem sync only adds, never reconciles
- `syncDesktopIcons()` and `syncInstalledApps()` create/update entries but do not remove stale items.
- This causes drift between state/app registry and virtual filesystem over time.

**Fix**
- Implement reconciliation mode:
  - Build authoritative set from current state/registry.
  - Remove stale `isShortcut` desktop links not in authoritative set.
  - Remove stale generated app folders/executables with generation marker metadata.

#### FS-3 (Medium): Recursive directory delete emits nested deletion events without actual per-node deletion
- Recursive helper emits nested events, but physical deletion is effectively done by dropping the parent subtree once.
- Consumers that assume event-to-storage parity at each level may observe inconsistent intermediate state.

**Fix**
- Either (A) truly delete each child recursively, or (B) emit a single subtree delete event with explicit semantics.

#### FS-4 (Medium): No path traversal canonicalization contract
- `parsePath` splits path but does not process `.`/`..` segments.
- This can create logically invalid paths and inconsistent behavior among apps that expect POSIX-like normalization.

**Fix**
- Add a dedicated normalizer used by all API entry points.

---

### 2) App System (`apps/AppRegistry.js`)

### Strengths
- Central registration and launch path.
- Good user-facing error handling in `launch()`.
- Config-driven app disabling hook is practical.

### Critical and High Findings

#### APP-1 (Critical): Plugin app unload can remove non-plugin/core apps
- Plugin loader records `pluginApps` even when `AppRegistry.register()` no-ops on duplicate IDs.
- On unload, it unregisters app IDs from `pluginApps` map, potentially deleting core apps not owned by plugin.

**Fix**
- Make `AppRegistry.register()` return explicit status (`registered`, `duplicate`, `error`).
- In `PluginLoader`, only track app IDs when registration succeeded.
- During unload, verify app ownership marker (`app.pluginId`) before unregister.

#### APP-2 (Medium): Duplicate registration is warning-only
- Duplicate app IDs fail soft with warning; callers cannot reliably detect failure.

**Fix**
- Convert to hard error or structured return value consumed by callers.

---

### 3) Plugin System (`core/PluginLoader.js`, config, boot flow)

### Strengths
- Supports feature and app contributions.
- Includes rollback behavior around plugin onLoad failures.

### Critical and High Findings

#### PLUG-1 (Critical): Default plugin paths are incorrect
- Default paths use `../plugins/...` from root `index.js`, which resolves outside repo root path context in browser module resolution.
- Same incorrect path exists in `config/defaults.json`.

**Fix**
- Use `./plugins/features/dvd-bouncer/index.js` in both runtime fallback and defaults config.
- Add startup diagnostic that verifies plugin URL resolution before load.

#### PLUG-2 (High): Manifest source-of-truth split can create confusion
- Boot regenerates manifest from config and writes to local storage each boot.
- Runtime user edits via PluginLoader APIs can be overwritten on next boot.

**Fix**
- Define explicit precedence policy (server config vs user local manifest).
- Persist with versioning and merge rules.

---

### 4) Feature System (`core/FeatureRegistry.js`, `core/FeatureBase.js`)

### Strengths
- Solid lifecycle abstraction.
- Dependency ordering and dependent-disable behavior are good foundations.
- Persistent feature enable state and config hooks are useful.

### Findings

#### FEAT-1 (Medium): Dependency cycle handling is warn-and-continue
- Cycle detection warns but does not fail initialization plan explicitly.

**Fix**
- Fail fast with clear cycle graph output for deterministic behavior.

#### FEAT-2 (Medium): Global hooks are synchronous fire-and-forget
- Slow or failing hooks can impact execution ordering unpredictably.

**Fix**
- Support async hooks with timeout and per-hook isolation policy.

---

### 5) Event System (`core/SemanticEventBus.js`)

### Strengths
- Priority listeners, wildcard patterns, middleware, request/response, channels, history, debounce/throttle.
- Very capable design for a no-dependency project.

### Findings

#### EVT-1 (Medium): Unknown event names only warn, no mode for strict enforcement
- High schema drift risk as the app grows.

**Fix**
- Add strict mode in dev/CI to throw on unknown event names.
- Add event-schema conformance checker for `emit()` usage.

#### EVT-2 (Low/Medium): Listener exceptions are swallowed after logging
- Good for resiliency but can hide production logic faults if not monitored.

**Fix**
- Add optional error-channel event (`eventbus:listener:error`) with counters/alerts.

---

### 6) Backend/Auth/Config APIs (`api/auth.php`, `api/save.php`, `api/config.php`)

### Strengths
- Session hardening flags enabled.
- Session fixation mitigation via regeneration.
- CSRF token present in auth and save flows.
- Validation exists for most editable sections.

### Critical and High Findings

#### BE-1 (High): `save.php` uses non-constant-time CSRF comparison
- Uses `!==` comparison, unlike `auth.php` which correctly uses `hash_equals()`.

**Fix**
- Replace with `hash_equals($sessionToken, $csrfToken)` and require non-empty session token.

#### BE-2 (High): Lost update risk for concurrent config saves
- Save path loads existing overrides, mutates, and writes without file-level transaction around full read-modify-write lifecycle.

**Fix**
- Use `flock`-guarded critical section or append-only journal + compaction.
- Consider ETag/version checks on client save requests.

#### BE-3 (Medium): Session-based rate limiting only
- Failed login throttling is session-bound; easy to bypass by rotating sessions.

**Fix**
- Add IP/user-agent keyed throttling in server-side store.

#### BE-4 (Medium): CSS sanitization checks are partial
- Wallpaper CSS blocks `url()`/`expression()`/`javascript:` but not other abusive constructs (`@import`, huge payloads).

**Fix**
- Whitelist allowed CSS grammar subset (recommended) instead of substring blacklist.

---

## Hidden Integration Risks

1. **Dual persistence domains can drift**: `StateManager`, `StorageManager`, and generated filesystem artifacts can diverge without reconciliation.
2. **Event schema drift over time**: extensive string-literal emits across modules can silently degrade observability.
3. **Plugin operational ambiguity**: server config vs client manifest precedence needs explicit governance.

---

## Prioritized Remediation Plan

### Phase 0 (Immediate, release-blocking)
1. Fix plugin path defaults (`../plugins` -> `./plugins`) everywhere.
2. Fix plugin app ownership tracking/unload safety checks.
3. Replace CSRF comparison in `save.php` with `hash_equals`.
4. Add canonical path normalization + segment-based protected path checks.

### Phase 1 (Near-term hardening)
1. Add filesystem reconciliation for desktop/app sync.
2. Add config save concurrency guard.
3. Add strict event-schema mode in dev/CI.
4. Add per-IP auth rate limiting.

### Phase 2 (Scale readiness)
1. Add subsystem integration test harness (boot -> plugin load -> feature toggle -> fs mutation -> reload persistence verification).
2. Add synthetic chaos tests for event bus listener failures.
3. Add structured diagnostics dashboard (event stats + failed init artifacts + plugin health).

---

## Suggested Test Matrix (Foundation Gate)

- Boot with/without backend (`php -S` vs static server).
- Plugin load success/failure + rollback + unload of plugin with app ID collision scenario.
- FS operations: protected path writes, nested delete, move/copy/rename across drives, and persistence reload.
- Feature dependency graph with intentional cycles.
- Backend save under concurrent writes (parallel requests).
- Event schema strict mode pass for full boot and top 15 user flows.

---

## Final Assessment

This is a promising architecture with good modular boundaries and ambitious observability, but it is **not yet "reliably solid"** for long-term extension until the critical plugin/ownership/path and backend save/auth hardening issues above are fixed. Once Phase 0 + Phase 1 are completed, the project will have a much safer foundation for future growth.
