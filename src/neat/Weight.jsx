export default class Weight {
    constructor(sourceNode, destNode)
    {
        this.source = sourceNode || null;
        this.dest = destNode || null;

        // random val from -1 to 1
        this.value = Math.random() * 2 - 1;
    }
}