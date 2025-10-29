export class ControlsManager {
    constructor() {
        this.controls = [];
        this.clientId = null;
        this.controlMap = new Map();
    }

    setClientId(clientId) {
        this.clientId = clientId;
    }

    loadControls(controls) {
        this.controls = controls;
        this.buildControlMap(controls);
    }

    buildControlMap(controls) {
        this.controlMap.clear();
        const traverse = (items) => {
            for (let control of items) {
                this.controlMap.set(control.id, control);
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

    getControl(controlId) {
        return this.controlMap.get(controlId);
    }
}