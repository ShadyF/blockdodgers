import React from 'react';
import Ship from './Ship';

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
        const context = this.state.context;
        context.fillStyle = '#000';
        context.globalAlpha = 0.4;
        context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
        context.globalAlpha = 1;

        this.ships[0].render(this.state);

        requestAnimationFrame(() => {
            this.update()
        });

    }

    startGame() {
        let ship = new Ship({
            position: {
                x: 40,
                y: this.state.screen.height / 2
            }
        });

        this.ships.push(ship);
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