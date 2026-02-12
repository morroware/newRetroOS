/**
 * Chat Room - 90s AOL/IRC Style Chat Room Simulator
 * Experience the golden age of internet chat!
 *
 * SCRIPTING SUPPORT:
 *   Commands: login, sendMessage, joinRoom, setNick, clear, addBot, removeBot,
 *             injectMessage, injectSystemMessage
 *   Queries:  getStatus, getCurrentRoom, getUsers, getMessages, getRooms
 *   Events:   app:chatroom:loggedIn, app:chatroom:messageSent,
 *             app:chatroom:messageReceived, app:chatroom:roomChanged,
 *             app:chatroom:userJoined, app:chatroom:userLeft
 */

import AppBase from './AppBase.js';

class ChatRoom extends AppBase {
    constructor() {
        super({
            id: 'chatroom',
            name: 'Chat Room',
            icon: '💬',
            width: 550,
            height: 450,
            resizable: true,
            singleton: true,
            category: 'internet'
        });

        this.username = '';
        this.currentRoom = 'lobby';
        this.messages = [];
        this.users = [];
        this.chatInterval = null;
        this.typingUsers = [];
        this.isLoggedIn = false;

        // Simulated users with 90s-style usernames
        this.botUsers = [
            { name: 'CyberSurfer99', status: 'online', color: '#0000ff' },
            { name: 'xX_DarkAngel_Xx', status: 'online', color: '#800080' },
            { name: 'SkaterBoi2000', status: 'online', color: '#008000' },
            { name: 'PrincessSparkle', status: 'away', color: '#ff69b4' },
            { name: 'HackerMan_1337', status: 'online', color: '#ff0000' },
            { name: 'MoonDreamer', status: 'online', color: '#4169e1' },
            { name: 'RollerGirl88', status: 'online', color: '#ff6347' },
            { name: 'NeoMatrix', status: 'online', color: '#00ff00' },
            { name: 'ButterFly_Kisses', status: 'away', color: '#da70d6' },
            { name: 'GameMaster3000', status: 'online', color: '#ffa500' }
        ];

        // 90s-style chat messages
        this.botMessages = [
            "a/s/l?",
            "lol",
            "brb",
            "gtg mom needs the phone",
            "anyone want to trade pics?",
            "has anyone seen The Matrix? its so cool!",
            "my modem is so slow today :(",
            "LOL!!!",
            "sup everyone",
            "this chatroom is dead",
            "*~*~HeY eVeRyOnE~*~*",
            "does anyone have any good websites?",
            "check out my geocities page!",
            "anyone play Doom?",
            "brb phone",
            "lmao",
            "whos here from california?",
            "any1 wanna cyber? j/k j/k",
            "~*~LoVe AnD pEaCe~*~",
            "GET OFF THE PHONE MOM IM ONLINE",
            "omg that's hilarious",
            "rotfl",
            "hey does anyone have the cheat codes for GTA?",
            "my parents are gonna kill me im supposed to be asleep",
            "ICQ anyone? my number is 12345678",
            "*hugs*",
            "any cute girls here?",
            "lol n00b",
            "BRB gonna grab some pizza rolls",
            "man dial-up sucks",
            "anyone else get disconnected?",
            "I <3 this song on the radio rn",
            ":) :) :)",
            "jk jk",
            "nm u?",
            "www dot whatever dot com",
            "thats so 1337",
            "peace out yall",
            "this place is poppin tonight!"
        ];

        // Rooms
        this.rooms = [
            { name: 'lobby', label: 'Main Lobby', users: 23 },
            { name: 'teens', label: 'Teen Chat', users: 45 },
            { name: 'music', label: 'Music Lovers', users: 18 },
            { name: 'games', label: 'Gamers Zone', users: 31 },
            { name: 'romance', label: 'Romance Connection', users: 52 },
            { name: 'computers', label: 'Tech Talk', users: 12 }
        ];
    }

    onOpen() {
        return `
            <style>
                .chatroom-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #c0c0c0;
                    font-family: 'Comic Sans MS', 'Arial', sans-serif;
                }
                .chatroom-header {
                    background: linear-gradient(180deg, #000080 0%, #0000cd 100%);
                    color: #ffff00;
                    padding: 5px 10px;
                    font-weight: bold;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .chatroom-header marquee {
                    font-size: 12px;
                }
                .chatroom-main {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }
                .chatroom-sidebar {
                    width: 140px;
                    background: #fff;
                    border-right: 2px groove #fff;
                    display: flex;
                    flex-direction: column;
                }
                .chatroom-rooms {
                    border-bottom: 2px groove #fff;
                    padding: 5px;
                }
                .chatroom-rooms-title {
                    font-weight: bold;
                    font-size: 10px;
                    color: #000080;
                    margin-bottom: 5px;
                }
                .chatroom-room {
                    padding: 3px 5px;
                    font-size: 10px;
                    cursor: pointer;
                    border: 1px solid transparent;
                }
                .chatroom-room:hover {
                    background: #e0e0ff;
                }
                .chatroom-room.active {
                    background: #000080;
                    color: #fff;
                }
                .chatroom-users {
                    flex: 1;
                    overflow-y: auto;
                    padding: 5px;
                }
                .chatroom-users-title {
                    font-weight: bold;
                    font-size: 10px;
                    color: #000080;
                    margin-bottom: 5px;
                }
                .chatroom-user {
                    font-size: 10px;
                    padding: 2px 5px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .chatroom-user-status {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .chatroom-user-status.online { background: #0f0; }
                .chatroom-user-status.away { background: #ff0; }
                .chatroom-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #fff;
                }
                .chatroom-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                    font-size: 12px;
                    background: #fff;
                    border: 2px inset #fff;
                    margin: 5px;
                }
                .chatroom-message {
                    margin-bottom: 5px;
                    word-wrap: break-word;
                }
                .chatroom-message-time {
                    color: #808080;
                    font-size: 10px;
                }
                .chatroom-message-user {
                    font-weight: bold;
                }
                .chatroom-message-system {
                    color: #808080;
                    font-style: italic;
                }
                .chatroom-message-action {
                    color: #800080;
                    font-style: italic;
                }
                .chatroom-typing {
                    padding: 2px 10px;
                    font-size: 10px;
                    color: #808080;
                    font-style: italic;
                    height: 14px;
                }
                .chatroom-input-area {
                    display: flex;
                    padding: 5px;
                    gap: 5px;
                    background: #c0c0c0;
                    border-top: 2px groove #fff;
                }
                .chatroom-input {
                    flex: 1;
                    padding: 5px;
                    border: 2px inset #fff;
                    font-family: 'Comic Sans MS', 'Arial', sans-serif;
                    font-size: 12px;
                }
                .chatroom-send {
                    padding: 5px 15px;
                    background: #c0c0c0;
                    border: 2px outset #fff;
                    cursor: pointer;
                    font-weight: bold;
                    font-family: 'Comic Sans MS', 'Arial', sans-serif;
                }
                .chatroom-send:active {
                    border-style: inset;
                }
                .chatroom-login {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    gap: 15px;
                    background: linear-gradient(180deg, #87ceeb 0%, #4169e1 100%);
                }
                .chatroom-login-box {
                    background: #c0c0c0;
                    border: 3px outset #fff;
                    padding: 30px;
                    text-align: center;
                }
                .chatroom-login-title {
                    font-size: 24px;
                    color: #000080;
                    margin-bottom: 20px;
                    text-shadow: 2px 2px #fff;
                }
                .chatroom-login-input {
                    padding: 8px;
                    font-size: 14px;
                    border: 2px inset #fff;
                    width: 200px;
                    margin-bottom: 15px;
                    font-family: 'Comic Sans MS', 'Arial', sans-serif;
                }
                .chatroom-login-btn {
                    padding: 8px 30px;
                    font-size: 14px;
                    background: #c0c0c0;
                    border: 2px outset #fff;
                    cursor: pointer;
                    font-family: 'Comic Sans MS', 'Arial', sans-serif;
                }
                .chatroom-login-btn:active {
                    border-style: inset;
                }
                .chatroom-emojis {
                    padding: 5px;
                    display: flex;
                    gap: 5px;
                    flex-wrap: wrap;
                    border-top: 1px solid #ccc;
                }
                .chatroom-emoji {
                    cursor: pointer;
                    font-size: 14px;
                    padding: 2px;
                }
                .chatroom-emoji:hover {
                    background: #e0e0e0;
                }
            </style>
            <div class="chatroom-container">
                <div class="chatroom-login" id="loginScreen">
                    <div class="chatroom-login-box">
                        <div class="chatroom-login-title">~*~ Welcome to Chat ~*~</div>
                        <div style="margin-bottom: 15px;">Enter your screen name:</div>
                        <input type="text" class="chatroom-login-input" id="usernameInput" placeholder="CoolDude99" maxlength="20">
                        <br>
                        <button class="chatroom-login-btn" id="loginBtn">Enter Chat</button>
                        <div style="margin-top: 15px; font-size: 10px; color: #666;">
                            Tip: Be creative with your name!<br>
                            Try xX_Name_Xx or Name2000
                        </div>
                    </div>
                </div>

                <div id="chatScreen" style="display: none; flex: 1; flex-direction: column;">
                    <div class="chatroom-header">
                        <span>💬 Chat Room: <span id="roomLabel">Main Lobby</span></span>
                        <marquee width="200" scrollamount="3">~*~ Welcome to the chat! Be nice! ~*~</marquee>
                    </div>

                    <div class="chatroom-main">
                        <div class="chatroom-sidebar">
                            <div class="chatroom-rooms">
                                <div class="chatroom-rooms-title">📁 Rooms</div>
                                ${this.rooms.map(r => `
                                    <div class="chatroom-room ${r.name === 'lobby' ? 'active' : ''}" data-room="${r.name}">
                                        ${r.label} (${r.users})
                                    </div>
                                `).join('')}
                            </div>
                            <div class="chatroom-users">
                                <div class="chatroom-users-title">👥 Users Online</div>
                                <div id="userList"></div>
                            </div>
                        </div>

                        <div class="chatroom-content">
                            <div class="chatroom-messages" id="messages"></div>
                            <div class="chatroom-typing" id="typingIndicator"></div>
                            <div class="chatroom-emojis">
                                ${['😀', '😂', '😍', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '💔', '🎉', '🔥', '💯'].map(e => `
                                    <span class="chatroom-emoji" data-emoji="${e}">${e}</span>
                                `).join('')}
                            </div>
                            <div class="chatroom-input-area">
                                <input type="text" class="chatroom-input" id="messageInput" placeholder="Type a message..." maxlength="200">
                                <button class="chatroom-send" id="sendBtn">Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    onMount() {
        // Login handlers
        this.addHandler(this.getElement('#loginBtn'), 'click', () => this.login());
        this.addHandler(this.getElement('#usernameInput'), 'keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });

        // Chat handlers
        this.addHandler(this.getElement('#sendBtn'), 'click', () => this.sendMessage());
        this.addHandler(this.getElement('#messageInput'), 'keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Room selection
        this.getElements('.chatroom-room').forEach(room => {
            this.addHandler(room, 'click', () => this.joinRoom(room.dataset.room));
        });

        // Emoji buttons
        this.getElements('.chatroom-emoji').forEach(emoji => {
            this.addHandler(emoji, 'click', () => {
                const input = this.getElement('#messageInput');
                if (input) {
                    input.value += emoji.dataset.emoji;
                    input.focus();
                }
            });
        });

        // Register scripting commands and queries
        this._registerScriptingCommands();

        // Focus username input
        setTimeout(() => {
            this.getElement('#usernameInput')?.focus();
        }, 100);
    }

    onClose() {
        if (this.chatInterval) {
            clearInterval(this.chatInterval);
        }
        this.isLoggedIn = false;
        this.messages = [];
    }

    login(nameOverride) {
        const input = this.getElement('#usernameInput');
        const name = nameOverride || input?.value.trim();

        if (!name) {
            this.alert('Please enter a screen name!');
            return;
        }

        this.username = name;
        this.isLoggedIn = true;

        // Hide login, show chat
        const loginScreen = this.getElement('#loginScreen');
        const chatScreen = this.getElement('#chatScreen');

        if (loginScreen) loginScreen.style.display = 'none';
        if (chatScreen) {
            chatScreen.style.display = 'flex';
        }

        // Initialize users
        this.users = [
            { name: this.username, status: 'online', color: '#000', isUser: true },
            ...this.getRandomUsers(5)
        ];

        this.updateUserList();

        // Add welcome messages
        this.addSystemMessage(`*** Welcome to the ${this.rooms[0].label}! ***`);
        this.addSystemMessage(`*** ${this.username} has entered the room ***`);

        // Emit login event
        this.emitAppEvent('loggedIn', { username: this.username, room: this.currentRoom });

        // Start bot chat simulation
        this.startBotChat();
    }

    getRandomUsers(count) {
        const shuffled = [...this.botUsers].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    startBotChat() {
        // Random bot messages at intervals
        this.chatInterval = setInterval(() => {
            if (Math.random() < 0.4) {
                this.sendBotMessage();
            }

            // Occasionally show typing indicator
            if (Math.random() < 0.2) {
                this.showTypingIndicator();
            }

            // Occasionally have user join/leave
            if (Math.random() < 0.1) {
                this.simulateUserActivity();
            }
        }, 3000);
    }

    sendBotMessage() {
        const onlineUsers = this.users.filter(u => !u.isUser && u.status === 'online');
        if (onlineUsers.length === 0) return;

        const user = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
        const message = this.botMessages[Math.floor(Math.random() * this.botMessages.length)];

        this.addMessage(user.name, message, user.color);
        this.emitAppEvent('messageReceived', { from: user.name, message, room: this.currentRoom });
    }

    showTypingIndicator() {
        const onlineUsers = this.users.filter(u => !u.isUser && u.status === 'online');
        if (onlineUsers.length === 0) return;

        const user = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
        const indicator = this.getElement('#typingIndicator');

        if (indicator) {
            indicator.textContent = `${user.name} is typing...`;
            setTimeout(() => {
                indicator.textContent = '';
            }, 2000);
        }
    }

    simulateUserActivity() {
        if (Math.random() < 0.5 && this.users.length > 3) {
            // User leaves
            const botUsers = this.users.filter(u => !u.isUser);
            if (botUsers.length > 2) {
                const leaving = botUsers[Math.floor(Math.random() * botUsers.length)];
                this.users = this.users.filter(u => u.name !== leaving.name);
                this.addSystemMessage(`*** ${leaving.name} has left the room ***`);
                this.updateUserList();
                this.emitAppEvent('userLeft', { username: leaving.name, room: this.currentRoom });
            }
        } else {
            // New user joins
            const availableUsers = this.botUsers.filter(bu =>
                !this.users.find(u => u.name === bu.name)
            );
            if (availableUsers.length > 0) {
                const joining = availableUsers[Math.floor(Math.random() * availableUsers.length)];
                this.users.push({ ...joining });
                this.addSystemMessage(`*** ${joining.name} has entered the room ***`);
                this.updateUserList();
                this.emitAppEvent('userJoined', { username: joining.name, room: this.currentRoom });
            }
        }
    }

    sendMessage(messageOverride) {
        const input = this.getElement('#messageInput');
        const message = messageOverride || input?.value.trim();

        if (!message) return;

        // Check for action commands
        if (message.startsWith('/me ')) {
            this.addActionMessage(this.username, message.slice(4));
        } else if (message.startsWith('/')) {
            this.handleCommand(message);
        } else {
            this.addMessage(this.username, message, '#000', true);
            this.emitAppEvent('messageSent', { username: this.username, message, room: this.currentRoom });
        }

        if (input) input.value = '';

        // Bot might respond
        if (Math.random() < 0.3) {
            setTimeout(() => {
                this.sendBotResponse(message);
            }, 1500 + Math.random() * 2000);
        }
    }

    handleCommand(message) {
        const [cmd, ...args] = message.slice(1).split(' ');

        switch (cmd.toLowerCase()) {
            case 'help':
                this.addSystemMessage('Commands: /me [action], /nick [name], /clear, /users');
                break;
            case 'nick':
                if (args[0]) {
                    const oldName = this.username;
                    this.username = args.join(' ');
                    const user = this.users.find(u => u.isUser);
                    if (user) user.name = this.username;
                    this.addSystemMessage(`*** ${oldName} is now known as ${this.username} ***`);
                    this.updateUserList();
                }
                break;
            case 'clear':
                const messages = this.getElement('#messages');
                if (messages) messages.innerHTML = '';
                break;
            case 'users':
                this.addSystemMessage(`Users in room: ${this.users.map(u => u.name).join(', ')}`);
                break;
            default:
                this.addSystemMessage(`Unknown command: ${cmd}`);
        }
    }

    sendBotResponse(userMessage) {
        const onlineUsers = this.users.filter(u => !u.isUser && u.status === 'online');
        if (onlineUsers.length === 0) return;

        const user = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
        const lowerMsg = userMessage.toLowerCase();

        let response;

        // Context-aware responses
        if (lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg.includes('hello')) {
            response = ['hey!', 'hi there!', 'sup!', `hey ${this.username}!`, 'hello :)'][Math.floor(Math.random() * 5)];
        } else if (lowerMsg.includes('?')) {
            response = ['idk', 'lol dunno', 'maybe?', 'ask someone else', 'good question'][Math.floor(Math.random() * 5)];
        } else if (lowerMsg.includes('lol') || lowerMsg.includes('lmao')) {
            response = ['lol', 'haha', 'rofl', '😂', 'lmao'][Math.floor(Math.random() * 5)];
        } else if (lowerMsg.includes('bye') || lowerMsg.includes('gtg')) {
            response = ['cya!', 'bye!', 'peace out', 'later!', 'ttyl'][Math.floor(Math.random() * 5)];
        } else {
            // Random response
            response = this.botMessages[Math.floor(Math.random() * this.botMessages.length)];
        }

        this.addMessage(user.name, response, user.color);
    }

    addMessage(username, text, color = '#000', isUser = false) {
        const messagesEl = this.getElement('#messages');
        if (!messagesEl) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const entry = { type: 'message', username, text, color, time, isUser, timestamp: Date.now() };
        this.messages.push(entry);

        const div = document.createElement('div');
        div.className = 'chatroom-message';
        div.innerHTML = `
            <span class="chatroom-message-time">[${time}]</span>
            <span class="chatroom-message-user" style="color: ${color};">${username}:</span>
            <span>${this.escapeHtml(text)}</span>
        `;

        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    addSystemMessage(text) {
        const messagesEl = this.getElement('#messages');
        if (!messagesEl) return;

        const entry = { type: 'system', text, timestamp: Date.now() };
        this.messages.push(entry);

        const div = document.createElement('div');
        div.className = 'chatroom-message chatroom-message-system';
        div.textContent = text;

        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    addActionMessage(username, action) {
        const messages = this.getElement('#messages');
        if (!messages) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const div = document.createElement('div');
        div.className = 'chatroom-message chatroom-message-action';
        div.innerHTML = `
            <span class="chatroom-message-time">[${time}]</span>
            * ${username} ${this.escapeHtml(action)}
        `;

        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    joinRoom(roomName) {
        const room = this.rooms.find(r => r.name === roomName);
        if (!room) return;

        const previousRoom = this.currentRoom;
        this.currentRoom = roomName;

        // Update active room style
        this.getElements('.chatroom-room').forEach(el => {
            el.classList.toggle('active', el.dataset.room === roomName);
        });

        // Update header
        const label = this.getElement('#roomLabel');
        if (label) label.textContent = room.label;

        // Clear messages and add join message
        const messagesEl = this.getElement('#messages');
        if (messagesEl) messagesEl.innerHTML = '';
        this.messages = [];

        // Get new random users for this room
        this.users = [
            { name: this.username, status: 'online', color: '#000', isUser: true },
            ...this.getRandomUsers(3 + Math.floor(Math.random() * 5))
        ];

        this.updateUserList();
        this.addSystemMessage(`*** You have joined ${room.label} ***`);
        this.addSystemMessage(`*** ${this.username} has entered the room ***`);

        this.emitAppEvent('roomChanged', { room: roomName, previousRoom, label: room.label });
    }

    updateUserList() {
        const list = this.getElement('#userList');
        if (!list) return;

        list.innerHTML = this.users.map(u => `
            <div class="chatroom-user">
                <span class="chatroom-user-status ${u.status}"></span>
                <span style="color: ${u.color};">${u.isUser ? `<b>${u.name}</b>` : u.name}</span>
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== SCRIPTING SUPPORT =====

    _registerScriptingCommands() {
        // COMMAND: Log in with a username
        this.registerCommand('login', (payload) => {
            if (this.isLoggedIn) {
                return { success: false, error: 'Already logged in' };
            }
            const username = payload.username || payload.name;
            if (!username) {
                return { success: false, error: 'Username required' };
            }
            this.login(username);
            return { success: true, username: this.username, room: this.currentRoom };
        });

        // COMMAND: Send a chat message
        this.registerCommand('sendMessage', (payload) => {
            if (!this.isLoggedIn) {
                return { success: false, error: 'Not logged in' };
            }
            const message = payload.message || payload.text;
            if (!message) {
                return { success: false, error: 'Message required' };
            }
            this.sendMessage(message);
            return { success: true, message };
        });

        // COMMAND: Join a room
        this.registerCommand('joinRoom', (payload) => {
            if (!this.isLoggedIn) {
                return { success: false, error: 'Not logged in' };
            }
            const room = payload.room || payload.name;
            if (!room) {
                return { success: false, error: 'Room name required' };
            }
            const roomObj = this.rooms.find(r => r.name === room || r.label === room);
            if (!roomObj) {
                return { success: false, error: `Room not found: ${room}` };
            }
            this.joinRoom(roomObj.name);
            return { success: true, room: roomObj.name, label: roomObj.label };
        });

        // COMMAND: Change nickname
        this.registerCommand('setNick', (payload) => {
            if (!this.isLoggedIn) {
                return { success: false, error: 'Not logged in' };
            }
            const name = payload.name || payload.nick;
            if (!name) {
                return { success: false, error: 'Name required' };
            }
            const oldName = this.username;
            this.username = name;
            const user = this.users.find(u => u.isUser);
            if (user) user.name = this.username;
            this.addSystemMessage(`*** ${oldName} is now known as ${this.username} ***`);
            this.updateUserList();
            return { success: true, oldName, newName: this.username };
        });

        // COMMAND: Clear message history
        this.registerCommand('clear', () => {
            const messagesEl = this.getElement('#messages');
            if (messagesEl) messagesEl.innerHTML = '';
            this.messages = [];
            return { success: true };
        });

        // COMMAND: Add a bot user to the room
        this.registerCommand('addBot', (payload) => {
            const name = payload.name;
            if (!name) {
                return { success: false, error: 'Bot name required' };
            }
            if (this.users.find(u => u.name === name)) {
                return { success: false, error: 'User already in room' };
            }
            const bot = {
                name,
                status: payload.status || 'online',
                color: payload.color || '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
            };
            this.users.push(bot);
            this.addSystemMessage(`*** ${name} has entered the room ***`);
            this.updateUserList();
            this.emitAppEvent('userJoined', { username: name, room: this.currentRoom });
            return { success: true, bot };
        });

        // COMMAND: Remove a bot user from the room
        this.registerCommand('removeBot', (payload) => {
            const name = payload.name;
            if (!name) {
                return { success: false, error: 'Bot name required' };
            }
            const idx = this.users.findIndex(u => u.name === name && !u.isUser);
            if (idx === -1) {
                return { success: false, error: 'Bot not found' };
            }
            this.users.splice(idx, 1);
            this.addSystemMessage(`*** ${name} has left the room ***`);
            this.updateUserList();
            this.emitAppEvent('userLeft', { username: name, room: this.currentRoom });
            return { success: true };
        });

        // COMMAND: Inject a message from any user
        this.registerCommand('injectMessage', (payload) => {
            const from = payload.from || 'Anonymous';
            const message = payload.message || payload.text;
            if (!message) {
                return { success: false, error: 'Message required' };
            }
            const color = payload.color || '#000';
            this.addMessage(from, message, color);
            this.emitAppEvent('messageReceived', { from, message, room: this.currentRoom });
            return { success: true };
        });

        // COMMAND: Inject a system message
        this.registerCommand('injectSystemMessage', (payload) => {
            const message = payload.message || payload.text;
            if (!message) {
                return { success: false, error: 'Message required' };
            }
            this.addSystemMessage(message);
            return { success: true };
        });

        // QUERY: Get current status
        this.registerQuery('getStatus', () => {
            return {
                loggedIn: this.isLoggedIn,
                username: this.username || null,
                room: this.currentRoom,
                userCount: this.users.length
            };
        });

        // QUERY: Get current room info
        this.registerQuery('getCurrentRoom', () => {
            const room = this.rooms.find(r => r.name === this.currentRoom);
            return {
                name: this.currentRoom,
                label: room ? room.label : this.currentRoom,
                userCount: this.users.length
            };
        });

        // QUERY: Get users in current room
        this.registerQuery('getUsers', () => {
            return this.users.map(u => ({
                name: u.name,
                status: u.status,
                isUser: !!u.isUser,
                color: u.color
            }));
        });

        // QUERY: Get recent messages
        this.registerQuery('getMessages', (payload) => {
            const count = (payload && payload.count) || 50;
            return this.messages.slice(-count);
        });

        // QUERY: Get available rooms
        this.registerQuery('getRooms', () => {
            return this.rooms.map(r => ({
                name: r.name,
                label: r.label,
                users: r.users,
                active: r.name === this.currentRoom
            }));
        });
    }
}

export default ChatRoom;
