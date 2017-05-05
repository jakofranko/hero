// An event source is essentially an actor that, every turn, has a low chance of 'spawning' an event. Event sources determine the kinds of events they can spawn, how often, and logic on how to disable them (if applicable) 
Game.EventSource = function(properties) {
    var requiredProps = ['name', 'maxEvents', 'eventTypes', 'spawnChance'];

    // Make sure the required properties are defined
    requiredProps.forEach(p => {
        if(!properties[p])
            throw new Error(`Event source must have ${p} defined`);
    });

    this.name               = properties['name'];
    this.maxActiveEvents    = properties['maxActiveEvents'];     // 2; Max
    this.activeEvents       = [];
    this.eventTypes         = properties['eventTypes'];    // ['robbery', 'drug deal', 'arms deal']
    this.spawnChance        = properties['spawnChance'];   // 0.01

};

Game.EventSource.prototype.spawn = function() {
    if(this.activeEvents.length + 1 > this.maxActiveEvents)
        return false;

    var type = this.eventTypes.random(),
        event = new Game.Event(type);

    event.start();
    this.activeEvents.push(event);+

    Game.addActiveEvent(event);
    return true;
};