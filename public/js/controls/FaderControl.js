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
        this.input.addEventListener('touchstart', () => { this.isUserInteracting = true; });
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
}