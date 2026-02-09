/**
 * Paint App (Final Polish)
 * Windows 95 style painting with optimized layout for 800x600
 */

import AppBase from './AppBase.js';
import FileSystemManager from '../core/FileSystemManager.js';
import EventBus from '../core/EventBus.js';

class Paint extends AppBase {
    constructor() {
        super({
            id: 'paint',
            name: 'Paint',
            icon: '🖌️',
            width: 830,
            height: 625,
            resizable: true,
            singleton: false // Allow multiple Paint windows for working on multiple images
        });

        this.ctx = null;
        this.painting = false;
        this.tool = 'brush'; // brush, eraser, bucket
        this.color = '#000000';
        this.lastX = 0;
        this.lastY = 0;
        this.brushSize = 3;
        this.resizeObserver = null;

        // Register semantic event commands for scriptability
        this.registerCommands();
        this.registerQueries();
    }

    /**
     * Register commands for script control
     */
    registerCommands() {
        // Set drawing tool
        this.registerCommand('setTool', (tool) => {
            if (['brush', 'eraser', 'bucket'].includes(tool)) {
                this.tool = tool;
                EventBus.emit('paint:tool:changed', {
                    appId: this.id,
                    windowId: this.windowId,
                    tool,
                    timestamp: Date.now()
                });
                return { success: true, tool };
            }
            return { success: false, error: 'Invalid tool. Use: brush, eraser, or bucket' };
        });

        // Set drawing color
        this.registerCommand('setColor', (color) => {
            if (typeof color === 'string' && color.match(/^#[0-9A-Fa-f]{6}$/)) {
                this.color = color;
                const display = this.getElement('#currentColorDisplay');
                if (display) display.style.background = color;
                EventBus.emit('paint:color:changed', {
                    appId: this.id,
                    windowId: this.windowId,
                    color,
                    timestamp: Date.now()
                });
                return { success: true, color };
            }
            return { success: false, error: 'Invalid color. Use hex format: #RRGGBB' };
        });

        // Set brush size
        this.registerCommand('setBrushSize', (size) => {
            const numSize = parseInt(size);
            if (numSize > 0 && numSize <= 50) {
                this.brushSize = numSize;
                const select = this.getElement('#brushSize');
                if (select) select.value = String(numSize);
                EventBus.emit('paint:brushSize:changed', {
                    appId: this.id,
                    windowId: this.windowId,
                    size: numSize,
                    timestamp: Date.now()
                });
                return { success: true, size: numSize };
            }
            return { success: false, error: 'Invalid size. Use number between 1-50' };
        });

        // Clear canvas
        this.registerCommand('clear', () => {
            const canvas = this.getElement('#paintCanvas');
            if (canvas && this.ctx) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(0, 0, canvas.width, canvas.height);
                EventBus.emit('paint:canvas:cleared', {
                    appId: this.id,
                    windowId: this.windowId,
                    timestamp: Date.now()
                });
                return { success: true };
            }
            return { success: false, error: 'Canvas not available' };
        });

        // Draw line
        this.registerCommand('drawLine', (x1, y1, x2, y2) => {
            if (this.ctx) {
                this.ctx.strokeStyle = this.color;
                this.ctx.lineWidth = this.brushSize;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                return { success: true, from: {x: x1, y: y1}, to: {x: x2, y: y2} };
            }
            return { success: false, error: 'Canvas not available' };
        });

        // Fill rectangle
        this.registerCommand('fillRect', (x, y, width, height) => {
            if (this.ctx) {
                this.ctx.fillStyle = this.color;
                this.ctx.fillRect(x, y, width, height);
                return { success: true, x, y, width, height };
            }
            return { success: false, error: 'Canvas not available' };
        });
    }

    /**
     * Register queries for script inspection
     */
    registerQueries() {
        // Get current tool state
        this.registerQuery('getState', () => {
            return {
                tool: this.tool,
                color: this.color,
                brushSize: this.brushSize,
                currentFile: this.getInstanceState('currentFile'),
                fileName: this.getInstanceState('fileName')
            };
        });

        // Get canvas dimensions
        this.registerQuery('getCanvasDimensions', () => {
            const canvas = this.getElement('#paintCanvas');
            if (canvas) {
                return {
                    width: canvas.width,
                    height: canvas.height
                };
            }
            return { width: 0, height: 0 };
        });
    }

    onOpen(params = {}) {
        // Store file path if opening a specific file
        if (params.filePath) {
            this.setInstanceState('currentFile', params.filePath);
            this.setInstanceState('fileName', params.filePath[params.filePath.length - 1]);
        } else {
            this.setInstanceState('currentFile', null);
            this.setInstanceState('fileName', 'Untitled');
        }

        const colors = [
            '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
            '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'
        ];

        // We use flex-col to stack toolbar and canvas
        // The canvas container gets flex-grow to fill the rest of the 600px height
        return `
            <style>
                #window-paint .window-content {
                    padding: 0 !important;
                    overflow: hidden !important;
                }
            </style>
            <div class="paint-container" style="height: 100%; display: flex; flex-direction: column; background: #c0c0c0;">
                
                <div class="paint-toolbar" style="padding: 6px; border-bottom: 2px solid #808080;">
                    
                    <div style="display:flex; gap: 8px; margin-bottom: 6px; align-items: center;">
                        
                        <div class="inset-border" style="background: #c0c0c0; padding: 2px; display: flex; gap: 2px;">
                            <button class="btn btn-sm active-tool" data-tool="brush" title="Brush" style="width: 32px; height: 32px; font-size: 18px;">🖌️</button>
                            <button class="btn btn-sm" data-tool="bucket" title="Fill" style="width: 32px; height: 32px; font-size: 18px;">🪣</button>
                            <button class="btn btn-sm" data-tool="eraser" title="Eraser" style="width: 32px; height: 32px; font-size: 18px;">🧽</button>
                        </div>

                        <div style="width: 2px; height: 30px; background: #808080; border-right: 1px solid #fff;"></div>

                        <div style="display: flex; align-items: center; gap: 5px;">
                            <label style="font-size: 12px;">Size:</label>
                            <select id="brushSize" class="inset-border" style="height: 24px;">
                                <option value="1">1px</option>
                                <option value="3" selected>3px</option>
                                <option value="5">5px</option>
                                <option value="8">8px</option>
                                <option value="12">12px</option>
                            </select>
                        </div>

                        <div style="flex: 1;"></div>

                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-sm" id="btnClear">New</button>
                            <button class="btn btn-sm" id="btnOpen">📂 Open</button>
                            <button class="btn btn-sm" id="btnSave">💾 Save</button>
                            <button class="btn btn-sm" id="btnSaveAs">💾 Save As</button>
                        </div>
                    </div>

                    <div style="display: flex; gap: 5px; align-items: center;">
                        <div class="inset-border" style="width: 32px; height: 32px; background: #000; border: 2px solid #808080;" id="currentColorDisplay"></div>

                        <div class="inset-border" style="padding: 2px; background: #fff;">
                            <div class="color-picker" style="display: grid; grid-template-columns: repeat(16, 1fr); gap: 1px;">
                                ${colors.map(c => `
                                    <div class="color-option ${c === '#000000' ? 'active' : ''}" 
                                         style="background:${c}; width: 18px; height: 18px; border: 1px solid #808080; cursor: pointer;" 
                                         data-color="${c}"></div>
                                `).join('')}
                            </div>
                        </div>

                        <div style="position: relative; width: 24px; height: 24px;">
                            <span style="font-size: 18px; position: absolute; left: 2px; top: -2px; pointer-events: none;">🌈</span>
                            <input type="color" id="customColor" value="#000000" style="opacity: 0; width: 100%; height: 100%; cursor: pointer;">
                        </div>
                    </div>
                </div>

                <div class="paint-canvas-wrapper inset-border" style="flex: 1; overflow: auto; background: #808080; position: relative; margin: 5px;">
                    <canvas id="paintCanvas" width="770" height="460" style="background: #fff; display: block; cursor: crosshair;"></canvas>
                </div>

                <div style="height: 24px; border-top: 2px solid #fff; background: #c0c0c0; padding: 2px 5px; font-size: 12px; display: flex; align-items: center; gap: 10px;">
                    <span id="toolStatus">Tool: Brush</span>
                    <span style="border-left: 1px solid #808080; border-right: 1px solid #fff; height: 14px;"></span>
                    <span id="coordsStatus">0, 0px</span>
                </div>
            </div>
        `;
    }

    onMount() {
        const canvas = this.getElement('#paintCanvas');
        if (!canvas) return;

        this.ctx = canvas.getContext('2d', { willReadFrequently: true });

        // Initialize white background explicitly
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Load image if file was specified
        const currentFile = this.getInstanceState('currentFile');
        if (currentFile) {
            this.loadImageFromFile(currentFile);
        }

        // --- Event Listeners ---

        // Drawing
        canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        canvas.addEventListener('mouseup', () => this.stopPaint());
        canvas.addEventListener('mouseleave', () => {
            this.stopPaint();
            this.updateCoords(null);
        });

        // Tools
        this.getElements('[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.tool = btn.dataset.tool;
                this.getElements('[data-tool]').forEach(b => {
                    b.classList.remove('active-tool');
                    b.style.background = ''; // Reset background
                });
                btn.classList.add('active-tool');
                btn.style.background = '#e0e0e0'; // Active state look
                
                this.updateCursor(canvas);
                this.updateStatus(`Tool: ${this.tool.charAt(0).toUpperCase() + this.tool.slice(1)}`);
            });
        });

        // Colors
        this.getElements('.color-option').forEach(el => {
            el.addEventListener('click', () => {
                this.setColor(el.dataset.color);
                this.getElements('.color-option').forEach(o => o.style.border = '1px solid #808080'); // Reset borders
                el.style.border = '1px solid #fff'; // Highlight active
                el.style.outline = '1px solid #000';
            });
        });

        // Inputs
        this.getElement('#customColor')?.addEventListener('input', (e) => this.setColor(e.target.value));
        this.getElement('#brushSize')?.addEventListener('change', (e) => this.brushSize = parseInt(e.target.value));
        
        // Actions
        this.getElement('#btnClear')?.addEventListener('click', () => this.clearCanvas());
        this.getElement('#btnOpen')?.addEventListener('click', () => this.openImage());
        this.getElement('#btnSave')?.addEventListener('click', () => this.saveImage());
        this.getElement('#btnSaveAs')?.addEventListener('click', () => this.saveImageAs());

        // Set up ResizeObserver to resize canvas when window is resized
        const canvasWrapper = this.getElement('.paint-canvas-wrapper');
        if (canvasWrapper) {
            this.resizeObserver = new ResizeObserver(() => {
                this.resizeCanvas();
            });
            this.resizeObserver.observe(canvasWrapper);
        }
    }

    resizeCanvas() {
        const canvas = this.getElement('#paintCanvas');
        const wrapper = this.getElement('.paint-canvas-wrapper');
        if (!canvas || !wrapper) return;

        // Save current canvas content
        const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Calculate new size (leaving some margin)
        const newWidth = Math.max(100, wrapper.clientWidth - 10);
        const newHeight = Math.max(100, wrapper.clientHeight - 10);

        // Only resize if size actually changed
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Restore white background
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Restore previous content
            this.ctx.putImageData(imageData, 0, 0);

            // Re-apply context settings
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
        }
    }

    onClose() {
        // Clean up ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }

    setColor(c) {
        this.color = c;
        if (this.tool === 'eraser') this.tool = 'brush'; 
        
        // Update the big preview box
        const preview = this.getElement('#currentColorDisplay');
        if (preview) preview.style.background = c;
    }

    updateCursor(canvas) {
        if (this.tool === 'bucket') canvas.style.cursor = 'cell';
        else if (this.tool === 'eraser') canvas.style.cursor = 'grab'; // Or a custom square cursor
        else canvas.style.cursor = 'crosshair';
    }

    updateStatus(text) {
        const el = this.getElement('#toolStatus');
        if (el) el.textContent = text;
    }

    updateCoords(e) {
        const el = this.getElement('#coordsStatus');
        if (!el) return;
        if (!e) {
            el.textContent = '';
            return;
        }
        const { x, y } = this.getCoords(e);
        el.textContent = `${x}, ${y}px`;
    }

    handleStart(e) {
        const { x, y } = this.getCoords(e);

        if (this.tool === 'bucket') {
            this.floodFill(x, y, this.hexToRgba(this.color));
        } else {
            this.painting = true;
            this.lastX = x;
            this.lastY = y;
            this.draw(x, y); 
        }
    }

    handleMove(e) {
        this.updateCoords(e);
        if (!this.painting) return;
        const { x, y } = this.getCoords(e);
        this.draw(x, y);
        this.lastX = x;
        this.lastY = y;
    }

    getCoords(e) {
        const canvas = this.getElement('#paintCanvas');
        const rect = canvas.getBoundingClientRect();
        return {
            x: Math.floor(e.clientX - rect.left),
            y: Math.floor(e.clientY - rect.top)
        };
    }

    draw(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        
        if (this.tool === 'eraser') {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = this.brushSize * 4; // Eraser needs to be bigger
        } else {
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.brushSize;
        }
        
        this.ctx.stroke();
        this.ctx.closePath();
    }

    stopPaint() {
        this.painting = false;
        this.ctx.beginPath();
    }

    // Stack-based flood fill
    floodFill(startX, startY, fillColor) {
        const canvas = this.getElement('#paintCanvas');
        const w = canvas.width;
        const h = canvas.height;
        const imageData = this.ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const startPos = (startY * w + startX) * 4;
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        const startA = data[startPos + 3];

        if (startR === fillColor.r && startG === fillColor.g && startB === fillColor.b) return;

        const stack = [[startX, startY]];

        while (stack.length) {
            const [x, y] = stack.pop();
            const pos = (y * w + x) * 4;

            if (x < 0 || x >= w || y < 0 || y >= h) continue;

            if (data[pos] === startR && data[pos+1] === startG && data[pos+2] === startB && data[pos+3] === startA) {
                data[pos] = fillColor.r;
                data[pos+1] = fillColor.g;
                data[pos+2] = fillColor.b;
                data[pos+3] = 255;

                stack.push([x + 1, y]);
                stack.push([x - 1, y]);
                stack.push([x, y + 1]);
                stack.push([x, y - 1]);
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    hexToRgba(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    clearCanvas() {
        // Reset file state - this is now a NEW untitled document
        this.setInstanceState('currentFile', null);
        this.setInstanceState('fileName', 'Untitled');

        // Update window title
        const window = this.getWindow();
        if (window) {
            const titleBar = window.querySelector('.window-title');
            if (titleBar) {
                titleBar.textContent = 'Untitled - Paint';
            }
        }

        // Clear the canvas
        const canvas = this.getElement('#paintCanvas');
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    loadImageFromFile(filePath) {
        try {
            const content = FileSystemManager.readFile(filePath);
            const canvas = this.getElement('#paintCanvas');
            if (!canvas) return;

            // Validate content is a data URL
            if (typeof content !== 'string') {
                throw new Error('Invalid file content - expected image data');
            }

            if (!content.startsWith('data:image/')) {
                throw new Error('Invalid image format - file is not a valid image');
            }

            const img = new Image();
            img.onload = () => {
                // Clear canvas and draw the loaded image
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(0, 0, canvas.width, canvas.height);
                this.ctx.drawImage(img, 0, 0);
            };
            img.onerror = () => {
                this.alert('Failed to load image - the file may be corrupted');
                console.error('Image load error for:', filePath);
            };
            img.src = content;

            // Update window title
            this.updateWindowTitle();
        } catch (e) {
            console.error('Error loading image:', e);
            this.alert(`Error loading image: ${e.message}`);
        }
    }

    updateWindowTitle() {
        const fileName = this.getInstanceState('fileName') || 'Untitled';
        const window = this.getWindow();
        if (window) {
            const titleBar = window.querySelector('.window-title');
            if (titleBar) {
                titleBar.textContent = `${fileName} - Paint`;
            }
        }
    }

    async openImage() {
        const path = await this.prompt('Enter image file path (e.g., C:/Users/User/Pictures/image.png):', '', 'Open Image');
        if (!path) return;

        try {
            const parsedPath = FileSystemManager.parsePath(path);
            const fileName = parsedPath[parsedPath.length - 1];

            this.setInstanceState('currentFile', parsedPath);
            this.setInstanceState('fileName', fileName);
            this.loadImageFromFile(parsedPath);
            this.updateWindowTitle();
            this.alert('📂 Image opened!');
        } catch (e) {
            this.alert(`Error opening image: ${e.message}`);
        }
    }

    saveImage() {
        const currentFile = this.getInstanceState('currentFile');

        if (currentFile) {
            // Save to existing file
            try {
                const canvas = this.getElement('#paintCanvas');
                const dataURL = canvas.toDataURL('image/png');
                FileSystemManager.writeFile(currentFile, dataURL, 'png');
                this.alert('💾 Image saved!');
            } catch (e) {
                this.alert(`Error saving image: ${e.message}`);
            }
        } else {
            // No file selected, prompt for Save As
            this.saveImageAs();
        }
    }

    async saveImageAs() {
        // Generate a default filename with full timestamp (date + time) for unique names
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
        const defaultName = `drawing_${timestamp}.png`;
        const defaultPath = `C:/Users/User/Desktop/${defaultName}`;

        const path = await this.prompt(
            'Save image to:\n\nTip: Save to Desktop for easy access!\nOr use Pictures folder: C:/Users/User/Pictures/',
            defaultPath,
            'Save Image As'
        );
        if (!path) return;

        try {
            const parsedPath = FileSystemManager.parsePath(path);
            let fileName = parsedPath[parsedPath.length - 1];

            // Ensure .png extension
            if (!fileName.toLowerCase().endsWith('.png')) {
                fileName += '.png';
                parsedPath[parsedPath.length - 1] = fileName;
            }

            const canvas = this.getElement('#paintCanvas');
            const dataURL = canvas.toDataURL('image/png');
            FileSystemManager.writeFile(parsedPath, dataURL, 'png');

            this.setInstanceState('currentFile', parsedPath);
            this.setInstanceState('fileName', fileName);
            this.updateWindowTitle();
            this.alert('💾 Image saved to ' + parsedPath.join('/'));
        } catch (e) {
            this.alert(`Error saving image: ${e.message}`);
        }
    }
}

export default Paint;