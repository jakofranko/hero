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
    character: '#',
    foreground: Game.Palette.brown,
});

Game.ItemRepository.define('corpse', {
    name: 'corpse',
    character: '%',
    foreground: 'white',
});