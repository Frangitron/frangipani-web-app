export class SpacerControl {
    constructor(control) {
        this.control = control;
    }

    render() {
        const spacer = document.createElement('div');
        spacer.className = 'spacer-control';
        spacer.id = this.control.id;

        // Make it flexible to expand and fill available space
        spacer.style.flex = '1';

        return spacer;
    }
}