Game.Lot = function(properties) {
	properties = properties || {};
	// Call the glyph's constructor with our set of properties
	Game.DynamicGlyph.call(this, properties);

	this._downtown = (typeof properties['downtown'] !== undefined) ? properties['downtown'] : 1;
	this._midtown = (typeof properties['midtown'] !== undefined) ? properties['midtown'] : 1;
	this._uptown = (typeof properties['uptown'] !== undefined) ? properties['uptown'] : 1;
	this._suburbs = (typeof properties['suburbs'] !== undefined) ? properties['suburbs'] : 1;
	this._orientation = properties['orientation'] || false;

	this._width = properties['width'] || Game.getLotSize();
	this._height = properties['height'] || Game.getLotSize();

	// Should be an array of objects like this: [{amount: int, type: string}]
	this._buildingSpecs = properties['buildingSpecs'] || null;
	if(this._buildingSpecs) {
		// Build each building
		this._buildings = [];
		for(var spec in this._buildingSpecs) {
			var amount = this._buildingSpecs[spec].amount;
			var type = this._buildingSpecs[spec].type;
			var repo = this._buildingSpecs[spec].repo;
			for(i = 0; i < amount; i++) {
				this._buildings.push(Game[repo].create(type));
			}
		}
	}

	this.getTiles = null;
	if(typeof properties['buildTiles'] === 'function') {
		this.getTiles = properties['buildTiles'];	
	} else {
		this.getTiles = function() {
			return this.fillLot('floor');
		};
	}

	this._items = properties['items'] || {};

	this._jobLocations = properties['jobLocations'] || [];
	this._companies = properties['companies'] || [];
};
// Make items inherit all the functionality from glyphs
Game.Lot.extend(Game.DynamicGlyph);

Game.Lot.prototype.setOrientation = function(orientation) {
	this._orientation = orientation;
};
Game.Lot.prototype.getBuildingSpecs = function() {
	return this._buildingSpecs;
};
Game.Lot.prototype.getBuildings = function() {
	return this._buildings || false;
};
Game.Lot.prototype.getMidWidth = function() {
	return Math.round(this._width / 2);
};
Game.Lot.prototype.getMidHeight = function() {
	return Math.round(this._height / 2);
};
Game.Lot.prototype.getWidth = function() {
	return this._width;
};
Game.Lot.prototype.getHeight = function() {
	return this._height;
};
Game.Lot.prototype.getJobLocations = function() {
	return this._jobLocations;
};
Game.Lot.prototype.setJobLocations = function(jobLocations) {
	this._jobLocations = jobLocations;
};
Game.Lot.prototype.addJobLocation = function(location) {
	if(this._jobLocations.indexOf(location) < 0)
		this._jobLocations.push(location);
};
Game.Lot.prototype.getCompanies = function() {
	return this._companies;
};
Game.Lot.prototype.setCompanies = function(companies) {
	this._companies = companies;
};
// Used during city generation to determine whether or not
// a lot will be placed based on the frequency those lots
// appear in a given neigborhood.
Game.Lot.prototype.willSpawn = function(neighborhood) {
	var spawn;
	switch(neighborhood) {
		case 'downtown':
			spawn = Math.random() <= this._downtown;
			break;
		case 'midtown':
			spawn = Math.random() <= this._midtown;
			break;
		case 'uptown':
			spawn = Math.random() <= this._uptown;
			break;
		case 'suburbs':
			spawn = Math.random() <= this._suburbs;
			break;
		default:
			spawn = false;
			break;
	}
	return spawn;
};
Game.Lot.prototype.fillLot = function(tile, extraProperties) {
	var result = [];
	var fill = null;
	// If no extra properties, then just create one generic tile
	if(!extraProperties) {
		fill = Game.TileRepository.create(tile);
	}

	for (var x = 0; x < this._width; x++) {
		result[x] = new Array(this._height);
		for (var y = 0; y < this._height; y++) {
			// If we've created a fill, populate the lot with that tile
			if(fill) {
				result[x][y] = fill;
			} else {
				// Otherwise create a new tile every time
				result[x][y] = Game.TileRepository.create(tile, extraProperties);
			}
		}
	}

	// Only 1 z-level so return as the only element of an array
	return [result];
};

Game.Lot.prototype.getItemsAt = function(x, y, z) {
    return this._items[x + ',' + y + ',' + z];
};

Game.Lot.prototype.setItemsAt = function(x, y, z, items) {
    // If our items array is empty, then delete the key from the table.
    var key = x + ',' + y + ',' + z;
    if (items.length === 0) {
        if (this._items[key]) {
            delete this._items[key];
        }
    } else {
        // Simply update the items at that key
        this._items[key] = items;
    }
};

Game.Lot.prototype.addItem = function(x, y, z, item) {
    // If we already have items at that position, simply append the item to the list of items.
    var key = x + ',' + y + ',' + z;
    if (this._items[key]) {
        this._items[key].push(item);
    } else {
        this._items[key] = [item];
    }
};

Game.Lot.prototype.placeCenteredBuilding = function(lotTiles, building) {
	var centerX = this.getMidWidth();
	var centerY = this.getMidHeight();

	building.build();
	// Add building's job locaitons to lot job locations
	this.setCompanies(building.getCompanies());

	var buildingMidWidth = building.getMidWidth();
	var buildingMidHeight = building.getMidHeight();
	var b = building.getBlueprint();

	// Place the building in the center of the lot
	// Find upper corner...
	var cornerX = centerX - buildingMidWidth;
	var cornerY = centerY - buildingMidHeight;
	if(cornerX < 0 || cornerY < 0) {
		return lotTiles;
	}

	for (var z = 0; z < building.getStories(); z++) {
		if(!lotTiles[z])
			lotTiles[z] = new Array(this.getWidth());

		for (var x = 0; x < b[z].length; x++) {
			if(!lotTiles[z][x + cornerX])
				lotTiles[z][x + cornerX] = new Array(this.getHeight());

			for (var y = 0; y < b[z][x].length; y++) {
				lotTiles[z][x + cornerX][y + cornerY] = b[z][x][y];

				var items = building.getItemsAt(x, y, z);
				if(items && items.length)
					this.setItemsAt(x + cornerX, y + cornerY, z, items);
			}
		}

		// Fill any undefined grid spots with grass or air
		for (var lotX = 0; lotX < lotTiles[z].length; lotX++) {
			if(!lotTiles[z][lotX])
				lotTiles[z][lotX] = new Array(this.getHeight());
			for (var lotY = 0; lotY < lotTiles[z][lotX].length; lotY++) {
				if(!lotTiles[z][lotX][lotY]) {
					var tile = (z === 0) ? 'grass' : 'air';
					lotTiles[z][lotX][lotY] = Game.TileRepository.create(tile);
				}
			}
		}
	}

	return lotTiles;
};