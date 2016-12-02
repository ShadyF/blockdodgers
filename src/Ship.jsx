export default class Ship {
    constructor(args) {
        this.position = args.position;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.speed = 0.5;
        this.inertia = 0.95;
        this.size = 25;
    }

    render(state) {
        if (state.keys.up)
            this.velocity.y -= this.speed;
        else if (state.keys.down)
            this.velocity.y += this.speed;

        this.position.y += this.velocity.y;
        this.velocity.y *= this.inertia;

        // Screen edges handling
        if (this.position.y + this.size > state.screen.height) {
            this.position.y = state.screen.height - this.size;
            this.velocity.y = 0;
        }

        else if (this.position.y - this.size < 0) {
            this.position.y = this.size;
            this.velocity.y = 0;
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