Game.Item = function(properties) {
	properties = properties || {};
	// Call the glyph's constructor with our set of properties
	Game.DynamicGlyph.call(this, properties);
	// Instantiate any properties from the passed object
	this._name = properties['name'] || '';
	this._description = properties['description'] || '';
};
// Make items inherit all the functionality from glyphs
Game.Item.extend(Game.DynamicGlyph);

Game.Item.prototype.getDescription = function() {
    return this._description;
};