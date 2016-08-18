// As I've read through a few articles, this generation method is most heavily inspired by this paper: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.97.4544&rep=rep1&type=pdf
//
// The general idea is to define a grammar that describes each 'room', or 'node' in the house: what other nodes could connect to that room. Houses will always start with a foyer. Closets are always terminal nodes. Other nodes can be defined as being optionally terminal. For instance, a bedroom may or may not connect to a bathroom or closet. But a kitchen is pretty much never it's own room, it's usually connected to a hall or the dining room or the foyer etc.
//
// When generating a house, the grammar is refered to in order to determine what node will connect to the current node.
//
// Additionally, when building a house, a set of options can be passed in to define a certain number of rooms, otherwise the house can just kind of spawn with an upper limit to the size. The output of generating the house plan will be a 'graph' of nodes and connections which can then be used by another function to actually produce the tiles that will go on a city lot.

Game.House = function(options) {
	this.options = options || {
		// Max number of rooms
		"kitchen": 1,
		"dining room": 1,
		"living room": 1,
		"bedroom": 3,
		"bathroom": 2,
		"office": 1,
		"hall": 3 // If halls aren't limited, they will just spawn an infinite number of halls and closets
	};

	// Set initial number of rooms, to be incremented as they are added
	this.roomNum = [];
	for (var i = 0; i < this.rooms.length; i++) {
		this.roomNum[this.rooms[i]] = 0;
	}

	this.graph = this.generate('foyer');
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
	this.x = null;
	this.y = null;
	this.width = 5;			// TODO: randomize based on room type
	this.height = 5;		// TODO: randomize based on room type
	this.children = [];
};
Game.House.prototype.Room.prototype.setX = function(x) {
	this.x = x;
};
Game.House.prototype.Room.prototype.getX = function() {
	return this.x;
};
Game.House.prototype.Room.prototype.getY = function(y) {
	this.y = y;
};
Game.House.prototype.Room.prototype.setY = function(y) {
	return this.y;
};
Game.House.prototype.Room.prototype.getWidth = function(width) {
	this.width = width;
};
Game.House.prototype.Room.prototype.setWidth = function(width) {
	return this.width;
};
Game.House.prototype.Room.prototype.getHeight = function(height) {
	this.height = height;
};
Game.House.prototype.Room.prototype.setHeight = function(height) {
	return this.height;
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
			if(randomChild && (!this.options[randomChild] || this.roomNum[randomChild] < this.options[randomChild])) {
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
	// 1. Draw the room starting at the designated x,y coordinates that each room will have. If it does not have x and y properties, then it is the starting room (foyer).
	// 2. Loop through the room's children. For each child, pick a direction that the room will be added on to, and then place a door somewhere along that wall
	// 3. Then, based on the current child's width and height, assign the x,y start location to the child such that when starting at x,y and then rendering the room tiles, it will connect to the door placed in the previous step. It is important that each room is no larger than it's parent. Additionally, if the room is being placed north or west, the y and x columns/rows will need to be shifted accordingly in this step so that the x,y value assigned to the child are valid.
	// 4. Add the child (with assigned x and y values) to the queue
	while(queue.length > 0) {
		debugger;
		var room = queue.pop();
		var possibleDirections = this.possibleDirections[direction].randomize(); // For directions that have already been taken for child rooms
		var x, y;

		// Render room tiles
		var roomTiles = this._renderRoom(room);

		// Add room tiles to our house tiles
		if(room.x && room.y) {
			x = room.x;
			y = room.y;
		} else {
			x = 0;
			y = 0;
		}
		for(var i = 0; i < roomTiles.length; i++, x++) {
			if(!house[x])
				house[x] = new Array(roomTiles[i].length);

			// Since we iterate over the height of the room (y) everytime,
			// we need to reset y back to it's starting value (roomY)
			for(var j = 0, roomY = y; j < roomTiles[i].length; j++, roomY++) {
				house[x][roomY] = roomTiles[i][j];
			}
		}
		Game._consoleLogGrid(house, '_char');

		// Process the room's children if it has any
		if(room.children.length > 0) {
			var child = room.children[i];
			// Pick direction to branch from
			for (var i = 0; i < room.children.length; i++) {
				var dir = possibleDirections.pop();

				// Add a door to the room tiles
				switch(dir) {
					// Shift whole house 'south' by using Array.prototype.unshift()
					case 'n':
						// Loop through every column
						for (var x = 0; x < house.length; x++) {
							// unshift() a patch of grass to every row based on room height
							for (var y = 0; y < child.height; y++) {
								house[x].unshift(Game.TileRepository.create('grass'));
							}
						}
						break;
					// Shift whole house 'east' by using Array.prototype.unshift()
					case 'w':
						// unshift() a column of grass to every column based on room width
						for (var x = 0; x < child.width; x++) {
							house.unshift(new Array(house[0].length));
							for (var y = 0; y < house[0].length; y++) {
								house[x][y] = Game.TileRepository.create('grass');
							}
						}
						break;
					case 'e':
					case 's':
					default:
						break;
				}
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
		if(!this.options[roomName] || this.roomNum[roomName] < this.options[roomName])
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