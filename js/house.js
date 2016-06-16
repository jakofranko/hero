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
	this.children = [];
};
Game.House.prototype.Room.prototype.addChild = function(child) {
	if(child !== false)
		this.children.push(child);
};

// Recusively generate the graph, starting with the 'foyer'
Game.House.prototype.generate = function(name) {
	debugger;
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

Game.House.prototype._getRandomChild = function(room, returnWord) {
	// Get a new array from the possible room children based on what rooms
	// aren't at their max
	var selection = []
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