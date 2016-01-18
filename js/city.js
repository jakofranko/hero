// Create a small grid of roads and lots that will be used to create
// lots, which will in turn be used to generate the player level
// This is HEAVILY inspired by Shamus Young's post here:http://www.shamusyoung.com/twentysidedtale/?p=2983.
// Creating the city will involve a few steps, the first of which is creating a grid of roads. I want to start off with just creating a semi-random grid.
// TODO: Could be made more interesting by including a highway or two which would cut sort of diagnally across the city. Additionally, a river or nearby lake might be a neat addition as well. Perhaps a large, central park type of construct as well?
// After generating the roads, lots will be placed semi-randomly in the non-road portions

Game.City = function(size) {
	// Cities will be square for easier math
	this._width = size;
	this._height = size;
	this._cX = Math.round(size / 2);
	this._cY = Math.round(size / 2);
	this._lots = new Array(size);
	// Instantiate the lots and tiles array
	for (var x = 0; x < this._width; x++) {
		this._lots[x] = new Array(size);
	};

	// Determine neighborhood sizes based on city size
	// since dividing by 10, then the multipliers should add up to 5 (leave room for suburbs!)
	var baseSize = Math.round(size / 10);
	this._downtown = Math.floor(baseSize * 2);
	this._midtown = Math.floor(baseSize * 1) + this._downtown;
	this._uptown = Math.floor(baseSize * 1) + this._midtown;
	// suburbs will take up the remaining lots

	// How many roads in the city.
	this._roadFrequency = 0.4;
};
// Getters and setters
Game.City.prototype.getWidth = function() {
	return this._width;
};
Game.City.prototype.getHeight = function() {
	return this._height;
};
Game.City.prototype.getLots = function() {
	return this._lots;
};
Game.City.prototype.init = function() {
	// Generate a random grid of roads
	var lastKey;
	// Start by randomly seeding the first row and column
	for(var x = 0; x < this._width; x++) {
		for(var y = 0; y < this._height; y++) {
			var key = x + "," + y;
			// Only apply random roads on the first row/column,
			// don't let them be right next to each other,
			// dont' let them be within 2 units of each other,
			// and don't put a road at 0,0
			if((x == 0 || y == 0) && key != "0,0" && Math.random() < this._roadFrequency) {
				var lastX = x - 1;
				var lastY = y - 1;
				var lastRow = lastX + "," + y;
				var lastColumn = x + "," + lastY;

				// Don't put roads within two units of eachother
				if(lastRow != lastKey && lastColumn != lastKey) {
					lastKey = key;
					var orientation = (x == 0) ? 'horizontal' : 'vertical';
					this._lots[x][y] = Game.LotRepository.create('road', {
						orientation: orientation
					});
				}
			} else {
				continue;
			}
		}
	}

	// Create the rest of the roads based off the randomly seeded first rows and columns
	for(var x = 0; x < this._width; x++) {
		for(var y = 0; y < this._height; y++) {
			if(this._lots[x][y] && this._lots[x][y].getName() == 'road') {
				if(y == 0) {
					// We are on the first row, so draw the roads directly down
					var thisColumn = x;
					for(var i = 1; i < this._height; i++) {
						var roadKey = thisColumn + "," + i;
						if(this._lots[thisColumn][i] && this._lots[thisColumn][i].getName() == 'road') {
							this._lots[thisColumn][i].setOrientation('intersection');
						} else {
							this._lots[thisColumn][i] = Game.LotRepository.create('road', {
								orientation: 'vertical'
							});	
						}
					}
				} else if(x == 0) {
					// Otherwise, we are on the first column, so draw the road directly over
					var thisRow = y;
					for(var j = 1; j < this._width; j++) {
						var roadKey = j + "," + thisRow;
						if(this._lots[j][thisRow] && this._lots[j][thisRow].getName() == 'road') {
							this._lots[j][thisRow].setOrientation('intersection');
						} else {
							this._lots[j][thisRow] = Game.LotRepository.create('road', {
								orientation: 'horizontal'
							});
						}
					}
				} else {
					continue;
				}
			} else {
				continue;
			}
		}
	}

	// Now that the grid has been created, randomly place buildings in the empty spaces
	for(var x = 0; x < this._width; x++) {
		for(var y = 0; y < this._height; y++) {
			if(this._lots[x][y] && this._lots[x][y].getName() == 'road') {
				continue;
			} else {
				var lot = Game.LotRepository.createIf('willSpawn', this.neighborhood(x, y));
				if(lot) {
					this._lots[x][y] = lot;	
				} else {
					Game.LotRepository.create('empty');
				}
			}
		}
	}
};
Game.City.prototype.neighborhood = function(x, y) {
	var dist = Math.round(Game.Geometry.distance(x, y, this._cX, this._cY));
	if(dist <= this._downtown) {
		return 'downtown';
	} else if(dist <= this._midtown) {
		return 'midtown';
	} else if(dist <= this._uptown) {
		return 'uptown';
	} else {
		return 'suburbs';
	}
}
Game.City.prototype.tilesFromLots = function() {
	// The map variable should be a 3-dimensional array,
	// stitched together from the 3-dimensional array of tiles
	// returned by each lot's getTiles() function.
	// Width and height should be proportional to the lotSize
	var map = [];
	// Loop through the city lots
	for(var cityX = 0; cityX < this._width; cityX++) {
		for (var cityY = 0; cityY < this._height; cityY++) {
			// Returns a 3-dimensional array of lot tiles
			var tiles = this._lots[cityX][cityY].getTiles();

			// Load these tiles into the map at the appropriate
			// offset based on which lot we're in. For reference:
			// tiles.length == number of z-levels,
			// tiles[z].length == lot width,
			// tiles[z][x].length == lot height
			for (var z = 0; z < tiles.length; z++) {
				// Instantiate a new z-level if it doesn't exist already
				if(!map[z]) {
					map[z] = new Array(this._width * Game.getLotSize());
				}

				for (var x = 0; x < tiles[z].length; x++) {
					var offsetX = x + (cityX * Game.getLotSize());

					// Instantiate a new map column if it doesn't exist already
					if(!map[z][offsetX]) {
						map[z][offsetX] = new Array(this._height * Game.getLotSize());
					}

					for (var y = 0; y < tiles[z][x].length; y++) {
						var offsetY = y + (cityY * Game.getLotSize());
						map[z][offsetX][offsetY] = tiles[z][x][y];
					};
				};
			};
		};
	}

	// Some z-levels will not have a fully populated grid, since not all lots
	// will be the same 'tallness'. Fill in these missing cells with air.
	var air = Game.TileRepository.create('air');
	for (var z = 0; z < map.length; z++) {
		for (var x = 0; x < map[z].length; x++) {
			if(!map[z][x]) {
				map[z][x] = new Array(this._height * Game.getLotSize());
			}
			for (var y = 0; y < map[z][x].length; y++) {
				if(!map[z][x][y]) {
					map[z][x][y] = air;
				}
			};
		};
	};
	console.log(map);
	return map;
};