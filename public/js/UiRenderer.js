import { FaderControl } from './controls/FaderControl.js';
import { ButtonControl } from './controls/ButtonControl.js';
import { ColorWheelControl } from './controls/ColorWheelControl.js';
import { RadioControl } from './controls/RadioControl.js';
import { LabelControl } from './controls/LabelControl.js';

export class UIRenderer {
    constructor() {
        this.controlInstances = new Map();
    }

    renderControls(container, controls, onChangeCallback) {
        for (let control of controls) {
            const element = this.renderControl(control, onChangeCallback);
            if (element) {
                container.appendChild(element);
            }
        }
    }

    renderControl(control, onChangeCallback) {
        if (control.type === 'group') {
            return this.renderGroup(control, onChangeCallback);
        }

        const controlInstance = this.createControlInstance(control, onChangeCallback);
        const element = controlInstance.render();
        this.controlInstances.set(control.id, controlInstance);
        return element;
    }

    renderGroup(group, onChangeCallback) {
        const template = document.getElementById('group-template');
        const groupElement = template.content.cloneNode(true);

        const header = groupElement.querySelector('.group-header');
        header.textContent = group.label;

        const controlsContainer = groupElement.querySelector('.group-controls');

        for (let control of group.controls) {
            const controlInstance = this.createControlInstance(control, onChangeCallback);
            const element = controlInstance.render();
            this.controlInstances.set(control.id, controlInstance);
            controlsContainer.appendChild(element);
        }

        return groupElement;
    }

    createControlInstance(control, onChangeCallback) {
        switch (control.type) {
            case 'fader':
                return new FaderControl(control, onChangeCallback);
            case 'button':
                return new ButtonControl(control, onChangeCallback);
            case 'colorwheel':
                return new ColorWheelControl(control, onChangeCallback);
            case 'radio':
                return new RadioControl(control, onChangeCallback);
            case 'label':
                return new LabelControl(control);
            default:
                console.warn(`Unknown control type: ${control.type}`);
                return null;
        }
    }

    updateControlUI(controlId, value) {
        const controlInstance = this.controlInstances.get(controlId);
        if (controlInstance && controlInstance.updateUI) {
            controlInstance.updateUI(value);
        }
    }
}