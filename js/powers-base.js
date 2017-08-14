if(Game.BasePowers === undefined) Game.BasePowers = {};
else throw new Error('Game.BasePowers already defined');

Game.BasePowers.energyBlast = new Game.Power({
    name: 'Energy Blast',
    type: 'Attack',
    cost: 5,
    duration: 'instant',
    pointsMin: 5,
    pointsMax: false,
    points: 0,
    range: 'standard',
    damageType: 'physical',
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
});