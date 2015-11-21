// From http://www.codingcookies.com/2013/04/05/building-a-roguelike-in-javascript-part-3a/
// Base prototype for representing 'tiles', which are environment characters that contain glyphs, and other information such as whether or not the tile is walkable or not.
Game.Tile = function(properties) {
	properties = properties || {};
    // Call the Glyph constructor with our properties
    Game.Glyph.call(this, properties);
    // Set up the properties. We use false by default.
    this._isWalkable = properties['isWalkable'] || false;
    this._isDiggable = properties['isDiggable'] || false;
};
// Make tiles inherit all the functionality from glyphs
Game.Tile.extend(Game.Glyph);

// Standard getters
Game.Tile.prototype.isWalkable = function() {
    return this._isWalkable;
}
Game.Tile.prototype.isDiggable = function() {
    return this._isDiggable;
}

// Tiles
Game.Tile.nullTile = new Game.Tile({});
Game.Tile.floorTile = new Game.Tile({
    character: '.',
    isWalkable: true
});
Game.Tile.wallTile = new Game.Tile({
	character: '#',
	foreground: 'goldenrod',
	isDiggable: true
});