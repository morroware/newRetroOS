/**
 * Media Player App (Video Player)
 * Full-featured media player with video AND audio support
 *
 * Features:
 * - Play video files (MP4, WebM, OGG)
 * - Play audio files (MP3, WAV, OGG, FLAC)
 * - Audio visualizer for music
 * - Playlist management
 * - Volume control with mute
 * - Seek/progress bar
 * - Fullscreen support (video)
 * - Shuffle and repeat modes
 * - Scriptable via RetroScript
 * - Emits events for ARG integration
 */

import AppBase from './AppBase.js';
import EventBus, { Events } from '../core/EventBus.js';
import SoundSystem from '../features/SoundSystem.js';
import StorageManager from '../core/StorageManager.js';

class VideoPlayer extends AppBase {
    constructor() {
        super({
            id: 'videoplayer',
            name: 'Media Player',
            icon: '🎬',
            width: 640,
            height: 680,
            resizable: true,
            singleton: false,
            category: 'multimedia'
        });

        // Audio file extensions
        this.audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma'];
        this.videoExtensions = ['.mp4', '.webm', '.ogv', '.mov', '.avi', '.mkv'];

        // Default playlist
        this.defaultPlaylist = [];

        // Register semantic event commands for scriptability
        this.registerCommands();
        this.registerQueries();
    }

    /**
     * Detect if file is audio or video
     */
    isAudioFile(src) {
        const lower = src.toLowerCase();
        return this.audioExtensions.some(ext => lower.endsWith(ext));
    }

    /**
     * Register commands for script control
     */
    registerCommands() {
        this.registerCommand('play', () => {
            const media = this.getInstanceState('mediaElement');
            if (media) {
                media.play();
                return { success: true };
            }
            return { success: false, error: 'No media loaded' };
        });

        this.registerCommand('pause', () => {
            const media = this.getInstanceState('mediaElement');
            if (media) {
                media.pause();
                return { success: true };
            }
            return { success: false, error: 'No media loaded' };
        });

        this.registerCommand('stop', () => {
            this.stop();
            return { success: true };
        });

        this.registerCommand('load', (src, name) => {
            if (src) {
                this.loadMedia(src, name || src.split('/').pop());
                return { success: true };
            }
            return { success: false, error: 'No source provided' };
        });

        this.registerCommand('next', () => {
            this.next();
            return { success: true };
        });

        this.registerCommand('previous', () => {
            this.prev();
            return { success: true };
        });

        this.registerCommand('setVolume', (volume) => {
            const vol = Math.max(0, Math.min(100, parseInt(volume))) / 100;
            this.setVolume(vol * 100);
            return { success: true, volume: vol };
        });

        this.registerCommand('seek', (position) => {
            const media = this.getInstanceState('mediaElement');
            if (media) {
                media.currentTime = Math.max(0, Math.min(media.duration || 0, position));
                return { success: true, position: media.currentTime };
            }
            return { success: false, error: 'No media loaded' };
        });

        this.registerCommand('fullscreen', () => {
            this.toggleFullscreen();
            return { success: true };
        });

        this.registerCommand('mute', () => {
            this.toggleMute();
            return { success: true };
        });

        this.registerCommand('shuffle', () => {
            this.toggleShuffle();
            return { success: true };
        });

        this.registerCommand('repeat', () => {
            this.toggleRepeat();
            return { success: true };
        });
    }

    registerQueries() {
        this.registerQuery('getState', () => {
            const media = this.getInstanceState('mediaElement');
            return {
                playing: this.getInstanceState('playing'),
                currentIndex: this.getInstanceState('currentIndex'),
                currentTime: media ? media.currentTime : 0,
                duration: media ? media.duration : 0,
                volume: this.getInstanceState('volume'),
                muted: this.getInstanceState('muted'),
                loop: this.getInstanceState('repeat'),
                shuffle: this.getInstanceState('shuffle'),
                isAudio: this.getInstanceState('isAudio')
            };
        });

        this.registerQuery('getPlaylist', () => {
            return { playlist: this.getInstanceState('playlist') || [] };
        });

        this.registerQuery('getCurrentMedia', () => {
            const playlist = this.getInstanceState('playlist') || [];
            const currentIndex = this.getInstanceState('currentIndex') || 0;
            return {
                index: currentIndex,
                media: playlist[currentIndex] || null
            };
        });
    }

    onOpen(params = {}) {
        const savedPlaylist = StorageManager.get('mediaPlayerPlaylist2');
        const playlist = savedPlaylist || this.defaultPlaylist;

        this.setInstanceState('playlist', playlist);
        this.setInstanceState('currentIndex', 0);
        this.setInstanceState('playing', false);
        this.setInstanceState('volume', SoundSystem.getVolume());
        this.setInstanceState('muted', false);
        this.setInstanceState('repeat', false);
        this.setInstanceState('shuffle', false);
        this.setInstanceState('isAudio', false);
        this.setInstanceState('mediaElement', null);
        this.setInstanceState('audioContext', null);
        this.setInstanceState('analyser', null);

        if (params.src) {
            setTimeout(() => this.loadMedia(params.src, params.name), 100);
        }

        const playlistHtml = this.renderPlaylist(playlist);

        return `
            <div class="media-player-pro">
                <!-- Display Area -->
                <div class="mp-display">
                    <div class="mp-video-container" id="videoContainer">
                        <video id="videoElement" class="mp-video"></video>
                        <audio id="audioElement" class="mp-audio"></audio>
                    </div>
                    <div class="mp-visualizer" id="visualizerContainer">
                        <canvas id="visualizerCanvas" class="mp-visualizer-canvas"></canvas>
                        <div class="mp-audio-info" id="audioInfo">
                            <div class="mp-audio-icon">♫</div>
                            <div class="mp-now-playing" id="nowPlaying">No media loaded</div>
                        </div>
                    </div>
                    <div class="mp-overlay" id="overlay">
                        <div class="mp-overlay-icon">▶</div>
                        <div class="mp-overlay-text">Drop files or click + to add media</div>
                    </div>
                </div>

                <!-- Info Bar -->
                <div class="mp-info-bar">
                    <div class="mp-title" id="titleDisplay">Ready</div>
                    <div class="mp-time">
                        <span id="currentTime">0:00</span>
                        <span class="mp-time-sep">/</span>
                        <span id="totalTime">0:00</span>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="mp-progress-wrapper">
                    <div class="mp-progress-track" id="progressTrack">
                        <div class="mp-progress-fill" id="progressFill"></div>
                        <div class="mp-progress-handle" id="progressHandle"></div>
                    </div>
                </div>

                <!-- Controls -->
                <div class="mp-controls">
                    <div class="mp-controls-left">
                        <button class="mp-btn mp-btn-small" id="btnShuffle" title="Shuffle">
                            <span class="mp-btn-icon">⤭</span>
                        </button>
                    </div>
                    <div class="mp-controls-center">
                        <button class="mp-btn" id="btnPrev" title="Previous">
                            <span class="mp-btn-icon">⏮</span>
                        </button>
                        <button class="mp-btn mp-btn-play" id="btnPlay" title="Play">
                            <span class="mp-btn-icon" id="playIcon">▶</span>
                        </button>
                        <button class="mp-btn" id="btnStop" title="Stop">
                            <span class="mp-btn-icon">⏹</span>
                        </button>
                        <button class="mp-btn" id="btnNext" title="Next">
                            <span class="mp-btn-icon">⏭</span>
                        </button>
                    </div>
                    <div class="mp-controls-right">
                        <button class="mp-btn mp-btn-small" id="btnRepeat" title="Repeat">
                            <span class="mp-btn-icon">🔁</span>
                        </button>
                    </div>
                </div>

                <!-- Volume -->
                <div class="mp-volume-bar">
                    <button class="mp-btn mp-btn-tiny" id="btnMute" title="Mute">
                        <span class="mp-btn-icon" id="volumeIcon">🔊</span>
                    </button>
                    <div class="mp-volume-track" id="volumeTrack">
                        <div class="mp-volume-fill" id="volumeFill" style="width: ${this.getInstanceState('volume') * 100}%"></div>
                    </div>
                    <button class="mp-btn mp-btn-tiny" id="btnFullscreen" title="Fullscreen">
                        <span class="mp-btn-icon">⛶</span>
                    </button>
                </div>

                <!-- Playlist -->
                <div class="mp-playlist-section">
                    <div class="mp-playlist-header">
                        <span class="mp-playlist-title">Playlist</span>
                        <div class="mp-playlist-actions">
                            <button class="mp-btn mp-btn-tiny" id="btnAddFile" title="Add Files">+</button>
                            <button class="mp-btn mp-btn-tiny" id="btnAddUrl" title="Add URL">🌐</button>
                            <button class="mp-btn mp-btn-tiny" id="btnClear" title="Clear">🗑</button>
                        </div>
                    </div>
                    <div class="mp-playlist" id="playlist">${playlistHtml}</div>
                </div>
            </div>
        `;
    }

    renderPlaylist(playlist) {
        if (!playlist || playlist.length === 0) {
            return '<div class="mp-playlist-empty">Playlist is empty</div>';
        }
        return playlist.map((item, i) => {
            const isAudio = this.isAudioFile(item.src);
            const icon = isAudio ? '♫' : '🎬';
            return `
                <div class="mp-playlist-item" data-index="${i}">
                    <span class="mp-item-icon">${icon}</span>
                    <span class="mp-item-name">${this.escapeHtml(item.name)}</span>
                    <span class="mp-item-duration">${item.duration ? this.formatTime(item.duration) : '--:--'}</span>
                    <button class="mp-item-remove" data-remove="${i}">×</button>
                </div>
            `;
        }).join('');
    }

    onMount() {
        const videoEl = this.getElement('#videoElement');
        const audioEl = this.getElement('#audioElement');

        // Setup media element event handlers
        [videoEl, audioEl].forEach(el => {
            this.addHandler(el, 'loadedmetadata', () => this.onMediaLoaded());
            this.addHandler(el, 'timeupdate', () => this.onTimeUpdate());
            this.addHandler(el, 'ended', () => this.onMediaEnded());
            this.addHandler(el, 'play', () => this.onPlay());
            this.addHandler(el, 'pause', () => this.onPause());
            this.addHandler(el, 'error', () => this.onError());
        });

        // Control buttons
        this.addHandler(this.getElement('#btnPlay'), 'click', () => this.togglePlay());
        this.addHandler(this.getElement('#btnStop'), 'click', () => this.stop());
        this.addHandler(this.getElement('#btnPrev'), 'click', () => this.prev());
        this.addHandler(this.getElement('#btnNext'), 'click', () => this.next());
        this.addHandler(this.getElement('#btnShuffle'), 'click', () => this.toggleShuffle());
        this.addHandler(this.getElement('#btnRepeat'), 'click', () => this.toggleRepeat());
        this.addHandler(this.getElement('#btnMute'), 'click', () => this.toggleMute());
        this.addHandler(this.getElement('#btnFullscreen'), 'click', () => this.toggleFullscreen());

        // Progress bar interaction
        const progressTrack = this.getElement('#progressTrack');
        this.addHandler(progressTrack, 'click', (e) => this.seekToPosition(e));
        this.addHandler(progressTrack, 'mousedown', (e) => this.startDragging(e, 'progress'));

        // Volume control
        const volumeTrack = this.getElement('#volumeTrack');
        this.addHandler(volumeTrack, 'click', (e) => this.setVolumeFromPosition(e));

        // Playlist buttons
        this.addHandler(this.getElement('#btnAddFile'), 'click', () => this.showFileDialog());
        this.addHandler(this.getElement('#btnAddUrl'), 'click', () => this.showAddUrlDialog());
        this.addHandler(this.getElement('#btnClear'), 'click', () => this.clearPlaylist());

        // Click on display to play/pause
        this.addHandler(this.getElement('.mp-display'), 'click', () => this.togglePlay());

        // Bind playlist events
        this.bindPlaylistEvents();

        // Setup audio visualizer
        this.setupVisualizer();

        // Listen for volume changes
        this.onEvent(Events.VOLUME_CHANGE, ({ volume }) => {
            this.setInstanceState('volume', volume);
            this.updateVolumeUI();
        });

        // Apply initial volume
        this.updateVolumeUI();

        // Handle window resize to update canvas and video scaling
        this.setupResizeHandler();
    }

    setupResizeHandler() {
        // Observe window resize and update visualizer canvas size
        const resizeObserver = new ResizeObserver(() => {
            this.updateCanvasSize();
        });

        const contentEl = this.getElement('.media-player-pro');
        if (contentEl) {
            resizeObserver.observe(contentEl);
            this.setInstanceState('resizeObserver', resizeObserver);
        }

        // Initial size update
        this.updateCanvasSize();
    }

    updateCanvasSize() {
        const canvas = this.getElement('#visualizerCanvas');
        const container = this.getElement('#visualizerContainer');

        if (canvas && container) {
            // Update canvas dimensions to match container
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
    }

    setupVisualizer() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            this.setInstanceState('audioContext', audioContext);
            this.setInstanceState('analyser', analyser);
        } catch (e) {
            console.log('Audio visualizer not available');
        }
    }

    connectVisualizer(mediaElement) {
        const audioContext = this.getInstanceState('audioContext');
        const analyser = this.getInstanceState('analyser');

        if (!audioContext || !analyser) return;

        try {
            // Resume audio context if suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            const source = audioContext.createMediaElementSource(mediaElement);
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            this.setInstanceState('audioSource', source);
            this.startVisualizerAnimation();
        } catch (e) {
            // Source might already be connected
        }
    }

    startVisualizerAnimation() {
        const canvas = this.getElement('#visualizerCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const analyser = this.getInstanceState('analyser');
        if (!analyser) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!this.getInstanceState('playing')) return;

            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            // Black background
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

                // Win95 teal/blue color scheme
                const intensity = dataArray[i] / 255;
                if (intensity < 0.3) {
                    ctx.fillStyle = '#004040'; // Dark teal
                } else if (intensity < 0.6) {
                    ctx.fillStyle = '#008080'; // Win95 teal
                } else {
                    ctx.fillStyle = '#00C0C0'; // Bright teal
                }

                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
                x += barWidth;
            }
        };

        draw();
    }

    bindPlaylistEvents() {
        this.getElements('.mp-playlist-item').forEach(el => {
            this.addHandler(el, 'dblclick', () => {
                const index = parseInt(el.dataset.index);
                this.playMedia(index);
            });
        });

        this.getElements('.mp-item-remove').forEach(el => {
            this.addHandler(el, 'click', (e) => {
                e.stopPropagation();
                this.removeMedia(parseInt(el.dataset.remove));
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getActiveMediaElement() {
        return this.getInstanceState('isAudio')
            ? this.getElement('#audioElement')
            : this.getElement('#videoElement');
    }

    loadMedia(src, name = null) {
        const isAudio = this.isAudioFile(src);
        const mediaName = name || src.split('/').pop().replace(/\.[^/.]+$/, '');

        const playlist = this.getInstanceState('playlist');
        let index = playlist.findIndex(m => m.src === src);

        if (index === -1) {
            playlist.push({ name: mediaName, src, duration: null, isAudio });
            index = playlist.length - 1;
            this.setInstanceState('playlist', playlist);
            this.refreshPlaylist();
            this.savePlaylist();
        }

        this.playMedia(index);
    }

    playMedia(index) {
        const playlist = this.getInstanceState('playlist');
        if (!playlist || index < 0 || index >= playlist.length) return;

        const item = playlist[index];
        const isAudio = this.isAudioFile(item.src);

        this.setInstanceState('currentIndex', index);
        this.setInstanceState('isAudio', isAudio);

        // Get the correct media element
        const videoEl = this.getElement('#videoElement');
        const audioEl = this.getElement('#audioElement');
        const videoContainer = this.getElement('#videoContainer');
        const visualizer = this.getElement('#visualizerContainer');
        const overlay = this.getElement('#overlay');

        // Hide overlay
        if (overlay) overlay.style.display = 'none';

        // Show appropriate display
        if (isAudio) {
            videoEl.style.display = 'none';
            videoContainer.style.display = 'none';
            visualizer.style.display = 'flex';
            audioEl.src = item.src;
            audioEl.volume = this.getInstanceState('volume');
            this.setInstanceState('mediaElement', audioEl);

            // Try to connect visualizer
            if (!this.getInstanceState('audioSource')) {
                this.connectVisualizer(audioEl);
            }

            audioEl.play().catch(e => this.setTitle('Click to play'));
        } else {
            audioEl.style.display = 'none';
            visualizer.style.display = 'none';
            videoContainer.style.display = 'flex';
            videoEl.style.display = 'block';
            videoEl.src = item.src;
            videoEl.volume = this.getInstanceState('volume');
            this.setInstanceState('mediaElement', videoEl);
            videoEl.play().catch(e => this.setTitle('Click to play'));
        }

        this.setTitle(item.name);
        this.getElement('#nowPlaying').textContent = item.name;
        this.updatePlaylistHighlight(index);

        EventBus.emit('videoplayer:playing', {
            appId: this.id,
            media: item,
            index,
            isAudio,
            timestamp: Date.now()
        });
    }

    togglePlay() {
        const media = this.getActiveMediaElement();
        if (media && media.src) {
            if (media.paused) {
                media.play().catch(() => {});
            } else {
                media.pause();
            }
        } else {
            const playlist = this.getInstanceState('playlist');
            if (playlist && playlist.length > 0) {
                this.playMedia(0);
            }
        }
    }

    stop() {
        const media = this.getActiveMediaElement();
        if (media) {
            media.pause();
            media.currentTime = 0;
        }
        this.setInstanceState('playing', false);
        this.updatePlayButton();
        this.updateProgress(0, 0);
        this.setTitle('Stopped');

        EventBus.emit('videoplayer:stop', {
            appId: this.id,
            timestamp: Date.now()
        });
    }

    prev() {
        this.playSound('click');
        const playlist = this.getInstanceState('playlist');
        let index = this.getInstanceState('currentIndex') - 1;
        if (index < 0) index = playlist.length - 1;
        this.playMedia(index);
    }

    next() {
        this.playSound('click');
        const playlist = this.getInstanceState('playlist');
        const shuffle = this.getInstanceState('shuffle');
        let index;

        if (shuffle) {
            index = Math.floor(Math.random() * playlist.length);
        } else {
            index = this.getInstanceState('currentIndex') + 1;
            if (index >= playlist.length) index = 0;
        }
        this.playMedia(index);
    }

    // Event handlers
    onMediaLoaded() {
        const media = this.getActiveMediaElement();
        if (!media) return;

        const playlist = this.getInstanceState('playlist');
        const currentIndex = this.getInstanceState('currentIndex');

        if (playlist[currentIndex]) {
            playlist[currentIndex].duration = media.duration;
            this.setInstanceState('playlist', playlist);
            this.refreshPlaylist();
            this.savePlaylist();
        }

        this.updateProgress(0, media.duration);
        this.getElement('#totalTime').textContent = this.formatTime(media.duration);

        EventBus.emit('videoplayer:loaded', {
            appId: this.id,
            duration: media.duration,
            timestamp: Date.now()
        });
    }

    onTimeUpdate() {
        const media = this.getActiveMediaElement();
        if (!media) return;

        this.updateProgress(media.currentTime, media.duration);
        this.getElement('#currentTime').textContent = this.formatTime(media.currentTime);

        EventBus.emit('videoplayer:timeupdate', {
            appId: this.id,
            currentTime: media.currentTime,
            duration: media.duration
        });
    }

    onMediaEnded() {
        const repeat = this.getInstanceState('repeat');
        const shuffle = this.getInstanceState('shuffle');
        const playlist = this.getInstanceState('playlist');
        const currentIndex = this.getInstanceState('currentIndex');

        EventBus.emit('videoplayer:ended', {
            appId: this.id,
            media: playlist[currentIndex],
            index: currentIndex,
            timestamp: Date.now()
        });

        if (repeat) {
            this.playMedia(currentIndex);
        } else if (shuffle) {
            const nextIndex = Math.floor(Math.random() * playlist.length);
            this.playMedia(nextIndex);
        } else if (currentIndex < playlist.length - 1) {
            this.playMedia(currentIndex + 1);
        } else {
            this.stop();
            EventBus.emit('videoplayer:playlist:ended', {
                appId: this.id,
                timestamp: Date.now()
            });
        }
    }

    onPlay() {
        this.setInstanceState('playing', true);
        this.updatePlayButton();

        // Start visualizer if audio
        if (this.getInstanceState('isAudio')) {
            this.startVisualizerAnimation();
        }
    }

    onPause() {
        this.setInstanceState('playing', false);
        this.updatePlayButton();
    }

    onError() {
        this.setTitle('Error loading media');
        EventBus.emit('videoplayer:error', {
            appId: this.id,
            error: 'Failed to load media',
            timestamp: Date.now()
        });
    }

    // UI Updates
    updatePlayButton() {
        const icon = this.getElement('#playIcon');
        const playing = this.getInstanceState('playing');
        if (icon) {
            icon.textContent = playing ? '⏸' : '▶';
        }
    }

    updateProgress(current, duration) {
        const fill = this.getElement('#progressFill');
        const handle = this.getElement('#progressHandle');

        if (fill && duration) {
            const percent = (current / duration) * 100;
            fill.style.width = `${percent}%`;
            if (handle) handle.style.left = `${percent}%`;
        }
    }

    updateVolumeUI() {
        const volume = this.getInstanceState('volume');
        const muted = this.getInstanceState('muted');
        const fill = this.getElement('#volumeFill');
        const icon = this.getElement('#volumeIcon');

        if (fill) {
            fill.style.width = `${(muted ? 0 : volume) * 100}%`;
        }

        if (icon) {
            if (muted || volume === 0) icon.textContent = '🔇';
            else if (volume < 0.3) icon.textContent = '🔈';
            else if (volume < 0.7) icon.textContent = '🔉';
            else icon.textContent = '🔊';
        }
    }

    updatePlaylistHighlight(index) {
        this.getElements('.mp-playlist-item').forEach((el, i) => {
            el.classList.toggle('active', i === index);
        });
    }

    setTitle(text) {
        const el = this.getElement('#titleDisplay');
        if (el) el.textContent = text;
    }

    // Seek and Volume
    seekToPosition(e) {
        const media = this.getActiveMediaElement();
        const track = this.getElement('#progressTrack');
        if (!media || !track || !media.duration) return;

        const rect = track.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        media.currentTime = percent * media.duration;
    }

    startDragging(e, type) {
        // Could implement drag-to-seek here
    }

    setVolumeFromPosition(e) {
        const track = this.getElement('#volumeTrack');
        if (!track) return;

        const rect = track.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.setVolume(percent * 100);
    }

    setVolume(value) {
        const volume = value / 100;
        this.setInstanceState('volume', volume);
        this.setInstanceState('muted', false);

        const media = this.getActiveMediaElement();
        if (media) {
            media.volume = volume;
            media.muted = false;
        }

        this.updateVolumeUI();
    }

    toggleMute() {
        const muted = !this.getInstanceState('muted');
        this.setInstanceState('muted', muted);

        const media = this.getActiveMediaElement();
        if (media) media.muted = muted;

        this.updateVolumeUI();
    }

    toggleShuffle() {
        const shuffle = !this.getInstanceState('shuffle');
        this.setInstanceState('shuffle', shuffle);
        this.getElement('#btnShuffle')?.classList.toggle('active', shuffle);
        this.playSound('click');
    }

    toggleRepeat() {
        const repeat = !this.getInstanceState('repeat');
        this.setInstanceState('repeat', repeat);
        this.getElement('#btnRepeat')?.classList.toggle('active', repeat);
        this.playSound('click');
    }

    toggleFullscreen() {
        const container = this.getElement('#videoContainer');
        if (!container || this.getInstanceState('isAudio')) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }

    // Playlist management
    async showAddUrlDialog() {
        const url = await this.prompt('Enter media URL:', '', 'Add URL');
        if (url) {
            const name = await this.prompt('Enter name:', url.split('/').pop().replace(/\.[^/.]+$/, ''), 'Name');
            if (name !== null) {
                this.addMedia({ name: name || 'Untitled', src: url, duration: null });
            }
        }
    }

    showFileDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*,video/*';
        input.multiple = true;

        input.addEventListener('change', (e) => {
            for (const file of e.target.files) {
                const url = URL.createObjectURL(file);
                this.addMedia({
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    src: url,
                    duration: null,
                    isBlob: true
                });
            }
        });

        input.click();
    }

    addMedia(item) {
        const playlist = this.getInstanceState('playlist');
        playlist.push(item);
        this.setInstanceState('playlist', playlist);
        this.savePlaylist();
        this.refreshPlaylist();

        EventBus.emit('videoplayer:playlist:add', {
            appId: this.id,
            media: item,
            timestamp: Date.now()
        });
    }

    removeMedia(index) {
        const playlist = this.getInstanceState('playlist');
        const currentIndex = this.getInstanceState('currentIndex');

        if (index === currentIndex && this.getInstanceState('playing')) {
            this.stop();
        }

        playlist.splice(index, 1);
        this.setInstanceState('playlist', playlist);

        if (currentIndex >= playlist.length) {
            this.setInstanceState('currentIndex', Math.max(0, playlist.length - 1));
        } else if (index < currentIndex) {
            this.setInstanceState('currentIndex', currentIndex - 1);
        }

        this.savePlaylist();
        this.refreshPlaylist();
    }

    async clearPlaylist() {
        if (await this.confirm('Clear entire playlist?')) {
            this.stop();
            this.setInstanceState('playlist', []);
            this.setInstanceState('currentIndex', 0);
            this.savePlaylist();
            this.refreshPlaylist();

            // Show overlay
            const overlay = this.getElement('#overlay');
            if (overlay) overlay.style.display = 'flex';
        }
    }

    refreshPlaylist() {
        const playlist = this.getInstanceState('playlist');
        const playlistEl = this.getElement('#playlist');
        if (!playlistEl) return;

        playlistEl.innerHTML = this.renderPlaylist(playlist);
        this.bindPlaylistEvents();
        this.updatePlaylistHighlight(this.getInstanceState('currentIndex'));
    }

    savePlaylist() {
        const playlist = this.getInstanceState('playlist');
        const saveable = playlist.filter(m => !m.isBlob);
        StorageManager.set('mediaPlayerPlaylist2', saveable);
    }

    onClose() {
        const videoEl = this.getElement('#videoElement');
        const audioEl = this.getElement('#audioElement');

        if (videoEl) { videoEl.pause(); videoEl.src = ''; }
        if (audioEl) { audioEl.pause(); audioEl.src = ''; }

        // Cleanup resize observer
        const resizeObserver = this.getInstanceState('resizeObserver');
        if (resizeObserver) {
            resizeObserver.disconnect();
        }

        EventBus.emit('videoplayer:closed', {
            appId: this.id,
            timestamp: Date.now()
        });
    }
}

export default VideoPlayer;
