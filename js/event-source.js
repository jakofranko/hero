// An event source is essentially an actor that, every turn, has a low chance of 'spawning' an event. Event sources determine the kinds of events they can spawn, how often, and logic on how to disable them (if applicable) 
Game.EventSource = function(properties) {
    var requiredProps = ['name', 'maxActiveEvents', 'eventTypes'];

    // Make sure the required properties are defined
    requiredProps.forEach(p => {
        if(!properties[p])
            throw new Error(`Event source must have ${p} defined`);
    });

    this._map                = null;
    this._name               = properties['name'];
    this._maxActiveEvents    = properties['maxActiveEvents'];       // 2; Max
    this._activeEvents       = [];
    this._eventTypes         = properties['eventTypes'];            // ['robbery', 'drug deal', 'arms deal']
    this._spawnChance        = properties['spawnChance'] || 0.01;   // Between 0 and 1, 0 being no chance and 1 being every time
    this._spawnCondition     = properties['spawnCondition'] || function() { return true; };

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
    return this._activeEvents;
};

Game.EventSource.prototype.act = function() {
    if(Math.random() < this._spawnChance)
        this._spawn();
};

Game.EventSource.prototype._spawn = function() {
    if(this._activeEvents.length + 1 > this._maxActiveEvents)
        return false;
    else if(this._spawnCondition() === false)
        return false;

    var type = this._eventTypes.random(),
        event = Game.EventRepository.create(type, {map: this._map});

    event.start();
    this._activeEvents.push(event);

    return true;
};