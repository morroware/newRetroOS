/**
 * FileSystemManager - Shared virtual file system for IlluminatOS!
 * Provides a unified file system accessible by all applications
 *
 * Emits events for all file operations:
 * - fs:file:create, fs:file:read, fs:file:update, fs:file:delete
 * - fs:file:rename, fs:file:move, fs:file:copy
 * - fs:directory:create, fs:directory:delete, fs:directory:open
 * - fs:error, fs:permission:denied
 * - filesystem:changed (general change notification)
 */

import StorageManager from './StorageManager.js';
import EventBus, { Events } from './EventBus.js';
import { PATHS } from './Constants.js';
import { getConfig } from './ConfigLoader.js';

/**
 * Protected system paths that require godMode to modify
 */
const PROTECTED_PATHS = [
    'C:/Windows/System32',
    'C:/Windows/Media',
    'C:/Program Files'
];

/**
 * Normalize path to canonical segments for robust path comparison.
 * Handles separator variance and dot-segments.
 * @param {string|string[]} path
 * @returns {string[]}
 */
function normalizePathSegments(path) {
  const raw = Array.isArray(path) ? path.join('/') : String(path || '');
  const segments = raw
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean);

  const normalized = [];
  for (const segment of segments) {
    if (segment === '.') continue;
    if (segment === '..') {
      normalized.pop();
      continue;
    }
    normalized.push(segment);
  }

  // Windows-style paths are case-insensitive.
  return normalized.map((segment, index) => index === 0 ? segment.toUpperCase() : segment.toLowerCase());
}

class FileSystemManager {
  constructor() {
    if (FileSystemManager.instance) {
      return FileSystemManager.instance;
    }

    this.fileSystem = this.loadFileSystem();
    this.godMode = false; // Admin override for protected path writes
    FileSystemManager.instance = this;
  }

  /**
   * Assert that a node is a directory-like container (directory, drive, or root).
   * Throws ENOTDIR if the node is a file or otherwise not a directory.
   * @param {object} node - The filesystem node to check
   * @param {string} pathStr - Path string for error messages
   * @param {string} operation - Operation name for error events
   */
  _assertDirectory(node, pathStr, operation) {
    if (!node) return; // Callers handle null/missing separately with ENOENT
    if (node.type === 'directory' || node.type === 'drive') return;
    // Root node (the top-level filesystem object) has no type
    if (!node.type && typeof node === 'object' && !Array.isArray(node)) return;
    EventBus.emit(Events.FS_ERROR, {
      operation,
      path: pathStr,
      error: 'Not a directory',
      code: 'ENOTDIR'
    });
    throw new Error(`Not a directory: ${pathStr}`);
  }

  /**
   * Check if a write operation is allowed on the given path
   * Throws if the path is protected and godMode is not active
   * @param {string} pathStr - Path string to check
   */
  _checkWritePermission(pathStr) {
    if (this.godMode) return;

    const inputSegments = normalizePathSegments(pathStr);

    for (const protectedPath of PROTECTED_PATHS) {
      const protectedSegments = normalizePathSegments(protectedPath);
      const isProtected = protectedSegments.every((segment, idx) => inputSegments[idx] === segment);

      if (isProtected) {
        EventBus.emit(Events.FS_PERMISSION_DENIED, {
          path: pathStr,
          reason: 'Protected system path'
        });
        throw new Error(`Permission denied: ${pathStr} is a protected system path`);
      }
    }
  }

  /**
   * Validate that parsed path parts are non-empty before mutation
   * @param {string[]} parts - Parsed path parts
   * @param {string} operation - Operation name for error messages
   */
  _validateMutationPath(parts, operation) {
    if (!parts || parts.length === 0) {
      EventBus.emit(Events.FS_ERROR, {
        operation,
        path: '',
        error: 'Invalid path: path is empty',
        code: 'EINVAL'
      });
      throw new Error(`Invalid path: path is empty (${operation})`);
    }
  }

  /**
   * Initialize default file system structure
   */
  getDefaultFileSystem() {
    return {
      'C:': {
        type: 'drive',
        label: 'Local Disk',
        children: {
          'Windows': {
            type: 'directory',
            children: {
              'System32': {
                type: 'directory',
                children: {
                  'cmd.exe': {
                    type: 'file',
                    content: '[Binary File]',
                    extension: 'exe',
                    size: 51200,
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'notepad.exe': {
                    type: 'file',
                    content: '[Binary File]',
                    extension: 'exe',
                    size: 69632,
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  }
                }
              },
              'Media': {
                type: 'directory',
                children: {
                  'startup.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 102400,
                    src: 'assets/sounds/startup.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'click.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 8192,
                    src: 'assets/sounds/click.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'error.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 16384,
                    src: 'assets/sounds/error.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'notify.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 12288,
                    src: 'assets/sounds/notify.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'shutdown.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 81920,
                    src: 'assets/sounds/shutdown.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'tada.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 32768,
                    src: 'assets/sounds/tada.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'chord.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 24576,
                    src: 'assets/sounds/achievement.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  }
                }
              }
            }
          },
          'Program Files': {
            type: 'directory',
            children: {
              'Internet Explorer': {
                type: 'directory',
                children: {}
              },
              'Windows Media Player': {
                type: 'directory',
                children: {}
              }
            }
          },
          'Users': {
            type: 'directory',
            children: {
              'User': {
                type: 'directory',
                children: {
                  'Desktop': {
                    type: 'directory',
                    children: {
                      'Welcome.txt': {
                        type: 'file',
                        content: 'Welcome to IlluminatOS!\n\nEverything you see here is running in your browser.\n\nTry exploring the file system using:\n- Terminal (type "dir" and "cd")\n- My Computer\n- This desktop!\n\nYou can create, edit, and save files that persist across your session.\n\nHave fun!',
                        extension: 'txt',
                        size: 250,
                        created: new Date('2024-01-01').toISOString(),
                        modified: new Date('2024-01-01').toISOString()
                      }
                    }
                  },
                  'Documents': {
                    type: 'directory',
                    children: {
                      'resume.txt': {
                        type: 'file',
                        content: 'Your Resume\n\nSkills:\n- Add your skills here\n\nExperience:\n- Add your experience here',
                        extension: 'txt',
                        size: 150,
                        created: new Date('2024-06-15').toISOString(),
                        modified: new Date('2024-06-15').toISOString()
                      },
                      'ideas.txt': {
                        type: 'file',
                        content: '1. Build a portfolio OS\n2. Add more easter eggs\n3. Make it feel authentic\n4. Add fun retro games',
                        extension: 'txt',
                        size: 95,
                        created: new Date('2024-06-20').toISOString(),
                        modified: new Date('2024-06-20').toISOString()
                      },
                      'welcome.txt': {
                        type: 'file',
                        content: 'Welcome to IlluminatOS!\n\nThis is a fully functional retro desktop environment.\nTry exploring the file system, opening applications, and discovering easter eggs!\n\nHave fun!',
                        extension: 'txt',
                        size: 165,
                        created: new Date('2024-01-01').toISOString(),
                        modified: new Date('2024-01-01').toISOString()
                      }
                    }
                  },
                  'Pictures': {
                    type: 'directory',
                    children: {}
                  },
                  'Downloads': {
                    type: 'directory',
                    children: {}
                  },
                  'Music': {
                    type: 'directory',
                    children: {}
                  },
                  'Projects': {
                    type: 'directory',
                    children: {
                      'retro-os': {
                        type: 'directory',
                        children: {
                          'README.md': {
                            type: 'file',
                            content: '# IlluminatOS!\n\nA Windows 95-style operating system built with vanilla JavaScript.\n\n## Features\n- Virtual file system\n- Multiple applications\n- Desktop environment\n- And more!',
                            extension: 'md',
                            size: 180,
                            created: new Date('2024-05-01').toISOString(),
                            modified: new Date('2024-06-01').toISOString()
                          }
                        }
                      }
                    }
                  },
                  'Secret': {
                    type: 'directory',
                    children: {
                      'aperture.log': {
                        type: 'file',
                        content: 'Aperture Science Computer-Aided Enrichment Center\n\nTest Subject: [REDACTED]\nStatus: The cake is a lie.\n\n- GLaDOS',
                        extension: 'log',
                        size: 125,
                        created: new Date('2024-04-01').toISOString(),
                        modified: new Date('2024-04-01').toISOString()
                      },
                      'hal9000.txt': {
                        type: 'file',
                        content: 'I\'m sorry Dave, I\'m afraid I can\'t do that.\n\nThis mission is too important for me to allow you to jeopardize it.\n\n- HAL 9000',
                        extension: 'txt',
                        size: 130,
                        created: new Date('2024-03-15').toISOString(),
                        modified: new Date('2024-03-15').toISOString()
                      }
                    }
                  }
                }
              }
            }
          },
          'Temp': {
            type: 'directory',
            children: {}
          }
        }
      },
      'D:': {
        type: 'drive',
        label: 'CD-ROM',
        children: {}
      },
      'A:': {
        type: 'drive',
        label: 'Floppy Disk',
        children: {}
      }
    };
  }

  /**
   * Load file system from storage or create default
   */
  loadFileSystem() {
    const saved = StorageManager.get('fileSystem');
    if (saved) {
      return saved;
    }
    const defaults = this.getDefaultFileSystem();
    this.applyConfigFilesystem(defaults);
    return defaults;
  }

  /**
   * Apply config-driven filesystem overrides (welcome file, document files, etc.)
   * Only runs on first load when no saved filesystem exists.
   * @param {Object} fs - The default filesystem object (mutated in place)
   */
  applyConfigFilesystem(fs) {
    const fsConfig = getConfig('filesystem', null);
    if (!fsConfig) return;

    // Helper: navigate to a path and set file content
    const setFile = (pathArray, content) => {
      if (!pathArray || pathArray.length < 2) return;
      let node = fs;
      // Navigate to parent directory, creating intermediate directories
      for (let i = 0; i < pathArray.length - 1; i++) {
        const part = pathArray[i];
        if (!node[part]) {
          node[part] = { type: i === 0 ? 'drive' : 'directory', children: {} };
        }
        node = node[part].children || node[part];
      }
      const fileName = pathArray[pathArray.length - 1];
      const ext = fileName.includes('.') ? fileName.split('.').pop() : 'txt';
      node[fileName] = {
        type: 'file',
        content: content,
        extension: ext,
        size: content.length,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
    };

    // Apply welcome file override
    if (fsConfig.welcomeFile) {
      setFile(fsConfig.welcomeFile.path, fsConfig.welcomeFile.content);
    }

    // Apply document file overrides
    if (Array.isArray(fsConfig.documentFiles)) {
      for (const file of fsConfig.documentFiles) {
        if (file.path && file.content) {
          setFile(file.path, file.content);
        }
      }
    }

    // Apply secret file overrides
    if (Array.isArray(fsConfig.secretFiles)) {
      for (const file of fsConfig.secretFiles) {
        if (file.path && file.content) {
          setFile(file.path, file.content);
        }
      }
    }

    // Apply project file overrides
    if (Array.isArray(fsConfig.projectFiles)) {
      for (const file of fsConfig.projectFiles) {
        if (file.path && file.content) {
          setFile(file.path, file.content);
        }
      }
    }
  }

  /**
   * Save file system to storage
   */
  saveFileSystem() {
    StorageManager.set('fileSystem', this.fileSystem);
    EventBus.emit(Events.FILESYSTEM_CHANGED, {});
  }

  /**
   * Parse a path string into an array of parts
   * @param {string} path - Path like "C:/Users/Seth/Documents"
   * @returns {string[]} Array of path parts
   */
  parsePath(path) {
    if (Array.isArray(path)) return path;

    // Handle both forward and backward slashes
    path = path.replace(/\\/g, '/');

    // Split and filter empty parts
    let parts = path.split('/').filter(p => p.length > 0);

    return parts;
  }

  /**
   * Navigate to a path and return the node
   * @param {string|string[]} path - Path to navigate to
   * @returns {object|null} The node at the path or null if not found
   */
  getNode(path) {
    const parts = this.parsePath(path);

    if (parts.length === 0) {
      return this.fileSystem;
    }

    let current = this.fileSystem;

    for (const part of parts) {
      // Get the container to look in - either children of a dir/drive, or the object itself
      const container = (current.children !== undefined) ? current.children : current;

      if (!container[part]) {
        return null;
      }
      current = container[part];
    }

    return current;
  }

  /**
   * Get the parent directory of a path
   * @param {string|string[]} path - Path to get parent of
   * @returns {object|null} Parent node or null
   */
  getParentNode(path) {
    const parts = this.parsePath(path);
    if (parts.length <= 1) {
      return this.fileSystem;
    }

    const parentPath = parts.slice(0, -1);
    return this.getNode(parentPath);
  }

  /**
   * Check if a path exists
   * @param {string|string[]} path - Path to check
   * @returns {boolean} True if path exists
   */
  exists(path) {
    return this.getNode(path) !== null;
  }

  /**
   * List contents of a directory
   * @param {string|string[]} path - Directory path
   * @param {boolean} emitEvent - Whether to emit directory open event (default: true)
   * @returns {object[]} Array of items with name and metadata
   */
  listDirectory(path, emitEvent = true) {
    const parts = this.parsePath(path);
    const node = this.getNode(path);

    if (!node) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'list',
        path: parts.join('/'),
        error: 'Path not found',
        code: 'ENOENT'
      });
      throw new Error(`Path not found: ${path}`);
    }

    this._assertDirectory(node, parts.join('/'), 'list');

    const children = node.children || node;

    const items = [];

    for (const [name, item] of Object.entries(children)) {
      if (item && typeof item === 'object' && item.type) {
        items.push({
          name,
          type: item.type,
          extension: item.extension || '',
          size: item.size || 0,
          created: item.created,
          modified: item.modified,
          label: item.label
        });
      }
    }

    // Emit directory open event
    if (emitEvent) {
      EventBus.emit(Events.FS_DIRECTORY_OPEN, {
        path: parts.join('/'),
        itemCount: items.length
      });
    }

    return items;
  }

  /**
   * Read file content
   * @param {string|string[]} path - File path
   * @returns {string} File content
   */
  readFile(path) {
    const parts = this.parsePath(path);
    const pathStr = parts.join('/');
    const node = this.getNode(path);

    if (!node) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'read',
        path: pathStr,
        error: 'File not found',
        code: 'ENOENT'
      });
      throw new Error(`File not found: ${path}`);
    }

    if (node.type !== 'file') {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'read',
        path: pathStr,
        error: 'Not a file',
        code: 'EISDIR'
      });
      throw new Error(`Not a file: ${path}`);
    }

    const content = node.content || '';

    // Emit file read event
    EventBus.emit(Events.FS_FILE_READ, {
      path: pathStr,
      size: content.length
    });

    return content;
  }

  /**
   * Write content to a file (creates if doesn't exist)
   * @param {string|string[]} path - File path
   * @param {string} content - File content
   * @param {string} extension - File extension (optional)
   */
  writeFile(path, content, extension = 'txt') {
    const parts = this.parsePath(path);
    this._validateMutationPath(parts, 'write');
    const pathStr = parts.join('/');
    this._checkWritePermission(pathStr);
    const fileName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1);

    const parent = this.getNode(parentPath);

    if (!parent) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'write',
        path: pathStr,
        error: 'Parent directory not found',
        code: 'ENOENT'
      });
      throw new Error(`Parent directory not found: ${parentPath.join('/')}`);
    }

    this._assertDirectory(parent, parentPath.join('/'), 'write');

    const children = parent.children || parent;

    // Determine extension from filename if not provided
    if (fileName.includes('.')) {
      const fileParts = fileName.split('.');
      extension = fileParts[fileParts.length - 1];
    }

    const now = new Date().toISOString();
    const isUpdate = children[fileName] && children[fileName].type === 'file';

    if (isUpdate) {
      // Update existing file
      children[fileName].content = content;
      children[fileName].size = content.length;
      children[fileName].modified = now;

      this.saveFileSystem();

      EventBus.emit(Events.FS_FILE_UPDATE, {
        path: pathStr,
        content: content
      });
    } else {
      // Create new file
      children[fileName] = {
        type: 'file',
        content: content,
        extension: extension,
        size: content.length,
        created: now,
        modified: now
      };

      this.saveFileSystem();

      EventBus.emit(Events.FS_FILE_CREATE, {
        path: pathStr,
        type: 'file',
        content: content
      });
    }
  }

  /**
   * Delete a file
   * @param {string|string[]} path - File path
   */
  deleteFile(path) {
    const parts = this.parsePath(path);
    this._validateMutationPath(parts, 'delete');
    const pathStr = parts.join('/');
    this._checkWritePermission(pathStr);
    const fileName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1);

    const parent = this.getNode(parentPath);

    if (!parent) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'delete',
        path: pathStr,
        error: 'Parent directory not found',
        code: 'ENOENT'
      });
      throw new Error(`Parent directory not found: ${parentPath.join('/')}`);
    }

    this._assertDirectory(parent, parentPath.join('/'), 'delete');

    const children = parent.children || parent;

    if (!children[fileName]) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'delete',
        path: pathStr,
        error: 'File not found',
        code: 'ENOENT'
      });
      throw new Error(`File not found: ${path}`);
    }

    if (children[fileName].type !== 'file') {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'delete',
        path: pathStr,
        error: 'Not a file',
        code: 'EISDIR'
      });
      throw new Error(`Not a file: ${path}`);
    }

    delete children[fileName];
    this.saveFileSystem();

    EventBus.emit(Events.FS_FILE_DELETE, {
      path: pathStr
    });
  }

  /**
   * Create a directory
   * @param {string|string[]} path - Directory path
   */
  createDirectory(path) {
    const parts = this.parsePath(path);
    this._validateMutationPath(parts, 'mkdir');
    const pathStr = parts.join('/');
    this._checkWritePermission(pathStr);
    const dirName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1);

    const parent = this.getNode(parentPath);

    if (!parent) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'mkdir',
        path: pathStr,
        error: 'Parent directory not found',
        code: 'ENOENT'
      });
      throw new Error(`Parent directory not found: ${parentPath.join('/')}`);
    }

    this._assertDirectory(parent, parentPath.join('/'), 'mkdir');

    const children = parent.children || parent;

    if (children[dirName]) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'mkdir',
        path: pathStr,
        error: 'Directory already exists',
        code: 'EEXIST'
      });
      throw new Error(`Directory already exists: ${path}`);
    }

    children[dirName] = {
      type: 'directory',
      children: {}
    };

    this.saveFileSystem();

    EventBus.emit(Events.FS_DIRECTORY_CREATE, {
      path: pathStr
    });
  }

  /**
   * Delete a directory (must be empty unless recursive is true)
   * @param {string|string[]} path - Directory path
   * @param {boolean} recursive - If true, delete contents recursively
   */
  deleteDirectory(path, recursive = false) {
    const parts = this.parsePath(path);
    this._validateMutationPath(parts, 'rmdir');
    const pathStr = parts.join('/');
    this._checkWritePermission(pathStr);
    const dirName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1);

    const parent = this.getNode(parentPath);

    if (!parent) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'rmdir',
        path: pathStr,
        error: 'Parent directory not found',
        code: 'ENOENT'
      });
      throw new Error(`Parent directory not found: ${parentPath.join('/')}`);
    }

    const children = parent.children || parent;

    if (!children[dirName]) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'rmdir',
        path: pathStr,
        error: 'Directory not found',
        code: 'ENOENT'
      });
      throw new Error(`Directory not found: ${path}`);
    }

    const dir = children[dirName];

    if (dir.type !== 'directory') {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'rmdir',
        path: pathStr,
        error: 'Not a directory',
        code: 'ENOTDIR'
      });
      throw new Error(`Not a directory: ${path}`);
    }

    if (dir.children && Object.keys(dir.children).length > 0) {
      if (!recursive) {
        EventBus.emit(Events.FS_ERROR, {
          operation: 'rmdir',
          path: pathStr,
          error: 'Directory not empty',
          code: 'ENOTEMPTY'
        });
        throw new Error(`Directory not empty: ${path}`);
      }
      // Recursively delete contents
      this.deleteDirectoryRecursive(parts);
    }

    delete children[dirName];
    this.saveFileSystem();

    EventBus.emit(Events.FS_DIRECTORY_DELETE, {
      path: pathStr,
      recursive
    });
  }

  /**
   * Recursively delete all contents of a directory
   * @param {string[]} path - Directory path as array
   */
  deleteDirectoryRecursive(path) {
    const node = this.getNode(path);
    if (!node || !node.children) return;

    for (const [name, item] of Object.entries(node.children)) {
      const itemPath = [...path, name];
      if (item.type === 'directory') {
        this.deleteDirectoryRecursive(itemPath);
        EventBus.emit(Events.FS_DIRECTORY_DELETE, {
          path: itemPath.join('/'),
          recursive: true
        });
      } else {
        EventBus.emit(Events.FS_FILE_DELETE, {
          path: itemPath.join('/')
        });
      }
    }
  }

  /**
   * Get file/directory info
   * @param {string|string[]} path - Path to get info for
   * @returns {object} File/directory metadata
   */
  getInfo(path) {
    const node = this.getNode(path);

    if (!node) {
      throw new Error(`Path not found: ${path}`);
    }

    const parts = this.parsePath(path);
    const name = parts[parts.length - 1] || 'Root';

    return {
      name,
      type: node.type,
      extension: node.extension || '',
      size: node.size || 0,
      created: node.created,
      modified: node.modified,
      label: node.label
    };
  }

  /**
   * Format bytes to human readable size
   * @param {number} bytes - Bytes
   * @returns {string} Formatted size
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get total size of a directory recursively
   * @param {string|string[]} path - Directory path
   * @returns {number} Total size in bytes
   */
  getDirectorySize(path) {
    const node = this.getNode(path);

    if (!node) return 0;

    if (node.type === 'file') {
      return node.size || 0;
    }

    const children = node.children || {};
    let total = 0;

    for (const [name, item] of Object.entries(children)) {
      if (item.type === 'file') {
        total += item.size || 0;
      } else if (item.type === 'directory') {
        const childPath = this.parsePath(path).concat([name]);
        total += this.getDirectorySize(childPath);
      }
    }

    return total;
  }

  /**
   * Move a file or directory from one path to another
   * @param {string|string[]} sourcePath - Source path
   * @param {string|string[]} destPath - Destination directory path
   * @returns {boolean} True if successful
   */
  moveItem(sourcePath, destPath) {
    const srcParts = this.parsePath(sourcePath);
    const destParts = this.parsePath(destPath);
    this._validateMutationPath(srcParts, 'move');
    this._validateMutationPath(destParts, 'move');
    const srcPathStr = srcParts.join('/');
    const destPathStr = destParts.join('/');
    this._checkWritePermission(srcPathStr);
    this._checkWritePermission(destPathStr);

    const srcName = srcParts[srcParts.length - 1];
    const srcParentPath = srcParts.slice(0, -1);

    // Get source node info
    const srcParent = this.getNode(srcParentPath);
    if (!srcParent) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'move',
        path: srcPathStr,
        error: 'Source parent not found',
        code: 'ENOENT'
      });
      throw new Error(`Source parent not found: ${srcParentPath.join('/')}`);
    }

    const srcChildren = srcParent.children || srcParent;
    const srcNode = srcChildren[srcName];
    if (!srcNode) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'move',
        path: srcPathStr,
        error: 'Source not found',
        code: 'ENOENT'
      });
      throw new Error(`Source not found: ${sourcePath}`);
    }

    // Get destination node
    const destNode = this.getNode(destParts);
    if (!destNode) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'move',
        path: destPathStr,
        error: 'Destination not found',
        code: 'ENOENT'
      });
      throw new Error(`Destination not found: ${destPath}`);
    }

    this._assertDirectory(destNode, destPathStr, 'move');

    // Reject moving a directory into its own subtree
    const normalizedSrc = srcParts.map(s => s.toLowerCase());
    const normalizedDest = destParts.map(s => s.toLowerCase());
    if (normalizedDest.length >= normalizedSrc.length &&
        normalizedSrc.every((seg, i) => normalizedDest[i] === seg)) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'move',
        path: srcPathStr,
        error: 'Cannot move into own subtree',
        code: 'EINVAL'
      });
      throw new Error(`Cannot move '${srcPathStr}' into its own subtree '${destPathStr}'`);
    }

    const destChildren = destNode.children || destNode;

    // Check if file already exists at destination
    if (destChildren[srcName]) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'move',
        path: destPathStr + '/' + srcName,
        error: 'Item already exists at destination',
        code: 'EEXIST'
      });
      throw new Error(`Item already exists at destination: ${srcName}`);
    }

    // Transfer by reference (atomic in single-threaded JS, preserves all properties)
    destChildren[srcName] = srcNode;
    delete srcChildren[srcName];

    // Update modified timestamp
    srcNode.modified = new Date().toISOString();

    this.saveFileSystem();

    const moveEvent = (srcNode.type === 'directory') ? 'fs:directory:move' : Events.FS_FILE_MOVE;
    EventBus.emit(moveEvent, {
      sourcePath: srcPathStr,
      destPath: [...destParts, srcName].join('/'),
      fileName: srcName,
      itemType: srcNode.type || 'file'
    });

    return true;
  }

  /**
   * Copy a file or directory from one path to another
   * @param {string|string[]} sourcePath - Source path
   * @param {string|string[]} destPath - Destination directory path
   * @returns {boolean} True if successful
   */
  copyItem(sourcePath, destPath) {
    const srcParts = this.parsePath(sourcePath);
    const destParts = this.parsePath(destPath);
    this._validateMutationPath(srcParts, 'copy');
    this._validateMutationPath(destParts, 'copy');
    const srcPathStr = srcParts.join('/');
    const destPathStr = destParts.join('/');
    this._checkWritePermission(destPathStr);

    const srcName = srcParts[srcParts.length - 1];

    // Get source node info
    const srcNode = this.getNode(srcParts);
    if (!srcNode) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'copy',
        path: srcPathStr,
        error: 'Source not found',
        code: 'ENOENT'
      });
      throw new Error(`Source not found: ${sourcePath}`);
    }

    // Get destination node
    const destNode = this.getNode(destParts);
    if (!destNode) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'copy',
        path: destPathStr,
        error: 'Destination not found',
        code: 'ENOENT'
      });
      throw new Error(`Destination not found: ${destPath}`);
    }

    this._assertDirectory(destNode, destPathStr, 'copy');

    const destChildren = destNode.children || destNode;

    // Generate unique name if needed
    let newName = srcName;
    let counter = 1;
    while (destChildren[newName]) {
      const parts = srcName.split('.');
      if (parts.length > 1) {
        const ext = parts.pop();
        newName = `${parts.join('.')} (${counter}).${ext}`;
      } else {
        newName = `${srcName} (${counter})`;
      }
      counter++;
    }

    // Deep copy to destination
    destChildren[newName] = JSON.parse(JSON.stringify(srcNode));
    destChildren[newName].modified = new Date().toISOString();

    this.saveFileSystem();

    const copyEvent = (srcNode.type === 'directory') ? 'fs:directory:copy' : Events.FS_FILE_COPY;
    EventBus.emit(copyEvent, {
      sourcePath: srcPathStr,
      destPath: [...destParts, newName].join('/'),
      fileName: newName,
      itemType: srcNode.type || 'file'
    });

    return true;
  }

  /**
   * Rename a file or directory
   * @param {string|string[]} path - Path to rename
   * @param {string} newName - New name for the item
   * @returns {boolean} True if successful
   */
  renameItem(path, newName) {
    const parts = this.parsePath(path);
    this._validateMutationPath(parts, 'rename');
    const pathStr = parts.join('/');
    this._checkWritePermission(pathStr);
    const oldName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1);

    const parent = this.getNode(parentPath);
    if (!parent) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'rename',
        path: pathStr,
        error: 'Parent directory not found',
        code: 'ENOENT'
      });
      throw new Error(`Parent directory not found: ${parentPath.join('/')}`);
    }

    this._assertDirectory(parent, parentPath.join('/'), 'rename');

    const children = parent.children || parent;
    if (!children[oldName]) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'rename',
        path: pathStr,
        error: 'Item not found',
        code: 'ENOENT'
      });
      throw new Error(`Item not found: ${path}`);
    }

    if (children[newName]) {
      EventBus.emit(Events.FS_ERROR, {
        operation: 'rename',
        path: [...parentPath, newName].join('/'),
        error: 'Name already exists',
        code: 'EEXIST'
      });
      throw new Error(`Name already exists: ${newName}`);
    }

    // Rename the item
    children[newName] = children[oldName];
    children[newName].modified = new Date().toISOString();
    delete children[oldName];

    this.saveFileSystem();

    const isDirectory = children[newName].type === 'directory';
    const eventName = isDirectory ? Events.FS_DIRECTORY_RENAME : Events.FS_FILE_RENAME;

    EventBus.emit(eventName, {
      oldPath: pathStr,
      newPath: [...parentPath, newName].join('/'),
      oldName,
      newName
    });

    return true;
  }

  /**
   * Reset file system to default
   */
  reset() {
    this.fileSystem = this.getDefaultFileSystem();
    this.saveFileSystem();
  }

  /**
   * Sync desktop icons from StateManager into the filesystem Desktop folder
   * Creates shortcut files (.lnk) for each desktop icon
   * @param {Array} icons - Array of desktop icons from StateManager
   */
  syncDesktopIcons(icons) {
    if (!icons || !Array.isArray(icons)) return;

    // Temporarily enable godMode since we write to system-managed paths
    const prevGodMode = this.godMode;
    this.godMode = true;

    const desktopPath = [...PATHS.DESKTOP];
    const desktopNode = this.getNode(desktopPath);

    if (!desktopNode || !desktopNode.children) {
      this.godMode = prevGodMode;
      return;
    }

    try {
      const now = new Date().toISOString();

      // Add shortcut files for each icon that doesn't already exist as a real file
      for (const icon of icons) {
        const fileName = `${icon.label}.lnk`;

        // Skip if a real file with this name exists (not a shortcut we created)
        if (desktopNode.children[fileName.replace('.lnk', '.txt')] ||
            desktopNode.children[fileName.replace('.lnk', '.md')]) {
          continue;
        }

        // Create or update the shortcut file
        desktopNode.children[fileName] = {
          type: 'file',
          content: JSON.stringify({
            type: icon.type || 'app',
            target: icon.url || icon.id,
            icon: icon.emoji,
            label: icon.label
          }, null, 2),
          extension: 'lnk',
          size: 128,
          created: now,
          modified: now,
          isShortcut: true,
          shortcutTarget: icon.type === 'link' ? icon.url : icon.id,
          shortcutType: icon.type || 'app',
          shortcutIcon: icon.emoji
        };
      }

      // Save filesystem so changes persist even if the caller forgets
      this.saveFileSystem();
    } finally {
      this.godMode = prevGodMode;
    }
  }

  /**
   * Sync installed apps into the filesystem Program Files folder
   * Creates directories and .exe files for each app
   * @param {Array} apps - Array of app metadata from AppRegistry
   */
  syncInstalledApps(apps) {
    if (!apps || !Array.isArray(apps)) return;

    // Temporarily enable godMode since we write to C:/Program Files
    const prevGodMode = this.godMode;
    this.godMode = true;

    const programFilesPath = ['C:', 'Program Files'];
    const programFilesNode = this.getNode(programFilesPath);

    if (!programFilesNode || !programFilesNode.children) {
      this.godMode = prevGodMode;
      return;
    }

    try {
      const now = new Date().toISOString();

      for (const app of apps) {
        // Skip system apps that shouldn't appear in Program Files
        if (app.category === 'system' || !app.showInMenu) continue;

        const folderName = app.name;

        // Create app folder if it doesn't exist
        if (!programFilesNode.children[folderName]) {
          programFilesNode.children[folderName] = {
            type: 'directory',
            children: {}
          };
        }

        // Create the executable file
        const exeName = `${app.id}.exe`;
        programFilesNode.children[folderName].children[exeName] = {
          type: 'file',
          content: `[Executable]\nApp: ${app.name}\nID: ${app.id}\nIcon: ${app.icon}`,
          extension: 'exe',
          size: 65536,
          created: now,
          modified: now,
          isExecutable: true,
          appId: app.id
        };
      }

      // Save filesystem so changes persist even if the caller forgets
      this.saveFileSystem();
    } finally {
      this.godMode = prevGodMode;
    }
  }

  /**
   * Get all desktop shortcuts (files that are shortcuts)
   * @returns {Array} Array of shortcut file info
   */
  getDesktopShortcuts() {
    try {
      const items = this.listDirectory([...PATHS.DESKTOP]);
      return items.filter(item => item.extension === 'lnk');
    } catch (e) {
      return [];
    }
  }

  /**
   * Get all installed apps from Program Files
   * @returns {Array} Array of app info with executables
   */
  getInstalledApps() {
    try {
      const items = this.listDirectory(['C:', 'Program Files']);
      const apps = [];

      for (const item of items) {
        if (item.type === 'directory') {
          const appPath = ['C:', 'Program Files', item.name];
          const appNode = this.getNode(appPath);

          if (appNode && appNode.children) {
            // Find .exe files
            for (const [fileName, fileNode] of Object.entries(appNode.children)) {
              if (fileNode.extension === 'exe' && fileNode.appId) {
                apps.push({
                  name: item.name,
                  appId: fileNode.appId,
                  path: [...appPath, fileName],
                  icon: fileNode.icon || '⚙️'
                });
              }
            }
          }
        }
      }

      return apps;
    } catch (e) {
      return [];
    }
  }
}

// Create and export singleton instance
const fileSystemManager = new FileSystemManager();
export default fileSystemManager;
