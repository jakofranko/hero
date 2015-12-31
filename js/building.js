// Constructor for Game.BuildingRepository. This will contain information on size, number of stories, and map (or perhaps 'blueprint') information for drawing the building. Buildings created from templates will ultimately be stored in their lots, and will ultimately be drawn as part of the buildTiles function of lots.
// This will be the constructor class for all buildings, including skyscrapers, houses etc. So, the logic for building out the 'blueprint' of the building will be found in each building's template
// Width and height should not be larger than the 'lot-size' for the game map
// All features will have a blueprint object, which is a collection of z-levels and their respective maps
// Again, this is heavily inspired by Shamus Young's post here: http://www.shamusyoung.com/twentysidedtale/?p=2983
Game.Building = function(properties) {
	if(properties['exactProperties'] === true) {
		this._width = properties['width'];
		this._height = properties['height'];
		this._stories = properties['stories'];
		this._name = properties['name'];
	} else {
		var width = Math.min(Math.round(ROT.RNG.getNormal(properties['width'], 1)), Game.getLotSize());
		var height = Math.min(Math.round(ROT.RNG.getNormal(properties['height'], 1)), Game.getLotSize());
		this._width = width;
		this._height = height;
		this._stories = Math.max(1, Math.round(ROT.RNG.getNormal(properties['stories'], 3)));
		// this.name = Game.Building.randomName();
	}

	this._roomSize = properties['roomSize'] || false;
	this._roomNumber = properties['roomNumber'] || false;
	this._hallwaySize = properties['hallwaySize'] || false;
	this._hallwayNumber = properties['hallwayNumber'] || false;
	this._blueprint = new Array(this._stories);

	this.build = properties['build'] || function() {
		var floor = Game.TileRepository.create('floor');
		var wall = Game.TileRepository.create('wall');
		// Since a building is going to basically be a cube, only need to have one arena object
		var map = new ROT.Map.Arena(this._width, this._height);
		for(var z = 0; z < this._stories; z++) {
			// Initialize a new building story
			var story = new Array(this._width);
			for(i = 0; i < story.length; i++) {
				story[i] = new Array(this._height);
			}

			map.create(function(x, y, value) {
				var tile = value ? wall : floor;
				story[x][y] = tile;
			});
			this._blueprint[z] = story;
		}
	};
};
Game.Building.prototype.getWidth = function() {
	return this._width;
};
Game.Building.prototype.getHeight = function() {
	return this._height;
};
Game.Building.prototype.getMidWidth = function() {
	return Math.round(this._width / 2);
};
Game.Building.prototype.getMidHeight = function() {
	return Math.round(this._height / 2);
};
Game.Building.prototype.getNumberOfStories = function() {
	return this._stories;
};
Game.Building.prototype.getBlueprint = function() {
	return this._blueprint;
};
Game.Building.prototype.getName = function() {
	return this._name;
};