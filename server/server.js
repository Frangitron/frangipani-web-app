import WebSocket, { WebSocketServer } from 'ws';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Store all controls state
let controlsState = {
    controls: [
        {
            id: 'group1',
            type: 'group',
            label: 'Main Controls',
            controls: [
                {
                    id: 'fader1',
                    type: 'fader',
                    label: 'Volume',
                    value: 50,
                    min: 0,
                    max: 100
                },
                {
                    id: 'button1',
                    type: 'button',
                    label: 'Play',
                    value: false,
                    toggleMode: true
                }
            ]
        },
        {
            id: 'group2',
            type: 'group',
            label: 'Color Controls',
            controls: [
                {
                    id: 'colorwheel1',
                    type: 'colorwheel',
                    label: 'Color',
                    hue: 0,
                    brightness: 50
                },
                {
                    id: 'radio1',
                    type: 'radio',
                    label: 'Mode',
                    value: 'mode1',
                    options: ['mode1', 'mode2', 'mode3']
                }
            ]
        },
        {
            id: 'label1',
            type: 'label',
            text: 'Status: Ready'
        }
    ]
};

// Store connected clients with their IDs
const clients = new Map();

// Create HTTP server
const server = app.listen(PORT, () => {
    console.log(`Frangipani server running at http://localhost:${PORT}`);
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Generate unique client ID
function generateClientId() {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

wss.on('connection', (ws) => {
    const clientId = generateClientId();
    clients.set(ws, clientId);

    console.log(`Client connected: ${clientId}`);

    // Send initial state to new client
    ws.send(JSON.stringify({
        type: 'init',
        clientId: clientId,
        data: controlsState
    }));

    // Handle messages from client
    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);

            if (msg.type === 'update') {
                // Update the control state
                updateControl(msg.controlId, msg.value);

                // Broadcast update to all clients except sender
                broadcastUpdate(msg, clientId);

                console.log(`Control updated: ${msg.controlId} = ${JSON.stringify(msg.value)} by ${clientId}`);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    // Handle client disconnect
    ws.on('close', () => {
        clients.delete(ws);
        console.log(`Client disconnected: ${clientId}`);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error(`WebSocket error (${clientId}):`, error);
    });
});

// Update control value in state
function updateControl(controlId, value) {
    function findAndUpdate(controls) {
        for (let control of controls) {
            if (control.id === controlId) {
                if (typeof value === 'object') {
                    Object.assign(control, value);
                } else {
                    control.value = value;
                }
                return true;
            }
            if (control.controls && Array.isArray(control.controls)) {
                if (findAndUpdate(control.controls)) {
                    return true;
                }
            }
        }
        return false;
    }

    findAndUpdate(controlsState.controls);
}

// Broadcast update to all connected clients except sender
function broadcastUpdate(msg, senderId) {
    const broadcastMsg = JSON.stringify({
        type: 'update',
        controlId: msg.controlId,
        value: msg.value,
        senderId: senderId
    });

    clients.forEach((clientId, ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(broadcastMsg);
        }
    });
}

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

export { app, server, wss };
