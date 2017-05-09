// An event can really be boiled down to this: a group of or single NPC/item that is out of the ordinary, that when interacted with has an effect upon the win/lose condition of Justice. So, the things that need to make up an event are:
//
// 1. List of NPCs or items specific to the event
// 2. Logic on where to spawn them
// 3. Hooks for what happens when an NPC or item is interacted with in a way that effects the event
//
// The rest really should be handled by the player and the NPCs/items, which will mean adding mixins that are attached to these special entities
// TODO: Add property to handle win and lose conditions and handlers for events (to be ultimately defined by the event template)
Game.Event = function(properties) {
    var requiredProps = [
        'name',
        'map',
        'spawnLocations',
        'entityTypes',
        'minEntities',
        'maxEntities'
    ];

    // Ensure required props else throw error
    requiredProps.forEach(prop => {
        if(!properties[prop])
            throw new Error(`The property '${prop}' is not set for this event, and is required`);
    });

    this._name           = properties['name'];
    this._map            = properties['map'];
    this._spawnLocations = properties['spawnLocations']; // Types of items (usually) where an event can spawn
    this._entityTypes    = properties['entityTypes'];
    this._minEntities    = properties['minEntities'];
    this._maxEntities    = properties['maxEntities'];

    // 'Hooks' or 'Listeners' for when event entities do stuff
    this._onEntityDeath  = properties['onEntityDeath'] || function(entity) { console.log(`Entity '${entity.getName()}' has died`); } ;

    // Cache objects for when the event starts
    this._entities = [];
};
Game.Event.prototype.getName = function() {
    return this._name;
};
Game.Event.prototype.getMap = function() {
    return this._map;
};
Game.Event.prototype.getSpawnLocations = function() {
    return this._spawnLocations;
};
Game.Event.prototype.getEntityTypes = function() {
    return this._entityTypes;
};
Game.Event.prototype.getEntities = function() {
    return this._entities;
};

Game.Event.prototype.start = function() {
    var numEntities = Game.getRandomInRange(this._minEntities, this._maxEntities),
        spawnItem = this._map.getRandomItemByType(this._spawnLocations.random()), // will return an object: {location: string, item: object}
        spawnLocation = spawnItem.location,
        splitLocation = spawnLocation.split(","),
        spawnRadius = Math.max(3, Math.ceil(numEntities / 2)),
        spawnLocations = [],
        maxTimes = 100;

    debugger;
    for (var i = 0; i < numEntities; i++) {
        // Check that we haven't already spawned an entity at the random location and the floor is empty
        var numTimes = 0,
            spawnX, spawnY;
        do {
            spawnX = splitLocation[0] + Game.getRandomInRange(-spawnRadius, spawnRadius);
            spawnY = splitLocation[1] + Game.getRandomInRange(-spawnRadius, spawnRadius);
            numTimes++;
        } while(!this._map.isEmptyFloor(spawnX, spawnY, split[2]) && spawnLocations.indexOf(`${spawnX},${spawnY},${splitLocation[2]}`) === -1 && numTimes < maxTimes);

        if(numTimes === maxTimes)
            throw new Error('Exceeded number of tries for placing an entity for an event');


        // TODO: Might need to update this to include special settings for the entity's event mixin based on the event template
        var entity = Game.EntityRepository.create(this._entityTypes.random(), {event: this});

        this._map.addEntityAtRandomPosition(entity, splitLocation[2]);
        this._spawnLocations.push(`${spawnX},${spawnY},${splitLocation[2]}`);
        this._entities.push(entity);
    }
    Game.addActiveEvent(this);
};