Game.EntityRepository = new Game.Repository('entities', Game.Entity);
Game.EntityRepository.nameGenerator = new Game.NameGenerator();
Game.EntityRepository.createEntity = function(name, template) {
    if(name == 'person') {
        if(!template.name) {
            // Unless a name is explicitely defined, generate a first and last name
            template.name = this.nameGenerator.name() + ' ' + this.nameGenerator.name();
        }
        if(!template.character) {
            template.character = ['w', 'm'].random();
        }
        if(template.character == 'm' && !template.type) {
            template.type = 'man';
        } else if(template.character == 'w' && !template.type) {
            template.type = 'woman';
        }
    }
    return Game.EntityRepository.create.call(this, name, template);
};

// TODO: Write special event NPCs like 'robber' and 'gunman' etc.
Game.PlayerTemplate = {
    name: 'human',
    description: 'It\'s you!',
    character: '@',
    type: 'Player',
    foreground: 'white',
    maxHp: 40,
    attackValue: 10,
    sightRadius: 20,
    inventorySlots: 22,
    basePoints: 0,
    powers: ['energy bolt', 'throwing star', 'bo staff', 'stun fist', 'katana', 'light lance', 'pistol', 'lightning bolt', 'kevlar', 'phase skin'],
    mixins: [
        Game.EntityMixins.Characteristics,
        Game.EntityMixins.BasePoints,
        Game.EntityMixins.Sight,
        Game.EntityMixins.PlayerActor,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.Attacker,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.MemoryMaker,
        Game.EntityMixins.MoneyHolder,
        Game.EntityMixins.MessageRecipient,
        Game.EntityMixins.PowerUser,
        Game.EntityMixins.PlayerStatGainer,
        Game.EntityMixins.Thrower,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.Walker,
        Game.EntityMixins.DoorOpener
    ]
};

Game.EntityRepository.define('person', {
    name: 'person',
    character: 'm',
    foreground: 'white',
    type: 'NPC',
    maxHp: 10,
    basePoints: 8,
    STR: 8,
    DEX: 8,
    CON: 8,
    BODY: 8,
    INT: 8,
    EGO: 8,
    PRE: 8,
    COM: 8,
    mixins: [
        Game.EntityMixins.Characteristics,
        Game.EntityMixins.BasePoints,
        Game.EntityMixins.Attacker,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.JobActor,
        Game.EntityMixins.MemoryMaker,
        Game.EntityMixins.MoneyHolder,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Targeting,
        Game.EntityMixins.RandomStatGainer,
        Game.EntityMixins.Reactor,
        Game.EntityMixins.Walker
    ]
});

// TODO: [EVENTS] Set better reactions for robbers so they are more aggressive when attacked
Game.EntityRepository.define('robber', {
    name: 'robber', // Randomized with createEntity
    character: 'm', // Randomized with createEntity
    type: 'Event NPC - Robber',
    foreground: Game.Palette.red,
    maxHp: 10,
    basePoints: 8,
    STR: 6,
    DEX: 5,
    CON: 6,
    BODY: 6,
    INT: 4,
    EGO: 4,
    PRE: 3,
    COM: 3,
    jobs: ['robber', 'home'],
    reactionTypes: ['defend'],
    reactionMessages: {
        defend: ['Who do you think you are?? Take that!', 'I\'ll get the hero. How do you like pain??', 'You won\'t stop me this time!']
    },
    mixins: [
        Game.EntityMixins.Characteristics,
        Game.EntityMixins.BasePoints,
        Game.EntityMixins.Attacker,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.EventParticipant,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.JobActor,
        Game.EntityMixins.MemoryMaker,
        Game.EntityMixins.MoneyHolder,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Targeting,
        Game.EntityMixins.RandomStatGainer,
        Game.EntityMixins.Reactor,
        Game.EntityMixins.Walker
    ]
});

Game.EntityRepository.define('lost child', {
    name: 'lost child',
    character: 'c',
    type: 'Event NPC - Lost Child',
    foreground: Game.Palette.blue,
    STR: 1,
    DEX: 3,
    CON: 1,
    BODY: 1,
    INT: 5,
    EGO: 1,
    PRE: 1,
    reactionTypes: ['runAway'],
    interactions: {
        greet: [
            [Game.sendMessage, ['Hi there %s...can you help me find my parents?']]
        ],
        help: [
            [Game.sendMessage, ['Thank you!!!']],
            [function(interactor, thisEntity) {
                thisEntity.getEvent().raiseEvent('onInteraction');
            }, []]
        ]
    },
    mixins: [
        Game.EntityMixins.Characteristics,
        Game.EntityMixins.EventParticipant,
        Game.EntityMixins.Interactor,
        Game.EntityMixins.JobActor,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Targeting,
        Game.EntityMixins.Reactor,
        Game.EntityMixins.Walker
    ]
});

Game.EntityRepository.define('gang war bruiser', {
    name: 'gang war bruiser',
    character: 'm',
    type: 'Event NPC - Gang War Bruiser',
    foreground: Game.Palette.red,
    STR: 8,
    DEX: 3,
    CON: 8,
    BODY: 8,
    INT: 2,
    EGO: 2,
    PRE: 8,
    COM: 5,
    jobs: ['gangWarrior'],
    reactionTypes: ['defend'],
    reactionMessages: {
        defend: ['Imma bust you up!', 'These muscles ain\'t just for show!']
    },
    mixins: [
        Game.EntityMixins.Characteristics,
        Game.EntityMixins.BasePoints,
        Game.EntityMixins.Attacker,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.EventParticipant,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.JobActor,
        Game.EntityMixins.MemoryMaker,
        Game.EntityMixins.MoneyHolder,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Targeting,
        Game.EntityMixins.RandomStatGainer,
        Game.EntityMixins.Reactor,
        Game.EntityMixins.Walker
    ]
});

Game.EntityRepository.define('gang war gunner', {
    name: 'gang war gunner',
    character: 'm',
    type: 'Event NPC - Gang War Gunner',
    foreground: Game.Palette.red,
    basePoints: 30, // half this number needs to be enough for at least 1 upgrade of a RKA (15 points)
    STR: 4,
    DEX: 8,
    CON: 3,
    BODY: 5,
    INT: 2,
    EGO: 2,
    PRE: 8,
    COM: 5,
    jobs: ['gangWarrior'],
    powers: ['pistol'],
    reactionTypes: ['defend'],
    reactionMessages: {
        defend: ['Imma bust a cap in you!', 'Hot lead is comin\' at ya!']
    },
    mixins: [
        Game.EntityMixins.Characteristics,
        Game.EntityMixins.PowerUser,
        Game.EntityMixins.BasePoints,
        Game.EntityMixins.Attacker,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.EventParticipant,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.JobActor,
        Game.EntityMixins.MemoryMaker,
        Game.EntityMixins.MoneyHolder,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Targeting,
        Game.EntityMixins.RandomStatGainer,
        Game.EntityMixins.Reactor,
        Game.EntityMixins.Walker
    ]
});

Game.EntityRepository.define('gang war lieutenent', {
    name: 'gang war lieutenent',
    character: 'm',
    type: 'Event NPC - Gang War Lieutenent',
    foreground: Game.Palette.red,
    basePoints: 90, // half this number needs to be enough for at least 1 upgrade of a RKA (15 points)
    STR: 8,
    DEX: 8,
    CON: 8,
    BODY: 10,
    INT: 5,
    EGO: 5,
    PRE: 8,
    COM: 8,
    jobs: ['gangWarrior'],
    powers: ['pistol', 'kevlar'],
    reactionTypes: ['defend'],
    reactionMessages: {
        defend: ['The boss sent me to make sure you don\'t mess this up!', 'I been in this town longer than you been alive, \'hero\'. Get out.']
    },
    mixins: [
        Game.EntityMixins.Characteristics,
        Game.EntityMixins.PowerUser,
        Game.EntityMixins.BasePoints,
        Game.EntityMixins.Attacker,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.EventParticipant,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.JobActor,
        Game.EntityMixins.MemoryMaker,
        Game.EntityMixins.MoneyHolder,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Targeting,
        Game.EntityMixins.RandomStatGainer,
        Game.EntityMixins.Reactor,
        Game.EntityMixins.Walker
    ]
});
