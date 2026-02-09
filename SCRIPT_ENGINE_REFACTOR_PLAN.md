# ScriptEngine Modularization Plan

## Executive Summary

The current `ScriptEngine.js` is a **2,453-line monolithic file** containing parsing, execution, scoping, and 130+ built-in functions all tightly coupled in one class. This plan outlines a modular architecture that separates concerns, improves testability, and follows modern script engine best practices.

---

## Current Architecture Analysis

### Problems Identified

1. **Monolithic Design**: All components (lexer, parser, executor, builtins) in one file
2. **Tight Coupling**: Parser directly references executor, executor embeds parsing logic
3. **Hard to Debug**: Statement execution is a 300+ line switch statement
4. **Limited Extensibility**: Adding new statement types requires modifying multiple areas
5. **Known Bugs**: Foreach loops and user-defined functions can cause freezes (noted in minimal_test.retro)
6. **No Proper AST**: Statements are plain objects without type safety or visitor support
7. **Duplicate Logic**: Expression parsing and condition parsing share similar code paths

### Current File Structure

```
core/
  ScriptEngine.js    # 2,453 lines - Everything in one file
    - Environment class (37-119)
    - ScriptEngineClass (121-2438)
      - Parser methods (337-1414)
      - Execution methods (1416-1804)
      - Value resolution (1806-1991)
      - Condition evaluation (1993-2037)
      - Built-in functions (2043-2371)
      - Utility methods (2373-2438)

apps/
  ScriptRunner.js    # 3,124 lines - IDE/Debugger UI
```

---

## Proposed Modular Architecture

```
core/
  script/
    index.js              # Main ScriptEngine export
    ScriptEngine.js       # Coordinator class (~150 lines)

    lexer/
      Lexer.js            # Tokenizer (~200 lines)
      Token.js            # Token types and factory

    parser/
      Parser.js           # Main parser (~400 lines)
      ExpressionParser.js # Expression/operator handling (~150 lines)

    ast/
      index.js            # AST node exports
      nodes/
        Statement.js      # Base statement class
        Expression.js     # Base expression class
        statements/       # Individual statement types
          SetStatement.js
          PrintStatement.js
          IfStatement.js
          LoopStatement.js
          WhileStatement.js
          ForEachStatement.js
          FunctionDefStatement.js
          TryCatchStatement.js
          EventHandlerStatement.js
          ... etc
        expressions/
          BinaryExpression.js
          CallExpression.js
          VariableExpression.js
          LiteralExpression.js
          ... etc

    interpreter/
      Interpreter.js      # Main executor (~300 lines)
      Environment.js      # Scoping (~100 lines)
      visitors/
        StatementVisitor.js   # Statement execution
        ExpressionVisitor.js  # Expression evaluation

    builtins/
      index.js            # Register all builtins
      MathBuiltins.js     # Math functions (~100 lines)
      StringBuiltins.js   # String functions (~150 lines)
      ArrayBuiltins.js    # Array functions (~150 lines)
      ObjectBuiltins.js   # Object functions (~80 lines)
      TypeBuiltins.js     # Type checking/conversion (~80 lines)
      TimeBuiltins.js     # Date/time functions (~80 lines)
      SystemBuiltins.js   # getWindows, getApps, exec (~50 lines)
      DialogBuiltins.js   # alert, confirm, prompt (~50 lines)
      DebugBuiltins.js    # debug, inspect, assert (~30 lines)

    errors/
      ScriptError.js      # Base error class
      ParseError.js       # Syntax errors
      RuntimeError.js     # Execution errors

    utils/
      SafetyLimits.js     # MAX_ITERATIONS, timeouts, etc.
      ValueResolver.js    # Value coercion utilities
```

---

## Implementation Phases

### Phase 1: Foundation (AST & Errors)

Create the base infrastructure for a proper AST-based engine.

**Files to create:**

1. `core/script/ast/nodes/Statement.js` - Base statement class
2. `core/script/ast/nodes/Expression.js` - Base expression class
3. `core/script/errors/ScriptError.js` - Error hierarchy
4. `core/script/utils/SafetyLimits.js` - Extract constants

**Key changes:**
- Define proper AST node types with `type` discriminator
- Add source location tracking (line, column) to all nodes
- Create visitor pattern interface for extensibility

```javascript
// Example AST Node
class IfStatement extends Statement {
  constructor(condition, thenBody, elseBody, location) {
    super('if', location);
    this.condition = condition;
    this.thenBody = thenBody;
    this.elseBody = elseBody;
  }

  accept(visitor) {
    return visitor.visitIfStatement(this);
  }
}
```

### Phase 2: Lexer & Tokenizer

Extract tokenization into a dedicated module.

**Files to create:**

1. `core/script/lexer/Token.js` - Token types enum and Token class
2. `core/script/lexer/Lexer.js` - Main lexer class

**Token types:**
```javascript
const TokenType = {
  // Keywords
  SET: 'SET',
  IF: 'IF',
  THEN: 'THEN',
  ELSE: 'ELSE',
  LOOP: 'LOOP',
  WHILE: 'WHILE',
  FOREACH: 'FOREACH',
  IN: 'IN',
  DEF: 'DEF',
  RETURN: 'RETURN',
  BREAK: 'BREAK',
  CONTINUE: 'CONTINUE',
  CALL: 'CALL',
  // ... more keywords

  // Literals
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  NULL: 'NULL',

  // Operators
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  STAR: 'STAR',
  SLASH: 'SLASH',
  PERCENT: 'PERCENT',
  EQ: 'EQ',        // ==
  NEQ: 'NEQ',      // !=
  LT: 'LT',
  GT: 'GT',
  LTE: 'LTE',
  GTE: 'GTE',
  AND: 'AND',      // &&
  OR: 'OR',        // ||
  NOT: 'NOT',      // !
  ASSIGN: 'ASSIGN', // =

  // Delimiters
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  COMMA: 'COMMA',
  COLON: 'COLON',
  SEMICOLON: 'SEMICOLON',

  // Special
  VARIABLE: 'VARIABLE',  // $varName
  IDENTIFIER: 'IDENTIFIER',
  NEWLINE: 'NEWLINE',
  EOF: 'EOF'
};
```

**Benefits:**
- Proper token-based parsing instead of string manipulation
- Better error messages with token positions
- Foundation for syntax highlighting in ScriptRunner

### Phase 3: Parser Refactor

Replace ad-hoc parsing with proper recursive descent parser.

**Files to create:**

1. `core/script/parser/Parser.js` - Main parser
2. `core/script/parser/ExpressionParser.js` - Pratt parser for expressions

**Key improvements:**
- Use tokens instead of raw strings
- Proper operator precedence via Pratt parsing
- Generate typed AST nodes
- Better error recovery and messages

```javascript
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  parse() {
    const statements = [];
    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }
    return statements;
  }

  parseStatement() {
    if (this.match(TokenType.SET)) return this.parseSetStatement();
    if (this.match(TokenType.IF)) return this.parseIfStatement();
    if (this.match(TokenType.LOOP)) return this.parseLoopStatement();
    // ... etc
  }
}
```

### Phase 4: Interpreter with Visitor Pattern

Create a clean interpreter using the visitor pattern.

**Files to create:**

1. `core/script/interpreter/Environment.js` - Extract existing Environment class
2. `core/script/interpreter/Interpreter.js` - Main interpreter
3. `core/script/interpreter/visitors/StatementVisitor.js`
4. `core/script/interpreter/visitors/ExpressionVisitor.js`

**Key improvements:**
- Each statement type has its own `visit` method
- Cleaner async execution flow
- Better separation of concerns
- Easier to add new statement types

```javascript
class Interpreter {
  constructor(builtins, limits) {
    this.builtins = builtins;
    this.limits = limits;
    this.globalEnv = new Environment();
  }

  async execute(statements, env = this.globalEnv) {
    for (const stmt of statements) {
      await stmt.accept(this);
      if (this.shouldReturn()) break;
    }
  }

  async visitIfStatement(stmt) {
    const condition = await this.evaluate(stmt.condition);
    if (this.isTruthy(condition)) {
      await this.execute(stmt.thenBody);
    } else if (stmt.elseBody.length > 0) {
      await this.execute(stmt.elseBody);
    }
  }

  async visitLoopStatement(stmt) {
    const loopEnv = this.env.extend();
    for (let i = 0; i < stmt.count; i++) {
      this.checkTimeout();
      loopEnv.set('i', i);
      await this.execute(stmt.body, loopEnv);
      if (this.breakRequested) break;
    }
  }
}
```

### Phase 5: Built-in Functions Modularization

Split the 130+ built-in functions into logical modules.

**Files to create:**

1. `core/script/builtins/index.js` - Registry
2. `core/script/builtins/MathBuiltins.js`
3. `core/script/builtins/StringBuiltins.js`
4. `core/script/builtins/ArrayBuiltins.js`
5. `core/script/builtins/ObjectBuiltins.js`
6. `core/script/builtins/TypeBuiltins.js`
7. `core/script/builtins/TimeBuiltins.js`
8. `core/script/builtins/SystemBuiltins.js`
9. `core/script/builtins/DialogBuiltins.js`
10. `core/script/builtins/DebugBuiltins.js`

**Example structure:**
```javascript
// builtins/MathBuiltins.js
export default function registerMathBuiltins(engine) {
  engine.defineFunction('random', (min = 0, max = 1) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  });

  engine.defineFunction('abs', Math.abs);
  engine.defineFunction('round', Math.round);
  // ... etc
}

// builtins/index.js
import registerMathBuiltins from './MathBuiltins.js';
import registerStringBuiltins from './StringBuiltins.js';
// ... etc

export function registerAllBuiltins(engine) {
  registerMathBuiltins(engine);
  registerStringBuiltins(engine);
  // ... etc
}
```

### Phase 6: Main ScriptEngine Coordinator

Create a thin coordinator class that ties everything together.

```javascript
// core/script/ScriptEngine.js
import { Lexer } from './lexer/Lexer.js';
import { Parser } from './parser/Parser.js';
import { Interpreter } from './interpreter/Interpreter.js';
import { registerAllBuiltins } from './builtins/index.js';
import { SafetyLimits } from './utils/SafetyLimits.js';

class ScriptEngine {
  constructor() {
    this.limits = new SafetyLimits();
    this.interpreter = new Interpreter(this.limits);
    registerAllBuiltins(this);
  }

  async run(source, context = {}) {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    return await this.interpreter.execute(ast, context);
  }

  defineFunction(name, fn) {
    this.interpreter.defineFunction(name, fn);
  }
}
```

---

## Bug Fixes to Address

### 1. Foreach Loop Freezes

**Current issue:** Noted in `minimal_test.retro` that foreach can cause freezes.

**Root cause analysis needed:**
- Check if array mutation during iteration causes issues
- Verify timeout checks are working in foreach loops
- Look for potential infinite loop scenarios

**Fix approach:**
- Add iteration count tracking in new ForEachStatement visitor
- Ensure `this._checkTimeout()` is called each iteration
- Create defensive copy of array before iterating

### 2. User-Defined Function Issues

**Current issue:** User-defined functions can cause freezes.

**Root cause analysis needed:**
- Check recursion depth tracking
- Verify return value propagation
- Look for scope leakage issues

**Fix approach:**
- Implement proper call stack with depth limits
- Use tail-call optimization where possible
- Add explicit return value handling in visitor

---

## Testing Strategy

### Unit Tests (per module)

```
tests/
  script/
    lexer/
      Lexer.test.js       # Token generation tests
    parser/
      Parser.test.js      # AST generation tests
    interpreter/
      Environment.test.js # Scoping tests
      Interpreter.test.js # Execution tests
    builtins/
      MathBuiltins.test.js
      StringBuiltins.test.js
      ... etc
```

### Integration Tests

Keep existing `.retro` test files and ensure they all pass:
- `minimal_test.retro` (35 tests)
- `comprehensive_retroscript_test.retro` (100+ tests)

### Regression Tests

Create specific tests for known issues:
- Foreach loop with various array sizes
- Nested user-defined function calls
- Deep recursion handling
- Timeout behavior

---

## Migration Strategy

### Approach: Parallel Implementation

1. Create new modular structure alongside existing `ScriptEngine.js`
2. Implement new modules incrementally
3. Add feature flag to switch between old/new engine
4. Run both engines against test suite
5. Once all tests pass, remove old engine

### Backward Compatibility

- Maintain exact same public API:
  - `ScriptEngine.run(script, context)`
  - `ScriptEngine.runFile(path, context)`
  - `ScriptEngine.defineFunction(name, fn)`
  - `ScriptEngine.stop()`
  - `ScriptEngine.cleanup()`
- Keep same event emissions (`script:output`, `script:error`, `script:complete`)
- Preserve all existing built-in function signatures

---

## File-by-File Implementation Order

1. `core/script/errors/ScriptError.js`
2. `core/script/utils/SafetyLimits.js`
3. `core/script/interpreter/Environment.js` (extract existing)
4. `core/script/lexer/Token.js`
5. `core/script/lexer/Lexer.js`
6. `core/script/ast/nodes/*.js` (all AST nodes)
7. `core/script/parser/ExpressionParser.js`
8. `core/script/parser/Parser.js`
9. `core/script/builtins/*.js` (all builtin modules)
10. `core/script/interpreter/Interpreter.js`
11. `core/script/ScriptEngine.js` (new coordinator)
12. `core/script/index.js` (main export)
13. Update `core/ScriptEngine.js` to re-export from new location

---

## Estimated Complexity

| Module | Lines | Complexity |
|--------|-------|------------|
| Errors | ~50 | Low |
| SafetyLimits | ~30 | Low |
| Token | ~80 | Low |
| Lexer | ~200 | Medium |
| AST Nodes | ~400 | Medium |
| ExpressionParser | ~150 | Medium |
| Parser | ~400 | High |
| Environment | ~100 | Low |
| Interpreter | ~350 | High |
| Builtins (total) | ~600 | Low |
| ScriptEngine | ~100 | Low |
| **Total** | **~2,460** | |

The total lines are similar to the original, but now properly separated into testable, maintainable modules.

---

## Benefits of Modular Architecture

1. **Testability**: Each module can be unit tested in isolation
2. **Debuggability**: Errors point to specific modules/files
3. **Extensibility**: Add new statement types without touching parser core
4. **Maintainability**: Smaller files, single responsibility
5. **Performance**: Can optimize hot paths without affecting others
6. **Documentation**: Each module is self-documenting
7. **Collaboration**: Multiple developers can work on different modules

---

## Autoexec Script Feature

### Overview

RetroScript programs can optionally run automatically on system boot, without requiring the Script Runner app. This is controlled at the server/deployment level.

### Autoexec File Locations (checked in order)

1. `C:/Windows/autoexec.retro` - System-level startup script
2. `C:/Scripts/autoexec.retro` - User scripts folder
3. `C:/Users/User/autoexec.retro` - User home folder

### Implementation

```javascript
// core/script/AutoexecLoader.js
import FileSystemManager from '../FileSystemManager.js';
import ScriptEngine from './ScriptEngine.js';
import EventBus from '../EventBus.js';

const AUTOEXEC_PATHS = [
  'C:/Windows/autoexec.retro',
  'C:/Scripts/autoexec.retro',
  'C:/Users/User/autoexec.retro'
];

export async function runAutoexec() {
  for (const path of AUTOEXEC_PATHS) {
    try {
      const exists = FileSystemManager.exists(path);
      if (exists) {
        console.log(`[AutoexecLoader] Found autoexec script: ${path}`);
        EventBus.emit('autoexec:start', { path });

        const result = await ScriptEngine.runFile(path);

        if (result.success) {
          console.log(`[AutoexecLoader] Autoexec completed successfully`);
          EventBus.emit('autoexec:complete', { path, result });
        } else {
          console.error(`[AutoexecLoader] Autoexec failed:`, result.error);
          EventBus.emit('autoexec:error', { path, error: result.error });
        }

        return result; // Only run first found autoexec
      }
    } catch (error) {
      console.error(`[AutoexecLoader] Error checking ${path}:`, error);
    }
  }

  console.log('[AutoexecLoader] No autoexec.retro found');
  return null;
}
```

### Boot Sequence Integration

The autoexec script runs after all core systems are initialized but before the desktop is fully interactive:

```javascript
// In index.js initializeOS()

// === Phase 5.5: Run Autoexec Script ===
console.log('[IlluminatOS!] Phase 5.5: Autoexec Scripts');
onProgress(95, 'Running startup scripts...');
await initComponent('Autoexec', async () => {
  const { runAutoexec } = await import('./core/script/AutoexecLoader.js');
  await runAutoexec();
});
```

### Server-Level Configuration

Site owners can place an `autoexec.retro` file in the virtual filesystem to run custom scripts on boot:

```javascript
// Example: Pre-populate filesystem with autoexec
FileSystemManager.writeFile('C:/Windows/autoexec.retro', `
# IlluminatOS Startup Script
# This runs automatically when the site loads

print Welcome to IlluminatOS!
notify System initialized successfully

# Example: Auto-launch an app
# launch notepad with file="C:/Users/User/readme.txt"

# Example: Play startup sound
play notify
`);
```

### Safety Considerations

1. **Timeout**: Autoexec scripts have a 10-second timeout (shorter than normal)
2. **Error handling**: Failures don't prevent boot completion
3. **No user interaction**: Dialogs (prompt, confirm) are skipped in autoexec mode
4. **Logging**: All autoexec output is logged to console for debugging

---

## Implementation Status

**Status: APPROVED - Beginning Implementation**

The modular architecture will be implemented in the following order:
1. Foundation (errors, safety limits)
2. Lexer and tokens
3. AST node classes
4. Parser
5. Environment (extract existing)
6. Interpreter with visitor pattern
7. Builtins (split into modules)
8. Main ScriptEngine coordinator
9. Autoexec loader
10. Boot sequence integration
