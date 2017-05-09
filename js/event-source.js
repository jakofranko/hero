// An event source is essentially an actor that, every turn, has a low chance of 'spawning' an event. Event sources determine the kinds of events they can spawn, how often, and logic on how to disable them (if applicable) 
Game.EventSource = function(properties) {
    var requiredProps = ['name', 'maxEvents', 'eventTypes'];

    // Make sure the required properties are defined
    requiredProps.forEach(p => {
        if(!properties[p])
            throw new Error(`Event source must have ${p} defined`);
    });

    this._map                = null;
    this._name               = properties['name'];
    this._maxActiveEvents    = properties['maxActiveEvents'];     // 2; Max
    this._activeEvents       = [];
    this._eventTypes         = properties['eventTypes'];    // ['robbery', 'drug deal', 'arms deal']
    this._spawnChance        = properties['spawnChance'] || 0.01;   // Between 0 and 1, 0 being no chance and 1 being every time

    // TODO: need to add property 'spawnCondition' that is factored when 
    // spawning to handle things like "only spawn if spawnChance && crime > 50" etc.

    // Should only act once per 'round'
    this._speed = 1;
};
Game.EventSource.prototype.getName = function() {
    return this._name;
};
Game.EventSource.prototype.getMap = function() {
    return this._map;
};
Game.EventSource.prototype.getActiveEvents = function() {
    return this._map;
};

Game.EventSource.prototype.act = function() {
    if(Math.random() < this._spawnChance)
        this._spawn();
};

Game.EventSource.prototype._spawn = function() {
    if(this.activeEvents.length + 1 > this.maxActiveEvents)
        return false;

    var type = this.eventTypes.random(),
        event = Game.EventRepository.create(type, {map: this._map});

    event.start();
    this.activeEvents.push(event);

    return true;
};