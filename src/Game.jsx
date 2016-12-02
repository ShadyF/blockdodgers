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
            gameOver: false
        };
        this.ships = [];
        this.blocks = [];
        this.bullets = [];

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

        requestAnimationFrame(()=> {
            this.update()
        })
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleKeys);
        window.removeEventListener('resize', this.handleKeys);
    }

    update() {
        // if (!this.ships.length) this.startGame();
        const context = this.state.context;

        context.save();

        context.fillStyle = '#000';
        context.globalAlpha = 0.4;
        context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
        context.globalAlpha = 1;

        this.checkCollisionsWithBlocks(this.ships);
        this.cleanUp();
        this.renderObjects();

        context.restore();

        requestAnimationFrame(() => {
            this.update()
        });

    }

    checkCollisionsWithBlocks(objectList) {
        for (let object of objectList) {
            for (let block of this.blocks) {
                let vx = object.position.x - block.position.x;
                let vy = object.position.y - block.position.y;
                let length = Math.sqrt(vx * vx + vy * vy);
                if (length < object.size + block.size) {
                    object.destroy();
                    block.destroy();
                }
            }
        }
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
                if(objects[i][j].destroyed)
                    objects[i].splice(j, 1);
        }
    }

    startGame() {
        let ship = new Ship({
            position: {
                x: 40,
                y: this.state.screen.height / 2
            }
        });

        this.ships.push(ship);

        this.blocks = this.bullets = [];

        let block = new Block({
            position: {
                x: this.state.screen.width,
                y: 50
            }
        });

        this.blocks.push(block);
    }

    render() {
        return (
            <canvas ref="canvas"
                    width={this.state.screen.width * this.state.screen.ratio}
                    height={this.state.screen.width * this.state.screen.ratio}
            />
        )
    }
}