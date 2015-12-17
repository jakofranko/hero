Game.Lot = function(properties) {
	properties = properties || {};
	// Call the glyph's constructor with our set of properties
	Game.DynamicGlyph.call(this, properties);

	this._downtown = (typeof properties['downtown'] !== undefined) ? properties['downtown'] : 1;
	this._midtown = (typeof properties['midtown'] !== undefined) ? properties['midtown'] : 1;
	this._uptown = (typeof properties['uptown'] !== undefined) ? properties['uptown'] : 1;
	this._suburbs = (typeof properties['suburbs'] !== undefined) ? properties['suburbs'] : 1;

	this._width = 10;
	this._height = 10;

	this.getTiles;
	if(typeof properties['buildTiles'] === 'function') {
		this.getTiles = properties['buildTiles'];	
	} else {
		this.getTiles = function() {
			var result = [];
			for (var x = 0; x < this._width; x++) {
				result[x] = new Array(this._height);
				for (var y = 0; y < this._height; y++) {
					result[x][y] = Game.TileRepository.create('floorTile');
				};
			};
			return result;
		};
	} 
};
// Make items inherit all the functionality from glyphs
Game.Lot.extend(Game.DynamicGlyph);

// Used during city generation to determine whether or not
// a lot will be placed based on the frequency those lots
// appear in a given neigborhood.
Game.Lot.prototype.willSpawn = function(neighborhood) {
	var spawn;
	switch(neighborhood) {
		case 'downtown':
			spawn = Math.random() <= this._downtown;
			break;
		case 'midtown':
			spawn = Math.random() <= this._midtown;
			break;
		case 'uptown':
			spawn = Math.random() <= this._uptown;
			break;
		case 'suburbs':
			spawn = Math.random() <= this._suburbs;
			break;
		default:
			spawn = false;
			break;
	}
	return spawn;
};