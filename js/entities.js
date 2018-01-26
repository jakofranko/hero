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
    basePoints: 100,
    powers: ['energy bolt', 'throwing star', 'bo staff', 'stun fist', 'katana', 'light lance', 'pistol', 'lightning bolt', 'kevlar', 'phase skin'],
    mixins: [
        Game.EntityMixins.Characteristics,
        Game.EntityMixins.BasePoints,
        Game.EntityMixins.Sight,
        Game.EntityMixins.PlayerActor,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.Attacker,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.MemoryMaker,
        Game.EntityMixins.MoneyHolder,
        Game.EntityMixins.MessageRecipient,
        Game.EntityMixins.PowerUser,
        Game.EntityMixins.PlayerStatGainer,
        Game.EntityMixins.Thrower,
        Game.EntityMixins.ExperienceGainer
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
        Game.EntityMixins.CorpseDropper,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.JobActor,
        Game.EntityMixins.MemoryMaker,
        Game.EntityMixins.MoneyHolder,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Targeting,
        Game.EntityMixins.RandomStatGainer,
        Game.EntityMixins.Reactor
    ]
});

// TODO: [EVENTS] Set better reactions for robbers so they are more aggressive when attacked
Game.EntityRepository.define('robber', {
    name: 'robber', // Randomized with createEntity
    character: 'm', // Randomized with createEntity
    type: 'Event NPC - Robber',
    foreground: 'white',
    maxHp: 10,
    basePoints: 8,
    STR: 8,
    DEX: 8,
    CON: 8,
    BODY: 8,
    INT: 6,
    EGO: 6,
    PRE: 5,
    COM: 5,
    jobs: ['robber', 'home'],
    reactionTypes: ['defend'],
    reactionMessages: {
        defend: ['Who do you think you are?? Take that!', 'I\'ll get the hero. How do you like pain??', 'You won\'t stop me this time!']
    },
    mixins: [
        Game.EntityMixins.Characteristics,
        Game.EntityMixins.BasePoints,
        Game.EntityMixins.Attacker,
        Game.EntityMixins.CorpseDropper,
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
        Game.EntityMixins.Reactor
    ]
});
