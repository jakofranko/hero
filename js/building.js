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
		this._roomNumber = properties['roomNumber'] || false;
		this._name = properties['name'];
	} else {
		var width = Math.min(Math.round(ROT.RNG.getNormal(properties['width'], 1)), Game.getLotSize());
		var height = Math.min(Math.round(ROT.RNG.getNormal(properties['height'], 1)), Game.getLotSize());
		this._width = width;
		this._height = height;
		this._stories = Math.max(1, Math.round(ROT.RNG.getNormal(properties['stories'], 3)));
		this._roomNumber = Math.max(0, Math.round(ROT.RNG.getNormal(properties['roomNumber'], 3))) || false;
		// this.name = Game.Building.randomName();
	}

	this._roomSize = properties['roomSize'] || false; // Squared; so room size 3 will be a 3x3 room.
	this._hallwaySize = properties['hallwaySize'] || false;
	this._hallwayNumber = properties['hallwayNumber'] || false;

	// Initialize blueprint
	this._blueprint = new Array(this._stories);

	this._createBlueprint = properties['createBlueprint'] || function() {
		var floor = Game.TileRepository.create('floor');
		var wall = Game.TileRepository.create('brick wall', {
			foreground: ['#ab2e34', '#580004', '#e1de9d', '#d5d0dd'].random()
		});
		var door = Game.TileRepository.create('door');
		// As this will be going on the outside wall, designate it as such
		door.setOuterWall(true);

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

			// If it's the first floor, place doors
			if(z == 0) {
				var side = Math.floor(Math.random() * 4) + 1;
				var x, y;
				switch(side) {
					case 1:
						x = 0;
						y = this.getMidHeight();
						break;
					case 2:
						x = this.getMidWidth();
						y = 0;
						break;
					case 3:
						x = this.getWidth() - 1;
						y = this.getMidHeight();
						break;
					case 4:
					default:
						x = this.getMidWidth();
						y = this.getHeight() - 1;
						break;
				}
				story[x][y] = door;
			}

			this._blueprint[z] = story;
		}
	};
	this._placeRooms = properties['placeRooms'] || function() {
		for (var z = 0; z < this._blueprint.length; z++) {
			var newFloor = this._sliceMethod(this._blueprint[z]);
			this._blueprint[z] = newFloor;
		};
	};
	this._placeStairs = properties['placeStairs'] || function() {
		var stairsUp = Game.TileRepository.create('stairsUp');
		var stairsDown = Game.TileRepository.create('stairsDown');
		var horizontalWall = Game.TileRepository.create('indoor wall-horizontal');
		var verticalWall = Game.TileRepository.create('indoor wall-vertical');
		var floor = Game.TileRepository.create('floor');

		// Stairwell width and height, big enough to surround an up and down
		// stair with an inner wall on two sides
		var sWidth = 3;
		var sHeight = 4;

		// Depending on the corner, assign the top left corner to start
		// drawing where the stairs will be placed on the blueprint
		var corner = Game.getRandomInRange(0, 3);
		var topLeft = {x: 0, y: 0};
		switch(corner) {
			case 1: // top-right corner of blueprint
				topLeft.x = (this._width) - sWidth;
				break;
			case 2: // bottom-right corner of blueprint
				topLeft.x = (this._width) - sWidth;
				topLeft.y = (this._height) - sHeight;
				break;
			case 3: // bottom-left corner of blueprint
				topLeft.y = (this._height) - sHeight;
				break;
			case 0: // top-left corner of blueprint
			default:
				break;
		}

		for (var z = 0; z < this._blueprint.length; z++) {
			for (var x = 0; x < sWidth; x++) {
				for (var y = 0; y < sHeight; y++) {
					var tile,
						stairs;
					if(y == 0 || y == sHeight - 1) {
						tile = horizontalWall;
					} else if(x == 0 || x == sWidth - 1) {
						tile = verticalWall;
					} else if(z < this.getNumberOfStories() - 1 && y == sHeight - 2) {
						tile = stairsUp;
					} else if(z > 0 && y == sHeight - 3) {
						tile = stairsDown;
					} else {
						tile = floor;
					}

					if(!this._blueprint[z][topLeft.x + x][topLeft.y + y].isOuterWall() && tile) {
						this._blueprint[z][topLeft.x + x][topLeft.y + y] = tile;
					}
				};
			};
				
		};
	}

	this.build = properties['build'] || function() {
		// Create the initial 3D array, consisting of the outer wall (including windows), doors, and optional stairways
		this._createBlueprint();
		if(this._hallwayNumber !== false && this._hallwaySize !== false) {
			this._placeHallways();
		}
		if(this._stories > 1) {
			this._placeStairs();
		}
		if(this._roomNumber !== false) {
			this._placeRooms();
		}
		//this._placeItems();
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

Game.Building.prototype._sliceMethod = function(floor) {
	// This assumes that the perimeter tiles are outerWalls, 
	// and that rooms should be placed within the perimeter.

	// Start with a random orientation. Depending on orientation, then pick a random number
	// along the length or height of the building floor that's not an edge or right next to an edge.
	// Place inner walls directly along this line. Then, place a door along this wall,
	// and then flip the orientation of the slice, 
	// and repeat. When placing tiles, it is important to stop along outer walls. When an inner wall is
	// encountered, count the current number of rooms. If it is equal to the number desired, then stop. 
	// Other wise, proceed slicing and flipping until the ammount of rooms desired is reached.
	var verticalWall = Game.TileRepository.create('indoor wall-vertical');
	var horizontalWall = Game.TileRepository.create('indoor wall-horizontal');
	var door = Game.TileRepository.create('door');
	var sliceOrientation = Math.round(Math.random()) ? 'veritcal' : 'horizontal';

	
	// Since dividing a building will give it two rooms, there is no reason to start slicing
	// if the building specifies less than two rooms
	if(this._roomNumber > 1) {
		var count = 0;
		while(count <= this._roomNumber) {
			var currentWall = [];
			if(sliceOrientation == 'veritcal') {
				var randomX = Game.getRandomInRange(2, this._width - 2);
				for (var i = 0; i < this._height; i++) {
					if(floor[randomX][i].describe() == 'floor' && this._noSurroundingWalls(floor, randomX, i, sliceOrientation)) {
						floor[randomX][i] = verticalWall;
						currentWall.push({x: randomX, y: i});
					} else if((floor[randomX][i].isInnerWall() && count + 2 <= this._roomNumber) || floor[randomX][i].isOuterWall()) {
						continue;
					} else {
						break;
					}
				};
			} else if(sliceOrientation == 'horizontal') {
				var randomY = Game.getRandomInRange(2, this._height - 2);
				for (var i = 0; i < this._width; i++) {
					if(floor[i][randomY].describe() == 'floor' && this._noSurroundingWalls(floor, i, randomY, sliceOrientation)) {
						floor[i][randomY] = horizontalWall;
						currentWall.push({x: i, y: randomY});
					} else if((floor[i][randomY].isInnerWall() && count + 2 <= this._roomNumber) || floor[i][randomY].isOuterWall()) {
						continue;
					} else {
						break;
					}
				};
			}

			// Place a door along the current wall, randomly
			var doorLocation = currentWall.random();
			if(doorLocation) {
				floor[doorLocation.x][doorLocation.y] = door;
			}

			sliceOrientation = this._flipOrientation(sliceOrientation);
			count += 2;
		}
	}

	return floor;
};
Game.Building.prototype._flipOrientation = function(sliceOrientation) {
	if(sliceOrientation == 'veritcal') {
		return sliceOrientation = 'horizontal';
	} else if(sliceOrientation == 'horizontal') {
		return sliceOrientation = 'veritcal';
	}
};
Game.Building.prototype._noSurroundingWalls = function(floor, x, y, sliceOrientation) {
	debugger;
	if(sliceOrientation == 'veritcal') {
		return (!floor[x + 1][y].isInnerWall() && !floor[x - 1][y].isInnerWall() && !floor[x + 1][y].isOuterWall() && !floor[x - 1][y].isOuterWall());
	} else if(sliceOrientation == 'horizontal') {
		return (!floor[x][y + 1].isInnerWall() && !floor[x ][y- 1].isInnerWall() && !floor[x][y + 1].isOuterWall() && !floor[x][y - 1].isOuterWall());
	}
};