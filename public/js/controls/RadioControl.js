export class RadioControl {
    constructor(control, onChangeCallback) {
        this.control = control;
        this.onChangeCallback = onChangeCallback;
        this.element = null;
        this.options = control.options || [];
        this.currentValue = control.value;
        this.optionElements = new Map();
    }

    render() {
        const template = document.getElementById('radio-template');
        this.element = template.content.cloneNode(true).firstElementChild;

        const label = this.element.querySelector('.control-label');
        label.textContent = this.control.label;

        const optionsContainer = this.element.querySelector('.radio-options');

        for (let option of this.options) {
            const optionElement = document.createElement('div');
            optionElement.className = 'radio-option';
            optionElement.textContent = option;

            if (option === this.currentValue) {
                optionElement.classList.add('active');
            }

            optionElement.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.handleOptionChange(option, optionElement)
            });
            optionElement.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleOptionChange(option, optionElement)
            });

            this.optionElements.set(option, optionElement);
            optionsContainer.appendChild(optionElement);
        }

        return this.element;
    }

    handleOptionChange(option, element) {
        // Remove active from all
        this.optionElements.forEach(el => el.classList.remove('active'));

        // Add active to clicked
        element.classList.add('active');

        this.currentValue = option;
        this.onChangeCallback(this.control.id, option);
    }

    updateUI(value) {
        // Remove active from all
        this.optionElements.forEach(el => el.classList.remove('active'));

        // Add active to new value
        const element = this.optionElements.get(value);
        if (element) {
            element.classList.add('active');
        }

        this.currentValue = value;
    }
}