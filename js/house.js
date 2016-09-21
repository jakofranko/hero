// As I've read through a few articles, this generation method is most heavily inspired by this paper: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.97.4544&rep=rep1&type=pdf
//
// The general idea is to define a grammar that describes each 'room', or 'node' in the house: what other nodes could connect to that room. Houses will always start with a foyer. Closets are always terminal nodes. Other nodes can be defined as being optionally terminal. For instance, a bedroom may or may not connect to a bathroom or closet. But a kitchen is pretty much never it's own room, it's usually connected to a hall or the dining room or the foyer etc.
//
// When generating a house, the grammar is refered to in order to determine what node will connect to the current node.
//
// Additionally, when building a house, a set of options can be passed in to define a certain number of rooms, otherwise the house can just kind of spawn with an upper limit to the size. The output of generating the house plan will be a 'graph' of nodes and connections which can then be used by another function to actually produce the tiles that will go on a city lot.

// TODO: maxWidth and maxHeight should be based off of a fraction of the lot size. Perhaps this should be defined at a house template level
// TODO: prevent doors from spawning at corners
// TODO: If there is no more room to add a room's children on the current z-level, the code will try to place all the children directly above the room, resulting in only one being able to be placed (since the other's would not pass the _roomCheck being placed in the same x, y coordinates). Fix this somehow?
Game.House = function(options) {
	this.maxRooms = options['maxRooms'] || {
		// Max number of rooms
		"kitchen": 1,
		"dining room": 1,
		"living room": 1,
		"bedroom": 3,
		"bathroom": 2,
		"office": 1,
		"hall": 3 // If halls aren't limited, they will just spawn an infinite number of halls and closets
	};
	this.maxStories = options['maxStories'] || 1;
	this.maxWidth = options['maxWidth'] || 10;	// TODO: based off of lot size / number of houses per lot
	this.maxHeight = options['maxHeight'] || 10;	// TODO: based off of lot size / number of houses per lot

	// Set initial number of rooms, to be incremented as they are added
	this.roomNum = [];
	for (var i = 0; i < this.rooms.length; i++) {
		this.roomNum[this.rooms[i]] = 0;
	}

	this.graph = this.generate('foyer');
	this.tiles = this.render(['n', 'e', 's', 'w'].random());

	return this;
};
Game.House.prototype.getTiles = function() {
	return this.tiles;
};
Game.House.prototype.rooms = [
	'foyer',		// 0
	'dining room',	// 1
	'living room',	// 2
	'kitchen',		// 3
	'office',		// 4
	'hall',			// 5
	'bathroom',		// 6
	'bedroom',		// 7
	'closet',		// 8
];
Game.House.prototype.possibleDirections = {
	// Depending on which way a house is facing, it may only branch in any 3 given directions
	'n': ['s', 'e', 'w'],
	's': ['n', 'e', 'w'],
	'e': ['n', 's', 'w'],
	'w': ['n', 's', 'e']
};

// Closets and offices are terminal nodes; no rooms will spawn a foyer, as that is the origin
Game.House.prototype.grammar = {
	'foyer': [1, 2, 3, 4, 5],
	'dining room': [2, 3, 5],
	'living room': [1, 3, 4, 5],
	'kitchen': [1, 2, 5],
	'office': [8],
	'hall': [1, 2, 3, 4, 5, 6, 7, 8],
	'bathroom': [8],
	'bedroom': [8],
	'closet': false
};

Game.House.prototype.Room = function(name) {
	this.room = name;
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.width = Game.getRandomInRange(this.roomSizes[name][0], this.roomSizes[name][1]);
	this.height = Game.getRandomInRange(this.roomSizes[name][0], this.roomSizes[name][1]);
	this.spawnDirection = null;
	this.upStair = null;
	this.downStair = null;
	this.children = [];
};
// 'roomName': [min, max]
Game.House.prototype.Room.prototype.roomSizes = {
	'foyer': [3, 4],
	'dining room': [6, 7],
	'living room': [6, 8],
	'kitchen': [5, 7],
	'office': [5, 6],
	'hall': [3, 5],
	'bathroom': [5, 6],
	'bedroom': [5, 8],
	'closet': [3, 3],
};
Game.House.prototype.Room.prototype.getX = function() {
	return this.x;
};
Game.House.prototype.Room.prototype.setX = function(x) {
	this.x = x;
};
Game.House.prototype.Room.prototype.getY = function(y) {
	return this.y;
};
Game.House.prototype.Room.prototype.setY = function(y) {
	this.y = y;
};
Game.House.prototype.Room.prototype.getZ = function(z) {
	return this.z;
};
Game.House.prototype.Room.prototype.setZ = function(z) {
	this.z = z;
	// All children should have this same z level
	if(this.children.length > 0) {
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].setZ(z);
		}
	}
};
Game.House.prototype.Room.prototype.getWidth = function(width) {
	return this.width;
};
Game.House.prototype.Room.prototype.setWidth = function(width) {
	this.width = width;
};
Game.House.prototype.Room.prototype.getHeight = function(height) {
	return this.height;
};
Game.House.prototype.Room.prototype.setHeight = function(height) {
	this.height = height;
};
Game.House.prototype.Room.prototype.getSpawnDirection = function(dir) {
	return this.spawnDirection;
};
Game.House.prototype.Room.prototype.setSpawnDirection = function(dir) {
	this.spawnDirection = dir;
};
Game.House.prototype.Room.prototype.getUpStair = function() {
	return this.upStair;
};
Game.House.prototype.Room.prototype.setUpStair = function(upStair) {
	this.upStair = upStair;
};
Game.House.prototype.Room.prototype.getDownStair = function() {
	return this.downStair;
};
Game.House.prototype.Room.prototype.setDownStair = function(downStair) {
	this.downStair = downStair;
};
Game.House.prototype.Room.prototype.addChild = function(child) {
	if(child !== false)
		this.children.push(child);
};

// Recusively generate the graph, starting with the 'foyer'
Game.House.prototype.generate = function(name) {
	// Create a new room
	var room = new this.Room(name);

	if(this.grammar[name] === false) {
		return room;
	} else {
		// Pick a random number of connections up to 3 or the number 
		// of connections that room can have, whichever is less
		var possibleChildren = this.grammar[name].length;
		var numChildren = Math.min(3, possibleChildren);	
		for (var i = 0; i < numChildren; i++) {
			var randomChild = this._getRandomChild(name, true);

			// If the random child is under, or does not have a limit, add it
			if(randomChild && (!this.maxRooms[randomChild] || this.roomNum[randomChild] < this.maxRooms[randomChild])) {
				// this should be incremented first so that deeper in 
				// the recursion the current numbers of rooms are reflected
				this.roomNum[randomChild]++; 
				room.addChild(this.generate(randomChild));
			}
		}

		return room;
	}
};


// Because a room could be tacked on to the north, x,y coordinate 0,0 is going to change. Rooms to the south and east of their ancestor are not a problem; just stick the 'cursor' at a brand new x or y coordinate. But if it's to the north or west, the whole thing needs to be shifted down or to the right, and then the new room added to the new 0,y or x,0 coordinates.
Game.House.prototype.render = function(direction) { // The direction specifies when way we branch from the root initially
	// The array of tiles to be returned
	var house = [];

	// This will be an array of rooms to do next.
	var queue = [this.graph];

	// Process the queue until it's empty. Processing a room will consist of the following:
	// 1. Draw the room starting at the designated x, y, and z
	// 2. Loop through the room's children. For each child, pick a direction that the room will be added on to, and then detect whether a room already exists in that direction. If a room exists and adding a story would not exceed the maximum story limit of a house, add an up stairs and a down stairs in the current room and give the child room the same x,y coordinates of the parent room, set all of the child rooms chidren nodes to the new z level, and then add the child to the queue. If a room exists but you cannot add a story, skip the child.
	// 3. If a room does not exist in the projected space, then assign the x,y start location to the child based on the current child's width and height, such that when starting at x,y and then rendering the room tiles, it will connect to the door placed in step 5 as well as share a wall with the parent node.
	// 4. If the x or y values of the new room are negative, shift the x and y values of the child and the parent until they are no longer negative while simultaneously adding spaces onto the house in the appropriate direction.
	// 5. After the new x and y values of the child and parent are known (and if they are on the same z level), it is possible to know what x and y coordinates they will share. This should be the shared wall. After getting a list of the coordinates they will share, eliminate the extreme x or y coordinates to avoid placing a door in a corner, and then randomly pick a coordinate for a door and replace the wall tile with a door tile.
	// 6. Add the child (with assigned x, y, and z values) to the queue of rooms to render
	while(queue.length > 0) {
		var room = queue.pop();
		var possibleDirections = this.possibleDirections[direction].randomize(); // For directions that have already been taken for child rooms
		var x, y, z;
		var existingRoom = false;

		// Render room tiles
		var roomTiles = this._renderRoom(room, direction);
		
		// Add room tiles to our house tiles
		x = room.getX();
		y = room.getY();
		z = room.getZ();


		// Check to see if a room exists already. If it does, _roomCheck will try
		// to return the coordinates of a floor tile so that stairs can be placed
		// and the room spawned on the z level above. Otherwise, skip this room.
		// Depending on the room spawn direction, shave off one side in order
		// to skip the shared wall.
		switch(room.getSpawnDirection()) {
			case 'n':
				existingRoom = this._roomCheck(x, y, room.width, room.height - 1, house[z]);
				break;
			case 'e':
				existingRoom = this._roomCheck(x + 1, y, room.width, room.height, house[z]);
				break;
			case 's':
				existingRoom = this._roomCheck(x, y + 1, room.width, room.height, house[z]);
				break;
			case 'w':
				existingRoom = this._roomCheck(x, y, room.width - 1, room.height, house[z]);
				break;
			default:
				break;
		}
		if(typeof existingRoom == "object" && z + 1 <= this.maxStories) {
			// A valid floor tile was placed, so set the coordinates for the placement of up and down stairs
			room.setUpStair({
				x: existingRoom.x,
				y: existingRoom.y,
				z: z
			});
			room.setDownStair({
				x: existingRoom.x,
				y: existingRoom.y,
				z: z + 1
			});

			// Move the room's z level (and all it's children) up one
			room.setZ(z + 1);

			// And set z to the room's new z level
			z = room.getZ();			
		} else if(existingRoom === true) {
			continue;
		}

		// No room was found, so render on!
		if(!house[z]) {
			if(z === 0)
				house[z] = new Array(roomTiles.length);
			else
				house[z] = new Array(house[z - 1].length); // Make the new z level the same length as the level beneathe it
		}
		for(var i = 0, roomX = x; i < roomTiles.length; i++, roomX++) {
			if(!house[z][roomX])
				house[z][roomX] = new Array(roomTiles[i].length);

			// Since we iterate over the height of the room (y) everytime,
			// we need to reset y back to it's starting value (roomY)
			for(var j = 0, roomY = y; j < roomTiles[i].length; j++, roomY++) {
				// Don't overwrite an existing room tile
				if(!house[z][roomX][roomY] || house[z][roomX][roomY].describe() == 'grass' || house[z][roomX][roomY].describe() == 'air')
					house[z][roomX][roomY] = roomTiles[i][j];
			}
		}

		// If stairs can be placed, place them
		var upStairs = room.getUpStair();
		var downStairs = room.getDownStair();
		if(upStairs !== null && downStairs !== null) {
			house[upStairs.z][upStairs.x][upStairs.y] = Game.TileRepository.create('stairsUp');
			house[downStairs.z][downStairs.x][downStairs.y] = Game.TileRepository.create('stairsDown');
		}

		// Fill in missing spaces with grass
		house = this._spaceFill(house);

		// Process the room's children if it has any
		if(room.children.length > 0) {
			// Pick direction to branch from
			for (var i = 0; i < room.children.length; i++) {
				var child = room.children[i];
				var dir = possibleDirections.pop();
				child.setSpawnDirection(dir);

				// Now that a child and the direction it will spawn have been chosen:
				// 1) Check to see if adding this child will exceed the maxWidth or maxHeight properties
				// 2) If it will, instead stack the room on top of its parent and place stairs 
				// 3) Otherwise, shift the house tiles if necessary
				// 4) Set the room and child x,y coordinates
				// 5) Determine a place on the wall the rooms will share, and add a door
				var exceedsMax = (
					child.getWidth() + house[z].length > this.maxWidth || 
					child.getHeight() + house[z][0].length > this.maxHeight
				);
				if(exceedsMax && z + 1 <= this.maxStories) {
					var randomFloor = this._getRandomFloor(x, y, child.getWidth(), child.getHeight(), house[z]);
					if(randomFloor !== false) {
						// Valid floor was found, so place stairs...
						if(!house[z + 1]) {
							// Make the new z level the same length as this level
							house[z + 1] = new Array(house[z].length);
						}
						// If the x array doesn't exist, create in as high as the child
						if(!house[z + 1][randomFloor.x]) {
							house[z + 1][randomFloor.x] = new Array(child.getHeight());
						}

						// Set the child's x, y, and z levels...
						child.setX(x);
						child.setY(y);
						child.setZ(z + 1);
						child.setUpStair({
							x: randomFloor.x,
							y: randomFloor.y,
							z: z
						});
						child.setDownStair({
							x: randomFloor.x,
							y: randomFloor.y,
							z: z + 1
						});

						// And push it into the queue.
						queue.push(child);
					} else {
						// A valid floor tile was not found, so this room cannot be added; continue.
						continue;
					}
				} else if(!exceedsMax) {
					switch(dir) {
						// Shift whole house 'south' by using Array.prototype.unshift()
						case 'n':
							// Set x,y
							child.setX(x);
							child.setY(y - child.getHeight() + 1); // plus one so the rooms will share a wall

							if(child.getY() < 0) {
								// Loop through every column
								for (var houseX = 0; houseX < house[z].length; houseX++) {
									// unshift() a patch of grass/air to every row based on room height
									for (var houseY = 0; houseY < child.height; houseY++) {
										var tile = (z === 0) ? Game.TileRepository.create('grass') : Game.TileRepository.create('air');
										house[z][houseX].unshift(tile);
										// Adjust room and children y positions by child height
										if(houseX === 0) { // Ensures we do this once, instead of for every row
											room.y++;
											for(var roomChild = 0; roomChild < room.children.length; roomChild++)
												room.children[roomChild].y++; // This increments the 'child' var too
											
										}
									}
								}	
							}
							
							break;
						// Shift whole house 'east' by using Array.prototype.unshift()
						case 'w':
							// Set x,y
							child.x = room.x - child.width + 1; // plus one so the rooms will share a wall
							child.y = room.y || 0;

							if(child.x < 0) {
								// unshift() a column of grass/air to every column based on room width
								for (var x = 0; x < child.width; x++) {
									house[z].unshift(new Array(house[z][0].length));
									for (var y = 0; y < house[z][0].length; y++) {
										var tile = (z === 0) ? Game.TileRepository.create('grass') : Game.TileRepository.create('air');
										// Always use index of 0 since we're adding the array to the beginning
										house[z][0][y] = tile;
									}
									// Adjust room and children y positions by child width
									room.x++;
									for(var roomChild = 0; roomChild < room.children.length; roomChild++)
										room.children[roomChild].x++; // This increments the 'child' var too
								}
							}
							break;
						case 'e':
							// Set x,y
							child.x = room.x + room.width - 1; // minus one so the rooms will share a wall
							child.y = room.y || 0;
							break;
						case 's':
							// Set x,y
							child.x = room.x || 0;
							child.y = room.y + room.height - 1; // minus one so the rooms will share a wall
							break;
						default:
							throw new Error("There are no more possible directions. This should not be possible...heh heh.");
					}

					// Determine where to place the door
					var roomXY = Game.listXY(room.getX(), room.getY(), room.getWidth(), room.getHeight());
					var childXY = Game.listXY(child.getX(), child.getY(), child.getWidth(), child.getHeight());
					var commonXY = [];
					for (var i = 0; i < roomXY.length; i++)
						if(childXY.indexOf(roomXY[i]) > -1)
							commonXY.push(roomXY[i]);
					
					// Make sure door isn't placed in a corner by eliminating the least and greatest x or y coordinates, depending on spawn direction
					// if(dir == 'n' || dir == 's') {
					// 	var lowestX = commonXY.reduce(function(prev, curr) {
					// 		return Math.min(prev, curr.split(",")[0]);
					// 	}, commonXY[0].split(",")[0]);
					// 	var highestX = commonXY.reduce(function(prev, curr) {
					// 		return Math.max(prev, curr.split(",")[0]);
					// 	}, commonXY[0].split(",")[0]);
					// } else {
					// 	var lowestY = commonXY.reduce(function(prev, curr) {
					// 		return Math.min(prev, curr.split(",")[1]);
					// 	}, commonXY[0].split(",")[1]);
					// 	var highestY = commonXY.reduce(function(prev, curr) {
					// 		return Math.max(prev, curr.split(",")[1]);
					// 	}, commonXY[0].split(",")[1]);
					// }

					var doorXY = commonXY.random().split(",");
					house[z][doorXY[0]][doorXY[1]] = Game.TileRepository.create("door");

					// Add the child room to the queue
					queue.push(child);
				} else {
					// Adding the child would exceed maxWidth or maxHeight and it cannot be placed above the parent, so skip it
					continue;
				}
			}
		}
	}

	// One last time, fill out any missing tiles with air or grass
	house = this._spaceFill(house);
	// for (var z = 0; z < house.length; z++) {
	// 	console.log(z);
	// 	Game._consoleLogGrid(house[z], '_char');
	// }
	// this._testZeroIndex(house, [room, house]);
	return house;
};

Game.House.prototype._renderRoom = function(room, direction) {
	var w = room.width;
	var h = room.height;
	var horizontalWall = Game.TileRepository.create('indoor wall-horizontal');
	var verticalWall = Game.TileRepository.create('indoor wall-vertical');
	var floor = Game.TileRepository.create('floor');
	var tiles = new Array(w); // Initialize the x-length
	
	for (var x = 0; x < w; x++) {
		// Initialize the y-length if it doesn't exist yet.
		if(!tiles[x])
				tiles[x] = new Array(h);

		for (var y = 0; y < h; y++) {
			if(y === 0 || y === h - 1)
				tiles[x][y] = horizontalWall;
			else if(x === 0 || x === w - 1)
				tiles[x][y] = verticalWall;
			else
				tiles[x][y] = floor;
		}
	}

	// If it's the foyer, place the front door
	if(room.room == 'foyer') {
		var doorX, doorY;
		switch(direction) {
			case 'n': // Rooms will be spawning south, so put the door at the north
				doorX = Game.getRandomInRange(room.getX() + 1, room.getWidth() - 2);
				doorY = room.getY();
				break;
			case 'e': // Rooms will be spawning west, so put door at the east
				doorX = room.getWidth() - 1;
				doorY = Game.getRandomInRange(room.getY() + 1, room.getHeight() - 2);
				break;
			case 's':
				doorX = Game.getRandomInRange(room.getX() + 1, room.getWidth() - 2);
				doorY = room.getHeight() - 1;
				break;
			case 'w':
				doorX = room.getX();
				doorY = Game.getRandomInRange(room.getY() + 1, room.getHeight() - 2);
				break;
			default:
				break;
		}
		tiles[doorX][doorY] = Game.TileRepository.create('door');
	}

	return tiles;
};

Game.House.prototype._getRandomChild = function(room, returnWord) {
	// Get a new array from the possible room children based on what rooms
	// aren't at their max
	var selection = [];
	this.grammar[room].forEach(function(val, index) {
		var roomName = this.rooms[val];
		if(!this.maxRooms[roomName] || this.roomNum[roomName] < this.maxRooms[roomName])
			selection.push(val);
	}, this);

	var child;
	if(selection.length > 0)
		child = selection.random();
	else
		child = false;

	if(child === false)
		return false;
	else if(returnWord)
		return this.rooms[child];
	else
		return child;
};

// For every z-level, based on the length of the first grid array, fill in the rest of the grid with grass tiles.
// Note: this will not work if the first element is shorter than other elements in the array
Game.House.prototype._spaceFill = function(grid) {
	for (var z = 0; z < grid.length; z++) {
		// If there are varying heights, find the highest column
		var height = grid[z].reduce(function(prev, curr) {
			if(typeof prev === 'object') prev = prev.length;
			if(typeof curr === 'object') curr = curr.length;
			return Math.max(prev, curr);
		}, 0);
		for (var x = 0; x < grid[z].length; x++) { // grid[z].length == width
			if(!grid[z][x])
				grid[z][x] = new Array(height);

			for (var y = 0; y < height; y++) {
				if(!grid[z][x][y]) {
					var tile = (z === 0) ? Game.TileRepository.create('grass') : Game.TileRepository.create('air');
					grid[z][x][y] = tile;
				}
			}
		}
	}
	return grid;
};

// For testing
Game.House.prototype._testZeroIndex = function(grid, info) {
	for (var z = 0; z < grid.length; z++) {
		for (var x = 0; x < grid[z].length; x++) {
			if(!grid[z][x]) {
				console.log(info);
				throw new Error("What the...?");
			} else if(!grid[z][x][0]) {
				console.log(info);
				throw new Error("Some how this array didn't start with 0...");
			}
		}
	}
	return true;
};

// NOTE: THIS IS DESIGNED TO ONLY COVER X AN Y, SO PASS IN THE APPROPRIATE Z LEVEL WHEN CALLING THIS FUNCTION
// Given x, y, width, and height, attempt to return coordinates of floor tile for stairs.
// Otherwise, return true if room is found, false if no room is found.
// (meaning, that the given grid contains only empty space or grass)
Game.House.prototype._roomCheck = function(startX, startY, width, height, tiles) {
	var roomFound = false;
	var floorFound = false;
	for (var x = 0, tilesX = startX; x < width; x++, tilesX++) {
		for (var y = 0, tilesY = startY; y < height; y++, tilesY++) {
			if(!tiles[tilesX])
				continue;

			if(tiles[tilesX][tilesY] && tiles[tilesX][tilesY].describe() != 'grass' && tiles[tilesX][tilesY].describe() != 'air')
				roomFound = true;

			if(roomFound && !floorFound && tiles[tilesX][tilesY] && tiles[tilesX][tilesY].describe() == 'floor') {
				floorFound = {
					x: tilesX,
					y: tilesY
				};
				break;
			}
		}
		if(roomFound && floorFound) break;
	}

	return (roomFound && floorFound) ? floorFound : roomFound;
};

Game.House.prototype._getRandomFloor = function(roomX, roomY, width, height, tiles) {
	var floorTiles = [];
	for (var x = 0; x < width; x++, roomX++) {
		if(!tiles[roomX])
			continue;
		for (var y = 0, tilesY = roomY; y < height; y++, tilesY++) {
			if(tiles[roomX][tilesY] && tiles[roomX][tilesY].describe() == 'floor') {
				floorTiles.push(roomX + "," + tilesY);
			}
		}
	}

	if(floorTiles.length > 0) {
		var randomFloor = floorTiles.random().split(",");
		return { x: randomFloor[0], y: randomFloor[1] };
	} else {
		return false;
	}
};