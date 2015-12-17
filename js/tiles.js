Game.TileRepository = new Game.Repository('tiles', Game.Tile);

Game.TileRepository.define('null', {
    name: 'null',
    description: '(unknown)'
});
Game.TileRepository.define('floor', {
    name: 'floor',
    character: '.',
    walkable: true,
    blocksLight: false,
    description: 'The floor'
});
Game.TileRepository.define('grass', {
    name: 'floor',
    character: '"',
    foreground: '#B3C67F',
    walkable: true,
    blocksLight: false,
    description: 'A patch of grass'
});
Game.TileRepository.define('wall', {
    name: 'wall',
	character: '#',
	foreground: 'goldenrod',
	diggable: true,
	blocksLight: true,
    description: 'A wall'
});
Game.TileRepository.define('stairsUp', {
    name: 'stairsUp',
    character: '<',
    foreground: 'white',
    walkable: true,
    blocksLight: false,
    description: 'A staircase leading upwards'
});
Game.TileRepository.define('stairsDown', {
    name: 'stairsDown',
    character: '>',
    foreground: 'white',
    walkable: true,
    blocksLight: false,
    description: 'A staircase leading downwards'
});
Game.TileRepository.define('water', {
    name: 'water',
    character: '~',
    foreground: 'blue',
    walkable: false,
    blocksLight: false,
    description: 'Clear blue water'
});