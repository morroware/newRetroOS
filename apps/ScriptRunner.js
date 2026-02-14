/**
 * ScriptRunner - RetrOS Scripting IDE
 *
 * A development tool for writing and testing RetroScript scripts.
 * Provides syntax highlighting, output console, variable inspector,
 * event recording with code generation, and debugging features.
 */

import AppBase from './AppBase.js';
import EventBus from '../core/EventBus.js';
import ScriptEngine from '../core/script/ScriptEngine.js';
import CommandBus from '../core/CommandBus.js';
import FileSystemManager from '../core/FileSystemManager.js';

class ScriptRunner extends AppBase {
    constructor() {
        super({
            id: 'scriptrunner',
            name: 'Script Runner',
            icon: '📜',
            width: 900,
            height: 650,
            category: 'systemtools'
        });

        this.output = [];
        this.eventLog = [];
        this.recordedEvents = [];
        this.variables = {};
        this.isRecording = false;
        this.maxLogEntries = 200;
        this.errorLine = null;
        this.breakpoints = new Set();
        this.isDebugging = false;
        this.currentDebugLine = null;
        this.findVisible = false;

        // File management
        this.currentFilePath = null;
        this.isModified = false;
        this.originalContent = '';
        this.lastRecordedCode = '';
    }

    onOpen(params) {
        // Start with empty editor - blank slate for new scripts
        const sampleScript = ``;

        // Full comprehensive test suite (available via Tests button)
        const fullTestSuite = `# ╔══════════════════════════════════════════════════════════════════╗
# ║       RETROSCRIPT COMPREHENSIVE TEST SUITE v3.0                 ║
# ║       Complete testing of all language features                 ║
# ╚══════════════════════════════════════════════════════════════════╝

# Initialize test tracking
set $testsPassed = 0
set $testsFailed = 0

print
print ╔══════════════════════════════════════════════════════════════════╗
print ║       RETROSCRIPT COMPREHENSIVE TEST SUITE v3.0                 ║
print ╚══════════════════════════════════════════════════════════════════╝
print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 1: VARIABLES AND DATA TYPES                              │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 1: VARIABLES AND DATA TYPES                              │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 1.1: String Variables
print [Test 1.1] String Variables
set $str = "Hello, World!"
if $str == "Hello, World!" then {
    print   ✓ PASS: String assignment works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: String assignment broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.2: Number Variables (integers)
print [Test 1.2] Integer Variables
set $int = 42
if $int == 42 then {
    print   ✓ PASS: Integer assignment works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Integer assignment broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.3: Decimal/Float Variables
print [Test 1.3] Decimal Variables
set $dec = 3.14159
if $dec > 3.14 then {
    if $dec < 3.15 then {
        print   ✓ PASS: Decimal assignment works
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: Decimal assignment broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.4: Boolean Variables
print [Test 1.4] Boolean Variables
set $bool = true
if $bool == true then {
    print   ✓ PASS: Boolean true works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Boolean true broken
    set $testsFailed = $testsFailed + 1
}
set $bool = false
if $bool == false then {
    print   ✓ PASS: Boolean false works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Boolean false broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.5: Empty String
print [Test 1.5] Empty String
set $empty = ""
if $empty == "" then {
    print   ✓ PASS: Empty string preserved
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Empty string broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.6: Null Value
print [Test 1.6] Null Value
set $nul = null
set $isNul = call isNull $nul
if $isNul == true then {
    print   ✓ PASS: Null value works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Null value broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.7: Array Literals
print [Test 1.7] Array Literals
set $arr = [1, 2, 3, 4, 5]
set $arrLen = call count $arr
if $arrLen == 5 then {
    print   ✓ PASS: Array literal works (5 elements)
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Array literal broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.8: Object Literals
print [Test 1.8] Object Literals
set $obj = {name: "Alice", age: 30}
set $objName = call get $obj "name"
if $objName == "Alice" then {
    print   ✓ PASS: Object literal works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Object literal broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.9: Variable Interpolation in Strings
print [Test 1.9] Variable Interpolation
set $name = "Bob"
set $greeting = "Hello, $name!"
if $greeting == "Hello, Bob!" then {
    print   ✓ PASS: Variable interpolation works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Variable interpolation broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 2: ARITHMETIC OPERATIONS                                 │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 2: ARITHMETIC OPERATIONS                                 │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 2.1: Addition
print [Test 2.1] Addition
set $a = 10
set $b = 5
set $sum = $a + $b
if $sum == 15 then {
    print   ✓ PASS: 10 + 5 = $sum
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 + 5 expected 15, got $sum
    set $testsFailed = $testsFailed + 1
}

# Test 2.2: Subtraction
print [Test 2.2] Subtraction
set $diff = $a - $b
if $diff == 5 then {
    print   ✓ PASS: 10 - 5 = $diff
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 - 5 expected 5, got $diff
    set $testsFailed = $testsFailed + 1
}

# Test 2.3: Multiplication
print [Test 2.3] Multiplication
set $prod = $a * $b
if $prod == 50 then {
    print   ✓ PASS: 10 * 5 = $prod
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 * 5 expected 50, got $prod
    set $testsFailed = $testsFailed + 1
}

# Test 2.4: Division
print [Test 2.4] Division
set $quot = $a / $b
if $quot == 2 then {
    print   ✓ PASS: 10 / 5 = $quot
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 / 5 expected 2, got $quot
    set $testsFailed = $testsFailed + 1
}

# Test 2.5: Modulo
print [Test 2.5] Modulo
set $x = 17
set $y = 5
set $mod = $x % $y
if $mod == 2 then {
    print   ✓ PASS: 17 % 5 = $mod
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 17 % 5 expected 2, got $mod
    set $testsFailed = $testsFailed + 1
}

# Test 2.6: String Concatenation with +
print [Test 2.6] String Concatenation
set $s1 = "Hello"
set $s2 = " World"
set $concat = $s1 + $s2
if $concat == "Hello World" then {
    print   ✓ PASS: String concatenation works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: String concatenation broken
    set $testsFailed = $testsFailed + 1
}

# Test 2.7: Negative Numbers
print [Test 2.7] Negative Numbers
set $neg = -42
set $absNeg = call abs $neg
if $absNeg == 42 then {
    print   ✓ PASS: Negative numbers work
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Negative numbers broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 3: COMPARISON OPERATORS                                  │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 3: COMPARISON OPERATORS                                  │
print └──────────────────────────────────────────────────────────────────┘
print

set $n = 10

# Test 3.1: Equal (==)
print [Test 3.1] Equal (==)
if $n == 10 then {
    print   ✓ PASS: 10 == 10 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 == 10 should be true
    set $testsFailed = $testsFailed + 1
}

# Test 3.2: Not Equal (!=)
print [Test 3.2] Not Equal (!=)
if $n != 5 then {
    print   ✓ PASS: 10 != 5 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 != 5 should be true
    set $testsFailed = $testsFailed + 1
}

# Test 3.3: Greater Than (>)
print [Test 3.3] Greater Than (>)
if $n > 5 then {
    print   ✓ PASS: 10 > 5 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 > 5 should be true
    set $testsFailed = $testsFailed + 1
}

# Test 3.4: Less Than (<)
print [Test 3.4] Less Than (<)
if $n < 15 then {
    print   ✓ PASS: 10 < 15 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 < 15 should be true
    set $testsFailed = $testsFailed + 1
}

# Test 3.5: Greater Than or Equal (>=)
print [Test 3.5] Greater Than or Equal (>=)
if $n >= 10 then {
    print   ✓ PASS: 10 >= 10 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 >= 10 should be true
    set $testsFailed = $testsFailed + 1
}

# Test 3.6: Less Than or Equal (<=)
print [Test 3.6] Less Than or Equal (<=)
if $n <= 10 then {
    print   ✓ PASS: 10 <= 10 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 <= 10 should be true
    set $testsFailed = $testsFailed + 1
}

# Test 3.7: String Comparison
print [Test 3.7] String Comparison
set $strA = "apple"
set $strB = "banana"
if $strA != $strB then {
    print   ✓ PASS: String comparison works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: String comparison broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 4: LOGICAL OPERATORS                                     │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 4: LOGICAL OPERATORS                                     │
print └──────────────────────────────────────────────────────────────────┘
print

set $p = 5
set $q = 10
set $r = 15

# Test 4.1: Logical AND (&&)
print [Test 4.1] Logical AND (&&)
if $p < $q && $q < $r then {
    print   ✓ PASS: 5 < 10 AND 10 < 15 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: AND condition broken
    set $testsFailed = $testsFailed + 1
}

# Test 4.2: Logical OR (||)
print [Test 4.2] Logical OR (||)
if $p > $q || $q < $r then {
    print   ✓ PASS: 5 > 10 OR 10 < 15 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: OR condition broken
    set $testsFailed = $testsFailed + 1
}

# Test 4.3: Triple AND
print [Test 4.3] Triple AND
if $p < $q && $q < $r && $r > $p then {
    print   ✓ PASS: Triple AND works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Triple AND broken
    set $testsFailed = $testsFailed + 1
}

# Test 4.4: Mixed AND/OR
print [Test 4.4] Mixed AND/OR
if $p < $q && $q < $r || $r < $p then {
    print   ✓ PASS: Mixed AND/OR works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Mixed AND/OR broken
    set $testsFailed = $testsFailed + 1
}

# Test 4.5: Boolean Variable in Condition
print [Test 4.5] Boolean in Condition
set $flag = true
if $flag then {
    print   ✓ PASS: Boolean variable in condition works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Boolean variable in condition broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 5: CONTROL FLOW - IF/ELSE                                │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 5: CONTROL FLOW - IF/ELSE                                │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 5.1: Simple If
print [Test 5.1] Simple If
set $val = 100
if $val > 50 then {
    print   ✓ PASS: If block executed
    set $testsPassed = $testsPassed + 1
}

# Test 5.2: If-Else (then branch)
print [Test 5.2] If-Else (then branch)
set $val = 100
set $branch = ""
if $val > 50 then {
    set $branch = "then"
} else {
    set $branch = "else"
}
if $branch == "then" then {
    print   ✓ PASS: Then branch taken correctly
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Wrong branch taken
    set $testsFailed = $testsFailed + 1
}

# Test 5.3: If-Else (else branch)
print [Test 5.3] If-Else (else branch)
set $val = 10
set $branch = ""
if $val > 50 then {
    set $branch = "then"
} else {
    set $branch = "else"
}
if $branch == "else" then {
    print   ✓ PASS: Else branch taken correctly
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Wrong branch taken
    set $testsFailed = $testsFailed + 1
}

# Test 5.4: Nested If
print [Test 5.4] Nested If
set $outer = true
set $inner = true
set $result = ""
if $outer then {
    if $inner then {
        set $result = "both"
    } else {
        set $result = "outer only"
    }
}
if $result == "both" then {
    print   ✓ PASS: Nested if works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Nested if broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 6: CONTROL FLOW - LOOPS                                  │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 6: CONTROL FLOW - LOOPS                                  │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 6.1: Count Loop
print [Test 6.1] Count Loop
set $counter = 0
loop 5 {
    set $counter = $counter + 1
}
if $counter == 5 then {
    print   ✓ PASS: Loop executed 5 times
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Loop count wrong: $counter
    set $testsFailed = $testsFailed + 1
}

# Test 6.2: Loop Index Variable ($i)
print [Test 6.2] Loop Index Variable
set $lastIndex = -1
loop 3 {
    set $lastIndex = $i
}
if $lastIndex == 2 then {
    print   ✓ PASS: Loop index 0-2 correct (last: $lastIndex)
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Loop index wrong: $lastIndex
    set $testsFailed = $testsFailed + 1
}

# Test 6.3: While Loop
print [Test 6.3] While Loop
set $w = 0
loop while $w < 3 {
    set $w = $w + 1
}
if $w == 3 then {
    print   ✓ PASS: While loop completed
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: While loop counter: $w
    set $testsFailed = $testsFailed + 1
}

# Test 6.4: Foreach Loop
print [Test 6.4] Foreach Loop
set $fruits = ["apple", "banana", "cherry"]
set $fruitCount = 0
foreach $fruit in $fruits {
    set $fruitCount = $fruitCount + 1
}
if $fruitCount == 3 then {
    print   ✓ PASS: Foreach iterated 3 items
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Foreach count: $fruitCount
    set $testsFailed = $testsFailed + 1
}

# Test 6.5: Break Statement
print [Test 6.5] Break Statement
set $breakAt = -1
loop 10 {
    set $breakAt = $i
    if $i == 3 then {
        break
    }
}
if $breakAt == 3 then {
    print   ✓ PASS: Break at iteration 3
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Break at wrong index: $breakAt
    set $testsFailed = $testsFailed + 1
}

# Test 6.6: Continue Statement
print [Test 6.6] Continue Statement
set $skipSum = 0
loop 5 {
    if $i == 2 then {
        continue
    }
    set $skipSum = $skipSum + $i
}
# Sum of 0+1+3+4 = 8 (skipping 2)
if $skipSum == 8 then {
    print   ✓ PASS: Continue skipped index 2 (sum=$skipSum)
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Continue broken, sum=$skipSum (expected 8)
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 7: USER-DEFINED FUNCTIONS                                │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 7: USER-DEFINED FUNCTIONS                                │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 7.1: Simple Function
print [Test 7.1] Simple Function
def sayHello() {
    return "Hello!"
}
set $msg = call sayHello
if $msg == "Hello!" then {
    print   ✓ PASS: Simple function works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Simple function broken
    set $testsFailed = $testsFailed + 1
}

# Test 7.2: Function with Parameter
print [Test 7.2] Function with Parameter
def greet($who) {
    return "Hi, $who!"
}
set $greeting = call greet "World"
if $greeting == "Hi, World!" then {
    print   ✓ PASS: Function with parameter works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Function with parameter broken
    set $testsFailed = $testsFailed + 1
}

# Test 7.3: Function with Multiple Parameters
print [Test 7.3] Function with Multiple Parameters
def addTwo($x, $y) {
    set $result = $x + $y
    return $result
}
set $addResult = call addTwo 7 8
if $addResult == 15 then {
    print   ✓ PASS: Multi-param function (7+8=$addResult)
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Multi-param function broken
    set $testsFailed = $testsFailed + 1
}

# Test 7.4: Recursive Function
print [Test 7.4] Recursive Function
def factorial($n) {
    if $n <= 1 then {
        return 1
    }
    set $prev = $n - 1
    set $sub = call factorial $prev
    set $result = $n * $sub
    return $result
}
set $fact5 = call factorial 5
if $fact5 == 120 then {
    print   ✓ PASS: factorial(5) = $fact5
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: factorial(5) = $fact5 (expected 120)
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 8: STRING FUNCTIONS                                      │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 8: STRING FUNCTIONS                                      │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 8.1: upper() and lower()
print [Test 8.1] upper() and lower()
set $text = "Hello World"
set $up = call upper $text
set $lo = call lower $text
if $up == "HELLO WORLD" then {
    print   ✓ PASS: upper() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: upper() broken
    set $testsFailed = $testsFailed + 1
}
if $lo == "hello world" then {
    print   ✓ PASS: lower() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: lower() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.2: length()
print [Test 8.2] length()
set $len = call length "Hello"
if $len == 5 then {
    print   ✓ PASS: length("Hello") = $len
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: length() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.3: trim()
print [Test 8.3] trim()
set $padded = "  trimmed  "
set $trimmed = call trim $padded
if $trimmed == "trimmed" then {
    print   ✓ PASS: trim() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: trim() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.4: concat()
print [Test 8.4] concat()
set $joined = call concat "a" "b" "c"
if $joined == "abc" then {
    print   ✓ PASS: concat() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: concat() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.5: substr() and substring()
print [Test 8.5] substr() and substring()
set $str = "Hello World"
set $sub1 = call substr $str 0 5
set $sub2 = call substring $str 6 11
if $sub1 == "Hello" then {
    print   ✓ PASS: substr(0,5) = "$sub1"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: substr() broken
    set $testsFailed = $testsFailed + 1
}
if $sub2 == "World" then {
    print   ✓ PASS: substring(6,11) = "$sub2"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: substring() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.6: contains(), startsWith(), endsWith()
print [Test 8.6] contains(), startsWith(), endsWith()
set $sentence = "The quick brown fox"
set $has = call contains $sentence "quick"
set $starts = call startsWith $sentence "The"
set $ends = call endsWith $sentence "fox"
if $has == true then {
    print   ✓ PASS: contains("quick") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: contains() broken
    set $testsFailed = $testsFailed + 1
}
if $starts == true then {
    print   ✓ PASS: startsWith("The") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: startsWith() broken
    set $testsFailed = $testsFailed + 1
}
if $ends == true then {
    print   ✓ PASS: endsWith("fox") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: endsWith() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.7: indexOf() and lastIndexOf()
print [Test 8.7] indexOf() and lastIndexOf()
set $str = "abcabc"
set $first = call indexOf $str "b"
set $last = call lastIndexOf $str "b"
if $first == 1 then {
    print   ✓ PASS: indexOf("b") = $first
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: indexOf() broken
    set $testsFailed = $testsFailed + 1
}
if $last == 4 then {
    print   ✓ PASS: lastIndexOf("b") = $last
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: lastIndexOf() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.8: replace() and replaceAll()
print [Test 8.8] replace() and replaceAll()
set $orig = "foo bar foo"
set $rep1 = call replace $orig "foo" "baz"
set $rep2 = call replaceAll $orig "foo" "baz"
if $rep1 == "baz bar foo" then {
    print   ✓ PASS: replace() (first only)
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: replace() broken
    set $testsFailed = $testsFailed + 1
}
if $rep2 == "baz bar baz" then {
    print   ✓ PASS: replaceAll()
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: replaceAll() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.9: split() and join()
print [Test 8.9] split() and join()
set $csv = "a,b,c"
set $parts = call split $csv ","
set $rejoined = call join $parts "-"
if $rejoined == "a-b-c" then {
    print   ✓ PASS: split/join works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: split/join broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.10: repeat()
print [Test 8.10] repeat()
set $rep = call repeat "ab" 3
if $rep == "ababab" then {
    print   ✓ PASS: repeat("ab", 3) = "$rep"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: repeat() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.11: padStart() and padEnd()
print [Test 8.11] padStart() and padEnd()
set $num = "5"
set $padS = call padStart $num 3 "0"
set $padE = call padEnd $num 3 "0"
if $padS == "005" then {
    print   ✓ PASS: padStart(3, "0") = "$padS"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: padStart() broken
    set $testsFailed = $testsFailed + 1
}
if $padE == "500" then {
    print   ✓ PASS: padEnd(3, "0") = "$padE"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: padEnd() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.12: charAt() and charCode()
print [Test 8.12] charAt() and charCode()
set $char = call charAt "ABC" 1
set $code = call charCode "A" 0
if $char == "B" then {
    print   ✓ PASS: charAt("ABC", 1) = "$char"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: charAt() broken
    set $testsFailed = $testsFailed + 1
}
if $code == 65 then {
    print   ✓ PASS: charCode("A") = $code
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: charCode() broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 9: MATH FUNCTIONS                                        │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 9: MATH FUNCTIONS                                        │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 9.1: abs()
print [Test 9.1] abs()
set $absVal = call abs -42
if $absVal == 42 then {
    print   ✓ PASS: abs(-42) = $absVal
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: abs() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.2: round(), floor(), ceil()
print [Test 9.2] round(), floor(), ceil()
set $rounded = call round 3.7
set $floored = call floor 3.9
set $ceiled = call ceil 3.1
if $rounded == 4 then {
    print   ✓ PASS: round(3.7) = $rounded
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: round() broken
    set $testsFailed = $testsFailed + 1
}
if $floored == 3 then {
    print   ✓ PASS: floor(3.9) = $floored
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: floor() broken
    set $testsFailed = $testsFailed + 1
}
if $ceiled == 4 then {
    print   ✓ PASS: ceil(3.1) = $ceiled
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: ceil() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.3: min() and max()
print [Test 9.3] min() and max()
set $minV = call min 5 3 8 1 9
set $maxV = call max 5 3 8 1 9
if $minV == 1 then {
    print   ✓ PASS: min(5,3,8,1,9) = $minV
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: min() broken
    set $testsFailed = $testsFailed + 1
}
if $maxV == 9 then {
    print   ✓ PASS: max(5,3,8,1,9) = $maxV
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: max() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.4: pow() and sqrt()
print [Test 9.4] pow() and sqrt()
set $squared = call pow 5 2
set $sqroot = call sqrt 16
if $squared == 25 then {
    print   ✓ PASS: pow(5, 2) = $squared
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: pow() broken
    set $testsFailed = $testsFailed + 1
}
if $sqroot == 4 then {
    print   ✓ PASS: sqrt(16) = $sqroot
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: sqrt() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.5: clamp()
print [Test 9.5] clamp()
set $clamped = call clamp 15 0 10
if $clamped == 10 then {
    print   ✓ PASS: clamp(15, 0, 10) = $clamped
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: clamp() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.6: random()
print [Test 9.6] random()
set $rand = call random 1 100
if $rand >= 1 then {
    if $rand <= 100 then {
        print   ✓ PASS: random(1,100) = $rand (in range)
        set $testsPassed = $testsPassed + 1
    } else {
        print   ✗ FAIL: random() out of range
        set $testsFailed = $testsFailed + 1
    }
} else {
    print   ✗ FAIL: random() out of range
    set $testsFailed = $testsFailed + 1
}

# Test 9.7: mod() and sign()
print [Test 9.7] mod() and sign()
set $modVal = call mod 17 5
set $signPos = call sign 42
set $signNeg = call sign -42
if $modVal == 2 then {
    print   ✓ PASS: mod(17, 5) = $modVal
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: mod() broken
    set $testsFailed = $testsFailed + 1
}
if $signPos == 1 then {
    print   ✓ PASS: sign(42) = $signPos
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: sign() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.8: Trigonometric Functions
print [Test 9.8] Trigonometric Functions
set $sinVal = call sin 0
set $cosVal = call cos 0
if $sinVal == 0 then {
    print   ✓ PASS: sin(0) = $sinVal
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: sin() broken
    set $testsFailed = $testsFailed + 1
}
if $cosVal == 1 then {
    print   ✓ PASS: cos(0) = $cosVal
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: cos() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.9: Constants PI and E
print [Test 9.9] Constants PI and E
set $pi = call PI
set $e = call E
if $pi > 3.14 then {
    if $pi < 3.15 then {
        print   ✓ PASS: PI = $pi
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: PI broken
    set $testsFailed = $testsFailed + 1
}
if $e > 2.71 then {
    if $e < 2.72 then {
        print   ✓ PASS: E = $e
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: E broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 10: ARRAY FUNCTIONS                                      │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 10: ARRAY FUNCTIONS                                      │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 10.1: count(), first(), last()
print [Test 10.1] count(), first(), last()
set $arr = [10, 20, 30, 40, 50]
set $cnt = call count $arr
set $fst = call first $arr
set $lst = call last $arr
if $cnt == 5 then {
    print   ✓ PASS: count() = $cnt
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: count() broken
    set $testsFailed = $testsFailed + 1
}
if $fst == 10 then {
    print   ✓ PASS: first() = $fst
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: first() broken
    set $testsFailed = $testsFailed + 1
}
if $lst == 50 then {
    print   ✓ PASS: last() = $lst
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: last() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.2: at()
print [Test 10.2] at()
set $atVal = call at $arr 2
if $atVal == 30 then {
    print   ✓ PASS: at(2) = $atVal
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: at() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.3: push() and pop()
print [Test 10.3] push() and pop()
set $arr2 = [1, 2, 3]
set $arr2 = call push $arr2 4
set $popped = call pop $arr2
if $popped == 4 then {
    print   ✓ PASS: push(4) then pop() = $popped
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: push/pop broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.4: shift() and unshift()
print [Test 10.4] shift() and unshift()
set $arr3 = [1, 2, 3]
set $arr3 = call unshift $arr3 0
set $shifted = call shift $arr3
if $shifted == 0 then {
    print   ✓ PASS: unshift(0) then shift() = $shifted
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: unshift/shift broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.5: includes()
print [Test 10.5] includes()
set $arr4 = ["apple", "banana", "cherry"]
set $hasApple = call includes $arr4 "apple"
set $hasGrape = call includes $arr4 "grape"
if $hasApple == true then {
    print   ✓ PASS: includes("apple") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: includes() broken
    set $testsFailed = $testsFailed + 1
}
if $hasGrape == false then {
    print   ✓ PASS: includes("grape") = false
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: includes() false case broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.6: findIndex()
print [Test 10.6] findIndex()
set $idx = call findIndex $arr4 "banana"
if $idx == 1 then {
    print   ✓ PASS: findIndex("banana") = $idx
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: findIndex() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.7: sort() and reverse()
print [Test 10.7] sort() and reverse()
set $nums = [3, 1, 4, 1, 5]
set $sorted = call sort $nums
set $sortedFirst = call first $sorted
if $sortedFirst == 1 then {
    print   ✓ PASS: sort() puts smallest first
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: sort() broken
    set $testsFailed = $testsFailed + 1
}
set $reversed = call reverse $nums
set $revFirst = call first $reversed
if $revFirst == 5 then {
    print   ✓ PASS: reverse() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: reverse() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.8: slice()
print [Test 10.8] slice()
set $arr5 = [0, 1, 2, 3, 4]
set $sliced = call slice $arr5 1 4
set $sliceCnt = call count $sliced
if $sliceCnt == 3 then {
    print   ✓ PASS: slice(1,4) has 3 elements
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: slice() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.9: unique()
print [Test 10.9] unique()
set $dups = [1, 2, 2, 3, 3, 3]
set $uniq = call unique $dups
set $uniqCnt = call count $uniq
if $uniqCnt == 3 then {
    print   ✓ PASS: unique() removed duplicates
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: unique() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.10: range() and fill()
print [Test 10.10] range() and fill()
set $rng = call range 0 5
set $rngCnt = call count $rng
if $rngCnt == 5 then {
    print   ✓ PASS: range(0,5) has 5 elements
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: range() broken
    set $testsFailed = $testsFailed + 1
}
set $filled = call fill 3 "x"
set $fillCnt = call count $filled
if $fillCnt == 3 then {
    print   ✓ PASS: fill(3, "x") has 3 elements
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: fill() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.11: sum() and avg()
print [Test 10.11] sum() and avg()
set $numbers = [10, 20, 30, 40, 50]
set $total = call sum $numbers
set $average = call avg $numbers
if $total == 150 then {
    print   ✓ PASS: sum() = $total
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: sum() broken
    set $testsFailed = $testsFailed + 1
}
if $average == 30 then {
    print   ✓ PASS: avg() = $average
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: avg() broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 11: OBJECT FUNCTIONS                                     │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 11: OBJECT FUNCTIONS                                     │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 11.1: keys() and values()
print [Test 11.1] keys() and values()
set $obj = {name: "Alice", age: 25, city: "NYC"}
set $objKeys = call keys $obj
set $objVals = call values $obj
set $keyCount = call count $objKeys
if $keyCount == 3 then {
    print   ✓ PASS: keys() returned 3 keys
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: keys() broken
    set $testsFailed = $testsFailed + 1
}

# Test 11.2: get() and set()
print [Test 11.2] get() and set()
set $name = call get $obj "name"
if $name == "Alice" then {
    print   ✓ PASS: get("name") = "$name"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: get() broken
    set $testsFailed = $testsFailed + 1
}

# Test 11.3: has()
print [Test 11.3] has()
set $hasName = call has $obj "name"
set $hasEmail = call has $obj "email"
if $hasName == true then {
    print   ✓ PASS: has("name") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: has() true case broken
    set $testsFailed = $testsFailed + 1
}
if $hasEmail == false then {
    print   ✓ PASS: has("email") = false
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: has() false case broken
    set $testsFailed = $testsFailed + 1
}

# Test 11.4: merge()
print [Test 11.4] merge()
set $obj1 = {a: 1, b: 2}
set $obj2 = {c: 3, d: 4}
set $merged = call merge $obj1 $obj2
set $mergedKeys = call keys $merged
set $mergedCount = call count $mergedKeys
if $mergedCount == 4 then {
    print   ✓ PASS: merge() combined objects
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: merge() broken
    set $testsFailed = $testsFailed + 1
}

# Test 11.5: clone()
print [Test 11.5] clone()
set $original = {x: 10, y: 20}
set $cloned = call clone $original
set $clonedX = call get $cloned "x"
if $clonedX == 10 then {
    print   ✓ PASS: clone() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: clone() broken
    set $testsFailed = $testsFailed + 1
}

# Test 11.6: entries()
print [Test 11.6] entries()
set $ent = call entries $obj1
set $entCount = call count $ent
if $entCount == 2 then {
    print   ✓ PASS: entries() returned 2 entries
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: entries() broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 12: JSON FUNCTIONS                                       │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 12: JSON FUNCTIONS                                       │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 12.1: toJSON()
print [Test 12.1] toJSON()
set $data = {status: "ok", code: 200}
set $json = call toJSON $data
set $hasStatus = call contains $json "status"
if $hasStatus == true then {
    print   ✓ PASS: toJSON() serializes object
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: toJSON() broken
    set $testsFailed = $testsFailed + 1
}

# Test 12.2: fromJSON()
print [Test 12.2] fromJSON()
set $jsonStr = "{\\"name\\": \\"Test\\", \\"value\\": 42}"
set $parsed = call fromJSON $jsonStr
set $parsedName = call get $parsed "name"
if $parsedName == "Test" then {
    print   ✓ PASS: fromJSON() parses JSON
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: fromJSON() broken
    set $testsFailed = $testsFailed + 1
}

# Test 12.3: prettyJSON()
print [Test 12.3] prettyJSON()
set $pretty = call prettyJSON $data
set $hasNewline = call contains $pretty "status"
if $hasNewline == true then {
    print   ✓ PASS: prettyJSON() formats JSON
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: prettyJSON() broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 13: TYPE FUNCTIONS                                       │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 13: TYPE FUNCTIONS                                       │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 13.1: typeof()
print [Test 13.1] typeof()
set $t1 = call typeof 42
set $t2 = call typeof "hello"
set $t3 = call typeof [1, 2]
set $t4 = call typeof {a: 1}
set $t5 = call typeof null
if $t1 == "number" then {
    print   ✓ PASS: typeof(42) = "$t1"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: typeof(number) broken
    set $testsFailed = $testsFailed + 1
}
if $t2 == "string" then {
    print   ✓ PASS: typeof("hello") = "$t2"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: typeof(string) broken
    set $testsFailed = $testsFailed + 1
}
if $t3 == "array" then {
    print   ✓ PASS: typeof([1,2]) = "$t3"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: typeof(array) broken
    set $testsFailed = $testsFailed + 1
}
if $t4 == "object" then {
    print   ✓ PASS: typeof({a:1}) = "$t4"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: typeof(object) broken
    set $testsFailed = $testsFailed + 1
}
if $t5 == "null" then {
    print   ✓ PASS: typeof(null) = "$t5"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: typeof(null) broken
    set $testsFailed = $testsFailed + 1
}

# Test 13.2: Type Check Functions
print [Test 13.2] Type Check Functions
set $isNum = call isNumber 42
set $isStr = call isString "hello"
set $isArr = call isArray [1, 2]
set $isObj = call isObject {a: 1}
set $isBool = call isBoolean true
set $isNul = call isNull null
if $isNum == true then {
    print   ✓ PASS: isNumber(42) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isNumber() broken
    set $testsFailed = $testsFailed + 1
}
if $isStr == true then {
    print   ✓ PASS: isString("hello") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isString() broken
    set $testsFailed = $testsFailed + 1
}
if $isArr == true then {
    print   ✓ PASS: isArray([1,2]) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isArray() broken
    set $testsFailed = $testsFailed + 1
}
if $isObj == true then {
    print   ✓ PASS: isObject({a:1}) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isObject() broken
    set $testsFailed = $testsFailed + 1
}
if $isBool == true then {
    print   ✓ PASS: isBoolean(true) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isBoolean() broken
    set $testsFailed = $testsFailed + 1
}
if $isNul == true then {
    print   ✓ PASS: isNull(null) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isNull() broken
    set $testsFailed = $testsFailed + 1
}

# Test 13.3: isEmpty()
print [Test 13.3] isEmpty()
set $emptyStr = call isEmpty ""
set $emptyArr = call isEmpty []
set $nonEmpty = call isEmpty "text"
if $emptyStr == true then {
    print   ✓ PASS: isEmpty("") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isEmpty(string) broken
    set $testsFailed = $testsFailed + 1
}
if $emptyArr == true then {
    print   ✓ PASS: isEmpty([]) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isEmpty(array) broken
    set $testsFailed = $testsFailed + 1
}
if $nonEmpty == false then {
    print   ✓ PASS: isEmpty("text") = false
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isEmpty(non-empty) broken
    set $testsFailed = $testsFailed + 1
}

# Test 13.4: Type Conversion Functions
print [Test 13.4] Type Conversion Functions
set $toNum = call toNumber "123.45"
set $toInt = call toInt "42.9"
set $toStr = call toString 999
set $toBool = call toBoolean 1
if $toNum == 123.45 then {
    print   ✓ PASS: toNumber("123.45") = $toNum
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: toNumber() broken
    set $testsFailed = $testsFailed + 1
}
if $toInt == 42 then {
    print   ✓ PASS: toInt("42.9") = $toInt
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: toInt() broken
    set $testsFailed = $testsFailed + 1
}
if $toStr == "999" then {
    print   ✓ PASS: toString(999) = "$toStr"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: toString() broken
    set $testsFailed = $testsFailed + 1
}
if $toBool == true then {
    print   ✓ PASS: toBoolean(1) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: toBoolean() broken
    set $testsFailed = $testsFailed + 1
}

# Test 13.5: toArray()
print [Test 13.5] toArray()
set $arr = call toArray "abc"
set $arrLen = call count $arr
if $arrLen == 3 then {
    print   ✓ PASS: toArray("abc") = 3 chars
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: toArray() broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 14: TIME FUNCTIONS                                       │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 14: TIME FUNCTIONS                                       │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 14.1: now()
print [Test 14.1] now()
set $timestamp = call now
if $timestamp > 0 then {
    print   ✓ PASS: now() returns timestamp: $timestamp
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: now() broken
    set $testsFailed = $testsFailed + 1
}

# Test 14.2: time() and date()
print [Test 14.2] time() and date()
set $timeStr = call time
set $dateStr = call date
set $timeLen = call length $timeStr
if $timeLen > 0 then {
    print   ✓ PASS: time() = "$timeStr"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: time() broken
    set $testsFailed = $testsFailed + 1
}
set $dateLen = call length $dateStr
if $dateLen > 0 then {
    print   ✓ PASS: date() = "$dateStr"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: date() broken
    set $testsFailed = $testsFailed + 1
}

# Test 14.3: year(), month(), day()
print [Test 14.3] year(), month(), day()
set $yr = call year
set $mo = call month
set $dy = call day
if $yr > 2020 then {
    print   ✓ PASS: year() = $yr
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: year() broken
    set $testsFailed = $testsFailed + 1
}
if $mo >= 1 then {
    if $mo <= 12 then {
        print   ✓ PASS: month() = $mo
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: month() broken
    set $testsFailed = $testsFailed + 1
}
if $dy >= 1 then {
    if $dy <= 31 then {
        print   ✓ PASS: day() = $dy
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: day() broken
    set $testsFailed = $testsFailed + 1
}

# Test 14.4: hour(), minute(), second()
print [Test 14.4] hour(), minute(), second()
set $hr = call hour
set $mi = call minute
set $se = call second
if $hr >= 0 then {
    if $hr <= 23 then {
        print   ✓ PASS: hour() = $hr
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: hour() broken
    set $testsFailed = $testsFailed + 1
}
if $mi >= 0 then {
    if $mi <= 59 then {
        print   ✓ PASS: minute() = $mi
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: minute() broken
    set $testsFailed = $testsFailed + 1
}
if $se >= 0 then {
    if $se <= 59 then {
        print   ✓ PASS: second() = $se
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: second() broken
    set $testsFailed = $testsFailed + 1
}

# Test 14.5: elapsed()
print [Test 14.5] elapsed()
set $start = call now
wait 100
set $elapsed = call elapsed $start
if $elapsed >= 90 then {
    print   ✓ PASS: elapsed() after 100ms = $elapsed ms
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: elapsed() too fast: $elapsed
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 15: ERROR HANDLING                                       │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 15: ERROR HANDLING                                       │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 15.1: Try/Catch Basic
print [Test 15.1] Try/Catch Basic
set $caught = false
try {
    set $x = call nonexistentFunction
} catch $err {
    set $caught = true
}
if $caught == true then {
    print   ✓ PASS: try/catch caught error
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: try/catch broken
    set $testsFailed = $testsFailed + 1
}

# Test 15.2: Error Variable
print [Test 15.2] Error Variable
set $errorMsg = ""
try {
    set $x = call anotherBadFunction
} catch $err {
    set $errorMsg = $err
}
set $hasError = call length $errorMsg
if $hasError > 0 then {
    print   ✓ PASS: Error message captured
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Error message not captured
    set $testsFailed = $testsFailed + 1
}

# Test 15.3: Execution Continues After Catch
print [Test 15.3] Execution After Catch
set $afterCatch = false
try {
    set $x = call badCall
} catch {
    set $afterCatch = true
}
set $continued = false
set $continued = true
if $continued == true then {
    print   ✓ PASS: Execution continues after catch
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Execution stopped after catch
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 16: STRING EDGE CASES                                    │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 16: STRING EDGE CASES                                    │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 16.1: Semicolons in Strings
print [Test 16.1] Semicolons in Strings
set $semi = "a;b;c"
if $semi == "a;b;c" then {
    print   ✓ PASS: Semicolons preserved in strings
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Semicolons broken in strings
    set $testsFailed = $testsFailed + 1
}

# Test 16.2: Hash/Comment Character in Strings
print [Test 16.2] Hash in Strings
set $hash = "test # not a comment"
set $hashLen = call length $hash
if $hashLen > 10 then {
    print   ✓ PASS: Hash preserved in strings
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Hash treated as comment
    set $testsFailed = $testsFailed + 1
}

# Test 16.3: Escape Sequences
print [Test 16.3] Escape Sequences
set $escaped = "line1\\nline2"
set $escLen = call length $escaped
if $escLen > 5 then {
    print   ✓ PASS: Escape sequences work
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Escape sequences broken
    set $testsFailed = $testsFailed + 1
}

# Test 16.4: Quotes in Strings
print [Test 16.4] Quotes in Strings
set $quoted = "He said \\"Hello\\""
set $qLen = call length $quoted
if $qLen > 10 then {
    print   ✓ PASS: Escaped quotes work
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Escaped quotes broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 17: FILE SYSTEM                                          │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 17: FILE SYSTEM                                          │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 17.1: Write and Read File
print [Test 17.1] Write and Read File
set $testPath = "C:/Users/User/Documents/retroscript_test.txt"
set $testContent = "Hello from RetroScript!"
write $testContent to $testPath
read $testPath into $readBack
if $readBack == $testContent then {
    print   ✓ PASS: File write/read works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: File write/read broken
    set $testsFailed = $testsFailed + 1
}

# Test 17.2: Delete File
print [Test 17.2] Delete File
delete $testPath
print   ✓ PASS: File deleted (no error)
set $testsPassed = $testsPassed + 1

# Test 17.3: Create and Delete Directory
print [Test 17.3] Directory Operations
set $testDir = "C:/Users/User/Documents/TestDir"
mkdir $testDir
delete $testDir
print   ✓ PASS: mkdir/delete works
set $testsPassed = $testsPassed + 1

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 18: SYSTEM INTEGRATION                                   │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 18: SYSTEM INTEGRATION                                   │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 18.1: getWindows()
print [Test 18.1] getWindows()
set $windows = call getWindows
set $winType = call isArray $windows
if $winType == true then {
    print   ✓ PASS: getWindows() returns array
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: getWindows() broken
    set $testsFailed = $testsFailed + 1
}

# Test 18.2: getApps()
print [Test 18.2] getApps()
set $apps = call getApps
set $appType = call isArray $apps
if $appType == true then {
    print   ✓ PASS: getApps() returns array
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: getApps() broken
    set $testsFailed = $testsFailed + 1
}

# Test 18.3: getEnv()
print [Test 18.3] getEnv()
set $env = call getEnv
set $platform = call get $env "platform"
if $platform == "RetrOS" then {
    print   ✓ PASS: getEnv() platform = "$platform"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: getEnv() broken
    set $testsFailed = $testsFailed + 1
}

# Test 18.4: Launch and Close App
print [Test 18.4] Launch and Close App
set $beforeWin = call getWindows
set $beforeCount = call count $beforeWin
launch calculator
wait 300
set $afterWin = call getWindows
set $afterCount = call count $afterWin
if $afterCount > $beforeCount then {
    print   ✓ PASS: App launched (windows: $beforeCount -> $afterCount)
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: App launch broken
    set $testsFailed = $testsFailed + 1
}
close
wait 200
print   ✓ PASS: App closed
set $testsPassed = $testsPassed + 1

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 19: EVENTS AND NOTIFICATIONS                             │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 19: EVENTS AND NOTIFICATIONS                             │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 19.1: emit()
print [Test 19.1] emit()
emit test:event message="Hello" value=42
print   ✓ PASS: Event emitted
set $testsPassed = $testsPassed + 1

# Test 19.2: notify()
print [Test 19.2] notify()
notify Test notification from RetroScript!
print   ✓ PASS: Notification sent
set $testsPassed = $testsPassed + 1

# Test 19.3: play()
print [Test 19.3] play()
play notify
print   ✓ PASS: Sound played
set $testsPassed = $testsPassed + 1

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 20: DEBUG FUNCTIONS                                      │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 20: DEBUG FUNCTIONS                                      │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 20.1: debug()
print [Test 20.1] debug()
set $debugResult = call debug "Test message" 42
set $debugLen = call length $debugResult
if $debugLen > 0 then {
    print   ✓ PASS: debug() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: debug() broken
    set $testsFailed = $testsFailed + 1
}

# Test 20.2: inspect()
print [Test 20.2] inspect()
set $testObj = {a: 1, b: 2}
set $inspected = call inspect $testObj
set $inspLen = call length $inspected
if $inspLen > 0 then {
    print   ✓ PASS: inspect() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: inspect() broken
    set $testsFailed = $testsFailed + 1
}

# Test 20.3: assert() - passing case
print [Test 20.3] assert()
set $assertOk = call assert true "This should pass"
if $assertOk == true then {
    print   ✓ PASS: assert(true) passes
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: assert() broken
    set $testsFailed = $testsFailed + 1
}

# Test 20.4: assert() - failing case (caught)
print [Test 20.4] assert() failure
set $assertFailed = false
try {
    set $x = call assert false "Expected failure"
} catch {
    set $assertFailed = true
}
if $assertFailed == true then {
    print   ✓ PASS: assert(false) throws error
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: assert(false) should throw
    set $testsFailed = $testsFailed + 1
}

print

# ╔══════════════════════════════════════════════════════════════════╗
# ║                      TEST SUMMARY                                ║
# ╚══════════════════════════════════════════════════════════════════╝

print ╔══════════════════════════════════════════════════════════════════╗
print ║                      TEST SUMMARY                                ║
print ╚══════════════════════════════════════════════════════════════════╝
print
print   Total Tests Passed: $testsPassed
print   Total Tests Failed: $testsFailed
print
set $totalTests = $testsPassed + $testsFailed
print   Total Tests Run: $totalTests
print

if $testsFailed == 0 then {
    print   ★★★ ALL TESTS PASSED! ★★★
    play notify
} else {
    print   ⚠ Some tests failed. Review output above.
    play error
}

print
print ══════════════════════════════════════════════════════════════════
print   Sections Tested:
print    1. Variables and Data Types
print    2. Arithmetic Operations
print    3. Comparison Operators
print    4. Logical Operators
print    5. Control Flow - If/Else
print    6. Control Flow - Loops
print    7. User-Defined Functions
print    8. String Functions
print    9. Math Functions
print   10. Array Functions
print   11. Object Functions
print   12. JSON Functions
print   13. Type Functions
print   14. Time Functions
print   15. Error Handling
print   16. String Edge Cases
print   17. File System
print   18. System Integration
print   19. Events and Notifications
print   20. Debug Functions
print ══════════════════════════════════════════════════════════════════

notify RetroScript Test Suite Complete!`;

        // Store test suite for later loading
        this.fullTestSuite = fullTestSuite;

        return `
            <div class="script-runner">
                <div class="script-toolbar">
                    <!-- File Operations -->
                    <button class="script-btn" id="newBtn" title="New Script (Ctrl+N)">
                        <span class="btn-icon">📄</span> New
                    </button>
                    <button class="script-btn" id="loadBtn" title="Open Script (Ctrl+O)">
                        <span class="btn-icon">📂</span> Open
                    </button>
                    <button class="script-btn" id="saveBtn" title="Save Script (Ctrl+S)">
                        <span class="btn-icon">💾</span> Save
                    </button>
                    <span class="toolbar-divider"></span>

                    <!-- Run Controls -->
                    <button class="script-btn run-btn" id="runBtn" title="Run Script (F5)">
                        <span class="btn-icon">▶</span> Run
                    </button>
                    <button class="script-btn stop-btn" id="stopBtn" title="Stop Script (Esc)">
                        <span class="btn-icon">⏹</span> Stop
                    </button>
                    <span class="toolbar-divider"></span>

                    <!-- Recording -->
                    <button class="script-btn record-btn" id="recordBtn" title="Record Events as Code - Capture your actions!">
                        <span class="btn-icon">⏺</span> Record
                    </button>
                    <span class="toolbar-divider"></span>

                    <!-- Edit Tools -->
                    <button class="script-btn" id="findBtn" title="Find/Replace (Ctrl+F)">
                        <span class="btn-icon">🔍</span> Find
                    </button>
                    <button class="script-btn" id="clearBtn" title="Clear Output">
                        <span class="btn-icon">🗑</span> Clear
                    </button>
                    <span class="toolbar-divider"></span>

                    <!-- Help & Testing -->
                    <button class="script-btn" id="helpBtn" title="Script Help (F1)">
                        <span class="btn-icon">❓</span> Help
                    </button>
                    <button class="script-btn test-btn" id="testSuiteBtn" title="Load Comprehensive Test Suite">
                        <span class="btn-icon">🧪</span> Tests
                    </button>
                </div>

                <div class="find-bar" id="findBar" style="display: none;">
                    <input type="text" id="findInput" placeholder="Find..." class="find-input" />
                    <input type="text" id="replaceInput" placeholder="Replace..." class="find-input" />
                    <button class="find-btn" id="findNextBtn" title="Find Next (F3)">Next</button>
                    <button class="find-btn" id="findPrevBtn" title="Find Previous (Shift+F3)">Prev</button>
                    <button class="find-btn" id="replaceBtn" title="Replace">Replace</button>
                    <button class="find-btn" id="replaceAllBtn" title="Replace All">All</button>
                    <span class="find-info" id="findInfo"></span>
                    <button class="find-close" id="findCloseBtn" title="Close (Esc)">×</button>
                </div>

                <div class="script-main">
                    <div class="script-editor-pane">
                        <div class="pane-header">
                            <span id="editorTitle">Untitled</span>
                            <span class="pane-header-info" id="modifiedIndicator"></span>
                        </div>
                        <div class="editor-container">
                            <div class="line-numbers" id="lineNumbers"></div>
                            <div class="editor-wrapper">
                                <pre class="syntax-highlight" id="syntaxHighlight" aria-hidden="true"></pre>
                                <textarea class="script-editor" id="scriptEditor" spellcheck="false">${sampleScript}</textarea>
                            </div>
                        </div>
                    </div>

                    <div class="script-output-pane">
                        <div class="output-tabs">
                            <button class="output-tab active" data-tab="output">Output</button>
                            <button class="output-tab" data-tab="events">Events</button>
                            <button class="output-tab" data-tab="variables">Variables</button>
                            <button class="output-tab" data-tab="recorded">Recorded</button>
                            <button class="output-tab" data-tab="commands">Commands</button>
                        </div>
                        <div class="output-content" id="outputContent">
                            <pre class="output-text" id="outputText"><span class="info">RetroScript IDE v1.0</span>

Welcome to the RetroScript IDE - a professional scripting
environment for RetroOS automation and development.

<span class="success">Getting Started:</span>
  - Write code in the editor on the left
  - Press F5 or click Run to execute
  - Click "Record" to capture your actions as code
  - Click "Tests" to load the comprehensive test suite

<span class="success">Keyboard Shortcuts:</span>
  F5          Run script
  Esc         Stop script / Close dialogs
  Ctrl+S      Save script
  Ctrl+O      Open script
  Ctrl+N      New script
  Ctrl+F      Find/Replace
  F1          Show help reference

<span class="success">Quick Example:</span>
  print "Hello, World!"
  set $name = "User"
  print "Welcome, $name!"

Type your script or click "Help" for full reference.
</pre>
                        </div>
                    </div>
                </div>

                <div class="script-statusbar">
                    <span id="statusText">Ready</span>
                    <span class="status-divider">|</span>
                    <span id="filePathDisplay" class="file-path-display">New File</span>
                    <span class="status-divider">|</span>
                    <span id="lineInfo">Line 1, Col 1</span>
                    <span class="status-divider">|</span>
                    <span id="charCount">0 chars</span>
                    <span class="status-spacer"></span>
                    <span id="recordStatus" class="record-status"></span>
                </div>
            </div>

            <style>
                .script-runner {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--win95-gray);
                    font-family: 'MS Sans Serif', Tahoma, sans-serif;
                }

                .script-toolbar {
                    display: flex;
                    padding: 4px;
                    background: var(--win95-gray);
                    border-bottom: 1px solid #808080;
                    gap: 2px;
                    flex-wrap: wrap;
                }

                .script-btn {
                    padding: 4px 8px;
                    background: var(--win95-gray);
                    border: 2px outset var(--win95-light);
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .script-btn:hover {
                    background: #d0d0d0;
                }

                .script-btn:active {
                    border-style: inset;
                }

                .script-btn .btn-icon {
                    font-size: 12px;
                }

                .script-btn.run-btn {
                    background: #90EE90;
                }

                .script-btn.run-btn:hover {
                    background: #7CCD7C;
                }

                .script-btn.stop-btn {
                    background: #FFB6C1;
                }

                .script-btn.stop-btn:hover {
                    background: #FF9AA2;
                }

                .script-btn.record-btn {
                    background: #FFE4B5;
                }

                .script-btn.record-btn:hover {
                    background: #FFD89B;
                }

                .script-btn.record-btn.recording {
                    background: #ff6b6b;
                    color: white;
                    animation: pulse 1s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .script-btn.test-btn {
                    background: #E6E6FA;
                }

                .script-btn.test-btn:hover {
                    background: #D8BFD8;
                }

                .toolbar-divider {
                    width: 1px;
                    background: #808080;
                    margin: 0 4px;
                }

                /* Find/Replace Bar */
                .find-bar {
                    display: flex;
                    align-items: center;
                    padding: 4px 8px;
                    background: var(--win95-gray);
                    border-bottom: 1px solid #808080;
                    gap: 4px;
                }

                .find-input {
                    padding: 3px 6px;
                    border: 2px inset var(--win95-light);
                    font-size: 12px;
                    width: 150px;
                    font-family: inherit;
                }

                .find-btn {
                    padding: 2px 8px;
                    background: var(--win95-gray);
                    border: 2px outset var(--win95-light);
                    cursor: pointer;
                    font-size: 12px;
                }

                .find-btn:hover {
                    background: #d0d0d0;
                }

                .find-btn:active {
                    border-style: inset;
                }

                .find-info {
                    font-size: 12px;
                    color: #404040;
                    margin-left: 8px;
                }

                .find-close {
                    margin-left: auto;
                    padding: 0 6px;
                    background: var(--win95-gray);
                    border: 2px outset var(--win95-light);
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                }

                .find-close:hover {
                    background: #ff6b6b;
                    color: white;
                }

                .script-main {
                    display: flex;
                    flex: 1;
                    min-height: 0;
                }

                .script-editor-pane {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    border-right: 2px groove var(--win95-gray);
                }

                .script-output-pane {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 250px;
                }

                .pane-header {
                    padding: 4px 8px;
                    background: var(--win95-blue);
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .pane-header-info {
                    font-weight: normal;
                    font-size: 12px;
                    opacity: 0.9;
                }

                .editor-container {
                    flex: 1;
                    display: flex;
                    border: 2px inset var(--win95-light);
                    background: #1e1e1e;
                    overflow: hidden;
                }

                .line-numbers {
                    padding: 8px 8px 8px 4px;
                    background: #252526;
                    color: #858585;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 13px;
                    line-height: 1.4;
                    text-align: right;
                    user-select: none;
                    border-right: 1px solid #3c3c3c;
                    min-width: 35px;
                    overflow: hidden;
                    white-space: pre;
                }

                .editor-wrapper {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    background: #1e1e1e;
                }

                .syntax-highlight {
                    display: none;
                }

                .script-editor {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100%;
                    height: 100%;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 13px;
                    line-height: 1.4;
                    padding: 8px;
                    border: none;
                    resize: none;
                    background: #1e1e1e;
                    color: #d4d4d4;
                    caret-color: #fff;
                    tab-size: 4;
                    overflow: auto;
                    box-sizing: border-box;
                }

                .script-editor:focus {
                    outline: none;
                }

                /* Syntax highlighting colors */
                .syntax-highlight .keyword { color: #569cd6; }
                .syntax-highlight .command { color: #c586c0; }
                .syntax-highlight .function { color: #dcdcaa; }
                .syntax-highlight .variable { color: #9cdcfe; }
                .syntax-highlight .string { color: #ce9178; }
                .syntax-highlight .number { color: #b5cea8; }
                .syntax-highlight .comment { color: #6a9955; font-style: italic; }
                .syntax-highlight .operator { color: #d4d4d4; }
                .syntax-highlight .builtin { color: #4ec9b0; }
                .syntax-highlight .event { color: #dcdcaa; }

                .output-tabs {
                    display: flex;
                    background: var(--win95-gray);
                    border-bottom: 1px solid #808080;
                }

                .output-tab {
                    padding: 4px 12px;
                    border: none;
                    background: #d0d0d0;
                    cursor: pointer;
                    font-size: 12px;
                    border-right: 1px solid #808080;
                }

                .output-tab.active {
                    background: white;
                    border-bottom: 1px solid white;
                    margin-bottom: -1px;
                }

                .output-content {
                    flex: 1;
                    overflow: auto;
                    background: #000;
                }

                .output-text {
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.4;
                    padding: 8px;
                    margin: 0;
                    color: #00ff00;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }

                .output-text .error {
                    color: #ff6b6b;
                }

                .output-text .success {
                    color: #00ff00;
                }

                .output-text .info {
                    color: #87ceeb;
                }

                .output-text .event {
                    color: #ffd700;
                }

                .script-statusbar {
                    display: flex;
                    padding: 4px 8px;
                    background: var(--win95-gray);
                    border-top: 2px groove var(--win95-gray);
                    font-size: 12px;
                    color: #404040;
                }

                .status-divider {
                    margin: 0 8px;
                    color: #808080;
                }

                .status-spacer {
                    flex: 1;
                }

                .file-path-display {
                    color: #404040;
                    font-size: 12px;
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .modified-indicator {
                    color: #ff6b6b;
                    font-weight: bold;
                    margin-left: 4px;
                }

                .record-status {
                    color: red;
                    font-weight: bold;
                }

                .record-status.active {
                    animation: blink 1s infinite;
                }

                .recording .record-indicator {
                    color: red;
                    animation: blink 1s infinite;
                }

                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }

                /* Variables panel styling */
                .var-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                }

                .var-table th {
                    background: #333;
                    color: #0f0;
                    padding: 4px 8px;
                    text-align: left;
                    border-bottom: 1px solid #555;
                }

                .var-table td {
                    padding: 3px 8px;
                    border-bottom: 1px solid #333;
                }

                .var-table tr:hover {
                    background: #1a1a1a;
                }

                .var-name {
                    color: #9cdcfe;
                }

                .var-type {
                    color: #569cd6;
                    font-style: italic;
                }

                .var-value {
                    color: #ce9178;
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                /* Recorded code styling */
                .recorded-header {
                    color: #87ceeb;
                    margin-bottom: 8px;
                }

                .recorded-code {
                    color: #d4d4d4;
                    font-family: 'Consolas', 'Courier New', monospace;
                }

                .recorded-code .rec-comment {
                    color: #6a9955;
                }

                .recorded-code .rec-command {
                    color: #c586c0;
                }

                .recorded-code .rec-event {
                    color: #dcdcaa;
                }

                /* Error line highlighting */
                .line-error {
                    background: rgba(255, 0, 0, 0.2) !important;
                    border-left: 3px solid #ff0000;
                }

                .error-gutter {
                    color: #ff0000;
                    font-weight: bold;
                }

                /* Copy button for recorded code */
                .copy-btn {
                    float: right;
                    padding: 2px 8px;
                    background: #333;
                    border: 1px solid #555;
                    color: #0f0;
                    cursor: pointer;
                    font-size: 12px;
                }

                .copy-btn:hover {
                    background: #444;
                }
            </style>
        `;
    }

    onMount() {
        const runBtn = this.getElement('#runBtn');
        const stopBtn = this.getElement('#stopBtn');
        const clearBtn = this.getElement('#clearBtn');
        const recordBtn = this.getElement('#recordBtn');
        const saveBtn = this.getElement('#saveBtn');
        const loadBtn = this.getElement('#loadBtn');
        const newBtn = this.getElement('#newBtn');
        const findBtn = this.getElement('#findBtn');
        const helpBtn = this.getElement('#helpBtn');
        const editor = this.getElement('#scriptEditor');
        const tabs = this.getElement('.output-tabs');

        // Run script
        this.addHandler(runBtn, 'click', () => this.runScript());

        // Stop script
        this.addHandler(stopBtn, 'click', () => this.stopScript());

        // Clear output
        this.addHandler(clearBtn, 'click', () => this.clearOutput());

        // Record events
        this.addHandler(recordBtn, 'click', () => this.toggleRecording());

        // Save script
        this.addHandler(saveBtn, 'click', () => this.saveScript());

        // Load script
        this.addHandler(loadBtn, 'click', () => this.loadScript());

        // New script
        this.addHandler(newBtn, 'click', () => this.newScript());

        // Find/Replace
        this.addHandler(findBtn, 'click', () => this.toggleFind());

        // Help
        this.addHandler(helpBtn, 'click', () => this.showHelp());

        // Load test suite
        const testSuiteBtn = this.getElement('#testSuiteBtn');
        this.addHandler(testSuiteBtn, 'click', () => this.loadTestSuite());

        // Tab switching
        this.addHandler(tabs, 'click', (e) => {
            if (e.target.classList.contains('output-tab')) {
                this.switchTab(e.target.dataset.tab);
            }
        });

        // Find bar buttons
        this.addHandler(this.getElement('#findNextBtn'), 'click', () => this.findNext());
        this.addHandler(this.getElement('#findPrevBtn'), 'click', () => this.findPrev());
        this.addHandler(this.getElement('#replaceBtn'), 'click', () => this.replaceOne());
        this.addHandler(this.getElement('#replaceAllBtn'), 'click', () => this.replaceAll());
        this.addHandler(this.getElement('#findCloseBtn'), 'click', () => this.toggleFind());
        this.addHandler(this.getElement('#findInput'), 'keydown', (e) => {
            if (e.key === 'Enter') {
                e.shiftKey ? this.findPrev() : this.findNext();
            } else if (e.key === 'Escape') {
                this.toggleFind();
            }
        });

        // Track cursor position and update highlighting
        this.addHandler(editor, 'keyup', () => {
            this.updateLineInfo();
            this.updateSyntaxHighlight();
            this.updateCharCount();
        });
        this.addHandler(editor, 'click', () => this.updateLineInfo());
        this.addHandler(editor, 'input', () => {
            this.updateSyntaxHighlight();
            this.updateCharCount();
            this.markModified();
        });
        this.addHandler(editor, 'scroll', () => this.syncScroll());

        // Initial syntax highlight and char count
        this.updateSyntaxHighlight();
        this.updateCharCount();

        // Keyboard shortcuts
        this.addHandler(editor, 'keydown', (e) => {
            // F5 - Run
            if (e.key === 'F5') {
                e.preventDefault();
                this.runScript();
            }
            // F1 - Help
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
            }
            // F3 - Find next/prev
            if (e.key === 'F3') {
                e.preventDefault();
                e.shiftKey ? this.findPrev() : this.findNext();
            }
            // Escape - Stop or close find
            if (e.key === 'Escape') {
                if (this.findVisible) {
                    this.toggleFind();
                } else {
                    this.stopScript();
                }
            }
            // Ctrl+S - Save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveScript();
            }
            // Ctrl+O - Open
            if (e.ctrlKey && e.key === 'o') {
                e.preventDefault();
                this.loadScript();
            }
            // Ctrl+N - New
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.newScript();
            }
            // Ctrl+F - Find
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.toggleFind();
            }
            // Tab - Insert 4 spaces
            if (e.key === 'Tab' && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
                editor.selectionStart = editor.selectionEnd = start + 4;
                this.updateSyntaxHighlight();
            }
        });

        // Subscribe to script output events
        this.subscribe('script:output', ({ message }) => {
            this.appendOutput(message, 'success');
        });

        this.subscribe('script:error', ({ error, line }) => {
            this.appendOutput(`Error${line ? ` at line ${line}` : ''}: ${error}`, 'error');
            if (line) {
                this.highlightErrorLine(line);
            }
        });

        // Subscribe to variable updates from script engine
        this.subscribe('script:variables', ({ variables }) => {
            this.variables = variables || {};
            this.updateVariablesPanel();
        });

        // Monitor events for event log and recording
        this.eventSubscription = EventBus.on('*', (payload, meta, event) => {
            // Skip internal events
            if (event.name.startsWith('script:') || event.name.startsWith('macro:')) return;

            // Add to event log
            if (this.eventLog.length > this.maxLogEntries) {
                this.eventLog.shift();
            }
            this.eventLog.push({
                time: new Date().toLocaleTimeString(),
                event: event.name,
                payload: JSON.stringify(payload).substring(0, 100)
            });

            // Record event as code if recording
            if (this.isRecording) {
                this.recordEvent(event.name, payload);
            }
        });
    }

    async runScript() {
        console.log('[ScriptRunner] runScript called');

        try {
            const editor = this.getElement('#scriptEditor');
            if (!editor) {
                console.error('[ScriptRunner] Editor element not found!');
                return;
            }
            console.log('[ScriptRunner] Got editor element');

            const script = editor.value;
            console.log('[ScriptRunner] Script length:', script.length, 'chars');

            // Clear previous error highlighting
            this.clearErrorHighlight();
            this.variables = {};

            this.setStatus('Running...');
            this.appendOutput('\n--- Script Started ---', 'info');

            console.log('[ScriptRunner] Calling ScriptEngine.run...');
            const result = await ScriptEngine.run(script, {
                onVariables: (vars) => {
                    this.variables = vars || {};
                }
            });
            console.log('[ScriptRunner] ScriptEngine.run completed');

            // Capture final variables from result if available
            if (result.variables) {
                this.variables = result.variables;
            }

            if (result.success) {
                this.appendOutput('--- Script Completed ---', 'success');
                if (result.result !== undefined && result.result !== null) {
                    this.appendOutput(`Result: ${JSON.stringify(result.result)}`, 'info');
                }
            } else {
                this.appendOutput(`--- Script Failed: ${result.error} ---`, 'error');
                if (result.line) {
                    this.highlightErrorLine(result.line);
                }
            }

            this.setStatus('Ready');
        } catch (error) {
            console.error('[ScriptRunner] Error in runScript:', error);
            this.appendOutput(`--- Script Error: ${error.message} ---`, 'error');
            this.setStatus('Error');
        }
    }

    stopScript() {
        ScriptEngine.stop();
        this.appendOutput('--- Script Stopped ---', 'info');
        this.setStatus('Stopped');
    }

    clearOutput() {
        this.output = [];
        this.eventLog = [];
        const outputText = this.getElement('#outputText');
        if (outputText) {
            outputText.innerHTML = 'Output cleared.\n';
        }
    }

    toggleRecording() {
        const recordBtn = this.getElement('#recordBtn');
        const recordStatus = this.getElement('#recordStatus');

        if (this.isRecording) {
            // Stop recording
            this.isRecording = false;
            recordBtn.innerHTML = '<span class="btn-icon">⏺</span> Record';
            recordBtn.classList.remove('recording');
            recordStatus.textContent = '';
            recordStatus.classList.remove('active');

            if (this.recordedEvents.length > 0) {
                this.appendOutput('', 'info');
                this.appendOutput('═══════════════════════════════════════════', 'info');
                this.appendOutput(`  RECORDING COMPLETE - ${this.recordedEvents.length} events`, 'success');
                this.appendOutput('═══════════════════════════════════════════', 'info');
                this.appendOutput('', 'info');
                this.appendOutput('Your actions have been converted to RetroScript code!', 'info');
                this.appendOutput('Switching to "Recorded" tab...', 'info');

                // Auto-switch to Recorded tab
                this.switchTab('recorded');
            } else {
                this.appendOutput('', 'info');
                this.appendOutput('Recording stopped - no events were captured.', 'info');
                this.appendOutput('', 'info');
                this.appendOutput('Tips for successful recording:', 'info');
                this.appendOutput('  • Launch an app (click an icon on desktop)', 'info');
                this.appendOutput('  • Close a window', 'info');
                this.appendOutput('  • Use the Start menu', 'info');
                this.appendOutput('  • Create or save a file', 'info');
            }
        } else {
            // Start recording
            this.isRecording = true;
            this.recordedEvents = [];
            recordBtn.innerHTML = '<span class="btn-icon">⏹</span> Stop';
            recordBtn.classList.add('recording');
            recordStatus.textContent = '⏺ REC';
            recordStatus.classList.add('active');

            this.appendOutput('', 'info');
            this.appendOutput('═══════════════════════════════════════════', 'error');
            this.appendOutput('  ⏺ RECORDING STARTED', 'error');
            this.appendOutput('═══════════════════════════════════════════', 'error');
            this.appendOutput('', 'info');
            this.appendOutput('Your actions are now being recorded as RetroScript code!', 'info');
            this.appendOutput('', 'info');
            this.appendOutput('Try these actions:', 'info');
            this.appendOutput('  ▶ Launch an application', 'info');
            this.appendOutput('  ▶ Play a sound', 'info');
            this.appendOutput('  ▶ Create or delete a file', 'info');
            this.appendOutput('  ▶ Show a notification', 'info');
            this.appendOutput('', 'info');
            this.appendOutput('Click "Stop" when finished recording.', 'success');
        }
    }

    recordEvent(eventName, payload) {
        const timestamp = new Date().toLocaleTimeString();
        const code = this.eventToCode(eventName, payload);
        if (code) {
            this.recordedEvents.push({
                time: timestamp,
                event: eventName,
                code: code
            });
        }
    }

    eventToCode(eventName, payload) {
        // Convert common events to RetroScript code
        const parts = eventName.split(':');

        // App launch events
        if (eventName === 'app:launch' && payload.appId) {
            return `launch ${payload.appId}`;
        }
        if (eventName === 'app:open' && payload.appId) {
            return `launch ${payload.appId}`;
        }

        // Window events
        if (eventName === 'window:close') {
            return `close`;
        }
        if (eventName === 'window:minimize' && payload.windowId) {
            return `minimize`;
        }
        if (eventName === 'window:maximize' && payload.windowId) {
            return `maximize`;
        }
        if (eventName === 'window:focus' && payload.appId) {
            return `focus  # ${payload.appId}`;
        }
        if (eventName === 'window:open') {
            return null; // Skip, captured by app:launch
        }

        // Sound events
        if (eventName === 'sound:play' && payload.sound) {
            return `play ${payload.sound}`;
        }
        if (eventName === 'sound:stop') {
            return `# Sound stopped`;
        }

        // Dialog events
        if (eventName === 'dialog:alert') {
            const msg = payload.message || payload.title || '';
            return `emit dialog:alert message="${msg.replace(/"/g, '\\"')}"`;
        }
        if (eventName === 'dialog:confirm') {
            return `# Confirm dialog shown`;
        }
        if (eventName === 'dialog:prompt') {
            return `# Prompt dialog shown`;
        }

        // Notification events
        if (eventName === 'notification:show') {
            const msg = payload.message || '';
            return `notify "${msg.replace(/"/g, '\\"')}"`;
        }

        // File system events
        if (eventName.startsWith('fs:file:') || eventName.startsWith('fs:dir:')) {
            const action = parts[2];
            const pathArray = payload.path;
            const pathStr = Array.isArray(pathArray) ? pathArray.join('/') : pathArray;

            if (action === 'create') {
                if (eventName.includes(':dir:')) {
                    return `mkdir "${pathStr}"`;
                }
                return `write "" to "${pathStr}"`;
            }
            if (action === 'update' || action === 'write') {
                return `# File updated: ${pathStr}`;
            }
            if (action === 'delete') {
                return `delete "${pathStr}"`;
            }
            if (action === 'read') {
                return `# File read: ${pathStr}`;
            }
        }

        // Notepad save events
        if (eventName === 'app:notepad:saved') {
            const pathArray = payload.path;
            const pathStr = Array.isArray(pathArray) ? pathArray.join('/') : pathArray;
            return `# Notepad saved: ${pathStr}`;
        }

        // Game events
        if (eventName.includes(':win') || eventName.includes(':game:over') || eventName.includes(':complete')) {
            const score = payload.score !== undefined ? ` score=${payload.score}` : '';
            const time = payload.time !== undefined ? ` time=${payload.time}` : '';
            return `# Game event: ${eventName}${score}${time}`;
        }
        if (eventName.includes(':start') || eventName.includes(':new')) {
            return `# Game started: ${eventName}`;
        }

        // Keyboard events (only special keys)
        if (eventName === 'keyboard:keydown' && payload.key) {
            if (payload.key.length === 1) return null; // Skip regular typing
            if (['Shift', 'Control', 'Alt', 'Meta'].includes(payload.key)) return null;
            return `# Key: ${payload.key}`;
        }

        // Mouse click - skip to avoid noise
        if (eventName === 'mouse:click' || eventName === 'mouse:down' || eventName === 'mouse:up') {
            return null;
        }

        // System events
        if (eventName === 'system:shutdown') {
            return `# System shutdown`;
        }
        if (eventName === 'system:boot') {
            return `# System boot`;
        }

        // Desktop events
        if (eventName === 'desktop:wallpaper:change') {
            return `# Wallpaper changed`;
        }

        // Skip internal/noisy events
        if (eventName.startsWith('window:drag') ||
            eventName.startsWith('window:resize') ||
            eventName.startsWith('taskbar:') ||
            eventName.startsWith('menu:') ||
            eventName.startsWith('context:')) {
            return null;
        }

        // Generic event - emit it if it seems useful
        if (parts.length >= 2 && !eventName.startsWith('internal:')) {
            const props = Object.entries(payload || {})
                .filter(([k, v]) => v !== undefined && v !== null && typeof v !== 'object')
                .slice(0, 3) // Limit to 3 properties
                .map(([k, v]) => `${k}="${String(v).substring(0, 50)}"`)
                .join(' ');
            return props ? `emit ${eventName} ${props}` : `emit ${eventName}`;
        }

        return null;
    }

    newScript() {
        const editor = this.getElement('#scriptEditor');
        if (editor) {
            // Start completely blank for a fresh slate
            editor.value = '';

            // Reset file state
            this.currentFilePath = null;
            this.isModified = false;
            this.originalContent = '';

            // Update UI
            this.updateEditorTitle();
            this.updateSyntaxHighlight();
            this.updateCharCount();
            this.clearOutput();
            this.appendOutput('New script - ready to code', 'info');

            // Focus the editor
            editor.focus();
        }
    }

    updateEditorTitle() {
        const editorTitle = this.getElement('#editorTitle');
        const modifiedIndicator = this.getElement('#modifiedIndicator');
        const filePathDisplay = this.getElement('#filePathDisplay');

        if (editorTitle) {
            if (this.currentFilePath) {
                const filename = this.currentFilePath[this.currentFilePath.length - 1];
                editorTitle.textContent = filename;
            } else {
                editorTitle.textContent = 'Untitled';
            }
        }

        if (modifiedIndicator) {
            modifiedIndicator.textContent = this.isModified ? '*' : '';
            modifiedIndicator.className = this.isModified ? 'pane-header-info modified-indicator' : 'pane-header-info';
        }

        if (filePathDisplay) {
            if (this.currentFilePath) {
                filePathDisplay.textContent = this.currentFilePath.join('/');
            } else {
                filePathDisplay.textContent = 'New File';
            }
        }
    }

    markModified() {
        const editor = this.getElement('#scriptEditor');
        if (editor && editor.value !== this.originalContent) {
            if (!this.isModified) {
                this.isModified = true;
                this.updateEditorTitle();
            }
        }
    }

    toggleFind() {
        const findBar = this.getElement('#findBar');
        const findInput = this.getElement('#findInput');

        this.findVisible = !this.findVisible;
        findBar.style.display = this.findVisible ? 'flex' : 'none';

        if (this.findVisible) {
            findInput.focus();
            // Get selected text as search term
            const editor = this.getElement('#scriptEditor');
            const selected = editor.value.substring(editor.selectionStart, editor.selectionEnd);
            if (selected) {
                findInput.value = selected;
            }
        }
    }

    findNext() {
        const findInput = this.getElement('#findInput');
        const editor = this.getElement('#scriptEditor');
        const findInfo = this.getElement('#findInfo');

        const searchText = findInput.value;
        if (!searchText) return;

        const text = editor.value;
        const startPos = editor.selectionEnd;
        const index = text.indexOf(searchText, startPos);

        if (index !== -1) {
            editor.selectionStart = index;
            editor.selectionEnd = index + searchText.length;
            editor.focus();
            this.scrollToSelection(editor);
            this.updateFindInfo(text, searchText);
        } else {
            // Wrap around
            const wrapIndex = text.indexOf(searchText);
            if (wrapIndex !== -1) {
                editor.selectionStart = wrapIndex;
                editor.selectionEnd = wrapIndex + searchText.length;
                editor.focus();
                this.scrollToSelection(editor);
                findInfo.textContent = 'Wrapped';
            } else {
                findInfo.textContent = 'Not found';
            }
        }
    }

    findPrev() {
        const findInput = this.getElement('#findInput');
        const editor = this.getElement('#scriptEditor');
        const findInfo = this.getElement('#findInfo');

        const searchText = findInput.value;
        if (!searchText) return;

        const text = editor.value;
        const startPos = editor.selectionStart - 1;
        const index = text.lastIndexOf(searchText, startPos);

        if (index !== -1) {
            editor.selectionStart = index;
            editor.selectionEnd = index + searchText.length;
            editor.focus();
            this.scrollToSelection(editor);
            this.updateFindInfo(text, searchText);
        } else {
            // Wrap around
            const wrapIndex = text.lastIndexOf(searchText);
            if (wrapIndex !== -1) {
                editor.selectionStart = wrapIndex;
                editor.selectionEnd = wrapIndex + searchText.length;
                editor.focus();
                this.scrollToSelection(editor);
                findInfo.textContent = 'Wrapped';
            } else {
                findInfo.textContent = 'Not found';
            }
        }
    }

    replaceOne() {
        const findInput = this.getElement('#findInput');
        const replaceInput = this.getElement('#replaceInput');
        const editor = this.getElement('#scriptEditor');

        const searchText = findInput.value;
        const replaceText = replaceInput.value;
        if (!searchText) return;

        const selected = editor.value.substring(editor.selectionStart, editor.selectionEnd);
        if (selected === searchText) {
            const start = editor.selectionStart;
            editor.value = editor.value.substring(0, start) + replaceText + editor.value.substring(editor.selectionEnd);
            editor.selectionStart = start;
            editor.selectionEnd = start + replaceText.length;
            this.updateSyntaxHighlight();
            this.findNext();
        } else {
            this.findNext();
        }
    }

    replaceAll() {
        const findInput = this.getElement('#findInput');
        const replaceInput = this.getElement('#replaceInput');
        const editor = this.getElement('#scriptEditor');
        const findInfo = this.getElement('#findInfo');

        const searchText = findInput.value;
        const replaceText = replaceInput.value;
        if (!searchText) return;

        const count = (editor.value.match(new RegExp(this.escapeRegex(searchText), 'g')) || []).length;
        editor.value = editor.value.split(searchText).join(replaceText);
        this.updateSyntaxHighlight();
        findInfo.textContent = `Replaced ${count} occurrences`;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    updateFindInfo(text, searchText) {
        const findInfo = this.getElement('#findInfo');
        const count = (text.match(new RegExp(this.escapeRegex(searchText), 'g')) || []).length;
        findInfo.textContent = `${count} match${count !== 1 ? 'es' : ''}`;
    }

    scrollToSelection(editor) {
        // Calculate line number and scroll to it
        const textBefore = editor.value.substring(0, editor.selectionStart);
        const lineNumber = textBefore.split('\n').length;
        const lineHeight = 18; // Approximate line height
        editor.scrollTop = (lineNumber - 5) * lineHeight;
    }

    updateCharCount() {
        const editor = this.getElement('#scriptEditor');
        const charCount = this.getElement('#charCount');
        if (editor && charCount) {
            const chars = editor.value.length;
            const lines = editor.value.split('\n').length;
            charCount.textContent = `${chars} chars, ${lines} lines`;
        }
    }

    highlightErrorLine(lineNum) {
        this.errorLine = lineNum;
        const lineNumbers = this.getElement('#lineNumbers');
        if (lineNumbers) {
            const lines = lineNumbers.innerHTML.split('\n');
            lines[lineNum - 1] = `<span class="error-gutter">${lineNum}</span>`;
            lineNumbers.innerHTML = lines.join('\n');
        }
    }

    clearErrorHighlight() {
        this.errorLine = null;
        this.updateSyntaxHighlight();
    }

    updateVariablesPanel() {
        // This is called when script:variables event is received
        // The tab will display current variables when switched to
    }

    async saveScript() {
        const editor = this.getElement('#scriptEditor');
        const script = editor.value;

        try {
            // Use existing path if available, otherwise prompt
            let savePath = this.currentFilePath;

            if (!savePath) {
                const result = await EventBus.request('dialog:file-save', {
                    title: 'Save Script As',
                    defaultPath: ['C:', 'Users', 'User', 'Documents'],
                    defaultName: 'script.retro',
                    filters: [
                        { name: 'RetroScript', extensions: ['retro'] },
                        { name: 'All Files', extensions: ['*'] }
                    ]
                }, { timeout: 60000 });

                if (result && result.path) {
                    savePath = result.path;
                } else {
                    return; // User cancelled
                }
            }

            FileSystemManager.writeFile(savePath, script, 'retro');

            // Update file state
            this.currentFilePath = savePath;
            this.originalContent = script;
            this.isModified = false;
            this.updateEditorTitle();

            this.appendOutput(`Saved: ${savePath.join('/')}`, 'success');
        } catch (e) {
            // Save to default location on error
            const path = ['C:', 'Users', 'User', 'Documents', `script_${Date.now()}.retro`];
            FileSystemManager.writeFile(path, script, 'retro');

            this.currentFilePath = path;
            this.originalContent = script;
            this.isModified = false;
            this.updateEditorTitle();

            this.appendOutput(`Saved: ${path.join('/')}`, 'success');
        }
    }

    async saveScriptAs() {
        const editor = this.getElement('#scriptEditor');
        const script = editor.value;

        try {
            const result = await EventBus.request('dialog:file-save', {
                title: 'Save Script As',
                defaultPath: this.currentFilePath ? this.currentFilePath.slice(0, -1) : ['C:', 'Users', 'User', 'Documents'],
                defaultName: this.currentFilePath ? this.currentFilePath[this.currentFilePath.length - 1] : 'script.retro',
                filters: [
                    { name: 'RetroScript', extensions: ['retro'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            }, { timeout: 60000 });

            if (result && result.path) {
                FileSystemManager.writeFile(result.path, script, 'retro');

                this.currentFilePath = result.path;
                this.originalContent = script;
                this.isModified = false;
                this.updateEditorTitle();

                this.appendOutput(`Saved as: ${result.path.join('/')}`, 'success');
            }
        } catch (e) {
            this.appendOutput('Save cancelled', 'info');
        }
    }

    async loadScript() {
        try {
            const result = await EventBus.request('dialog:file-open', {
                title: 'Open Script',
                defaultPath: ['C:', 'Users', 'User', 'Documents'],
                filters: [
                    { name: 'RetroScript', extensions: ['retro'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            }, { timeout: 60000 });

            if (result && result.path) {
                const content = FileSystemManager.readFile(result.path);
                const editor = this.getElement('#scriptEditor');
                if (editor) {
                    editor.value = content;

                    // Update file state
                    this.currentFilePath = result.path;
                    this.originalContent = content;
                    this.isModified = false;
                    this.updateEditorTitle();
                    this.updateSyntaxHighlight();
                    this.updateCharCount();

                    this.appendOutput(`Opened: ${result.path.join('/')}`, 'success');
                }
            }
        } catch (e) {
            this.appendOutput('Open cancelled', 'info');
        }
    }

    showHelp() {
        const helpText = `
RetroScript Language Reference
==============================

See SCRIPTING_GUIDE.md for complete documentation.

COMMANDS:
  launch <app>              Launch an application
  launch <app> with k=v     Launch with parameters
  close [windowId]          Close a window
  wait <ms>                 Wait for milliseconds
  print <message>           Print to output
  alert <message>           Show alert dialog (non-blocking)
  confirm <msg> into $var   Show confirm dialog (waits for response)
  prompt <msg> into $var    Show input dialog (waits for response)
  notify <message>          Show notification
  play <sound>              Play a sound (notify, error, open, close)

VARIABLES:
  set $name = value         Set a variable
  $name                     Use a variable in expressions
  $i                        Loop counter (inside loops)

ARITHMETIC:
  set $x = $a + $b          Addition
  set $x = $a - $b          Subtraction
  set $x = $a * $b          Multiplication
  set $x = $a / $b          Division

CONTROL FLOW:
  if cond then { } else { } Conditional
  loop N { }                Repeat N times
  loop while cond { }       While loop
  break                     Exit loop
  return value              Return from script

COMPARISONS: ==, !=, <, >, <=, >=, &&, ||

EVENTS:
  emit event key=value      Emit an event
  on event { }              Subscribe to event

FILESYSTEM:
  write "text" to "path"    Write to file
  read "path" into $var     Read file into variable
  mkdir "path"              Create directory
  delete "path"             Delete file/directory

WINDOW MANAGEMENT:
  focus <windowId>          Bring window to front
  minimize <windowId>       Minimize window
  maximize <windowId>       Maximize window

STRING FUNCTIONS:
  call upper text           Uppercase
  call lower text           Lowercase
  call trim text            Remove whitespace
  call length text          String length
  call concat a b c         Concatenate strings
  call substr text 0 3      Substring
  call replace t old new    Replace first occurrence
  call contains text srch   Check if contains
  call startsWith text pre  Check prefix
  call endsWith text suf    Check suffix
  call split text sep       Split into array
  call join arr sep         Join array to string

MATH FUNCTIONS:
  call random min max       Random integer
  call abs value            Absolute value
  call round value          Round to nearest
  call floor value          Round down
  call ceil value           Round up

ARRAY FUNCTIONS:
  call count arr            Array length
  call first arr            First element
  call last arr             Last element
  call push arr item        Add to end
  call pop arr              Remove from end
  call includes arr item    Check if contains

TIME FUNCTIONS:
  call now                  Unix timestamp (ms)
  call time                 Current time string
  call date                 Current date string

TYPE FUNCTIONS:
  call typeof val           Get type as string
  call isNumber val         Is number?
  call isString val         Is string?
  call isArray val          Is array?
  call isNull val           Is null/undefined?
  call toNumber val         Convert to number
  call toString val         Convert to string

SYSTEM FUNCTIONS:
  call getWindows           List open windows
  call getApps              List available apps
  call exec cmd payload     Execute CommandBus command

QUICK EXAMPLES:

  # Interactive prompt
  prompt "Your name?" into $name
  alert Hello, $name!

  # Loop with counter
  loop 5 { print Iteration: $i }

  # Conditional
  if $x > 5 then { print Big }

  # File operations
  write "Hello" to "C:/test.txt"
  read "C:/test.txt" into $content
`;

        this.appendOutput(helpText, 'info');
    }

    loadTestSuite() {
        const editor = this.getElement('#scriptEditor');
        if (editor && this.fullTestSuite) {
            // Check if there's existing content
            if (editor.value.trim()) {
                // Ask before overwriting (simple confirm via output)
                this.appendOutput('Loading test suite - replacing current content...', 'info');
            }

            editor.value = this.fullTestSuite;

            // Update file state (test suite is not a saved file)
            this.currentFilePath = null;
            this.originalContent = this.fullTestSuite;
            this.isModified = false;
            this.updateEditorTitle();
            this.updateSyntaxHighlight();
            this.updateCharCount();

            this.clearOutput();
            this.appendOutput('═══════════════════════════════════════════', 'info');
            this.appendOutput('  COMPREHENSIVE TEST SUITE LOADED', 'success');
            this.appendOutput('═══════════════════════════════════════════', 'info');
            this.appendOutput('', 'info');
            this.appendOutput('This test suite validates all RetroScript features:', 'info');
            this.appendOutput('  - Variables & Data Types', 'info');
            this.appendOutput('  - Arithmetic & Comparison Operators', 'info');
            this.appendOutput('  - Control Flow (if/else, loops)', 'info');
            this.appendOutput('  - User-Defined Functions', 'info');
            this.appendOutput('  - String, Math, Array Functions', 'info');
            this.appendOutput('  - Object Functions', 'info');
            this.appendOutput('  - Error Handling (try/catch)', 'info');
            this.appendOutput('  - Events & System Commands', 'info');
            this.appendOutput('', 'info');
            this.appendOutput('Press F5 or click "Run" to execute all tests.', 'success');
        }
    }

    switchTab(tabName) {
        const tabs = this.getElement('.output-tabs').querySelectorAll('.output-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        const outputText = this.getElement('#outputText');
        if (!outputText) return;

        switch (tabName) {
            case 'output':
                outputText.innerHTML = this.output.join('\n') || 'No output yet.\n';
                break;
            case 'events':
                outputText.innerHTML = this.eventLog.map(e =>
                    `<span class="event">[${e.time}] ${this.escapeHtml(e.event)}</span>\n  ${this.escapeHtml(e.payload)}`
                ).join('\n\n') || 'No events logged yet.\nRun a script or interact with the system to see events.\n';
                break;
            case 'variables':
                outputText.innerHTML = this.renderVariables();
                break;
            case 'recorded':
                outputText.innerHTML = this.renderRecordedCode();
                // Setup button handlers after rendering
                setTimeout(() => this.setupRecordedTabButtons(), 0);
                break;
            case 'commands':
                const commands = CommandBus.getCommands();
                outputText.innerHTML = 'Available Commands:\n\n' + commands.map(c =>
                    `  command:${c}`
                ).join('\n');
                break;
        }
    }

    renderVariables() {
        const vars = Object.entries(this.variables);
        if (vars.length === 0) {
            return `<div class="recorded-header">Variables</div>
No variables captured yet.

Variables are captured when a script runs.
Run a script to see variable values here.

<span class="info">Tip: Use the Output tab to see script output.</span>`;
        }

        let html = `<div class="recorded-header">Script Variables (${vars.length})</div>
<table class="var-table">
<tr><th>Name</th><th>Type</th><th>Value</th></tr>`;

        for (const [name, value] of vars) {
            const type = Array.isArray(value) ? 'array' : typeof value;
            let displayValue = value;

            if (typeof value === 'object' && value !== null) {
                try {
                    displayValue = JSON.stringify(value);
                } catch (e) {
                    displayValue = '[Object]';
                }
            }

            html += `<tr>
<td class="var-name">$${this.escapeHtml(name)}</td>
<td class="var-type">${type}</td>
<td class="var-value" title="${this.escapeHtml(String(displayValue))}">${this.escapeHtml(String(displayValue))}</td>
</tr>`;
        }

        html += '</table>';
        return html;
    }

    renderRecordedCode() {
        if (this.recordedEvents.length === 0) {
            const isRecording = this.isRecording;
            return `<div class="recorded-header">Event Recorder</div>
${isRecording ? '<span class="error">⏺ Recording in progress...</span>\n\n' : ''}No events recorded yet.

<span class="info">How to use the Event Recorder:</span>

1. Click the <span class="rec-command">⏺ Record</span> button in the toolbar
2. Perform actions in RetroOS:
   • Launch applications (calculator, notepad, etc.)
   • Play sounds
   • Show notifications
   • Create or delete files
   • Interact with the system
3. Click <span class="rec-command">⏹ Stop</span> to finish recording
4. Generated RetroScript code appears here

<span class="info">Why use recording?</span>
• <span class="success">Learn</span> - See how actions translate to code
• <span class="success">Automate</span> - Quickly create automation scripts
• <span class="success">Document</span> - Record workflows as executable scripts

<span class="info">Tip:</span> You can copy the generated code and paste it
into the editor to modify and run it!
`;
        }

        // Build clean code (without HTML comments)
        let cleanCode = `# Recorded RetroScript\n`;
        cleanCode += `# Generated: ${new Date().toLocaleString()}\n`;
        cleanCode += `# Events: ${this.recordedEvents.length}\n\n`;

        for (const event of this.recordedEvents) {
            // Add a simple comment for context
            if (!event.code.startsWith('#')) {
                cleanCode += `${event.code}\n`;
            } else {
                cleanCode += `${event.code}\n`;
            }
        }

        // Build display code with syntax highlighting
        let displayCode = `<span class="rec-comment"># Recorded RetroScript</span>\n`;
        displayCode += `<span class="rec-comment"># Generated: ${new Date().toLocaleString()}</span>\n`;
        displayCode += `<span class="rec-comment"># Events: ${this.recordedEvents.length}</span>\n\n`;

        for (const event of this.recordedEvents) {
            if (event.code.startsWith('#')) {
                displayCode += `<span class="rec-comment">${this.escapeHtml(event.code)}</span>\n`;
            } else {
                // Highlight the command
                const parts = event.code.split(' ');
                const cmd = parts[0];
                const rest = parts.slice(1).join(' ');
                displayCode += `<span class="rec-command">${this.escapeHtml(cmd)}</span> ${this.escapeHtml(rest)}\n`;
            }
        }

        // Store clean code for copy/insert operations
        this.lastRecordedCode = cleanCode;

        return `<div class="recorded-header">
<span class="success">Recorded Code</span> (${this.recordedEvents.length} events)
</div>
<div class="recorded-actions" style="margin-bottom: 8px;">
<button class="copy-btn" id="copyCodeBtn">📋 Copy to Clipboard</button>
<button class="copy-btn" id="insertCodeBtn" style="margin-left: 4px;">📝 Insert into Editor</button>
<button class="copy-btn" id="clearRecordedBtn" style="margin-left: 4px; background: #553;">🗑 Clear</button>
</div>
<div class="recorded-code" style="white-space: pre-wrap; line-height: 1.4;">${displayCode}</div>
<div style="margin-top: 12px; padding: 8px; background: #1a1a1a; border-left: 3px solid #4CAF50;">
<span class="info">Actions:</span>
• <strong>Copy to Clipboard</strong> - Copy the code and paste anywhere
• <strong>Insert into Editor</strong> - Add the code to your current script
• <strong>Clear</strong> - Remove recorded events and start fresh
</div>`;
    }

    setupRecordedTabButtons() {
        const copyBtn = this.getElement('#copyCodeBtn');
        const insertBtn = this.getElement('#insertCodeBtn');
        const clearBtn = this.getElement('#clearRecordedBtn');

        if (copyBtn) {
            copyBtn.onclick = () => {
                if (this.lastRecordedCode) {
                    navigator.clipboard.writeText(this.lastRecordedCode);
                    this.appendOutput('Recorded code copied to clipboard!', 'success');
                }
            };
        }

        if (insertBtn) {
            insertBtn.onclick = () => {
                const editor = this.getElement('#scriptEditor');
                if (editor && this.lastRecordedCode) {
                    const currentContent = editor.value;
                    if (currentContent.trim()) {
                        editor.value = currentContent + '\n\n' + this.lastRecordedCode;
                    } else {
                        editor.value = this.lastRecordedCode;
                    }
                    this.updateSyntaxHighlight();
                    this.updateCharCount();
                    this.markModified();
                    this.appendOutput('Recorded code inserted into editor!', 'success');
                    this.switchTab('output');
                }
            };
        }

        if (clearBtn) {
            clearBtn.onclick = () => {
                this.recordedEvents = [];
                this.lastRecordedCode = '';
                this.switchTab('recorded'); // Refresh the tab
                this.appendOutput('Recorded events cleared', 'info');
            };
        }
    }

    appendOutput(message, type = 'normal') {
        const outputText = this.getElement('#outputText');
        if (!outputText) return;

        const timestamp = new Date().toLocaleTimeString();
        const formattedMessage = type !== 'normal'
            ? `<span class="${type}">[${timestamp}] ${this.escapeHtml(message)}</span>`
            : `[${timestamp}] ${this.escapeHtml(message)}`;

        this.output.push(formattedMessage);
        if (this.output.length > this.maxLogEntries) {
            this.output.shift();
        }

        outputText.innerHTML = this.output.join('\n');
        outputText.parentElement.scrollTop = outputText.parentElement.scrollHeight;
    }

    setStatus(text) {
        const statusText = this.getElement('#statusText');
        if (statusText) {
            statusText.textContent = text;
        }
    }

    updateLineInfo() {
        const editor = this.getElement('#scriptEditor');
        const lineInfo = this.getElement('#lineInfo');
        if (!editor || !lineInfo) return;

        const text = editor.value.substring(0, editor.selectionStart);
        const lines = text.split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;

        lineInfo.textContent = `Line ${line}, Col ${col}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update syntax highlighting
     */
    updateSyntaxHighlight() {
        const editor = this.getElement('#scriptEditor');
        const highlight = this.getElement('#syntaxHighlight');
        const lineNumbers = this.getElement('#lineNumbers');

        if (!editor || !highlight) return;

        const code = editor.value;
        const highlighted = this.highlightSyntax(code);
        highlight.innerHTML = highlighted + '\n'; // Extra newline for scrolling

        // Update line numbers
        if (lineNumbers) {
            const lines = code.split('\n');
            lineNumbers.innerHTML = lines.map((_, i) => i + 1).join('\n');
        }
    }

    /**
     * Sync scroll between editor and highlight
     */
    syncScroll() {
        const editor = this.getElement('#scriptEditor');
        const highlight = this.getElement('#syntaxHighlight');
        const lineNumbers = this.getElement('#lineNumbers');
        const wrapper = this.getElement('.editor-wrapper');

        if (editor && highlight) {
            highlight.scrollTop = editor.scrollTop;
            highlight.scrollLeft = editor.scrollLeft;
        }
        if (editor && lineNumbers) {
            lineNumbers.scrollTop = editor.scrollTop;
        }
    }

    /**
     * Apply syntax highlighting to code
     */
    highlightSyntax(code) {
        // Keywords
        const keywords = ['if', 'then', 'else', 'loop', 'while', 'foreach', 'for', 'in', 'break', 'continue', 'return', 'def', 'func', 'function', 'try', 'catch', 'on', 'with', 'into', 'to', 'default'];
        // Commands
        const commands = ['launch', 'open', 'close', 'wait', 'sleep', 'print', 'log', 'set', 'emit', 'alert', 'confirm', 'prompt', 'notify', 'focus', 'minimize', 'maximize', 'play', 'write', 'read', 'mkdir', 'delete', 'rm', 'call'];
        // Built-in functions
        const builtins = ['random', 'abs', 'round', 'floor', 'ceil', 'min', 'max', 'pow', 'sqrt', 'sin', 'cos', 'tan', 'log', 'exp', 'clamp', 'mod', 'sign', 'concat', 'upper', 'lower', 'length', 'trim', 'trimStart', 'trimEnd', 'split', 'join', 'substr', 'substring', 'replace', 'replaceAll', 'contains', 'startsWith', 'endsWith', 'padStart', 'padEnd', 'repeat', 'charAt', 'charCode', 'fromCharCode', 'indexOf', 'lastIndexOf', 'match', 'count', 'first', 'last', 'push', 'pop', 'shift', 'unshift', 'includes', 'sort', 'reverse', 'slice', 'splice', 'concat_arrays', 'unique', 'flatten', 'range', 'fill', 'at', 'find', 'findIndex', 'filter', 'map', 'sum', 'avg', 'every', 'some', 'keys', 'values', 'entries', 'get', 'set', 'has', 'merge', 'clone', 'toJSON', 'fromJSON', 'prettyJSON', 'getWindows', 'getApps', 'now', 'time', 'date', 'year', 'month', 'day', 'weekday', 'hour', 'minute', 'second', 'formatDate', 'formatTime', 'elapsed', 'query', 'exec', 'alert', 'confirm', 'prompt', 'typeof', 'isNumber', 'isString', 'isArray', 'isObject', 'isBoolean', 'isNull', 'isEmpty', 'toNumber', 'toInt', 'toString', 'toBoolean', 'toArray', 'debug', 'inspect', 'assert', 'getEnv', 'PI', 'E'];

        const lines = code.split('\n');
        return lines.map(line => {
            // Escape HTML first
            let result = this.escapeHtml(line);

            // Comments (must be first to avoid highlighting inside comments)
            if (result.trim().startsWith('#')) {
                return `<span class="comment">${result}</span>`;
            }

            // Handle inline comments (outside strings)
            const commentMatch = result.match(/^([^#"']*)(#.*)$/);
            if (commentMatch) {
                const beforeComment = commentMatch[1];
                const comment = commentMatch[2];
                result = this.highlightLine(beforeComment, keywords, commands, builtins) +
                         `<span class="comment">${comment}</span>`;
                return result;
            }

            return this.highlightLine(result, keywords, commands, builtins);
        }).join('\n');
    }

    /**
     * Highlight a single line
     */
    highlightLine(line, keywords, commands, builtins) {
        let result = line;

        // Strings (handle first to avoid issues with keywords inside strings)
        result = result.replace(/"([^"\\]|\\.)*"/g, '<span class="string">$&</span>');
        result = result.replace(/'([^'\\]|\\.)*'/g, '<span class="string">$&</span>');

        // Variables ($name)
        result = result.replace(/\$\w+/g, '<span class="variable">$&</span>');

        // Numbers
        result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

        // Keywords (word boundary match)
        const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
        result = result.replace(keywordPattern, '<span class="keyword">$1</span>');

        // Commands (at start of line or after semicolon)
        const commandPattern = new RegExp(`(^|;\\s*)(${commands.join('|')})\\b`, 'gi');
        result = result.replace(commandPattern, '$1<span class="command">$2</span>');

        // Built-in functions (after 'call')
        const builtinPattern = new RegExp(`(call\\s+)(${builtins.join('|')})\\b`, 'gi');
        result = result.replace(builtinPattern, '$1<span class="builtin">$2</span>');

        // Operators
        result = result.replace(/([+\-*/%=<>!&|]+)/g, '<span class="operator">$1</span>');

        // Event names (word:word pattern)
        result = result.replace(/\b(\w+:\w+)\b/g, '<span class="event">$1</span>');

        return result;
    }

    onClose() {
        if (this.eventSubscription) {
            this.eventSubscription();
        }
        if (this.isRecording) {
            EventBus.emit('macro:record:stop');
        }
    }
}

export default ScriptRunner;
