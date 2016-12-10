import React from 'react';
import Ship from './Ship';
import Block from './Block'
import Neurovolution from './Neurovolution'
import Boundary from "./Boundary";

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

        this.population = 50;
        this.network = [3, [4], 2];
        this.ships = [];
        this.blocks = [];
        this.lowerBoundary = null;
        this.upperBoundary = null;
        this.boundaryHeight = 50;
        this.blockGenInterval = 25;
        this.blockGenCounter = 0;
        this.neuvol = null;
        this.gen = null;
    }

    componentDidMount() {
        // Fetch canvas context
        const context = this.refs.canvas.getContext('2d');
        this.setState({context: context});

        // Initialize neurovolution library
        this.neuvol = new Neurovolution({
            population: this.population,
            network: this.network
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
        let lastBlock = this.blocks[this.blocks.length - 1];

        let newBlockSize = 15;
        let blockPadding = 15;

        // Generate block above
        if (lastBlock.position.y - lastBlock.size > (newBlockSize * 2) + (blockPadding * 2)) {
            let newBlock = new Block({
                position: {
                    x: this.state.screen.width,
                    y: Engine.getRandomInt(blockPadding + newBlockSize, lastBlock.position.y - lastBlock.size - blockPadding)
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
                    y: Engine.getRandomInt(lastBlock.position.y + lastBlock.size + blockPadding,
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

        // Render ships
        for (let i = 0; i < this.ships.length; i++) {
            let inputs = this.calculateFOV(this.ships[i]);
            let output = this.gen[i].compute(inputs);
            let keys = {
                up: output[0] > 0.5,
                down: output[1] > 0.5
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

    calculateFOV(ship) {
        // FOV
        // * *
        // > *
        // * *
        let fovRange = 40;
        let rayWidth = 40;
        let blocks = [this.blocks[0], this.blocks[1], this.blocks[2], this.blocks[3], this.blocks[4], this.blocks[5]];

        let topQuad = false;
        let topRightQuad = false;
        let frontQuad = false;
        let bottomRightQuad = false;
        let bottomQuad = false;

        // Check top quad
        for (let block of blocks) {
            if (!block)
                break;

            let upperRay = ship.position.y - ship.size - fovRange;

            let blockDetected = (block.position.y + block.size) > upperRay &&
                (block.position.y + block.size) < ship.position.y - ship.size &&
                (block.position.x - block.size) < ship.position.x + ship.size + rayWidth &&
                (block.position.x + block.size) > ship.position.x - ship.size;

            if (blockDetected || upperRay < 0) {
                topQuad = true;
                break;
            }
        }

        // Check in front
        for (let block of blocks) {
            if (!block)
                break;

            let frontRay = ship.position.x + ship.size + fovRange;

            let blockDetected = ((block.position.x - block.size) < frontRay) &&
                (block.position.y - block.size) < ship.position.y + ship.size &&
                (block.position.y + block.size) > ship.position.y - ship.size;

            if (blockDetected) {
                frontQuad = true;
                break;
            }

        }

        // Check for lower quad
        for (let block of blocks) {
            if (!block)
                break;

            let lowerRay = ship.position.y + ship.size + fovRange;

            let blockDetected = (block.position.y - block.size) < lowerRay &&
                (block.position.y - block.size) > ship.position.y + ship.size &&
                (block.position.x - block.size) < ship.position.x + ship.size + rayWidth &&
                (block.position.x + block.size) > ship.position.x - ship.size;

            if (blockDetected || lowerRay > this.state.screen.height) {
                bottomQuad = true;
                break;
            }
        }

        return [topQuad, frontQuad, bottomQuad];
    }

    startGame() {
        // Reset all the arrays
        this.ships = [];
        this.blocks = [];
        this.boundaries = [];

        // Reset our componenet's state
        this.setState({
            score: 0,
            generation: this.state.generation + 1,
            shipsAlive: this.population
        });

        // Fetch next batch of networks
        this.gen = this.neuvol.nextGeneration();

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

        // Create upper and lower boundaries of the game
        this.upperBoundary = new Boundary({
            height: this.boundaryHeight,
            position: 'top'
        });

        this.lowerBoundary = new Boundary({
            height: this.boundaryHeight,
            position: 'bottom'
        });


        let block = new Block({
            position: {
                x: this.state.screen.width,
                y: 200
            },
            size: 15
        });
        this.blocks.push(block);
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