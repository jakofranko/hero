Game.Item = function(properties) {
	properties = properties || {};
	// Call the glyph's constructor with our set of properties
	Game.DynamicGlyph.call(this, properties);
	// Instantiate any properties from the passed object
	this._name = properties['name'] || '';
	this._description = properties['description'] || '';
    this._location = null;
};
// Make items inherit all the functionality from glyphs
Game.Item.extend(Game.DynamicGlyph);

Game.Item.prototype.getDescription = function() {
    return this._description;
};

Game.Item.prototype.getLocation = function() {
    return this._location;
};
Game.Item.prototype.setLocation = function(location) {
    this._location = location;
};