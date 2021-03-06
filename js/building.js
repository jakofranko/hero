// Constructor for Game.BuildingRepository. This will contain information on size, number of stories, and map (or perhaps 'blueprint') information for drawing the building. Buildings created from templates will ultimately be stored in their lots, and will ultimately be drawn as part of the buildTiles function of lots.
// This will be the constructor class for all buildings, including skyscrapers, garages, fast-food places etc. So, the logic for building out the 'blueprint' of the building will be found in each building's template.
// By default, Game.Building will generate a sort of generic office building.
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
        var width = Math.min(Math.round(ROT.RNG.getNormal(properties['width'], 2)), Game.getLotSize());
        var height = Math.min(Math.round(ROT.RNG.getNormal(properties['height'], 2)), Game.getLotSize());
        this._width = width;
        this._height = height;
        this._stories = Math.max(1, Math.round(ROT.RNG.getNormal(properties['stories'], 3)));
        this._roomNumber = Math.max(0, Math.round(ROT.RNG.getNormal(properties['roomNumber'], 3))) || false;
        // this.name = Game.Building.randomName();
    }

    this._livingLocations = [];

    // Company generator and jobLocation storage
    this._companyGenerator = new Game.CompanyGenerator();
    this._companies = [];
    this._jobLocations = [];

    // Map of item locations
    this._items = properties['items'] || {};

    this._roomSize = properties['roomSize'] || false; // Squared; so room size 3 will be a 3x3 room.

    // Initialize blueprint and room regions arrays
    this._blueprint = new Array(this._stories);
    this._roomRegions = new Array(this._stories);
    this._rooms = [];

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
            for(var i = 0; i < story.length; i++) {
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
            this._blueprint[z] = newFloor;
        }
    };

    this._placeStairs = properties['placeStairs'] || function() {
        var stairsUp = Game.TileRepository.create('stairsUp');
        var stairsDown = Game.TileRepository.create('stairsDown');
        var horizontalWall = Game.TileRepository.create('inside wall-horizontal');
        var verticalWall = Game.TileRepository.create('inside wall-vertical');

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
            case 0:
                break; // top-left corner of blueprint
            default:
                break;
        }

        for (var z = 0; z < this._blueprint.length; z++) {
            // Only place up-stairs once
            var stairsPlaced = false;
            for (var x = 0; x < sWidth; x++) {
                for (var y = 0; y < sHeight; y++) {
                    var tile = null;
                    if(y === 0 || y == sHeight - 1) {
                        tile = horizontalWall;
                    } else if(x === 0 || x == sWidth - 1) {
                        tile = verticalWall;
                    } else if(!stairsPlaced && z < this.getStories() - 1 && (y == sHeight - 2 || y == sHeight - 3) && this._blueprint[z][topLeft.x + x][topLeft.y + y].getName() !== 'stairsDown') {
                        tile = stairsUp;
                        stairsPlaced = true;
                    }

                    if(!this._blueprint[z][topLeft.x + x][topLeft.y + y].isOuterWall() && tile) {
                        this._blueprint[z][topLeft.x + x][topLeft.y + y] = tile;
                        if(tile == stairsUp) {
                            this._blueprint[z + 1][topLeft.x + x][topLeft.y + y] = stairsDown;
                        }
                    }
                }
            }
        }
    };

    this._generateRoomRegions = properties['generateRoomRegions'] || function() {
        for (var z = 0; z < this._blueprint.length; z++) {
            var floorRooms = this._fillRooms(this._blueprint[z], z);
            this._roomRegions[z] = floorRooms;
        }
    };

    // The method for placing doors will be to use an algorithm to try to place doors
    // in an interesting way according to a mathematical relationship between regions
    // and their neigbors. Then, a second pass will be made traversing the roomRegion
    // tree to make sure that region 1 has a connection by some path to every other
    // region on the floor.
    this._placeDoors = properties['placeDoors'] || function() {
        var door = Game.TileRepository.create('door');

        // Place the outside door intelligently, and then from there place doors so that
        // each room is accessible by some path from the front door. Then, on higher floors,
        // place doors intelligently so that by some path from the stairs all rooms are accessible
        // (this is achieved by having the stairwell be region 1 on higher floors during region generation)
        for(var z = 0; z < this._stories; z++) {
            if(z === 0) {
                // As this will be going on the outside wall, designate it as such
                door.setOuterWall(true);
                var doorPlaced = false;
                // Scan the first and last inner row for region 1
                for (var x = 0; x < this._blueprint[z].length; x++) {
                    if(this._roomRegions[z].regions[x][1] == 1) {
                        this._blueprint[z][x][0] = door;
                        doorPlaced = true;
                        break;
                    } else if(this._roomRegions[z].regions[x][this._height - 2] == 1) {
                        this._blueprint[z][x][this._height - 1] = door;
                        doorPlaced = true;
                        break;
                    }
                }
                if(!doorPlaced) {
                    // Scan the first and last column for region 1
                    for (var y = 0; y < this._blueprint[z][0].length; y++) {
                        if(this._roomRegions[z].regions[1][y] == 1) {
                            this._blueprint[z][0][y] = door;
                            doorPlaced = true;
                            break;
                        } else if(this._roomRegions[z].regions[this._width - 2][y] == 1) {
                            this._blueprint[z][this._width - 1][y] = door;
                            doorPlaced = true;
                            break;
                        }
                    }
                }
            }

            door.setOuterWall(false);

            // For keeping track of already placed doors
            var placedDoors = [];

            // Because of the way room regions are placed sequentially,
            // it works out that you take the difference between the current
            // region and each of it's connecting regions, and place a door
            // between the regions with the largest difference, there will (almost)
            // always be a path between the first region and the last region.
            // If anybody can explain to me why this works, I'd love to know...
            for(var region in this._roomRegions[z].tree) {
                // For determining the greatest difference
                var regionDiffs = [];

                // For keeping track of the relationship between the difference and the connection
                var regionDiffsMap = {};

                for(var connection in this._roomRegions[z].tree[region]) {
                    // Because there will almost always be a connection that is larger than the
                    // current region (the very last region being the exception), it is better
                    // to take the difference between the connecting region and the current
                    // region than vice versa.
                    // Note: the variable 'connection' here actually refers to neigboring regions
                    regionDiffs.push(connection - region);
                    regionDiffsMap[connection - region] = connection;
                }

                // Sometimes the algorithm will find that the best place for a door
                // for two regions, after analyzing each of their respective
                // surrounding regions, is on the same wall. To prevent this, keep
                // track of all the region diffs, and if a door has already been placed
                // at a region connector, then place take that region out of the difference
                // calculation.
                while(regionDiffs.length) {
                    var biggestDiff = Math.max.apply(null, regionDiffs);
                    var connectingRegion = regionDiffsMap[biggestDiff];
                    var pos = this._roomRegions[z].tree[region][connectingRegion];
                    var doorPosKey = pos.x + "," + pos.y;

                    if(placedDoors.indexOf(doorPosKey) === -1) {
                        placedDoors.push(doorPosKey);
                        this._blueprint[z][pos.x][pos.y] = door;
                        break;
                    } else {
                        var diffIndex = regionDiffs.indexOf(biggestDiff);
                        regionDiffs.splice(diffIndex, 1);
                    }
                }

                // In very rare circumstances, a region will only have one connecting region.
                // I think this only happens in artificial circumstances where there is a region
                // isolated within a region (a room within a room). This happens when I place
                // stairwells after using the slice method to place rooms. If this
                // 'room within a room' has a high region number, then a door will be placed
                // to connect to it when processing the lower numbered region that surrounds it,
                // and then when it comes time to place a door for the high numbered inner region
                // there is already a door, so the algorithm does nothing. For instance, consider this scenario:

                // #####################
                // #7777#6666#555555555#
                // #7777#6666#555555555#
                // #7777+6666#555555555#
                // #7777#6666#555555555#
                // #7777#6666#555555555#
                // #7777#6666#555555555#
                // #7777#6666#555555555#
                // ####+#6666#555555555#
                // #1111#6666#555555555#
                // #1111#6666#555555555#
                // #1111#6666+555555555#
                // #########+###########
                // #2222#3333#444444444#
                // #2222#3333#444444444#
                // #2222#3333#444444444#
                // #2222+3333#444444444#
                // #2222#3333#4444444#+#
                // #2222#3333#4444444#8#
                // #2222#3333#4444444#8#
                // #####################

                // Note in the lower right corner, a stairwell has been placed and randomly given
                // the region number '8.' # = wall, + = door, numbers = regions.
                //
                // The algorithm places doors between the following regions:
                // 1-7, 2-3, 3-6, 4-8, 5-6, 6-7, and region 7 does nothing because
                // doors have already been placed when processing regions 1 and 6,
                // and region 8 does nothing because a door has already been placed
                // when processing region 4, and it is connected to nothing else. The result is that
                // region 4 is isolated from the other regions since when processing region 4,
                // a door was placed to region 8, and region 8 is connected to only region 4,
                // so it could not do anything. My solution will be to detect whether
                // the current region has only a single neighboring region.
                // If it only has a single neighboring region (again, this should not be possible
                // when using only the slice method), then add a door between the neighboring region
                // and one of it's neighboring regions. This SHOULD un-isolate the region.
                var connectingRegions = Object.keys(this._roomRegions[z].tree[region]);
                if(connectingRegions.length === 1) {
                    var parentRegion = this._roomRegions[z].tree[connectingRegions[0]];
                    for(var parentRegionConnection in parentRegion) {
                        var parentConnectorPos = parentRegion[parentRegionConnection];
                        var key = parentConnectorPos.x + "," + parentConnectorPos.y;
                        if(placedDoors.indexOf(key) === -1) {
                            placedDoors.push(key);
                            this._blueprint[z][parentConnectorPos.x][parentConnectorPos.y] = door;
                            break;
                        }
                    }
                }
            }

            // Now that we've used the algorithm to try to place doors intelligently, traverse the
            // roomRegions tree to make sure that region 1 has some path to all the other regions
            // by comparing the regions that region 1 connects to with the doors that have already
            // been placed
            var regionTree = this._roomRegions[z].tree;
            var isolatedRegions = this._getIsolatedRegions(regionTree, placedDoors);
            var breakIsolatedRegionsLoop = false;
            while(isolatedRegions.length) {
                // Take the first region off the list, and add a door too it, then update the isolatedRegions list
                // to see if the added connections has un-isolated any of the regions.
                var isolatedDoorPlaced = false;
                for (var i = 0; i < isolatedRegions.length; i++) {
                    // If for some reason the isolated region has no length, then break out of the loop
                    // TODO: fix this? Not sure how this happens, or if when it happens, rooms are left isolated
                    if(Object.keys(regionTree[isolatedRegions[i]]).length === 0 && isolatedRegions.length === 1) {
                        breakIsolatedRegionsLoop = true;
                        break;
                    } else if(Object.keys(regionTree[isolatedRegions[i]]).length === 0 && isolatedRegions.length > 1) {
                        debugger;
                    }

                    for(var isolatedConnection in regionTree[isolatedRegions[i]]) {
                        var isolatedPos = regionTree[isolatedRegions[i]][isolatedConnection];
                        var isolatedKey = isolatedPos.x + "," + isolatedPos.y;
                        // TODO: Skip placing additional doors into region 1
                        if(placedDoors.indexOf(isolatedKey) === -1) {
                            isolatedDoorPlaced = true;
                            placedDoors.push(isolatedKey);
                            this._blueprint[z][isolatedPos.x][isolatedPos.y] = door;
                            break;
                        }
                    }
                    if(isolatedDoorPlaced)
                        break;
                }
                if(breakIsolatedRegionsLoop) // Just for preventing infinite loops on occasion
                    break;
                isolatedRegions = this._getIsolatedRegions(regionTree, placedDoors);
            }
        }
    };

    this._placeItems = properties['placeItems'] || function() {
        // Loop through each z-level, placing items appropraitely
        for (var z = 0; z < this._stories; z++) {
            var randomOffsetX = [-1, 1, 0].random();

            // Keep track of x,y coordinate values of rooms on each floor.
            // This structure of this object will be like so:
            // rooms[roomNumber] = { width: int, height: int, floorKeys: []}
            var rooms = {};
            var regions = this._roomRegions[z].regions;

            for (var x = 0; x < this._width; x++) {
                for (var y = 0; y < this._height; y++) {
                    var roomNumber = regions[x][y];
                    if(roomNumber !== 0 && !rooms[roomNumber]) {
                        rooms[roomNumber] = {
                            topX: null,
                            topY: null,
                            width: 0,
                            height: 0,
                            floorKeys: []
                        };
                    }

                    if(roomNumber !== 0) {
                        var key = x + "," + y;
                        rooms[roomNumber].floorKeys.push(key);
                    }
                }
            }

            // Iterate through the rooms in order to calculate width and height
            for(var room in rooms) {
                var topX = this._getMinXFromKeys(rooms[room].floorKeys);
                var topY = this._getMinYFromKeys(rooms[room].floorKeys);
                var width = this._getWidthFromKeys(rooms[room].floorKeys);
                var height = this._getHeightFromKeys(rooms[room].floorKeys);
                rooms[room].topX = topX;
                rooms[room].topY = topY;
                rooms[room].width = width;
                rooms[room].height = height;
                if(width >= 3 && height >= 3) {
                    for(var roomX = topX, i = 0; i < width; i++, roomX++) {
                        var edgeOffsetX = 0;
                        var offsetX = roomX;
                        if(i === 0) {
                            edgeOffsetX = [0, 1].random();
                            offsetX = roomX + edgeOffsetX;
                        } else if(i === width - 1) {
                            edgeOffsetX = [0, -1].random();
                            offsetX = roomX + edgeOffsetX;
                        } else {
                            offsetX = roomX + randomOffsetX;
                        }

                        for(var roomY = topY, j = 0; j < height; j++, roomY++) {
                            // If for some reason we end up in a section of the building that does
                            // not belong to the room, skip ahead
                            if(rooms[room].floorKeys.indexOf(roomX + "," + roomY) === -1)
                                continue;

                            // Place desks and chairs every other tile
                            if(i % 2 === 0 && j % 2 === 0) {
                                var desk = Game.ItemRepository.create('desk');
                                this.addItem(roomX, roomY, z, desk);

                                // Place chair intelligently, no diagnals
                                var offsetY = roomY;
                                if(offsetX == roomX) {
                                    if(j === 0)
                                        offsetY++;
                                    else if(j === height - 1)
                                        offsetY--;
                                    else
                                        offsetY = roomY + [1, -1].random();
                                }

                                if(
                                    rooms[room].floorKeys.indexOf(offsetX + "," + offsetY) > -1 &&
                                    this._blueprint[z][offsetX][offsetY].getName() == 'floor'
                                ) {
                                    var chair = Game.ItemRepository.create('chair');
                                    this.addItem(offsetX, offsetY, z, chair);

                                    // Add this to a list of job locations
                                    this.addJobLocation(offsetX + ',' + offsetY + ',' + z);
                                }
                            }
                        }
                    }
                }
            }
            this._rooms[z] = rooms;
        }
    };

    this._placeJobs = properties['placeJobs'] || function(companyType) {
        var type = companyType || 'corp';
        var company = this._companyGenerator.generate(type);
        this._companies.push(company);

        while(this._jobLocations.length && company) {
            if(company.getJobLocations().length < company.getAvailablePositions())
                company.addJobLocation(this._jobLocations.shift());
            else {
                // If jobs have been filled or there is an error, company will return false
                company = this._companyGenerator.generate('corp');
                if(company)
                    this._companies.push(company);
            }
        }
    };

    this.build = properties['build'] || function() {
        // Create the initial 3D array, consisting of the outer
        // wall (including windows), doors, and optional stairways
        this._createBlueprint();

        if(this._stories > 1)
            this._placeStairs();

        if(this._roomNumber !== false)
            this._placeRooms();

        this._generateRoomRegions();
        this._placeDoors();
        this._placeItems();
        this._placeJobs();
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
Game.Building.prototype.getStories = function() {
    return this._stories;
};
Game.Building.prototype.getBlueprint = function() {
    return this._blueprint;
};
Game.Building.prototype.getRoomRegions = function() {
    return this._roomRegions;
};
Game.Building.prototype.getRandomRegionTile = function(region, z) {
    var regionCoords = [];
    for(var x = 0; x < this._roomRegions[z].regions.length; x++)
        for(var y = 0; y < this._roomRegions[z].regions[x].length; y++)
            if(this._roomRegions[z].regions[x][y] === region)
                regionCoords.push(`${x},${y},${z}`);

    return regionCoords.random();
};
Game.Building.prototype.getName = function() {
    return this._name;
};
Game.Building.prototype.getLivingLocations = function() {
    return this._livingLocations;
};
Game.Building.prototype.addLivingLocation = function(location) {
    if(this._livingLocations.indexOf(location) < 0)
        this._livingLocations.push(location);
};
Game.Building.prototype.getJobLocations = function() {
    return this._jobLocations;
};
Game.Building.prototype.addJobLocation = function(location) {
    if(this._jobLocations.indexOf(location) < 0)
        this._jobLocations.push(location);
};
Game.Building.prototype.getCompanies = function() {
    return this._companies;
};
Game.Building.prototype._sliceMethod = function(floor) {
    // This assumes that the perimeter tiles are outerWalls,
    // and that rooms should be placed within the perimeter.

    // If on the first z-level, start with a random orientation. Depending on orientation,
    // then pick a random number along the length or height of the building floor that's
    // not an edge or right next to an edge. Place inner walls directly along this line.
    // Then, place a door along this wall, and then flip the orientation of the slice,
    // and repeat. When placing tiles, it is important to stop along outer walls. When an inner wall is
    // encountered, count the current number of rooms. If it is equal to the number desired, then stop.
    // Other wise, proceed slicing and flipping until the ammount of rooms desired is reached.
    var verticalWall = Game.TileRepository.create('inside wall-vertical');
    var horizontalWall = Game.TileRepository.create('inside wall-horizontal');
    var sliceOrientation = Math.round(ROT.RNG.getUniform()) ? 'vertical' : 'horizontal';


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
                    if(floor[randomX][i].getName() === 'floor') {
                        currentWall.push({x: randomX, y: i});
                    } else if((floor[randomX][i].isInnerWall() && count + 2 <= this._roomNumber) || floor[randomX][i].isOuterWall()) {
                        continue;
                    } else {
                        break;
                    }
                }
            } else if(sliceOrientation == 'horizontal') {
                var randomY = Game.getRandomInRange(2, this._height - 2);
                for (var i = 0; i < this._width; i++) {
                    if(floor[i][randomY].getName() === 'floor') {
                        currentWall.push({x: i, y: randomY});
                    } else if((floor[i][randomY].isInnerWall() && count + 2 <= this._roomNumber) || floor[i][randomY].isOuterWall()) {
                        continue;
                    } else {
                        break;
                    }
                }
            }

            var placeWall = true;
            for (var i = 0; i < currentWall.length; i++) {
                var cw = currentWall[i];
                var noSurroundingWalls = this._noSurroundingWalls(floor, cw.x, cw.y, sliceOrientation);
                if(!noSurroundingWalls) {
                    placeWall = false;
                    break;
                }
            }

            if(placeWall) {
                for (var i = 0; i < currentWall.length; i++) {
                    var cw = currentWall[i];
                    floor[cw.x][cw.y] = (sliceOrientation == 'vertical') ? verticalWall : horizontalWall;
                }
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
Game.Building.prototype._fillRooms = function(floor, z) {
    // Initialize the regions array
    var regions = new Array(floor.length);
    for (var x = 0; x < regions.length; x++) {
        regions[x] = new Array(floor[0].length);
        for (var y = 0; y < regions[x].length; y++) {
            regions[x][y] = 0;
        }
    }

    // If on z-level 0, random starting location for filling that's not an edge or wall
    // It is assumed that since walls are placed one tile apart,
    // there should be a floor tile fairly easily to find
    //
    // If on any other z-level than 0, the starting location needs to be wherever the downstairs are,
    // since that will be where the player will access the higher levels from (having arived from the
    // upstairs on the lower z-level)
    var startX, startY;
    if(z === 0) {
        var side = Game.getRandomInRange(0, 3);
        var scanDirection = Math.round(ROT.RNG.getUniform()) ? 'forwards' : 'backwards';
        var firstPass = false;
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
                        if(firstPass === true) {
                            debugger;
                        } else if(scanDirection == 'forwards'){
                            scanDirection = 'backwards';
                            firstPass = true;
                        } else {
                            scanDirection = 'forwards';
                            firstPass = true;
                        }
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
                        if(firstPass === true) {
                            debugger;
                        } else if(scanDirection == 'forwards'){
                            scanDirection = 'backwards';
                            firstPass = true;
                        } else {
                            scanDirection = 'forwards';
                            firstPass = true;
                        }
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
                        if(firstPass === true) {
                            debugger;
                        } else if(scanDirection == 'forwards'){
                            scanDirection = 'backwards';
                            firstPass = true;
                        } else {
                            scanDirection = 'forwards';
                            firstPass = true;
                        }
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
                        if(firstPass === true) {
                            debugger;
                        } else if(scanDirection == 'forwards'){
                            scanDirection = 'backwards';
                            firstPass = true;
                        } else {
                            scanDirection = 'forwards';
                            firstPass = true;
                        }
                    }
                }
                break;
        }
    } else {
        for (var x = 0; x < floor.length; x++) {
            for (var y = 0; y < floor[x].length; y++) {
                if(floor[x][y].getName() === 'stairsDown') {
                    startX = x;
                    startY = y;
                    break;
                }
            }
            if(typeof startX !== 'undefined' && typeof startY !== 'undefined') {
                break;
            }
        }
    }


    // Start filling regions. Will return a completed 2D grid of regions.
    // While filling, if it fails the _canFill check, it should still get the neighbors
    // and check if it can fill any of the neighboring tiles of the unfillable tile.
    // If it can, then that starting location is added to the list of starting locations
    // to try to fill from, along with its region and parent region
    regions = this._fillRegions(regions, floor, 1, startX, startY);
    return regions;
};
Game.Building.prototype._fillRegions = function(regions, floor, region, x, y) {
    var startLocations = [{x: x, y: y}];

    // The regionTree is an object of the regions of a floor. Each region has an object of connections,
    // which are objects structred like so: region(int): {x: int, y: int}}
    var regionTree = {
        1: {}
    };
    while(startLocations.length > 0) {
        // Important to shift and not pop!! Shifting means that we get to the start locations
        // in the order that they are added to the array, which means the regions are filled
        // sequentially, instead of the snake-like fill that will result from taking the most
        // recent addition. Popping and pushing throughout the rest of the algorithm is
        // fine I think.
        var start = startLocations.shift();

        // If a region has not already been placed, update the region of the start tile and
        // begin filling. After the fill for this room is done, increment the region number.
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

    return {tree: regionTree, regions: regions};
};
Game.Building.prototype._canFillRegion = function(regions, tiles, x, y) {
    if(x < 0 || y < 0 || x >= this._width || y >= this._height) {
        return false;
    }
    // Make sure the tile does not already have a region
    if(regions[x][y] !== 0) {
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
            if (dX === 0 && dY === 0) {
                continue;
            } else if(dX !== 0 && dY !== 0) {
                continue;
            }
            tiles.push({x: x + dX, y: y + dY});
        }
    }
    return tiles.randomize();
};

Game.Building.prototype.getItems = function() {
    return this._items;
};

Game.Building.prototype.getItemsAt = function(x, y, z) {
    return this._items[x + ',' + y + ',' + z];
};

Game.Building.prototype.setItemsAt = function(x, y, z, items) {
    // If our items array is empty, then delete the key from the table.
    var key = x + ',' + y + ',' + z;
    if (items.length === 0) {
        if (this._items[key]) {
            delete this._items[key];
        }
    } else {
        // Simply update the items at that key
        this._items[key] = items;
    }
};

Game.Building.prototype.addItem = function(x, y, z, item) {
    // If we already have items at that position, simply append the item to the list of items.
    var key = x + ',' + y + ',' + z;
    if (this._items[key]) {
        this._items[key].push(item);
    } else {
        this._items[key] = [item];
    }
};

Game.Building.prototype._getIsolatedRegions = function(regionTree, placedDoors) {
    var allRegions = Object.keys(regionTree);
    var region1Connections = [];
    var scanRegions = [1]; // start with region 1...
    while(scanRegions.length) {
        var currentRegion = scanRegions.pop();
        var currentRegionConnections = regionTree[currentRegion];
        for(var currentRegionConnection in currentRegionConnections) {
            var wallPos = currentRegionConnections[currentRegionConnection];
            var wallPosKey = wallPos.x + "," + wallPos.y;
            // Check if the door has been placed and if it has, make sure that this isn't already a connection for region 1
            if(placedDoors.indexOf(wallPosKey) > -1 && region1Connections.indexOf(currentRegionConnection) === -1) {
                scanRegions.push(currentRegionConnection);
                region1Connections.push(currentRegionConnection);
            }
        }
    }

    // See if any regions cannot be pathed to from region 1
    return allRegions.filter(function(currReg) {
        if(this.indexOf(currReg) === -1)
            return true;
        else
            return false;
    }, region1Connections);
};

Game.Building.prototype._getMinXFromKeys = function(keys) {
    var listX = [];
    // Put all the x values in the list of keys into a single array
    for (var i = 0; i < keys.length; i++) {
        listX.push(keys[i].split(",")[0]);
    }

    var minX = Math.min.apply(null, listX);
    return minX;
};

Game.Building.prototype._getMaxXFromKeys = function(keys) {
    var listX = [];
    // Put all the x values in the list of keys into a single array
    for (var i = 0; i < keys.length; i++) {
        listX.push(keys[i].split(",")[0]);
    }

    var minX = Math.max.apply(null, listX);
    return minX;
};

Game.Building.prototype._getMinYFromKeys = function(keys) {
    var listY = [];
    // Put all the x values in the list of keys into a single array
    for (var i = 0; i < keys.length; i++) {
        listY.push(keys[i].split(",")[1]);
    }

    var minY = Math.min.apply(null, listY);
    return minY;
};

Game.Building.prototype._getMaxYFromKeys = function(keys) {
    var listY = [];
    // Put all the x values in the list of keys into a single array
    for (var i = 0; i < keys.length; i++) {
        listY.push(keys[i].split(",")[1]);
    }

    var minY = Math.max.apply(null, listY);
    return minY;
};

Game.Building.prototype._getWidthFromKeys = function(keys) {
    var minX = this._getMinXFromKeys(keys);
    var maxX = this._getMaxXFromKeys(keys);
    return maxX - minX;
};

Game.Building.prototype._getHeightFromKeys = function(keys) {
    var minY = this._getMinYFromKeys(keys);
    var maxY = this._getMaxYFromKeys(keys);
    return maxY - minY;
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
        }
        string += "\n";
    }
    console.log(string);
};
