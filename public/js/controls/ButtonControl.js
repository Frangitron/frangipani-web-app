export class ButtonControl {
    constructor(control, onChangeCallback) {
        this.control = control;
        this.onChangeCallback = onChangeCallback;
        this.element = null;
        this.button = null;
        this.isPressed = control.value || false;
    }

    render() {
        const template = document.getElementById('button-template');
        this.element = template.content.cloneNode(true).firstElementChild;

        this.button = this.element.querySelector('.button-input');
        this.button.textContent = this.control.label;

        if (this.control.toggleMode) {
            this.updateToggleState();
            this.button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.handleToggle();
            });
            this.button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleToggle();
            });
        } else {
            this.button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.handlePush();
            });
            this.button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handlePush();
            });
            this.button.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.handleRelease();
            });
            this.button.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleRelease();
            })
        }

        return this.element;
    }

    _update() {
        this.updateToggleState();
        this.onChangeCallback(this.control.id, this.isPressed);
    }

    handleToggle() {
        this.isPressed = !this.isPressed;
        this._update();
    }

    handlePush() {
        this.isPressed = true;
        this._update();

    }

    handleRelease() {
        this.isPressed = false;
        this._update();
    }

    updateToggleState() {
        if (this.isPressed) {
            this.button.classList.add('toggle-active');
        } else {
            this.button.classList.remove('toggle-active');
        }
    }

    updateUI(value) {
        this.isPressed = value;
        this.updateToggleState();
    }
}