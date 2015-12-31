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
	suburbs: 0,
	buildingSpecs: [
		{
			type: 'office building',
			amount: 1
		}
	],
	buildTiles: function() {
		var tiles = this.fillLot('floor');
		var centerX = this.getMidWidth();
		var centerY = this.getMidHeight();

		var building = this.getBuildings()[0];
		building.build();
		var buildingMidWidth = building.getMidWidth();
		var buildingMidHeight = building.getMidHeight();
		var b = building.getBlueprint();
		
		// Place the building in the center of the lot
		// Find upper corner...
		var cornerX = centerX - buildingMidWidth;
		var cornerY = centerY - buildingMidHeight;
		if(cornerX < 0 || cornerY < 0) {
			return tiles;
		}
		
		// TODO: Make this work with the other z-levels
		for (var x = cornerX, i = 0; x < building.getWidth(); x++, i++) {
			for (var y = cornerY, j = 0; y < building.getHeight(); y++, j++) {
				tiles[x][y] = b[0][i][j];
			};
		};

		return tiles;
	}
});
Game.LotRepository.define('road', {
	name: 'road',
	character: '.',
	// Roads should really never be placed randomly
	downtown: -1,
	midtown: -1,
	uptown: -1,
	suburbs: -1,
	// oreientation == 'vertical' || 'horizontal' || 'intersection'
	buildTiles: function() {
		var tiles = [];
		var asphault = Game.TileRepository.create('asphault');
		var sidewalk = Game.TileRepository.create('sidewalk');
		var stripe = Game.TileRepository.create('two-way stripe');

		var sidewalkWidth = 2;
		var centerL = (this._width / 2) - 1;
		var centerR = this._width / 2;

		if(this._orientation) {
			for(var x = 0; x < this._width; x++) {
				tiles[x] = new Array(this._height);
				for(var y = 0; y < this._height; y++) {
					if(this._orientation == 'vertical') {
						if(x < sidewalkWidth || x >= (this._width - sidewalkWidth)) {
							tiles[x][y] = sidewalk;
						} else if(x == centerL || x == centerR) {
							tiles[x][y] = stripe;
						} else {
							tiles[x][y] = asphault;
						}
					} else if(this._orientation == 'horizontal') {
						if(y < sidewalkWidth || y >= (this._height - sidewalkWidth)) {
							tiles[x][y] = sidewalk;
						} else if(y == centerL || y == centerR) {
							tiles[x][y] = stripe;
						} else {
							tiles[x][y] = asphault;
						}
					} else if(this._orientation == 'intersection') {
						if(
							(x < sidewalkWidth && y < sidewalkWidth) || 
							(x >= this._width - sidewalkWidth && y < sidewalkWidth) ||
							(y >= this._height - sidewalkWidth && x < sidewalkWidth) ||
							(x >= this._width - sidewalkWidth && y >= this._height - sidewalkWidth)
						) {
							tiles[x][y] = sidewalk;
						} else if(x == centerL || y == centerL || x == centerR || y == centerR) {
							tiles[x][y] = stripe;
						} else {
							tiles[x][y] = asphault;
						}
					}
				}
			}
		}

		return tiles;
	}
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