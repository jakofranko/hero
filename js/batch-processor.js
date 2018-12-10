Game.BatchProcessor = function() {
    this._queue = [];
    this._queueSize = 20;
    this._speed = 1;
}

Game.BatchProcessor.prototype.getSpeed = function () {
    return this._speed;
};
Game.BatchProcessor.prototype.act = function () {
    let func;
    for (var i = 0, num = Math.min(this._queue.length, this._queueSize); i < num; i++) {
        func = this._queue[i];
        if (func)
            func();
        else
            throw new Error("Expected a function to be in the queue, but was false");
    }

    this._queue = this._queue.slice(num);
};

Game.BatchProcessor.prototype.add = function (func) {
    this._queue.push(func);
};
