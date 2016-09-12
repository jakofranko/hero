// As I've read through a few articles, this generation method is most heavily inspired by this paper: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.97.4544&rep=rep1&type=pdf
//
// The general idea is to define a grammar that describes each 'room', or 'node' in the house: what other nodes could connect to that room. Houses will always start with a foyer. Closets are always terminal nodes. Other nodes can be defined as being optionally terminal. For instance, a bedroom may or may not connect to a bathroom or closet. But a kitchen is pretty much never it's own room, it's usually connected to a hall or the dining room or the foyer etc.
//
// When generating a house, the grammar is refered to in order to determine what node will connect to the current node.
//
// Additionally, when building a house, a set of options can be passed in to define a certain number of rooms, otherwise the house can just kind of spawn with an upper limit to the size. The output of generating the house plan will be a 'graph' of nodes and connections which can then be used by another function to actually produce the tiles that will go on a city lot.

Game.House = function(options) {
	this.options = options || {
		maxRooms: {
			// Max number of rooms
			"kitchen": 1,
			"dining room": 1,
			"living room": 1,
			"bedroom": 3,
			"bathroom": 2,
			"office": 1,
			"hall": 3 // If halls aren't limited, they will just spawn an infinite number of halls and closets
		},
		maxStories: 2,
		maxWidth: 100,	// TODO: based off of lot size / number of houses per lot
		maxHeight: 100	// TODO: based off of lot size / number of houses per lot
	};

	// Set initial number of rooms, to be incremented as they are added
	this.roomNum = [];
	for (var i = 0; i < this.rooms.length; i++) {
		this.roomNum[this.rooms[i]] = 0;
	}

	this.graph = this.generate('foyer');
	this.leftovers = [];
	// this.tiles = this.render(['n', 'e', 's', 'w'].random());
	return this;
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
			if(randomChild && (!this.options.maxRooms[randomChild] || this.roomNum[randomChild] < this.options.maxRooms[randomChild])) {
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
		var x, y, z, stairs;

		// Render room tiles
		var roomTiles = this._renderRoom(room);
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
			roomTiles[doorX][doorY] = Game.TileRepository.create('door');
		}

		// Add room tiles to our house tiles
		x = room.getX();
		y = room.getY();
		z = room.getZ();


		// Check to see if a room exists already. If it does, _roomCheck will try
		// to return the coordinates of a floor tile so that stairs can be placed
		// and the room spawned on the z level above. Otherwise, skip this room.
		// Depending on the room spawn direction, shave off one side in order
		// to skip the shared wall.
		var existingRoom = false;
		switch(room.getSpawnDirection()) {
			case 'n':
				existingRoom = this._roomCheck(x, y, room.width, room.height - 1, house);
				break;
			case 'e':
				existingRoom = this._roomCheck(x + 1, y, room.width, room.height, house);
				break;
			case 's':
				existingRoom = this._roomCheck(x, y + 1, room.width, room.height, house);
				break;
			case 'w':
				existingRoom = this._roomCheck(x, y, room.width - 1, room.height, house);
				break;
			default:
				break;
		}
		if(existingRoom) {
			continue;
		}

		// No room was found, so render on!
		for(var i = 0; i < roomTiles.length; i++, x++) {
			if(!house[x])
				house[x] = new Array(roomTiles[i].length);

			// Since we iterate over the height of the room (y) everytime,
			// we need to reset y back to it's starting value (roomY)
			for(var j = 0, roomY = y; j < roomTiles[i].length; j++, roomY++) {
				// Don't overwrite an existing room tile
				if(!house[x][roomY] || house[x][roomY].describe() == 'grass')
					house[x][roomY] = roomTiles[i][j];
			}
		}

		// Fill in missing spaces with grass
		house = this._grassFill(house);
		Game._consoleLogGrid(house, '_char');
		this._testZeroIndex(house, [room, house]);

		// Process the room's children if it has any
		if(room.children.length > 0) {
			// Pick direction to branch from
			for (var i = 0; i < room.children.length; i++) {
				var child = room.children[i];
				var dir = possibleDirections.pop();
				child.setSpawnDirection(dir);

				// Now that a child and the direction it will spawn have been chosen, do three things:
				// 1) Shift the house tiles if necessary
				// 2) Set the room and child x,y coordinates
				// 3) Determine a place on the wall the rooms will share, and add a door
				switch(dir) {
					// Shift whole house 'south' by using Array.prototype.unshift()
					case 'n':
						// Set x,y
						child.x = room.x || 0;
						child.y = room.y - child.height + 1; // plus one so the rooms will share a wall

						if(child.y < 0) {
							// Loop through every column
							for (var x = 0; x < house.length; x++) {
								// unshift() a patch of grass to every row based on room height
								for (var y = 0; y < child.height; y++) {
									house[x].unshift(Game.TileRepository.create('grass'));
									// Adjust room and children y positions by child height
									if(x === 0) { // Ensures we do this once, instead of for every row
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
							// unshift() a column of grass to every column based on room width
							for (var x = 0; x < child.width; x++) {
								house.unshift(new Array(house[0].length));
								for (var y = 0; y < house[0].length; y++) {
									// Always use index of 0 since we're adding the array to the beginning
									house[0][y] = Game.TileRepository.create('grass');
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
						break;
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
				house[doorXY[0]][doorXY[1]] = Game.TileRepository.create("door");

				// Add the child room to the queue
				queue.push(child);
			}
		}
		Game._consoleLogGrid(house, '_char');
	}
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

	return tiles;
};

Game.House.prototype._getRandomChild = function(room, returnWord) {
	// Get a new array from the possible room children based on what rooms
	// aren't at their max
	var selection = [];
	this.grammar[room].forEach(function(val, index) {
		var roomName = this.rooms[val];
		if(!this.options.maxRooms[roomName] || this.roomNum[roomName] < this.options.maxRooms[roomName])
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

// Based on the length of the first grid array, fill in the rest of the grid with grass tiles.
// Note: this will not work if the first element is shorter than other elements in the array
Game.House.prototype._grassFill = function(grid) {
	// If there are varying heights, find the highest column
	var height = grid.reduce(function(prev, curr) {
		if(typeof prev === 'object') prev = prev.length;
		if(typeof curr === 'object') curr = curr.length;
		return Math.max(prev, curr);
	}, 0);
	for (var x = 0; x < grid.length; x++) { // grid.length == width
		if(!grid[x])
			grid[x] = new Array(grid[0].length);

		for (var y = 0; y < height; y++) {
			if(!grid[x][y])
				grid[x][y] = Game.TileRepository.create('grass');
		}
	}
	return grid;
};

// For testing
Game.House.prototype._testZeroIndex = function(grid, info) {
	for (var x = 0; x < grid.length; x++) {
		if(!grid[x]) {
			console.log(info);
			throw new Error("What the...?");
		} else if(!grid[x][0]) {
			console.log(info);
			throw new Error("Some how this array didn't start with 0...");
		}
	}
	return true;
};

// Given x, y, width, and height
// (meaning, that the given grid contains only empty space or grass)
Game.House.prototype._roomCheck = function(startX, startY, width, height, tiles) {
	var roomFound = false;
	debugger;
	for (var x = 0; x < width; x++, startX++) {
		for (var y = 0; y < height; y++, startY++) {
			if(!tiles[startX])
				continue;
			if(tiles[startX][startY] && tiles[startX][startY].describe() != 'grass') {
				roomFound = true;
				break;
			}
		}
		if(roomFound) break;
	}
	return roomFound;
};