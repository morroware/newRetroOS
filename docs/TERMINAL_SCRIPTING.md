# Terminal Scripting Guide for RetroScript

This guide explains how to control and automate the Terminal app from RetroScript for creating ARGs (Alternate Reality Games) and interactive experiences in IlluminatOS!

## Overview

The Terminal app is controlled from RetroScript via **built-in functions** prefixed with `terminal`. These functions are part of the `TerminalBuiltins` module and allow RetroScript programs to:
- Open and control the terminal
- Execute commands programmatically
- Read and write files relative to the terminal's working directory
- Monitor terminal output and state
- Create interactive experiences

## Basic Concepts

### Opening a Terminal

Use the `terminalOpen` built-in function to launch or focus the terminal:

```retro
# Open a terminal (or focus if already open)
call terminalOpen

# Open terminal and run an initial command
call terminalOpen "ver"
```

You can also use the `launch` statement:

```retro
launch terminal
```

### Executing Commands

Use `terminalExecute` to run commands in the terminal:

```retro
call terminalExecute "dir"
call terminalExecute "echo Hello World"
```

### Printing to Terminal

Output text directly to the terminal display:

```retro
# Print with optional color
call terminalPrint "Hello from RetroScript!" "#00ff00"

# Print HTML content
call terminalPrintHtml "<b>Bold text</b>"
```

### Event Listening

Listen for terminal events to create reactive experiences:

```retro
# React when terminal opens
on app:terminal:opened {
    print "Terminal opened!"
    set $path = $event.pathString
    print "Current path: " + $path
}

# React to terminal commands
on app:terminal:command {
    print "Command executed: " + $event.command
    print "Output: " + $event.output
}

# React when terminal closes
on app:terminal:closed {
    print "Terminal closed. History count: " + $event.historyCount
}
```

---

## Available Built-in Functions

### Basic Terminal Control

#### `terminalExecute(command)` - Execute a terminal command
```retro
call terminalExecute "dir"
call terminalExecute "echo Hello World"
```

#### `terminalExecuteSequence(commands)` - Execute multiple commands
```retro
call terminalExecuteSequence ["cd C:/Projects", "dir", "type readme.txt"]
```

#### `terminalClear()` - Clear the terminal screen
```retro
call terminalClear
```

#### `terminalPrint(text, color?)` - Print text to terminal
```retro
call terminalPrint "Message text" "#00ff00"
call terminalPrint "Info message"  # Default color
```

#### `terminalPrintHtml(html)` - Print HTML to terminal
```retro
call terminalPrintHtml "<b>Bold text</b>"
```

### Directory & File Operations

#### `terminalCd(path)` - Change directory
```retro
call terminalCd "C:/Users/User/Documents"
```

#### `terminalDir(path?)` - List directory
```retro
call terminalDir "C:/Projects"
call terminalDir  # Current directory
```

#### `terminalReadFile(path)` - Read a file's contents
```retro
set $content = call terminalReadFile "readme.txt"
print "File contains: " + $content
```

#### `terminalWriteFile(path, content)` - Write to a file
```retro
call terminalWriteFile "test.txt" "Hello World"
```

#### `terminalFileExists(path)` - Check if a file exists
```retro
set $exists = call terminalFileExists "secret.txt"
if $exists then {
    print "Secret file found!"
}
```

### Environment Variables

#### `terminalSetEnvVar(name, value)` - Set an environment variable
```retro
call terminalSetEnvVar "MYVAR" "Hello"
```

#### `terminalGetEnvVar(name)` - Get an environment variable
```retro
set $user = call terminalGetEnvVar "USERNAME"
print "User is: " + $user
```

#### `terminalGetEnvVars()` - Get all environment variables
```retro
set $env = call terminalGetEnvVars
```

### Aliases

#### `terminalAlias(name, command)` - Create a command alias
```retro
call terminalAlias "ll" "dir /w"
```

#### `terminalGetAliases()` - Get all aliases
```retro
set $aliases = call terminalGetAliases
```

### Script Execution

#### `terminalRunScript(path)` - Run a .retro or .bat script
```retro
call terminalRunScript "C:/scripts/setup.bat"
call terminalRunScript "automation.retro"
```

### Window Management

#### `terminalOpen(command?)` - Open/focus terminal
```retro
call terminalOpen
call terminalOpen "ver"  # Open and run command
```

#### `terminalFocus()` - Focus the terminal window
```retro
call terminalFocus
```

#### `terminalMinimize()` - Minimize the terminal
```retro
call terminalMinimize
```

#### `terminalClose()` - Close the terminal
```retro
call terminalClose
```

### State Queries

#### `isTerminalOpen()` - Check if terminal is open
```retro
set $open = call isTerminalOpen
if $open then {
    print "Terminal is running"
}
```

#### `terminalGetState()` - Get full terminal state
```retro
set $state = call terminalGetState
```

#### `terminalGetPath()` - Get current working directory
```retro
set $path = call terminalGetPath
print "Working in: " + $path
```

#### `terminalGetOutput()` - Get last command output
```retro
call terminalExecute "dir"
set $output = call terminalGetOutput
print "Output: " + $output
```

#### `terminalGetAllOutput()` - Get all terminal output
```retro
set $all = call terminalGetAllOutput
```

#### `terminalGetHistory()` - Get command history
```retro
set $history = call terminalGetHistory
```

### Visual Effects

#### `terminalMatrix()` - Start matrix effect
```retro
call terminalMatrix
```

#### `terminalGodMode()` - Enable god mode
```retro
call terminalGodMode
```

#### `terminalIsGodMode()` - Check god mode status
```retro
set $godMode = call terminalIsGodMode
if $godMode then {
    print "God mode is active!"
}
```

#### `terminalColor(code)` - Set terminal color scheme
```retro
call terminalColor "a"  # Green on black
```

### Fun Commands

#### `terminalCowsay(message)` - ASCII cow says message
```retro
call terminalCowsay "Hello from RetroScript!"
```

#### `terminalFortune()` - Display random fortune
```retro
call terminalFortune
```

---

## Complete Function Reference

| Function | Description | Returns |
|----------|-------------|---------|
| `terminalOpen(cmd?)` | Open/focus terminal, optionally run command | - |
| `terminalClose()` | Close terminal window | - |
| `terminalFocus()` | Focus terminal window | - |
| `terminalMinimize()` | Minimize terminal window | - |
| `isTerminalOpen()` | Check if terminal is open | boolean |
| `terminalPrint(text, color?)` | Print text to terminal | - |
| `terminalPrintHtml(html)` | Print HTML to terminal | - |
| `terminalClear()` | Clear terminal screen | - |
| `terminalExecute(cmd)` | Execute terminal command | - |
| `terminalExecuteSequence(cmds)` | Execute multiple commands | - |
| `terminalCd(path)` | Change directory | - |
| `terminalGetPath()` | Get current path | string |
| `terminalGetOutput()` | Get last command output | string |
| `terminalGetAllOutput()` | Get all terminal output | string |
| `terminalGetHistory()` | Get command history | array |
| `terminalGetState()` | Get terminal state | object |
| `terminalGetEnvVars()` | Get all env variables | object |
| `terminalGetEnvVar(name)` | Get env variable | string |
| `terminalSetEnvVar(name, val)` | Set env variable | - |
| `terminalAlias(name, cmd)` | Create command alias | - |
| `terminalGetAliases()` | Get all aliases | object |
| `terminalDir(path?)` | List directory | - |
| `terminalReadFile(path)` | Read file | string |
| `terminalWriteFile(path, content)` | Write file | - |
| `terminalFileExists(path)` | Check file exists | boolean |
| `terminalRunScript(path)` | Run .retro or .bat file | - |
| `terminalGodMode()` | Enable god mode | - |
| `terminalIsGodMode()` | Check god mode status | boolean |
| `terminalMatrix()` | Start matrix effect | - |
| `terminalCowsay(msg)` | Display cowsay message | - |
| `terminalFortune()` | Display random fortune | - |
| `terminalColor(code)` | Set terminal color | - |

---

## Terminal Events

Listen to these events with `on` handlers to react to terminal actions:

### `app:terminal:opened`
Fired when a terminal window is opened.
```retro
on app:terminal:opened {
    print "Terminal opened at: " + $event.pathString
}
```

### `app:terminal:command`
Fired when a command is executed in the terminal.
```retro
on app:terminal:command {
    print "Command: " + $event.command
    print "Output: " + $event.output
}
```

### `app:terminal:closed`
Fired when the terminal window is closed.
```retro
on app:terminal:closed {
    print "Terminal closed"
}
```

---

## ARG Examples

### Example 1: Automated Tutorial

```retro
# Launch terminal and run a tutorial
launch terminal

wait 1000
call terminalPrint "Welcome to the Terminal Tutorial!" "#00ff00"

wait 2000
call terminalPrint "Let's learn some commands..."

wait 2000
call terminalExecute "help"

wait 5000
call terminalPrint "Try typing 'dir' to list files!" "#00ffff"
```

### Example 2: Secret File Hunt

```retro
# Create a secret file hunt game
launch terminal

# Hide a secret file
write "SECRET_CODE_1337" to "C:/Users/User/Secret/password.txt"

call terminalPrint "Find the password file hidden in the system..." "#ffff00"

# Listen for when they find it
on app:terminal:command {
    set $cmd = $event.command
    set $hasPassword = call contains $cmd "password.txt"
    if $hasPassword then {
        call terminalPrint "You found it! The code is revealed!" "#00ff00"
        call terminalGodMode
    }
}
```

### Example 3: Automated System Setup

```retro
# Automate terminal setup
launch terminal
wait 500

call terminalExecuteSequence ["cd C:/Users/User", "mkdir Projects", "cd Projects", "touch readme.txt"]

wait 1000
call terminalPrint "Project setup complete!" "#00ff00"
```

### Example 4: Interactive Mystery

```retro
# Create an interactive mystery
launch terminal

# Setup the mystery files
write "The truth lies in the Windows folder..." to "C:/clue1.txt"
write "Check your documents for the final answer..." to "C:/Windows/clue2.txt"
write "CONGRATULATIONS! You solved the mystery!" to "C:/Users/User/Documents/answer.txt"

call terminalPrint "MYSTERY CHALLENGE ACTIVATED" "#ff00ff"
call terminalPrint "Find and read clue1.txt to begin..." "#ffff00"

# Track progress
on app:terminal:command {
    set $output = call terminalGetOutput
    set $hasClue1 = call contains $output "truth lies"
    set $hasCongrats = call contains $output "CONGRATULATIONS"

    if $hasClue1 then {
        call terminalPrint "Good! Now follow the clue!" "#00ffff"
    }

    if $hasCongrats then {
        call terminalMatrix
        wait 3000
        call terminalGodMode
    }
}
```

### Example 5: Terminal-Based Guessing Game

```retro
# Number guessing game in terminal
launch terminal

set $secret = call random 1 100
set $attempts = 0

call terminalPrint "=== NUMBER GUESSING GAME ===" "#00ffff"
call terminalPrint "I'm thinking of a number between 1 and 100"
call terminalPrint "Type: echo <number>"

on app:terminal:command {
    set $cmd = $event.command
    set $isGuess = call startsWith $cmd "echo "

    if $isGuess then {
        set $guessStr = call substring $cmd 5
        set $guess = call toNumber $guessStr
        set $attempts = $attempts + 1

        if $guess == $secret then {
            call terminalPrint "CORRECT! You won in " + $attempts + " attempts!" "#00ff00"
        } else if $guess < $secret then {
            call terminalPrint "Too low! Try again..." "#ffff00"
        } else {
            call terminalPrint "Too high! Try again..." "#ffff00"
        }
    }
}
```

---

## Best Practices

1. **Wait between commands** - Use `wait` to give the terminal time to process each command
2. **Check terminal state** - Use `isTerminalOpen` before sending commands
3. **Use events for reactivity** - Listen to `app:terminal:command` for dynamic experiences
4. **Provide visual feedback** - Use colored `terminalPrint` to guide users
5. **Clean up** - Close terminals or clean up created files when your script ends
6. **Error handling** - Use `terminalFileExists` before reading files, and wrap operations in `try/catch`

---

## Troubleshooting

- **Function not working**: Ensure the terminal is open before calling terminal functions. Use `call terminalOpen` first.
- **File not found**: Use absolute paths (C:/...) when working outside the terminal's current directory.
- **Events not firing**: Make sure event listeners are set up before triggering actions.
- **Terminal closes unexpectedly**: Check for errors in your command sequence.

---

For more scripting documentation, see:
- [SCRIPTING_GUIDE.md](../SCRIPTING_GUIDE.md) for complete RetroScript language reference
- [DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md) for app and feature development
