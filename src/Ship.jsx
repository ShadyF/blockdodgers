export default class Ship {
    constructor(args) {
        this.position = args.position;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.speed = 7;
        this.size = 10;
        this.destroyed = false;
    }

    destroy() {
        this.destroyed = true;
    }

    render(state, keys) {
        this.velocity.y = 0;
        if (keys.up)
            this.velocity.y -= this.speed;
        if (keys.down)
            this.velocity.y += this.speed;

        this.position.y += this.velocity.y;

        // Screen edges handling
        if (this.position.y > state.screen.height) {
            this.destroy()
        }

        else if (this.position.y  < 0) {
            this.destroy();
        }

        const context = state.context;
        context.save();

        // Draw the ship
        context.translate(this.position.x, this.position.y);
        context.rotate(90 * Math.PI / 180);
        context.strokeStyle = '#ffffff';
        context.fillStyle = '#000000';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(0, -15);
        context.lineTo(10, 10);
        context.lineTo(5, 7);
        context.lineTo(-5, 7);
        context.lineTo(-10, 10);
        context.closePath();
        context.fill();
        context.stroke();

        context.restore();
    }
}