/**
 * AutoexecLoader - Run startup scripts automatically
 *
 * Checks for autoexec.retro files in standard locations
 * and executes the first one found during system boot.
 *
 * Autoexec File Locations (checked in order):
 *   1. /autoexec.retro - Real web directory (e.g., project root) - CHECKED FIRST
 *   2. C:/Windows/autoexec.retro - Virtual filesystem: System-level startup
 *   3. C:/Scripts/autoexec.retro - Virtual filesystem: User scripts folder
 *   4. C:/Users/User/autoexec.retro - Virtual filesystem: User home folder
 *
 * Web admins can place autoexec.retro in the project root, and it will
 * automatically execute on boot, allowing easy customization without
 * modifying the virtual filesystem.
 */

// Import the modular ScriptEngine (now supports legacy compatibility)
import ScriptEngine from './ScriptEngine.js';
import { DEFAULT_LIMITS } from './utils/SafetyLimits.js';

/**
 * Real filesystem path (checked first - allows web admins to place autoexec.retro in project root)
 * Uses relative path './' so it works when app is served from a subdirectory
 */
const REAL_AUTOEXEC_PATH = './autoexec.retro';

/**
 * Virtual filesystem paths to check for autoexec scripts (in order)
 */
const AUTOEXEC_PATHS = [
    'C:/Windows/autoexec.retro',
    'C:/Scripts/autoexec.retro',
    'C:/Users/User/autoexec.retro'
];

/**
 * Autoexec execution options
 */
const AUTOEXEC_OPTIONS = {
    timeout: DEFAULT_LIMITS.AUTOEXEC_TIMEOUT, // 10 second timeout
    variables: {
        AUTOEXEC: true,
        BOOT_TIME: Date.now()
    }
};

/**
 * Active persistent autoexec session ID (if any)
 */
let activeAutoexecSessionId = null;

/**
 * Run autoexec script if one exists
 * @param {Object} context - System context with FileSystemManager, EventBus, etc.
 * @returns {Object|null} Execution result or null if no autoexec found
 */
export async function runAutoexec(context = {}) {
    const FileSystemManager = context.FileSystemManager;
    const EventBus = context.EventBus;

    if (!FileSystemManager) {
        console.warn('[AutoexecLoader] FileSystemManager not available, skipping autoexec');
        return null;
    }

    // FIRST: Check for real file in web directory (allows web admins to provide autoexec.retro)
    try {
        console.log(`[AutoexecLoader] Checking for real file: ${REAL_AUTOEXEC_PATH}`);
        const response = await fetch(REAL_AUTOEXEC_PATH);
        console.log(`[AutoexecLoader] Fetch response status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const scriptContent = await response.text();
            console.log(`[AutoexecLoader] Found real autoexec script: ${REAL_AUTOEXEC_PATH} (${scriptContent.length} bytes)`);
            console.log(`[AutoexecLoader] Script preview: ${scriptContent.substring(0, 200)}...`);

            // Emit start event
            if (EventBus) {
                EventBus.emit('autoexec:start', { path: REAL_AUTOEXEC_PATH, timestamp: Date.now() });
            }

            // Keep only one persistent autoexec session alive
            if (activeAutoexecSessionId) {
                ScriptEngine.stopPersistent(activeAutoexecSessionId);
                activeAutoexecSessionId = null;
            }

            // Execute the script as a persistent session so `on event` handlers survive
            console.log(`[AutoexecLoader] Executing real autoexec script (persistent session)...`);
            const result = await ScriptEngine.runPersistent(scriptContent, AUTOEXEC_OPTIONS);
            console.log(`[AutoexecLoader] Execution result:`, result);

            if (result?.success && result?.sessionId) {
                activeAutoexecSessionId = result.sessionId;
            }

            if (result.success) {
                console.log(`[AutoexecLoader] Real autoexec completed successfully`);

                if (EventBus) {
                    EventBus.emit('autoexec:complete', {
                        path: REAL_AUTOEXEC_PATH,
                        success: true,
                        timestamp: Date.now()
                    });
                }
            } else {
                console.error(`[AutoexecLoader] Real autoexec failed:`, result.error);

                if (EventBus) {
                    EventBus.emit('autoexec:error', {
                        path: REAL_AUTOEXEC_PATH,
                        error: result.error,
                        timestamp: Date.now()
                    });
                }
            }

            return result;
        } else {
            console.log(`[AutoexecLoader] Real file not found (HTTP ${response.status}), checking virtual filesystem...`);
        }
    } catch (error) {
        // Real file doesn't exist or fetch failed - this is normal, fall through to virtual filesystem
        console.log(`[AutoexecLoader] No real autoexec.retro found (${error.message}), checking virtual filesystem...`);
    }

    // SECOND: Check virtual filesystem paths
    for (const path of AUTOEXEC_PATHS) {
        try {
            // Check if file exists
            const exists = FileSystemManager.exists(path);

            if (exists) {
                console.log(`[AutoexecLoader] Found autoexec script: ${path}`);

                // Emit start event
                if (EventBus) {
                    EventBus.emit('autoexec:start', { path, timestamp: Date.now() });
                }

                // Keep only one persistent autoexec session alive
                if (activeAutoexecSessionId) {
                    ScriptEngine.stopPersistent(activeAutoexecSessionId);
                    activeAutoexecSessionId = null;
                }

                // Execute virtual-file autoexec as persistent session
                const source = FileSystemManager.readFile(path);
                const result = await ScriptEngine.runPersistent(source, AUTOEXEC_OPTIONS);

                if (result?.success && result?.sessionId) {
                    activeAutoexecSessionId = result.sessionId;
                }

                if (result.success) {
                    console.log(`[AutoexecLoader] Autoexec completed successfully`);

                    if (EventBus) {
                        EventBus.emit('autoexec:complete', {
                            path,
                            success: true,
                            timestamp: Date.now()
                        });
                    }
                } else {
                    console.error(`[AutoexecLoader] Autoexec failed:`, result.error);

                    if (EventBus) {
                        EventBus.emit('autoexec:error', {
                            path,
                            error: result.error,
                            timestamp: Date.now()
                        });
                    }
                }

                // Only run the first found autoexec
                return result;
            }
        } catch (error) {
            console.error(`[AutoexecLoader] Error checking ${path}:`, error);
        }
    }

    console.log('[AutoexecLoader] No autoexec.retro found');
    return null;
}

/**
 * Check if any autoexec file exists
 * @param {Object} context - System context
 * @returns {string|null} Path to first found autoexec or null
 */
export function findAutoexec(context = {}) {
    const FileSystemManager = context.FileSystemManager;

    if (!FileSystemManager) {
        return null;
    }

    for (const path of AUTOEXEC_PATHS) {
        try {
            if (FileSystemManager.exists(path)) {
                return path;
            }
        } catch (error) {
            // Ignore errors and continue checking
        }
    }

    return null;
}

/**
 * Create a sample autoexec file
 * @param {Object} context - System context
 * @param {string} [path] - Path to create (defaults to C:/Windows/autoexec.retro)
 * @param {string} [content] - Script content
 */
export function createSampleAutoexec(context = {}, path = 'C:/Windows/autoexec.retro', content = null) {
    const FileSystemManager = context.FileSystemManager;

    if (!FileSystemManager) {
        console.warn('[AutoexecLoader] Cannot create autoexec: FileSystemManager not available');
        return false;
    }

    const defaultContent = `# ═══════════════════════════════════════════════════════════
# RetrOS Autoexec Script
# This script runs automatically when the system boots
# ═══════════════════════════════════════════════════════════

# Display welcome message
print ═══════════════════════════════════════════════════════════
print   Welcome to RetrOS!
print   Autoexec script is running...
print ═══════════════════════════════════════════════════════════

# Show boot notification
notify RetrOS startup complete!

# Play startup sound
play notify

# Log boot time
set $bootTime = call now
set $formattedTime = call formatTime $bootTime
print   Boot time: $formattedTime

# You can customize this script to:
# - Launch specific applications on boot
# - Set up environment variables
# - Run system checks
# - Display custom messages

# Example: Auto-launch an app (uncomment to use)
# launch calculator

print   Autoexec complete!
`;

    try {
        FileSystemManager.writeFile(path, content || defaultContent);
        console.log(`[AutoexecLoader] Created autoexec at: ${path}`);
        return true;
    } catch (error) {
        console.error(`[AutoexecLoader] Failed to create autoexec:`, error);
        return false;
    }
}

export default {
    runAutoexec,
    findAutoexec,
    createSampleAutoexec,
    AUTOEXEC_PATHS
};
