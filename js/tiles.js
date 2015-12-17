Game.TileRepository = new Game.Repository('tiles', Game.Tile);

Game.TileRepository.define('nullTile', {
    name: 'nullTile',
    description: '(unknown)'
});
Game.TileRepository.define('floorTile', {
    name: 'floorTile',
    character: '.',
    walkable: true,
    blocksLight: false,
    description: 'A cave floor'
});
Game.TileRepository.define('wallTile', {
    name: 'wallTile',
	character: '#',
	foreground: 'goldenrod',
	diggable: true,
	blocksLight: true,
    description: 'A cave wall'
});
Game.TileRepository.define('stairsUpTile', {
    name: 'stairsUpTile',
    character: '<',
    foreground: 'white',
    walkable: true,
    blocksLight: false,
    description: 'A rock staircase leading upwards'
});
Game.TileRepository.define('stairsDownTile', {
    name: 'stairsDownTile',
    character: '>',
    foreground: 'white',
    walkable: true,
    blocksLight: false,
    description: 'A rock staircase leading downwards'
});
Game.TileRepository.define('waterTile', {
    name: 'waterTile',
    character: '~',
    foreground: 'blue',
    walkable: false,
    blocksLight: false,
    description: 'Murky blue water'
});