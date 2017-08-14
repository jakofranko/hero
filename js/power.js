// The Power prototype is the basic template for a power. Powers will all have an effect function
// that will be called whenever it is activated. If a power has a duration that is longer than 'instant'
// then activating the power will put it into one of the various duration queues that will be associated
// with the entity that has the PowerUser mixin. 
//
// For instance, if the player activates a 'flight' power
// that has a duration of constant, then the effect function will consist of spending the entity's END,
// and then putting the power into the entity's 'constant' queue. At the start of that entity's turn,
// the game will loop through the powers in the 'constant' queue and execute each power's 'constant' method.
//
// Powers that have these other duration methods should probably also have 'queue' and 'dequeue' methods for 
// what to do when they are added or taken out of a queue.
// TODO: [POWERS] Support for advantages
// TODO: [POWERS] Support for adders
// TODO: [POWERS] Support for limitations
// TODO: [POWERS] After advantages, adders, and limitations are in place, need to support real and active points differentiation
// TODO: [POWERS] Support for 'compound powers'
// TODO: [POWERS] Support for power frameworks
// TODO: [POWERS] Special effects?
// TODO: [POWERS] Targets? I think this can be handled implicitly by a power's defined effect
// TODO: [POWERS] Range modifier function
Game.Power =  function(properties) {
    // Validate power properties
    const DURATIONS = ['instant', 'constant', 'persistent', 'inherent'];
    const RANGES = ['self', 'no range', 'standard', 'LOS'];
    if(!DURATIONS.includes(properties['duration']))
        throw new Error(`The duration '${properties['duration']}' is not valid, and must be one of these: ${DURATIONS.join(', ')}`);
    if(!RANGES.includes(properties['range']))
        throw new Error(`The range '${properties['range']}' is not valid, and must be one of these: ${RANGES.join(', ')}`);
    if(!properties[properties['duration']])
        throw new Error(`You must define a '${properties['duration']}' function in the properties`);
    if(properties['duration'] != 'instant' && (properties['onQueue'] === undefined && properties['onDequeue'] === undefined))
        throw new Error(`The power ${properties.name} has a duration of '${properties.duration}' and must have both an 'onQueue' and 'onDequeue' function defined`);
    if(properties['type'] === 'attack' && properties['damageType'] === undefined)
        throw new Error(`You must define a damage type for attack power ${properties.name}`);

    this.name      = properties['name'];
    this.type      = properties['type'];
    this.cost      = properties['cost'];
    this.duration  = properties['duration'];
    this.pointsMin = properties['pointsMin'];
    this.pointsMax = properties['pointsMax'];
    this.points    = properties['points'] || 0;
    this.entity    = properties['entity'];
    this.END       = properties['END'] || function() { return Math.max(1, Math.round(points / 10)); };
    this.damageType = properties['damageType'];

    // Depending on the type of range, assign a different function to the range property
    switch(properties['range']) {
        case 'self':
            this.inRange = function(startX, startY, targetX, targetY) {
                return this.entity.getMap().getEntityAt(targetX, targetY, this.entity.getZ()) === this.entity;
            };
            break;
        case 'no range':
            this.inRange = function(startX, startY, targetX, targetY) {
                return Game.Geometry.distance(this.entity.getX(), this.entity.getY(), targetX, targetY) <= 1;
            };
            break;
        case 'standard':
            this.inRange = function(startX, startY, targetX, targetY) {
                return Game.Geometry.distance(this.entity.getX(), this.entity.getY(), targetX, targetY) <= (5 * this.points);
            };
            break;
        case 'LOS':
            this.inRange = function(startX, startY, targetX, targetY) {
                let target = this.entity.getMap().getEntityAt(targetX, targetY, this.entity.getZ());
                return target && this.entity.hasMixin('Sight') && this.entity.canSee(target);
            };
            break;
    }

    // The effect of a power should take into account the above properties when performing the effect.
    // For instance, when calculating the amount of damage for an energy blast, the effect will deal
    // 1 * Math.round(this.points / 5) d6 of damage to the target, spend the power's END value of the 
    // character's END, and do it immediately. If the power is activating a constant power, then the 
    // effect should be to spend the entities endurance, and then add the power to the character's list
    // of active powers.
    this.effect = properties['effect'] || function() { console.error("This power needs to have an effect function defined."); };

    this.onQueue = properties['onQueue'] || function() {};
    this.onDequeue = properties['onDequeue'] || function() {};
};