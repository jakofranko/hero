Game.PowerAdvantages = Game.PowerAdvantages || {};

Game.PowerAdvantages.AOE = function(options) {
    this.radius = options['radius'] || 2;
    this.getTargets = options['getTargets'] || function(x, y, z, map) {
        return map.getEntitiesWithinRadius(x, y, z, this.radius);
    }
    this.getAOE = options['getAOE'] || function(x, y) {
        var points = [];
        for (let i = x - this.radius; i < x + this.radius; i++) {
            for (let j = y - this.radius; j < y + this.radius; j++) {
                points.push([i, j]);
            }
        }

        return points;
    }
}
Game.PowerAdvantages.AOE_Blast_5 = new Game.PowerAdvantages.AOE({ radius: 3 });
