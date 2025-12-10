class ExampleWebSocketClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.onAlertCallback = null;
        this.onConnectedCallback = null;
        this.onDisconnectedCallback = null;
        this.clientId = null;
        this.userName = null;
    }

    connect(userName = null) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        console.log('📡 Connecting to WebSocket:', wsUrl);
        this.userName = userName;

        try {
            this.ws = new WebSocket(wsUrl);
            this.setupEventHandlers();
        } catch (error) {
            console.error('📡 WebSocket connection error:', error);
            this.handleReconnect();
        }
    }

    setupEventHandlers() {
        this.ws.onopen = (event) => {
            console.log('📡 WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            if (this.onConnectedCallback) {
                this.onConnectedCallback();
            }
        };

        this.ws.onmessage = (event) => {
            this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
            console.log('📡 WebSocket disconnected:', event.code, event.reason);
            this.isConnected = false;
            
            if (this.onDisconnectedCallback) {
                this.onDisconnectedCallback();
            }
            
            // Attempt reconnection
            this.handleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('📡 WebSocket error:', error);
        };
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            console.log('📡 Received message:', message);

            switch (message.type) {
                case 'connected':
                    this.clientId = message.clientId;
                    const authStatus = message.authenticated ? 'authenticated' : 'unauthenticated';
                    console.log(`📡 Assigned client ID: ${this.clientId} (${authStatus})`);
                    if (message.authenticated && message.userName) {
                        this.userName = message.userName;
                        console.log(`📡 Authenticated as: ${this.userName}`);
                    }
                    break;
                case 'ping':
                    this.handlePing(message);
                    break;
                case 'pong':
                    this.handlePong(message);
                    break;
                case 'alert':
                    this.handleAlert(message);
                    break;
                default:
                    console.log(`📡 Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error('📡 Error parsing message:', error);
        }
    }

    handlePing(message) {
        console.log('📡 Ping received from server');
        this.send({
            type: 'pong',
            originalTimestamp: message.timestamp,
            timestamp: new Date().toISOString()
        });
    }

    handlePong(message) {
        const roundTripTime = Date.now() - new Date(message.originalTimestamp).getTime();
        console.log(`📡 Pong received, round trip: ${roundTripTime}ms`);
    }

    handleAlert(message) {
        console.log('📡 Alert received:', message.message);
        if (this.onAlertCallback) {
            this.onAlertCallback(message.message);
        }
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            return true;
        } else {
            console.warn('📡 WebSocket not connected, cannot send message');
            return false;
        }
    }

    sendPing() {
        console.log('📡 Sending ping to server');
        return this.send({
            type: 'ping',
            timestamp: new Date().toISOString()
        });
    }

    sendAuth(userName) {
        console.log('📡 Sending authentication:', userName);
        this.userName = userName;
        return this.send({
            type: 'auth',
            userName: userName
        });
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
            
            console.log(`📡 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect(this.userName);
            }, delay);
        } else {
            console.error('📡 Max reconnection attempts reached');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }

    // Callback setters
    onAlert(callback) {
        this.onAlertCallback = callback;
    }

    onConnected(callback) {
        this.onConnectedCallback = callback;
    }

    onDisconnected(callback) {
        this.onDisconnectedCallback = callback;
    }

    getStatus() {
        return {
            connected: this.isConnected,
            clientId: this.clientId,
            userName: this.userName,
            reconnectAttempts: this.reconnectAttempts
        };
    }
}

class CommandQueue {
    constructor() {
        this.commands = [];
        this.lock = false;
    }
    enqueue(command) {
        this.commands.push(command);
    }
    dequeue() {
        return this.commands.shift();
    }
}

class Command {
    constructor(target, action, data) {
        this.target = target;
        this.action = action;
        this.data = data;
    }
}

class WebSocketClient {
    commands = new CommandQueue();
    commandHandlers = [];

    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.onConnectedCallback = null;
        this.onDisconnectedCallback = null;
        this.clientId = null;
        this.userName = null;
    }

    connect(userName) {
        if(!userName) {
           throw new Error("WebSocketClient: userName is required to connect");
        }
        this.userName = userName;

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const port = window.location.port;
        this.ws = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws/?userName=${this.userName}`);

        this.setupEventHandlers();
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        if (this.onDisconnectedCallback) {
            this.onDisconnectedCallback();
        }
    }

    setupEventHandlers() {
        this.ws.onopen = (event) => {
            console.log('📡 WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            this.parseMessage(event.data);
        }

        this.ws.onclose = (event) => {
            console.log('📡 WebSocket disconnected:', event.code, event.reason);
            this.isConnected = false;

            if (this.onDisconnectedCallback) {
                this.onDisconnectedCallback();
            }

            // Attempt reconnection
            if(event.code !== 1000) { // 1000 = Normal Closure
                 this.handleReconnect();
            }
        }
    }

    parseMessage(data) {
        try {
            const message = JSON.parse(data);
            console.log('📡 Received message:', message);

            switch (message.type) {
                case 'ping':
                    this.sendPong(message);
                    break;
                case 'command':
                    this.receiveCommand(new Command(message.target, message.action, message.data));
                    break;
                default:
                    console.log(`📡 Unknown message type: ${message.type}`);
            }   
        } catch (error) {
            console.error('📡 Error parsing message:', error);
        }
    }

    receiveCommand(command) {
        console.log(`There are ${this.commandHandlers.length} command handlers`);
        for (const handler of this.commandHandlers) {
            handler(command);
        }
    }

    sendPong(message) {
        console.log('📡 Ping received from server');
        this.ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
        }));
    }

    handleReconnect() {
        // note - basically if a ws disconnects, wsClient will try to create a new ws. If that one fails, try to make another one, etc
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
            console.log(`📡 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connect(this.userName);
            }, delay);
        }
        else {
            console.error('📡 Max reconnection attempts reached');
        }
    }

    addHandler(handler) {
        this.commandHandlers.push(handler);
    }

    removeHandler(handler) {
        this.commandHandlers = this.commandHandlers.filter(h => h !== handler);
    }
}

export default WebSocketClient;