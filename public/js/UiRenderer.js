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
        // Calculate grid dimensions for top-level controls
        let maxRow = 0;
        let maxCol = 0;

        for (let control of controls) {
            if (control.type !== 'group') {
                const row = control.row || 0;
                const column = control.column || 0;
                const rowSpan = control.rowSpan || 1;
                const colSpan = control.colSpan || 1;

                if (row + rowSpan > maxRow) maxRow = row + rowSpan;
                if (column + colSpan > maxCol) maxCol = column + colSpan;
            }
        }

        // Set up grid layout for top-level controls
        if (maxCol > 0) {
            container.style.display = 'grid';
            container.style.gridTemplateColumns = `repeat(${maxCol}, 1fr)`;
            container.style.gridTemplateRows = `repeat(${maxRow}, auto)`;
            container.style.gap = 'var(--grid-gap, 8px)';
        }

        // Render controls
        for (let control of controls) {
            const element = this.renderControl(control, onChangeCallback);
            if (element) {
                // Apply grid positioning for non-group controls
                if (control.type !== 'group' && maxCol > 0) {
                    const row = control.row || 0;
                    const column = control.column || 0;
                    const rowSpan = control.rowSpan || 1;
                    const colSpan = control.colSpan || 1;

                    element.style.gridColumn = `${column + 1} / span ${colSpan}`;
                    element.style.gridRow = `${row + 1} / span ${rowSpan}`;
                }

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

        // Create grid layout for controls within group
        this.createGridLayout(controlsContainer, group.controls, onChangeCallback);

        return groupElement;
    }

    createGridLayout(container, controls, onChangeCallback) {
        // Calculate grid dimensions
        let maxRow = 0;
        let maxCol = 0;

        for (let control of controls) {
            const row = control.row || 0;
            const column = control.column || 0;
            const rowSpan = control.rowSpan || 1;
            const colSpan = control.colSpan || 1;

            if (row + rowSpan > maxRow) maxRow = row + rowSpan;
            if (column + colSpan > maxCol) maxCol = column + colSpan;
        }

        // Set up grid container
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${maxCol}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${maxRow}, auto)`;
        container.style.gap = 'var(--grid-gap, 8px)';

        // Render each control with grid positioning
        for (let control of controls) {
            const controlInstance = this.createControlInstance(control, onChangeCallback);
            const element = controlInstance.render();

            if (element) {
                const row = control.row || 0;
                const column = control.column || 0;
                const rowSpan = control.rowSpan || 1;
                const colSpan = control.colSpan || 1;

                // Apply grid positioning
                element.style.gridColumn = `${column + 1} / span ${colSpan}`;
                element.style.gridRow = `${row + 1} / span ${rowSpan}`;

                this.controlInstances.set(control.id, controlInstance);
                container.appendChild(element);
            }
        }
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