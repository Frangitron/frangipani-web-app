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
        if (msg._type === 'InitMessage') {
            this.clientId = msg.client_id;
            this.controlsManager.loadControls([msg.root_control_definition]);
            this.renderUI();

        } else if (msg._type === 'UpdateMessage') {
            if (msg.sender_id !== this.clientId) {
                this.controlsManager.updateControl(msg.address, msg.value);
                this.uiRenderer.updateControlUI(msg.address, msg.value);
            }
        }
    }

    renderUI() {
        const container = document.getElementById('controlsContainer');
        container.innerHTML = '';
        
        const controls = this.controlsManager.getControls();
        this.uiRenderer.renderControls(container, controls, (address, value) => {
            this.onControlChange(address, value);
        });
    }

    onControlChange(address, value) {
        this.controlsManager.updateControl(address, value);

        let message = {
            sender_id: this.clientId,
            type: 'UpdateMessage',
            address: address,
            value: value
        }
        this.wsClient.send(message);
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
