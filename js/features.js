// Storage and retrieval for map features
Game.Features = function() {
	// Stores specific building data where the key is the x and y location on the game layout.
	this._storage = {};
};
Game.Features.prototype.set = function(x, y, feature) {
	var key = x + "," + y;
	this._storage[key] = feature;
};
Game.Features.prototype.get = function(x, y) {
	var key = x + "," + y;
	return this.get(key);
};