Game.LotsRepository = new Game.Repository('lots', Game.Lot);

Game.LotsRepository.define('skyscraper', {
	name: 'skyscraper',
	character: '|',
	downtown: 1,
	midtown: 0.5,
	uptown: 0.1,
	suburbs: 0
});
Game.LotsRepository.define('building', {
	name: 'building',
	character: 'B',
	downtown: 1,
	midtown: 1,
	uptown: 1,
	suburbs: 0
});
Game.LotsRepository.define('road', {
	name: 'road',
	character: '.',
	downtown: 1,
	midtown: 1,
	uptown: 1,
	suburbs: 1
});
Game.LotsRepository.define('appartments', {
	name: 'appartments',
	character: 'A',
	downtown: 1,
	midtown: 1,
	uptown: 1,
	suburbs: 0.6
});
Game.LotsRepository.define('houses', {
	name: 'houses',
	character: '^',
	downtown: 0,
	midtown: 0,
	uptown: 0.3,
	suburbs: 1
});
Game.LotsRepository.define('empty', {
	name: 'empty',
	character: ' ',
	downtown: 1,
	midtown: 1,
	uptown: 1,
	suburbs: 1
});