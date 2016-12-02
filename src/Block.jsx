export default class Block {
    constructor(args) {
        this.position = args.position;

        this.velocity = {
            x: -2,
            y: 0
        };

        this.size = 15;
        this.destroyed = false;
    }

    destroy() {
        this.destroyed = true;
    }

    render(state) {
        this.position.x += this.velocity.x;

        if (this.position.x + this.size < 0) this.destroy();

        const context = state.context;
        context.save();

        context.translate(this.position.x - this.size, this.position.y - this.size);
        context.strokeStyle = '#ba0d0d';
        context.fillStyle = '#000';
        context.lineWidth = 3;
        context.strokeRect(0, 0, this.size * 2, this.size * 2);

        context.restore();
    }
}