# Desktop vs MyComputer Clipboard Debugging Guide

## How Copy/Paste SHOULD Work

### Expected Behavior:

1. **Copy from Desktop**:
   - Right-click a file/folder icon on desktop
   - Select "Copy" or "Cut"
   - Clipboard should be populated

2. **Paste on Desktop**:
   - Right-click empty space on desktop
   - Select "Paste" (should show number of items if clipboard has items)
   - File should be pasted to Desktop folder

3. **Copy from MyComputer**:
   - Right-click a file/folder in MyComputer
   - Select "Copy" or "Cut"
   - Clipboard should be populated

4. **Paste in MyComputer**:
   - Right-click empty space in a folder
   - Select "Paste"
   - File should be pasted to current folder

5. **Cross-Application**:
   - Copy from Desktop → Paste in MyComputer (should work)
   - Copy from MyComputer → Paste on Desktop (should work)

## Architecture

Both Desktop and MyComputer use the SAME singleton clipboard object in `ContextMenuRenderer.clipboard`.

```javascript
// Shared clipboard structure:
{
    items: [
        {
            path: ['Users', 'Desktop', 'file.txt'],  // Array path
            name: 'file.txt',
            type: 'file' or 'directory'
        }
    ],
    operation: 'copy' or 'cut'
}
```

## Debug Steps

1. **Open browser console** (F12)
2. **Test Desktop Copy**:
   - Right-click a file on desktop
   - Look for console output:
     - `[DesktopRenderer] showIconContextMenu called`
     - `[DesktopRenderer] icon:` <should show full icon object>
     - `[DesktopRenderer] icon.type:` should be 'file'
     - `[DesktopRenderer] icon.filePath:` should be array like ['Users', 'Desktop', 'filename']

3. **Check Context Menu**:
   - After right-click, check console for:
     - `[ContextMenu] show() called with:` <should show type: 'icon' and icon data>
     - `[ContextMenu] context.icon:` <should have icon data>
     - `[ContextMenu] -> Calling iconMenu()`

4. **Click Copy**:
   - Look for console output:
     - `[ContextMenu] handleAction() called with action: desktop-copy`
     - `[ContextMenu] Current context:` <should show icon in context>
     - `[ContextMenu] handleDesktopCopy() called with context:`
     - `[ContextMenu] Desktop Copy SUCCESS:` <file path>
     - `[ContextMenu] Clipboard now:` <should show clipboard with items>

5. **Test Desktop Paste**:
   - Right-click empty space on desktop
   - Check console for:
     - `[ContextMenu] desktopMenu called, clipboard:` <should show clipboard items>
     - `[ContextMenu] hasPaste: true` if clipboard has items

6. **Click Paste**:
   - Look for:
     - `[ContextMenu] handleDesktopPaste() called`
     - `[ContextMenu] Current clipboard:` <should show items>
     - Success or error messages

## Common Issues

### Issue 1: Copy option doesn't appear
- **Cause**: Icon doesn't have `type: 'file'` or menu is showing wrong type
- **Debug**: Check `icon.type` in console logs
- **Solution**: Verify renderFileIcons sets type correctly

### Issue 2: Copy fails silently
- **Cause**: Icon doesn't have `filePath` property
- **Debug**: Check for ERROR message: "Invalid icon for copy"
- **Solution**: Verify icon object has filePath array

### Issue 3: Paste option is disabled
- **Cause**: Clipboard is empty
- **Debug**: Check clipboard state in desktopMenu logs
- **Solution**: Verify copy actually populated clipboard

### Issue 4: Paste fails
- **Cause**: Invalid clipboard data or file system error
- **Debug**: Check handleDesktopPaste logs for errors
- **Solution**: Verify path arrays are valid

### Issue 5: Cross-application paste doesn't work
- **Cause**: Different clipboard instances (shouldn't happen)
- **Debug**: Check if ContextMenuRenderer is truly a singleton
- **Solution**: Verify import paths are correct

## Files Involved

- `ui/ContextMenuRenderer.js` - Main clipboard logic (singleton)
- `ui/DesktopRenderer.js` - Desktop icon rendering and context menu
- `apps/MyComputer.js` - File explorer with keyboard shortcuts
- `core/FileSystemManager.js` - File operations

## Test Plan

1. Create a test file on desktop
2. Right-click → Copy
3. Right-click empty space → Paste
4. Verify file was duplicated with "- Copy" suffix
5. Open MyComputer
6. Navigate to Desktop folder
7. Right-click the copied file → Copy
8. Navigate to a different folder
9. Right-click empty space → Paste
10. Verify file appears in new location
11. Go back to Desktop
12. Right-click empty space → Paste
13. Verify file also pastes to desktop
