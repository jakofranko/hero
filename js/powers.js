Game.Powers = {};
Game.Powers.create = function(name) {
    for(var repo in this) {
        if(repo == 'create') continue;
        for(var power in this[repo]) {
            if(power === name)
                return this[repo].create(name);
        }
    }

    throw new Error(`The power '${name}' is not defined in any power repository`);
};

// Energy Blasts
Game.Powers.EnergyBlastPowerRepository = new Game.Repository('energy blast powers', Game.BasePowers.energyBlast);

Game.Powers.EnergyBlastPowerRepository.define('energyBolt', {
    name: 'Energy Bolt',
    damageType: 'energy'
});
Game.Powers.EnergyBlastPowerRepository.define('throwingStar', {
    name: 'Throwing Star',
    damageType: 'physical'
});