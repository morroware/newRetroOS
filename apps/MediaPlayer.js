/**
 * Media Player App
 * Full-featured audio player with MP3 support
 *
 * Features:
 * - Play MP3 files from URLs or local paths
 * - Playlist management
 * - Volume control
 * - Seek/progress bar
 * - Visualizer
 * - File browser integration
 */

import AppBase from './AppBase.js';
import EventBus, { Events } from '../core/EventBus.js';
import SoundSystem from '../features/SoundSystem.js';
import FileSystemManager from '../core/FileSystemManager.js';
import StorageManager from '../core/StorageManager.js';

class MediaPlayer extends AppBase {
    constructor() {
        super({
            id: 'mediaplayer',
            name: 'Media Player',
            icon: '📻',
            width: 400,
            height: 500,
            resizable: true,
            singleton: true,
            category: 'multimedia'
        });

        // Default playlist with sample tracks (URLs to free audio)
        this.defaultPlaylist = [
            {
                name: 'Windows 95 Startup',
                src: 'assets/sounds/startup.mp3',
                duration: null
            },
            {
                name: 'Click Sound',
                src: 'assets/sounds/click.mp3',
                duration: null
            },
            {
                name: 'Error Sound',
                src: 'assets/sounds/error.mp3',
                duration: null
            },
            {
                name: 'Notification',
                src: 'assets/sounds/notify.mp3',
                duration: null
            }
        ];

        // Register semantic event commands for scriptability
        this.registerCommands();
        this.registerQueries();
    }

    /**
     * Register commands for script control
     */
    registerCommands() {
        // Play current track or resume
        this.registerCommand('play', () => {
            const audio = this.getInstanceState('audio');
            if (audio) {
                audio.play();
                this.setInstanceState('playing', true);
                EventBus.emit('mediaplayer:play', {
                    appId: this.id,
                    track: this.getInstanceState('currentTrack'),
                    timestamp: Date.now()
                });
                return { success: true };
            }
            return { success: false, error: 'No audio loaded' };
        });

        // Pause playback
        this.registerCommand('pause', () => {
            const audio = this.getInstanceState('audio');
            if (audio) {
                audio.pause();
                this.setInstanceState('playing', false);
                EventBus.emit('mediaplayer:pause', {
                    appId: this.id,
                    timestamp: Date.now()
                });
                return { success: true };
            }
            return { success: false, error: 'No audio loaded' };
        });

        // Stop playback
        this.registerCommand('stop', () => {
            const audio = this.getInstanceState('audio');
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
                this.setInstanceState('playing', false);
                EventBus.emit('mediaplayer:stop', {
                    appId: this.id,
                    timestamp: Date.now()
                });
                return { success: true };
            }
            return { success: false, error: 'No audio loaded' };
        });

        // Next track
        this.registerCommand('next', () => {
            const playlist = this.getInstanceState('playlist') || [];
            const currentTrack = this.getInstanceState('currentTrack') || 0;
            const nextTrack = (currentTrack + 1) % playlist.length;
            this.playTrack(nextTrack);
            return { success: true, track: nextTrack };
        });

        // Previous track
        this.registerCommand('previous', () => {
            const playlist = this.getInstanceState('playlist') || [];
            const currentTrack = this.getInstanceState('currentTrack') || 0;
            const prevTrack = currentTrack === 0 ? playlist.length - 1 : currentTrack - 1;
            this.playTrack(prevTrack);
            return { success: true, track: prevTrack };
        });

        // Set volume (0-100)
        this.registerCommand('setVolume', (volume) => {
            const vol = Math.max(0, Math.min(100, parseInt(volume))) / 100;
            SoundSystem.setVolume(vol);
            this.setInstanceState('volume', vol);
            const audio = this.getInstanceState('audio');
            if (audio) audio.volume = vol;
            EventBus.emit('mediaplayer:volume:changed', {
                appId: this.id,
                volume: vol,
                timestamp: Date.now()
            });
            return { success: true, volume: vol };
        });

        // Seek to position (in seconds)
        this.registerCommand('seek', (position) => {
            const audio = this.getInstanceState('audio');
            if (audio) {
                audio.currentTime = Math.max(0, Math.min(audio.duration || 0, position));
                return { success: true, position: audio.currentTime };
            }
            return { success: false, error: 'No audio loaded' };
        });

        // Play specific track by index
        this.registerCommand('playTrack', (index) => {
            const playlist = this.getInstanceState('playlist') || [];
            const trackIndex = parseInt(index);
            if (trackIndex >= 0 && trackIndex < playlist.length) {
                this.playTrack(trackIndex);
                return { success: true, track: trackIndex };
            }
            return { success: false, error: 'Invalid track index' };
        });
    }

    /**
     * Register queries for script inspection
     */
    registerQueries() {
        // Get current playback state
        this.registerQuery('getState', () => {
            const audio = this.getInstanceState('audio');
            return {
                playing: this.getInstanceState('playing'),
                currentTrack: this.getInstanceState('currentTrack'),
                currentTime: audio ? audio.currentTime : 0,
                duration: audio ? audio.duration : 0,
                volume: this.getInstanceState('volume'),
                repeat: this.getInstanceState('repeat'),
                shuffle: this.getInstanceState('shuffle')
            };
        });

        // Get playlist
        this.registerQuery('getPlaylist', () => {
            return { playlist: this.getInstanceState('playlist') || [] };
        });

        // Get current track info
        this.registerQuery('getCurrentTrack', () => {
            const playlist = this.getInstanceState('playlist') || [];
            const currentTrack = this.getInstanceState('currentTrack') || 0;
            const track = playlist[currentTrack];
            return {
                index: currentTrack,
                track: track || null
            };
        });
    }

    onOpen() {
        // Load saved playlist or use default
        const savedPlaylist = StorageManager.get('mediaPlayerPlaylist');
        const playlist = savedPlaylist || this.defaultPlaylist;
        this.setInstanceState('playlist', playlist);
        this.setInstanceState('currentTrack', 0);
        this.setInstanceState('playing', false);
        this.setInstanceState('currentTime', 0);
        this.setInstanceState('duration', 0);
        this.setInstanceState('volume', SoundSystem.getVolume());
        this.setInstanceState('audio', null);
        this.setInstanceState('repeat', false);
        this.setInstanceState('shuffle', false);

        const bars = Array(16).fill(0).map((_, i) =>
            `<div class="media-bar" data-bar="${i}" style="animation-delay: ${i * 0.05}s;"></div>`
        ).join('');

        const tracks = playlist.map((track, i) => `
            <div class="playlist-item" data-track="${i}">
                <span class="track-icon">🎵</span>
                <span class="track-name">${this.escapeHtml(track.name)}</span>
                <span class="track-duration">${track.duration ? this.formatTime(track.duration) : '--:--'}</span>
                <button class="track-remove" data-remove="${i}" title="Remove">×</button>
            </div>
        `).join('');

        return `
            <div class="media-player">
                <div class="media-display">
                    <div class="media-visualizer" id="visualizer">${bars}</div>
                    <div class="media-info">
                        <div class="media-title" id="currentTitle">No track selected</div>
                        <div class="media-time">
                            <span id="currentTime">0:00</span>
                            <span>/</span>
                            <span id="totalTime">0:00</span>
                        </div>
                    </div>
                </div>

                <div class="media-progress-container">
                    <input type="range" class="media-progress" id="progressBar"
                           min="0" max="100" value="0" step="0.1">
                </div>

                <div class="media-controls">
                    <button class="media-btn media-btn-small" id="btnShuffle" title="Shuffle">🔀</button>
                    <button class="media-btn" id="btnPrev" title="Previous">⏮</button>
                    <button class="media-btn media-btn-large" id="btnPlay" title="Play">▶</button>
                    <button class="media-btn" id="btnStop" title="Stop">⏹</button>
                    <button class="media-btn" id="btnNext" title="Next">⏭</button>
                    <button class="media-btn media-btn-small" id="btnRepeat" title="Repeat">🔁</button>
                </div>

                <div class="media-volume-container">
                    <span class="volume-icon" id="volumeIcon">🔊</span>
                    <input type="range" class="media-volume" id="volumeSlider"
                           min="0" max="100" value="${Math.round(this.getInstanceState('volume') * 100)}">
                    <span class="volume-value" id="volumeValue">${Math.round(this.getInstanceState('volume') * 100)}%</span>
                </div>

                <div class="media-playlist-header">
                    <span>Playlist</span>
                    <div class="playlist-buttons">
                        <button class="playlist-btn" id="btnAddUrl" title="Add from URL">🌐</button>
                        <button class="playlist-btn" id="btnAddFile" title="Add from file">📁</button>
                        <button class="playlist-btn" id="btnClear" title="Clear playlist">🗑️</button>
                    </div>
                </div>

                <div class="media-playlist" id="playlist">${tracks}</div>

                <div class="media-status" id="status">Ready</div>
            </div>
        `;
    }

    onMount() {
        // Control buttons
        this.addHandler(this.getElement('#btnPlay'), 'click', () => this.togglePlay());
        this.addHandler(this.getElement('#btnStop'), 'click', () => this.stop());
        this.addHandler(this.getElement('#btnPrev'), 'click', () => this.prev());
        this.addHandler(this.getElement('#btnNext'), 'click', () => this.next());
        this.addHandler(this.getElement('#btnShuffle'), 'click', () => this.toggleShuffle());
        this.addHandler(this.getElement('#btnRepeat'), 'click', () => this.toggleRepeat());

        // Progress bar
        this.addHandler(this.getElement('#progressBar'), 'input', (e) => this.seek(e.target.value));

        // Volume control
        this.addHandler(this.getElement('#volumeSlider'), 'input', (e) => this.setVolume(e.target.value));
        this.addHandler(this.getElement('#volumeIcon'), 'click', () => this.toggleMute());

        // Playlist buttons
        this.addHandler(this.getElement('#btnAddUrl'), 'click', () => this.showAddUrlDialog());
        this.addHandler(this.getElement('#btnAddFile'), 'click', () => this.showFileDialog());
        this.addHandler(this.getElement('#btnClear'), 'click', () => this.clearPlaylist());

        // Playlist item clicks
        this.getElements('.playlist-item').forEach(el => {
            this.addHandler(el, 'dblclick', () => {
                const trackIndex = parseInt(el.dataset.track);
                this.setInstanceState('currentTrack', trackIndex);
                this.loadAndPlay(trackIndex);
            });
        });

        // Remove buttons
        this.getElements('.track-remove').forEach(el => {
            this.addHandler(el, 'click', (e) => {
                e.stopPropagation();
                this.removeTrack(parseInt(el.dataset.remove));
            });
        });

        // Listen for audio events
        this.onEvent(Events.AUDIO_ENDED, () => this.onTrackEnded());
        this.onEvent(Events.VOLUME_CHANGE, ({ volume }) => this.onVolumeChanged(volume));

        // Update UI state
        this.updateShuffleButton();
        this.updateRepeatButton();
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

    togglePlay() {
        const audio = this.getInstanceState('audio');
        if (audio) {
            if (audio.paused) {
                audio.play().catch(e => this.setStatus('Playback error'));
                this.setInstanceState('playing', true);
            } else {
                audio.pause();
                this.setInstanceState('playing', false);
            }
            this.updatePlayButton();
            this.updateVisualizer();
        } else {
            // No audio loaded, start from current track
            this.loadAndPlay(this.getInstanceState('currentTrack'));
        }
    }

    loadAndPlay(trackIndex) {
        const playlist = this.getInstanceState('playlist');
        if (!playlist || trackIndex < 0 || trackIndex >= playlist.length) return;

        // Stop current audio
        this.stopAudio();

        const track = playlist[trackIndex];
        this.setInstanceState('currentTrack', trackIndex);

        this.setStatus(`Loading: ${track.name}`);
        this.updateCurrentTitle(track.name);
        this.updatePlaylistHighlight(trackIndex);

        try {
            const audio = new Audio(track.src);
            audio.volume = this.getInstanceState('volume');

            audio.addEventListener('loadedmetadata', () => {
                this.setInstanceState('duration', audio.duration);
                this.updateTotalTime(audio.duration);

                // Update track duration in playlist
                const playlist = this.getInstanceState('playlist');
                if (playlist[trackIndex]) {
                    playlist[trackIndex].duration = audio.duration;
                    this.setInstanceState('playlist', playlist);
                    this.savePlaylist();
                }
            });

            audio.addEventListener('timeupdate', () => {
                this.setInstanceState('currentTime', audio.currentTime);
                this.updateProgress(audio.currentTime, audio.duration);
            });

            audio.addEventListener('ended', () => {
                this.onTrackEnded();
            });

            audio.addEventListener('error', (e) => {
                this.setStatus(`Error loading: ${track.name}`);
                this.setInstanceState('playing', false);
                this.updatePlayButton();
                this.updateVisualizer();
            });

            audio.addEventListener('canplay', () => {
                this.setStatus(`Now playing: ${track.name}`);
            });

            this.setInstanceState('audio', audio);

            audio.play()
                .then(() => {
                    this.setInstanceState('playing', true);
                    this.updatePlayButton();
                    this.updateVisualizer();
                })
                .catch(e => {
                    this.setStatus('Click to play (browser policy)');
                });

        } catch (e) {
            this.setStatus(`Error: ${e.message}`);
        }
    }

    stopAudio() {
        const audio = this.getInstanceState('audio');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            audio.src = '';
            this.setInstanceState('audio', null);
        }
    }

    stop() {
        this.stopAudio();
        this.setInstanceState('playing', false);
        this.setInstanceState('currentTime', 0);
        this.updatePlayButton();
        this.updateVisualizer();
        this.updateProgress(0, 0);
        this.setStatus('Stopped');
    }

    prev() {
        this.playSound('click');
        let trackIndex = this.getInstanceState('currentTrack') - 1;
        const playlist = this.getInstanceState('playlist');

        if (trackIndex < 0) {
            trackIndex = playlist.length - 1;
        }

        this.loadAndPlay(trackIndex);
    }

    next() {
        this.playSound('click');
        const playlist = this.getInstanceState('playlist');
        let trackIndex;

        if (this.getInstanceState('shuffle')) {
            trackIndex = Math.floor(Math.random() * playlist.length);
        } else {
            trackIndex = this.getInstanceState('currentTrack') + 1;
            if (trackIndex >= playlist.length) {
                trackIndex = 0;
            }
        }

        this.loadAndPlay(trackIndex);
    }

    onTrackEnded() {
        const repeat = this.getInstanceState('repeat');
        const shuffle = this.getInstanceState('shuffle');
        const playlist = this.getInstanceState('playlist');
        const currentTrack = this.getInstanceState('currentTrack');

        if (repeat) {
            // Repeat current track
            this.loadAndPlay(currentTrack);
        } else if (shuffle) {
            // Random next track
            const nextTrack = Math.floor(Math.random() * playlist.length);
            this.loadAndPlay(nextTrack);
        } else if (currentTrack < playlist.length - 1) {
            // Play next track
            this.loadAndPlay(currentTrack + 1);
        } else {
            // End of playlist
            this.stop();
            this.setStatus('Playlist ended');
        }
    }

    seek(percent) {
        const audio = this.getInstanceState('audio');
        if (audio && audio.duration) {
            audio.currentTime = (percent / 100) * audio.duration;
        }
    }

    setVolume(value) {
        const volume = value / 100;
        this.setInstanceState('volume', volume);

        const audio = this.getInstanceState('audio');
        if (audio) {
            audio.volume = volume;
        }

        SoundSystem.setVolume(volume);
        this.updateVolumeDisplay(volume);
    }

    toggleMute() {
        const volume = this.getInstanceState('volume');
        if (volume > 0) {
            this.setInstanceState('prevVolume', volume);
            this.setVolume(0);
            this.getElement('#volumeSlider').value = 0;
        } else {
            const prevVolume = this.getInstanceState('prevVolume') || 0.5;
            this.setVolume(prevVolume * 100);
            this.getElement('#volumeSlider').value = prevVolume * 100;
        }
    }

    toggleShuffle() {
        const shuffle = !this.getInstanceState('shuffle');
        this.setInstanceState('shuffle', shuffle);
        this.updateShuffleButton();
        this.playSound('click');
    }

    toggleRepeat() {
        const repeat = !this.getInstanceState('repeat');
        this.setInstanceState('repeat', repeat);
        this.updateRepeatButton();
        this.playSound('click');
    }

    onVolumeChanged(volume) {
        this.setInstanceState('volume', volume);
        this.updateVolumeDisplay(volume);
        const slider = this.getElement('#volumeSlider');
        if (slider) {
            slider.value = Math.round(volume * 100);
        }
    }

    // UI Update Methods
    updatePlayButton() {
        const btn = this.getElement('#btnPlay');
        if (btn) {
            btn.textContent = this.getInstanceState('playing') ? '⏸' : '▶';
            btn.title = this.getInstanceState('playing') ? 'Pause' : 'Play';
        }
    }

    updateVisualizer() {
        const playing = this.getInstanceState('playing');
        this.getElements('.media-bar').forEach(bar => {
            bar.style.animationPlayState = playing ? 'running' : 'paused';
        });
    }

    updateProgress(currentTime, duration) {
        const progressBar = this.getElement('#progressBar');
        const currentTimeEl = this.getElement('#currentTime');

        if (progressBar && duration) {
            progressBar.value = (currentTime / duration) * 100;
        }
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(currentTime);
        }
    }

    updateTotalTime(duration) {
        const totalTimeEl = this.getElement('#totalTime');
        if (totalTimeEl) {
            totalTimeEl.textContent = this.formatTime(duration);
        }
    }

    updateCurrentTitle(title) {
        const titleEl = this.getElement('#currentTitle');
        if (titleEl) {
            titleEl.textContent = title;
        }
    }

    updateVolumeDisplay(volume) {
        const icon = this.getElement('#volumeIcon');
        const value = this.getElement('#volumeValue');

        if (icon) {
            if (volume === 0) icon.textContent = '🔇';
            else if (volume < 0.3) icon.textContent = '🔈';
            else if (volume < 0.7) icon.textContent = '🔉';
            else icon.textContent = '🔊';
        }
        if (value) {
            value.textContent = `${Math.round(volume * 100)}%`;
        }
    }

    updateShuffleButton() {
        const btn = this.getElement('#btnShuffle');
        if (btn) {
            btn.classList.toggle('active', this.getInstanceState('shuffle'));
        }
    }

    updateRepeatButton() {
        const btn = this.getElement('#btnRepeat');
        if (btn) {
            btn.classList.toggle('active', this.getInstanceState('repeat'));
        }
    }

    updatePlaylistHighlight(trackIndex) {
        this.getElements('.playlist-item').forEach((el, i) => {
            el.classList.toggle('playing', i === trackIndex);
            el.classList.toggle('active', i === trackIndex);
        });
    }

    setStatus(message) {
        const statusEl = this.getElement('#status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    // Playlist Management
    async showAddUrlDialog() {
        const url = await this.prompt('Enter audio URL (MP3, WAV, OGG):', '', 'Add URL');
        if (url) {
            const name = await this.prompt('Enter track name:', url.split('/').pop().replace(/\.[^/.]+$/, ''), 'Track Name');
            if (name) {
                this.addTrack({ name, src: url, duration: null });
            }
        }
    }

    showFileDialog() {
        // Create a temporary file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.multiple = true;

        input.addEventListener('change', (e) => {
            const files = e.target.files;
            for (const file of files) {
                const url = URL.createObjectURL(file);
                this.addTrack({
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    src: url,
                    duration: null,
                    isBlob: true
                });
            }
        });

        input.click();
    }

    addTrack(track) {
        const playlist = this.getInstanceState('playlist');
        playlist.push(track);
        this.setInstanceState('playlist', playlist);
        this.savePlaylist();
        this.refreshPlaylist();
        this.setStatus(`Added: ${track.name}`);
    }

    removeTrack(index) {
        const playlist = this.getInstanceState('playlist');
        const currentTrack = this.getInstanceState('currentTrack');

        if (index === currentTrack && this.getInstanceState('playing')) {
            this.stop();
        }

        playlist.splice(index, 1);
        this.setInstanceState('playlist', playlist);

        // Adjust current track if needed
        if (currentTrack >= playlist.length) {
            this.setInstanceState('currentTrack', Math.max(0, playlist.length - 1));
        } else if (index < currentTrack) {
            this.setInstanceState('currentTrack', currentTrack - 1);
        }

        this.savePlaylist();
        this.refreshPlaylist();
        this.setStatus('Track removed');
    }

    async clearPlaylist() {
        if (await this.confirm('Clear entire playlist?', 'Clear Playlist')) {
            this.stop();
            this.setInstanceState('playlist', []);
            this.setInstanceState('currentTrack', 0);
            this.savePlaylist();
            this.refreshPlaylist();
            this.setStatus('Playlist cleared');
        }
    }

    refreshPlaylist() {
        const playlist = this.getInstanceState('playlist');
        const playlistEl = this.getElement('#playlist');

        if (!playlistEl) return;

        playlistEl.innerHTML = playlist.map((track, i) => `
            <div class="playlist-item ${i === this.getInstanceState('currentTrack') ? 'active' : ''}" data-track="${i}">
                <span class="track-icon">🎵</span>
                <span class="track-name">${this.escapeHtml(track.name)}</span>
                <span class="track-duration">${track.duration ? this.formatTime(track.duration) : '--:--'}</span>
                <button class="track-remove" data-remove="${i}" title="Remove">×</button>
            </div>
        `).join('');

        // Rebind event handlers
        this.getElements('.playlist-item').forEach(el => {
            el.addEventListener('dblclick', () => {
                const trackIndex = parseInt(el.dataset.track);
                this.setInstanceState('currentTrack', trackIndex);
                this.loadAndPlay(trackIndex);
            });
        });

        this.getElements('.track-remove').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeTrack(parseInt(el.dataset.remove));
            });
        });
    }

    savePlaylist() {
        const playlist = this.getInstanceState('playlist');
        // Don't save blob URLs
        const saveable = playlist.filter(t => !t.isBlob);
        StorageManager.set('mediaPlayerPlaylist', saveable);
    }

    onClose() {
        this.stopAudio();
    }
}

export default MediaPlayer;
