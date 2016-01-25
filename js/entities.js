Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.PlayerTemplate = {
    name: 'human (you)',
    character: '@',
    foreground: 'white',
    maxHp: 40,
    attackValue: 10,
    sightRadius: 20,
    inventorySlots: 22,
    mixins: [
        Game.EntityMixins.Sight,
        Game.EntityMixins.PlayerActor,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.Attacker,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.MoneyHolder,
        Game.EntityMixins.MessageRecipient,
        Game.EntityMixins.PlayerStatGainer,
        Game.EntityMixins.Thrower,
        Game.EntityMixins.ExperienceGainer
    ]
};

Game.EntityRepository.define('person', {
    name: 'person',
    character: 'm',
    foreground: 'white',
    maxHp: 10,
    mixins: [
        Game.EntityMixins.Attacker,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.MoneyHolder,
        Game.EntityMixins.Sight,
        Game.EntityMixins.JobActor,
        Game.EntityMixins.RandomStatGainer
    ]
});

// Game.EntityRepository.define('fungus', {
//     name: 'fungus',
//     character: 'F',
//     foreground: 'green',
//     maxHp: 10,
//     speed: 250,
//     mixins: [
//         Game.EntityMixins.FungusActor,
//         Game.EntityMixins.Destructible,
//         Game.EntityMixins.ExperienceGainer,
//         Game.EntityMixins.RandomStatGainer
//     ]
// });

// Game.EntityRepository.define('bat', {
//     name: 'bat',
//     character: 'B',
//     foreground: 'white',
//     maxHp: 5,
//     attackValue: 4,
//     speed: 2000,
//     mixins: [
//         Game.EntityMixins.TaskActor, 
//         Game.EntityMixins.Attacker, 
//         Game.EntityMixins.CorpseDropper, 
//         Game.EntityMixins.Destructible, 
//         Game.EntityMixins.ExperienceGainer, 
//         Game.EntityMixins.RandomStatGainer
//     ]
// });

// Game.EntityRepository.define('newt', {
//     name: 'newt',
//     character: ':',
//     foreground: 'yellow',
//     maxHp: 3,
//     attackValue: 2,
//     mixins: [
//         Game.EntityMixins.TaskActor,
//         Game.EntityMixins.Attacker,
//         Game.EntityMixins.CorpseDropper,
//         Game.EntityMixins.Destructible, 
//         Game.EntityMixins.ExperienceGainer, 
//         Game.EntityMixins.RandomStatGainer
//     ]
// });

// Game.EntityRepository.define('kobold', {
//     name: 'kobold',
//     character: 'k',
//     foreground: 'white',
//     maxHp: 6,
//     attackValue: 4,
//     sightRadius: 5,
//     tasks: ['hunt', 'wander'],
//     mixins: [
//         Game.EntityMixins.TaskActor, 
//         Game.EntityMixins.Sight,
//         Game.EntityMixins.Attacker, 
//         Game.EntityMixins.Destructible,
//         Game.EntityMixins.CorpseDropper, 
//         Game.EntityMixins.ExperienceGainer, 
//         Game.EntityMixins.RandomStatGainer
//     ]
// });

// Game.EntityRepository.define('giant zombie', {
//     name: 'giant zombie', 
//     character: 'Z',
//     foreground: 'teal',
//     maxHp: 30,
//     attackValue: 8,
//     defenseValue: 5,
//     level: 5,
//     sightRadius: 6,
//     mixins: [
//         Game.EntityMixins.GiantZombieActor, 
//         Game.EntityMixins.Sight,
//         Game.EntityMixins.Attacker, 
//         Game.EntityMixins.Destructible,
//         Game.EntityMixins.CorpseDropper,
//         Game.EntityMixins.ExperienceGainer
//     ]
// }, {
//     disableRandomCreation: true
// });

// Game.EntityRepository.define('slime', {
//     name: 'slime',
//     character: 's',
//     foreground: 'lightGreen',
//     maxHp: 10,
//     attackValue: 5,
//     sightRadius: 3,
//     tasks: ['hunt', 'wander'],
//     mixins: [
//         Game.EntityMixins.TaskActor, 
//         Game.EntityMixins.Sight,
//         Game.EntityMixins.Attacker, 
//         Game.EntityMixins.Destructible,
//         Game.EntityMixins.CorpseDropper,
//         Game.EntityMixins.ExperienceGainer, 
//         Game.EntityMixins.RandomStatGainer
//     ]
// });