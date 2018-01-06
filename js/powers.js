Game.Powers = {};
Game.Powers.create = function(name) {
    for(var repo in this) {
        if(repo == 'create') continue;
        for(var power in this[repo]._templates) {
            if(power === name)
                return this[repo].create(name);
        }
    }

    throw new Error(`The power '${name}' is not defined in any power repository`);
};

// Energy Blasts
Game.Powers.EnergyBlastPowerRepository = new Game.Repository('energy blast powers', Game.BasePowers.energyBlast);

Game.Powers.EnergyBlastPowerRepository.define('energy bolt', {
    name: 'Energy Bolt',
    damageType: 'energy',
    hitTargetMessage: "%s fries you with an Energy bolt, doing %s STUN and %s BODY!",
    hitMessage: "You let loose a crackling bolt of energy, doing %s STUN and %s BODY to %s!",
    missTargetMessage: "%s misses you with their energy bolt!",
    missMessage: "Your energy bolt goes wide!",
});
Game.Powers.EnergyBlastPowerRepository.define('throwing star', {
    name: 'Throwing Star',
    damageType: 'physical',
    hitTargetMessage: "%s slices you with a throwing star, doing %s STUN and %s BODY!",
    hitMessage: "You hit with your throwing star, doing %s STUN and %s BODY to %s!",
    missTargetMessage: "%s's throwing star whizzes past, missing you!",
    missMessage: "Your throwing star misses!",
});
