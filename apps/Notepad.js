/**
 * Notepad App
 * Simple text editor with save/load functionality
 */

import AppBase from './AppBase.js';
import StorageManager from '../core/StorageManager.js';
import FileSystemManager from '../core/FileSystemManager.js';
import SystemDialogs from '../features/SystemDialogs.js';
import { PATHS } from '../core/Constants.js';

class Notepad extends AppBase {
    constructor() {
        super({
            id: 'notepad',
            name: 'Notepad',
            icon: '📝',
            width: 600,
            height: 500,
            category: 'accessories'
        });

        this.storageKey = 'notepadContent';
    }

    onOpen(params = {}) {
        // Check if we're opening a specific file
        const filePath = params.filePath;
        let content = '';
        let fileName = 'Untitled';

        if (filePath) {
            try {
                content = FileSystemManager.readFile(filePath);
                fileName = filePath[filePath.length - 1];
                this.setInstanceState('currentFile', filePath);
                this.setInstanceState('fileName', fileName);
            } catch (e) {
                console.error('Error loading file:', e);
                content = '';
            }
        } else {
            // Load from StorageManager (legacy support)
            content = StorageManager.get(this.storageKey) || '';
            this.setInstanceState('currentFile', null);
            this.setInstanceState('fileName', 'Untitled');
        }

        // Update window title
        this.updateTitle(fileName);

        return `
            <style>
                #window-notepad .window-content {
                    padding: 0 !important;
                    overflow: hidden !important;
                    display: flex;
                    flex-direction: column;
                }
                .notepad-app {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #c0c0c0;
                }
                .notepad-toolbar {
                    padding: 4px;
                    border-bottom: 1px solid #808080;
                    flex-shrink: 0;
                }
                .notepad-filepath {
                    padding: 4px 8px;
                    background: #f0f0f0;
                    font-size: 12px;
                    border-bottom: 1px solid #808080;
                    flex-shrink: 0;
                }
                .notepad-content {
                    flex: 1;
                    width: 100%;
                    border: none;
                    padding: 8px;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    resize: none;
                    box-sizing: border-box;
                    outline: none;
                }
            </style>
            <div class="notepad-app">
                <div class="notepad-toolbar">
                    <button class="btn" id="btnNew">📄 New</button>
                    <button class="btn" id="btnOpen">📂 Open</button>
                    <button class="btn" id="btnSave">💾 Save</button>
                    <button class="btn" id="btnSaveAs">💾 Save As</button>
                    <button class="btn" id="btnDownload">📥 Download</button>
                </div>
                <div class="notepad-filepath">
                    File: <span id="filePathDisplay">${this.getInstanceState('currentFile') ? this.getInstanceState('currentFile').join('/') : 'Unsaved'}</span>
                </div>
                <textarea class="notepad-content" id="notepadText"
                    placeholder="Start typing... (Ctrl+S to save)">${this.escapeHtml(content)}</textarea>
            </div>
        `;
    }

    updateTitle(fileName) {
        const window = this.getWindow();
        if (window) {
            const titleBar = window.querySelector('.window-title');
            if (titleBar) {
                titleBar.textContent = `${fileName} - Notepad`;
            }
        }
    }

    onMount() {
        // Button handlers
        const btnNew = this.getElement('#btnNew');
        const btnOpen = this.getElement('#btnOpen');
        const btnSave = this.getElement('#btnSave');
        const btnSaveAs = this.getElement('#btnSaveAs');
        const btnDownload = this.getElement('#btnDownload');
        if (btnNew) this.addHandler(btnNew, 'click', () => this.newDocument());
        if (btnOpen) this.addHandler(btnOpen, 'click', () => this.openFile());
        if (btnSave) this.addHandler(btnSave, 'click', () => this.save());
        if (btnSaveAs) this.addHandler(btnSaveAs, 'click', () => this.saveAs());
        if (btnDownload) this.addHandler(btnDownload, 'click', () => this.download());

        // Keyboard shortcut
        this.addHandler(document, 'keydown', this.handleKeypress);

        // Focus textarea
        setTimeout(() => {
            this.getElement('#notepadText')?.focus();
        }, 100);

        // ===== SCRIPTING SUPPORT =====
        // Register command handlers for scripting automation
        this._registerScriptingCommands();
    }

    /**
     * Register commands and queries for scripting support
     * Enables scripts to control Notepad via semantic events
     */
    _registerScriptingCommands() {
        // Command: Set text content
        this.registerCommand('setText', (payload) => {
            const textarea = this.getElement('#notepadText');
            if (textarea) {
                textarea.value = payload.text || '';
                this.emitAppEvent('textChanged', { text: textarea.value });
                return { success: true, length: textarea.value.length };
            }
            return { success: false, error: 'Textarea not found' };
        });

        // Command: Append text
        this.registerCommand('appendText', (payload) => {
            const textarea = this.getElement('#notepadText');
            if (textarea) {
                textarea.value += payload.text || '';
                this.emitAppEvent('textChanged', { text: textarea.value });
                return { success: true, length: textarea.value.length };
            }
            return { success: false, error: 'Textarea not found' };
        });

        // Command: Clear text
        this.registerCommand('clear', () => {
            const textarea = this.getElement('#notepadText');
            if (textarea) {
                textarea.value = '';
                this.emitAppEvent('textCleared', {});
                return { success: true };
            }
            return { success: false, error: 'Textarea not found' };
        });

        // Command: Save file
        this.registerCommand('save', async (payload) => {
            if (payload.path) {
                // Save to specific path
                const textarea = this.getElement('#notepadText');
                if (textarea) {
                    try {
                        FileSystemManager.writeFile(payload.path, textarea.value);
                        this.setInstanceState('currentFile', payload.path);
                        this.setInstanceState('fileName', payload.path.split('/').pop());
                        this.updateTitle(this.getInstanceState('fileName'));
                        this.updateFilePathDisplay();
                        this.emitAppEvent('saved', { path: payload.path });
                        return { success: true, path: payload.path };
                    } catch (e) {
                        return { success: false, error: e.message };
                    }
                }
            } else {
                await this.save();
                return { success: true };
            }
        });

        // Command: Open file
        this.registerCommand('open', async (payload) => {
            if (payload.path) {
                try {
                    const content = FileSystemManager.readFile(payload.path);
                    const textarea = this.getElement('#notepadText');
                    if (textarea) {
                        textarea.value = content;
                        const pathArray = Array.isArray(payload.path) ? payload.path : payload.path.split('/');
                        const fileName = pathArray[pathArray.length - 1];
                        this.setInstanceState('currentFile', pathArray);
                        this.setInstanceState('fileName', fileName);
                        this.updateTitle(fileName);
                        this.updateFilePathDisplay();
                        this.emitAppEvent('fileOpened', { path: payload.path, content });
                        return { success: true, path: payload.path, length: content.length };
                    }
                } catch (e) {
                    return { success: false, error: e.message };
                }
            }
            return { success: false, error: 'No path specified' };
        });

        // Command: New document
        this.registerCommand('new', async () => {
            await this.newDocument();
            this.emitAppEvent('newDocument', {});
            return { success: true };
        });

        // Query: Get text content
        this.registerQuery('getText', () => {
            const textarea = this.getElement('#notepadText');
            return textarea ? textarea.value : '';
        });

        // Query: Get current file path
        this.registerQuery('getFilePath', () => {
            return this.getInstanceState('currentFile') || null;
        });

        // Query: Get file name
        this.registerQuery('getFileName', () => {
            return this.getInstanceState('fileName') || 'Untitled';
        });

        // Query: Get text length
        this.registerQuery('getLength', () => {
            const textarea = this.getElement('#notepadText');
            return textarea ? textarea.value.length : 0;
        });

        // Query: Get line count
        this.registerQuery('getLineCount', () => {
            const textarea = this.getElement('#notepadText');
            return textarea ? textarea.value.split('\n').length : 0;
        });
    }

    handleKeypress(e) {
        if (!this.isOpen || !this.getWindow()?.classList.contains('active')) return;

        // Ctrl+S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.save();
        }
    }

    async openFile() {
        // Show file open dialog - use '*' to show all text-based files
        const result = await SystemDialogs.showFileOpen({
            title: 'Open',
            filter: '*',
            initialPath: [...PATHS.DOCUMENTS]
        });

        if (!result) return;

        try {
            const content = FileSystemManager.readFile(result.fullPath);
            const fileName = result.filename;

            const textarea = this.getElement('#notepadText');
            if (textarea) {
                textarea.value = content;
            }

            this.setInstanceState('currentFile', result.fullPath);
            this.setInstanceState('fileName', fileName);
            this.updateTitle(fileName);
            this.updateFilePathDisplay();
            this.alert('📂 File opened!');
        } catch (e) {
            await SystemDialogs.alert(`Error opening file: ${e.message}`, 'Error', 'error');
        }
    }

    async save() {
        const textarea = this.getElement('#notepadText');
        if (!textarea) return;

        const currentFile = this.getInstanceState('currentFile');

        if (currentFile) {
            // Save to existing file
            try {
                FileSystemManager.writeFile(currentFile, textarea.value);
                this.alert('💾 File saved!');
                // Emit saved event for script handlers
                const pathString = Array.isArray(currentFile) ? currentFile.join('/') : currentFile;
                this.emitAppEvent('saved', { path: pathString });
            } catch (e) {
                await SystemDialogs.alert(`Error saving file: ${e.message}`, 'Error', 'error');
            }
        } else {
            // No file selected, prompt for Save As
            this.saveAs();
        }

        // Also save to StorageManager for legacy support
        StorageManager.set(this.storageKey, textarea.value);
    }

    async saveAs() {
        const textarea = this.getElement('#notepadText');
        if (!textarea) return;

        // Generate a default filename - use current file extension or .txt
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
        const currentFile = this.getInstanceState('currentFile');
        const currentFileName = this.getInstanceState('fileName') || '';

        // Preserve the current file extension if editing an existing file
        let defaultExt = '.txt';
        if (currentFileName && currentFileName.includes('.')) {
            defaultExt = currentFileName.substring(currentFileName.lastIndexOf('.'));
        }
        const defaultName = `note_${timestamp}${defaultExt}`;

        const result = await SystemDialogs.showFileSave({
            title: 'Save As',
            filter: '*',
            initialPath: [...PATHS.DESKTOP],
            defaultFilename: defaultName
        });

        if (!result) return;

        try {
            let fileName = result.filename;

            // Only add .txt extension if no extension provided at all
            if (!fileName.includes('.')) {
                fileName += '.txt';
            }

            // Determine the file extension for writeFile
            const extension = fileName.substring(fileName.lastIndexOf('.') + 1);

            const fullPath = [...result.path, fileName];
            FileSystemManager.writeFile(fullPath, textarea.value, extension);

            this.setInstanceState('currentFile', fullPath);
            this.setInstanceState('fileName', fileName);
            this.updateTitle(fileName);
            this.updateFilePathDisplay();
            this.alert('💾 File saved to ' + fullPath.join('/'));
            // Emit saved event for script handlers
            this.emitAppEvent('saved', { path: fullPath.join('/') });
        } catch (e) {
            await SystemDialogs.alert(`Error saving file: ${e.message}`, 'Error', 'error');
        }
    }

    updateFilePathDisplay() {
        const display = this.getElement('#filePathDisplay');
        const currentFile = this.getInstanceState('currentFile');
        if (display) {
            display.textContent = currentFile ? currentFile.join('/') : 'Unsaved';
        }
    }

    async newDocument() {
        // Check if there's unsaved content
        const textarea = this.getElement('#notepadText');
        if (textarea && textarea.value.trim()) {
            const confirmed = await SystemDialogs.confirm(
                'Create new document? Unsaved changes will be lost.',
                'New Document'
            );
            if (!confirmed) return;
        }

        // Reset file state - this is now a NEW untitled document
        this.setInstanceState('currentFile', null);
        this.setInstanceState('fileName', 'Untitled');

        // Clear textarea
        if (textarea) {
            textarea.value = '';
        }

        // Update UI
        this.updateTitle('Untitled');
        this.updateFilePathDisplay();

        // Clear legacy storage
        StorageManager.remove(this.storageKey);
    }

    download() {
        const textarea = this.getElement('#notepadText');
        if (!textarea) return;

        const blob = new Blob([textarea.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'note.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default Notepad;
