/**
 * Phone - 90s Cordless Phone / Landline Simulator
 * Dial numbers, browse your phonebook, check voicemail, and experience
 * the joy of call waiting on a chunky 90s handset!
 *
 * SCRIPTING SUPPORT:
 *   Commands: dial, hangup, hold, answer, addContact, removeContact,
 *             sendVoicemail, simulateIncoming, setText
 *   Queries:  getStatus, getCurrentCall, getContacts, getCallHistory, getVoicemails
 *   Events:   app:phone:dialed, app:phone:connected, app:phone:ended,
 *             app:phone:incoming, app:phone:voicemail, app:phone:contactAdded
 */

import AppBase from './AppBase.js';

class Phone extends AppBase {
    constructor() {
        super({
            id: 'phone',
            name: 'Phone',
            icon: '📞',
            width: 380,
            height: 520,
            resizable: true,
            singleton: true,
            category: 'internet'
        });

        // Call state: idle, dialing, ringing, incoming, connected, hold, ended
        this.callState = 'idle';
        this.currentCall = null;
        this.callTimer = null;
        this.callDuration = 0;
        this.dialBuffer = '';
        this.callHistory = [];
        this.voicemails = [];
        this.currentView = 'dialer'; // dialer, contacts, history, voicemail, call

        // Pre-populated 90s phonebook contacts
        this.contacts = [
            { name: 'Mom', number: '555-0100', status: 'available' },
            { name: 'Dad (Work)', number: '555-0101', status: 'available' },
            { name: 'Pizza Hut', number: '555-7482', status: 'available' },
            { name: 'Blockbuster Video', number: '555-3284', status: 'available' },
            { name: 'BBS Sysop - Dave', number: '555-1337', status: 'busy' },
            { name: 'Jenny', number: '867-5309', status: 'available' },
            { name: 'Moviefone', number: '555-FILM', status: 'available' },
            { name: 'Radio Station KISS FM', number: '555-KISS', status: 'available' },
            { name: 'Grandma', number: '555-0199', status: 'available' },
            { name: 'School Friend - Mike', number: '555-0234', status: 'away' },
            { name: 'Dominos', number: '555-3030', status: 'available' },
            { name: 'Time & Weather', number: '555-1212', status: 'available' },
        ];

        // Bot responses per contact for simulated conversations
        this.botResponses = {
            'Mom': [
                "Hello? Oh hi sweetie!",
                "Are you doing your homework?",
                "Dinner's at 6, don't be late!",
                "Get off the computer and come eat!",
                "Is that you? I can barely hear you!",
                "Tell your father dinner is ready.",
                "Don't forget to take out the trash!"
            ],
            'Dad (Work)': [
                "Hi, I'm in a meeting... can I call you back?",
                "Hey champ, what's up?",
                "Ask your mother.",
                "I'll be home around 7.",
                "Did you break something again?"
            ],
            'Pizza Hut': [
                "Thank you for calling Pizza Hut! Can I take your order?",
                "Would you like our new Stuffed Crust pizza?",
                "That'll be about 30 minutes for delivery.",
                "Would you like breadsticks with that?",
                "Your total comes to $12.99."
            ],
            'Blockbuster Video': [
                "Thank you for calling Blockbuster Video!",
                "Yes, we have that movie in stock.",
                "That tape is due back by Thursday.",
                "Your account shows a late fee of $3.50.",
                "Be kind, please rewind!"
            ],
            'BBS Sysop - Dave': [
                "Yo, the BBS is down for maintenance.",
                "New warez uploaded last night, check it out!",
                "Dude, you've been hogging the line for 3 hours!",
                "The new DOOM WAD is up on the board.",
                "Call back on the second line, this one's for data."
            ],
            'Jenny': [
                "Hello?",
                "Who is this?",
                "How did you get this number?!",
                "Stop calling me!",
                "*click*"
            ],
            'Moviefone': [
                "Hello, and welcome to Moviefone!",
                "If you know the name of the movie you'd like to see, press 1.",
                "Coming to a theater near you: Titanic, still playing!",
                "The Matrix is showing at 7:00, 9:30, and midnight.",
                "Thank you for using Moviefone. Goodbye!"
            ],
            'Grandma': [
                "Hello? HELLO? Who is this?",
                "Speak up dear, I can't hear you!",
                "Oh it's you! When are you coming to visit?",
                "I made cookies, come pick some up!",
                "Your grandfather says hello!"
            ],
            'Time & Weather': [
                "At the tone, the time will be... 3:45 PM.",
                "Current temperature: 72 degrees Fahrenheit.",
                "Forecast: Partly cloudy with a chance of rain.",
                "This has been your local time and weather service.",
                "BEEP."
            ],
            '_default': [
                "Hello?",
                "Yeah?",
                "Who's calling?",
                "Uh huh...",
                "Sure thing.",
                "Can I call you back?",
                "Sorry, wrong number."
            ]
        };

        // Pre-loaded voicemails
        this.voicemails = [
            { from: 'Mom', number: '555-0100', message: 'Honey, call me back when you get this. Dinner plans changed!', time: '2:30 PM', heard: false },
            { from: 'Blockbuster', number: '555-3284', message: 'This is Blockbuster Video reminding you that your rental of "The Matrix" is due tomorrow.', time: '11:15 AM', heard: false },
            { from: 'Unknown', number: '555-0000', message: '*heavy breathing* ...seven days...', time: '3:00 AM', heard: false }
        ];
    }

    onOpen() {
        return `
            <style>
                .phone-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #2a2a3a;
                    font-family: 'Arial', sans-serif;
                    color: #ddd;
                }
                .phone-top-bar {
                    display: flex;
                    background: #1a1a2e;
                    border-bottom: 2px solid #444;
                }
                .phone-tab {
                    flex: 1;
                    padding: 6px 4px;
                    text-align: center;
                    font-size: 10px;
                    cursor: pointer;
                    background: #2a2a3a;
                    color: #888;
                    border-right: 1px solid #444;
                    border-bottom: 2px solid transparent;
                }
                .phone-tab:last-child { border-right: none; }
                .phone-tab.active {
                    background: #1a1a2e;
                    color: #0f0;
                    border-bottom: 2px solid #0f0;
                }
                .phone-tab:hover { color: #ccc; }
                .phone-lcd {
                    background: #1a2a1a;
                    color: #33ff33;
                    font-family: 'VT323', 'Courier New', monospace;
                    padding: 10px 15px;
                    margin: 10px;
                    border: 2px inset #111;
                    border-radius: 3px;
                    min-height: 50px;
                    text-align: center;
                    text-shadow: 0 0 5px #33ff33;
                }
                .phone-lcd-number {
                    font-size: 24px;
                    letter-spacing: 3px;
                    min-height: 30px;
                    line-height: 30px;
                }
                .phone-lcd-status {
                    font-size: 11px;
                    color: #22aa22;
                    margin-top: 4px;
                }
                .phone-lcd-caller {
                    font-size: 14px;
                    color: #55ff55;
                    margin-top: 2px;
                }
                .phone-dialpad {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6px;
                    padding: 10px 30px;
                }
                .phone-key {
                    background: #c0c0c0;
                    border: 2px outset #fff;
                    border-radius: 4px;
                    padding: 10px;
                    text-align: center;
                    cursor: pointer;
                    font-size: 18px;
                    font-weight: bold;
                    color: #000;
                    user-select: none;
                }
                .phone-key:active {
                    border-style: inset;
                    background: #a0a0a0;
                }
                .phone-key-sub {
                    display: block;
                    font-size: 8px;
                    font-weight: normal;
                    color: #555;
                    letter-spacing: 2px;
                }
                .phone-actions {
                    display: flex;
                    gap: 8px;
                    padding: 8px 30px;
                    justify-content: center;
                }
                .phone-action-btn {
                    padding: 8px 16px;
                    border: 2px outset #fff;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                    border-radius: 4px;
                    min-width: 70px;
                    text-align: center;
                }
                .phone-action-btn:active { border-style: inset; }
                .phone-call-btn { background: #4caf50; color: #fff; }
                .phone-hangup-btn { background: #f44336; color: #fff; }
                .phone-hold-btn { background: #ff9800; color: #fff; }
                .phone-clear-btn { background: #c0c0c0; color: #000; }
                /* Contacts / List Views */
                .phone-list-view {
                    flex: 1;
                    overflow-y: auto;
                    padding: 5px 10px;
                }
                .phone-list-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 10px;
                    border-bottom: 1px solid #444;
                    cursor: pointer;
                    font-size: 12px;
                    gap: 10px;
                }
                .phone-list-item:hover { background: #333350; }
                .phone-list-icon { font-size: 16px; width: 24px; text-align: center; }
                .phone-list-info { flex: 1; }
                .phone-list-name { font-weight: bold; color: #eee; }
                .phone-list-number { font-size: 10px; color: #888; }
                .phone-list-meta { font-size: 10px; color: #888; text-align: right; }
                .phone-list-empty {
                    text-align: center;
                    color: #666;
                    padding: 40px 20px;
                    font-style: italic;
                }
                /* Call screen */
                .phone-call-screen {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .phone-call-name {
                    font-size: 22px;
                    font-weight: bold;
                    color: #fff;
                }
                .phone-call-number {
                    font-size: 14px;
                    color: #aaa;
                }
                .phone-call-status {
                    font-size: 13px;
                    color: #33ff33;
                    margin-top: 10px;
                }
                .phone-call-timer {
                    font-size: 28px;
                    font-family: 'VT323', 'Courier New', monospace;
                    color: #33ff33;
                    text-shadow: 0 0 5px #33ff33;
                    margin: 10px 0;
                }
                .phone-call-conversation {
                    width: 90%;
                    max-height: 120px;
                    overflow-y: auto;
                    background: #1a1a2e;
                    border: 1px solid #444;
                    padding: 8px;
                    font-size: 11px;
                    border-radius: 3px;
                    margin-top: 5px;
                }
                .phone-call-msg {
                    margin-bottom: 4px;
                    color: #ccc;
                }
                .phone-call-msg.them { color: #33ff33; }
                .phone-call-msg.you { color: #66aaff; }
                /* Voicemail badge */
                .phone-vm-badge {
                    background: #f44336;
                    color: #fff;
                    border-radius: 50%;
                    font-size: 9px;
                    width: 14px;
                    height: 14px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 3px;
                }
                .phone-vm-unheard { color: #fff; font-weight: bold; }
                .phone-vm-heard { color: #888; }
            </style>
            <div class="phone-container">
                <div class="phone-top-bar">
                    <div class="phone-tab active" data-tab="dialer">📞 Dial</div>
                    <div class="phone-tab" data-tab="contacts">📒 Contacts</div>
                    <div class="phone-tab" data-tab="history">📋 History</div>
                    <div class="phone-tab" data-tab="voicemail">📼 VM <span id="vmBadge" class="phone-vm-badge" style="display:none;">0</span></div>
                </div>

                <!-- DIALER VIEW -->
                <div id="view-dialer" class="phone-view">
                    <div class="phone-lcd">
                        <div class="phone-lcd-number" id="lcdNumber">&nbsp;</div>
                        <div class="phone-lcd-caller" id="lcdCaller">&nbsp;</div>
                        <div class="phone-lcd-status" id="lcdStatus">Ready</div>
                    </div>
                    <div class="phone-dialpad">
                        <div class="phone-key" data-digit="1">1<span class="phone-key-sub">&nbsp;</span></div>
                        <div class="phone-key" data-digit="2">2<span class="phone-key-sub">ABC</span></div>
                        <div class="phone-key" data-digit="3">3<span class="phone-key-sub">DEF</span></div>
                        <div class="phone-key" data-digit="4">4<span class="phone-key-sub">GHI</span></div>
                        <div class="phone-key" data-digit="5">5<span class="phone-key-sub">JKL</span></div>
                        <div class="phone-key" data-digit="6">6<span class="phone-key-sub">MNO</span></div>
                        <div class="phone-key" data-digit="7">7<span class="phone-key-sub">PQRS</span></div>
                        <div class="phone-key" data-digit="8">8<span class="phone-key-sub">TUV</span></div>
                        <div class="phone-key" data-digit="9">9<span class="phone-key-sub">WXYZ</span></div>
                        <div class="phone-key" data-digit="*">*<span class="phone-key-sub">&nbsp;</span></div>
                        <div class="phone-key" data-digit="0">0<span class="phone-key-sub">+</span></div>
                        <div class="phone-key" data-digit="#">#<span class="phone-key-sub">&nbsp;</span></div>
                    </div>
                    <div class="phone-actions">
                        <div class="phone-action-btn phone-call-btn" id="btnCall">📞 Call</div>
                        <div class="phone-action-btn phone-clear-btn" id="btnClear">⌫ Clear</div>
                        <div class="phone-action-btn phone-hangup-btn" id="btnHangup" style="display:none;">🔴 End</div>
                        <div class="phone-action-btn phone-hold-btn" id="btnHold" style="display:none;">⏸ Hold</div>
                    </div>
                </div>

                <!-- CONTACTS VIEW -->
                <div id="view-contacts" class="phone-view" style="display:none; flex:1; flex-direction:column;">
                    <div class="phone-list-view" id="contactsList"></div>
                </div>

                <!-- HISTORY VIEW -->
                <div id="view-history" class="phone-view" style="display:none; flex:1; flex-direction:column;">
                    <div class="phone-list-view" id="historyList"></div>
                </div>

                <!-- VOICEMAIL VIEW -->
                <div id="view-voicemail" class="phone-view" style="display:none; flex:1; flex-direction:column;">
                    <div class="phone-list-view" id="voicemailList"></div>
                </div>

                <!-- ACTIVE CALL SCREEN (overlays other views) -->
                <div id="view-call" class="phone-view" style="display:none; flex:1; flex-direction:column;">
                    <div class="phone-call-screen">
                        <div class="phone-call-name" id="callName">Unknown</div>
                        <div class="phone-call-number" id="callNumber"></div>
                        <div class="phone-call-status" id="callStatus">Dialing...</div>
                        <div class="phone-call-timer" id="callTimerDisplay">00:00</div>
                        <div class="phone-call-conversation" id="callConversation"></div>
                        <div class="phone-actions" style="margin-top:10px;">
                            <div class="phone-action-btn phone-hold-btn" id="btnCallHold">⏸ Hold</div>
                            <div class="phone-action-btn phone-hangup-btn" id="btnCallEnd">🔴 End Call</div>
                        </div>
                    </div>
                </div>

                <!-- INCOMING CALL OVERLAY -->
                <div id="incomingOverlay" style="display:none; position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:10; display:none; flex-direction:column; align-items:center; justify-content:center; gap:15px;">
                    <div style="font-size:40px;">📞</div>
                    <div style="color:#33ff33; font-size:18px; font-weight:bold;" id="incomingName">Incoming Call</div>
                    <div style="color:#aaa; font-size:14px;" id="incomingNumber">555-0000</div>
                    <div style="color:#ffff00; font-size:14px; animation: blink 1s step-end infinite;">RING RING!</div>
                    <div style="display:flex; gap:20px; margin-top:10px;">
                        <div class="phone-action-btn phone-call-btn" id="btnAnswer" style="padding:12px 24px;">✅ Answer</div>
                        <div class="phone-action-btn phone-hangup-btn" id="btnDecline" style="padding:12px 24px;">❌ Decline</div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes blink { 50% { opacity: 0; } }
            </style>
        `;
    }

    onMount() {
        // Tab navigation
        this.getElements('.phone-tab').forEach(tab => {
            this.addHandler(tab, 'click', () => {
                if (this.callState === 'connected' || this.callState === 'hold') return;
                this.switchView(tab.dataset.tab);
            });
        });

        // Dialpad keys
        this.getElements('.phone-key').forEach(key => {
            this.addHandler(key, 'click', () => {
                this.pressKey(key.dataset.digit);
            });
        });

        // Action buttons
        this.addHandler(this.getElement('#btnCall'), 'click', () => this.dialNumber());
        this.addHandler(this.getElement('#btnClear'), 'click', () => this.clearDial());
        this.addHandler(this.getElement('#btnHangup'), 'click', () => this.hangUp());
        this.addHandler(this.getElement('#btnHold'), 'click', () => this.toggleHold());
        this.addHandler(this.getElement('#btnCallEnd'), 'click', () => this.hangUp());
        this.addHandler(this.getElement('#btnCallHold'), 'click', () => this.toggleHold());
        this.addHandler(this.getElement('#btnAnswer'), 'click', () => this.answerCall());
        this.addHandler(this.getElement('#btnDecline'), 'click', () => this.declineCall());

        // Render initial views
        this.renderContacts();
        this.renderHistory();
        this.renderVoicemails();
        this.updateVmBadge();

        // Register scripting commands
        this._registerScriptingCommands();
    }

    onClose() {
        if (this.callTimer) clearInterval(this.callTimer);
        if (this._ringInterval) clearInterval(this._ringInterval);
        if (this._botResponseTimeout) clearTimeout(this._botResponseTimeout);
    }

    // ===== VIEW MANAGEMENT =====

    switchView(viewName) {
        this.currentView = viewName;
        ['dialer', 'contacts', 'history', 'voicemail', 'call'].forEach(v => {
            const el = this.getElement(`#view-${v}`);
            if (el) el.style.display = v === viewName ? 'flex' : 'none';
        });
        this.getElements('.phone-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === viewName);
        });

        if (viewName === 'contacts') this.renderContacts();
        if (viewName === 'history') this.renderHistory();
        if (viewName === 'voicemail') this.renderVoicemails();
    }

    // ===== DIALER =====

    pressKey(digit) {
        if (this.callState !== 'idle') return;
        this.dialBuffer += digit;
        this.playSound('click');
        this.updateLCD();
    }

    clearDial() {
        if (this.dialBuffer.length > 0) {
            this.dialBuffer = this.dialBuffer.slice(0, -1);
        }
        this.updateLCD();
    }

    updateLCD() {
        const lcdNum = this.getElement('#lcdNumber');
        const lcdCaller = this.getElement('#lcdCaller');
        if (lcdNum) lcdNum.textContent = this.dialBuffer || '\u00A0';

        // Look up contact
        if (lcdCaller) {
            const contact = this.findContactByNumber(this.dialBuffer);
            lcdCaller.textContent = contact ? contact.name : '\u00A0';
        }
    }

    setLCDStatus(text) {
        const el = this.getElement('#lcdStatus');
        if (el) el.textContent = text;
    }

    findContactByNumber(number) {
        return this.contacts.find(c => c.number.replace(/\D/g, '') === number.replace(/\D/g, ''));
    }

    // ===== CALL MANAGEMENT =====

    dialNumber(numberOverride) {
        const number = numberOverride || this.dialBuffer;
        if (!number || this.callState !== 'idle') return;

        const contact = this.findContactByNumber(number);
        const name = contact ? contact.name : 'Unknown';

        this.callState = 'dialing';
        this.currentCall = { number, name, direction: 'outgoing', startTime: null, messages: [] };
        this.callDuration = 0;
        this.dialBuffer = '';

        this.emitAppEvent('dialed', { number, name });

        // Show call screen
        this.showCallScreen(name, number, 'Dialing...');
        this.playSound('click');

        // Simulate ringing then connect
        setTimeout(() => {
            if (this.callState !== 'dialing') return;
            this.callState = 'ringing';
            this.updateCallStatus('Ringing...');

            setTimeout(() => {
                if (this.callState !== 'ringing') return;
                // 90% chance of answering
                if (Math.random() < 0.9) {
                    this.connectCall();
                } else {
                    this.addCallMessage('them', '(No answer)');
                    this.endCall('No Answer');
                }
            }, 2000 + Math.random() * 2000);
        }, 1500);
    }

    connectCall() {
        this.callState = 'connected';
        this.currentCall.startTime = Date.now();
        this.updateCallStatus('Connected');

        this.emitAppEvent('connected', {
            number: this.currentCall.number,
            name: this.currentCall.name
        });

        // Start call timer
        this.callTimer = setInterval(() => {
            this.callDuration++;
            this.updateCallTimerDisplay();
        }, 1000);

        // Bot sends first message
        this.scheduleBotResponse(800);
    }

    hangUp() {
        if (this.callState === 'idle') return;
        this.endCall('Call Ended');
    }

    endCall(reason) {
        const wasConnected = this.callState === 'connected' || this.callState === 'hold';
        if (this.callTimer) {
            clearInterval(this.callTimer);
            this.callTimer = null;
        }
        if (this._botResponseTimeout) {
            clearTimeout(this._botResponseTimeout);
            this._botResponseTimeout = null;
        }

        // Add to history
        if (this.currentCall) {
            this.callHistory.unshift({
                name: this.currentCall.name,
                number: this.currentCall.number,
                direction: this.currentCall.direction,
                duration: this.callDuration,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date().toLocaleDateString()
            });
            // Keep history at 50 max
            if (this.callHistory.length > 50) this.callHistory.pop();
        }

        this.emitAppEvent('ended', {
            number: this.currentCall?.number,
            name: this.currentCall?.name,
            duration: this.callDuration,
            reason
        });

        this.updateCallStatus(reason || 'Call Ended');
        this.callState = 'idle';

        // Return to dialer after a moment
        setTimeout(() => {
            this.currentCall = null;
            this.callDuration = 0;
            this.switchView('dialer');
            this.setLCDStatus('Ready');
            this.updateLCD();
            // Show normal buttons
            const btnCall = this.getElement('#btnCall');
            const btnClear = this.getElement('#btnClear');
            const btnHangup = this.getElement('#btnHangup');
            const btnHold = this.getElement('#btnHold');
            if (btnCall) btnCall.style.display = '';
            if (btnClear) btnClear.style.display = '';
            if (btnHangup) btnHangup.style.display = 'none';
            if (btnHold) btnHold.style.display = 'none';
        }, 2000);
    }

    toggleHold() {
        if (this.callState === 'connected') {
            this.callState = 'hold';
            this.updateCallStatus('ON HOLD');
            if (this.callTimer) clearInterval(this.callTimer);
        } else if (this.callState === 'hold') {
            this.callState = 'connected';
            this.updateCallStatus('Connected');
            this.callTimer = setInterval(() => {
                this.callDuration++;
                this.updateCallTimerDisplay();
            }, 1000);
        }
    }

    simulateIncoming(fromName, fromNumber) {
        if (this.callState !== 'idle') return;

        const name = fromName || 'Unknown Caller';
        const number = fromNumber || '555-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');

        this.callState = 'incoming';
        this.currentCall = { number, name, direction: 'incoming', startTime: null, messages: [] };

        // Show incoming overlay
        const overlay = this.getElement('#incomingOverlay');
        const inName = this.getElement('#incomingName');
        const inNum = this.getElement('#incomingNumber');
        if (overlay) overlay.style.display = 'flex';
        if (inName) inName.textContent = name;
        if (inNum) inNum.textContent = number;

        this.emitAppEvent('incoming', { number, name });
        this.playSound('notify');
    }

    answerCall() {
        if (this.callState !== 'incoming') return;

        // Hide incoming overlay
        const overlay = this.getElement('#incomingOverlay');
        if (overlay) overlay.style.display = 'none';

        this.showCallScreen(this.currentCall.name, this.currentCall.number, 'Connecting...');

        setTimeout(() => {
            this.connectCall();
        }, 500);
    }

    declineCall() {
        if (this.callState !== 'incoming') return;

        const overlay = this.getElement('#incomingOverlay');
        if (overlay) overlay.style.display = 'none';

        // Declined calls might leave voicemail
        if (Math.random() < 0.5 && this.currentCall) {
            const responses = this.botResponses[this.currentCall.name] || this.botResponses['_default'];
            this.voicemails.unshift({
                from: this.currentCall.name,
                number: this.currentCall.number,
                message: responses[Math.floor(Math.random() * responses.length)],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                heard: false
            });
            this.updateVmBadge();
            this.emitAppEvent('voicemail', {
                from: this.currentCall.name,
                number: this.currentCall.number
            });
        }

        this.callState = 'idle';
        this.currentCall = null;
    }

    // ===== CALL SCREEN =====

    showCallScreen(name, number, status) {
        this.switchView('call');
        const callName = this.getElement('#callName');
        const callNumber = this.getElement('#callNumber');
        const callStatus = this.getElement('#callStatus');
        const callConvo = this.getElement('#callConversation');
        const callTimer = this.getElement('#callTimerDisplay');

        if (callName) callName.textContent = name;
        if (callNumber) callNumber.textContent = number;
        if (callStatus) callStatus.textContent = status;
        if (callConvo) callConvo.innerHTML = '';
        if (callTimer) callTimer.textContent = '00:00';
    }

    updateCallStatus(text) {
        const el = this.getElement('#callStatus');
        if (el) el.textContent = text;
    }

    updateCallTimerDisplay() {
        const el = this.getElement('#callTimerDisplay');
        if (el) {
            const min = String(Math.floor(this.callDuration / 60)).padStart(2, '0');
            const sec = String(this.callDuration % 60).padStart(2, '0');
            el.textContent = `${min}:${sec}`;
        }
    }

    addCallMessage(who, text) {
        if (this.currentCall) {
            this.currentCall.messages.push({ who, text });
        }
        const convo = this.getElement('#callConversation');
        if (convo) {
            const div = document.createElement('div');
            div.className = `phone-call-msg ${who}`;
            div.textContent = (who === 'them' ? '📞 ' : '🗣 ') + text;
            convo.appendChild(div);
            convo.scrollTop = convo.scrollHeight;
        }
    }

    scheduleBotResponse(delay) {
        if (this._botResponseTimeout) clearTimeout(this._botResponseTimeout);
        this._botResponseTimeout = setTimeout(() => {
            if (this.callState !== 'connected') return;
            const name = this.currentCall?.name;
            const responses = this.botResponses[name] || this.botResponses['_default'];
            const msg = responses[Math.floor(Math.random() * responses.length)];
            this.addCallMessage('them', msg);

            // Maybe schedule another response
            if (Math.random() < 0.4) {
                this.scheduleBotResponse(3000 + Math.random() * 5000);
            }
        }, delay || (2000 + Math.random() * 4000));
    }

    // ===== CONTACTS VIEW =====

    renderContacts() {
        const list = this.getElement('#contactsList');
        if (!list) return;

        if (this.contacts.length === 0) {
            list.innerHTML = '<div class="phone-list-empty">No contacts. Add some!</div>';
            return;
        }

        list.innerHTML = this.contacts.map((c, i) => `
            <div class="phone-list-item" data-contact-idx="${i}">
                <div class="phone-list-icon">👤</div>
                <div class="phone-list-info">
                    <div class="phone-list-name">${this.escapeHtml(c.name)}</div>
                    <div class="phone-list-number">${c.number}</div>
                </div>
                <div class="phone-list-meta">${c.status === 'busy' ? '🔴' : c.status === 'away' ? '🟡' : '🟢'}</div>
            </div>
        `).join('');

        // Attach click to call
        this.getElements('.phone-list-item[data-contact-idx]').forEach(item => {
            this.addHandler(item, 'click', () => {
                const idx = parseInt(item.dataset.contactIdx);
                const contact = this.contacts[idx];
                if (contact) {
                    this.dialBuffer = contact.number;
                    this.switchView('dialer');
                    this.updateLCD();
                    this.dialNumber();
                }
            });
        });
    }

    // ===== HISTORY VIEW =====

    renderHistory() {
        const list = this.getElement('#historyList');
        if (!list) return;

        if (this.callHistory.length === 0) {
            list.innerHTML = '<div class="phone-list-empty">No call history yet.</div>';
            return;
        }

        list.innerHTML = this.callHistory.map((h, i) => `
            <div class="phone-list-item" data-history-idx="${i}">
                <div class="phone-list-icon">${h.direction === 'outgoing' ? '📤' : h.direction === 'missed' ? '📵' : '📥'}</div>
                <div class="phone-list-info">
                    <div class="phone-list-name">${this.escapeHtml(h.name)}</div>
                    <div class="phone-list-number">${h.number}</div>
                </div>
                <div class="phone-list-meta">
                    ${h.time}<br>
                    ${this.formatDuration(h.duration)}
                </div>
            </div>
        `).join('');

        // Click to redial
        this.getElements('.phone-list-item[data-history-idx]').forEach(item => {
            this.addHandler(item, 'click', () => {
                const idx = parseInt(item.dataset.historyIdx);
                const entry = this.callHistory[idx];
                if (entry) {
                    this.dialBuffer = entry.number;
                    this.switchView('dialer');
                    this.updateLCD();
                    this.dialNumber();
                }
            });
        });
    }

    // ===== VOICEMAIL VIEW =====

    renderVoicemails() {
        const list = this.getElement('#voicemailList');
        if (!list) return;

        if (this.voicemails.length === 0) {
            list.innerHTML = '<div class="phone-list-empty">No voicemails.</div>';
            return;
        }

        list.innerHTML = this.voicemails.map((vm, i) => `
            <div class="phone-list-item" data-vm-idx="${i}" style="${vm.heard ? 'opacity:0.6;' : ''}">
                <div class="phone-list-icon">${vm.heard ? '📭' : '📬'}</div>
                <div class="phone-list-info">
                    <div class="phone-list-name ${vm.heard ? 'phone-vm-heard' : 'phone-vm-unheard'}">${this.escapeHtml(vm.from)}</div>
                    <div class="phone-list-number">${this.escapeHtml(vm.message.substring(0, 50))}${vm.message.length > 50 ? '...' : ''}</div>
                </div>
                <div class="phone-list-meta">${vm.time}</div>
            </div>
        `).join('');

        // Click to listen (mark as heard and show full message)
        this.getElements('.phone-list-item[data-vm-idx]').forEach(item => {
            this.addHandler(item, 'click', () => {
                const idx = parseInt(item.dataset.vmIdx);
                const vm = this.voicemails[idx];
                if (vm) {
                    vm.heard = true;
                    this.updateVmBadge();
                    this.alert(`📼 Voicemail from ${vm.from} (${vm.number}):\n\n"${vm.message}"`);
                    this.renderVoicemails();
                }
            });
        });
    }

    updateVmBadge() {
        const badge = this.getElement('#vmBadge');
        const unheard = this.voicemails.filter(vm => !vm.heard).length;
        if (badge) {
            badge.style.display = unheard > 0 ? 'inline-flex' : 'none';
            badge.textContent = unheard;
        }
    }

    // ===== UTILITIES =====

    formatDuration(seconds) {
        if (!seconds) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== SCRIPTING SUPPORT =====

    _registerScriptingCommands() {
        // COMMAND: Dial a phone number
        this.registerCommand('dial', (payload) => {
            const number = payload.number || payload.value;
            if (!number) return { success: false, error: 'Number required' };
            if (this.callState !== 'idle') return { success: false, error: 'Phone is busy' };
            this.dialNumber(String(number));
            return { success: true, number, state: this.callState };
        });

        // COMMAND: Hang up current call
        this.registerCommand('hangup', () => {
            if (this.callState === 'idle') return { success: false, error: 'No active call' };
            this.hangUp();
            return { success: true };
        });

        // COMMAND: Toggle hold
        this.registerCommand('hold', () => {
            if (this.callState !== 'connected' && this.callState !== 'hold') {
                return { success: false, error: 'No active call to hold' };
            }
            this.toggleHold();
            return { success: true, state: this.callState };
        });

        // COMMAND: Answer incoming call
        this.registerCommand('answer', () => {
            if (this.callState !== 'incoming') return { success: false, error: 'No incoming call' };
            this.answerCall();
            return { success: true };
        });

        // COMMAND: Add a contact
        this.registerCommand('addContact', (payload) => {
            const name = payload.name;
            const number = payload.number;
            if (!name || !number) return { success: false, error: 'Name and number required' };
            if (this.contacts.find(c => c.number === number)) {
                return { success: false, error: 'Number already exists' };
            }
            const contact = { name, number: String(number), status: payload.status || 'available' };
            this.contacts.push(contact);
            this.renderContacts();
            this.emitAppEvent('contactAdded', { name, number });
            return { success: true, contact };
        });

        // COMMAND: Remove a contact
        this.registerCommand('removeContact', (payload) => {
            const name = payload.name;
            const number = payload.number;
            const idx = this.contacts.findIndex(c =>
                (name && c.name === name) || (number && c.number === number)
            );
            if (idx === -1) return { success: false, error: 'Contact not found' };
            const removed = this.contacts.splice(idx, 1)[0];
            this.renderContacts();
            return { success: true, removed };
        });

        // COMMAND: Send a voicemail
        this.registerCommand('sendVoicemail', (payload) => {
            const from = payload.from || 'Unknown';
            const message = payload.message || payload.text;
            if (!message) return { success: false, error: 'Message required' };
            const vm = {
                from,
                number: payload.number || '555-0000',
                message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                heard: false
            };
            this.voicemails.unshift(vm);
            this.updateVmBadge();
            this.renderVoicemails();
            this.emitAppEvent('voicemail', { from, message });
            return { success: true };
        });

        // COMMAND: Simulate an incoming call
        this.registerCommand('simulateIncoming', (payload) => {
            if (this.callState !== 'idle') return { success: false, error: 'Phone is busy' };
            const from = payload.from || payload.callerName || 'Unknown';
            const number = payload.number || '555-0000';
            this.simulateIncoming(from, number);
            return { success: true, from, number };
        });

        // COMMAND: Set LCD display text
        this.registerCommand('setText', (payload) => {
            const text = payload.text || '';
            const lcdNum = this.getElement('#lcdNumber');
            if (lcdNum) lcdNum.textContent = text;
            return { success: true };
        });

        // QUERY: Get current call state
        this.registerQuery('getStatus', () => {
            return {
                state: this.callState,
                view: this.currentView,
                contactCount: this.contacts.length,
                unheardVoicemails: this.voicemails.filter(vm => !vm.heard).length
            };
        });

        // QUERY: Get current call info
        this.registerQuery('getCurrentCall', () => {
            if (!this.currentCall) return null;
            return {
                number: this.currentCall.number,
                name: this.currentCall.name,
                direction: this.currentCall.direction,
                state: this.callState,
                duration: this.callDuration,
                messages: this.currentCall.messages
            };
        });

        // QUERY: Get all contacts
        this.registerQuery('getContacts', () => {
            return this.contacts.map(c => ({ ...c }));
        });

        // QUERY: Get call history
        this.registerQuery('getCallHistory', () => {
            return this.callHistory.map(h => ({ ...h }));
        });

        // QUERY: Get voicemails
        this.registerQuery('getVoicemails', () => {
            return this.voicemails.map(vm => ({ ...vm }));
        });
    }
}

export default Phone;
