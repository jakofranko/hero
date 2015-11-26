Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('fungus', {
    name: 'fungus',
    character: 'F',
    foreground: 'green',
    maxHp: 10,
    mixins: [Game.EntityMixins.FungusActor, Game.EntityMixins.Destructible]
});

Game.EntityRepository.define('bat', {
    name: 'bat',
    character: 'B',
    foreground: 'white',
    maxHp: 5,
    attackValue: 4,
    mixins: [Game.EntityMixins.WanderActor, Game.EntityMixins.Attacker, Game.EntityMixins.CorpseDropper, Game.EntityMixins.Destructible]
});

Game.EntityRepository.define('newt', {
    name: 'newt',
    character: ':',
    foreground: 'yellow',
    maxHp: 3,
    attackValue: 2,
    mixins: [Game.EntityMixins.WanderActor, Game.EntityMixins.Attacker, Game.EntityMixins.CorpseDropper, Game.EntityMixins.Destructible]
});