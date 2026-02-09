/**
 * Test harness for ARG RetroScript files
 * Tests minesweeper_challenge.retro and project_erebus.retro
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { default: ScriptEngine } = await import('./core/script/ScriptEngine.js');

async function testScript(name, filePath) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  Testing: ${name}`);
    console.log(`${'='.repeat(60)}`);

    try {
        // Mock FileSystem
        const files = {};
        const dirs = new Set(['C:', 'C:/Users', 'C:/Users/User', 'C:/Users/User/Desktop', 'C:/Windows']);

        // Re-initialize engine for each test
        ScriptEngine.isInitialized = false;
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

        const source = readFileSync(filePath, 'utf-8');
        console.log(`[Load] Script loaded (${source.length} bytes, ${source.split('\n').length} lines)`);

        const outputs = [];
        const errors = [];

        const result = await ScriptEngine.run(source, {
            timeout: 30000,
            onOutput: (msg) => { outputs.push(msg); },
            onError: (err) => { errors.push(err); console.log(`  [ERROR] ${err}`); }
        });

        console.log(`\n[Result] Success: ${result.success}`);
        console.log(`[Result] Output lines: ${outputs.length}`);
        console.log(`[Result] Errors: ${errors.length}`);

        if (outputs.length > 0) {
            console.log(`\n[Output]:`);
            outputs.forEach(line => console.log(`  ${line}`));
        }

        return result.success;
    } catch (error) {
        console.log(`\n[FATAL ERROR]: ${error.message}`);
        if (error.line) console.log(`  Line: ${error.line}, Column: ${error.column}`);
        if (error.hint) console.log(`  Hint: ${error.hint}`);
        console.log(`[Stack]: ${error.stack}`);
        return false;
    }
}

async function main() {
    const results = [];

    results.push(await testScript('Minesweeper Challenge', join(__dirname, 'minesweeper_challenge.retro')));
    results.push(await testScript('Project Erebus', join(__dirname, 'project_erebus.retro')));

    console.log(`\n${'='.repeat(60)}`);
    console.log(`  Summary`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Minesweeper: ${results[0] ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Erebus:      ${results[1] ? '✓ PASS' : '✗ FAIL'}`);
}

main();
