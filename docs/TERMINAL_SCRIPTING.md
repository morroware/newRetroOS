# Terminal Scripting Guide for RetroScript

This guide explains how to control and automate the Terminal app from RetroScript for creating ARGs (Alternate Reality Games) and interactive experiences in IlluminatOS!

## Overview

The Terminal app exposes a comprehensive set of **semantic commands** and **queries** that allow RetroScript programs to:
- Open and control terminal instances
- Execute commands programmatically
- Read and write files
- Monitor terminal output
- Create interactive experiences

## Basic Concepts

### Targeting Terminal Instances

When you launch a terminal, you get back an instance ID that you can use to send commands:

```retroscript
# Launch a new terminal
launch "terminal" into $term

# Send a command to that specific terminal
send "execute" to $term with "dir"

# Print text to the terminal
send "print" to $term with "Hello from RetroScript!" and "#00ff00"
```

### Event Listening

You can listen to terminal events to create reactive experiences:

```retroscript
# Listen for command execution
on terminal:command:executed {
    print "Command was executed: " + $event.command
}

# Listen for directory changes
on terminal:directory:changed {
    print "Changed to: " + $event.path
}
```

## Available Commands

### Basic Terminal Control

#### `execute` - Execute a terminal command
```retroscript
send "execute" to $term with "dir"
send "execute" to $term with "echo Hello World"
```

#### `executeSequence` - Execute multiple commands
```retroscript
send "executeSequence" to $term with ["cd C:\\Projects", "dir", "type readme.txt"]
```

#### `clear` - Clear the terminal screen
```retroscript
send "clear" to $term
```

#### `print` - Print text to terminal
```retroscript
send "print" to $term with "Message text" and "#00ff00"
send "print" to $term with "Info message"  # Default color
```

#### `printHtml` - Print HTML to terminal
```retroscript
send "printHtml" to $term with "<b>Bold text</b>"
```

### Directory & File Operations

#### `cd` - Change directory
```retroscript
send "cd" to $term with "C:\\Users\\User\\Documents"
```

#### `dir` - List directory
```retroscript
send "dir" to $term with "C:\\Projects"
send "dir" to $term  # Current directory
```

#### `readFile` - Read a file's contents
```retroscript
send "readFile" to $term with "readme.txt" into $content
print "File contains: " + $content.content
```

#### `writeFile` - Write to a file
```retroscript
send "writeFile" to $term with "test.txt" and "Hello World" and "txt"
```

#### `createFile` - Create a new file
```retroscript
send "createFile" to $term with "newfile.txt" and "Initial content"
```

#### `deleteFile` - Delete a file
```retroscript
send "deleteFile" to $term with "oldfile.txt"
```

#### `fileExists` - Check if a file exists
```retroscript
send "fileExists" to $term with "secret.txt" into $result
if $result.exists {
    print "Secret file found!"
}
```

### Environment Variables

#### `setEnvVar` - Set an environment variable
```retroscript
send "setEnvVar" to $term with "MYVAR" and "Hello"
```

#### `getEnvVar` - Get an environment variable
```retroscript
send "getEnvVar" to $term with "USERNAME" into $result
print "User is: " + $result.value
```

### Aliases

#### `createAlias` - Create a command alias
```retroscript
send "createAlias" to $term with "ll" and "dir /w"
```

#### `removeAlias` - Remove an alias
```retroscript
send "removeAlias" to $term with "ll"
```

### Script Execution

#### `runScript` - Run a .retro or .bat script
```retroscript
send "runScript" to $term with "C:\\scripts\\setup.bat"
send "runScript" to $term with "automation.retro"
```

### Window Management

#### `focus` - Focus the terminal window
```retroscript
send "focus" to $term
```

#### `minimize` - Minimize the terminal
```retroscript
send "minimize" to $term
```

#### `maximize` - Maximize the terminal
```retroscript
send "maximize" to $term
```

#### `closeTerminal` - Close the terminal
```retroscript
send "closeTerminal" to $term
```

### Visual Effects

#### `showMessage` - Show colored message
```retroscript
send "showMessage" to $term with "Success!" and "success"
send "showMessage" to $term with "Warning!" and "warning"
send "showMessage" to $term with "Error!" and "error"
send "showMessage" to $term with "Info" and "info"
send "showMessage" to $term with "Cyan text" and "cyan"
send "showMessage" to $term with "Magenta text" and "magenta"
```

#### `startMatrix` - Enable matrix mode
```retroscript
send "startMatrix" to $term
wait 5000
send "stopMatrix" to $term
```

#### `stopMatrix` - Disable matrix mode
```retroscript
send "stopMatrix" to $term
```

#### `enableGodMode` - Activate god mode
```retroscript
send "enableGodMode" to $term
```

### Application Integration

#### `launchApp` - Launch another application
```retroscript
send "launchApp" to $term with "notepad" and {filePath: ["C:", "test.txt"]}
send "launchApp" to $term with "paint"
```

## Available Queries

### Terminal State

#### `getState` - Get full terminal state
```retroscript
query "getState" from $term into $state
print "Current path: " + $state.pathString
print "God mode: " + $state.godMode
print "Active process: " + $state.activeProcessType
```

#### `getCurrentPath` - Get current directory
```retroscript
query "getCurrentPath" from $term into $path
print "Working in: " + $path.pathString
```

#### `getHistory` - Get command history
```retroscript
query "getHistory" from $term into $history
print "Last command: " + $history.history[-1]
```

#### `getLastOutput` - Get last command output
```retroscript
send "execute" to $term with "dir"
query "getLastOutput" from $term into $output
print "Command output: " + $output.output
```

#### `getAllOutput` - Get all terminal output
```retroscript
query "getAllOutput" from $term into $output
print "Full output: " + $output.outputText
```

### Environment

#### `getEnvVars` - Get all environment variables
```retroscript
query "getEnvVars" from $term into $env
print "PATH: " + $env.envVars.PATH
```

#### `getAliases` - Get all aliases
```retroscript
query "getAliases" from $term into $aliases
for $alias in $aliases.aliases {
    print $alias.name + " = " + $alias.command
}
```

### Window Information

#### `getWindowInfo` - Get window details
```retroscript
query "getWindowInfo" from $term into $info
print "Window ID: " + $info.windowId
print "App ID: " + $info.appId
```

### Special States

#### `isGodMode` - Check if god mode is active
```retroscript
query "isGodMode" from $term into $god
if $god.godMode {
    print "God mode is active!"
}
```

#### `getBatchState` - Get batch execution state
```retroscript
query "getBatchState" from $term into $batch
if $batch.isExecutingBatch {
    print "Executing batch: " + $batch.currentBatchIndex + "/" + $batch.batchCommandCount
}
```

## Terminal Events

Listen to these events to react to terminal actions:

### `terminal:command:executed`
```retroscript
on terminal:command:executed {
    print "Command: " + $event.command
    print "Window: " + $event.windowId
}
```

### `terminal:command:error`
```retroscript
on terminal:command:error {
    print "Error executing: " + $event.command
    print "Error message: " + $event.error
}
```

### `terminal:cleared`
```retroscript
on terminal:cleared {
    print "Terminal was cleared"
}
```

### `terminal:directory:changed`
```retroscript
on terminal:directory:changed {
    print "Changed to: " + $event.path
}
```

### `terminal:output`
```retroscript
on terminal:output {
    print "Terminal printed: " + $event.text
    print "Color: " + $event.color
}
```

## ARG Examples

### Example 1: Automated Tutorial

```retroscript
# Launch terminal and run a tutorial
launch "terminal" into $term

wait 1000
send "showMessage" to $term with "Welcome to the Terminal Tutorial!" and "success"

wait 2000
send "print" to $term with "Let's learn some commands..."

wait 2000
send "execute" to $term with "help"

wait 5000
send "showMessage" to $term with "Try typing 'dir' to list files!" and "cyan"
```

### Example 2: Secret File Hunt

```retroscript
# Create a secret file hunt game
launch "terminal" into $term

# Hide a secret file
send "writeFile" to $term with "C:\\Users\\User\\Secret\\password.txt" and "SECRET_CODE_1337" and "txt"

send "showMessage" to $term with "Find the password file hidden in the system..." and "warning"

# Listen for when they find it
on terminal:command:executed {
    if $event.command includes "password.txt" {
        send "showMessage" to $term with "You found it! The code is revealed!" and "success"
        send "enableGodMode" to $term
    }
}
```

### Example 3: Automated System Setup

```retroscript
# Automate terminal setup
launch "terminal" into $term

send "executeSequence" to $term with [
    "cd C:\\Projects",
    "mkdir MyProject",
    "cd MyProject",
    "touch readme.txt",
    "echo Project initialized! > readme.txt"
]

wait 1000
send "showMessage" to $term with "Project setup complete!" and "success"
```

### Example 4: Interactive Mystery

```retroscript
# Create an interactive mystery
launch "terminal" into $term

# Setup the mystery
send "createFile" to $term with "C:\\clue1.txt" and "The truth lies in the Windows folder..."
send "createFile" to $term with "C:\\Windows\\clue2.txt" and "Check your documents for the final answer..."
send "createFile" to $term with "C:\\Users\\User\\Documents\\answer.txt" and "CONGRATULATIONS! You solved it!"

send "print" to $term with "MYSTERY CHALLENGE ACTIVATED" and "#ff00ff"
send "print" to $term with "Find and read clue1.txt to begin..." and "#ffff00"

# Track progress
on terminal:command:executed {
    query "getLastOutput" from $term into $output

    if $output.output includes "clue1.txt" {
        send "showMessage" to $term with "Good! Now follow the clue!" and "cyan"
    }

    if $output.output includes "CONGRATULATIONS" {
        send "startMatrix" to $term
        wait 3000
        send "stopMatrix" to $term
        send "enableGodMode" to $term
    }
}
```

### Example 5: Terminal-Based Mini Game

```retroscript
# Number guessing game in terminal
launch "terminal" into $term

set $secretNumber = random(1, 100)
set $attempts = 0

send "showMessage" to $term with "=== NUMBER GUESSING GAME ===" and "cyan"
send "print" to $term with "I'm thinking of a number between 1 and 100"
send "print" to $term with "Use: echo <number>"

on terminal:command:executed {
    if $event.command startsWith "echo " {
        set $guess = parseInt($event.command.substring(5))
        set $attempts = $attempts + 1

        if $guess == $secretNumber {
            send "showMessage" to $term with "CORRECT! You won in " + $attempts + " attempts!" and "success"
            send "enableGodMode" to $term
        } else if $guess < $secretNumber {
            send "showMessage" to $term with "Too low! Try again..." and "warning"
        } else {
            send "showMessage" to $term with "Too high! Try again..." and "warning"
        }
    }
}
```

## Best Practices

1. **Always wait between commands** - Use `wait` to give the terminal time to process
2. **Check command results** - Query the output to verify commands succeeded
3. **Use events for reactivity** - Listen to terminal events for dynamic experiences
4. **Provide user feedback** - Use colored messages to guide users
5. **Clean up** - Close terminals or clean up files when your script ends
6. **Error handling** - Always check for file existence before operations

## Advanced: Multi-Terminal Control

```retroscript
# Control multiple terminals simultaneously
launch "terminal" into $term1
launch "terminal" into $term2

send "cd" to $term1 with "C:\\Projects"
send "cd" to $term2 with "C:\\Users"

send "print" to $term1 with "Terminal 1" and "#00ff00"
send "print" to $term2 with "Terminal 2" and "#ff00ff"

# Coordinate between them
send "execute" to $term1 with "dir > filelist.txt"
wait 1000
send "execute" to $term2 with "type C:\\Projects\\filelist.txt"
```

## Troubleshooting

- **Command not executing**: Ensure you're using the correct syntax and the terminal instance is valid
- **File not found**: Use absolute paths (C:\\...) instead of relative paths
- **Events not firing**: Make sure event listeners are set up before triggering actions
- **Terminal closes unexpectedly**: Check for errors in your command sequence

---

**Ready to create amazing ARG experiences!** 🎮

For more examples, check the `/examples/arg-scripts/` directory in the RetroOS repository.
