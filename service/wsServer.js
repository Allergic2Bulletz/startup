const { WebSocketServer } = require('ws');

class SyncServer {
    constructor(server) {
        this.wss = new WebSocketServer({ server });
        this.clients = new Map(); // Store client connections with metadata
        this.setupServer();
    }

    setupServer() {
        this.wss.on('connection', (ws, req) => {
            const clientId = this.generateClientId();
            console.log(`📡 WebSocket client connected: ${clientId}`);

            // Store client with metadata
            this.clients.set(clientId, {
                ws: ws,
                connected: true,
                lastPing: Date.now(),
                userName: null // Will be set when authenticated
            });

            // Set up message handling
            ws.on('message', (data) => {
                this.handleMessage(clientId, data);
            });

            // Handle client disconnect
            ws.on('close', () => {
                console.log(`📡 WebSocket client disconnected: ${clientId}`);
                this.clients.delete(clientId);
            });

            // Handle errors
            ws.on('error', (error) => {
                console.error(`📡 WebSocket error for client ${clientId}:`, error);
            });

            // Send welcome message
            this.sendToClient(clientId, {
                type: 'connected',
                clientId: clientId,
                timestamp: new Date().toISOString()
            });
        });

        console.log('📡 WebSocket Server initialized');
    }

    handleMessage(clientId, data) {
        try {
            const message = JSON.parse(data);
            console.log(`📡 Received from ${clientId}:`, message);

            switch (message.type) {
                case 'ping':
                    this.handlePing(clientId, message);
                    break;
                case 'pong':
                    this.handlePong(clientId, message);
                    break;
                case 'auth':
                    this.handleAuth(clientId, message);
                    break;
                default:
                    console.log(`📡 Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error(`📡 Error parsing message from ${clientId}:`, error);
        }
    }

    handlePing(clientId, message) {
        console.log(`📡 Ping received from ${clientId}`);
        this.sendToClient(clientId, {
            type: 'pong',
            originalTimestamp: message.timestamp,
            timestamp: new Date().toISOString()
        });
    }

    handlePong(clientId, message) {
        const client = this.clients.get(clientId);
        if (client) {
            client.lastPing = Date.now();
            console.log(`📡 Pong received from ${clientId}`);
        }
    }

    handleAuth(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && message.userName) {
            client.userName = message.userName;
            console.log(`📡 Client ${clientId} authenticated as ${message.userName}`);
        }
    }

    // Send message to specific client
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    // Broadcast to all connected clients
    broadcast(message) {
        const sentCount = 0;
        this.clients.forEach((client, clientId) => {
            if (this.sendToClient(clientId, message)) {
                sentCount++;
            }
        });
        console.log(`📡 Broadcast sent to ${sentCount} clients`);
        return sentCount;
    }

    // Send alert to specific user or all users
    sendAlert(message, userName = null) {
        const alertMessage = {
            type: 'alert',
            message: message,
            timestamp: new Date().toISOString()
        };

        if (userName) {
            // Send to specific user
            let sentCount = 0;
            this.clients.forEach((client, clientId) => {
                if (client.userName === userName && this.sendToClient(clientId, alertMessage)) {
                    sentCount++;
                }
            });
            console.log(`📡 Alert sent to user ${userName} (${sentCount} clients)`);
            return sentCount;
        } else {
            // Broadcast to all clients
            const sentCount = this.broadcast(alertMessage);
            console.log(`📡 Alert broadcast to all clients (${sentCount} clients)`);
            return sentCount;
        }
    }

    // Ping all clients (server-initiated)
    pingAllClients() {
        const pingMessage = {
            type: 'ping',
            timestamp: new Date().toISOString()
        };
        return this.broadcast(pingMessage);
    }

    // Generate unique client ID
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get connected clients info
    getClientsInfo() {
        const info = [];
        this.clients.forEach((client, clientId) => {
            info.push({
                id: clientId,
                userName: client.userName,
                connected: client.connected,
                lastPing: client.lastPing
            });
        });
        return info;
    }
}


module.exports = { SyncServer };