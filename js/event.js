// An event can really be boiled down to this: a group of or single NPC/item that is out of the ordinary, that when interacted with has an effect upon the win/lose condition of Justice. So, the things that need to make up an event are:
//
// 1. List of NPCs or items specific to the event
// 2. Logic on where to spawn them
// 3. Hooks for what happens when an NPC or item is interacted with in a way that effects the event
//
// The rest really should be handled by the player and the NPCs/items, which will mean adding mixins that are attached to these special entities.
// The 'Active Event Queue' should be where the loss and success conditions are checked.
Game.Event = function(properties) {
    var requiredProps = [
        'name',
        'map',
        'spawnLocations',
        'entityTypes',
        'minEntities',
        'maxEntities',
        'successCondition',
        'lossCondition',
        'successEffect',
        'lossEffect',
    ];

    // Ensure required props else throw error
    requiredProps.forEach(prop => {
        if(!properties[prop])
            throw new Error(`The property '${prop}' is not set for this event, and is required`);
    });

    this._id             = null; // For finding events in active event queues. Assigned upon start.
    this._name           = properties['name'];
    this._map            = properties['map'];
    this._location       = null; // Will be determined on start
    this._turns          = 0; // incremented by the event source
    this._won            = false;
    this._lost           = false;
    this._isPublic       = properties['isPublic'] || true;
    this._startMessage   = properties['startMessage'] || `A ${this._name} event started`;
    this._successMessage = properties['successMessage'] || `You succeed in completing the ${this._name} event`;
    this._failMessage    = properties['failMessage'] || `You failed to complete the ${this._name} event`;
    this._spawnLocations = properties['spawnLocations']; // Types of items (usually) where an event can spawn
    this._entityTypes    = properties['entityTypes'];
    this._minEntities    = properties['minEntities'];
    this._maxEntities    = properties['maxEntities'];
    this._onEntitySpawn  = properties['onEntitySpawn'] || function(entity){console.log(entity)};

    // Conditions for the event being a 'success' or a 'loss'
    this._successCondition = properties['successCondition'];
    this._successEffect    = properties['successEffect'];
    this._lossCondition    = properties['lossCondition'];
    this._lossEffect       = properties['lossEffect'];

    // 'Hooks' or 'Listeners' for when event entities do stuff
    this._onKO  = properties['onKO'] || function(victim, killer) { console.log(`Entity '${victim.getName()}' was knocked out by '${killer.getName()}'`); };
    this._onDeath  = properties['onDeath'] || function(victim, killer) { console.log(`Entity '${victim.getName()}' was kill by '${killer.getName()}'`); };
    this._onKill  = properties['onKill'] || function(killer, victim) { console.log(`Entity '${killer.getName()}' has killed '${victim.getName()}'`); };
    this._onInteraction  = properties['onInteraction'] || function(entity, interaction) { console.log(`Entity '${entity.getName()}' was interacted with (${interaction})`); };
    this._onTurn = properties['onTurn'] || function() { console.log('Turn: ' + this._turns); };

    // Cache objects for when the event starts
    this._entities = [];
};

// Getters
Game.Event.prototype.getName = function() {
    return this._name;
};
Game.Event.prototype.getMap = function() {
    return this._map;
};
Game.Event.prototype.getLocation = function() {
    return this._location;
};
Game.Event.prototype.getSpawnLocations = function() {
    return this._spawnLocations;
};
Game.Event.prototype.getTurns = function() {
    return this._turns;
};
Game.Event.prototype.addTurn = function() {
    this._turns++;
};
Game.Event.prototype.getEntityTypes = function() {
    return this._entityTypes;
};
Game.Event.prototype.getEntities = function() {
    return this._entities;
};
Game.Event.prototype.getId = function() {
    return this._id;
};
Game.Event.prototype.isWon = function() {
    return this._won;
};
Game.Event.prototype.isLost = function() {
    return this._lost;
};
Game.Event.prototype.isPublic = function() {
    return this._isPublic;
};
Game.Event.prototype.getStartMessage = function() {
    return this._startMessage;
};
Game.Event.prototype.getFailMessage = function() {
    return this._failMessage;
};
Game.Event.prototype.getSuccessMessage = function() {
    return this._successMessage;
};

// Setters
Game.Event.prototype.setId = function(id) {
    this._id = id;
};

// Misc. functions
Game.Event.prototype.removeEntity = function(entityIndex) {
    this._entities.splice(entityIndex, 1);
};

Game.Event.prototype.start = function() {
    var numEntities = Game.getRandomInRange(this._minEntities, this._maxEntities),
        spawnItem = false;

    // Try to grab a random spawn location
    var tries = 20;
    while(tries > 0 && !spawnItem) {
        spawnItem = this._map.getRandomItemByType(this._spawnLocations.random());
        tries--;
    }

    if(!spawnItem)
        debugger;

    var spawnLocation = spawnItem.getLocation(),
        splitLocation = spawnLocation.split(","),
        spawnRadius = Math.max(3, Math.ceil(numEntities / 2)),
        spawnLocations = [],
        maxTimes = 100;

    for (var i = 0; i < numEntities; i++) {
        // Check that we haven't already spawned an entity at the random location and the floor is empty
        var numTimes = 0,
            spawnX, spawnY;

        do {
            spawnX = Number(splitLocation[0]) + Game.getRandomInRange(-spawnRadius, spawnRadius);
            spawnY = Number(splitLocation[1]) + Game.getRandomInRange(-spawnRadius, spawnRadius);
            numTimes++;
        } while(
            (!this._map.getTile(spawnX, spawnY, splitLocation[2]).isWalkable() ||
            this._map.getEntityAt(spawnX, spawnY, splitLocation[2]) ||
            spawnLocations.indexOf(`${spawnX},${spawnY},${splitLocation[2]}`) !== -1) &&
            numTimes < maxTimes
        );

        if(numTimes === maxTimes)
            throw new Error('Exceeded number of tries for placing an entity for an event');

        spawnLocations.push(`${spawnX},${spawnY},${splitLocation[2]}`);

        // TODO: [EVENTS] Might need to update this to include special settings for the entity's event mixin based on the event template
        var entity = Game.EntityRepository.createEntity(this._entityTypes.random(), {event: this});

        this._map.addEntityAt(entity, spawnX, spawnY, splitLocation[2]);
        this._entities.push(entity);

        // Finally perform the event-specific actions for entity spawn
        this._onEntitySpawn(entity);
    }

    this._location = spawnLocation;
};

// Handling events
Game.Event.prototype.raiseEvent = function(event, ...args) {
    var hook = `_${event}`;
    if(!this[hook])
        throw new Error(`There is no hook for '${event}.' Please define one in the event definition`);

    // Trigger the hook
    this[hook].apply(this, args);

    // Check to see if the event is over (success or loss)
    if(this._successCondition()) {
        this._successEffect();
        this._won = true;
    } else if(this._lossCondition()) {
        this._lossEffect();
        this._lost = true;
    }

    return true;
};
