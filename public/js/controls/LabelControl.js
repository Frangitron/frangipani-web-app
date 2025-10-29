export class LabelControl {
    constructor(control) {
        this.control = control;
        this.element = null;
    }

    render() {
        const template = document.getElementById('label-template');
        this.element = template.content.cloneNode(true).firstElementChild;

        const textElement = this.element.querySelector('.label-text');
        textElement.textContent = this.control.text;

        return this.element;
    }
}