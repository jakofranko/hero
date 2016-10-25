Game.ItemRepository = new Game.Repository('items', Game.Item);

Game.ItemRepository.define('bed', {
    name: 'bed',
    character: '#',
    foreground: Game.Palette.lightBlue,
});

Game.ItemRepository.define('chair', {
    name: 'chair',
    character: 'h',
    foreground: Game.Palette.brown,
});

Game.ItemRepository.define('desk', {
    name: 'desk',
    character: 'π',
    foreground: Game.Palette.brown,
});

Game.ItemRepository.define('floor lamp', {
    name: 'floor lamp',
    character: '∫',
    foreground: 'white',
});

Game.ItemRepository.define('potted plant', {
    name: 'potted plant',
    character: '*',
    foreground: '#B3C67F',
});

Game.ItemRepository.define('corpse', {
    name: 'corpse',
    character: '%',
    foreground: 'white',
});