# Socket Chat Application

A real-time chat application built with Node.js, Express, and Socket.IO that enables instant messaging between multiple connected users.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Installation & Setup](#installation--setup)
5. [How to Run](#how-to-run)
6. [Code Workflow & Architecture](#code-workflow--architecture)
   - [Server-Side (index.js)](#server-side-indexjs)
   - [Client-Side (public/index.html)](#client-side-publicindexhtml)
7. [Socket Events](#socket-events)
8. [Features](#features)
9. [Screenshots](#screenshots)

---

## 🏗️ Project Overview

This is a **real-time bidirectional chat application** that allows multiple users to communicate instantly over WebSocket connections. Unlike traditional HTTP requests where the client must poll the server for updates, this app uses Socket.IO to maintain persistent connections and push updates in real-time.

**Key Capabilities:**
- Real-time message delivery
- Typing indicator with debounce
- Broadcast messages to all other connected users
- Automatic connection handling

---

## 💻 Technology Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime for the server |
| **Express** | Web framework for serving static files |
| **Socket.IO** | WebSocket library for real-time communication |
| **HTML/CSS/JS** | Frontend client |

---

## 📂 Project Structure

```
Socket_Chat_App/
├── index.js              # Server entry point
├── package.json          # Project dependencies
├── readme.md             # Documentation
└── public/
    └── index.html        # Frontend client
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd Socket_Chat_App
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install the following packages:
   - `express` - Fast, minimalist web framework
   - `socket.io` - Real-time bidirectional communication

---

## 🚀 How to Run

1. **Start the server:**
   ```bash
   node index.js
   ```

2. **Access the application:**
   Open your browser and navigate to:
   ```
   http://localhost:9000
   ```

3. **Test with multiple users:**
   - Open the URL in multiple browser tabs or different browsers
   - Send messages from one tab and see them appear in others
   - Type in one tab and observe the typing indicator in others

---

## 🔄 Code Workflow & Architecture

### Server-Side (index.js)

The server is built using Express and Socket.IO. Here's the complete workflow:

```javascript
import http from 'http';
import {Server} from 'socket.io';
import express from 'express';
import path from 'node:path';
```

#### Step 1: Express App Setup
```javascript
const app = express();
app.use(express.static(path.resolve('./public')));
```
- Creates an Express application
- Configures static file serving from the `public` directory
- This allows the browser to load `index.html` automatically

#### Step 2: HTTP Server Creation
```javascript
const server = http.createServer(app);
const io = new Server();
io.attach(server);
```
- Creates an HTTP server wrapping the Express app
- Initializes Socket.IO on top of the HTTP server
- Socket.IO automatically serves the client-side library at `/socket.io/socket.io.js`

#### Step 3: Connection Handling
```javascript
io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    // ...
});
```
- Listens for new client connections
- Each connection gets a unique `socket.id`
- Logs connection events to the server console

#### Step 4: Message Event Handling
```javascript
socket.on('user:message', (message) => {
    console.log('Received message:', message);
    socket.broadcast.emit('server:message', message);
});
```
- Listens for `user:message` events from clients
- Logs received messages on the server
- Uses `socket.broadcast.emit()` to send the message to ALL OTHER connected clients (excluding the sender)

#### Step 5: Typing Event Handling
```javascript
socket.on('user:typing', () => {
    socket.broadcast.emit('server:typing', { userId: socket.id });
});
```
- Listens for `user:typing` events
- Broadcasts the typing status to all other users
- Includes the sender's socket ID for potential future enhancements

#### Step 6: Server Startup
```javascript
server.listen(9000, () => {
    console.log(`Server is listening on port 9000`);
});
```
- Starts the HTTP server on port 9000
- Logs a confirmation message when ready

---

### Client-Side (public/index.html)

The frontend is a single HTML file with embedded CSS and JavaScript.

#### Part 1: HTML Structure

```html
<div class="chat-container">
    <div class="chat-header">💬 WebSocket Chat</div>
    <div class="messages" id="messages">
        <div class="typing-indicator" id="typingIndicator">Someone is typing...</div>
    </div>
    <div class="input-area">
        <input type="text" id="messageInput" placeholder="Type a message...">
        <button id="sendBtn">Send</button>
    </div>
</div>
```

- **Chat Container**: Main wrapper with max-width of 800px
- **Messages Area**: Scrollable container for chat messages
- **Input Area**: Text input and send button for composing messages

#### Part 2: CSS Styling

The app features a modern dark theme:

| Element | Color | Style |
|---------|-------|-------|
| Background | `#1a1a2e` | Dark navy |
| Chat Container | `#16213e` | Slightly lighter navy |
| Header/Footer | `#0f3460` | Blue accent |
| Sent Messages | `#e94560` | Pink/Red accent |
| Received Messages | `#1a1a2e` | Dark with border |
| Text | `#eaeaea` | Off-white |

#### Part 3: JavaScript Logic

##### Initialization
```javascript
const socket = io();
```
- Connects to the Socket.IO server
- Automatically handles WebSocket connection establishment

##### Debounce Function
```javascript
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
```
- Creates a debounced version of any function
- Delays execution until after `wait` milliseconds of no calls
- Used to prevent flooding the server with typing events

##### Typing Event Emission
```javascript
const emitTyping = debounce(() => {
    socket.emit('user:typing');
}, 300);

messageInput.addEventListener('input', () => {
    emitTyping();
});
```
- Creates a debounced typing event emitter (300ms delay)
- Listens for input events on the message field
- Only emits the typing event after user stops typing for 300ms

##### Message Sending
```javascript
sendBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (text) {
        addMessage(text, true);
        messageInput.value = '';
        socket.emit('user:message', text);
    }
});
```
- Listens for click events on the send button
- Creates a message element and adds it to the UI
- Clears the input field
- Emits the `user:message` event to the server

##### Message Receiving
```javascript
socket.on('server:message', (msg) => {
    addMessage(msg, false, 'Server');
});
```
- Listens for `server:message` events from the server
- Adds received messages to the UI with `isSent = false`

##### Typing Indicator Display
```javascript
socket.on('server:typing', () => {
    typingIndicator.classList.add('visible');
    setTimeout(() => {
        typingIndicator.classList.remove('visible');
    }, 2000);
});
```
- Listens for `server:typing` events
- Shows the typing indicator when another user is typing
- Auto-hides after 2 seconds

---

## 📡 Socket Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `user:message` | `string` | Sent when user clicks send or presses Enter |
| `user:typing` | none | Sent when user is typing (debounced) |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `server:message` | `string` | Broadcast to all other users |
| `server:typing` | `{ userId: string }` | Notifies others that someone is typing |

---

## ✨ Features

1. **Real-Time Messaging**
   - Messages are delivered instantly to all connected users
   - No page refresh required

2. **Typing Indicator**
   - Shows "Someone is typing..." when another user is typing
   - Debounced to prevent event flooding (300ms)

3. **Visual Distinction**
   - Sent messages appear on the right (pink/red)
   - Received messages appear on the left (dark)

4. **Auto-Scroll**
   - Chat automatically scrolls to the newest message

5. **Connection Status**
   - Welcome message on initial load
   - Server logs all connections/disconnections

---

## 📸 Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER A (Tab 1)                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Types message in input field                            │  │
│  │  ↓ (input event → debounce 300ms)                       │  │
│  │  emits 'user:typing' to server                           │  │
│  │  ↓                                                       │  │
│  │  clicks Send button                                      │  │
│  │  ↓                                                       │  │
│  │  emits 'user:message' to server                          │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Socket.IO WebSocket
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                          SERVER                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  io.on('connection', socket)                            │  │
│  │  ↓                                                       │  │
│  │  socket.on('user:typing') → broadcast 'server:typing'  │  │
│  │  socket.on('user:message') → broadcast 'server:message' │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Socket.IO WebSocket
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    USER B (Tab 2) & USER C                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  receives 'server:typing' → shows typing indicator       │  │
│  │  receives 'server:message' → adds message to chat       │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| Port | 9000 | Server listening port |
| Debounce | 300ms | Typing event delay |
| Typing Display | 2000ms | How long to show typing indicator |

---

## 📄 License

This project is open source and available for educational purposes.

---

## 🙏 Acknowledgments

- [Socket.IO](https://socket.io/) - For the amazing WebSocket library
- [Express.js](https://expressjs.com/) - For the web framework