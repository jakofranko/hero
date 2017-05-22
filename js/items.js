Game.ItemRepository = new Game.Repository('items', Game.Item);

Game.ItemRepository.define('bed', {
    name: 'bed',
    character: '#',
    foreground: Game.Palette.lightBlue,
    strMin: 20,
    mixins: [Game.ItemMixins.Heavy]
});

Game.ItemRepository.define('desk', {
    name: 'desk',
    character: '#',
    foreground: Game.Palette.brown,
    strMin: 15,
    mixins: [Game.ItemMixins.Heavy, Game.ItemMixins.Container]
});

Game.ItemRepository.define('chair', {
    name: 'chair',
    character: 'h',
    foreground: Game.Palette.brown,
});

Game.ItemRepository.define('couch', {
    name: 'couch',
    character: 'C',
    foreground: Game.Palette.teal,
    strMin: 18,
    mixins: [Game.ItemMixins.Heavy]
});

Game.ItemRepository.define('table', {
    name: 'table',
    character: '#',
    foreground: Game.Palette.brown,
    strMin: 12,
    mixins: [Game.ItemMixins.Heavy]
});

Game.ItemRepository.define('floor lamp', {
    name: 'floor lamp',
    character: '∫',
    foreground: Game.Palette.white,
});

Game.ItemRepository.define('potted plant', {
    name: 'potted plant',
    character: '*',
    foreground: '#B3C67F',
});

Game.ItemRepository.define('refridgerator', {
    name: 'refridgerator',
    character: '[',
    foreground: Game.Palette.silver,
    strMin: 20,
    mixins: [Game.ItemMixins.Heavy, Game.ItemMixins.Container]
});

Game.ItemRepository.define('television', {
    name: 'television',
    character: ']',
    foreground: Game.Palette.lightBlue,
    strMin: 12,
    mixins: [Game.ItemMixins.Heavy]
});

Game.ItemRepository.define('oven', {
    name: 'oven',
    character: '{',
    foreground: Game.Palette.silver,
    strMin: 20,
    mixins: [Game.ItemMixins.Heavy, Game.ItemMixins.Container]
});

Game.ItemRepository.define('end table', {
    name: 'end table',
    character: 'n',
    foreground: Game.Palette.brown,
    mixins: [Game.ItemMixins.Container]
});

Game.ItemRepository.define('toilet', {
    name: 'toilet',
    character: '&',
    foreground: Game.Palette.white,
    mixins: [Game.ItemMixins.Fixture]
});

Game.ItemRepository.define('bathtub', {
    name: 'bathtub',
    character: 'O',
    foreground: Game.Palette.silver,
    mixins: [Game.ItemMixins.Fixture]
});

Game.ItemRepository.define('sink', {
    name: 'sink',
    character: 'o',
    foreground: Game.Palette.silver,
    mixins: [Game.ItemMixins.Fixture]
});

Game.ItemRepository.define('dresser', {
    name: 'dresser',
    character: ']',
    foreground: Game.Palette.brown,
    mixins: [Game.ItemMixins.Fixture, Game.ItemMixins.Container]
});

Game.ItemRepository.define('bookshelf', {
    name: 'bookshelf',
    character: '[',
    foreground: Game.Palette.brown,
    mixins: [Game.ItemMixins.Fixture, Game.ItemMixins.Container]
});

Game.ItemRepository.define('corpse', {
    name: 'corpse',
    character: '%',
    foreground: Game.Palette.white,
});

Game.ItemRepository.define('sign', {
    name: 'sign',
    character: '?',
    foreground: Game.Palette.white,
    mixins: [Game.ItemMixins.Inscribable, Game.ItemMixins.Fixture]
});

Game.ItemRepository.define('cash register', {
    name: 'cash register',
    character: '[',
    foreground: Game.Palette.green,
    mixins: [Game.ItemMixins.Heavy]
});

Game.ItemRepository.define('vault door', {
    name: 'vault door',
    character: '0',
    foreground: Game.Palette.green,
    mixins: [Game.ItemMixins.Fixture]
});

Game.ItemRepository.define('safe', {
    name: 'safe',
    character: '}',
    foreground: Game.Palette.green,
    mixins: [Game.ItemMixins.Fixture]
});