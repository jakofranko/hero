// From http://www.codingcookies.com/2013/04/05/building-a-roguelike-in-javascript-part-3a/
Game.Map = function(width, height, tiles) {
    this._tiles = tiles;
    // cache the width and height based
    // on the length of the dimensions of
    // the tiles array
    this._width = width;
    this._height = height;
};

// Standard getters
Game.Map.prototype.getWidth = function() {
    return this._width;
};
Game.Map.prototype.getHeight = function() {
    return this._height;
};

// Gets the tile for a given coordinate set
Game.Map.prototype.getTile = function(x, y) {
    // Make sure we are inside the bounds. 
    //If we aren't, return null tile.
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
        return Game.Tile.nullTile;
    } else {
    	var key = x + "," + y;
        return this._tiles[key] || Game.Tile.nullTile;
    }
};