export class ColorWheelControl {
    constructor(control, onChangeCallback) {
        this.control = control;
        this.onChangeCallback = onChangeCallback;
        this.element = null;
        this.canvas = null;
        this.hue = control.hue || 0;
        this.brightness = control.brightness || 50;
        this.saturation = 100; // Always 100 internally
        this.isUserInteracting = false;
        this.imageData = null;
    }

    render() {
        const template = document.getElementById('colorwheel-template');
        this.element = template.content.cloneNode(true).firstElementChild;

        const label = this.element.querySelector('.control-label');
        label.textContent = this.control.label;

        this.canvas = this.element.querySelector('.colorwheel-canvas');

        // Remove the brightness slider wrapper
        const brightnessWrapper = this.element.querySelector('.colorwheel-saturation-wrapper');
        if (brightnessWrapper) {
            brightnessWrapper.remove();
        }

        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleCanvasTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleCanvasTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleDocumentMouseUp(e));

        // Attach document-level events for mouse tracking outside canvas
        document.addEventListener('mousemove', (e) => this.handleDocumentMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleDocumentMouseUp(e));

        // Ensure canvas is rendered before drawing
        requestAnimationFrame(() => this.drawColorWheel());

        return this.element;
    }

    drawBackground(ctx, width, height) {
        const rect = this.canvas.getBoundingClientRect();
        if (this.imageData !== null && (rect.width === width || rect.height === height)) {
            ctx.putImageData(this.imageData, 0, 0);
            return
        }

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 5;

        // Draw color wheel
        this.imageData = ctx.createImageData(width, height);
        const data = this.imageData.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= radius) {
                    const angle = Math.atan2(dy, dx);
                    const hue = (angle + Math.PI) / (2 * Math.PI) * 360;
                    const brightness = (1 - distance / radius) * 50 + 50;

                    const rgb = this.hslToRgb(hue, this.saturation, brightness);

                    const index = (y * width + x) * 4;
                    data[index] = rgb.r;
                    data[index + 1] = rgb.g;
                    data[index + 2] = rgb.b;
                    data[index + 3] = 255;
                } else {
                    const index = (y * width + x) * 4;
                    data[index + 3] = 0;
                }
            }
        }

        ctx.putImageData(this.imageData, 0, 0);
    }

    drawColorWheel() {
        const ctx = this.canvas.getContext('2d');
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        if (width === 0 || height === 0) {
            requestAnimationFrame(() => this.drawColorWheel());
            return;
        }

        // Set canvas resolution
        this.canvas.width = width;
        this.canvas.height = height;

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 5;

        // Draw background
        this.drawBackground(ctx, width, height);

        // Draw the current position indicator
        this.drawPositionIndicator(ctx, centerX, centerY, radius);
    }

    drawPositionIndicator(ctx, centerX, centerY, radius) {
        const angle = (this.hue / 360) * 2 * Math.PI - Math.PI;
        const distance = (1 - (this.brightness - 50) / 50) * radius;

        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();
    }

    handleCanvasClick(e) {
        this.isUserInteracting = true;
        this.updateFromEvent(e);
        this.isUserInteracting = false;
    }

    handleMouseDown(e) {
        this.isUserInteracting = true;
        this.updateFromEvent(e);
    }

    handleCanvasTouchStart(e) {
        e.preventDefault();
        this.isUserInteracting = true;
        this.updateFromEvent(e.touches[0]);
    }

    handleCanvasTouchMove(e) {
        e.preventDefault();
        if (this.isUserInteracting) {
            this.updateFromEvent(e.touches[0]);
        }
    }

    handleDocumentMouseMove(e) {
        if (this.isUserInteracting) {
            this.updateFromEvent(e);
        }
    }

    handleDocumentMouseUp(e) {
        this.isUserInteracting = false;
    }

    updateFromEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(rect.width, rect.height) / 2 - 5;

        const dx = x - centerX;
        const dy = y - centerY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        distance = Math.min(distance, radius);

        const angle = Math.atan2(dy, dx);
        this.hue = ((angle + Math.PI) / (2 * Math.PI) * 360) % 360;
        this.brightness = Math.max((1 - distance / radius) * 50 + 50, 50);

        this.drawColorWheel();
        this.onChangeCallback(this.control.id, {
            hue: Math.round(this.hue),
            brightness: Math.round(this.brightness)
        });
    }

    hslToRgb(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    updateUI(value) {
        if (value.hue !== undefined) {
            this.hue = value.hue;
        }
        if (value.brightness !== undefined) {
            this.brightness = value.brightness;
        }
        this.drawColorWheel();
    }
}