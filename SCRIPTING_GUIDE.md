# RetroScript Language Guide

RetroScript is IlluminatOS's built-in scripting language for automation, interactive experiences, and ARG content delivery. Scripts are `.retro` files executed through a pipeline of Lexer, Parser, and Interpreter.

## Table of Contents

1. [Running Scripts](#1-running-scripts)
2. [Comments](#2-comments)
3. [Variables](#3-variables)
4. [Data Types](#4-data-types)
5. [Operators](#5-operators)
6. [Control Flow](#6-control-flow)
7. [Functions](#7-functions)
8. [Events](#8-events)
9. [Strings and Text Output](#9-strings-and-text-output)
10. [File System](#10-file-system)
11. [App and Window Control](#11-app-and-window-control)
12. [Dialogs and Notifications](#12-dialogs-and-notifications)
13. [Audio and Video](#13-audio-and-video)
14. [Error Handling](#14-error-handling)
15. [Built-in Function Reference](#15-built-in-function-reference)
16. [Autoexec Scripts](#16-autoexec-scripts)
17. [Terminal Scripting Bridge](#17-terminal-scripting-bridge)
18. [Safety Limits](#18-safety-limits)
19. [Gotchas and Common Mistakes](#19-gotchas-and-common-mistakes)

---

## 1) Running Scripts

Run `.retro` scripts via:

- **Script Runner app** - GUI script loader and executor
- **Terminal** - `retro <path>` command
- **Double-click** - Click `.retro` files in File Explorer or on the Desktop
- **Autoexec** - Automatic execution at boot (see [Section 16](#16-autoexec-scripts))

---

## 2) Comments

Comments start with `#` and run to the end of the line.

```retro
# This is a comment
print "hello" # inline comment
```

**IMPORTANT:** Semicolons (`;`) are **not** comments. The lexer tokenizes `;` as a statement separator. Using `;` as a comment prefix will cause parse errors.

```retro
# Correct comment
; This is NOT a comment - it will cause errors!
```

---

## 3) Variables

Variables are always prefixed with `$`. Assign with `set` or bare assignment:

```retro
set $name = "Alice"
set $count = 42
$score = 100          # shorthand (no 'set' keyword)
```

Variable names can contain letters, digits, and underscores. The `$` prefix is required everywhere the variable is used.

### Dot-Access in Variables

Variable references support dot notation for accessing nested properties:

```retro
set $user = { name: "Alice", age: 30 }
print $user.name     # prints: Alice
```

The entire `$user.name` is a single variable token. The dot is part of the variable reference, not a separate operator.

### Scope

Variables follow lexical scoping. Each block (`if`, `loop`, `def`, `on`) creates a child scope:

- Child scopes can **read and modify** variables from parent scopes
- Variables created in a child scope do **not** leak into the parent

```retro
set $x = 1
if true {
  set $x = 2      # modifies parent's $x
  set $y = 99      # only exists inside this block
}
print $x           # prints: 2
# $y is not accessible here
```

---

## 4) Data Types

### Numbers

Integer and decimal numbers:

```retro
set $a = 42
set $b = 3.14
set $c = -7
```

### Strings

Delimited by double or single quotes. Strings can span multiple lines.

```retro
set $greeting = "Hello, world!"
set $alt = 'single quotes work too'
set $multi = "line one
line two"
```

#### Escape Sequences

| Escape | Result          |
|--------|-----------------|
| `\n`   | Newline         |
| `\t`   | Tab             |
| `\r`   | Carriage return |
| `\\`   | Backslash       |
| `\"`   | Double quote    |
| `\'`   | Single quote    |
| `\0`   | Null character  |

Unknown escapes like `\x` produce the literal character `x`.

#### String Interpolation

Inside string literals, `$variableName` is replaced with the variable's value at runtime:

```retro
set $name = "Alice"
print "Hello $name!"    # prints: Hello Alice!
```

If the variable is undefined, the `$name` text is left as-is.

### Booleans

```retro
set $active = true
set $done = false
```

### Null

```retro
set $empty = null
```

### Arrays

Square bracket syntax with comma-separated elements:

```retro
set $colors = ["red", "green", "blue"]
set $nums = [1, 2, 3]
set $mixed = [1, "two", true, null]
set $nested = [[1, 2], [3, 4]]
```

Access elements by index:

```retro
set $first = $colors[0]    # "red"
```

### Objects

Curly brace syntax with `key: value` pairs:

```retro
set $user = { name: "Alice", age: 30, active: true }
set $nested = { meta: { version: 1 }, tags: ["a", "b"] }
```

Keys can be identifiers or quoted strings. Access properties with dot notation:

```retro
print $user.name     # "Alice"
```

Or use the `get` built-in for dynamic access:

```retro
set $key = "name"
set $val = call get $user $key    # "Alice"
```

### Truthiness Rules

These values are **falsy**: `null`, `undefined`, `false`, `0`, `""` (empty string), `[]` (empty array).

Everything else is **truthy**, including objects and non-empty strings/arrays.

---

## 5) Operators

### Arithmetic

| Operator | Description    | Example         |
|----------|----------------|-----------------|
| `+`      | Add / concat   | `$a + $b`       |
| `-`      | Subtract       | `$a - $b`       |
| `*`      | Multiply       | `$a * $b`       |
| `/`      | Divide         | `$a / $b`       |
| `%`      | Modulo         | `$a % $b`       |

The `+` operator concatenates if **either** operand is a string:

```retro
print "Score: " + 42    # "Score: 42"
print 3 + 4             # 7
```

Division and modulo by zero return `0` (not an error).

### Comparison

| Operator | Description          | Example         |
|----------|----------------------|-----------------|
| `==`     | Equal                | `$a == $b`      |
| `!=`     | Not equal            | `$a != $b`      |
| `<`      | Less than            | `$a < $b`       |
| `>`      | Greater than         | `$a > $b`       |
| `<=`     | Less than or equal   | `$a <= $b`      |
| `>=`     | Greater than or equal| `$a >= $b`      |

Equality uses strict comparison (`===` / `!==` under the hood).

### Logical

| Operator | Description | Example           |
|----------|-------------|-------------------|
| `&&`     | Logical AND | `$a && $b`        |
| `\|\|`   | Logical OR  | `$a \|\| $b`      |
| `!`      | Logical NOT | `!$done`          |

**Short-circuit behavior:** `&&` and `||` return the actual value, not just `true`/`false`:

```retro
set $result = null || "default"    # "default"
set $val = "hello" && "world"      # "world"
```

### Unary

| Operator | Description | Example   |
|----------|-------------|-----------|
| `-`      | Negation    | `-$x`    |
| `!`      | Logical NOT | `!$flag` |

### Operator Precedence (lowest to highest)

1. `||` (logical OR)
2. `&&` (logical AND)
3. `==`, `!=` (equality)
4. `<`, `>`, `<=`, `>=` (comparison)
5. `+`, `-` (addition, subtraction)
6. `*`, `/`, `%` (multiplication, division, modulo)
7. `-`, `!` (unary negation, NOT)

Use parentheses to override precedence:

```retro
set $result = (1 + 2) * 3    # 9
```

---

## 6) Control Flow

### if / else

```retro
if $score > 90 {
  print "Excellent!"
} else {
  print "Keep trying."
}
```

The `then` keyword is optional:

```retro
if $score > 90 then {
  print "Excellent!"
}
```

### loop (count-based)

Runs a fixed number of iterations. The variable `$i` is automatically set to the current index (0-based):

```retro
loop 5 {
  print "Iteration " + $i    # 0, 1, 2, 3, 4
}
```

The count can be a variable or expression:

```retro
set $n = 3
loop $n {
  print $i
}
```

### while

Runs while a condition is true:

```retro
set $count = 0
while $count < 10 {
  set $count = $count + 1
}
print $count    # 10
```

`loop while` is an alias:

```retro
loop while $count < 10 {
  set $count = $count + 1
}
```

### foreach / for

Iterates over an array. Both `foreach` and `for` work:

```retro
set $fruits = ["apple", "banana", "cherry"]
foreach $fruit in $fruits {
  print $fruit
}
```

The index variable `$i` is also available:

```retro
for $item in $fruits {
  print $i + ": " + $item    # "0: apple", "1: banana", ...
}
```

**Note:** foreach creates a defensive copy of the array, so modifying the original array during iteration is safe.

### break and continue

```retro
loop 10 {
  if $i == 5 {
    break        # exit the loop entirely
  }
  if $i % 2 == 0 {
    continue     # skip to the next iteration
  }
  print $i       # prints 1, 3
}
```

### return

Exits the current function (see [Functions](#7-functions)):

```retro
def findFirst($items, $target) {
  foreach $item in $items {
    if $item == $target {
      return $item
    }
  }
  return null
}
```

---

## 7) Functions

Define with `def`, `func`, or `function`. Call with `call`:

```retro
def greet($name) {
  print "Hello, " + $name + "!"
}

call greet "World"
```

### Parameters

Parameters are `$`-prefixed variables inside parentheses:

```retro
def add($a, $b) {
  return $a + $b
}

set $sum = call add 3 4
print $sum    # 7
```

### Return Values

Use `return` to send a value back. Use `call` in an expression to capture it:

```retro
def double($n) {
  return $n * 2
}

set $result = call double 5
print $result    # 10
```

Functions without `return` return `undefined`.

### Closures

Functions capture the scope where they were defined:

```retro
set $multiplier = 3
def multiply($n) {
  return $n * $multiplier
}
set $result = call multiply 4    # 12
```

### Calling Built-in Functions

Built-in functions are called the same way. Arguments are space-separated:

```retro
set $len = call length "hello"         # 5
set $upper = call upper "hello"        # "HELLO"
set $items = [3, 1, 2]
set $sorted = call sort $items         # [1, 2, 3]
```

### Recursion

RetroScript supports recursion up to 100 call stack depth (configurable):

```retro
def factorial($n) {
  if $n <= 1 {
    return 1
  }
  return $n * call factorial ($n - 1)
}

set $result = call factorial 5    # 120
```

---

## 8) Events

The event system lets scripts react to system events and communicate between scripts/apps.

### Listening with `on`

```retro
on app:launch {
  print "App launched: " + $event.appId
}
```

Inside the handler body, `$event` contains the event payload.

### Event Name Format

Event names support colon-separated namespaces and hyphenated segments:

```retro
on window:open { }
on app:notepad:saved { }
on desktop:bg-change { }
on sound:play { }
```

Valid event name parts include identifiers and keywords, so `on sound:play` works even though `play` is a keyword.

### Emitting Events

```retro
emit quest:phaseChanged phase=2 label="Unlocked"
```

Payload is specified as `key=value` pairs after the event name. Values can be any expression:

```retro
emit mail:deliver from="System" to=["User"] subject="Hello" body="Welcome!"
emit score:updated value=$score timestamp=call now
```

Payload keys can be identifiers or keywords (like `repeat`, `to`, `from`).

**Value types in emit payloads:**

```retro
# Strings
emit test:data name="Alice"

# Numbers
emit test:data count=42

# Booleans
emit test:data active=true

# Arrays
emit test:data tags=["a", "b"]

# Objects
emit test:data meta={"version": "1.0"}

# Variables
emit test:data score=$currentScore
```

### Multiple Handlers

You can register multiple handlers for the same event. All of them will fire:

```retro
on app:launch {
  print "Handler 1"
}

on app:launch {
  print "Handler 2"
}
# Both print when app:launch fires
```

### Handler Isolation

Event handlers save and restore the interpreter's state. A handler cannot accidentally modify outer variables or control flow. Errors inside handlers are caught and reported without crashing the script.

---

## 9) Strings and Text Output

### print

`print` has two modes depending on what follows it:

**Expression mode** (starts with a quoted string):

```retro
print "Hello " + $name + "!"
print "Score: " + ($a + $b)
```

**Unquoted text mode** (starts with anything else):

```retro
print Hello world!
print The value is $count items.
print Loading... please wait
```

In unquoted mode, `$variables` are interpolated and everything else is treated as literal text. Punctuation like `!`, `:`, `.` is attached to the preceding word without extra space.

**Tip:** Expression mode is more predictable. Use it when mixing variables with text:

```retro
print "Hello " + $name + "! Your score is " + $score + "."
```

### log

Works like `print` — sends output to the script console.

### String Interpolation in Literals

Inside quoted strings, `$varName` patterns are replaced at runtime:

```retro
set $who = "World"
print "Hello $who!"    # Hello World!
```

This happens automatically for all string literals during expression evaluation.

---

## 10) File System

All paths use the IlluminatOS virtual file system (VFS). Paths look like `C:/folder/file.txt`.

### write

```retro
write "file content here" to "C:/Users/User/Documents/note.txt"
```

The content is stringified — objects and arrays become JSON. Overwrites existing files.

### read

```retro
read "C:/Users/User/Documents/note.txt" into $content
print $content
```

The `into` clause names the variable. If omitted, defaults to `$result`:

```retro
read "C:/config.txt"
print $result
```

### mkdir

```retro
mkdir "C:/Users/User/Documents/MyProject"
```

### delete / rm

```retro
delete "C:/Users/User/Documents/old.txt"
rm "C:/Users/User/temp"
```

Tries file deletion first, falls back to recursive directory deletion.

### Best Practices

Always wrap file reads in `try/catch` since files may not exist:

```retro
try {
  read "C:/data.txt" into $data
  print "Data: " + $data
} catch $err {
  print "Could not read file: " + $err
}
```

---

## 11) App and Window Control

### launch

```retro
launch notepad
launch terminal
launch browser
```

With parameters:

```retro
launch notepad with file="C:/readme.txt"
```

### close

```retro
close notepad
close            # closes the currently active window
```

### focus, minimize, maximize

```retro
focus notepad
minimize terminal
maximize browser
```

### wait / sleep

Pause execution for a number of milliseconds:

```retro
launch notepad
wait 500          # wait half a second
focus notepad

sleep 2000        # 'sleep' is an alias for 'wait'
```

### Sequencing UI Operations

Always add `wait` between UI operations. Windows need time to open:

```retro
launch notepad
wait 1000
focus notepad
wait 500
close notepad
```

---

## 12) Dialogs and Notifications

### alert

Non-blocking. Shows an alert dialog:

```retro
alert "Something happened!"
alert Warning: check your files    # unquoted text mode also works
```

### confirm

**Blocking.** Pauses the script until the user clicks OK or Cancel:

```retro
confirm "Delete this file?" into $confirmed
if $confirmed {
  delete "C:/temp.txt"
  print "Deleted."
} else {
  print "Cancelled."
}
```

Defaults variable name to `$confirmed` if `into` is omitted.

### prompt

**Blocking.** Shows a text input dialog:

```retro
prompt "What is your name?" default "User" into $name
print "Hello, " + $name + "!"
```

- `default` sets the pre-filled value (optional)
- `into` names the result variable (defaults to `$input`)

### notify

Non-blocking. Shows a system notification toast:

```retro
notify "Download complete!"
notify Task finished: $taskName
```

---

## 13) Audio and Video

### play

Play a predefined sound type:

```retro
play click
play notify
play error
```

Play an audio file with options:

```retro
play "C:/Music/song.mp3" volume=0.5 loop=true
play "assets/sounds/beep.wav"
```

The interpreter detects file paths by checking for `/`, `\`, `.mp3`, `.wav`, `.ogg`, or `assets/` prefix.

### stop

```retro
stop "C:/Music/song.mp3"    # stop specific audio
stop                         # stop all audio
```

### video

```retro
video "C:/Videos/intro.mp4" volume=0.8 loop=false fullscreen=true
```

This launches the video player app and passes the options.

---

## 14) Error Handling

### try / catch

```retro
try {
  read "C:/nonexistent.txt" into $data
} catch $err {
  print "Error: " + $err
}
```

The error variable name after `catch` is optional (defaults to `$error`):

```retro
try {
  set $result = 10 / 0
} catch {
  print "Something went wrong: " + $error
}
```

### What Can Be Caught

- File system errors (missing files, permission issues)
- Type errors (e.g., `foreach` on a non-array)
- Reference errors (undefined variables in some contexts)
- Runtime errors from built-in functions

### What Cannot Be Caught

- Parse errors (syntax problems prevent execution entirely)
- Timeout errors (the script is forcibly stopped)
- Recursion depth errors

---

## 15) Built-in Function Reference

Call built-in functions with `call`:

```retro
set $result = call functionName arg1 arg2
```

Or as standalone statements:

```retro
call functionName arg1 arg2
```

### Math

| Function | Description | Example |
|----------|-------------|---------|
| `abs` | Absolute value | `call abs -5` → `5` |
| `round` | Round to nearest integer | `call round 3.7` → `4` |
| `floor` | Round down | `call floor 3.9` → `3` |
| `ceil` | Round up | `call ceil 3.1` → `4` |
| `sqrt` | Square root | `call sqrt 16` → `4` |
| `pow` | Power | `call pow 2 3` → `8` |
| `mod` | Modulo | `call mod 10 3` → `1` |
| `sign` | Sign (-1, 0, 1) | `call sign -5` → `-1` |
| `min` | Minimum of two values | `call min 3 7` → `3` |
| `max` | Maximum of two values | `call max 3 7` → `7` |
| `clamp` | Clamp value to range | `call clamp 15 0 10` → `10` |
| `random` | Random integer in range | `call random 1 10` |
| `sin` | Sine (radians) | `call sin 1.57` |
| `cos` | Cosine (radians) | `call cos 0` → `1` |
| `tan` | Tangent (radians) | `call tan 0.785` |
| `asin` | Arc sine | `call asin 1` |
| `acos` | Arc cosine | `call acos 0` |
| `atan` | Arc tangent | `call atan 1` |
| `atan2` | Arc tangent of y/x | `call atan2 1 1` |
| `exp` | e^x | `call exp 1` |
| `log` | Natural logarithm | `call log 2.718` |
| `log10` | Base-10 logarithm | `call log10 100` → `2` |
| `log2` | Base-2 logarithm | `call log2 8` → `3` |
| `PI` | Pi constant | `call PI` → `3.14159...` |
| `E` | Euler's number | `call E` → `2.71828...` |

### String

| Function | Description | Example |
|----------|-------------|---------|
| `upper` | Uppercase | `call upper "hello"` → `"HELLO"` |
| `lower` | Lowercase | `call lower "HELLO"` → `"hello"` |
| `trim` | Trim whitespace | `call trim "  hi  "` → `"hi"` |
| `trimStart` | Trim leading whitespace | `call trimStart "  hi"` → `"hi"` |
| `trimEnd` | Trim trailing whitespace | `call trimEnd "hi  "` → `"hi"` |
| `length` | String length | `call length "hello"` → `5` |
| `charAt` | Character at index | `call charAt "hello" 0` → `"h"` |
| `charCode` | Character code | `call charCode "A"` → `65` |
| `fromCharCode` | Code to character | `call fromCharCode 65` → `"A"` |
| `concat` | Concatenate strings | `call concat "hi" " " "there"` |
| `substr` | Substring (start, length) | `call substr "hello" 1 3` → `"ell"` |
| `substring` | Substring (start, end) | `call substring "hello" 1 3` → `"el"` |
| `slice` | Slice (start, end) | `call slice "hello" -3` → `"llo"` |
| `indexOf` | First index of substring | `call indexOf "hello" "ll"` → `2` |
| `lastIndexOf` | Last index of substring | `call lastIndexOf "hello" "l"` → `3` |
| `contains` | Check if contains | `call contains "hello" "ell"` → `true` |
| `startsWith` | Check prefix | `call startsWith "hello" "he"` → `true` |
| `endsWith` | Check suffix | `call endsWith "hello" "lo"` → `true` |
| `replace` | Replace first occurrence | `call replace "aab" "a" "x"` → `"xab"` |
| `replaceAll` | Replace all occurrences | `call replaceAll "aab" "a" "x"` → `"xxb"` |
| `split` | Split into array | `call split "a,b,c" ","` → `["a","b","c"]` |
| `join` | Join array into string | `call join ["a","b"] ","` → `"a,b"` |
| `padStart` | Pad from start | `call padStart "5" 3 "0"` → `"005"` |
| `padEnd` | Pad from end | `call padEnd "5" 3 "0"` → `"500"` |
| `repeat` | Repeat string | `call repeat "ab" 3` → `"ababab"` |
| `reverse` | Reverse string | `call reverse "hello"` → `"olleh"` |

### Array

| Function | Description | Example |
|----------|-------------|---------|
| `count` | Array length | `call count [1,2,3]` → `3` |
| `first` | First element | `call first [1,2,3]` → `1` |
| `last` | Last element | `call last [1,2,3]` → `3` |
| `at` | Element at index | `call at [1,2,3] 1` → `2` |
| `push` | Add to end (returns new array) | `call push [1,2] 3` → `[1,2,3]` |
| `pop` | Remove from end | `call pop [1,2,3]` → `[1,2]` |
| `shift` | Remove from start | `call shift [1,2,3]` → `[2,3]` |
| `unshift` | Add to start | `call unshift [1,2,3] 0` → `[0,1,2,3]` |
| `includes` | Check if contains | `call includes [1,2,3] 2` → `true` |
| `findIndex` | Index of match | `call findIndex [1,2,3] 2` → `1` |
| `find` | Find element | `call find [1,2,3] 2` → `2` |
| `sort` | Sort ascending | `call sort [3,1,2]` → `[1,2,3]` |
| `sortDesc` | Sort descending | `call sortDesc [3,1,2]` → `[3,2,1]` |
| `unique` | Remove duplicates | `call unique [1,1,2]` → `[1,2]` |
| `flatten` | Flatten nested arrays | `call flatten [[1],[2,3]]` → `[1,2,3]` |
| `range` | Create number range | `call range 1 5` → `[1,2,3,4]` |
| `fill` | Create filled array | `call fill 3 "x"` → `["x","x","x"]` |
| `sum` | Sum of numbers | `call sum [1,2,3]` → `6` |
| `avg` | Average of numbers | `call avg [1,2,3]` → `2` |
| `product` | Product of numbers | `call product [2,3,4]` → `24` |
| `filter` | Filter by value | `call filter [1,2,3] 2` |
| `reject` | Reject by value | `call reject [1,2,3] 2` |
| `map` | Map operation | `call map [1,2,3] "double"` |
| `splice` | Splice array | `call splice [1,2,3,4] 1 2` → `[1,4]` |
| `arrayConcat` | Concatenate arrays | `call arrayConcat [1,2] [3,4]` → `[1,2,3,4]` |

### Object

| Function | Description | Example |
|----------|-------------|---------|
| `keys` | Get all keys | `call keys $obj` → `["name","age"]` |
| `values` | Get all values | `call values $obj` |
| `entries` | Get key-value pairs | `call entries $obj` |
| `get` | Get property | `call get $obj "name"` |
| `set` | Set property | `call set $obj "name" "Bob"` |
| `has` | Check property exists | `call has $obj "name"` → `true` |
| `delete` | Delete property | `call delete $obj "temp"` |
| `merge` | Merge objects | `call merge $obj1 $obj2` |
| `clone` | Deep clone | `call clone $obj` |
| `freeze` | Freeze object | `call freeze $obj` |
| `getPath` | Get nested property | `call getPath $obj "meta.version" "1.0"` |
| `setPath` | Set nested property | `call setPath $obj "meta.version" "2.0"` |

### Type Checking

| Function | Description | Example |
|----------|-------------|---------|
| `typeof` | Get type name | `call typeof 42` → `"number"` |
| `isNumber` | Is number? | `call isNumber 42` → `true` |
| `isString` | Is string? | `call isString "hi"` → `true` |
| `isBoolean` | Is boolean? | `call isBoolean true` → `true` |
| `isArray` | Is array? | `call isArray [1,2]` → `true` |
| `isObject` | Is object? | `call isObject $obj` → `true` |
| `isNull` | Is null? | `call isNull null` → `true` |
| `isUndefined` | Is undefined? | `call isUndefined $x` |
| `isNaN` | Is NaN? | `call isNaN "abc"` |
| `isFinite` | Is finite? | `call isFinite 42` → `true` |
| `isInteger` | Is integer? | `call isInteger 3.0` → `true` |
| `isEmpty` | Is empty? | `call isEmpty ""` → `true` |
| `isNotEmpty` | Is not empty? | `call isNotEmpty "hi"` → `true` |

### Type Conversion

| Function | Description | Example |
|----------|-------------|---------|
| `toNumber` | Convert to number | `call toNumber "42"` → `42` |
| `toInt` | Convert to integer | `call toInt "3.9"` → `3` |
| `toFloat` | Convert to float | `call toFloat "3.14"` → `3.14` |
| `toString` | Convert to string | `call toString 42` → `"42"` |
| `toBoolean` | Convert to boolean | `call toBoolean 1` → `true` |
| `toArray` | Convert to array | `call toArray "abc"` → `["a","b","c"]` |
| `toObject` | Convert to object | `call toObject [["a",1]]` |
| `default` | Default if null/undefined | `call default $x "fallback"` |
| `coalesce` | First non-null value | `call coalesce null null "found"` → `"found"` |

### Time and Date

| Function | Description | Example |
|----------|-------------|---------|
| `now` | Current timestamp (ms) | `call now` |
| `timestamp` | Current Unix timestamp (s) | `call timestamp` |
| `time` | Formatted time string | `call time` → `"2:30:00 PM"` |
| `date` | Formatted date string | `call date` → `"1/15/1995"` |
| `datetime` | Full date-time string | `call datetime` |
| `year` | Year from timestamp | `call year $ts` |
| `month` | Month (1-12) | `call month $ts` |
| `day` | Day (1-31) | `call day $ts` |
| `weekday` | Weekday (0-6, Sun=0) | `call weekday $ts` |
| `weekdayName` | Weekday name | `call weekdayName $ts` → `"Monday"` |
| `hour` | Hour (0-23) | `call hour $ts` |
| `minute` | Minute (0-59) | `call minute $ts` |
| `second` | Second (0-59) | `call second $ts` |
| `millisecond` | Millisecond (0-999) | `call millisecond $ts` |
| `elapsed` | Ms since timestamp | `call elapsed $startTime` |
| `addDays` | Add days to timestamp | `call addDays $ts 7` |
| `addHours` | Add hours | `call addHours $ts 2` |
| `addMinutes` | Add minutes | `call addMinutes $ts 30` |
| `addSeconds` | Add seconds | `call addSeconds $ts 10` |
| `formatDate` | Custom date format | `call formatDate $ts "YYYY-MM-DD"` |
| `formatTime` | Custom time format | `call formatTime $ts "HH:mm:ss"` |
| `parseDate` | Parse date string | `call parseDate "2024-01-15"` |
| `toISO` | ISO 8601 format | `call toISO $ts` |

### JSON

| Function | Description | Example |
|----------|-------------|---------|
| `toJSON` | Stringify to JSON | `call toJSON $obj` |
| `prettyJSON` | Pretty-print JSON | `call prettyJSON $obj 2` |
| `fromJSON` | Parse JSON string | `call fromJSON '{"a":1}'` |
| `parseJSON` | Alias for fromJSON | `call parseJSON $str` |
| `isValidJSON` | Check if valid JSON | `call isValidJSON $str` → `true`/`false` |

### System

| Function | Description | Example |
|----------|-------------|---------|
| `sleep` | Delay (ms, max 30s) | `call sleep 1000` |
| `wait` | Alias for sleep | `call wait 500` |
| `getFocusedWindow` | Get active window info | `call getFocusedWindow` |
| `getWindows` | List all windows | `call getWindows` |
| `getApps` | List registered apps | `call getApps` |
| `getEnv` | Get environment info | `call getEnv` |
| `emitEvent` | Emit event by name | `call emitEvent "test:fire" $payload` |
| `query` | Query system state | `call query "type" $args` |
| `exec` | Execute command | `call exec "commandName" $payload` |
| `copyToClipboard` | Copy to clipboard | `call copyToClipboard "text"` |
| `getStorage` | Get persisted value | `call getStorage "key"` |
| `setStorage` | Persist value | `call setStorage "key" "value"` |

### Debug

| Function | Description | Example |
|----------|-------------|---------|
| `debug` | Debug output | `call debug "value:" $x` |
| `inspect` | Inspect value details | `call inspect $obj` |
| `trace` | Trace output | `call trace "checkpoint"` |
| `assert` | Assert condition | `call assert ($x > 0) "must be positive"` |
| `assertEqual` | Assert equality | `call assertEqual $a $b "should match"` |
| `assertType` | Assert type | `call assertType $x "number" "expected number"` |
| `timeStart` | Start timer | `call timeStart "myTimer"` |
| `timeEnd` | End timer (prints elapsed) | `call timeEnd "myTimer"` |
| `getCallStack` | Get call stack | `call getCallStack` |
| `dumpVars` | Dump all variables | `call dumpVars` |

---

## 16) Autoexec Scripts

The autoexec system runs a script automatically at boot.

**Loader:** `core/script/AutoexecLoader.js`

**Search order** (first found is executed):

1. `./autoexec.retro` (repo root via fetch)
2. `C:/Windows/autoexec.retro`
3. `C:/Scripts/autoexec.retro`
4. `C:/Users/User/autoexec.retro`

**Autoexec timeout:** 10 seconds (vs 30 seconds for normal scripts).

**Autoexec dialog behavior:** When running without an EventBus (headless/early boot):
- `confirm` automatically resolves to `true`
- `prompt` automatically uses the default value

Use autoexec for:
- Boot customization and theming
- Initial file deployment
- Registering persistent event handlers
- Guided onboarding flows
- ARG content staging

```retro
# Example autoexec.retro
print "System booting..."
mkdir "C:/Users/User/Documents"
write "Welcome to IlluminatOS" to "C:/Users/User/Documents/readme.txt"

on app:launch {
  print "App opened: " + $event.appId
}

notify "System ready!"
```

---

## 17) Terminal Scripting Bridge

Terminal built-ins let scripts automate the terminal. See `docs/TERMINAL_SCRIPTING.md` for full workflows.

### Window Control

```retro
call terminalOpen              # open terminal
call terminalOpen "help"       # open with initial command
call terminalFocus             # bring terminal to front
call terminalMinimize          # minimize
call terminalClose             # close terminal
set $open = call isTerminalOpen
```

### Running Commands

```retro
call terminalExecute "dir C:/"
call terminalExecuteSequence ["cd C:/", "dir", "help"]
```

### Output

```retro
call terminalPrint "Hello from script!"
call terminalPrint "Warning!" "red"      # colored output
call terminalPrintHtml "<b>Bold text</b>"
call terminalClear
set $output = call terminalGetOutput     # last command output
set $all = call terminalGetAllOutput     # full session output
set $hist = call terminalGetHistory      # command history
set $state = call terminalGetState       # terminal state object
```

### File Operations

```retro
call terminalCd "C:/Users/User"
set $path = call terminalGetPath
set $files = call terminalDir "C:/"
set $content = call terminalReadFile "C:/readme.txt"
call terminalWriteFile "C:/test.txt" "hello"
set $exists = call terminalFileExists "C:/test.txt"
call terminalRunScript "C:/Scripts/setup.retro"
```

### Environment and Aliases

```retro
call terminalSetEnvVar "EDITOR" "notepad"
set $editor = call terminalGetEnvVar "EDITOR"
set $vars = call terminalGetEnvVars

call terminalAlias "ll" "dir"
set $aliases = call terminalGetAliases
```

### Effects

```retro
call terminalGodMode          # toggle god mode
call terminalMatrix           # matrix rain effect
call terminalColor "green"    # change color
call terminalCowsay "Moo!"   # ASCII cow
call terminalFortune          # random fortune
```

---

## 18) Safety Limits

RetroScript enforces safety limits to prevent runaway scripts:

| Limit | Default | Description |
|-------|---------|-------------|
| Max execution time | 30,000 ms | Script timeout (10,000 ms for autoexec) |
| Max loop iterations | 100,000 | Per `while` loop |
| Max recursion depth | 1,000 | Function call stack |
| Max call stack | 100 | Nested function calls |
| Max event handlers | 1,000 | Registered `on` handlers |
| Max string length | 1,000,000 | Characters per string |
| Max array length | 100,000 | Elements per array |
| Max object keys | 10,000 | Properties per object |

When a limit is exceeded, the script throws an error and stops. Timeout and recursion errors cannot be caught with `try/catch`.

---

## 19) Gotchas and Common Mistakes

### Comments use `#`, not `;`

```retro
# Correct
; WRONG - semicolons are statement separators, not comments!
```

### Keywords are case-insensitive

`SET`, `Set`, and `set` all work. `TRUE`, `True`, and `true` are all boolean true. Identifiers preserve their case but keywords are matched case-insensitively.

### Keywords can't be used as plain identifiers

These are all reserved keywords: `if`, `then`, `else`, `loop`, `repeat`, `while`, `foreach`, `for`, `in`, `break`, `continue`, `set`, `def`, `func`, `function`, `call`, `return`, `try`, `catch`, `on`, `emit`, `print`, `log`, `read`, `write`, `into`, `to`, `with`, `default`, `launch`, `open`, `close`, `wait`, `sleep`, `focus`, `minimize`, `maximize`, `mkdir`, `delete`, `rm`, `alert`, `confirm`, `prompt`, `notify`, `play`, `stop`, `video`, `true`, `false`, `null`.

However, keywords **can** be used as emit/launch payload keys and event name parts.

### Division by zero returns 0

```retro
set $result = 10 / 0    # 0, not an error
set $mod = 10 % 0       # 0, not an error
```

### `+` with strings always concatenates

```retro
print "3" + 4     # "34" (string), not 7
print 3 + 4       # 7 (number)
```

### `==` uses strict equality

```retro
print 0 == false      # false (different types)
print 0 == 0          # true
print "1" == 1        # false (string vs number)
```

### `&&` and `||` return values, not booleans

```retro
set $x = null || "fallback"    # "fallback"
set $y = "hello" && "world"    # "world"
set $z = false && "nope"       # false
```

### `foreach` requires an array

```retro
# This throws a RuntimeError:
foreach $item in "not an array" {
  print $item
}

# Convert to array first:
set $chars = call toArray "hello"
foreach $char in $chars {
  print $char
}
```

### `confirm` and `prompt` are blocking

These statements pause script execution and wait for user input. Other statements like `alert` and `notify` are non-blocking.

```retro
# Script pauses here until user clicks OK/Cancel
confirm "Are you sure?" into $yes

# Script pauses here until user types input
prompt "Enter name:" into $name
```

### Variable `$i` in loops

All loop types automatically set `$i` to the current iteration index (0-based). If you nest loops, the inner `$i` shadows the outer one:

```retro
loop 3 {
  set $outer = $i
  loop 2 {
    # $i here is the inner loop's index (0, 1)
    # $outer still holds the outer loop's value
    print $outer + ":" + $i
  }
}
```

### Unquoted text in `print` is fragile

Unquoted mode in `print` assembles text from tokens with spacing heuristics. For complex expressions, use quoted strings:

```retro
# Unpredictable - may not format as expected:
print The result is $a + $b

# Clear and correct:
print "The result is " + ($a + $b)
```

### Event handlers run in isolation

Handlers save and restore interpreter state. You cannot use `break`, `continue`, or `return` to affect the outer script from inside a handler. Variables modified inside a handler don't propagate to the outer scope.

### File paths use forward slashes

```retro
# Correct
read "C:/Users/User/file.txt" into $data

# Works but less conventional
read "C:\\Users\\User\\file.txt" into $data
```

### Function arguments are space-separated

```retro
# Correct
set $result = call pow 2 3

# Wrong - parentheses not used for call arguments
set $result = call pow(2, 3)
```

### `read` defaults to `$result`, not the path

```retro
read "C:/file.txt"
print $result        # the file content is in $result
```

### Blocks require braces

All control structures require `{ }` braces, even for single statements:

```retro
# Correct
if $x > 0 {
  print "positive"
}

# Wrong - will not parse
if $x > 0
  print "positive"
```
