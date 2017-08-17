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
// Need to devise a way to define all the base powers, and then how to organize
// the ready made powers. I could define each base power as it's own function,
// and then create repositories for each base power, e.g., there would be a
// 'EnergyBlastRepository' which would have templates for all the different
// kinds of energy blasts etc.
Game.BasePowers.energyBlast = function(options) {
    if(!options['damageType'])
        throw new Error('Please specify a damageType for this power');

    var properties = {
        name: 'Energy Blast',
        type: 'Attack',
        cost: 5,
        duration: 'instant',
        pointsMin: 5,
        pointsMax: false,
        points: 0,
        range: 'standard',
        effect: function(target) {
            if(this.inRange(this.entity.getX(), this.entity.getY(), target.getX(), target.getY())) {
                target.raiseEvent('onAttack', this);

                var hit = this.entity._attackRoll(target);
                if(hit) {
                    var dice = Math.floor(this.points / 5);
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
                    Game.sendMessage(target, "%s does %s STUN and %s BODY to you!", [this.entity.describeThe(), STUN, BODY]);
                    Game.sendMessage(this.entity, "You do %s STUN and %s BODY to %s!", [STUN, BODY, target.describeThe()]);
                    return true;
                } else {
                    Game.sendMessage(target, "%s misses you!", [this.describeThe()]);
                    Game.sendMessage(this, "You miss!");
                    return false;
                }
            }
        }
    };

    Game.Power.call(this, Object.assign({}, properties, options));
};