export default class Boundary {
    constructor(args) {
        this.height = args.height;
        this.position = args.position;
    }

    render(state) {
        const context = state.context;
        context.save();

        context.strokeStyle = '#900600';
        context.fillStyle = 'green';
        context.lineWidth = 3;
        if(this.position == 'top')
            context.fillRect(0, 0, state.screen.width, this.height);
        else if(this.position == 'bottom')
            context.fillRect(0, state.screen.height - this.height, state.screen.width, this.height);

        context.restore();
    }
}