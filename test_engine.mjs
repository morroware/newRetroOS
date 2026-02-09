/**
 * Test harness for unified ScriptEngine
 * Tests unquoted print, string interpolation, and legacy compatibility
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import modular ScriptEngine
const { default: ScriptEngine } = await import('./core/script/ScriptEngine.js');

console.log('═══════════════════════════════════════════════════════════');
console.log('  Unified ScriptEngine Test');
console.log('═══════════════════════════════════════════════════════════\n');

// Initialize engine
console.log('[Init] Initializing ScriptEngine...');
ScriptEngine.initialize({
    EventBus: null,  // No EventBus in Node.js test
    CommandBus: null
});

// Read test script
const testScriptPath = join(__dirname, 'test_unified_engine.retro');
console.log(`[Load] Loading test script: ${testScriptPath}`);
const scriptContent = readFileSync(testScriptPath, 'utf8');
console.log(`[Load] Script loaded (${scriptContent.length} bytes)\n`);

// Track output
const outputs = [];
const errors = [];

// Run script with callbacks
console.log('[Exec] Executing script...\n');
console.log('─────────────────────────────────────────────────────────');

const result = await ScriptEngine.run(scriptContent, {
    onOutput: (message) => {
        console.log(message);
        outputs.push(message);
    },
    onError: (error) => {
        console.error('[ERROR]', error);
        errors.push(error);
    },
    variables: {
        TEST_MODE: true
    }
});

console.log('─────────────────────────────────────────────────────────\n');

// Report results
console.log('═══════════════════════════════════════════════════════════');
console.log('  Test Results');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Success: ${result.success}`);
console.log(`Output lines: ${outputs.length}`);
console.log(`Errors: ${errors.length}`);
console.log(`Variables: ${Object.keys(result.variables || {}).length}`);

if (result.success) {
    console.log('\n✓ All tests passed!');

    // Verify key features
    console.log('\n[Feature Checks]');

    // Check for unquoted print output
    const hasUnquoted = outputs.some(o => o.includes('Hello World!'));
    console.log(`  Unquoted print: ${hasUnquoted ? '✓' : '✗'}`);

    // Check for interpolation
    const hasInterpolation = outputs.some(o => o.includes('Welcome to RetrOS'));
    console.log(`  String interpolation: ${hasInterpolation ? '✓' : '✗'}`);

    // Check for quoted strings
    const hasQuoted = outputs.some(o => o.includes('This is a quoted string'));
    console.log(`  Quoted strings: ${hasQuoted ? '✓' : '✗'}`);

    // Check for math
    const hasMath = outputs.some(o => o.includes('The sum of'));
    console.log(`  Math operations: ${hasMath ? '✓' : '✗'}`);

    // Check for arrays
    const hasArrays = outputs.some(o => o.includes('Item:'));
    console.log(`  Arrays/loops: ${hasArrays ? '✓' : '✗'}`);

    process.exit(0);
} else {
    console.log('\n✗ Tests failed!');
    console.log('Error:', result.error);
    process.exit(1);
}
