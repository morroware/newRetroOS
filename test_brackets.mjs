import { readFileSync } from 'fs';
const { default: ScriptEngine } = await import('./core/script/ScriptEngine.js');

ScriptEngine.initialize({ EventBus: null });

const script = readFileSync('./test_brackets.retro', 'utf8');
console.log('Testing bracket syntax:\n');

const result = await ScriptEngine.run(script, {
    onOutput: (msg) => console.log('  ' + msg)
});

console.log('\nResult:', result.success ? '✓ PASSED' : '✗ FAILED');
if (!result.success) console.log('Error:', result.error);
process.exit(result.success ? 0 : 1);
