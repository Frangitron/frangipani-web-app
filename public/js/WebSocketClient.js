export class WebSocketClient {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000;

        this._openCallbacks = [];
        this._closeCallbacks = [];
        this._messageCallbacks = [];
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${protocol}//${window.location.host}/ws`;

        console.log(`Connecting to WebSocket: ${url}`);

        this.ws = new WebSocket(url);

        this.ws.addEventListener('open', () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this._openCallbacks.forEach(cb => cb());
        });

        this.ws.addEventListener('close', () => {
            console.log('WebSocket closed');
            this._closeCallbacks.forEach(cb => cb());
            this.attemptReconnect();
        });

        this.ws.addEventListener('message', (event) => {
            try {
                const msg = JSON.parse(event.data);
                this._messageCallbacks.forEach(cb => cb(msg));
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });

        this.ws.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    send(msg) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msg));
        } else {
            console.warn('WebSocket not connected, message not sent:', msg);
        }
    }

    onOpen(callback) {
        this._openCallbacks.push(callback);
    }

    onClose(callback) {
        this._closeCallbacks.push(callback);
    }

    onMessage(callback) {
        this._messageCallbacks.push(callback);
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
            setTimeout(() => this.connect(), delay);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}