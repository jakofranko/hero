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

	// Initialize blueprint and room regions arrays
	this._blueprint = new Array(this._stories);
	this._roomRegions = new Array(this._stories);

	this._createBlueprint = properties['createBlueprint'] || function() {
		var floor = Game.TileRepository.create('floor');
		var wall = Game.TileRepository.create('brick wall', {
			foreground: ['#ab2e34', '#580004', '#e1de9d', '#d5d0dd'].random()
		});

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

	this._placeRooms = properties['placeRooms'] || function() {
		for (var z = 0; z < this._blueprint.length; z++) {
			var newFloor = this._sliceMethod(this._blueprint[z]);
			var floorRooms = this._generateRoomRegions(newFloor);
			this._blueprint[z] = newFloor;
			this._roomRegions[z] = floorRooms;
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
	};

	this._placeDoors = properties['placeDoors'] || function() {
		var door = Game.TileRepository.create('door');
		// As this will be going on the outside wall, designate it as such
		door.setOuterWall(true);
		// Place the outside door intelligently, and then from there place doors so that
		// each room is accessible by some path from the front door. Then, on higher floors,
		// place doors intelligently so that by some path from the stairs all rooms are accessible
		// If it's the first floor, place doors
		for(var z = 0; z < this._stories; z++) {
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
				this._blueprint[z][x][y] = door;
			}
		}
	}

	this.build = properties['build'] || function() {
		// Create the initial 3D array, consisting of the outer 
		// wall (including windows), doors, and optional stairways
		this._createBlueprint();
		
		if(this._stories > 1) {
			this._placeStairs();
		}
		if(this._roomNumber !== false) {
			this._placeRooms();
		}

		this._placeDoors();
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
	var sliceOrientation = Math.round(Math.random()) ? 'vertical' : 'horizontal';

	
	// Since dividing a building will give it two rooms, there is no reason to start slicing
	// if the building specifies less than two rooms
	// TODO: instead of placing the wall immediately, run 'currentWall' through tests, and if it passes all of them, then place the walls
	var attempts = 0;
	if(this._roomNumber > 1) {
		var count = 0;
		while(count <= this._roomNumber && attempts < 50) {
			var currentWall = [];
			if(sliceOrientation == 'vertical') {
				var randomX = Game.getRandomInRange(2, this._width - 2);
				for (var i = 0; i < this._height; i++) {
					if(floor[randomX][i].describe() == 'floor') {
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
					if(floor[i][randomY].describe() == 'floor') {
						currentWall.push({x: i, y: randomY});
					} else if((floor[i][randomY].isInnerWall() && count + 2 <= this._roomNumber) || floor[i][randomY].isOuterWall()) {
						continue;
					} else {
						break;
					}
				};
			}

			var placeWall = true;
			for (var i = 0; i < currentWall.length; i++) {
				var cw = currentWall[i];
				var noSurroundingWalls = this._noSurroundingWalls(floor, cw.x, cw.y, sliceOrientation);
				if(!noSurroundingWalls) {
					placeWall = false;
					break;
				}
			};			

			if(placeWall) {
				for (var i = 0; i < currentWall.length; i++) {
					var cw = currentWall[i];
					floor[cw.x][cw.y] = (sliceOrientation == 'vertical') ? verticalWall : horizontalWall;
				};	
				sliceOrientation = this._flipOrientation(sliceOrientation);
				count += 2;
			} else {
				attempts++;
			}
		}
	}

	return floor;
};
Game.Building.prototype._flipOrientation = function(sliceOrientation) {
	if(sliceOrientation == 'vertical') {
		return 'horizontal';
	} else if(sliceOrientation == 'horizontal') {
		return 'vertical';
	}
};
Game.Building.prototype._noSurroundingWalls = function(floor, x, y, sliceOrientation) {
	if(sliceOrientation == 'vertical') {
		return (!floor[x + 1][y].isInnerWall() && !floor[x - 1][y].isInnerWall() && !floor[x + 1][y].isOuterWall() && !floor[x - 1][y].isOuterWall());
	} else if(sliceOrientation == 'horizontal') {
		return (!floor[x][y + 1].isInnerWall() && !floor[x][y - 1].isInnerWall() && !floor[x][y + 1].isOuterWall() && !floor[x][y - 1].isOuterWall());
	}
};

// This function will use a poly-fill technique to create a region object,
// which will start at a floor tile designated by startX and startY, and then branch
// out until it hits a wall. When an inner wall is hit, it will attempt to skip over the wall
// and create a new region. If no floor tiles are found or if a region is already created
// there, then stop. What this function will return an object with two properties: tree and regions.
//
// At process start, add the root region to tree.root.region. As the filling proceeds, if a new fill is started
// because a room is found over a skipped wall, add that region number 
// to tree.root.children[{region: region, parent: currentRegion}]. Then, the polyfill will start on the new
// region and the process is started afresh. Since new connections will not be the root, an intelligent
// way of traversing the tree will be necessary to first search the roots children, and then their children
// when adding a parent and child node to the tree.
//
// The regions object will simply be an array of the regions, each of which contains the coordinates of
// that region's tiles.
Game.Building.prototype._generateRoomRegions = function(floor) {
	// Initialize the regions array
	var regions = new Array(floor.length);
	for (var x = 0; x < regions.length; x++) {
		regions[x] = new Array(floor[0].length);
		for (var y = 0; y < regions[x].length; y++) {
			regions[x][y] = 0;
		};
	};

	// Random starting location for filling that's not an edge or wall
	// It is assumed that since walls are placed one tile apart,
	// there should be a floor tile fairly easily to find
	var side = Game.getRandomInRange(0, 3);
	var scanDirection = Math.round(Math.random()) ? 'forwards' : 'backwards';
	var startX, startY;
	switch(side) {
		case 0:
			startX = 1;
			startY = this.getMidHeight();
			if(!floor[startX][startY]) {
				debugger;
			}
			while(!floor[startX][startY].isWalkable()) {
				if(scanDirection == 'forwards') {
					startY++;
				} else {
					startY--;
				}
				if(!floor[startX][startY]) {
					debugger;
				}
			}
			break;
		case 1:
			startX = this.getMidWidth();
			startY = 1;
			if(!floor[startX][startY]) {
				debugger;
			}
			while(!floor[startX][startY].isWalkable()) {
				if(scanDirection == 'forwards') {
					startX++;
				} else {
					startX--;
				}
				if(!floor[startX][startY]) {
					debugger;
				}
			}
			startY = 1;
			break;
		case 2:
			startX = this.getWidth() - 2;
			startY = this.getMidHeight();
			if(!floor[startX][startY]) {
				debugger;
			}
			while(!floor[startX][startY].isWalkable()) {
				if(scanDirection == 'forwards') {
					startY++;
				} else {
					startY--;
				}
				if(!floor[startX][startY]) {
					debugger;
				}
			}
			break;
		case 3:
		default:
			startX = this.getMidWidth();
			startY = this.getHeight() - 2;
			if(!floor[startX][startY]) {
				debugger;
			}
			while(!floor[startX][startY].isWalkable()) {
				if(scanDirection == 'forwards') {
					startX++;
				} else {
					startX--;
				}
				if(!floor[startX][startY]) {
					debugger;
				}
			}
			break;
	}
	
	// Start filling regions. Will return a completed 2D grid of regions.
	// While filling, if it fails the _canFill check, it should still get the neighbors 
	// and check if it can fill any of the neighboring tiles of the unfillable tile. 
	// If it can, then that starting location is added to the list of starting locations 
	// to try to fill from, along with its region and parent region
	regions = this._fillRegions(regions, floor, 1, startX, startY);
	// return {tree: {}, regions: regions};
};
Game.Building.prototype._fillRegions = function(regions, floor, region, x, y) {
	this._consoleLogGrid(floor, '_char');
	var startLocations = [{x: x, y: y}];

	// The regionTree is an object of the regions of a floor. Each region has an object of connections,
	// which are objects structred like so: region(int): {x: int, y: int}}
	var regionTree = {
		1: {}
	};
	while(startLocations.length > 0) {
		var start = startLocations.pop();

		// If a region has not already been placed, update the region of the start tile and
		// begin filling. After fill for this room is done, increment the region number.
		// Otherwise, keep going through the starting locations without incrementing.
		if(this._canFillRegion(regions, floor, start.x, start.y)) {
			// If the region is new, add it to the regionTree
			if(!regionTree[region]) {
				regionTree[region] = {};
			}
			// If the startLocation has a parent region, add it as a connection to it's parent
			// if it doesn't exist, and then add the parent as one of its own connections
			if(start.parent) {
				if(!regionTree[start.parent][region]) {
					regionTree[start.parent][region] = start.connectingWall;
				}
				regionTree[region][start.parent] = start.connectingWall;
			}
			// Fill tile with region
			regions[start.x][start.y] = region;

			var tiles = [{x: start.x, y: start.y}];
			var tile;
			var neighbors;

			// Loop while we still have tiles
			while(tiles.length > 0) {
				tile = tiles.pop();
				// Get the neighbors of the tile
				neighbors = this._getNeighborPositions(tile.x, tile.y);
				// Iterate through each neighbor, checking if we can use it to fill
		        // and if so updating the region and adding it to our processing list.
		        while(neighbors.length > 0) {
		            tile = neighbors.pop();
		            if(this._canFillRegion(regions, floor, tile.x, tile.y)) {
		                regions[tile.x][tile.y] = region;
		                tiles.push(tile);
		            } else {
		            	// If a tile cannot be filled, search it's neighbors to see if THEY
		            	// can be filled, effectively hopping a wall. If it can, add it to
		            	// the list of startLocations to try, along with the location of the wall
		            	// and the current region for creating a parent-child relationship
		            	var adjacentNeighbors = this._getNeighborPositions(tile.x, tile.y);
		            	while(adjacentNeighbors.length > 0) {
				            var newStart = adjacentNeighbors.pop();
				            if(this._canFillRegion(regions, floor, newStart.x, newStart.y)) {
				            	// Add additional data to the startLocation for building the regionTree
				            	newStart.parent = region;
				            	newStart.connectingWall = {x: tile.x, y: tile.y};

				            	// Push the start location to the list of tiles to try to fill
				                startLocations.push(newStart);
				                break;
				            }
				        }
		            }
		        }
			}
			region++;
		} else {
			// If the region can't be filled, check to see if it's because the area already has a region.
			// If it does, that means that the parent of the current start location is directly connected 
			// to that region, so check to see if that region has the parent as a connection. If not, add it.
			// Then, check to see if the parent region has the existing region as a connection. If not, add it.
			// Also, make sure that the parent region and the existingRegion aren't the same...no need for
			// a room to connect to itself. That would just be silly.
			if(typeof regions[start.x][start.y] === 'number' && regions[start.x][start.y] !== 0 && start.parent && regions[start.x][start.y] !== start.parent) {
				var existingRegion = regions[start.x][start.y];
				if(!regionTree[start.parent][existingRegion]) {
					regionTree[start.parent][existingRegion] = start.connectingWall;
				}

				if(!regionTree[existingRegion][start.parent]) {
					regionTree[existingRegion][start.parent] = start.connectingWall;
				}
			}
		}
	}
	
	console.log(regionTree);
	this._consoleLogGrid(regions);
	return regions;
};
Game.Building.prototype._canFillRegion = function(regions, tiles, x, y) {
	if(x < 0 || y < 0 || x >= this._width || y >= this._height) {
		return false;
	}
	// Make sure the tile does not already have a region
	if(regions[x][y] != 0) {
		return false;
	}
	// Make sure this tile is walkable
	return tiles[x][y].isWalkable();
};
Game.Building.prototype._getNeighborPositions = function(x, y) {
    var tiles = [];
    // Generate all orthogonal (4-directional (as opposed to 8-directional)) offsets
    for (var dX = -1; dX < 2; dX ++) {
        for (var dY = -1; dY < 2; dY++) {
            // Make sure it isn't the same tile or a diagonal
            if (dX == 0 && dY == 0) {
                continue;
            } else if(dX != 0 && dY != 0) {
            	continue;
            }
            tiles.push({x: x + dX, y: y + dY});
        }
    }
    return tiles.randomize();
};

Game.Building.prototype._consoleLogGrid = function(grid, field) {
	var string = "";
	for (var y = 0; y < grid[0].length; y++) {
		for (var x= 0; x < grid.length; x++) {
			if(field) {
				string += String(grid[x][y][field]);
			} else {
				string += String(grid[x][y]);
			}
		};
		string += "\n"
	};
	console.log(string);
};