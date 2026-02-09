/**
 * ScriptEngine - Main coordinator for RetroScript execution
 *
 * This is the primary API for running RetroScript code.
 * It coordinates the lexer, parser, and interpreter.
 *
 * Usage:
 *   import ScriptEngine from './core/script/ScriptEngine.js';
 *
 *   // Run a script
 *   const result = await ScriptEngine.run(`
 *     set $x = 10
 *     print Hello, World!
 *   `);
 *
 *   // Run from file
 *   await ScriptEngine.runFile('C:/Scripts/demo.retro');
 */

import { Lexer } from './lexer/Lexer.js';
import { Parser } from './parser/Parser.js';
import { Interpreter } from './interpreter/Interpreter.js';
import { SafetyLimits, DEFAULT_LIMITS } from './utils/SafetyLimits.js';
import { registerAllBuiltins } from './builtins/index.js';
import { ScriptError, ParseError, RuntimeError } from './errors/ScriptError.js';

/**
 * ScriptEngine class - main API for script execution
 */
class ScriptEngineClass {
    constructor() {
        this.limits = new SafetyLimits();
        this.interpreter = null;
        this.context = {};
        this.isInitialized = false;
        this.isRunning = false;

        // Event callbacks
        this.outputCallback = null;
        this.errorCallback = null;
        this.completeCallback = null;
    }

    /**
     * Initialize the script engine
     * @param {Object} [context] - Optional system context
     */
    initialize(context = {}) {
        if (this.isInitialized) {
            console.log('[ScriptEngine] Already initialized');
            return;
        }

        // Store context references
        this.context = context;

        // Create interpreter with context
        this.interpreter = new Interpreter({
            limits: this.limits,
            context: this.context,
            onOutput: (message) => this.emitOutput(message),
            onError: (error) => this.emitError(error)
        });

        // Register all built-in functions
        registerAllBuiltins(this.interpreter);

        this.isInitialized = true;
        console.log('[ScriptEngine] Initialized (modular architecture)');
    }

    /**
     * Set system context (for lazy initialization)
     * @param {Object} context - System context
     */
    setContext(context) {
        this.context = { ...this.context, ...context };
        if (this.interpreter) {
            this.interpreter.context = this.context;
        }
    }

    /**
     * Run a script from source code
     * @param {string} source - Script source code
     * @param {Object} [options] - Execution options
     * @param {number} [options.timeout] - Execution timeout in ms
     * @param {Object} [options.variables] - Initial variables
     * @param {Function} [options.onOutput] - Legacy callback for output (called for each print)
     * @param {Function} [options.onError] - Legacy callback for errors
     * @param {Function} [options.onVariables] - Legacy callback for variable updates
     * @returns {Object} Execution result
     */
    async run(source, options = {}) {
        if (!this.isInitialized) {
            this.initialize();
        }

        if (this.isRunning) {
            return {
                success: false,
                error: 'Script already running'
            };
        }

        this.isRunning = true;

        // Store any legacy callbacks temporarily
        const legacyOutputCallback = options.onOutput;
        const legacyErrorCallback = options.onError;
        const legacyVariablesCallback = options.onVariables;

        // Create temporary callback wrappers that call both legacy and registered callbacks
        const originalOnOutput = this.outputCallback;
        const originalOnError = this.errorCallback;

        if (legacyOutputCallback) {
            this.outputCallback = (message) => {
                legacyOutputCallback(message);
                if (originalOnOutput) originalOnOutput(message);
            };
        }

        if (legacyErrorCallback) {
            this.errorCallback = (error, line) => {
                legacyErrorCallback(error, line);
                if (originalOnError) originalOnError(error, line);
            };
        }

        try {
            // Set timeout if specified
            if (options.timeout) {
                this.limits.setTimeout(options.timeout);
            }

            // Set initial variables if provided
            if (options.variables) {
                for (const [name, value] of Object.entries(options.variables)) {
                    this.interpreter.globalEnv.set(name, value);
                }
            }

            // Tokenize
            const lexer = new Lexer(source);
            const tokens = lexer.tokenize();

            // Parse
            const parser = new Parser(tokens);
            const ast = parser.parse();

            // Execute
            const result = await this.interpreter.execute(ast);

            // Get final variables
            const variables = this.interpreter.getVariables();

            // Call legacy onVariables callback if provided
            if (legacyVariablesCallback) {
                legacyVariablesCallback(variables);
            }

            // Emit completion
            this.emitComplete({ success: true, result });

            return {
                success: true,
                result,
                variables
            };
        } catch (error) {
            const errorInfo = this.formatError(error);

            this.emitError(errorInfo.message);
            this.emitComplete({ success: false, error: errorInfo });

            // Include variables even on error for debugging
            const variables = this.interpreter ? this.interpreter.getVariables() : {};

            return {
                success: false,
                error: errorInfo,
                variables
            };
        } finally {
            this.isRunning = false;
            this.limits.setTimeout(DEFAULT_LIMITS.DEFAULT_EXECUTION_TIMEOUT);

            // Restore original callbacks
            this.outputCallback = originalOnOutput;
            this.errorCallback = originalOnError;
        }
    }

    /**
     * Run a script from a file path
     * @param {string} path - Virtual filesystem path
     * @param {Object} [options] - Execution options
     * @returns {Object} Execution result
     */
    async runFile(path, options = {}) {
        const FileSystemManager = this.context.FileSystemManager;

        if (!FileSystemManager) {
            return {
                success: false,
                error: 'FileSystemManager not available'
            };
        }

        try {
            const source = FileSystemManager.readFile(path);
            if (source === null || source === undefined) {
                return {
                    success: false,
                    error: `File not found: ${path}`
                };
            }

            return await this.run(source, options);
        } catch (error) {
            return {
                success: false,
                error: `Error reading file: ${error.message}`
            };
        }
    }

    /**
     * Stop the currently running script
     */
    stop() {
        if (this.interpreter) {
            this.interpreter.stop();
        }
    }

    /**
     * Define a custom function
     * @param {string} name - Function name
     * @param {Function} fn - Function implementation
     */
    defineFunction(name, fn) {
        if (this.interpreter) {
            this.interpreter.registerBuiltin(name, fn);
        }
    }

    /**
     * Get current variables
     * @returns {Object} Variables object
     */
    getVariables() {
        return this.interpreter ? this.interpreter.getVariables() : {};
    }

    /**
     * Set output callback
     * @param {Function} callback - Callback for output messages
     */
    onOutput(callback) {
        this.outputCallback = callback;
    }

    /**
     * Set error callback
     * @param {Function} callback - Callback for errors
     */
    onError(callback) {
        this.errorCallback = callback;
    }

    /**
     * Set completion callback
     * @param {Function} callback - Callback for script completion
     */
    onComplete(callback) {
        this.completeCallback = callback;
    }

    /**
     * Emit output message
     * @param {string} message - Output message
     */
    emitOutput(message) {
        if (this.outputCallback) {
            this.outputCallback(message);
        }

        const EventBus = this.context.EventBus;
        if (EventBus) {
            EventBus.emit('script:output', { message });
        }
    }

    /**
     * Emit error
     * @param {string} error - Error message
     */
    emitError(error) {
        if (this.errorCallback) {
            this.errorCallback(error);
        }

        const EventBus = this.context.EventBus;
        if (EventBus) {
            EventBus.emit('script:error', { error });
        }
    }

    /**
     * Emit completion
     * @param {Object} result - Completion result
     */
    emitComplete(result) {
        if (this.completeCallback) {
            this.completeCallback(result);
        }

        const EventBus = this.context.EventBus;
        if (EventBus) {
            EventBus.emit('script:complete', result);
        }
    }

    /**
     * Format error for display
     * @param {Error} error - Error object
     * @returns {Object} Formatted error info
     */
    formatError(error) {
        if (error instanceof ScriptError) {
            return {
                type: error.name,
                message: error.message,
                line: error.line,
                column: error.column,
                hint: error.hint,
                toString: () => error.toString()
            };
        }

        return {
            type: 'Error',
            message: error.message || String(error),
            line: 0,
            column: 0,
            hint: '',
            toString: () => error.message || String(error)
        };
    }

    /**
     * Parse script without executing (for syntax checking)
     * @param {string} source - Script source code
     * @returns {Object} Parse result
     */
    parse(source) {
        try {
            const lexer = new Lexer(source);
            const tokens = lexer.tokenize();

            const parser = new Parser(tokens);
            const ast = parser.parse();

            return {
                success: true,
                ast,
                tokens
            };
        } catch (error) {
            return {
                success: false,
                error: this.formatError(error)
            };
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.interpreter) {
            this.interpreter.cleanup();
        }
    }

    /**
     * Reset the engine state
     */
    reset() {
        this.cleanup();
        this.isRunning = false;
        this.interpreter = new Interpreter({
            limits: this.limits,
            context: this.context,
            onOutput: (message) => this.emitOutput(message),
            onError: (error) => this.emitError(error)
        });
        registerAllBuiltins(this.interpreter);
    }
}

// Export singleton instance
const ScriptEngine = new ScriptEngineClass();

export default ScriptEngine;
export { ScriptEngineClass };
