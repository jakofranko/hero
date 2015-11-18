// Buildings will include information on how they are drawn on the player's map, their layout legend character, how many stories they have, and their layout, as well as logic for drawing a particular z-level.
// Width and height should not be larger than the 'lot-size' for the game map, which is 10
// All features will have a blueprint object, which is a collection of z-levels and their respective maps
// Again, this is heavily inspired by Shamus Young's post here: http://www.shamusyoung.com/twentysidedtale/?p=2983
Game.Feature = function() {
	this.ch = "";
	this._blueprint = {};
};
Game.Feature.prototype.get = function(x, y, z) {
	var key = x + "," + y;
	return this._blueprint[z][key];
};

Game.Feature.Building = function() {
	var hw = ROT.RNG.getNormal(5, 1);
	this._width = hw;
	this._height = hw;
	this._stories = ROT.RNG.getNormal(5, 3);
	this.ch = "B";
	this.name = Game.Feature.Building.randomName();
	this._blueprint = {};
};