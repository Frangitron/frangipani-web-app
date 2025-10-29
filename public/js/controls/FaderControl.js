export class FaderControl {
    constructor(control, onChangeCallback) {
        this.control = control;
        this.onChangeCallback = onChangeCallback;
        this.element = null;
        this.input = null;
        this.valueDisplay = null;
        this.isUserInteracting = false;
    }

    render() {
        const template = document.getElementById('fader-template');
        this.element = template.content.cloneNode(true).firstElementChild;

        const label = this.element.querySelector('.control-label');
        label.textContent = this.control.label;

        this.input = this.element.querySelector('.fader-input');
        this.input.min = this.control.min || 0;
        this.input.max = this.control.max || 100;
        this.input.value = this.control.value;

        this.valueDisplay = this.element.querySelector('.fader-value');
        this.updateValueDisplay();

        this.input.addEventListener('input', () => this.handleInput());
        this.input.addEventListener('mousedown', () => { this.isUserInteracting = true; });
        this.input.addEventListener('mouseup', () => { this.isUserInteracting = false; });
        this.input.addEventListener('touchstart', (e) => {
            this.isUserInteracting = true;
            this.updateValueFromTouch(e);
        });
        this.input.addEventListener('touchmove', (e) => {
            this.updateValueFromTouch(e);
        })
        this.input.addEventListener('touchend', () => { this.isUserInteracting = false; });

        return this.element;
    }

    handleInput() {
        const value = parseInt(this.input.value);
        this.updateValueDisplay();
        this.onChangeCallback(this.control.id, value);
    }

    updateValueDisplay() {
        this.valueDisplay.textContent = `${this.input.value}`;
    }

    updateUI(value) {
        if (!this.isUserInteracting) {
            this.input.value = value;
            this.updateValueDisplay();
        }
    }

    updateValueFromTouch(e) {
        const touch = e.touches[0];
        const rect = this.input.getBoundingClientRect();
        const percent = (touch.clientX - rect.left) / rect.width;
        const value = this.control.min || 0;
        const max = this.control.max || 100;
        const min = this.control.min || 0;
        const newValue = Math.round(min + percent * (max - min));
        const clampedValue = Math.max(min, Math.min(max, newValue));

        this.input.value = clampedValue;
        this.handleInput();
    }
}