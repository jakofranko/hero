if(Game.BasePower !== undefined) throw new Error('Game.BasePower already defined');
if(Game.BasePowers === undefined) Game.BasePowers = {};
else throw new Error('Game.BasePowers already defined');

// There are three levels to building a power:
// 1) Basic information about what kind of power it is (and logic
// surrounding things like duration and range). This is static: any
// character that has an energy blast will generally not override
// things like duration and range, and cannot override things like
// it's type and cost. Game.Power houses this logic.
// 2) What I call a 'base power.' This is where we define different kinds
// of powers and where parts of the data become immutable. An energy blast
// for instance is an attack power, and costs 5 points per 1d6 of damage.
// This cannot be altered. By default, energy blast has a duration of 'instant'
// and a range of 'standard'. However, when a character buys this power,
// they could alter the range or duration to something different. Game.BasePower
// will keep track of what properties are immutable, be responsible for setting
// defaults for unspecified options, and allow prototype implementations to specify
// properties which are required.
// 3) Character powers, 'ready made' powers, or just 'powers.' It is at
// this level that powers become specific, and at this level that I will
// actually expose powers to the player. However, at this level, powers should
// be able to be defined pretty briefly; 'Fire Blast' would just be defined
//
// {
//      power: 'Energy Blast',
//      damageType: 'energy'
//      advantages: ['area effect']
// }
//
// Each base power is defined as it's own function, and will be the constructor for
// its own repo. For example: 'EnergyBlastRepository' which would have templates
// for all the different kinds of energy blasts etc.
Game.BasePower = function(properties, powerOptions) {
    // Throw errors if powerOptions are trying to alter one of the immutable properties
    for(var prop in powerOptions) {
        if(Game.BasePower.immutableProps.includes(prop))
            throw new Error(`The power '${this.name}' is attempting to set the property '${prop}', which is defined in the base power and cannot be altered`);
    }

    var combinedParams = Object.assign({}, properties, powerOptions);
    Game.Power.call(this, combinedParams);
};
Game.BasePower.extend(Game.Power);

// TODO: should effect, queue and dequeue also be immutable?
Game.BasePower.immutableProps = ['type', 'cost', 'pointsMin', 'pointsMax'];

// BasePower definitions
Game.BasePowers.energyBlast = function(options) {
    if(!('damageType' in options))
        throw new Error('An energyBlast must specify a damage type');

    var properties = {
        name: 'Energy Blast',
        type: 'Attack',
        cost: 5,
        duration: 'instant',
        pointsMin: 5,
        points: 0,
        range: 'standard',
        hitTargetMessage: "%s does %s STUN and %s BODY to you!",
        hitMessage: "You do %s STUN and %s BODY to %s!",
        missTargetMessage: "%s misses you!",
        missMessage: "You miss!",
        effect: function(target) {
            if(!target) {
                Game.sendMessage(this.entity, "There's nothing there!");
                return false; // don't end turn
            }

            this.entity.adjustEND(-this.END());

            if(this.inRange(this.entity.getX(), this.entity.getY(), target.getX(), target.getY())) {
                target.raiseEvent('onAttack', this.entity);

                var hit = this.entity._attackRoll(target);
                if(hit) {
                    var dice = Math.floor(this.points / this.cost);
                    var STUN = 0;
                    var BODY = 0;

                    for(var i = 0; i < dice; i++) {
                        var dieRoll = Game.rollDice("1d6");

                        STUN += dieRoll;
                        if(dieRoll == 6) {
                            BODY += 2;
                        } else if(dieRoll > 1) {
                            BODY += 1;
                        }

                    }

                    target.takeSTUN(this.entity, STUN, this.damageType);
                    target.takeBODY(this.entity, BODY, this.damageType);
                    Game.sendMessage(target, this.hitTargetMessage, [this.entity.describeThe(), STUN, BODY]);
                    Game.sendMessage(this.entity, this.hitMessage, [STUN, BODY, target.describeThe()]);
                    return true;
                } else {
                    Game.sendMessage(target, this.missTargetMessage, [this.entity.describeThe()]);
                    Game.sendMessage(this.entity, this.missMessage);
                    return false;
                }
            } else {
                Game.sendMessage(this.entity, "Out of range.");
                return false;
            }
        }
    };

    Game.BasePower.call(this, properties, options);
};
Game.BasePowers.energyBlast.extend(Game.BasePower);

// BasePower definitions
Game.BasePowers.handToHandAttack = function(options) {
    if(!('damageType' in options))
        throw new Error('An handToHandAttack must specify a damage type');

    var properties = {
        name: 'Hand-to-Hand Attack',
        type: 'Attack',
        cost: 5,
        duration: 'instant',
        pointsMin: 5,
        points: 0,
        range: 'no range',
        hitTargetMessage: "%s does %s STUN and %s BODY to you!",
        hitMessage: "You do %s STUN and %s BODY to %s!",
        missTargetMessage: "%s misses you!",
        missMessage: "You miss!",
        effect: function(target) {
            if(!target) {
                Game.sendMessage(this, "There's nothing there!");
                return false; // don't end turn
            }

            this.entity.adjustEND(-this.END());

            if(this.inRange(this.entity.getX(), this.entity.getY(), target.getX(), target.getY())) {
                target.raiseEvent('onAttack', this.entity);

                var hit = this.entity._attackRoll(target);
                if(hit) {
                    debugger;
                    var dice = Math.floor((this.points / this.cost) + (this.entity.getSTR() / this.cost));
                    var STUN = 0;
                    var BODY = 0;

                    for(var i = 0; i < dice; i++) {
                        var dieRoll = Game.rollDice("1d6");

                        STUN += dieRoll;
                        if(dieRoll == 6) {
                            BODY += 2;
                        } else if(dieRoll > 1) {
                            BODY += 1;
                        }

                    }

                    target.takeSTUN(this.entity, STUN, this.damageType);
                    target.takeBODY(this.entity, BODY, this.damageType);
                    Game.sendMessage(target, this.hitTargetMessage, [this.entity.describeThe(), STUN, BODY]);
                    Game.sendMessage(this.entity, this.hitMessage, [STUN, BODY, target.describeThe()]);
                    return true;
                } else {
                    Game.sendMessage(target, this.missTargetMessage, [this.entity.describeThe()]);
                    Game.sendMessage(this.entity, this.missMessage);
                    return false;
                }
            } else {
                Game.sendMessage(this.entity, "Out of range.");
                return false;
            }
        }
    };

    Game.BasePower.call(this, properties, options);
};
Game.BasePowers.handToHandAttack.extend(Game.BasePower);

Game.BasePowers.handToHandKillingAttack = function(options) {
    if(!('damageType' in options))
        throw new Error('An handToHandKillingAttack must specify a damage type');

    var properties = {
        name: 'Hand-to-Hand Killing Attack',
        type: 'Attack',
        cost: 15,
        duration: 'instant',
        pointsMin: 15,
        points: 0,
        range: 'no range',
        hitTargetMessage: "%s does %s STUN and %s BODY to you!",
        hitMessage: "You do %s STUN and %s BODY to %s!",
        missTargetMessage: "%s misses you!",
        missMessage: "You miss!",
        effect: function(target) {
            if(!target) {
                Game.sendMessage(this, "There's nothing there!");
                return false; // don't end turn
            }

            this.entity.adjustEND(-this.END());

            if(this.inRange(this.entity.getX(), this.entity.getY(), target.getX(), target.getY())) {
                target.raiseEvent('onAttack', this.entity);

                var hit = this.entity._attackRoll(target);
                if(hit) {
                    var dice = Math.floor((this.points / this.cost) + (this.entity.getSTR() / this.cost));
                    var STUN = 0;
                    var BODY = 0;

                    // BODY is the number rolled on the dice
                    for(var i = 0; i < dice; i++) {
                        BODY += Game.rollDice("1d6");
                    }

                    STUN = BODY * Math.max(1, Game.rollDice("1d6") - 1);

                    target.takeSTUN(this.entity, STUN, this.damageType, true);
                    target.takeBODY(this.entity, BODY, this.damageType, true);
                    Game.sendMessage(target, this.hitTargetMessage, [this.entity.describeThe(), STUN, BODY]);
                    Game.sendMessage(this.entity, this.hitMessage, [STUN, BODY, target.describeThe()]);
                    return true;
                } else {
                    Game.sendMessage(target, this.missTargetMessage, [this.entity.describeThe()]);
                    Game.sendMessage(this.entity, this.missMessage);
                    return false;
                }
            } else {
                Game.sendMessage(this.entity, "Out of range.");
                return false;
            }
        }
    };

    Game.BasePower.call(this, properties, options);
};
Game.BasePowers.handToHandKillingAttack.extend(Game.BasePower);

Game.BasePowers.rangedKillingAttack = function(options) {
    if(!('damageType' in options))
        throw new Error('An rangedKillingAttack must specify a damage type');

    var properties = {
        name: 'Ranged Killing Attack',
        type: 'Attack',
        cost: 15,
        duration: 'instant',
        pointsMin: 15,
        points: 0,
        range: 'standard',
        hitTargetMessage: "%s does %s STUN and %s BODY to you!",
        hitMessage: "You do %s STUN and %s BODY to %s!",
        missTargetMessage: "%s misses you!",
        missMessage: "You miss!",
        effect: function(target) {
            if(!target) {
                Game.sendMessage(this, "There's nothing there!");
                return false; // don't end turn
            }

            this.entity.adjustEND(-this.END());

            if(this.inRange(this.entity.getX(), this.entity.getY(), target.getX(), target.getY())) {
                target.raiseEvent('onAttack', this.entity);

                var hit = this.entity._attackRoll(target);
                if(hit) {
                    debugger;
                    var dice = Math.floor(this.points / this.cost);
                    var STUN = 0;
                    var BODY = 0;

                    // BODY is the number rolled on the dice
                    for(var i = 0; i < dice; i++) {
                        BODY += Game.rollDice("1d6");
                    }

                    STUN = BODY * Math.max(1, Game.rollDice("1d6") - 1);

                    target.takeSTUN(this.entity, STUN, this.damageType, true);
                    target.takeBODY(this.entity, BODY, this.damageType, true);
                    Game.sendMessage(target, this.hitTargetMessage, [this.entity.describeThe(), STUN, BODY]);
                    Game.sendMessage(this.entity, this.hitMessage, [STUN, BODY, target.describeThe()]);
                    return true;
                } else {
                    Game.sendMessage(target, this.missTargetMessage, [this.entity.describeThe()]);
                    Game.sendMessage(this.entity, this.missMessage);
                    return false;
                }
            } else {
                Game.sendMessage(this.entity, "Out of range.");
                return false;
            }
        }
    };

    Game.BasePower.call(this, properties, options);
};
Game.BasePowers.rangedKillingAttack.extend(Game.BasePower);

// Every 3 points of armor is 2 points of resistant defense
Game.BasePowers.armor = function(options) {
    var properties = {
        name: 'Armor',
        type: 'Attack',
        cost: 3,
        duration: 'persistent',
        pointsMin: 3,
        points: 0,
        range: 'self',
        hitTargetMessage: '',
        hitMessage: "You activate your armor.",
        missTargetMessage: '',
        missMessage: 'You take off your armor',
        active: false, // special property for non-instant powers
        persistent: function(){}, // unused right now...
        effect: function(target) {
            if(this.inRange(this.entity.getX(), this.entity.getY(), target.getX(), target.getY())) {
                if(this.active)
                    Game.sendMessage(this.entity, this.hitMessage);
                else
                    Game.sendMessage(this.entity, this.missMessage);
            } else {
                Game.sendMessage(this.entity, "Out of range.");
                return false;
            }
        },
        enqueue: function() {
            if(!this.active) {
                if(this.damageType === 'physical')
                    this.entity._rPD += this.points / 1.5; // 3 points of armor = 2 rD -> 3 = 2 -> 3/2 = 2/2 -> 1.5
                else if(this.damageType === 'energy')
                    this.entity._rED += this.points / 1.5;

                this.active = true;
            }
        },
        dequeue: function() {
            if(this.active) {
                if(this.damageType === 'physical')
                    this.entity._rPD -= this.points / 1.5; // 3 points of armor = 2 rD -> 3 = 2 -> 3/2 = 2/2 -> 1.5
                else if(this.damageType === 'energy')
                    this.entity._rED -= this.points / 1.5;

                this.active = false;
            }
        }
    };

    Game.BasePower.call(this, properties, options);
};
Game.BasePowers.armor.extend(Game.BasePower);

Game.BasePowers.forceField = function(options) {
    var properties = {
        name: 'Force Field',
        type: 'Defence',
        cost: 1,
        duration: 'constant',
        pointsMin: 1,
        points: 0,
        range: 'self',
        hitTargetMessage: '',
        hitMessage: "You activate your force field.",
        missTargetMessage: '',
        missMessage: 'You deactivate your force field',
        active: false, // special property for non-instant powers
        constant: function() {
            // Subtract END
            this.entity.adjustEND(-this.END());
        },
        effect: function(target) {
            if(!target) {
                Game.sendMessage(this.entity, "There's nothing there!");
                return false; // don't end turn
            }

            if(this.inRange(this.entity.getX(), this.entity.getY(), target.getX(), target.getY())) {
                if(this.active)
                    Game.sendMessage(this.entity, this.hitMessage);
                else
                    Game.sendMessage(this.entity, this.missMessage);
            } else {
                Game.sendMessage(this.entity, "Out of range.");
                return false;
            }
        },
        enqueue: function() {
            if(!this.active) {
                if(this.damageType === 'physical')
                    this.entity._rPD += this.points;
                else if(this.damageType === 'energy')
                    this.entity._rED += this.points;

                this.active = true;
            }
        },
        dequeue: function() {
            if(this.active) {
                if(this.damageType === 'physical')
                    this.entity._rPD -= this.points;
                else if(this.damageType === 'energy')
                    this.entity._rED -= this.points;

                this.active = false;
            }
        }
    };

    Game.BasePower.call(this, properties, options);
};
Game.BasePowers.forceField.extend(Game.BasePower);

Game.BasePowers.teleportation = function(options) {
    var properties = {
        name: 'Teleportation',
        type: 'Movement',
        cost: 2,
        duration: 'instant',
        pointsMin: 1,
        points: 0,
        range: 'standard',
        hitTargetMessage: '',
        hitMessage: "You instantly appear somewhere else.",
        missTargetMessage: 'Somebody just tried to teleport into you, ourch that hurt!!!',
        missMessage: 'You instantly appear in something else, ouch that hurts!!! And then you\'re back where you came from',
        effect: function(target, coords) {
            let tile, numD6, damage;

            this.entity.adjustEND(-this.END());

            if(this.inRange(this.entity.getX(), this.entity.getY(), coords.x, coords.y)) {
                tile = this.entity.getMap().getTile(coords.x, coords.y, coords.z);

                if(tile.isWalkable() && !target) {
                    this.entity.tryMove(coords.x, coords.y, coords.z);
                } else {
                    Game.sendMessage(this.entity, this.missMessage);
                    numD6 = Game.rollDice('2d6');
                    damage = Game.rollDice('' + numD6 + 'd6');
                    this.entity.takeSTUN(this.entity, damage);
                    if(target) target.takeSTUN(this.entity, damage);
                }

                return true;
            } else {
                Game.sendMessage(this.entity, 'Out of range.');
                return false;
            }
        }
    };

    Game.BasePower.call(this, properties, options);
};
Game.BasePowers.teleportation.extend(Game.BasePower);

Game.BasePowers.flight = function(options) {
    var properties = {
        name: 'Flight',
        type: 'Movement',
        cost: 10,
        duration: 'constant',
        pointsMin: 10,
        pointsMax: 10,
        points: 0,
        range: 'self',
        hitTargetMessage: '',
        hitMessage: "You take flight.",
        missTargetMessage: '',
        missMessage: 'You land.',
        constant: function() {
            this.entity.adjustEND(-this.END());
        },
        effect: function() {
            return true;
        },
        enqueue: function() {
            Game.sendMessage(this.entity, this.hitMessage);
            this.active = true;
        },
        dequeue: function() {
            Game.sendMessage(this.entity, this.missMessage);
            this.active = false;
        }
    };

    Game.BasePower.call(this, properties, options);
};
Game.BasePowers.flight.extend(Game.BasePower);
