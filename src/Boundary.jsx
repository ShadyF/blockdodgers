export default class Boundary {
    constructor(args) {
        this.height = args.height;
        this.position = args.position;
        this.edgePos = null;
        if (this.position == 'top') {
            this.edgePos = this.height;
        }
        else if (this.position == 'bottom') {
            this.edgePos = 500 - this.height;
        }
    }

    render(state) {
        const context = state.context;
        context.save();

        context.strokeStyle = '#900600';
        context.fillStyle = '#900600';
        context.lineWidth = 3;

        if (this.position == 'top') {
            context.fillRect(0, 0, state.screen.width, this.height);
            this.edgePos = this.height;
        }
        else if (this.position == 'bottom') {
            context.fillRect(0, state.screen.height - this.height, state.screen.width, this.height);
            this.edgePos = state.screen.height - this.height;
        }

        context.restore();
    }
}