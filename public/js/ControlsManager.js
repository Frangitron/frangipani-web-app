export class ControlsManager {
    constructor() {
        this.controls = [];
        this.controlMap = new Map();
    }

    loadControls(controls) {
        this.controls = controls;
        this.buildControlMap(controls);
    }

    buildControlMap(controls) {
        this.controlMap.clear();
        const traverse = (items) => {
            for (let control of items) {
                this.controlMap.set(control.address, control);
                if (control.controls && Array.isArray(control.controls)) {
                    traverse(control.controls);
                }
            }
        };
        traverse(controls);
    }

    getControls() {
        return this.controls;
    }

    updateControl(controlId, value) {
        const control = this.controlMap.get(controlId);
        if (control) {
            if (typeof value === 'object') {
                Object.assign(control, value);
            } else {
                control.value = value;
            }
        }
    }
}