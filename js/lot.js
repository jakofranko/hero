Game.Lot = function(properties) {
	properties = properties || {};
	// Call the glyph's constructor with our set of properties
	Game.DynamicGlyph.call(this, properties);

	this._downtown = (typeof properties['downtown'] !== undefined) ? properties['downtown'] : 1;
	this._midtown = (typeof properties['midtown'] !== undefined) ? properties['midtown'] : 1;
	this._uptown = (typeof properties['uptown'] !== undefined) ? properties['uptown'] : 1;
	this._suburbs = (typeof properties['suburbs'] !== undefined) ? properties['suburbs'] : 1;
	this._orientation = properties['orientation'] || false;

	this._width = properties['width'] || Game.getLotSize();
	this._height = properties['height'] || Game.getLotSize();

	this.getTiles;
	if(typeof properties['buildTiles'] === 'function') {
		this.getTiles = properties['buildTiles'];	
	} else {
		this.getTiles = function() {
			return this.fillLot('floor');
		};
	} 
};
// Make items inherit all the functionality from glyphs
Game.Lot.extend(Game.DynamicGlyph);

Game.Lot.prototype.setOrientation = function(orientation) {
	this._orientation = orientation;
};

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
Game.Lot.prototype.fillLot = function(tile, extraProperties) {
	var result = [];
	var fill = null;
	// If no extra properties, then just create one generic tile
	if(!extraProperties) {
		fill = Game.TileRepository.create(tile);
	}

	for (var x = 0; x < this._width; x++) {
		result[x] = new Array(this._height);
		for (var y = 0; y < this._height; y++) {
			// If we've created a fill, populate the lot with that tile
			if(fill) {
				result[x][y] = fill;
			} else {
				// Otherwise create a new tile every time
				result[x][y] = Game.TileRepository.create(tile, extraProperties);
			}
		};
	};
	return result;
};