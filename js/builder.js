Game.Builder = function(width, height, depth) {
	this._width = width;
	this._height = height;
	this._depth = depth;
	this._tiles = new Array(depth);
	this._regions = new Array(depth);

	// Instantiate the arrays to be multi-dimension
    for (var z = 0; z < depth; z++) {
        // Create a new cave at each level
        this._tiles[z] = this._generateLevel();
        // Setup the regions array for each depth
        this._regions[z] = new Array(width);
        for (var x = 0; x < width; x++) {
            this._regions[z][x] = new Array(height);
            // Fill with zeroes
            for (var y = 0; y < height; y++) {
                this._regions[z][x][y] = 0;
            }
        }
    }
};
Game.Builder.prototype._generateLevel = function() {
    // Create the empty map
    var map = new Array(this._width);
    for (var w = 0; w < this._width; w++) {
        map[w] = new Array(this._height);
    }
    // Setup the cave generator
    var generator = new ROT.Map.Cellular(this._width, this._height);
    generator.randomize(0.5);
    var totalIterations = 3;
    // Iteratively smoothen the map
    for (var i = 0; i < totalIterations - 1; i++) {
        generator.create();
    }
    // Smoothen it one last time and then update our map
    generator.create(function(x,y,v) {
        if (v === 1) {
            map[x][y] = Game.Tile.floorTile;
        } else {
            map[x][y] = Game.Tile.wallTile;
        }
    });
    return map;
};
Game.Builder.prototype._canFillRegion = function(x, y, z) {
	if(x < 0 || y < 0 || z < 0 || x >= this._width ||
        y >= this._height || z >= this._depth) {
		return false;
	}
	// Make sure the tile does not already have a region
	if(this._regions[z][x][y] != 0) {
		return false;
	}
	// Make sure this tile is walkable
	return this._regions[z][x][y].isWalkable();
};
Game.Builder.prototype._fillRegion = function(region, x, y, z) {
	var tilesFilled = 1;
	var tiles = [{x:x, y:y}];
	var tile;
	var neighbors;

	// Update the region of the original tile
	this._regions[z][x][y] = region;
	// Loop while we still have tiles
	while(tiles.length > 0) {
		tile = tiles.pop();
		// Get the neighbors of the tile
		neighbors = Game.getNeighborPosition(tile.x, tile.y);
		// Iterate through each neighbor, checking if we can use it to fill
        // and if so updating the region and adding it to our processing list.
        while (neighbors.length > 0) {
            tile = neighbors.pop();
            if (this._canFillRegion(tile.x, tile.y, z)) {
                this._regions[z][tile.x][tile.y] = region;
                tiles.push(tile);
                tilesFilled++;
            }
        }
	}
};