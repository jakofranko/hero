// @size should be square number of lots for a city.
// TODO: Add utilities to handle activeEvent queue
// TODO: Add utilities to fetch event sources from the city and then schedule them
Game.Map = function(size, player) {
    this._city = new Game.City(size);
    this._city.init();

    // Justice System for this city
    this._justice = new Game.Justice();

    // Used for drawing to various displays 
    this._tiles = this._city.tilesFromLots();

    // Cache dimensions
    this._depth = this._tiles.length;
    this._width = this._tiles[0].length;
    this._height = this._tiles[0][0].length;

    // Cache certain tile types for path-finding
    this._downStairs = this.getTileList('stairsDown');
    this._upStairs = this.getTileList('stairsUp');

    // Setup the field of visions
    this._fov = [];
    this.setupFov();

    // This will only work if this._city.tilesFromLots() has been called first
    this._items = this._city.getItems();

    // Create the engine and scheduler
    this._scheduler = new ROT.Scheduler.Speed();
    this._engine = new ROT.Engine(this._scheduler);

    // Create a time object
    this._time = new Game.Time();
    this.schedule(this._time);

    // Event settings. Fetch event sources from city and schedule them
    this._activeEvents = [];
    this._currentEventId = 0;
    this._eventSources = this._city.getEventSources();
    for(var i = 0; i < this._eventSources.length; i++)
        this.schedule(this._eventSources[i]);

    // Setup the explored array
    this._explored = new Array(this._depth);
    this._setupExploredArray();

    // Create a table which will hold the entities
    this._entities = {};
    this._generateEntities();

    // Add the Player
    this._player = player;
    var playerLoc = this._city.getLivingLocations()[0].split(",");
    this.addEntityAt(player, playerLoc[0] - 1, playerLoc[1] - 1, 0);

    // TODO: [EVENTS] Delete this after creating banks and such
    this.addItem(Number(playerLoc[0]) + 1, Number(playerLoc[1]), 0, Game.ItemRepository.create('safe'));
    this.addItem(Number(playerLoc[0]) + 2, Number(playerLoc[1]), 0, Game.ItemRepository.create('vault door'));
    this.addItem(Number(playerLoc[0]), Number(playerLoc[1]) + 1, 0, Game.ItemRepository.create('cash register'));
};

// Standard getters
Game.Map.prototype.getDepth = function() {
    return this._depth;
};
Game.Map.prototype.getWidth = function() {
    return this._width;
};
Game.Map.prototype.getHeight = function() {
    return this._height;
};
Game.Map.prototype.getScheduler = function() {
    return this._scheduler;
};
Game.Map.prototype.getEngine = function() {
	return this._engine;
};
Game.Map.prototype.getEntities = function() {
	return this._entities;
};
Game.Map.prototype.getPlayer = function() {
    return this._player;
};
Game.Map.prototype.getCity = function() {
    return this._city;
};
Game.Map.prototype.getTime = function() {
    return this._time;
};
Game.Map.prototype.getJustice = function() {
    return this._justice;
};
Game.Map.prototype.getEventSources = function() {
    return this._eventSources;
};
Game.Map.prototype.getActiveEvents = function() {
    return this._activeEvents;
};
Game.Map.prototype.getCurrentEventId = function() {
    return this._currentEventId;
};

// For just adding actors to the scheduler
Game.Map.prototype.schedule = function(actor) {
    if('act' in actor) {
        this._scheduler.add(actor, true);
    }
    if('_map' in actor) {
        actor._map = this;
    }
};

// Entities
Game.Map.prototype.addEntity = function(entity) {
	// Set the entity's map
	entity.setMap(this);

	// Add the entity to the map's list of entities
	this.updateEntityPosition(entity);

	// Check to see if the entity is an actor
	// If so, add them to the scheduler
	if(entity.hasMixin('Actor')) {
		this._scheduler.add(entity, true);
	}

    // If the entity is a criminal, update the city's justice system
    if(entity.hasMixin('JobActor')) {
        var jobs = entity.getJobs();
        for (var i = 0; i < jobs.length; i++) {
            if(Game.Jobs[jobs[i]].crime) {
                this.getJustice().addCriminals(1);
                break;
            }
        }
    }

    // If the entity is the player, set the player.
    if (entity.hasMixin(Game.EntityMixins.PlayerActor)) {
        this._player = entity;
    }
};
Game.Map.prototype.addEntityAt = function(entity, x, y, z) {
    entity.setX(x);
    entity.setY(y);
    entity.setZ(z);
    this.addEntity(entity);
};
Game.Map.prototype.addEntityAtRandomPosition = function(entity, z) {
	var position = this.getRandomFloorPosition(z);
	entity.setX(position.x);
	entity.setY(position.y);
	entity.setZ(position.z);
	this.addEntity(entity);
};
Game.Map.prototype.getEntityAt = function(x, y, z) {
	// Get the entity based on position key 
    return this._entities[x + ',' + y + ',' + z];
};
Game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY, centerZ, radius) {
	var results = [];
	// Determine the bounds...
	var leftX = centerX - radius;
	var rightX = centerX + radius;
	var topY = centerY - radius;
	var bottomY = centerY + radius;
	for (var key in this._entities) {
		var entity = this._entities[key];
		if (entity.getX() >= leftX && 
			entity.getX() <= rightX && 
			entity.getY() >= topY && 
			entity.getY() <= bottomY &&
			entity.getZ() == centerZ) {
			results.push(entity);
		}
	}
	return results;
};
Game.Map.prototype.removeEntity = function(entity) {
	// Find the entity in the list of entities if it is present
    var key = entity.getX() + ',' + entity.getY() + ',' + entity.getZ();
    if(this._entities[key] == entity) {
    	delete this._entities[key];
    }

    // If the entity is an actor, remove them from the scheduler
    if (entity.hasMixin('Actor')) {
        this._scheduler.remove(entity);
    }

    // If the entity is the player, update the player field.
    if (entity.hasMixin(Game.EntityMixins.PlayerActor)) {
        this._player = undefined;
    }
};
Game.Map.prototype.updateEntityPosition = function(entity, oldX, oldY, oldZ) {
	// Delete the old key if it is the same entity and we have old positons
	if(oldX !== undefined) {
		var oldKey = oldX + "," + oldY + "," + oldZ;
		if(this._entities[oldKey] == entity) {
			delete this._entities[oldKey];
		}
	}

	// Make sure the entity's position is within bounds
	if (entity.getX() < 0 || entity.getX() >= this._width ||
		entity.getY() < 0 || entity.getY() >= this._height ||
		entity.getZ() < 0 || entity.getZ() >= this._depth) {
		throw new Error("Entity's position is out of bounds.");
	}

	// Sanity check to make sure there is no entity at the new position
	var key = entity.getX() + "," + entity.getY() + "," + entity.getZ();
	if (this._entities[key]) {
        throw new Error('Tried to add an entity at an occupied position.');
    }

    // Add the entity to the table of entities
    this._entities[key] = entity;
};
Game.Map.prototype.post12Recovery = function() {
    for(var e in this._entities) {
        if(this._entities[e].hasMixin('Characteristics'))
            this._entities[e].raiseEvent('post12Recovery');
    }
};

Game.Map.prototype._generateEntities = function() {
    var criminals = 0,
        companies = this._city.getCompanies(),
        currentCompany = 0,
        livingLocations = this._city.getLivingLocations(),
        currentLivingLocation = 0;
    var addedWork = false;
    for (var i = 0; i < Game.getTotalEntities(); i++) {
        // The template has to be created each time, because making it once
        // outside the loop and then changing it changes all entities
        // created with the template
        var template;
        if(criminals <= Game.getTotalCriminals()) {
            template = {
                // In order for mugging to rank higher than survive,
                // their money / survive priority needs to be higher
                // than 10 (which is the survive priority). I.e., >100
                money: ROT.RNG.getNormal(50, 25),
                jobs: ['mugger', 'home', 'survive']
            };
        } else {
            template = {
                money: ROT.RNG.getNormal(100, 50),
                jobs: ['work', 'home', 'survive']
            };
        }

        var entity = Game.EntityRepository.createEntity('person', template);

        // Give the entity a job
        if(companies[currentCompany].getAvailablePositions() <= 0)
            currentCompany++;

        // Add the entity as an employee of the current company
        companies[currentCompany].addEmployee(entity);

        // Add the entity at a random position on the map
        var livingLocation = livingLocations[currentLivingLocation];
        if(livingLocation) {
            // Make sure they remember where home is
            var memory = {location: livingLocation};
            entity.remember('places', 'home', false, memory);

            // Spawn them at this location
            var split = livingLocation.split(",");
            this.addEntityAt(entity, split[0], split[1], split[2]);
            currentLivingLocation++;
        } else {
            this.addEntityAtRandomPosition(entity, 0);
        }

        if(template.jobs.indexOf('mugger') > -1)
            criminals++;
    }
};

// Floors
Game.Map.prototype.isEmptyFloor = function(x, y, z) {
    // Check if the tile is floor and also has no entity
    return this.getTile(x, y, z).getName() == 'floor' && !this.getEntityAt(x, y, z);
};
Game.Map.prototype.getRandomFloorPosition = function(z) {
	var x, y;
	do {
		x = Math.floor(Math.random() * (this._width - 1));
		y = Math.floor(Math.random() * (this._height - 1));
	} while(!this.isEmptyFloor(x, y, z));
	return {x: x, y: y, z: z};
};

// Tiles
// Gets the tile for a given coordinate set
Game.Map.prototype.getTile = function(x, y, z) {
    // Make sure we are inside the bounds. 
    // If we aren't, return null tile.
    if (x < 0 || x >= this._width || y < 0 || y >= this._height || z < 0 || z >= this._depth) {
        return Game.TileRepository.create('null');
    } else if(!this._tiles[z][x] || !this._tiles[z][x][y]) {
        debugger;
    } else {
        return this._tiles[z][x][y] || Game.TileRepository.create('null');
    }
};
Game.Map.prototype.getTileList = function(type) {
    var tileList = [];
    for(var z = 0; z < this._depth; z++) {
        if(!tileList[z])
            tileList[z] = [];
        for(var x = 0; x < this._width; x++)
            for(var y = 0; y < this._height; y++) {
                if(!this._tiles[z][x] || !this._tiles[z][x][y])
                    continue;
                if(this._tiles[z][x][y].getName() === type)
                    tileList[z].push(x + ',' + y);
            }
    }

    return tileList;
};

// TODO: Have this support both string coords ("x,y") and arrays ([x,y])
// Return a comparisonFunction for use in Array.prototype.sort()
Game.Map.prototype._createSortByDistance = function(coord) {
    var coordSplit = coord.split(","),
        sourceX = coordSplit[0],
        sourceY = coordSplit[1];
    return function(coordA, coordB) {
        var splitA = coordA.split(","),
            aX = splitA[0],
            aY = splitA[1],
            splitB = coordB.split(","),
            bX = splitB[0],
            bY = splitB[1];

        var dA = Game.Geometry.distance(sourceX, sourceY, aX, aY);
        var dB = Game.Geometry.distance(sourceX, sourceY, bX, bY);
        return dA - dB;
    };
};
// TODO: Optimize these get path functions to sort the stairs by distance first, then find path. Additionally, most of this code is duplicated between the two functions, and could be reduced to a single function that takes a direction param
Game.Map.prototype.getPathToNearestStair = function(x, y, z, type) {
    var nearestIndex = null,
        nearestDistance = null,
        steps = [],
        map = this,
        stairType = '_' + type + 'Stairs',
        stairsX, stairsY, distance, pather;

    var canWalk = function(floorX, floorY) {
        return map.getTile(floorX, floorY, z).isWalkable();
    };

    var pushSteps = function(floorX, floorY) {
        steps.push([floorX, floorY, z]);
    };

    // Sort stairs by distance
    var stairs = this[stairType][z].sort(this._createSortByDistance(x + "," + y));

    for (var i = 0; i < stairs.length; i++) {
        var split = stairs[i].split(",");

        newSteps = [];
        stairsX = Number(split[0]);
        stairsY = Number(split[1]);

        // If nearest stair IS x,y, then this as the only path step
        if(stairsX === x && stairsY === y)
            return [[stairsX, stairsY, z]];

        pather = new ROT.Path.AStar(stairsX, stairsY, canWalk);

        pather.compute(x, y, pushSteps); // pushes to steps

        // Since steps are already sorted by distance, just return the first one with a valid path
        if(steps.length)
            return steps;
    }
    return steps;
};
Game.Map.prototype.getDownStairsInRadius = function(x, y, z, r) {
    var stairs = [];
    for (var i = 0; i < this._downStairs[z].length; i++) {
        var split = this._downStairs[z][i].split(","),
            currentX = split[0],
            currentY = split[1],
            distance = Game.Geometry.distance(x, y, currentX, currentY);
        if(distance <= r)
            stairs.push(this._downStairs[z][i]);
    }
    return stairs;
};
Game.Map.prototype.findNearestDownStair = function(x, y, z) {
    var nearestIndex = null,
        nearestDistance = null;
    for (var i = 0; i < this._downStairs[z].length; i++) {
        var split = this._downStairs[z][i].split(","),
            currentX = split[0],
            currentY = split[1],
            distance = Game.Geometry.distance(x, y, currentX, currentY);

        if(nearestDistance === null || distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = i;
        }
    }
    return this._downStairs[z][nearestIndex];
};
Game.Map.prototype.getUpStairsInRadius = function(x, y, z, r) {
    var stairs = [];
    for (var i = 0; i < this._upStairs[z].length; i++) {
        var split = this._upStairs[z][i].split(","),
            currentX = split[0],
            currentY = split[1],
            distance = Game.Geometry.distance(x, y, currentX, currentY);
        if(distance <= r)
            stairs.push(this._upStairs[z][i]);
    }
    return stairs;
};
Game.Map.prototype.findNearestUpStair = function(x, y, z) {
    var nearestIndex = null,
        nearestDistance = null;
    for (var i = 0; i < this._upStairs[z].length; i++) {
        var split = this._upStairs[z][i].split(","),
            currentX = split[0],
            currentY = split[1],
            distance = Game.Geometry.distance(x, y, currentX, currentY);

        if(nearestDistance === null || distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = i;
        }
    }
    return this._upStairs[z][nearestIndex];
};
// FOV
Game.Map.prototype.setupFov = function() {
    // Keep this in 'map' variable so that we don't lose it.
    var map = this;
    // Iterate through each depth level, setting up the field of vision
    for (var z = 0; z < this._depth; z++) {
        // We have to put the following code in it's own scope to prevent the
        // depth variable from being hoisted out of the loop.
        (function() {
            // For each depth, we need to create a callback which figures out
            // if light can pass through a given tile.
            var depth = z;
            map._fov.push(new ROT.FOV.PreciseShadowcasting(function(x, y) {
                return !map.getTile(x, y, depth).isBlockingLight();
            }));
        })();
    }
};
Game.Map.prototype.getFov = function(depth) {
    return this._fov[depth];
};

// Explored Areas
Game.Map.prototype._setupExploredArray = function() {
    for (var z = 0; z < this._depth; z++) {
        this._explored[z] = new Array(this._width);
        for (var x = 0; x < this._width; x++) {
            this._explored[z][x] = new Array(this._height);
            for (var y = 0; y < this._height; y++) {
                this._explored[z][x][y] = false;
            }
        }
    }
};
Game.Map.prototype.setExplored = function(x, y, z, state) {
    // Only update if the tile is within bounds
    if (this.getTile(x, y, z).getName() !== 'null') {
        this._explored[z][x][y] = state;
    }
};
Game.Map.prototype.isExplored = function(x, y, z) {
    // Only return the value if within bounds
    if (this.getTile(x, y, z).getName() !== 'null') {
        return this._explored[z][x][y];
    } else {
        return false;
    }
};

// Items
Game.Map.prototype.getItemsAt = function(x, y, z) {
    return this._items[x + ',' + y + ',' + z];
};

// TODO: If a cache doesn't exist, create one
Game.Map.prototype.getItemsByType = function(type) {
    var items = [];
    var searchCoords = function(item) {
        if(item.getName() === type)
            items.push(item);
    };

    for(var coords in this._items)
        this._items[coords].forEach(searchCoords);

    return items;
};
Game.Map.prototype.setItemsAt = function(x, y, z, items) {
    // If our items array is empty, then delete the key from the table.
    var key = x + ',' + y + ',' + z;
    if (items.length === 0) {
        if (this._items[key]) {
            delete this._items[key];
        }
    } else {
        // Simply update the items at that key
        items.forEach(item => {
            item.setLocation(key);
        });
        this._items[key] = items;
    }
};

Game.Map.prototype.addItem = function(x, y, z, item) {
    // If we already have items at that position, simply append the item to the list of items.
    var key = x + ',' + y + ',' + z;
    item.setLocation(key);
    if (this._items[key]) {
        this._items[key].push(item);
    } else {
        this._items[key] = [item];
    }
};

Game.Map.prototype.addItemAtRandomPosition = function(item, z) {
    var position = this.getRandomFloorPosition(z);
    this.addItem(position.x, position.y, position.z, item);
};

Game.Map.prototype.getRandomItemByType = function(type) {
    debugger;
    // First look to see if we have a cache of this item type
    var camelCaseType = type.camelCase(),
        items, item, cache, location;
    if(this.hasOwnProperty('_' + camelCaseType)) {
        cache = this['_' + camelCaseType];
        location = cache.randomKey();
        item = cache[location].random();

        return item;
    } else {
        items = this.getItemsByType(type);
        item = items.random();
        return item;
    }
};

// Events
Game.Map.prototype.addActiveEvent = function(event) {
    event.setId(this._currentEventId);
    this._currentEventId++;
    this._activeEvents.push(event);
};
Game.Map.prototype.getEventById = function(id) {
    for(var i = 0; i < this._activeEvents.length; i++)
        if(this._activeEvents[i].getId() === id)
            return this._activeEvents[i];

    return false;
};
Game.Map.prototype.removeActiveEvent = function(id) {
    for (var i = 0; i < this._activeEvents.length; i++) {
        if(this._activeEvents[i].getId() === id) {
            this._activeEvents.splice(i, 1);
            break;
        }
    }
};