export default class Block {
    constructor(args) {
        this.position = args.position;

        this.velocity = {
            x: -4,
            y: 0
        };

        this.width = args.width;
        this.height = args.height;
        this.destroyed = false;
    }

    destroy() {
        this.destroyed = true;
    }

    render(state) {
        this.position.x += this.velocity.x;

        if (this.position.x + this.width < 0) this.destroy();

        const context = state.context;
        context.save();

        context.translate(this.position.x, this.position.y);
        context.strokeStyle = '#900600';
        context.fillStyle = '#000';
        context.lineWidth = 3;
        context.strokeRect(0, 0, this.width, this.height);

        context.restore();
    }
}