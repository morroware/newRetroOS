/**
 * Winamp - Classic MP3 Player Clone
 * Features: Playlist, visualizer, retro skin
 */

import AppBase from './AppBase.js';
import EventBus from '../core/EventBus.js';

class Winamp extends AppBase {
    constructor() {
        super({
            id: 'winamp',
            name: 'Winamp',
            icon: '🎵',
            width: 275,
            height: 350,
            resizable: false,
            singleton: true,
            category: 'multimedia'
        });

        this.audioContext = null;
        this.analyser = null;
        this.isPlaying = false;
        this.currentTrack = 0;
        this.volume = 75;
        this.balance = 50;
        this.oscillator = null;
        this.gainNode = null;
        this.visualizerInterval = null;
        this.timeInterval = null;
        this.currentTime = 0;
        this.duration = 180; // 3 minutes default

        // Playlist of "songs" (we'll synthesize them)
        this.playlist = [
            { title: 'Synth Wave Dreams', artist: 'RetroBot', duration: 180, freq: 440 },
            { title: 'Digital Sunset', artist: 'PixelSound', duration: 210, freq: 523 },
            { title: 'Neon Nights', artist: '8BitMaster', duration: 195, freq: 392 },
            { title: 'Cyber Highway', artist: 'ChipTune Pro', duration: 240, freq: 330 },
            { title: 'Electric Dreams', artist: 'WaveForm', duration: 165, freq: 587 },
            { title: 'Retro Future', artist: 'SynthKid', duration: 200, freq: 494 },
            { title: 'Midnight Protocol', artist: 'DataStream', duration: 220, freq: 415 },
            { title: 'Binary Love', artist: 'CodeBeats', duration: 185, freq: 370 }
        ];

        // Register semantic event commands for scriptability
        this.registerCommands();
        this.registerQueries();
    }

    registerCommands() {
        this.registerCommand('play', () => {
            this.play?.();
            return { success: true, trackIndex: this.currentTrack, title: this.playlist[this.currentTrack]?.title };
        });

        this.registerCommand('pause', () => {
            this.pause?.();
            return { success: true };
        });

        this.registerCommand('stop', () => {
            this.stop?.();
            return { success: true };
        });

        this.registerCommand('next', () => {
            this.next?.();
            return { success: true, trackIndex: this.currentTrack, title: this.playlist[this.currentTrack]?.title };
        });

        this.registerCommand('previous', () => {
            this.prev?.();
            return { success: true, trackIndex: this.currentTrack, title: this.playlist[this.currentTrack]?.title };
        });

        this.registerCommand('setVolume', (payload) => {
            const { volume } = payload;
            if (volume === undefined || volume < 0 || volume > 100) return { success: false, error: 'volume must be between 0 and 100' };
            this.volume = volume;
            if (this.gainNode) {
                this.gainNode.gain.value = this.volume / 100;
            }
            const volumeSlider = this.getElement?.('#volumeSlider');
            if (volumeSlider) volumeSlider.value = volume;
            this.emitAppEvent('volume:changed', { volume });
            return { success: true, volume };
        });

        this.registerCommand('seek', (payload) => {
            const { position } = payload;
            if (position === undefined || position < 0) return { success: false, error: 'position (in seconds) is required and must be >= 0' };
            const track = this.playlist[this.currentTrack];
            this.currentTime = Math.min(position, track.duration);
            this.updateTimeDisplay?.();
            const seekBar = this.getElement?.('#seekBar');
            if (seekBar) {
                seekBar.value = (this.currentTime / track.duration) * 100;
            }
            return { success: true, position: this.currentTime };
        });

        this.registerCommand('loadPlaylist', (payload) => {
            const { tracks } = payload;
            if (!tracks || !Array.isArray(tracks) || tracks.length === 0) return { success: false, error: 'tracks array is required and must not be empty' };
            this.stop?.();
            this.playlist = tracks.map((t, i) => ({
                title: t.title || `Track ${i + 1}`,
                artist: t.artist || 'Unknown',
                duration: t.duration || 180,
                freq: t.freq || 440
            }));
            this.currentTrack = 0;
            this.currentTime = 0;
            // Re-render playlist UI if mounted
            const playlistEl = this.getElement?.('#playlist');
            if (playlistEl) {
                playlistEl.innerHTML = this.playlist.map((t, i) => `
                    <div class="winamp-playlist-item ${i === this.currentTrack ? 'active' : ''}" data-index="${i}">
                        <span><span class="winamp-playlist-num">${i + 1}.</span>${t.artist} - ${t.title}</span>
                        <span class="winamp-playlist-duration">${this.formatTime(t.duration)}</span>
                    </div>
                `).join('');
            }
            this.updateTitleScroll?.();
            this.emitAppEvent('playlist:loaded', { trackCount: this.playlist.length });
            return { success: true, trackCount: this.playlist.length };
        });
    }

    registerQueries() {
        this.registerQuery('getState', () => {
            const track = this.playlist[this.currentTrack];
            return {
                isPlaying: this.isPlaying,
                isPaused: !this.isPlaying && this.currentTime > 0,
                currentTrack: track ? { index: this.currentTrack, title: track.title, artist: track.artist, duration: track.duration } : null,
                volume: this.volume,
                elapsed: this.currentTime,
                duration: this.duration
            };
        });

        this.registerQuery('getCurrentTrack', () => {
            const track = this.playlist[this.currentTrack];
            if (!track) return null;
            return {
                index: this.currentTrack,
                title: track.title,
                artist: track.artist,
                duration: track.duration,
                elapsed: this.currentTime
            };
        });

        this.registerQuery('getPlaylist', () => {
            return this.playlist.map((t, i) => ({
                index: i,
                title: t.title,
                artist: t.artist,
                duration: t.duration,
                active: i === this.currentTrack
            }));
        });
    }

    onOpen() {
        const track = this.playlist[this.currentTrack];

        return `
            <style>
                .winamp-container {
                    background: #232323;
                    height: 100%;
                    font-family: Arial, sans-serif;
                    user-select: none;
                }
                .winamp-main {
                    background: linear-gradient(180deg, #4a4a4a 0%, #232323 100%);
                    border: 2px outset #555;
                    padding: 3px;
                }
                .winamp-titlebar {
                    background: linear-gradient(90deg, #1a3a5c 0%, #2a5a8c 50%, #1a3a5c 100%);
                    color: #fff;
                    font-size: 9px;
                    font-weight: bold;
                    padding: 2px 5px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    letter-spacing: 1px;
                }
                .winamp-display {
                    background: #000;
                    border: 2px inset #333;
                    margin: 3px;
                    padding: 5px;
                    height: 60px;
                    position: relative;
                    overflow: hidden;
                }
                .winamp-visualizer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                .winamp-info {
                    position: relative;
                    z-index: 1;
                    color: #0f0;
                    font-size: 8px;
                    text-shadow: 0 0 5px #0f0;
                }
                .winamp-title-scroll {
                    color: #0f0;
                    font-size: 11px;
                    white-space: nowrap;
                    overflow: hidden;
                    margin-bottom: 3px;
                    font-weight: bold;
                    text-shadow: 0 0 8px #0f0;
                }
                .winamp-time {
                    font-family: 'Courier New', monospace;
                    font-size: 18px;
                    color: #0f0;
                    text-shadow: 0 0 10px #0f0;
                    position: absolute;
                    right: 5px;
                    top: 5px;
                }
                .winamp-kbps {
                    color: #0f0;
                    font-size: 9px;
                    position: absolute;
                    left: 5px;
                    bottom: 5px;
                }
                .winamp-khz {
                    color: #0f0;
                    font-size: 9px;
                    position: absolute;
                    left: 50px;
                    bottom: 5px;
                }
                .winamp-stereo {
                    color: #0f0;
                    font-size: 8px;
                    position: absolute;
                    right: 5px;
                    bottom: 5px;
                    letter-spacing: 2px;
                }
                .winamp-slider-section {
                    display: flex;
                    padding: 5px;
                    gap: 10px;
                    align-items: center;
                }
                .winamp-slider-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-size: 8px;
                    color: #0f0;
                }
                .winamp-slider {
                    -webkit-appearance: none;
                    width: 60px;
                    height: 10px;
                    background: #000;
                    border: 1px inset #333;
                    outline: none;
                }
                .winamp-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 10px;
                    height: 16px;
                    background: linear-gradient(180deg, #888 0%, #444 100%);
                    border: 1px outset #666;
                    cursor: pointer;
                }
                .winamp-seek {
                    -webkit-appearance: none;
                    width: calc(100% - 16px);
                    height: 8px;
                    background: #000;
                    border: 1px inset #333;
                    margin: 3px 8px;
                }
                .winamp-seek::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px;
                    height: 12px;
                    background: linear-gradient(180deg, #888 0%, #444 100%);
                    border: 1px outset #666;
                    cursor: pointer;
                }
                .winamp-controls {
                    display: flex;
                    justify-content: center;
                    gap: 3px;
                    padding: 5px;
                }
                .winamp-btn {
                    width: 23px;
                    height: 18px;
                    background: linear-gradient(180deg, #666 0%, #333 100%);
                    border: 1px outset #555;
                    color: #fff;
                    font-size: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .winamp-btn:active {
                    border-style: inset;
                    background: linear-gradient(180deg, #333 0%, #666 100%);
                }
                .winamp-btn.active {
                    background: linear-gradient(180deg, #2a5a2a 0%, #1a3a1a 100%);
                    border-style: inset;
                }
                .winamp-playlist {
                    background: #000;
                    border: 2px inset #333;
                    margin: 3px;
                    height: 120px;
                    overflow-y: auto;
                }
                .winamp-playlist-item {
                    color: #0f0;
                    font-size: 10px;
                    padding: 2px 5px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                }
                .winamp-playlist-item:hover {
                    background: #1a3a1a;
                }
                .winamp-playlist-item.active {
                    background: #2a5a8c;
                    color: #fff;
                }
                .winamp-playlist-num {
                    color: #888;
                    margin-right: 5px;
                }
                .winamp-playlist-duration {
                    color: #888;
                }
                .winamp-eq {
                    display: flex;
                    justify-content: space-around;
                    padding: 3px 5px;
                    background: #1a1a1a;
                    margin: 0 3px;
                }
                .winamp-eq-bar {
                    width: 8px;
                    height: 30px;
                    background: #000;
                    border: 1px inset #333;
                    position: relative;
                    overflow: hidden;
                }
                .winamp-eq-fill {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    background: linear-gradient(180deg, #0f0 0%, #080 100%);
                    transition: height 0.1s;
                }
            </style>
            <div class="winamp-container">
                <div class="winamp-main">
                    <div class="winamp-titlebar">
                        <span>WINAMP</span>
                        <span style="font-size: 7px;">It really whips the llama's ass!</span>
                    </div>

                    <div class="winamp-display">
                        <canvas class="winamp-visualizer" id="visualizer"></canvas>
                        <div class="winamp-info">
                            <div class="winamp-title-scroll" id="titleScroll">${track.artist} - ${track.title}</div>
                        </div>
                        <div class="winamp-time" id="timeDisplay">0:00</div>
                        <div class="winamp-kbps">128</div>
                        <div class="winamp-khz">kbps</div>
                        <div class="winamp-stereo">STEREO</div>
                    </div>

                    <input type="range" class="winamp-seek" id="seekBar" min="0" max="100" value="0">

                    <div class="winamp-slider-section">
                        <div class="winamp-slider-group">
                            <span>VOL</span>
                            <input type="range" class="winamp-slider" id="volumeSlider" min="0" max="100" value="${this.volume}">
                        </div>
                        <div class="winamp-slider-group">
                            <span>BAL</span>
                            <input type="range" class="winamp-slider" id="balanceSlider" min="0" max="100" value="50">
                        </div>
                        <div class="winamp-eq">
                            ${[60, 170, 310, 600, 1000, 3000, 6000, 12000].map((f, i) => `
                                <div class="winamp-eq-bar">
                                    <div class="winamp-eq-fill" id="eq${i}" style="height: 50%;"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="winamp-controls">
                        <button class="winamp-btn" id="btnPrev" title="Previous">⏮</button>
                        <button class="winamp-btn" id="btnPlay" title="Play">▶</button>
                        <button class="winamp-btn" id="btnPause" title="Pause">⏸</button>
                        <button class="winamp-btn" id="btnStop" title="Stop">⏹</button>
                        <button class="winamp-btn" id="btnNext" title="Next">⏭</button>
                        <button class="winamp-btn" id="btnShuffle" title="Shuffle">🔀</button>
                        <button class="winamp-btn" id="btnRepeat" title="Repeat">🔁</button>
                    </div>

                    <div class="winamp-playlist" id="playlist">
                        ${this.playlist.map((t, i) => `
                            <div class="winamp-playlist-item ${i === this.currentTrack ? 'active' : ''}" data-index="${i}">
                                <span><span class="winamp-playlist-num">${i + 1}.</span>${t.artist} - ${t.title}</span>
                                <span class="winamp-playlist-duration">${this.formatTime(t.duration)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    onMount() {
        // Initialize Web Audio
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 64;
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.analyser.connect(this.gainNode);
        } catch (e) {
            console.log('Web Audio not available');
        }

        // Control buttons
        this.addHandler(this.getElement('#btnPlay'), 'click', () => this.play());
        this.addHandler(this.getElement('#btnPause'), 'click', () => this.pause());
        this.addHandler(this.getElement('#btnStop'), 'click', () => this.stop());
        this.addHandler(this.getElement('#btnNext'), 'click', () => this.next());
        this.addHandler(this.getElement('#btnPrev'), 'click', () => this.prev());
        this.addHandler(this.getElement('#btnShuffle'), 'click', (e) => {
            e.target.classList.toggle('active');
        });
        this.addHandler(this.getElement('#btnRepeat'), 'click', (e) => {
            e.target.classList.toggle('active');
        });

        // Volume slider
        this.addHandler(this.getElement('#volumeSlider'), 'input', (e) => {
            this.volume = parseInt(e.target.value);
            if (this.gainNode) {
                this.gainNode.gain.value = this.volume / 100;
            }
        });

        // Seek bar
        this.addHandler(this.getElement('#seekBar'), 'input', (e) => {
            const track = this.playlist[this.currentTrack];
            this.currentTime = (parseInt(e.target.value) / 100) * track.duration;
            this.updateTimeDisplay();
        });

        // Playlist items
        this.getElements('.winamp-playlist-item').forEach(item => {
            this.addHandler(item, 'dblclick', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.currentTrack = index;
                this.stop();
                this.play();
                this.updatePlaylistHighlight();
            });
        });

        // Start visualizer
        this.startVisualizer();
    }

    onClose() {
        this.stop();
        if (this.visualizerInterval) {
            cancelAnimationFrame(this.visualizerInterval);
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    play() {
        if (this.isPlaying) return;

        const track = this.playlist[this.currentTrack];
        this.duration = track.duration;

        // Create oscillator for synthesized sound
        if (this.audioContext) {
            this.oscillator = this.audioContext.createOscillator();
            this.oscillator.type = 'sawtooth';
            this.oscillator.frequency.setValueAtTime(track.freq, this.audioContext.currentTime);

            // Add some modulation for interest
            this.lfo = this.audioContext.createOscillator();
            this.lfoGain = this.audioContext.createGain();
            this.lfo.frequency.setValueAtTime(5, this.audioContext.currentTime);
            this.lfoGain.gain.setValueAtTime(10, this.audioContext.currentTime);
            this.lfo.connect(this.lfoGain);
            this.lfoGain.connect(this.oscillator.frequency);
            this.lfo.start();

            this.oscillator.connect(this.analyser);
            this.oscillator.start();
            this.gainNode.gain.value = this.volume / 100;
        }

        this.isPlaying = true;
        this.getElement('#btnPlay')?.classList.add('active');

        // Emit play event
        this.emitAppEvent('play', {
            trackIndex: this.currentTrack,
            title: track.title,
            artist: track.artist,
            duration: track.duration
        });

        // Update time
        this.timeInterval = setInterval(() => {
            this.currentTime++;
            this.updateTimeDisplay();

            const seekBar = this.getElement('#seekBar');
            if (seekBar) {
                seekBar.value = (this.currentTime / this.duration) * 100;
            }

            if (this.currentTime >= this.duration) {
                this.next();
            }
        }, 1000);

        this.updateTitleScroll();
    }

    pause() {
        if (!this.isPlaying) return;

        if (this.lfo) {
            this.lfo.stop();
            this.lfo = null;
        }
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }

        this.isPlaying = false;
        this.getElement('#btnPlay')?.classList.remove('active');

        // Emit pause event
        this.emitAppEvent('pause', {
            trackIndex: this.currentTrack,
            currentTime: this.currentTime
        });

        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }

    stop() {
        const wasPlaying = this.isPlaying;
        this.pause();
        this.currentTime = 0;
        this.updateTimeDisplay();

        const seekBar = this.getElement('#seekBar');
        if (seekBar) seekBar.value = 0;

        // Emit stop event only if it was playing
        if (wasPlaying) {
            this.emitAppEvent('stop', {
                trackIndex: this.currentTrack
            });
        }
    }

    next() {
        this.stop();

        const shuffleBtn = this.getElement('#btnShuffle');
        if (shuffleBtn?.classList.contains('active')) {
            this.currentTrack = Math.floor(Math.random() * this.playlist.length);
        } else {
            this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
        }

        this.updatePlaylistHighlight();
        this.updateTitleScroll();

        // Emit track changed event
        const track = this.playlist[this.currentTrack];
        this.emitAppEvent('track:changed', {
            trackIndex: this.currentTrack,
            title: track.title,
            artist: track.artist,
            direction: 'next'
        });

        this.play();
    }

    prev() {
        this.stop();
        this.currentTrack = (this.currentTrack - 1 + this.playlist.length) % this.playlist.length;
        this.updatePlaylistHighlight();
        this.updateTitleScroll();

        // Emit track changed event
        const track = this.playlist[this.currentTrack];
        this.emitAppEvent('track:changed', {
            trackIndex: this.currentTrack,
            title: track.title,
            artist: track.artist,
            direction: 'prev'
        });

        this.play();
    }

    updateTimeDisplay() {
        const display = this.getElement('#timeDisplay');
        if (display) {
            display.textContent = this.formatTime(this.currentTime);
        }
    }

    updateTitleScroll() {
        const scroll = this.getElement('#titleScroll');
        const track = this.playlist[this.currentTrack];
        if (scroll) {
            scroll.textContent = `${track.artist} - ${track.title}`;
        }
    }

    updatePlaylistHighlight() {
        this.getElements('.winamp-playlist-item').forEach((item, i) => {
            item.classList.toggle('active', i === this.currentTrack);
        });
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    startVisualizer() {
        const canvas = this.getElement('#visualizer');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const draw = () => {
            this.visualizerInterval = requestAnimationFrame(draw);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (this.isPlaying && this.analyser) {
                const bufferLength = this.analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                this.analyser.getByteFrequencyData(dataArray);

                const barWidth = canvas.width / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * canvas.height;

                    const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                    gradient.addColorStop(0, '#0f0');
                    gradient.addColorStop(0.5, '#0a0');
                    gradient.addColorStop(1, '#050');

                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

                    x += barWidth;
                }

                // Update EQ bars
                for (let i = 0; i < 8; i++) {
                    const eqBar = this.getElement(`#eq${i}`);
                    if (eqBar && dataArray[i * 2]) {
                        eqBar.style.height = `${(dataArray[i * 2] / 255) * 100}%`;
                    }
                }
            } else {
                // Idle animation
                for (let i = 0; i < 8; i++) {
                    const eqBar = this.getElement(`#eq${i}`);
                    if (eqBar) {
                        eqBar.style.height = `${20 + Math.sin(Date.now() / 500 + i) * 10}%`;
                    }
                }
            }
        };

        draw();
    }
}

export default Winamp;
