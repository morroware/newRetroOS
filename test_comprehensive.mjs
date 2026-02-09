/**
 * Comprehensive test harness - runs comprehensive_retroscript_test.retro
 * and the full test suite to find remaining bugs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { default: ScriptEngine } = await import('./core/script/ScriptEngine.js');

// Mock FileSystem for tests
const files = {};
const dirs = new Set(['C:', 'C:/Users', 'C:/Users/User', 'C:/Windows']);

ScriptEngine.initialize({
    EventBus: null,
    CommandBus: null,
    FileSystemManager: {
        readFile: (path) => files[path] ?? null,
        writeFile: (path, content) => { files[path] = String(content); },
        createDirectory: (path) => { dirs.add(path); },
        deleteFile: (path) => { delete files[path]; },
        exists: (path) => files.hasOwnProperty(path) || dirs.has(path)
    }
});

const testScript = readFileSync(join(__dirname, 'comprehensive_retroscript_test.retro'), 'utf8');

console.log('[Running comprehensive_retroscript_test.retro]\n');

const outputs = [];
const errors = [];

const result = await ScriptEngine.run(testScript, {
    timeout: 30000,
    onOutput: (msg) => {
        console.log(msg);
        outputs.push(msg);
    },
    onError: (err) => {
        console.error('[ERR]', err);
        errors.push(err);
    }
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log(`Engine result: success=${result.success}`);
if (!result.success) {
    console.log(`Error: ${result.error?.message || JSON.stringify(result.error)}`);
}
console.log(`Output lines: ${outputs.length}`);
console.log(`Errors: ${errors.length}`);

// Count PASSED/FAILED from output
const passCount = outputs.filter(o => o.includes('PASSED')).length;
const failCount = outputs.filter(o => o.includes('FAILED')).length;
console.log(`PASSED: ${passCount}, FAILED: ${failCount}`);

if (failCount > 0) {
    console.log('\nFailed tests:');
    outputs.filter(o => o.includes('FAILED')).forEach(o => console.log(`  ${o.trim()}`));
}

process.exit(result.success && failCount === 0 ? 0 : 1);
