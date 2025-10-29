export class ButtonControl {
    constructor(control, onChangeCallback) {
        this.control = control;
        this.onChangeCallback = onChangeCallback;
        this.element = null;
        this.button = null;
        this.isToggled = control.value || false;
    }

    render() {
        const template = document.getElementById('button-template');
        this.element = template.content.cloneNode(true).firstElementChild;

        this.button = this.element.querySelector('.button-input');
        this.button.textContent = this.control.label;

        if (this.control.toggleMode) {
            this.updateToggleState();
            this.button.addEventListener('click', () => this.handleToggleClick());
        } else {
            this.button.addEventListener('click', () => this.handlePushClick());
        }

        return this.element;
    }

    handleToggleClick() {
        this.isToggled = !this.isToggled;
        this.updateToggleState();
        this.onChangeCallback(this.control.id, this.isToggled);
    }

    handlePushClick() {
        this.onChangeCallback(this.control.id, true);
    }

    updateToggleState() {
        if (this.isToggled) {
            this.button.classList.add('toggle-active');
        } else {
            this.button.classList.remove('toggle-active');
        }
    }

    updateUI(value) {
        if (this.control.toggleMode) {
            this.isToggled = value;
            this.updateToggleState();
        }
    }
}