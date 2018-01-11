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

// Hand-to-Hand Attacks
Game.Powers.HandToHandAttackPowerRepository = new Game.Repository('hand-to-hand attack powers', Game.BasePowers.handToHandAttack);

Game.Powers.HandToHandAttackPowerRepository.define('bo staff', {
    name: 'Bo Staff',
    damageType: 'physical',
    hitTargetMessage: "%s cracks you with their bo staff, doing %s STUN and %s BODY!",
    hitMessage: "Your bo staff connects, doing %s STUN and %s BODY to %s!",
    missTargetMessage: "%s misses you with their bo staff!",
    missMessage: "You miss with your bo staff!",
});

Game.Powers.HandToHandAttackPowerRepository.define('stun fist', {
    name: 'Stun Fist',
    damageType: 'energy',
    hitTargetMessage: "%s hits you with their stun fist, doing %s STUN and %s BODY!",
    hitMessage: "You land a solid hit with your stun fist, doing %s STUN and %s BODY to %s!",
    missTargetMessage: "%s swings wide with their stun fist, missing you!",
    missMessage: "You swing and miss with your stun fist!",
});

// Hand-to-Hand Killing Attacks
Game.Powers.HandToHandKillingAttackPowerRepository = new Game.Repository('hand-to-hand killing attack powers', Game.BasePowers.handToHandKillingAttack);

Game.Powers.HandToHandKillingAttackPowerRepository.define('katana', {
    name: 'Katana',
    damageType: 'physical',
    hitTargetMessage: "%s slices you with their katana, doing %s STUN and %s BODY!",
    hitMessage: "You hit, doing %s STUN and %s BODY to %s with your katana!",
    missTargetMessage: "%s misses you with their katana!",
    missMessage: "Your katana cuts only the air!",
});

Game.Powers.HandToHandKillingAttackPowerRepository.define('light lance', {
    name: 'Light Lance',
    damageType: 'energy',
    hitTargetMessage: "%s hits you with lance made of pure light, doing %s STUN and %s BODY!",
    hitMessage: "Your lance materializes and then connects, doing %s STUN and %s BODY to %s!",
    missTargetMessage: "%s misses you with their light lance!",
    missMessage: "You fail to hit with your light lance!",
});
