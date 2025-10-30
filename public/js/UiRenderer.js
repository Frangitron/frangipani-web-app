import { ButtonControl } from './controls/ButtonControl.js';
import { ColorWheelControl } from './controls/ColorWheelControl.js';
import { FaderControl } from './controls/FaderControl.js';
import { LabelControl } from './controls/LabelControl.js';
import { RadioControl } from './controls/RadioControl.js';
import { SpacerControl } from './controls/SpacerControl.js';


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
                const row = control.placement.row || 0;
                const column = control.placement.column || 0;
                const rowSpan = control.placement.spanRow || 1;
                const colSpan = control.placement.spanColumn || 1;

                if (row + rowSpan > maxRow) maxRow = row + rowSpan;
                if (column + colSpan > maxCol) maxCol = column + colSpan;
            }
        }

        // Set up the grid layout for top-level controls
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
                    const row = control.placement.row || 0;
                    const column = control.placement.column || 0;
                    const rowSpan = control.placement.spanRow || 1;
                    const colSpan = control.placement.spanColumn || 1;

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
        this.controlInstances.set(control.address, controlInstance);
        return element;
    }

    renderGroup(group, onChangeCallback) {
        const template = document.getElementById('group-template');
        const groupElement = template.content.cloneNode(true);

        const header = groupElement.querySelector('.group-header');
        header.textContent = group.label;

        const controlsContainer = groupElement.querySelector('.group-controls');

        // Calculate grid dimensions for controls within group
        let maxRow = 0;
        let maxCol = 0;

        for (let control of group.controls) {
            if (control.type !== 'group') {
                const row = control.placement.row || 0;
                const column = control.placement.column || 0;
                const rowSpan = control.placement.spanRow || 1;
                const colSpan = control.placement.spanColumn || 1;

                if (row + rowSpan > maxRow) maxRow = row + rowSpan;
                if (column + colSpan > maxCol) maxCol = column + colSpan;
            }
        }

        // Set up the grid layout
        if (maxCol > 0) {
            controlsContainer.style.display = 'grid';
            controlsContainer.style.gridTemplateColumns = `repeat(${maxCol}, 1fr)`;
            controlsContainer.style.gridTemplateRows = `repeat(${maxRow}, auto)`;
            controlsContainer.style.gap = 'var(--grid-gap, 8px)';
        }

        // Render each control (including nested groups)
        for (let control of group.controls) {
            const element = this.renderControl(control, onChangeCallback);
            if (element) {
                // Apply grid positioning for non-group controls
                if (control.type !== 'group' && maxCol > 0) {
                    const row = control.placement.row || 0;
                    const column = control.placement.column || 0;
                    const rowSpan = control.placement.spanRow || 1;
                    const colSpan = control.placement.spanColumn || 1;

                    element.style.gridColumn = `${column + 1} / span ${colSpan}`;
                    element.style.gridRow = `${row + 1} / span ${rowSpan}`;
                }

                controlsContainer.appendChild(element);
            }
        }

        return groupElement.firstElementChild || groupElement;
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
            case 'spacer':
                return new SpacerControl(control);
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