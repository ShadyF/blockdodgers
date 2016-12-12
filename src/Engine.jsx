import React from 'react';
import Ship from './Ship';
import Block from './Block'
import Neurovolution from './Neurovolution'
import Boundary from "./Boundary";
import seedrandom from 'seedrandom';
export class Engine extends React.Component {
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
            maxScore: 0,
            generation: 0,
            shipsAlive: 0
        };
        this.rng = seedrandom(Math.random());
        this.population = 50;
        this.network = [6, [10, 10, 4], 1];
        this.ships = [];
        this.blocks = [];
        this.lowerBoundary = null;
        this.upperBoundary = null;
        this.blockWidth = 20;
        this.boundaryHeight = 50;
        this.blockGenInterval = 100;
        this.blockGenCounter = 0;
        this.neuvol = null;
        this.gen = null;
        this.myrng = null;
    }

    componentDidMount() {
        // Fetch canvas context
        const context = this.refs.canvas.getContext('2d');
        this.setState({context: context});

        // Initialize neurovolution library
        this.neuvol = new Neurovolution({
            population: this.population,
            network: this.network,
            nbChild: 8,
            mutationRate: 0.2,
        });

        this.startGame();

        requestAnimationFrame(() => this.update());
    }

    update() {
        // If not ships alive, restart the game
        if (!this.ships.length) this.startGame();

        // Update the current and max scores
        this.setState({
            score: this.state.score + 1
        });

        if (this.state.score > this.state.maxScore)
            this.setState({
                maxScore: this.state.score
            });

        const context = this.state.context;
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

        // Check if ships collided with a boundary
        this.checkCollisionWithBoundaries(this.ships);

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
                let objectX = object.position.x - object.size + 10;
                let objectY = object.position.y - object.size;

                // Check for collision between two rectangles
                // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
                if (objectX < block.position.x + block.width && objectX + object.size * 2 > block.position.x &&
                    objectY < block.position.y + block.height && objectY + object.size * 2 > block.position.y)
                    object.destroy();
            }
        }
    }

    checkCollisionWithBoundaries(objectList) {
        if (this.lowerBoundary.edgePos == null || this.upperBoundary.edgePos == null)
            return;

        // Check if object is not between the two boundaries
        for (let object of objectList) {
            if (object.position.y + object.size > this.lowerBoundary.edgePos ||
                object.position.y - object.size < this.upperBoundary.edgePos)
                object.destroy();
        }
    }

    generateBlock() {
        if (this.lowerBoundary.edgePos == null || this.upperBoundary.edgePos == null)
            return;

        let spawnSpace = this.state.screen.height - this.boundaryHeight * 2;
        let minBlockHeight = 250;
        let maxBlockHeight = spawnSpace - 80;
        let blockHeight = this.getRandomInt(minBlockHeight, maxBlockHeight);
        let spawnPoint = this.getRandomInt(this.upperBoundary.edgePos, this.lowerBoundary.edgePos - blockHeight);

        let block = new Block({
            position: {
                x: this.state.screen.width,
                y: spawnPoint
            },
            width: this.blockWidth,
            height: blockHeight
        });

        this.blocks.push(block);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(this.myrng() * (max - min)) + min;
    }

    renderObjects() {
        // Render ships
        for (let i = 0; i < this.ships.length; i++) {
            let inputs = this.calculateFOV(this.ships[i]);
            let output = this.gen[i].compute(inputs);
            let keys = {
                up: output[0] > 0.5,
                down: output[0] <= 0.5
            };
            this.ships[i].render(this.state, keys);
        }

        // Render blocks
        for (let block of this.blocks)
            block.render(this.state);

        // Render boundaries
        this.upperBoundary.render(this.state);
        this.lowerBoundary.render(this.state);
    }

    cleanUp() {
        let objects = [
            this.blocks,
            this.boundaries
        ];
        for (let i = 0; i < this.ships.length; i++) {
            if (this.ships[i].destroyed) {
                this.neuvol.networkScore(this.gen[i], this.state.score);
                this.ships.splice(i, 1);
                this.gen.splice(i, 1);

                this.setState({
                    shipsAlive: this.state.shipsAlive - 1
                });
            }
        }
        for (let i = 0; i < objects.length; i++) {
            for (let j = 0; j < objects[i].length; j++)
                if (objects[i][j].destroyed)
                    objects[i].splice(j, 1);
        }
    }

    calculateFOV(ship){
        if(this.blocks.length == 0)
            return [ship.position.y - ship.size, -1, -1, -1];
        let nextBlock = ship.position.x - ship.size > this.blocks[0].position.x + this.blocks[0].width ? this.blocks[1] : this.blocks[0];
        if (!nextBlock)
            return;
        // const ctx = this.state.context;
        // ctx.save();
        // ctx.fillStyle = 'green';
        // ctx.fillRect(ship.position.x, ship.position.y - ship.size, 10, 10); // fill in the pixel at (10,10)
        // ctx.restore();
        return [ship.position.y - ship.size, nextBlock.position.x, nextBlock.position.y, nextBlock.height,
            nextBlock.position.y - this.upperBoundary.edgePos > 30, this.lowerBoundary.edgePos - (nextBlock.position.y + nextBlock.height)  > 30]
    }

    startGame() {
        // Reset all the arrays
        this.ships = [];
        this.blocks = [];
        this.boundaries = [];
        this.blockGenCounter = 0;
        this.myrng = seedrandom(this.rng);
        // Reset our componenet's state
        this.setState({
            score: 0,
            generation: this.state.generation + 1,
            shipsAlive: this.population
        });

        // Fetch next batch of networks
        this.gen = this.neuvol.nextGeneration();

        // Create upper and lower boundaries of the game
        this.upperBoundary = new Boundary({
            height: this.boundaryHeight,
            position: 'top'
        });

        this.lowerBoundary = new Boundary({
            height: this.boundaryHeight,
            position: 'bottom'
        });

        this.generateBlock();

        // Create a ship for each network
        for (let i = 0; i < this.gen.length; i++) {
            let ship = new Ship({
                position: {
                    x: 40,
                    y: this.state.screen.height / 2
                }
            });
            this.ships.push(ship);
        }

    }

    render() {
        return (
            <div>
                <span className="score">Score: {this.state.score}</span>
                <span className="max-score">Max Score: {this.state.maxScore}</span>
                <span className="generation">Generation: {this.state.generation}</span>
                <span className="ships-alive">Ships Alive: {this.state.shipsAlive} / {this.population} </span>
                <canvas ref="canvas"
                        width={this.state.screen.width * this.state.screen.ratio}
                        height={this.state.screen.width * this.state.screen.ratio}
                />
            </div>
        )
    }
}