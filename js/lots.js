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
			amount: 1,
			constructor: 'BuildingRepository'
		}
	],
	buildTiles: function() {
		// Add terrain
		var tiles = this.fillLot('floor');
		var air = Game.TileRepository.create('air');

		// Add the building
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

		// debugger;
		for (var z = 0; z < building.getNumberOfStories(); z++) {
			if(!tiles[z]) {
				tiles[z] = new Array(this.getWidth());
			}

			// If a space (cell) on a higher level of the lot (i.e., not the first z-level)
			// and it is not where the building should be, then an air tile should be placed
			for (var x = 0, i = false; x < this.getWidth(); x++) {
				if(!tiles[z][x]) {
					tiles[z][x] = new Array(this.getHeight());
				}

				if(x == cornerX) {
					i = 0;
				} else if(x > cornerX && i < building.getWidth() - 1 && i !== false) {
					i++;
				} else {
					i = false;
				}

				for (var y = 0, j = false; y < this.getHeight(); y++) {
					if(y == cornerY && i !== false) {
						j = 0;
					} else if(y > cornerY && j < building.getHeight() - 1 && i !== false && j !== false) {
						j++;
					} else {
						j = false;
					}

					if(i !== false && j !== false) {
						if(b[z][i] == undefined)
							debugger;
						tiles[z][x][y] = b[z][i][j];
					} else if(z > 0) {
						tiles[z][x][y] = air;
					}
				};
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

		// Only 1 z-level, so return it as the only element in an array
		return [tiles];
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