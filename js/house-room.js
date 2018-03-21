Game.HouseRoom = function(name) {
    this.roomSizes = {
        'foyer': [3, 4],
        'dining room': [8, 10],
        'living room': [8, 10],
        'kitchen': [8, 10],
        'office': [7, 10],
        'hall': [3, 5],
        'bathroom': [5, 7],
        'bedroom': [7, 11],
        'closet': [3, 3],
    };

    this.name = name;
    this.x = 0;
    this.y = 0;
    this._z = 0;
    this.width = Game.getRandomInRange(this.roomSizes[name][0], this.roomSizes[name][1]);
    this.height = Game.getRandomInRange(this.roomSizes[name][0], this.roomSizes[name][1]);
    this.spawnDirection = null;
    this.parent = null;
    this.children = [];
    this._placed = true;
}

Object.defineProperty(Game.HouseRoom.prototype, 'z', {
    get: function() {
        return this._z;
    },
    set: function(z) {
        this._z = z;
        this.children.forEach(child => child.z = z);
    }
});

Object.defineProperty(Game.HouseRoom.prototype, 'placed', {
    get: function() {
        return this._placed;
    },
    set: function(placed) {
        this._placed = placed;
        this.children.forEach(child => child.placed = placed);
    }
});

Game.HouseRoom.prototype.addChild = function(child) {
    if(child !== false) {
        child.parent = this;
        this.children.push(child);
    }
}
