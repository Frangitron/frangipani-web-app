import { ControlsManager } from './ControlsManager.js';
import { WebSocketClient } from './WebSocketClient.js';
import { UIRenderer } from './UIRenderer.js';


// Fullscreen functionality
const fullscreenBtn = document.getElementById('fullscreenBtn');

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen().catch(err => {
            console.log(`Error attempting to exit fullscreen: ${err.message}`);
        });
    }
});

// Update button icon when fullscreen state changes
document.addEventListener('fullscreenchange', () => {
    // You can update the icon here if needed
    fullscreenBtn.classList.toggle('fullscreen-active', !!document.fullscreenElement);
});


class App {
    constructor() {
        this.wsClient = new WebSocketClient();
        this.controlsManager = new ControlsManager();
        this.uiRenderer = new UIRenderer();

        this.clientId = null;
        this.init();
    }

    init() {
        // Set up WebSocket handlers
        this.wsClient.onOpen(() => this.handleConnected());
        this.wsClient.onClose(() => this.handleDisconnected());
        this.wsClient.onMessage((msg) => this.handleMessage(msg));
        
        // Connect to server
        this.wsClient.connect();
    }

    handleConnected() {
        console.log('Connected to server');
        this.updateStatus('connected');
    }

    handleDisconnected() {
        console.log('Disconnected from server');
        this.updateStatus('disconnected');
    }

    handleMessage(msg) {
        if (msg.type === 'init') {
            // Initial state received
            this.clientId = msg.clientId;
            this.controlsManager.setClientId(this.clientId);
            this.controlsManager.loadControls(msg.data.controls);
            this.renderUI();
        } else if (msg.type === 'update') {
            // Update from another client
            if (msg.senderId !== this.clientId) {
                this.controlsManager.updateControl(msg.controlId, msg.value);
                this.uiRenderer.updateControlUI(msg.controlId, msg.value);
            }
        }
    }

    renderUI() {
        const container = document.getElementById('controlsContainer');
        container.innerHTML = '';
        
        const controls = this.controlsManager.getControls();
        this.uiRenderer.renderControls(container, controls, (controlId, value) => {
            this.onControlChange(controlId, value);
        });
    }

    onControlChange(controlId, value) {
        // Update local state
        this.controlsManager.updateControl(controlId, value);
        
        // Send to server
        this.wsClient.send({
            type: 'update',
            controlId: controlId,
            value: value
        });
    }

    updateStatus(status) {
        const indicator = document.getElementById('status');
        indicator.className = `status-indicator ${status}`;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new App();
    });
} else {
    new App();
}
