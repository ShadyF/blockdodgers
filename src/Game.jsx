import React from 'react';
import Ship from './Ship';
import Block from './Block'

const KEY = {
    UP: 37,
    DOWN: 39
};

export class Game extends React.Component {
    constructor() {
        super();
        this.state = {
            screen: {
                width: 500,
                height: 500,
                ratio: window.devicePixelRatio || 1,
            },
            context: null,
            keys: {
                up: 0,
                down: 0,
            },
            score: 0,
        };

        this.ships = [];
        this.blocks = [];
        this.bullets = [];
        this.blockGenInterval = 30;
        this.blockGenCounter = 0;
    }

    handleKeys(value, e) {
        let keys = this.state.keys;
        if (e.keyCode === KEY.UP) keys.up = value;
        if (e.keyCode === KEY.DOWN) keys.down = value;
        this.setState({
            keys: keys
        });
    }

    componentDidMount() {
        window.addEventListener('keyup', this.handleKeys.bind(this, false));
        window.addEventListener('keydown', this.handleKeys.bind(this, true));

        const context = this.refs.canvas.getContext('2d');
        this.setState({context: context});

        this.startGame();

        requestAnimationFrame(() => this.update());
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleKeys);
        window.removeEventListener('resize', this.handleKeys);
    }

    update() {
        if (!this.ships.length) this.gameOver();
        const context = this.state.context;

        this.setState({
            score: this.state.score + 1
        });

        context.save();

        // Render the background
        // Setting globalAlpha to 0.4 gives a motion trail effect
        context.fillStyle = '#000';
        context.globalAlpha = 0.4;
        context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
        context.globalAlpha = 1;

        this.blockGenCounter += 1;

        if (this.blockGenCounter === this.blockGenInterval) {
            this.blockGenCounter = 0;
            this.generateBlock();
        }

        // Check for collisions between the ships and incoming blocks
        this.checkCollisionWithBlocks(this.ships);

        // Remove objects that have been destroyed from their respective lists
        this.cleanUp();

        // Render all objects to the canvas
        this.renderObjects();

        context.restore();

        requestAnimationFrame(() => this.update());
    }

    checkCollisionWithBlocks(objectList) {
        for (let object of objectList) {
            for (let block of this.blocks) {
                let vx = object.position.x - block.position.x;
                let vy = object.position.y - block.position.y;

                // Given that the position coordinates of both objects is their middle point
                // Destroy both objects if distance between them < the addition of the radii
                let length = Math.sqrt(vx * vx + vy * vy);
                if (length < object.size + block.size) {
                    object.destroy();
                    // block.destroy();
                }
            }
        }
    }

    generateBlock() {
        let lastBlock = this.blocks[this.blocks.length - 1];

        let newBlockSize = 15;
        let blockPadding = 5;

        // Generate block above
        if (lastBlock.position.y - lastBlock.size > (newBlockSize * 2) + (blockPadding * 2)) {
            let newBlock = new Block({
                position: {
                    x: this.state.screen.width,
                    y: Game.getRandomInt(blockPadding + newBlockSize, lastBlock.position.y - lastBlock.size - blockPadding)
                },
                size: newBlockSize
            });
            this.blocks.push(newBlock);
        }

        // Generate block below
        if (lastBlock.position.y + lastBlock.size < this.state.screen.height - (newBlockSize * 2 + blockPadding * 2)) {
            let newBlock = new Block({
                position: {
                    x: this.state.screen.width,
                    y: Game.getRandomInt(lastBlock.position.y + lastBlock.size + blockPadding,
                        this.state.screen.height - newBlockSize - blockPadding)
                },
                size: newBlockSize
            });
            this.blocks.push(newBlock);
        }

    }

    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    renderObjects() {
        let objects = [
            this.ships,
            this.blocks,
            this.bullets
        ];

        for (let objectList of objects) {
            for (let i = 0; i < objectList.length; i++)
                objectList[i].render(this.state);
        }
    }

    cleanUp() {
        let objects = [
            this.ships,
            this.blocks,
            this.bullets
        ];

        for (let i = 0; i < objects.length; i++) {
            for (let j = 0; j < objects[i].length; j++)
                if (objects[i][j].destroyed)
                    objects[i].splice(j, 1);
        }
    }

    startGame() {
        this.ships = [];
        this.blocks = [];
        this.bullets = [];
        let ship = new Ship({
            position: {
                x: 40,
                y: this.state.screen.height / 2
            }
        });

        this.ships.push(ship);

        let block = new Block({
            position: {
                x: this.state.screen.width,
                y: 50
            },
            size: 15
        });
        this.blocks.push(block);
    }

    gameOver() {

    }

    render() {
        return (
            <div>
                <span className="score">Score: {this.state.score}</span>
                <canvas ref="canvas"
                        width={this.state.screen.width * this.state.screen.ratio}
                        height={this.state.screen.width * this.state.screen.ratio}
                />
            </div>
        )
    }
}