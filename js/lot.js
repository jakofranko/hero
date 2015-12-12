Game.Lot = function(properties) {
	properties = properties || {};
	// Call the glyph's constructor with our set of properties
	Game.DynamicGlyph.call(this, properties);

	this._downtown = template['downtown'] || 1;
	this._midtown = template['midtown'] || 1;
	this._uptown = template['uptown'] || 1;
	this._suburbs = template['suburbs'] || 1;
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