// From http://www.codingcookies.com/2013/04/05/building-a-roguelike-in-javascript-part-3a/
// Base prototype for representing 'tiles', which are environment characters that contain glyphs, and other information such as whether or not the tile is walkable or not.
Game.Tile = function(glyph) {
	this._glyph = glyph;
};
Game.Tile.prototype.getGlyph = function() {
	return this._glyph;
};

// Tiles
Game.Tile.nullTile = new Game.Tile(new Game.Glyph());
Game.Tile.floorTile = new Game.Tile(new Game.Glyph('.'));
Game.Tile.wallTile = new Game.Tile(new Game.Glyph('#', 'goldenrod'));