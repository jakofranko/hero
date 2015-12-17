Game.LotRepository = new Game.Repository('lots', Game.Lot);

Game.LotRepository.define('skyscraper', {
	name: 'skyscraper',
	character: '|',
	downtown: 1,
	midtown: 0.5,
	uptown: 0.1,
	suburbs: 0
});
Game.LotRepository.define('building', {
	name: 'building',
	character: 'B',
	downtown: 1,
	midtown: 1,
	uptown: 1,
	suburbs: 0
});

// Roads should really never be placed randomly
Game.LotRepository.define('road', {
	name: 'road',
	character: '.',
	downtown: -1,
	midtown: -1,
	uptown: -1,
	suburbs: -1
});
Game.LotRepository.define('appartments', {
	name: 'appartments',
	character: 'A',
	downtown: 1,
	midtown: 1,
	uptown: 1,
	suburbs: 0.6
});
Game.LotRepository.define('houses', {
	name: 'houses',
	character: '^',
	downtown: 0,
	midtown: 0,
	uptown: 0.3,
	suburbs: 1
});
Game.LotRepository.define('empty', {
	name: 'empty',
	character: ' ',
	downtown: 0.5,
	midtown: 0.5,
	uptown: 0.5,
	suburbs: 0.5,
	buildTiles: function() {
		return this.fillLot('grass', {
			character: {
		        random: true,
		        values: ['.', '"']
		    },
		    foreground: {
		        random: true,
		        values: ['#F8F8D6', '#B3C67F', '#5D7E62']
		    }
		});
	}
});