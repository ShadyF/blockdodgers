export default class Neuron {
    constructor() {
        this.net = 0;
        this.out = 0;
        this.incomingWeights = [];
        this.outgoingWeights = [];
        this.activationFunction = null;
    }

    calculateNet() {
        let net = 0;

        for (let weight of this.incomingWeights)
            net += weight.source.out * weight.value;

        return net;
    }

    calculateOut() {
        return this.activationFunction(this.net);
    }
}

export default class Bias extends Neuron{

}