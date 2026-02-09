/**
 * Clock App
 * Windows 95 style clock with:
 * - Analog and digital clock display
 * - Multiple alarms
 * - Stopwatch with lap times
 * - Countdown timer
 */

import AppBase from './AppBase.js';
import EventBus from '../core/SemanticEventBus.js';

class Clock extends AppBase {
    constructor() {
        super({
            id: 'clock',
            name: 'Clock',
            icon: '🕐',
            width: 380,
            height: 440,
            resizable: false,
            category: 'accessories',
            singleton: true
        });
    }

    onOpen() {
        // Initialize state
        this.setInstanceState('activeTab', 'clock');
        this.setInstanceState('alarms', this.loadAlarms());

        // Stopwatch state
        this.setInstanceState('stopwatchTime', 0);
        this.setInstanceState('stopwatchRunning', false);
        this.setInstanceState('stopwatchLaps', []);
        this.setInstanceState('stopwatchInterval', null);

        // Timer state
        this.setInstanceState('timerTime', 0);
        this.setInstanceState('timerInitial', 0);
        this.setInstanceState('timerRunning', false);
        this.setInstanceState('timerInterval', null);

        return `
            <div class="clock-app">
                <div class="clock-tabs">
                    <button class="clock-tab active" data-tab="clock">🕐 Clock</button>
                    <button class="clock-tab" data-tab="alarm">⏰ Alarm</button>
                    <button class="clock-tab" data-tab="stopwatch">⏱️ Stopwatch</button>
                    <button class="clock-tab" data-tab="timer">⏲️ Timer</button>
                </div>

                <!-- Clock Tab -->
                <div class="clock-panel active" id="panel-clock">
                    <div class="analog-clock" id="analogClock">
                        <div class="clock-face">
                            <div class="clock-marks"></div>
                            <div class="clock-hand hour-hand" id="hourHand"></div>
                            <div class="clock-hand minute-hand" id="minuteHand"></div>
                            <div class="clock-hand second-hand" id="secondHand"></div>
                            <div class="clock-center"></div>
                        </div>
                    </div>
                    <div class="digital-clock-display" id="digitalClock">12:00:00</div>
                    <div class="clock-date" id="clockDate">Monday, January 1, 2024</div>
                </div>

                <!-- Alarm Tab -->
                <div class="clock-panel" id="panel-alarm">
                    <div class="alarm-list" id="alarmList"></div>
                    <div class="alarm-add">
                        <div class="alarm-time-input">
                            <input type="number" id="alarmHour" min="1" max="12" value="12" class="alarm-num">
                            <span>:</span>
                            <input type="number" id="alarmMin" min="0" max="59" value="00" class="alarm-num">
                            <select id="alarmAmPm" class="alarm-select">
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                        <input type="text" id="alarmLabel" placeholder="Alarm label..." class="alarm-label-input" maxlength="30">
                        <button class="btn" id="addAlarmBtn">Add Alarm</button>
                    </div>
                </div>

                <!-- Stopwatch Tab -->
                <div class="clock-panel" id="panel-stopwatch">
                    <div class="stopwatch-display" id="stopwatchDisplay">00:00:00.00</div>
                    <div class="stopwatch-controls">
                        <button class="btn sw-btn" id="swStart">▶ Start</button>
                        <button class="btn sw-btn" id="swLap" disabled>📌 Lap</button>
                        <button class="btn sw-btn" id="swReset">⟲ Reset</button>
                    </div>
                    <div class="lap-list" id="lapList">
                        <div class="lap-placeholder">Lap times will appear here</div>
                    </div>
                </div>

                <!-- Timer Tab -->
                <div class="clock-panel" id="panel-timer">
                    <div class="timer-display" id="timerDisplay">00:00:00</div>
                    <div class="timer-progress-container">
                        <div class="timer-progress" id="timerProgress"></div>
                    </div>
                    <div class="timer-preset">
                        <button class="preset-btn" data-time="60">1 min</button>
                        <button class="preset-btn" data-time="300">5 min</button>
                        <button class="preset-btn" data-time="600">10 min</button>
                        <button class="preset-btn" data-time="900">15 min</button>
                        <button class="preset-btn" data-time="1800">30 min</button>
                    </div>
                    <div class="timer-input-row">
                        <input type="number" id="timerHours" min="0" max="99" value="0" class="timer-num">
                        <span>h</span>
                        <input type="number" id="timerMins" min="0" max="59" value="5" class="timer-num">
                        <span>m</span>
                        <input type="number" id="timerSecs" min="0" max="59" value="0" class="timer-num">
                        <span>s</span>
                    </div>
                    <div class="timer-controls">
                        <button class="btn timer-btn" id="timerStart">▶ Start</button>
                        <button class="btn timer-btn" id="timerReset">⟲ Reset</button>
                    </div>
                </div>
            </div>

            <!-- Alarm Sound Indicator -->
            <div class="alarm-alert" id="alarmAlert">
                <div class="alarm-alert-content">
                    <div class="alarm-alert-icon">⏰</div>
                    <div class="alarm-alert-text" id="alarmAlertText">ALARM!</div>
                    <button class="btn" id="dismissAlarm">Dismiss</button>
                </div>
            </div>
        `;
    }

    onMount() {
        // Tab switching
        this.addHandler(this.getElement('.clock-tabs'), 'click', (e) => {
            const tab = e.target.closest('.clock-tab');
            if (tab) {
                this.switchTab(tab.dataset.tab);
            }
        });

        // Alarm controls
        this.addHandler(this.getElement('#addAlarmBtn'), 'click', () => this.addAlarm());
        this.addHandler(this.getElement('#alarmList'), 'click', (e) => {
            const del = e.target.closest('.alarm-delete');
            const toggle = e.target.closest('.alarm-toggle');
            if (del) this.deleteAlarm(del.dataset.id);
            if (toggle) this.toggleAlarm(toggle.dataset.id);
        });
        this.addHandler(this.getElement('#dismissAlarm'), 'click', () => this.dismissAlarm());

        // Stopwatch controls
        this.addHandler(this.getElement('#swStart'), 'click', () => this.toggleStopwatch());
        this.addHandler(this.getElement('#swLap'), 'click', () => this.recordLap());
        this.addHandler(this.getElement('#swReset'), 'click', () => this.resetStopwatch());

        // Timer controls
        this.addHandler(this.getElement('#timerStart'), 'click', () => this.toggleTimer());
        this.addHandler(this.getElement('#timerReset'), 'click', () => this.resetTimer());
        this.addHandler(this.getElement('.timer-preset'), 'click', (e) => {
            const preset = e.target.closest('.preset-btn');
            if (preset) this.setTimerPreset(parseInt(preset.dataset.time));
        });

        // Start the main clock
        this.startMainClock();
        this.renderAlarms();

        // Check for alarms every second
        this.startAlarmChecker();
    }

    onClose() {
        // Clean up intervals
        const swInterval = this.getInstanceState('stopwatchInterval');
        const timerInterval = this.getInstanceState('timerInterval');
        const clockInterval = this.getInstanceState('clockInterval');
        const alarmChecker = this.getInstanceState('alarmChecker');

        if (swInterval) clearInterval(swInterval);
        if (timerInterval) clearInterval(timerInterval);
        if (clockInterval) clearInterval(clockInterval);
        if (alarmChecker) clearInterval(alarmChecker);
    }

    // --- Tab Management ---

    switchTab(tabName) {
        this.setInstanceState('activeTab', tabName);

        this.getElements('.clock-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tabName);
        });
        this.getElements('.clock-panel').forEach(p => {
            p.classList.toggle('active', p.id === `panel-${tabName}`);
        });
    }

    // --- Main Clock ---

    startMainClock() {
        const update = () => {
            const now = new Date();

            // Update digital clock
            const hours = now.getHours();
            const mins = String(now.getMinutes()).padStart(2, '0');
            const secs = String(now.getSeconds()).padStart(2, '0');
            const displayHours = hours % 12 || 12;
            const ampm = hours >= 12 ? 'PM' : 'AM';

            const digitalEl = this.getElement('#digitalClock');
            if (digitalEl) {
                digitalEl.textContent = `${displayHours}:${mins}:${secs} ${ampm}`;
            }

            // Update date
            const dateEl = this.getElement('#clockDate');
            if (dateEl) {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                dateEl.textContent = now.toLocaleDateString('en-US', options);
            }

            // Update analog clock
            const seconds = now.getSeconds();
            const minutes = now.getMinutes();
            const hoursAnalog = now.getHours();

            const secondDeg = (seconds / 60) * 360;
            const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
            const hourDeg = ((hoursAnalog % 12 + minutes / 60) / 12) * 360;

            const secondHand = this.getElement('#secondHand');
            const minuteHand = this.getElement('#minuteHand');
            const hourHand = this.getElement('#hourHand');

            if (secondHand) secondHand.style.transform = `rotate(${secondDeg}deg)`;
            if (minuteHand) minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
            if (hourHand) hourHand.style.transform = `rotate(${hourDeg}deg)`;
        };

        update();
        const interval = setInterval(update, 1000);
        this.setInstanceState('clockInterval', interval);
    }

    // --- Alarm System ---

    renderAlarms() {
        const alarms = this.getInstanceState('alarms');
        const listEl = this.getElement('#alarmList');

        if (alarms.length === 0) {
            listEl.innerHTML = '<div class="no-alarms">No alarms set</div>';
            return;
        }

        listEl.innerHTML = alarms.map(alarm => `
            <div class="alarm-item ${alarm.enabled ? 'enabled' : 'disabled'}">
                <div class="alarm-toggle" data-id="${alarm.id}">
                    <div class="toggle-switch ${alarm.enabled ? 'on' : ''}"></div>
                </div>
                <div class="alarm-details">
                    <div class="alarm-time">${alarm.hour}:${String(alarm.minute).padStart(2, '0')} ${alarm.ampm}</div>
                    <div class="alarm-name">${this.escapeHtml(alarm.label || 'Alarm')}</div>
                </div>
                <button class="alarm-delete" data-id="${alarm.id}">🗑️</button>
            </div>
        `).join('');
    }

    addAlarm() {
        const hour = parseInt(this.getElement('#alarmHour').value) || 12;
        const minute = parseInt(this.getElement('#alarmMin').value) || 0;
        const ampm = this.getElement('#alarmAmPm').value;
        const label = this.getElement('#alarmLabel').value.trim();

        const alarms = this.getInstanceState('alarms');
        alarms.push({
            id: Date.now().toString(36),
            hour: Math.min(12, Math.max(1, hour)),
            minute: Math.min(59, Math.max(0, minute)),
            ampm,
            label: label || 'Alarm',
            enabled: true
        });

        this.setInstanceState('alarms', alarms);
        this.saveAlarms(alarms);
        this.renderAlarms();

        // Reset inputs
        this.getElement('#alarmLabel').value = '';
        this.playSound('click');
    }

    deleteAlarm(id) {
        let alarms = this.getInstanceState('alarms');
        alarms = alarms.filter(a => a.id !== id);
        this.setInstanceState('alarms', alarms);
        this.saveAlarms(alarms);
        this.renderAlarms();
    }

    toggleAlarm(id) {
        const alarms = this.getInstanceState('alarms');
        const alarm = alarms.find(a => a.id === id);
        if (alarm) {
            alarm.enabled = !alarm.enabled;
            this.setInstanceState('alarms', alarms);
            this.saveAlarms(alarms);
            this.renderAlarms();
        }
    }

    startAlarmChecker() {
        const check = () => {
            const now = new Date();
            const currentHour = now.getHours() % 12 || 12;
            const currentMin = now.getMinutes();
            const currentAmPm = now.getHours() >= 12 ? 'PM' : 'AM';
            const currentSec = now.getSeconds();

            if (currentSec !== 0) return; // Only check at :00 seconds

            const alarms = this.getInstanceState('alarms');
            alarms.forEach(alarm => {
                if (alarm.enabled &&
                    alarm.hour === currentHour &&
                    alarm.minute === currentMin &&
                    alarm.ampm === currentAmPm) {
                    this.triggerAlarm(alarm);
                }
            });
        };

        const interval = setInterval(check, 1000);
        this.setInstanceState('alarmChecker', interval);
    }

    triggerAlarm(alarm) {
        const alertEl = this.getElement('#alarmAlert');
        const textEl = this.getElement('#alarmAlertText');

        textEl.textContent = alarm.label || 'ALARM!';
        alertEl.classList.add('active');

        // Emit alarm triggered event
        this.emitAppEvent('alarm:triggered', {
            alarmId: alarm.id,
            label: alarm.label,
            time: `${alarm.hour}:${String(alarm.minute).padStart(2, '0')} ${alarm.ampm}`
        });

        this.playSound('notify');

        // Also play repeated beeps
        let beepCount = 0;
        const beepInterval = setInterval(() => {
            if (beepCount >= 10 || !alertEl.classList.contains('active')) {
                clearInterval(beepInterval);
                return;
            }
            this.playSound('error');
            beepCount++;
        }, 1000);

        this.setInstanceState('beepInterval', beepInterval);
    }

    dismissAlarm() {
        this.getElement('#alarmAlert').classList.remove('active');
        const beepInterval = this.getInstanceState('beepInterval');
        if (beepInterval) clearInterval(beepInterval);

        // Emit alarm dismissed event
        this.emitAppEvent('alarm:dismissed', {});
    }

    loadAlarms() {
        try {
            const stored = localStorage.getItem('smos_clock_alarms');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    saveAlarms(alarms) {
        try {
            localStorage.setItem('smos_clock_alarms', JSON.stringify(alarms));
        } catch (e) {
            console.error('Failed to save alarms:', e);
        }
    }

    // --- Stopwatch ---

    toggleStopwatch() {
        const running = this.getInstanceState('stopwatchRunning');

        if (running) {
            // Stop
            const interval = this.getInstanceState('stopwatchInterval');
            if (interval) clearInterval(interval);
            this.setInstanceState('stopwatchRunning', false);
            this.getElement('#swStart').textContent = '▶ Start';
            this.getElement('#swLap').disabled = true;

            // Emit stopwatch stopped event
            this.emitAppEvent('stopwatch:stopped', {
                time: this.getInstanceState('stopwatchTime'),
                laps: this.getInstanceState('stopwatchLaps').length
            });
        } else {
            // Start
            const startTime = Date.now() - this.getInstanceState('stopwatchTime');
            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                this.setInstanceState('stopwatchTime', elapsed);
                this.updateStopwatchDisplay(elapsed);
            }, 10);

            this.setInstanceState('stopwatchInterval', interval);
            this.setInstanceState('stopwatchRunning', true);
            this.getElement('#swStart').textContent = '⏸ Stop';
            this.getElement('#swLap').disabled = false;

            // Emit stopwatch started event
            this.emitAppEvent('stopwatch:started', {});
        }
    }

    recordLap() {
        const time = this.getInstanceState('stopwatchTime');
        const laps = this.getInstanceState('stopwatchLaps');
        laps.push(time);
        this.setInstanceState('stopwatchLaps', laps);
        this.updateLapList();

        // Emit lap recorded event
        this.emitAppEvent('stopwatch:lap', {
            lapNumber: laps.length,
            time: time,
            formatted: this.formatStopwatchTime(time)
        });
    }

    resetStopwatch() {
        const interval = this.getInstanceState('stopwatchInterval');
        if (interval) clearInterval(interval);

        this.setInstanceState('stopwatchTime', 0);
        this.setInstanceState('stopwatchRunning', false);
        this.setInstanceState('stopwatchLaps', []);
        this.setInstanceState('stopwatchInterval', null);

        this.updateStopwatchDisplay(0);
        this.getElement('#swStart').textContent = '▶ Start';
        this.getElement('#swLap').disabled = true;
        this.getElement('#lapList').innerHTML = '<div class="lap-placeholder">Lap times will appear here</div>';
    }

    updateStopwatchDisplay(ms) {
        const display = this.getElement('#stopwatchDisplay');
        if (display) {
            display.textContent = this.formatStopwatchTime(ms);
        }
    }

    updateLapList() {
        const laps = this.getInstanceState('stopwatchLaps');
        const listEl = this.getElement('#lapList');

        if (laps.length === 0) {
            listEl.innerHTML = '<div class="lap-placeholder">Lap times will appear here</div>';
            return;
        }

        listEl.innerHTML = laps.map((lap, i) => {
            const diff = i > 0 ? lap - laps[i - 1] : lap;
            return `
                <div class="lap-item">
                    <span class="lap-number">Lap ${i + 1}</span>
                    <span class="lap-diff">+${this.formatStopwatchTime(diff)}</span>
                    <span class="lap-total">${this.formatStopwatchTime(lap)}</span>
                </div>
            `;
        }).reverse().join('');
    }

    formatStopwatchTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((ms % 1000) / 10);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
    }

    // --- Timer ---

    toggleTimer() {
        const running = this.getInstanceState('timerRunning');

        if (running) {
            // Pause
            const interval = this.getInstanceState('timerInterval');
            if (interval) clearInterval(interval);
            this.setInstanceState('timerRunning', false);
            this.getElement('#timerStart').textContent = '▶ Resume';
        } else {
            // Start
            let remaining = this.getInstanceState('timerTime');
            if (remaining <= 0) {
                // Get time from inputs
                const hours = parseInt(this.getElement('#timerHours').value) || 0;
                const mins = parseInt(this.getElement('#timerMins').value) || 0;
                const secs = parseInt(this.getElement('#timerSecs').value) || 0;
                remaining = (hours * 3600 + mins * 60 + secs) * 1000;

                if (remaining <= 0) return;

                this.setInstanceState('timerTime', remaining);
                this.setInstanceState('timerInitial', remaining);
            }

            const startTime = Date.now();
            const initialRemaining = remaining;

            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const newRemaining = Math.max(0, initialRemaining - elapsed);
                this.setInstanceState('timerTime', newRemaining);
                this.updateTimerDisplay(newRemaining);

                if (newRemaining <= 0) {
                    this.timerComplete();
                }
            }, 100);

            this.setInstanceState('timerInterval', interval);
            this.setInstanceState('timerRunning', true);
            this.getElement('#timerStart').textContent = '⏸ Pause';
        }
    }

    resetTimer() {
        const interval = this.getInstanceState('timerInterval');
        if (interval) clearInterval(interval);

        this.setInstanceState('timerTime', 0);
        this.setInstanceState('timerInitial', 0);
        this.setInstanceState('timerRunning', false);
        this.setInstanceState('timerInterval', null);

        this.updateTimerDisplay(0);
        this.getElement('#timerStart').textContent = '▶ Start';
        this.getElement('#timerProgress').style.width = '0%';
    }

    setTimerPreset(seconds) {
        this.resetTimer();
        const ms = seconds * 1000;
        this.setInstanceState('timerTime', ms);
        this.setInstanceState('timerInitial', ms);
        this.updateTimerDisplay(ms);

        // Update inputs
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        this.getElement('#timerHours').value = hours;
        this.getElement('#timerMins').value = mins;
        this.getElement('#timerSecs').value = secs;
    }

    updateTimerDisplay(ms) {
        const display = this.getElement('#timerDisplay');
        const progress = this.getElement('#timerProgress');
        const initial = this.getInstanceState('timerInitial');

        if (display) {
            const totalSeconds = Math.ceil(ms / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        if (progress && initial > 0) {
            const percent = ((initial - ms) / initial) * 100;
            progress.style.width = `${percent}%`;
        }
    }

    timerComplete() {
        const interval = this.getInstanceState('timerInterval');
        if (interval) clearInterval(interval);

        this.setInstanceState('timerRunning', false);
        this.getElement('#timerStart').textContent = '▶ Start';

        // Emit timer complete event
        this.emitAppEvent('timer:complete', {
            initialTime: this.getInstanceState('timerInitial')
        });

        // Play alarm sound
        this.playSound('notify');

        // Flash the display
        const display = this.getElement('#timerDisplay');
        let flashes = 0;
        const flashInterval = setInterval(() => {
            display.style.color = flashes % 2 === 0 ? '#ff0000' : '#00ff00';
            flashes++;
            if (flashes >= 10) {
                clearInterval(flashInterval);
                display.style.color = '';
            }
            this.playSound('click');
        }, 300);
    }

    // --- Utilities ---

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default Clock;
