# RetroScript Language Guide

A comprehensive guide to the RetroScript scripting language for IlluminatOS!

---

## Table of Contents

1. [Overview](#overview)
2. [Running Scripts](#running-scripts)
3. [Autoexec Scripts](#autoexec-scripts)
4. [Language Basics](#language-basics)
5. [Variables](#variables)
6. [Operators](#operators)
7. [Control Flow](#control-flow)
8. [Loops](#loops)
9. [Functions](#functions)
10. [Event Handlers](#event-handlers)
11. [Built-in Functions](#built-in-functions)
12. [File Operations](#file-operations)
13. [System Commands](#system-commands)
14. [Dialogs](#dialogs)
15. [Error Handling](#error-handling)
16. [Events Reference](#events-reference)
17. [Examples](#examples)
18. [Best Practices](#best-practices)

---

## Overview

RetroScript is the scripting language for IlluminatOS!. It allows you to automate tasks, create interactive experiences, and build game-like challenges that interact with the operating system.

### Key Features

- **Automation** - Perform repetitive tasks automatically
- **Interactive Games** - Create ARG-style experiences like Project Erebus
- **System Control** - Launch apps, manage files, respond to events
- **Customization** - Configure your OS startup and behavior
- **Event-Driven Programming** - React to system events in real-time

---

## Running Scripts

Scripts can be run from:

1. **Script Runner app**: Open via Start Menu > Programs > Script Runner
2. **Terminal**: Use the `run` command with a `.retro` file path
3. **Double-click**: `.retro` files on the desktop or in file explorer
4. **Autoexec**: Place `autoexec.retro` in specific locations for automatic execution on boot

Script files use the `.retro` extension.

---

## Autoexec Scripts

Autoexec scripts run automatically when IlluminatOS! boots, enabling customized startup behavior and persistent interactive experiences.

### How It Works

The `AutoexecLoader` checks for autoexec files in a specific order and executes the **first one found**:

| Priority | Location | Type | Description |
|----------|----------|------|-------------|
| 1 | `./autoexec.retro` | Real file | Project root directory (via HTTP fetch) |
| 2 | `C:/Windows/autoexec.retro` | Virtual | System-level startup |
| 3 | `C:/Scripts/autoexec.retro` | Virtual | User scripts folder |
| 4 | `C:/Users/User/autoexec.retro` | Virtual | User home folder |

The first priority (project root) allows web administrators to customize startup without modifying the virtual filesystem.

### Execution Properties

| Property | Value | Description |
|----------|-------|-------------|
| Timeout | 10 seconds | Maximum execution time |
| `$AUTOEXEC` | `true` | Marker variable indicating autoexec context |
| `$BOOT_TIME` | timestamp | System boot time (milliseconds) |

### Autoexec Events

The system emits these events during autoexec execution:

| Event | Description | Data |
|-------|-------------|------|
| `autoexec:start` | Execution begins | `{path, timestamp}` |
| `autoexec:complete` | Successful completion | `{path, success, timestamp}` |
| `autoexec:error` | Execution failed | `{path, error, timestamp}` |

### Basic Autoexec Example

```retro
# autoexec.retro - System startup script
# =====================================

print "═══════════════════════════════════════"
print "  Welcome to IlluminatOS!"
print "  System starting up..."
print "═══════════════════════════════════════"

# Create user directories if they don't exist
try { mkdir "C:/Users/User/Projects" } catch {}
try { mkdir "C:/Users/User/Scripts" } catch {}

# Show boot notification
notify "System ready!"

# Play startup sound
play notify

# Log boot time
set $time = call formatTime $BOOT_TIME
print "Boot time: " + $time

# Optional: Launch an app on startup
# launch notepad

print "Autoexec complete!"
```

### Interactive Game Example

The included `autoexec.retro` demonstrates an advanced use case - an interactive ARG (Alternate Reality Game) called Project Erebus:

```retro
# PROJECT EREBUS - Progressive Interactive ARG
# Files unlock as the story progresses

print "[EREBUS] Initializing..."

# State tracking
set $phase = 1
set $puzzles_solved = 0

# Create investigation folder
try { mkdir "C:/Users/User/Desktop/EREBUS" } catch {}
try { mkdir "C:/Users/User/Desktop/EREBUS/INBOX" } catch {}

# Deploy initial files
set $briefing = "INCOMING TRANSMISSION\n=====================\n\nAgent,\n\nYou've been assigned to Case #7749...\n"
write $briefing to "C:/Users/User/Desktop/EREBUS/BRIEFING.txt"

# React to user actions - unlock content progressively
on app:notepad:saved {
    try {
        read "C:/Users/User/Desktop/EREBUS/DECODED/answer1.txt" into $answer
        set $answer = call upper $answer
        if $answer == "REMEMBER" then {
            set $puzzles_solved = $puzzles_solved + 1
            emit sound:play sound="win"
            emit dialog:alert title="CORRECT" message="First key unlocked!"
            # Unlock next phase...
        }
    } catch {}
}

# Track app usage for immersive experience
on app:paint:opened {
    print "[EREBUS] Paint opened. EREBUS is curious..."
    emit notification:show title="EREBUS" message="Drawing something? I'm watching..."
}

on minesweeper:win {
    print "[EREBUS] Minesweeper victory! Achievement unlocked."
    # Create achievement file...
}

print "[EREBUS] Begin your investigation: Desktop/EREBUS/BRIEFING.txt"
```

### Creating Your Own Autoexec

1. **Create the file** in one of the autoexec locations
2. **Add startup commands** like directory creation, app launches
3. **Set up event handlers** for interactive experiences
4. **Test** by refreshing the browser

---

## Language Basics

### Comments

```retro
# This is a comment
print "Hello"  # Inline comments work too
```

### Multiple Statements

```retro
# Semicolons separate statements on one line
set $a = 1; set $b = 2; print $a + $b

# Or use separate lines
set $a = 1
set $b = 2
print $a + $b
```

### Case Sensitivity

- **Keywords** are case-insensitive (`SET`, `set`, `Set` all work)
- **Variable names** are case-sensitive (`$Name` ≠ `$name`)
- **String comparisons** are case-sensitive by default

---

## Variables

Variables are prefixed with `$` and can hold strings, numbers, booleans, arrays, and objects.

### Declaration and Assignment

```retro
# String
set $name = "Alice"

# Number
set $age = 25
set $pi = 3.14159

# Boolean
set $active = true
set $disabled = false

# Null
set $empty = null

# Assignment without 'set' also works
$count = 0
$message = "Hello"
```

### Arrays

```retro
set $numbers = [1, 2, 3, 4, 5]
set $names = ["Alice", "Bob", "Charlie"]
set $mixed = [1, "two", true, null]

# Access elements (0-indexed)
set $first = $numbers[0]    # 1
set $second = $names[1]     # "Bob"

# Or use get() function
set $first = call get $numbers 0
```

### Objects

```retro
set $person = {name: "Alice", age: 25, active: true}

# Access properties
set $personName = $person.name
set $personAge = $person["age"]

# Or use get()
set $personName = call get $person "name"

# Set properties
set $person.email = "alice@example.com"
call set $person "phone" "555-1234"
```

---

## Operators

### Arithmetic

```retro
set $sum = 10 + 5       # 15
set $diff = 10 - 5      # 5
set $product = 10 * 5   # 50
set $quotient = 10 / 5  # 2
set $remainder = 17 % 5 # 2

# Complex expressions with parentheses
set $result = (10 + 5) * 2 - 3  # 27

# Negative numbers
set $neg = -5 + 3  # -2
```

### Comparison

RetroScript uses **strict equality** - values must be the same type to be equal.

```retro
# Equal (strict - type must match)
if $a == $b then { print "equal" }

# Not equal (strict)
if $a != $b then { print "not equal" }

# Greater/Less than
if $a > $b then { print "greater" }
if $a < $b then { print "less" }
if $a >= $b then { print "greater or equal" }
if $a <= $b then { print "less or equal" }
```

**Important:** Since strict equality is used, `"5" == 5` is **false** (string vs number).
Use `call toNumber` to convert strings when comparing to numbers:

```retro
set $input = "42"
set $num = call toNumber $input
if $num == 42 then { print "match!" }  # Works!
```

### Logical

Logical operators return **actual values**, not just booleans (JavaScript-style):

```retro
# AND - returns left if falsy, otherwise right
if $a > 5 && $a < 10 then { print "between 5 and 10" }

# OR - returns left if truthy, otherwise right
if $a < 0 || $a > 100 then { print "out of range" }

# Also works with 'and' / 'or' keywords
if $a > 5 and $a < 10 then { print "between 5 and 10" }
if $a < 0 or $a > 100 then { print "out of range" }

# Combined with parentheses
if ($a > 5 && $a < 10) || $a == 0 then { print "valid" }
```

**Default value pattern** - Use `||` to provide fallback values:

```retro
set $name = $userName || "Guest"        # Use $userName or "Guest" if empty
set $config = $userConfig || $defaults  # Use user config or defaults
```

### String Concatenation

```retro
set $greeting = "Hello, " + $name + "!"
print $greeting  # "Hello, Alice!"
```

---

## Control Flow

### If/Then/Else

```retro
# Simple if
if $score > 100 then {
    print "High score!"
}

# If/else
if $age >= 18 then {
    print "Adult"
} else {
    print "Minor"
}

# Else if
if $score >= 90 then {
    print "A grade"
} else if $score >= 80 then {
    print "B grade"
} else if $score >= 70 then {
    print "C grade"
} else {
    print "Try again"
}

# Single line
if $done == true then { print "Finished!" }
```

---

## Loops

### Count Loop

```retro
# Loop a specific number of times
loop 5 {
    print "Iteration: " + $i  # $i is 0, 1, 2, 3, 4
}

# Loop with variable count
set $count = 10
loop $count {
    print "Count: " + $i
}
```

### While Loop

```retro
set $counter = 0
while $counter < 5 {
    print "Counter: " + $counter
    set $counter = $counter + 1
}
```

### For-Each Loop

Both `for` and `foreach` keywords work identically. The loop variable `$i` is also available as the current index:

```retro
set $fruits = ["apple", "banana", "cherry"]
for $fruit in $fruits {
    print "Fruit: " + $fruit
}

# With index ($i is automatically available)
foreach $fruit in $fruits {
    print "Fruit " + $i + ": " + $fruit
}
```

### Loop Control

```retro
# Break - exit loop early
loop 100 {
    if $i == 5 then { break }
    print $i
}

# Continue - skip to next iteration
loop 10 {
    if $i % 2 == 0 then { continue }
    print $i  # Only odd numbers
}
```

---

## Functions

### User-Defined Functions

Three keywords are available: `func`, `function`, and `def`. All work identically.

```retro
# Define a function (space-separated params)
func greet $name {
    print "Hello, " + $name + "!"
}

# Call it
call greet "Alice"

# Function with return value
func add $a $b {
    return $a + $b
}

set $sum = call add 5 3
print $sum  # 8

# Alternative syntax with parentheses and commas
def multiply($a, $b) {
    return $a * $b
}

set $product = call multiply 4 5
```

### Recursive Functions

```retro
func factorial $n {
    if $n <= 1 then {
        return 1
    }
    set $sub = call factorial ($n - 1)
    return $n * $sub
}

set $result = call factorial 5  # 120
```

### Calling Built-in Functions

```retro
# Call syntax
set $result = call functionName arg1 arg2

# Examples
set $len = call length "hello"           # 5
set $upper = call upper "hello"          # "HELLO"
set $rand = call random 1 100            # Random 1-100
set $abs = call abs -5                   # 5

# Parentheses syntax also works
set $result = call max(10, 20)           # 20
set $result = call min(5, 3, 8)          # 3
```

---

## Event Handlers

Listen for system events and react to them.

### Basic Event Handler

```retro
# React to window opening
on window:open {
    print "A window was opened!"
}

# React to app launching
on app:launch {
    print "App launched: " + $event.appId
}
```

### Event Data

Event handlers receive data in the `$event` variable:

```retro
on keyboard:keydown {
    print "Key pressed: " + $event.key
    if $event.key == "Escape" then {
        print "Escape pressed!"
    }
}

on mouse:click {
    print "Clicked at: " + $event.x + ", " + $event.y
}
```

### Game Events

```retro
on minesweeper:win {
    print "You beat Minesweeper!"
    print "Time: " + $event.time + " seconds"
}

on snake:game:over {
    print "Snake game over! Score: " + $event.score
}

on asteroids:game:over {
    print "Asteroids score: " + $event.score
    if $event.score >= 1000 then {
        print "You reached 1000 points!"
    }
}

on solitaire:win {
    print "Solitaire victory! Moves: " + $event.moves
}
```

### App-Specific Events

```retro
on app:notepad:saved {
    print "File saved: " + $event.path
}

on app:calculator:result {
    print "Calculator result: " + $event.result
}

on app:paint:saved {
    print "Drawing saved!"
}
```

### System Events

```retro
on system:ready {
    print "System is ready!"
}

on system:idle {
    print "System is idle"
}

on system:active {
    print "User is active again"
}
```

---

## Built-in Functions

### Math Functions

| Function | Description | Example |
|----------|-------------|---------|
| `random(min, max)` | Random integer in range | `call random 1 100` |
| `abs(n)` | Absolute value | `call abs -5` → 5 |
| `round(n)` | Round to nearest integer | `call round 3.7` → 4 |
| `floor(n)` | Round down | `call floor 3.9` → 3 |
| `ceil(n)` | Round up | `call ceil 3.1` → 4 |
| `sqrt(n)` | Square root | `call sqrt 16` → 4 |
| `pow(base, exp)` | Power | `call pow 2 8` → 256 |
| `mod(x, y)` | Modulo/remainder | `call mod 17 5` → 2 |
| `sign(n)` | Sign (-1, 0, or 1) | `call sign -5` → -1 |
| `min(...)` | Minimum of values | `call min 5 3 8` → 3 |
| `max(...)` | Maximum of values | `call max 5 3 8` → 8 |
| `clamp(val, min, max)` | Constrain to range | `call clamp 15 0 10` → 10 |
| `sin(n)` | Sine (radians) | `call sin 0` → 0 |
| `cos(n)` | Cosine (radians) | `call cos 0` → 1 |
| `tan(n)` | Tangent (radians) | `call tan 0` → 0 |
| `asin(n)` | Arcsine | `call asin 1` → 1.5708 |
| `acos(n)` | Arccosine | `call acos 1` → 0 |
| `atan(n)` | Arctangent | `call atan 1` → 0.7854 |
| `atan2(y, x)` | Arctangent of y/x | `call atan2 1 1` → 0.7854 |
| `exp(n)` | e^n | `call exp 1` → 2.7183 |
| `log(n)` | Natural logarithm | `call log 10` → 2.3026 |
| `log10(n)` | Base-10 logarithm | `call log10 100` → 2 |
| `log2(n)` | Base-2 logarithm | `call log2 8` → 3 |
| `PI()` | Constant pi | `call PI` → 3.14159 |
| `E()` | Constant e | `call E` → 2.71828 |

### String Functions

| Function | Description | Example |
|----------|-------------|---------|
| `length(s)` | String/array length | `call length "hello"` → 5 |
| `upper(s)` | Uppercase | `call upper "hello"` → "HELLO" |
| `lower(s)` | Lowercase | `call lower "HELLO"` → "hello" |
| `trim(s)` | Remove whitespace | `call trim "  hi  "` → "hi" |
| `trimStart(s)` | Remove leading whitespace | `call trimStart "  hi"` → "hi" |
| `trimEnd(s)` | Remove trailing whitespace | `call trimEnd "hi  "` → "hi" |
| `charAt(s, i)` | Character at index | `call charAt "hello" 1` → "e" |
| `charCode(s, i)` | Character code at index | `call charCode "A" 0` → 65 |
| `fromCharCode(...)` | String from char codes | `call fromCharCode 65 66` → "AB" |
| `concat(...)` | Concatenate strings | `call concat "a" "b" "c"` → "abc" |
| `substr(s, start, len)` | Substring by length | `call substr "hello" 1 3` → "ell" |
| `substring(s, start, end)` | Substring by position | `call substring "hello" 0 3` → "hel" |
| `slice(s, start, end)` | Slice string or array | `call slice "hello" 1 3` → "el" |
| `indexOf(s, search)` | Find first index | `call indexOf "hello" "l"` → 2 |
| `lastIndexOf(s, search)` | Find last index | `call lastIndexOf "hello" "l"` → 3 |
| `contains(s, search)` | Contains check | `call contains "hello" "ell"` → true |
| `startsWith(s, prefix)` | Starts with | `call startsWith "hello" "he"` → true |
| `endsWith(s, suffix)` | Ends with | `call endsWith "hello" "lo"` → true |
| `replace(s, old, new)` | Replace first occurrence | `call replace "hello" "l" "w"` → "hewlo" |
| `replaceAll(s, old, new)` | Replace all occurrences | `call replaceAll "hello" "l" "w"` → "hewwo" |
| `split(s, sep)` | Split to array | `call split "a,b,c" ","` |
| `join(arr, sep)` | Join array to string | `call join $arr ", "` |
| `padStart(s, len, pad)` | Pad string start | `call padStart "5" 3 "0"` → "005" |
| `padEnd(s, len, pad)` | Pad string end | `call padEnd "hi" 5 "."` → "hi..." |
| `repeat(s, count)` | Repeat string | `call repeat "ab" 3` → "ababab" |
| `reverse(s)` | Reverse string or array | `call reverse "hello"` → "olleh" |

### Array Functions

| Function | Description | Example |
|----------|-------------|---------|
| `count(arr)` | Length (arrays, objects, strings) | `call count $arr` |
| `first(arr)` | Get first element | `call first $arr` |
| `last(arr)` | Get last element | `call last $arr` |
| `at(arr, i)` | Get element at index | `call at $arr 2` |
| `push(arr, ...)` | Add to end (mutates) | `call push $arr "new"` |
| `pop(arr)` | Remove last (mutates) | `call pop $arr` |
| `shift(arr)` | Remove first (mutates) | `call shift $arr` |
| `unshift(arr, ...)` | Add to start (mutates) | `call unshift $arr "new"` |
| `includes(arr, item)` | Contains item | `call includes $arr "x"` |
| `findIndex(arr, item)` | Find index of item | `call findIndex $arr "x"` |
| `find(arr, value)` | Find item by value | `call find $arr "x"` |
| `sort(arr)` | Sort ascending (non-mutating) | `call sort $arr` |
| `sortDesc(arr)` | Sort descending (non-mutating) | `call sortDesc $arr` |
| `unique(arr)` | Remove duplicates | `call unique $arr` |
| `flatten(arr, depth)` | Flatten nested arrays | `call flatten $nested 2` |
| `range(start, end, step)` | Create number array | `call range 1 5` → [1,2,3,4] |
| `fill(count, value)` | Create filled array | `call fill 3 "x"` → ["x","x","x"] |
| `sum(arr)` | Sum of elements | `call sum $nums` |
| `avg(arr)` | Average of elements | `call avg $nums` |
| `product(arr)` | Product of elements | `call product $nums` |
| `filter(arr, value)` | Keep items matching value | `call filter $arr "a"` |
| `reject(arr, value)` | Exclude items matching value | `call reject $arr "a"` |
| `map(arr, op)` | Simple map (ops: "double", "square", "string", "number", "boolean") | `call map $nums "double"` |
| `splice(arr, start, del, ...)` | Splice (non-mutating) | `call splice $arr 1 2` |
| `arrayConcat(...)` | Concatenate arrays | `call arrayConcat $a $b` |

### Object Functions

| Function | Description | Example |
|----------|-------------|---------|
| `keys(obj)` | Get property names | `call keys $obj` |
| `values(obj)` | Get property values | `call values $obj` |
| `entries(obj)` | Get [key, value] pairs | `call entries $obj` |
| `get(obj, key, default)` | Get property with default | `call get $obj "name" "unknown"` |
| `set(obj, key, val)` | Set property | `call set $obj "age" 25` |
| `has(obj, key)` | Has property | `call has $obj "name"` |
| `delete(obj, key)` | Delete property | `call delete $obj "temp"` |
| `merge(...)` | Merge objects | `call merge $a $b $c` |
| `clone(obj)` | Deep clone (via JSON) | `call clone $obj` |
| `freeze(obj)` | Freeze object (returns copy) | `call freeze $obj` |
| `getPath(obj, path, def)` | Get nested property (dot notation) | `call getPath $obj "a.b.c"` |
| `setPath(obj, path, val)` | Set nested property | `call setPath $obj "a.b" 5` |

### Type Functions

| Function | Description | Example |
|----------|-------------|---------|
| `typeof(val)` | Get type ("string", "number", "boolean", "array", "object", "null") | `call typeof $x` |
| `isNumber(val)` | Is number | `call isNumber 5` → true |
| `isString(val)` | Is string | `call isString "hi"` → true |
| `isBoolean(val)` | Is boolean | `call isBoolean true` → true |
| `isArray(val)` | Is array | `call isArray [1,2]` → true |
| `isObject(val)` | Is object (not array, not null) | `call isObject {a:1}` → true |
| `isNull(val)` | Is null | `call isNull $x` |
| `isUndefined(val)` | Is undefined | `call isUndefined $x` |
| `isNaN(val)` | Is NaN | `call isNaN $x` |
| `isFinite(val)` | Is finite number | `call isFinite 5` → true |
| `isInteger(val)` | Is integer | `call isInteger 5` → true |
| `isEmpty(val)` | Is empty ([], {}, "", null, undefined) | `call isEmpty ""` → true |
| `isNotEmpty(val)` | Is not empty | `call isNotEmpty "hi"` → true |
| `toNumber(val)` | Convert to number (0 on NaN) | `call toNumber "42"` → 42 |
| `toInt(val)` | Convert to integer | `call toInt "3.7"` → 3 |
| `toFloat(val)` | Convert to float | `call toFloat "3.14"` → 3.14 |
| `toString(val)` | Convert to string | `call toString 42` → "42" |
| `toBoolean(val)` | Convert to boolean ("true", "1", "yes" → true) | `call toBoolean "yes"` → true |
| `toArray(val)` | Convert to array | `call toArray "abc"` → ["a","b","c"] |
| `toObject(val)` | Convert to object | `call toObject $arr` |
| `default(val, fallback)` | Return value or fallback if null/undefined | `call default $x 0` |
| `coalesce(...)` | First non-null/undefined value | `call coalesce $a $b $c` |

### Date/Time Functions

All time functions accept an optional timestamp parameter. Without it, they use the current time.

| Function | Description | Example |
|----------|-------------|---------|
| `now()` | Current timestamp (milliseconds) | `call now` |
| `timestamp()` | Current timestamp (seconds) | `call timestamp` |
| `time()` | Formatted current time (locale) | `call time` |
| `date()` | Formatted current date (locale) | `call date` |
| `datetime()` | Formatted current date+time | `call datetime` |
| `year(ts?)` | Year | `call year` |
| `month(ts?)` | Month (1-12) | `call month` |
| `day(ts?)` | Day of month | `call day` |
| `weekday(ts?)` | Weekday number (0-6) | `call weekday` |
| `weekdayName(ts?)` | Weekday name | `call weekdayName` → "Monday" |
| `hour(ts?)` | Hour (0-23) | `call hour` |
| `minute(ts?)` | Minute (0-59) | `call minute` |
| `second(ts?)` | Second (0-59) | `call second` |
| `millisecond(ts?)` | Millisecond | `call millisecond` |
| `elapsed(startTime)` | Milliseconds elapsed since | `call elapsed $start` |
| `addDays(ts, days)` | Add days to timestamp | `call addDays $ts 7` |
| `addHours(ts, hours)` | Add hours to timestamp | `call addHours $ts 3` |
| `addMinutes(ts, min)` | Add minutes to timestamp | `call addMinutes $ts 30` |
| `addSeconds(ts, sec)` | Add seconds to timestamp | `call addSeconds $ts 60` |
| `formatDate(ts, fmt?)` | Format date (default "YYYY-MM-DD") | `call formatDate $ts` |
| `formatTime(ts, fmt?)` | Format time (default "HH:mm:ss") | `call formatTime $ts` |
| `parseDate(str)` | Parse date string to timestamp | `call parseDate "2024-01-15"` |
| `toISO(ts)` | Convert to ISO format string | `call toISO $ts` |

### System Functions

| Function | Description | Example |
|----------|-------------|---------|
| `sleep(ms)` | Pause execution (max 30 seconds) | `call sleep 1000` |
| `wait(ms)` | Alias for sleep | `call wait 1000` |
| `getFocusedWindow()` | Get focused window info | `call getFocusedWindow` |
| `getWindows()` | List all open windows | `call getWindows` |
| `getApps()` | List all registered apps | `call getApps` |
| `getEnv()` | Get environment info | `call getEnv` |
| `emitEvent(name, data)` | Emit custom event | `call emitEvent "myEvent" $data` |
| `query(type, ...)` | Query system state | `call query "windows"` |
| `exec(cmd, ...)` | Execute command via CommandBus | `call exec "app:launch" $params` |
| `copyToClipboard(text)` | Copy text to clipboard | `call copyToClipboard "Hello"` |
| `getStorage(key)` | Get stored value | `call getStorage "myKey"` |
| `setStorage(key, val)` | Store persistent value | `call setStorage "myKey" "value"` |

### Debug Functions

| Function | Description | Example |
|----------|-------------|---------|
| `debug(...)` | Log debug output | `call debug "value:" $x` |
| `inspect(val)` | Inspect value with type info | `call inspect $obj` |
| `assert(cond, msg)` | Throw if condition is false | `call assert ($x > 0) "Must be positive"` |
| `assertEqual(a, b, msg)` | Assert equality | `call assertEqual $x 5 "Should be 5"` |
| `assertType(val, type, msg)` | Assert type | `call assertType $x "string" "Must be string"` |
| `trace(...)` | Log with timestamp | `call trace "checkpoint reached"` |
| `timeStart(label)` | Start a timer | `call timeStart "operation"` |
| `timeEnd(label)` | End timer, log duration | `call timeEnd "operation"` |
| `getCallStack()` | Get current call stack | `call getCallStack` |
| `dumpVars()` | Log all variables | `call dumpVars` |

### JSON Functions

| Function | Description | Example |
|----------|-------------|---------|
| `toJSON(val)` | Stringify to JSON | `call toJSON $obj` |
| `prettyJSON(val, indent?)` | Stringify with formatting | `call prettyJSON $obj 2` |
| `fromJSON(str)` | Parse JSON string | `call fromJSON $jsonStr` |
| `parseJSON(str)` | Alias for fromJSON | `call parseJSON $jsonStr` |
| `isValidJSON(str)` | Check if valid JSON | `call isValidJSON $str` |

### Dialog Functions

| Function | Description | Example |
|----------|-------------|---------|
| `alert(msg)` | Show alert dialog | `call alert "Hello!"` |
| `confirm(msg)` | Show confirm dialog (async) | `set $ok = call confirm "Sure?"` |
| `prompt(msg, default?)` | Show input dialog (async) | `set $name = call prompt "Name?"` |
| `validateInput(input, type)` | Validate input ("number", "email", "url", "nonempty") | `call validateInput $x "email"` |

### Terminal Functions

Control the Terminal app from scripts:

| Function | Description | Example |
|----------|-------------|---------|
| `terminalOpen([cmd])` | Open terminal, optionally run command | `call terminalOpen "ver"` |
| `terminalClose` | Close terminal window | `call terminalClose` |
| `terminalFocus` | Focus terminal window | `call terminalFocus` |
| `terminalMinimize` | Minimize terminal window | `call terminalMinimize` |
| `isTerminalOpen` | Check if terminal is open | `call isTerminalOpen` |
| `terminalPrint(text, [color])` | Print text to terminal | `call terminalPrint "Hello" "#00ff00"` |
| `terminalPrintHtml(html)` | Print HTML to terminal | `call terminalPrintHtml "<b>Bold</b>"` |
| `terminalClear` | Clear terminal screen | `call terminalClear` |
| `terminalExecute(cmd)` | Execute terminal command | `call terminalExecute "dir"` |
| `terminalExecuteSequence(cmds)` | Execute multiple commands | `call terminalExecuteSequence ["dir", "ver"]` |
| `terminalCd(path)` | Change directory | `call terminalCd "C:/Users"` |
| `terminalGetPath` | Get current path | `call terminalGetPath` |
| `terminalGetOutput` | Get last command output | `call terminalGetOutput` |
| `terminalGetAllOutput` | Get all terminal text | `call terminalGetAllOutput` |
| `terminalGetHistory` | Get command history | `call terminalGetHistory` |
| `terminalGetState` | Get terminal state | `call terminalGetState` |
| `terminalGetEnvVars` | Get all env variables | `call terminalGetEnvVars` |
| `terminalGetEnvVar(name)` | Get env variable | `call terminalGetEnvVar "PATH"` |
| `terminalSetEnvVar(name, val)` | Set env variable | `call terminalSetEnvVar "MYVAR" "value"` |
| `terminalAlias(name, cmd)` | Create command alias | `call terminalAlias "ls" "dir"` |
| `terminalGetAliases` | Get all aliases | `call terminalGetAliases` |
| `terminalDir([path])` | List directory | `call terminalDir` |
| `terminalReadFile(path)` | Read file (relative to terminal) | `call terminalReadFile "test.txt"` |
| `terminalWriteFile(path, content)` | Write file | `call terminalWriteFile "test.txt" "Hello"` |
| `terminalFileExists(path)` | Check file exists | `call terminalFileExists "test.txt"` |
| `terminalRunScript(path)` | Run .retro or .bat file | `call terminalRunScript "script.retro"` |
| `terminalGodMode` | Enable god mode | `call terminalGodMode` |
| `terminalIsGodMode` | Check god mode status | `call terminalIsGodMode` |
| `terminalMatrix` | Start matrix effect | `call terminalMatrix` |
| `terminalCowsay(msg)` | Display cowsay message | `call terminalCowsay "Hello!"` |
| `terminalFortune` | Display random fortune | `call terminalFortune` |
| `terminalColor(code)` | Set terminal color | `call terminalColor "a"` |

**Terminal Events (for event handlers):**

```retro
# React when terminal is opened
on app:terminal:opened {
    print "Terminal opened!"
    set $path = $event.pathString
    print "Current path: $path"
}

# React to terminal commands
on app:terminal:command {
    print "Command executed: $event.command"
    print "Output: $event.output"
}

# React when terminal closes
on app:terminal:closed {
    print "Terminal closed. History count: $event.historyCount"
}
```

---

## File Operations

### Writing Files

```retro
# Write content to a file
write "Hello, World!" to "C:/Users/User/Desktop/hello.txt"

# Write variable content
set $content = "This is my document.\nLine 2."
write $content to "C:/Documents/notes.txt"
```

### Reading Files

```retro
# Read file into variable
read "C:/Users/User/Desktop/hello.txt" into $content
print $content
```

### Directory Operations

```retro
# Create directory
mkdir "C:/Users/User/Desktop/NewFolder"

# Delete file or directory
delete "C:/Users/User/Desktop/oldfile.txt"
```

### File Existence Check

Use the terminal builtin to check if a file exists:

```retro
set $exists = call terminalFileExists "C:/path/to/file.txt"
if $exists then {
    print "File exists!"
}
```

### Copy & Move Files

File copy and move operations are available through the CommandBus system functions:

```retro
# Copy a file via exec
call exec "fs:copy" {source: "C:/source.txt", destination: "C:/destination.txt"}

# Move a file via exec
call exec "fs:move" {source: "C:/old/file.txt", destination: "C:/new/file.txt"}
```

---

## System Commands

### Launching Apps

```retro
# Launch by app ID
launch notepad
launch minesweeper
launch asteroids
launch terminal
launch calculator

# Launch with parameters
launch notepad with file="C:/readme.txt"
```

### Window Control

```retro
# Close windows
close           # Close most recent
close $windowId # Close specific window

# Window operations
focus $windowId
minimize $windowId
maximize $windowId
```

### Wait/Sleep

```retro
# Wait milliseconds
wait 1000    # Wait 1 second
wait 5000    # Wait 5 seconds

# Using call syntax
call sleep 2000
```

### Sound

```retro
# Play system sounds
play click
play notify
play error
play startup
play achievement
play win
```

### Events

```retro
# Emit custom events
emit myEvent key1="value1" key2="value2"

# Play sounds via events
emit sound:play sound="notify"
emit sound:play sound="error"
emit sound:play sound="win"
```

---

## Dialogs

### Alert

```retro
emit dialog:alert message="Hello!" title="Greeting"
```

### Confirm

```retro
set $confirmed = call confirm "Are you sure?"
if $confirmed then {
    print "User confirmed"
}
```

### Prompt

```retro
set $name = call prompt "Enter your name:"
if $name != null then {
    print "Hello, " + $name
}
```

### Notification

```retro
notify "Task complete!"

# Or via event
emit notification:show title="Alert" message="Something happened!"
```

---

## Error Handling

### Try/Catch

```retro
try {
    # Code that might fail
    read "C:/nonexistent.txt" into $content
    print $content
} catch {
    # Handle the error
    print "Error occurred: " + $error
}

# Catch with error variable
try {
    set $result = call riskyOperation
} catch $err {
    print "Error: " + $err
}
```

### Safe Operations

```retro
# Check before operating
set $exists = call exists "C:/path/to/file.txt"
if $exists then {
    read "C:/path/to/file.txt" into $content
} else {
    print "File does not exist"
}

# Create directories safely
try { mkdir "C:/Users/User/NewFolder" } catch {}
```

---

## Events Reference

### Window Events

| Event | Properties | Description |
|-------|------------|-------------|
| `window:create` | windowId, appId, title | Window created |
| `window:open` | windowId, appId | Window opened |
| `window:close` | windowId | Window closed |
| `window:focus` | windowId, appId | Window focused |
| `window:blur` | windowId | Window unfocused |
| `window:minimize` | windowId | Window minimized |
| `window:maximize` | windowId | Window maximized |
| `window:restore` | windowId | Window restored |
| `window:resize` | windowId, width, height | Window resized |
| `window:move` | windowId, x, y | Window moved |

### App Events

| Event | Properties | Description |
|-------|------------|-------------|
| `app:launch` | appId, params | App launching |
| `app:ready` | appId, windowId | App ready |
| `app:close` | appId | App closed |
| `app:focus` | appId, windowId | App focused |
| `app:blur` | appId, windowId | App unfocused |

### Input Events

| Event | Properties | Description |
|-------|------------|-------------|
| `keyboard:keydown` | key, code, ctrl, alt, shift | Key pressed |
| `keyboard:keyup` | key, code | Key released |
| `mouse:click` | x, y, button, target | Mouse clicked |
| `mouse:dblclick` | x, y, button | Double click |
| `mouse:contextmenu` | x, y | Right click |
| `mouse:scroll` | deltaX, deltaY | Mouse scroll |

### File System Events

| Event | Properties | Description |
|-------|------------|-------------|
| `fs:file:create` | path | File created |
| `fs:file:read` | path | File read |
| `fs:file:update` | path | File updated |
| `fs:file:delete` | path | File deleted |
| `fs:file:rename` | oldPath, newPath | File renamed |

### System Events

| Event | Properties | Description |
|-------|------------|-------------|
| `system:ready` | timestamp, bootTime | System initialized |
| `system:idle` | idleTime, threshold | User idle |
| `system:active` | idleDuration | User active |
| `autoexec:start` | path, timestamp | Autoexec started |
| `autoexec:complete` | path, success | Autoexec finished |
| `autoexec:error` | path, error | Autoexec failed |

### Game Events

| Event | Properties | Description |
|-------|------------|-------------|
| `minesweeper:win` | time, difficulty | Beat Minesweeper |
| `minesweeper:lose` | time | Lost Minesweeper |
| `snake:game:over` | score | Snake game ended |
| `asteroids:game:over` | score | Asteroids ended |
| `solitaire:win` | moves, time | Beat Solitaire |
| `freecell:win` | moves, time | Beat FreeCell |

### Other Events

| Event | Properties | Description |
|-------|------------|-------------|
| `achievement:unlock` | id | Achievement unlocked |
| `sound:play` | sound | Play sound effect |
| `notification:show` | message, title | Show notification |
| `dialog:alert` | message, title | Show alert |

---

## Examples

### Hello World

```retro
print "Hello, IlluminatOS!"
```

### Simple Counter

```retro
set $count = 0
loop 10 {
    set $count = $count + 1
    print "Count: " + $count
}
print "Final count: " + $count
```

### FizzBuzz

```retro
loop 15 {
    set $n = $i + 1
    if $n % 15 == 0 then {
        print "FizzBuzz"
    } else if $n % 3 == 0 then {
        print "Fizz"
    } else if $n % 5 == 0 then {
        print "Buzz"
    } else {
        print $n
    }
}
```

### Startup Greeter

```retro
# autoexec.retro - Personalized greeting

set $hour = call hour

if $hour < 12 then {
    set $greeting = "Good morning!"
} else if $hour < 17 then {
    set $greeting = "Good afternoon!"
} else {
    set $greeting = "Good evening!"
}

emit dialog:alert title="Welcome" message=$greeting
```

### Game Score Monitor

```retro
print "Monitoring Asteroids score..."
launch asteroids

on asteroids:game:over {
    print "Score: " + $event.score
    if $event.score >= 500 then {
        print "Great job!"
    }
    if $event.score >= 1000 then {
        emit dialog:alert message="You reached 1000 points!" title="Congratulations!"
    }
}

print "Event handler registered. Play the game!"
```

### File Logger

```retro
set $log = "Session Log - " + call date + "\n"
set $log = $log + "==================\n\n"

on app:launch {
    set $entry = call time + " - Opened: " + $event.appId + "\n"
    set $log = $log + $entry
    write $log to "C:/Users/User/Desktop/session.log"
}

on window:close {
    set $entry = call time + " - Closed window\n"
    set $log = $log + $entry
    write $log to "C:/Users/User/Desktop/session.log"
}

print "Logging session to Desktop/session.log"
```

### Interactive Quiz

```retro
set $score = 0

# Question 1 - numeric answer (use toNumber for comparison)
set $answer = call prompt "What is 2 + 2?"
set $answer = call toNumber $answer
if $answer == 4 then {
    set $score = $score + 1
    notify "Correct!"
} else {
    notify "Wrong! The answer is 4"
}

# Question 2 - string answer (compare strings directly)
set $answer = call prompt "What color is the sky?"
set $answer = call lower $answer
if $answer == "blue" then {
    set $score = $score + 1
    notify "Correct!"
} else {
    notify "Wrong! The answer is blue"
}

# Final score
emit dialog:alert title="Quiz Complete" message="Score: " + $score + "/2"
```

---

## Best Practices

1. **Use descriptive variable names**: `$playerScore` instead of `$ps`

2. **Comment your code**: Explain complex logic
   ```retro
   # Calculate bonus based on streak
   set $bonus = $streak * 10
   ```

3. **Test incrementally**: Build scripts in small pieces

4. **Handle errors**: Use try/catch for file operations
   ```retro
   try {
       read "C:/config.txt" into $config
   } catch {
       print "Using defaults"
       set $config = "default"
   }
   ```

5. **Clean up**: Event handlers persist until the script runner closes

6. **Avoid infinite loops**: Always have an exit condition
   ```retro
   set $max = 1000
   set $count = 0
   while $count < $max {
       # Safe - will eventually exit
       set $count = $count + 1
   }
   ```

7. **Use constants**: Define values at the top
   ```retro
   set $MAX_SCORE = 1000
   set $SAVE_PATH = "C:/Users/User/Documents/save.txt"
   ```

---

## Script Engine Architecture

The RetroScript engine is modular:

| Component | Location | Purpose |
|-----------|----------|---------|
| ScriptEngine | `/core/script/ScriptEngine.js` | Main coordinator & public API |
| Lexer | `/core/script/lexer/` | Tokenizes script text (60+ token types) |
| Parser | `/core/script/parser/` | Recursive descent parser, builds AST (34 statement + 11 expression types) |
| AST | `/core/script/ast/` | Abstract syntax tree node definitions |
| Interpreter | `/core/script/interpreter/` | AST visitor & executor with Environment scoping |
| Builtins | `/core/script/builtins/` | 170+ built-in functions across 11 modules |
| AutoexecLoader | `/core/script/AutoexecLoader.js` | Boot script execution |
| Errors | `/core/script/errors/` | 7 error classes (ParseError, RuntimeError, TimeoutError, RecursionError, etc.) |
| SafetyLimits | `/core/script/utils/` | Execution limits (recursion, timeouts, array/string sizes) |

### Built-in Module Summary

| Module | Functions | Purpose |
|--------|-----------|---------|
| MathBuiltins | 25 | Arithmetic, trigonometry, constants |
| StringBuiltins | 26 | String manipulation and search |
| ArrayBuiltins | 25 | Array operations and aggregation |
| ObjectBuiltins | 12 | Object property manipulation |
| TypeBuiltins | 22 | Type checking and conversion |
| TimeBuiltins | 23 | Date/time operations and formatting |
| SystemBuiltins | 12 | System interaction, clipboard, storage |
| TerminalBuiltins | 32 | Terminal app control and automation |
| DialogBuiltins | 4 | Alert, confirm, prompt, validate |
| JsonBuiltins | 5 | JSON serialization/parsing |
| DebugBuiltins | 10 | Debugging, assertions, timing |

### Safety Limits

| Limit | Default | Description |
|-------|---------|-------------|
| `MAX_RECURSION_DEPTH` | 1000 | Maximum function recursion depth |
| `MAX_LOOP_ITERATIONS` | 100,000 | Maximum loop iterations |
| `MAX_STRING_LENGTH` | 1,000,000 | Maximum string length (1MB) |
| `MAX_ARRAY_LENGTH` | 100,000 | Maximum array elements |
| `MAX_OBJECT_KEYS` | 10,000 | Maximum object properties |
| `MAX_EVENT_HANDLERS` | 1,000 | Maximum registered event handlers |
| `DEFAULT_EXECUTION_TIMEOUT` | 30,000ms | Default script timeout (30 seconds) |
| `AUTOEXEC_TIMEOUT` | 10,000ms | Autoexec script timeout (10 seconds) |

---

## Need Help?

- Check the example scripts in the Script Runner app
- Review [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for integration
- See [docs/TERMINAL_SCRIPTING.md](docs/TERMINAL_SCRIPTING.md) for advanced terminal control
- See `core/EventSchema.js` for complete event definitions
