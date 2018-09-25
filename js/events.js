// Events will have the logic for the entities involved in it, where it will take place,
// and the logic for how the event 'succeeds' and 'fails.' Entities that are spawned as
// part of an event should have a special mixin that has listeners for events like onDeath,
// which will in turn trigger events for the 'active events'.
Game.EventRepository = new Game.Repository('events', Game.Event);

// Note: the 'map' property is required for all events, but will need to
// be specified by the event-source (which, since it is functioning as
// an actor will have the map associated with it)
Game.EventRepository.define('bank robbery', {
    name: 'bank robbery',
    message: 'A bank robbery is underway',
    spawnLocations: ['vault door', 'cash register', 'safe'],
    entityTypes: ['robber'], // TODO: [EVENTS] Create specific templates for 'robbers', 'gunman' etc.
    minEntities: 2,
    maxEntities: 6,
    successCondition: function() {
        debugger;
        var entities = this.getEntities(),
            conscious = entities.filter(entity => entity.isConscious());

        if(entities.length < 1 || conscious.length < 1)
            return true;
        else
            return false;
    },
    successEffect: function() {
        var map = this.getMap(),
            justice = map.getJustice(),
            entities = this.getEntities();

        justice.addRespectForLaw(5);
        entities.forEach(entity => { map.removeEntity(entity); });
    },
    lossCondition: function() {
        // TODO: need to tweak this for funness
        return this.getTurns() > 150;
    },
    lossEffect: function() {
        var map = this.getMap(),
            justice = map.getJustice(),
            entities = this.getEntities();

        justice.removeRespectForLaw(5);
        entities.forEach(entity => { map.removeEntity(entity); });
    },
    onEntitySpawn: function(entity) {
        // For now, give them a place to live
        var map = this.getMap(),
            availableLivingLocations = map.getAvailableLivingLocations();

        if(availableLivingLocations.length) {
            entity.remember('places', 'home', false, {location: availableLivingLocations[0]});
            map.occupyLivingLocation(0);
        }
    },
    onKO: function(victim, attacker) {

    },
    onDeath: function(victim, killer) {
        var entities = this.getEntities();
        for (var i = 0; i < entities.length; i++) {
            if(victim == entities[i]) {
                this.removeEntity(i);
                break;
            }
        }
        console.log(`Entity '${victim.getName()}' was killed by '${killer.getName()}' for event ${this.getName()} ${this.getId()}`);
    }
});

Game.EventRepository.define('lost child', {
    name: 'lost child',
    message: 'A lost child was spotted',
    successMessage: 'You help the child find their way back home',
    spawnLocations: ['bush'],
    entityTypes: ['lost child'],
    minEntities: 1,
    maxEntities: 1,
    successCondition: function() {
        return this._childRescued; // Set in onInteraction below
    },
    successEffect: function() {
        var map = this.getMap(),
            justice = map.getJustice(),
            entities = this.getEntities();

        justice.addGoodDeeds(1);
        entities.forEach(entity => { map.removeEntity(entity); });
    },
    lossCondition: function() {
        if(this.getEntities().length < 1)
            return true;
        else
            return false;
    },
    lossEffect: function() {
        var map =  this.getMap();

        map.getJustice().removeRespectForLaw(5);
        this.getEntities().forEach(entity => { map.removeEntity(entity); });
    },
    onInteraction: function() {
        this._childRescued = true;
    },
    onDeath: function(victim, killer) {
        var entities = this.getEntities();
        for (var i = 0; i < entities.length; i++) {
            if(victim == entities[i]) {
                this.removeEntity(i);
                break;
            }
        }
        console.log(`Entity '${victim.getName()}' was killed by '${killer.getName()}' for event ${this.getName()} ${this.getId()}`);
    }
});

Game.EventRepository.define('turf war', {
    name: 'turf war',
    message: 'A turf war has begun between two rival gangs',
    successMessage: 'You stop the gangs from any further violence',
    spawnLocations: ['weapon rack'],
    entityTypes: ['thug', 'gunner', 'gang lieutenent'],
    minEntities: 7,
    maxEntities: 16,
    successCondition: function() {
        if(this.getEntities().length < 1)
            return true;
        else
            return false;
    },
    successEffect: function() {
        var map = this.getMap(),
            justice = map.getJustice(),
            entities = this.getEntities();

        justice.addGoodDeeds(1);
        entities.forEach(entity => { map.removeEntity(entity); });
    },
    lossCondition: function() {
        if(this.getEntities().length < 1)
            return true;
        else
            return false;
    },
    lossEffect: function() {
        var map =  this.getMap();

        map.getJustice().removeRespectForLaw(5);
        this.getEntities().forEach(entity => { map.removeEntity(entity); });
    },
    onInteraction: function() {
        this._childRescued = true;
    },
    onDeath: function(victim, killer) {
        var entities = this.getEntities();
        for (var i = 0; i < entities.length; i++) {
            if(victim == entities[i]) {
                this.removeEntity(i);
                break;
            }
        }
        console.log(`Entity '${victim.getName()}' was killed by '${killer.getName()}' for event ${this.getName()} ${this.getId()}`);
    }
});
