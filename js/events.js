// Events will have the logic for the entities involved in it, where it will take place, and the logic for how the event 'succeeds' and 'fails.' Entities that are spawned as part of an event should have a special mixin that has listeners for events like onDeath, which will in turn trigger events for the 'active events'

var event = {
    name: 'robbery',
    spawnLocations: ['cash register', 'vault', 'jewlery case'],
    entities: ['gunman', 'robber'],
    minEntities: 2,
    maxEntities: 6,
    numEntities: null,
    onEntityDeath: function() {
        if(numEntities < 1)
            Game.Events.eventSuccess(this);
        else
            numEntities--;
    }
};