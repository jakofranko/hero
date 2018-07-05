Game.PowerAdvantages = Game.PowerAdvantages || {};

Game.PowerAdvantages.AOE = function(options) {
    this.radius = options['radius'] || 2;
    this.getTargets = options['getTargets'] || function(x, y, z, map) {
        return map.getEntitiesWithinRadius(x, y, z, this.radius);
    }
}
Game.PowerAdvantages.AOE_Blast_5 = new Game.PowerAdvantages.AOE({ radius: 3 });
