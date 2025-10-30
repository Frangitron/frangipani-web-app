export class RadioControl {
    constructor(control, onChangeCallback) {
        this.control = control;
        this.onChangeCallback = onChangeCallback;
        this.element = null;
        this.options = control.options || [];
        this.currentValue = control.value;
        this.optionElements = [];
    }

    render() {
        const template = document.getElementById('radio-template');
        this.element = template.content.cloneNode(true).firstElementChild;

        const label = this.element.querySelector('.control-label');
        label.textContent = this.control.label;

        const optionsContainer = this.element.querySelector('.radio-options');

        let index = 0;
        for (let option of this.options) {
            const optionElement = document.createElement('div');
            optionElement.className = 'radio-option';
            optionElement.textContent = option;

            if (index === this.currentValue) {
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

            this.optionElements.push(optionElement);
            optionsContainer.appendChild(optionElement);
            index++;
        }

        return this.element;
    }

    handleOptionChange(option, element) {
        // Remove active from all
        this.optionElements.forEach(el => el.classList.remove('active'));

        // Add active to the touched element
        element.classList.add('active');

        this.currentValue = this.options.indexOf(option);
        this.onChangeCallback(this.control.address, this.currentValue);
    }

    updateUI(value) {
        // Remove active from all
        this.optionElements.forEach(el => el.classList.remove('active'));

        // Add active to new value
        this.optionElements[value].classList.add('active');
        this.currentValue = value;
    }
}