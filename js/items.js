Game.ItemRepository = new Game.Repository('items', Game.Item);

Game.ItemRepository.define('bed', {
    name: 'bed',
    character: '#',
    foreground: Game.Palette.lightBlue,
});
