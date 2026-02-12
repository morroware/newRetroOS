# Implementation Plan: Phone App, Instant Messenger App, and ChatRoom Scripting Upgrade

## Overview

Create two new apps (Phone and Instant Messenger) and upgrade the existing ChatRoom app to be fully scriptable. All apps follow the established Windows 95 / late-90s aesthetic and use the existing AppBase architecture with registerCommand/registerQuery for RetroScript scripting support.

---

## 1. Phone App (`Phone.js`)

**Theme**: 90s landline phone / cordless phone simulator — think call waiting, caller ID, a chunky handset UI, and a digital phonebook.

**App Config**:
- `id: 'phone'`
- `name: 'Phone'`
- `icon: '📞'`
- `category: 'internet'`
- `singleton: true`
- `width: 380, height: 480`

**Features**:
- **Dial pad** with 0-9, *, # buttons styled like a 90s cordless phone LCD
- **Caller ID display** (monochrome LCD-style) showing number and caller name
- **Phonebook / Contacts list** with pre-populated 90s-themed contacts (e.g., "Mom", "Pizza Hut", "BBS Sysop", "Jenny 867-5309", "Moviefone", etc.)
- **Call simulation**: Dial a number → hear ringing → simulated conversation with bot responses displayed as text in the LCD area
- **Call history** (recent calls list: incoming, outgoing, missed)
- **Voicemail** with pre-recorded messages from NPCs
- **Call states**: idle, dialing, ringing, connected, on-hold, call-ended
- **Sound integration**: dial tones via SoundSystem events
- **"Mom picked up the phone"** random interrupt event (disconnects internet — nostalgic 90s moment)

**Scripting Commands (registerCommand)**:
- `dial` — Dial a phone number `{ number: '555-1234' }`
- `hangup` — Hang up current call
- `hold` — Put current call on hold
- `answer` — Answer incoming call
- `addContact` — Add contact to phonebook `{ name, number }`
- `removeContact` — Remove contact `{ name | number }`
- `sendVoicemail` — Inject a voicemail message `{ from, message }`
- `simulateIncoming` — Simulate an incoming call `{ from, callerName }`
- `setText` — Set text in the LCD display `{ text }`

**Scripting Queries (registerQuery)**:
- `getStatus` — Returns current call state (idle/dialing/ringing/connected/hold)
- `getCurrentCall` — Returns current call info (number, name, duration)
- `getContacts` — Returns all phonebook contacts
- `getCallHistory` — Returns call log
- `getVoicemails` — Returns voicemail messages

**Events Emitted (emitAppEvent)**:
- `app:phone:dialed` — When a number is dialed
- `app:phone:connected` — When call connects
- `app:phone:ended` — When call ends
- `app:phone:incoming` — When incoming call arrives
- `app:phone:voicemail` — When voicemail received
- `app:phone:contactAdded` — When contact added

---

## 2. Instant Messenger App (`InstantMessenger.js`)

**Theme**: Late 90s AIM / ICQ / MSN Messenger hybrid — buddy list, chat windows, away messages, the iconic door open/close sounds, and a buddy info popup.

**App Config**:
- `id: 'instantmessenger'`
- `name: 'Instant Messenger'`
- `icon: '💬'` (or custom)
- `category: 'internet'`
- `singleton: true`
- `width: 280, height: 460` (narrow buddy list style)

**Features**:
- **Sign-on screen** with username/password fields and animated logo
- **Buddy List** organized by groups (Buddies, Family, Co-Workers, Online/Offline)
- **Pre-populated bot buddies** with 90s screen names (SmarterChild, away messages, profiles)
- **IM conversation windows** — clicking a buddy opens a chat sub-panel within the app (since the system is single-window per singleton, use a tabbed or split view)
- **Away messages** — set your own away message ("BRB", "Shower", "zZzZz") from presets or custom
- **Buddy Info / Profile popups** showing interests, quotes, warning level
- **Status indicators**: Online, Away, Idle, Offline with colored icons
- **Typing indicator** ("SmarterChild is typing...")
- **Buddy sound effects** via events (door open/close on sign on/off)
- **File transfer simulation** (progress bar, 90s-slow speed)
- **Warning system** — "warn" a buddy, increasing their warning %
- **Bot conversations**: SmarterChild-style bot that responds to questions, plays games, gives horoscopes
- **Formatted text**: Bold, italic, font color picker (90s IM style)

**Scripting Commands (registerCommand)**:
- `signOn` — Sign on with username `{ username }`
- `signOff` — Sign off
- `sendMessage` — Send IM to a buddy `{ buddy, message }`
- `setAway` — Set away message `{ message }` (or clear if empty)
- `addBuddy` — Add buddy to list `{ screenName, group }`
- `removeBuddy` — Remove buddy `{ screenName }`
- `openConversation` — Open chat with a buddy `{ buddy }`
- `closeConversation` — Close chat with buddy `{ buddy }`
- `setStatus` — Set online status `{ status: 'online'|'away'|'idle' }`
- `warnBuddy` — Warn a buddy `{ screenName }`
- `simulateMessage` — Inject a message from a buddy `{ from, message }`
- `setBuddyStatus` — Change a bot buddy's status `{ screenName, status }`

**Scripting Queries (registerQuery)**:
- `getStatus` — Returns sign-on status and username
- `getBuddyList` — Returns full buddy list with statuses
- `getConversation` — Returns message history with a buddy `{ buddy }`
- `getAwayMessage` — Returns current away message
- `getOnlineBuddies` — Returns list of online buddies
- `getWarningLevel` — Returns warning level for a buddy

**Events Emitted (emitAppEvent)**:
- `app:instantmessenger:signedOn` — User signed on
- `app:instantmessenger:signedOff` — User signed off
- `app:instantmessenger:messageReceived` — Message received from buddy
- `app:instantmessenger:messageSent` — Message sent to buddy
- `app:instantmessenger:buddyOnline` — A buddy came online
- `app:instantmessenger:buddyOffline` — A buddy went offline
- `app:instantmessenger:awayChanged` — Away message changed

---

## 3. ChatRoom Scripting Upgrade

**Current state**: ChatRoom.js has zero registerCommand/registerQuery calls. It's self-contained with no scripting hooks.

**Upgrade plan**: Add full scripting support while preserving all existing functionality.

**Scripting Commands (registerCommand)**:
- `login` — Log in with username `{ username }`
- `sendMessage` — Send a message `{ message }`
- `joinRoom` — Switch to room `{ room }`
- `setNick` — Change nickname `{ name }`
- `clear` — Clear message history
- `addBot` — Add a simulated bot user `{ name, color, status }`
- `removeBot` — Remove a bot user `{ name }`
- `injectMessage` — Inject a message from any user `{ from, message, color }`
- `injectSystemMessage` — Add system message `{ message }`

**Scripting Queries (registerQuery)**:
- `getStatus` — Returns login state and current username
- `getCurrentRoom` — Returns current room name
- `getUsers` — Returns all users in room
- `getMessages` — Returns recent message history (last N messages)
- `getRooms` — Returns available rooms with user counts

**Events Emitted (emitAppEvent)**:
- `app:chatroom:loggedIn` — User logged in
- `app:chatroom:messageSent` — User sent a message
- `app:chatroom:messageReceived` — Bot sent a message
- `app:chatroom:roomChanged` — Room switched
- `app:chatroom:userJoined` — A user joined
- `app:chatroom:userLeft` — A user left

---

## 4. Registration & Integration

### AppRegistry.js changes:
- Import `Phone` and `InstantMessenger`
- Register both in the `Internet & Communication` section alongside ChatRoom and Browser

### Styles:
- Phone and InstantMessenger use inline `<style>` blocks (same pattern as ChatRoom) — no external CSS files needed
- All styling follows Win95 aesthetic: `#c0c0c0` backgrounds, 2px outset/inset borders, Comic Sans / system fonts, gradient titlebars

### No other system files need modification:
- Apps self-register commands/queries via AppBase methods
- EventBus integration is automatic
- No CommandBus changes needed
- No builtin script changes needed (apps are accessible via `exec('command:phone:dial', {number: '555-1234'})` in RetroScript)

---

## 5. Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| CREATE | `apps/Phone.js` | Phone app (~600-800 lines) |
| CREATE | `apps/InstantMessenger.js` | Instant Messenger app (~800-1000 lines) |
| MODIFY | `apps/ChatRoom.js` | Add scripting commands/queries/events |
| MODIFY | `apps/AppRegistry.js` | Import and register new apps |

---

## 6. Implementation Order

1. **ChatRoom scripting upgrade** — Smallest change, validates the pattern
2. **Phone app** — Medium complexity, standalone
3. **Instant Messenger app** — Most complex, richest bot interactions
4. **AppRegistry registration** — Wire everything up
5. **Test** — Verify apps load, render, and scripting commands work
