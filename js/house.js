// As I've read through a few articles, this generation method is most heavily inspired by this paper: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.97.4544&rep=rep1&type=pdf
//
// The general idea is to define a grammar that describes each 'room', or 'node' in the house: what other nodes could connect to that room. Houses will always start with a foyer. Closets are always terminal nodes. Other nodes can be defined as being optionally terminal. For instance, a bedroom may or may not connect to a bathroom or closet. But a kitchen is pretty much never it's own room, it's usually connected to a hall or the dining room or the foyer etc.
//
// When generating a house, the grammar is refered to in order to determine what node will connect to the current node.
//
// Additionally, when building a house, a set of options can be passed in to define a certain number of rooms, otherwise the house can just kind of spawn with an upper limit to the size. The output of generating the house plan will be a 'graph' of nodes and connections which can then be used by another function to actually produce the tiles that will go on a city lot.

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
    this.maxWidth = options['maxWidth'] || 10;
    this.maxHeight = options['maxHeight'] || 10;

    // Set initial number of rooms, to be incremented as they are added
    this.roomNum = [];
    for (var i = 0; i < this.rooms.length; i++) {
        this.roomNum[this.rooms[i]] = 0;
    }

    this.livingLocations = [];
    this.items = {}; // This is set during the render() phase above

    this.graph = this.generate('foyer');
    this.tiles = this.render(['n', 'e', 's', 'w'].random());

    return this;
};
Game.House.prototype.getTiles = function() {
    return this.tiles;
};
Game.House.prototype.getItems = function() {
    return this.items;
};
Game.House.prototype.getItemsAt = function(x, y, z) {
    return this.items[x + ',' + y + ',' + z];
};
Game.House.prototype.adjustX = function(amount, room) {
    var r = room || this.graph; // specific room or start with the foyer
    r.x += amount;
    if(r.children)
        for (var i = 0; i < r.children.length; i++)
            this.adjustX(amount, r.children[i]);

};
Game.House.prototype.adjustY = function(amount, room) {
    var r = room || this.graph; // specific room or start with the foyer
    r.y += amount;
    if(r.children)
        for (var i = 0; i < r.children.length; i++)
            this.adjustY(amount, r.children[i]);

};
Game.House.prototype.addItem = function(x, y, z, item) {
    var key = x + "," + y + "," + z;
    if(key in this.items === false)
        this.items[key] = [];
    this.items[key].push(item);
};
Game.House.prototype.getLivingLocations = function() {
    return this.livingLocations;
};
Game.House.prototype.addLivingLocation = function(location) {
    if(this.livingLocations.indexOf(location) < 0)
        this.livingLocations.push(location);
};
Game.House.prototype.rooms = [
    'foyer',        // 0
    'dining room',    // 1
    'living room',    // 2
    'kitchen',        // 3
    'office',        // 4
    'hall',            // 5
    'bathroom',        // 6
    'bedroom',        // 7
    'closet',        // 8
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

// Recusively generate the graph, starting with the 'foyer'
Game.House.prototype.generate = function(name) {
    // Create a new room
    var room = new Game.HouseRoom(name);

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
        let house = [];

        // This will be an array of rooms to do next.
        let queue = [this.graph];

        // Process queue til empty
        while(queue.length > 0) {
            let room = queue.shift();
            let x, y, z;
            let possibleDirections = this.possibleDirections[direction].randomize();
            let existingRoom = false;
            let currentDirection, exceedsMax, tryAbove;

            if(room.parent) {
                // First, check that adding the new room does not exceed the maximum limits
                tryAbove = room.z > room.parent.z;
                exceedsMax = this._exceedsMax(room, tryAbove);

                // If it does, try to put it on the z-level above, else, skip it
                if(exceedsMax && room.z + 1 <= this.maxStories) {
                    room.z++;

                    // Put it in the back of the queue
                    queue.push(room);
                    continue;
                } else if(exceedsMax) {
                    room.placed = false;
                    continue;
                }

                if(tryAbove)
                    possibleDirections.push("up");

                // TODO: support rooms being placed directly above their parent
                // Find a good spawn direction, and shift tiles accordingly
                while(possibleDirections.length) {
                    currentDirection = possibleDirections.pop();

                    // Because a room could be tacked on to the north or west, x,y coordinate 0,0 can
                    // change. Rooms to the south and east of their ancestor are not a problem; just
                    // stick the 'cursor' at a brand new x or y coordinate. But if it's to the north
                    // or west, the whole thing needs to be shifted down or to the right, and then
                    // the new room added to the new 0,y or x,0 coordinates.
                    switch(currentDirection) {
                        case 'n':
                            room.y -= room.height - 1; // plus one so the rooms will share a wall

                            if(room.y < 0) {
                                if(this._exceedsTotalHeight(room.height, house)){
                                    existingRoom = true;
                                    break;
                                } else {
                                    house = this._shiftTilesSouth(room.height, house);
                                    this.adjustY(room.height);
                                }
                            }

                            existingRoom = this._roomCheck(room.x, room.y, room.width, room.height - 1, house[room.z]);
                            break;
                        case 'w':
                            room.x -= room.width - 1; // plus one so the room.parents will share a wall

                            if(room.x < 0) {
                                if(this._exceedsTotalWidth(room.width, house)) {
                                    existingRoom = true;
                                    break;
                                } else {
                                    house = this._shiftTilesEast(room.width, house);
                                    this.adjustX(room.width);
                                }
                            }

                            existingRoom = this._roomCheck(room.x, room.y, room.width - 1, room.height, house[room.z]);
                            break;
                        case 'e':
                            room.x += room.parent.width - 1; // minus one so the room.parents will share a wall

                            existingRoom = this._roomCheck(room.x + 1, room.y, room.width, room.height, house[room.z]);
                            break;
                        case 's':
                            room.y += room.parent.height - 1; // minus one so the rooms will share a wall

                            existingRoom = this._roomCheck(room.x, room.y + 1, room.width, room.height, house[room.z]);
                            break;
                        case 'up':
                            existingRoom = this._roomCheck(room.x, room.y, room.width, room.height, house[room.z]);
                            break;
                        default:
                            throw new Error("There are no more possible directions. This should not be possible...heh heh.");
                    }

                    // A room was found, so try another direction
                    if(existingRoom === true) {
                        // No longer trying to place room above, so re-check
                        // to make sure adding the room will not exceed the max.
                        // If it will, break out and skip this room.
                        if(currentDirection == "up" && this._exceedsMax(room)) {
                            room.placed = false;
                            break;
                        } else {
                            room.x = room.parent.x;
                            room.y = room.parent.y;

                            continue;
                        }
                    } else {
                        room.spawnDirection = currentDirection;
                        break;
                    }
                }

                // If a place could not be found, increment the z level, and
                // put it in the back of the queue. If attempting to place the
                // room directly above its parent, it has failed so skip room.
                // If the room will be more than 1 z-level above the parent,
                // skip, since placing stairs will not be possible.
                if(room.spawnDirection === undefined || room.spawnDirection === null) {
                    if(currentDirection == 'up') {
                        room.placed = false;
                        continue;
                    }

                    if(room.z > room.parent.z) {
                        room.placed = false;
                        continue;
                    }

                    room.x = room.parent.x;
                    room.y = room.parent.y;
                    room.z++;

                    queue.push(room);
                    continue;
                }
            }

            // Render room tiles
            let roomTiles = this._renderRoom(room, direction);
            x = room.x,
            y = room.y,
            z = room.z;

            // Initialize the z-level, if not set already.
            if(!house[z]) {
                if(z === 0)
                    house[z] = new Array(roomTiles.length);
                else
                    house[z] = new Array(house[z - 1].length); // Make the new z level the same length as the level beneathe it
            }

            for(var i = 0, roomX = x; i < roomTiles.length; i++, roomX++) {
                if(!house[z][roomX])
                    house[z][roomX] = new Array(roomTiles[i].length);

                for(var j = 0, roomY = y; j < roomTiles[i].length; j++, roomY++) {
                    // Don't overwrite an existing room tile
                    if(!house[z][roomX][roomY] || house[z][roomX][roomY].getName() == 'grass' || house[z][roomX][roomY].getName() == 'air')
                        house[z][roomX][roomY] = roomTiles[i][j];
                }
            }

            // Fill in missing spaces with grass
            house = this._spaceFill(house);

            // Put room's children in the queue
            if(room.children.length > 0) {
                // Pick direction to branch from
                for (var k = 0; k < room.children.length; k++) {
                    // Set all children's coordinates to match their parent,
                    // so that when a spawn direction is chosen, the child can
                    // be placed relative to the parent.
                    room.children[k].x = room.x;
                    room.children[k].y = room.y;
                    room.children[k].z = room.z;

                    queue.push(room.children[k]);
                }
            }
            Game._consoleLogGrid(house[room.z], '_char');
        }

        // One last time, fill out any missing tiles with air or grass
        house = this._spaceFill(house);

        // Place doors
        house = this._placeDoors(house);

        // Place stairs
        house = this._placeStairs(house);

        // Now that the locations of all rooms have been set and adjusted, place items in each room
        this._placeItems(this.graph);

        // for (var z = 0; z < house.length; z++) {
        //     console.log(z);
        //     _consoleLogGrid(house[z], '_char');
        // }
        // this._testZeroIndex(house, [room, house]);
        return house;
};

Game.House.prototype._shiftTilesSouth = function(amount, tiles) {
    let tile;

    // If tiles doesn't exist, no need to shift
    if(!tiles)
        return tiles;

    for(let z = 0; z < tiles.length; z++) {
        if(!tiles[z][0]) debugger;
        for(let x = 0; x < tiles[z].length; x++) {
            for(let y = 0; y < amount; y++) {
                tile = (z === 0) ? Game.TileRepository.create('grass') : Game.TileRepository.create('air');
                tiles[z][x].unshift(tile);
            }
        }
    }

    return tiles;
};

Game.House.prototype._shiftTilesEast = function(amount, tiles) {
    let tile;

    // If tiles doesn't exist, no need to shift
    if(!tiles)
        return tiles;

    for(let z = 0; z < tiles.length; z++) {
        if(!tiles[z][0]) debugger;
        for(let x = 0; x < amount; x++) {
            tiles[z].unshift(new Array(tiles[z][0].length));

            for(let y = 0; y < tiles[z][0].length; y++) {
                tile = (z === 0) ? Game.TileRepository.create('grass') : Game.TileRepository.create('air');
                // Always use index of 0 since we're adding the array to the beginning
                tiles[z][0][y] = tile;
            }
        }
    }

    return tiles;
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
    if(room.name == 'foyer') {
        var doorX, doorY;
        switch(direction) {
            case 'n': // Rooms will be spawning south, so put the door at the north
                doorX = Game.getRandomInRange(room.x + 1, room.width - 2);
                doorY = room.y;
                break;
            case 'e': // Rooms will be spawning west, so put door at the east
                doorX = room.width - 1;
                doorY = Game.getRandomInRange(room.y + 1, room.height - 2);
                break;
            case 's':
                doorX = Game.getRandomInRange(room.x + 1, room.width - 2);
                doorY = room.height - 1;
                break;
            case 'w':
                doorX = room.x;
                doorY = Game.getRandomInRange(room.y + 1, room.height - 2);
                break;
            default:
                break;
        }
        tiles[doorX][doorY] = Game.TileRepository.create('door');
    }

    // TODO: populate the room with items (may need to be done after the whole house has been generated)

    return tiles;
};

Game.House.prototype._getRandomChild = function(room, returnWord) {
    // Get a new array from the possible room children based on what rooms
    // aren't at their max
    var selection = [];
    this.grammar[room].forEach(function(val) {
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

Game.House.prototype._placeDoors = function(tiles) {
    let rooms = [this.graph];
    let room, roomXY, childXY, commonXY, lowestX, highestX, lowestY, highestY, doorXY;
    function minMaxXY(m, c, prev, curr) {
        return Math[m](prev, Number(curr.split(",")[c]));
    }
    const minX = minMaxXY.bind(this, 'min', 0);
    const maxX = minMaxXY.bind(this, 'max', 0);
    const minY = minMaxXY.bind(this, 'min', 1);
    const maxY = minMaxXY.bind(this, 'max', 1);

    while(rooms.length) {
        room = rooms.shift();
        roomXY = Game.listXY(room.x, room.y, room.width, room.height);

        room.children.forEach(child => {
            if(!child.placed) return;

            // Don't try to place doors between rooms on different
            // z-levels, but make sure they are added to the queue
            if(room.z > child.z || room.z < child.z) {
                rooms.push(child);
                return;
            }

            commonXY = []; // Remove any previous coords

            childXY = Game.listXY(child.x, child.y, child.width, child.height);
            for(let i = 0; i < roomXY.length; i++) {
                if(childXY.indexOf(roomXY[i]) > -1)
                    commonXY.push(roomXY[i]);
            }

            // Make sure door isn't placed in a corner by eliminating the least and greatest x or y coordinates, depending on spawn direction
            if(child.spawnDirection == 'n' || child.spawnDirection == 's') {
                lowestX = commonXY.reduce(minX, commonXY[0].split(",")[0]);
                highestX = commonXY.reduce(maxX, commonXY[0].split(",")[0]);

                // Remove the extreme x tiles from the list
                for(let i = 0; i < commonXY.length; i++) {
                    if(commonXY[i].split(",")[0] == lowestX || commonXY[i].split(",")[0] == highestX)
                        commonXY.splice(i, 1);
                }
            } else {
                lowestY = commonXY.reduce(minY, commonXY[0].split(",")[1]);
                highestY = commonXY.reduce(maxY, commonXY[0].split(",")[1]);

                // Remove the extreme y tiles from the list
                for (let i = 0; i < commonXY.length; i++) {
                    if(commonXY[i].split(",")[1] == lowestY || commonXY[i].split(",")[1] == highestY)
                        commonXY.splice(i, 1);
                }
            }

            doorXY = commonXY.random().split(",");
            tiles[room.z][doorXY[0]][doorXY[1]] = Game.TileRepository.create("door");

            rooms.push(child);
            // consoleLogGrid(tiles[room.z], '_char');
        });
    }

    return tiles;
};

Game.House.prototype._placeStairs = function(tiles) {
    let queue = [this.graph];
    let room, roomXY, childXY, commonXY, parts, x, y;

    while(queue.length) {
        room = queue.shift();
        roomXY = Game.listXY(room.x, room.y, room.width, room.height);
        room.children.forEach(child => {
            commonXY = [];

            if(!child.placed) return;

            if(child.z > room.z) {
                childXY = Game.listXY(child.x, child.y, child.width, child.height);
                childXY.forEach(coord => {
                    if(roomXY.indexOf(coord) > -1)
                        commonXY.push(coord);
                });

                commonXY.some(coord => {
                    parts = coord.split(",");
                    x = parts[0];
                    y = parts[1];

                    if(!tiles[room.z + 1]) debugger;
                    if(tiles[room.z][x][y].isWalkable() && tiles[room.z + 1][x][y].isWalkable()) {
                        if(tiles[room.z][x][y].getName() == 'stairsDown')
                            tiles[room.z][x][y] = Game.TileRepository.create('stairsUpDown');
                        else
                            tiles[room.z][x][y] = Game.TileRepository.create('stairsUp');

                        if(tiles[room.z + 1][x][y].getName() == 'stairsUp')
                            tiles[room.z + 1][x][y] = Game.TileRepository.create('stairsUpDown');
                        else
                            tiles[room.z + 1][x][y] = Game.TileRepository.create('stairsDown');

                        return true;
                    } else {
                        return false;
                    }
                });
            }

            queue.push(child);
        });
    }

    return tiles;
};

Game.House.prototype._placeItems = function(room) {
    if(room.name !== 'foyer' && room.name !== 'hall' && room.name !== 'closet' && room.placed === true) {
        var roomX = room.x,
            roomY = room.y,
            roomZ = room.z;
        var itemsTemplate = Game.TemplateRepository.create(room.name); // Assumes that the room name is also the name of the template
        var spawnDir = room.spawnDirection;
        var options = {};
        switch(spawnDir) {
            case 's':
                options.rotate = '180deg';
                break;
            case 'e':
                options.rotate = '270deg';
                break;
            case 'w':
            options.rotate = '90deg';
                break;
            case 'n':
            default:
                break;
        }
        var itemMap = itemsTemplate.getProcessedTemplate(options);
        for(var key in itemMap) {
            var repo = itemMap[key].repository,
                name = itemMap[key].name,
                itemX = Number(key.split(",")[0]),
                itemY = Number(key.split(",")[1]),
                x = itemX + roomX + 1, // + 1 so that they are not placed on the walls
                y = itemY + roomY + 1;

            this.addItem(x, y, roomZ, Game[repo].create(name));

            // Add living location
            if(name === 'bed')
                this.addLivingLocation(x + "," + y + "," + roomZ);
        }
    }

    if(room.children.length > 0) {
        for (var i = 0; i < room.children.length; i++) {
            this._placeItems(room.children[i]);
        }
    }

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
    // z level doesn't exist yet, so obvs, no room
    if(!tiles)
        return roomFound;
    for (var x = 0, tilesX = startX; x < width; x++, tilesX++) {
        for (var y = 0, tilesY = startY; y < height; y++, tilesY++) {
            if(!tiles[tilesX])
                continue;

            if(tiles[tilesX][tilesY] && tiles[tilesX][tilesY].getName() != 'grass' && tiles[tilesX][tilesY].getName() != 'air') {
                    roomFound = true;
                    break;
            }
        }
        if(roomFound)
            break;
    }

    return roomFound;
};

Game.House.prototype._exceedsMax = function(room, onlyAbove = false) {
    if(onlyAbove) {
        return (
            room.z > this.maxStories ||
            room.x + room.width > this.maxWidth ||
            room.y + room.height > this.maxHeight
        )
    } else {
        return (
            room.z > this.maxStories ||
            room.x + room.parent.width + room.width > this.maxWidth ||
            room.y + room.parent.height + room.height > this.maxHeight
        );
    }
};

Game.House.prototype._exceedsTotalWidth = function(width, tiles) {
    for(let z = 0; z < tiles.length; z++) {
        if(width + tiles[z].length > this.maxWidth)
            return true;
    }
};

Game.House.prototype._exceedsTotalHeight = function(height, tiles) {
    for(let z = 0; z < tiles.length; z++) {
        for(let x = 0; x < tiles[z].length; x++) {
            if(height + tiles[z][x].length > this.maxHeight)
                return true;
        }
    }
};

Game.House.prototype._getFloorTiles = function(tiles) {
    var floorTiles = [];
    for (var x = 0; x < tiles.length; x++) {
        if(!tiles[x])
            continue;
        for (var y = 0; y < tiles[x].length; y++) {
            if(tiles[x][y] && tiles[x][y].getName() == 'floor')
                floorTiles.push(x + "," + y);
        }

    }

    return floorTiles;
};
