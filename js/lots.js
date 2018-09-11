Game.LotRepository = new Game.Repository('lots', Game.Lot);

Game.LotRepository.define('skyscraper', {
    name: 'skyscraper',
    character: '|',
    downtown: 1,
    midtown: 0.5,
    uptown: 0.1,
    suburbs: 0,
    buildingSpecs: [
        {
            type: 'skyscraper',
            amount: 1,
            repo: 'BuildingRepository'
        }
    ],
    buildTiles: function() {
        var initialTiles = this.fillLot('grass');
        return this.placeCenteredBuilding(initialTiles, this.getBuildings()[0]);
    }
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
            repo: 'BuildingRepository'
        },
        {
            type: 'warehouse',
            amount: 1,
            repo: 'BuildingRepository'
        }
    ],
    buildTiles: function() {
        // TODO: Smarter way of pickin the direction houses face
        // Add terrain
        var tiles = this.fillLot('floor');
        var air = Game.TileRepository.create('air');

        // Add the building
        var centerX = this.getMidWidth();
        var centerY = this.getMidHeight();

        var building = this.getBuildings().random();
        building.build();

        // Add building's job locaitons to lot job locations
        this.setCompanies(building.getCompanies());

        // Set up dimensions and fetch the blueprint
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

        this.adjustCompaniesX(cornerX);
        this.adjustCompaniesY(cornerY);

        for (var z = 0; z < building.getStories(); z++) {
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
                        if(b[z][i] === undefined)
                            debugger;
                        tiles[z][x][y] = b[z][i][j];

                        // Add building items to lot items
                        var items = building.getItemsAt(i, j, z);
                        if(items && items.length)
                            this.setItemsAt(x, y, z, items);
                    } else if(z > 0) {
                        tiles[z][x][y] = air;
                    }
                }
            }
        }

        // Lastly, place a sign that has the names of the companies in each building
        var signOffsetX = [0, building.getWidth()].random(),
            signOffsetY = [0, building.getHeight()].random();

        if(signOffsetX === 0)
            signOffsetX--;
        else
            signOffsetX++;

        if(signOffsetY === 0)
            signOffsetY--;
        else
            signOffsetY++;

        var companyNames = building.getCompanies().map(function(company) {
            return company.name;
        });
        companyNames.unshift('Company Directory:');
        this.addItem(cornerX + signOffsetX, cornerY + signOffsetY, 0, Game.ItemRepository.create('sign', {inscription: companyNames.join("\n")}));

        return tiles;
    }
});
Game.LotRepository.define('bank', {
    name: 'bank',
    character: '$',
    downtown: 0.5,
    midtown: 0.5,
    uptown: 0.5,
    suburbs: 0.5,
    buildingSpecs: [
        {
            type: 'bank',
            amount: 1,
            repo: 'BuildingRepository'
        }
    ],
    buildTiles: function() {
        var initialTiles = this.fillLot('grass');
        return this.placeCenteredBuilding(initialTiles, this.getBuildings()[0]);
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
Game.LotRepository.define('apartments', {
    name: 'apartments',
    character: 'A',
    downtown: 1,
    midtown: 1,
    uptown: 1,
    suburbs: 0.6,
    buildingSpecs: [
        {
            type: 'apartment',
            amount: 1,
            repo: 'BuildingRepository'
        }
    ],
    buildTiles: function() {
        var tiles = this.fillLot('grass');
        var centerX = this.getMidWidth();
        var centerY = this.getMidHeight();

        var apartment = this.getBuildings()[0];
        apartment.build();
        var a = apartment.getBlueprint();
        var apartmentMidWidth = apartment.getMidWidth();
        var apartmentMidHeight = apartment.getMidHeight();

        var cornerX = centerX - apartmentMidWidth;
        var cornerY = centerY - apartmentMidHeight;
        if(cornerX < 0 || cornerY < 0) {
            return tiles;
        }

        for (var z = 0; z < apartment.getStories(); z++) {
            if(!tiles[z])
                tiles[z] = new Array(this.getWidth());

            for (var x = 0; x < a[z].length; x++) {
                if(!tiles[z][x + cornerX])
                    tiles[z][x + cornerX] = new Array(this.getHeight());

                for (var y = 0; y < a[z][x].length; y++) {
                    tiles[z][x + cornerX][y + cornerY] = a[z][x][y];

                    var items = apartment.getItemsAt(x, y, z);
                    if(items && items.length)
                        this.setItemsAt(x + cornerX, y + cornerY, z, items);
                }
            }

            // Fill any undefined grid spots with grass or air
            for (var lotX = 0; lotX < tiles[z].length; lotX++) {
                if(!tiles[z][lotX])
                    tiles[z][lotX] = new Array(this.getHeight());
                for (var lotY = 0; lotY < tiles[z][x].length; lotY++) {
                    if(!tiles[z][lotX][lotY]) {
                        var tile = (z === 0) ? 'grass' : 'air';
                        tiles[z][lotX][lotY] = Game.TileRepository.create(tile);
                    }
                }
            }
        }

        // Add living locations
        var livingLocations = apartment.getLivingLocations();
        if(livingLocations.length) {
            for (var i = 0; i < livingLocations.length; i++) {
                var loc = livingLocations[i].split(","),
                    lx = Number(loc[0]) + cornerX,
                    ly = Number(loc[1]) + cornerY,
                    lz = Number(loc[2]);
                this.addLivingLocation(lx + "," + ly + "," + lz);
            }
        }
        return tiles;
    }
});
Game.LotRepository.define('houses', {
    name: 'houses',
    character: '^',
    downtown: 0,
    midtown: 0,
    uptown: 0.3,
    suburbs: 1,
    buildingSpecs: [
        {
            type: 'medium house',
            amount: 4,
            repo: 'HouseRepository'
        }
    ],
    buildTiles: function() {
        var tiles = this.fillLot('grass');
        var buildings = this.getBuildings();
        var w, h, i;

        // This is the number of buildings we can fit on each row and column
        w = h = Math.sqrt(buildings.length);
        i = 0;
        for (var lotX = 0; lotX < w; lotX++) {
            for (var lotY = 0; lotY < h; lotY++) {
                // Adding to to the startX and startY will allow for a 1-tile perimeter
                var startX = lotX * (Game.getLotSize() / w) + 1;
                var startY = lotY * (Game.getLotSize() / h) + 1;

                // In the house definition, a small sidewalk is accounted for by subtracting 2 from the width and height
                var houseTiles = buildings[i].getTiles();
                for (var z = 0; z < houseTiles.length; z++) {
                    if(!tiles[z])
                        tiles[z] = new Array(this.getWidth());

                    for(x = 0, tilesX = startX; x < houseTiles[z].length; x++, tilesX++) {
                        if(!tiles[z][tilesX])
                            tiles[z][tilesX] = new Array(this.getHeight());

                        for (var y = 0, tilesY = startY; y < houseTiles[z][x].length; y++, tilesY++) {
                            tiles[z][tilesX][tilesY] = houseTiles[z][x][y];

                            // Add house items to lot items
                            var items = buildings[i].getItemsAt(x, y, z);
                            if(items)
                                this.setItemsAt(tilesX, tilesY, z, items);
                        }
                    }
                }

                // If the house has any living locations, add them to the lot's living locations
                var livingLocations = buildings[i].getLivingLocations();
                if(livingLocations.length) {
                    for (var j = 0; j < livingLocations.length; j++) {
                        var split = livingLocations[j].split(","),
                            lx = Number(split[0]) + startX,
                            ly = Number(split[1]) + startY,
                            lz = Number(split[2]);
                        this.addLivingLocation(lx + "," + ly + "," + lz);
                    }
                }
                i++;
            }
        }
        tiles = Game.spaceFill(tiles);

        // for (var z = 0; z < tiles.length; z++) {
        //     Game._consoleLogGrid(tiles[z], '_char', this.getItems(), z);
        // }
        return tiles;
    }
});
Game.LotRepository.define('empty', {
    name: 'empty',
    character: ' ',
    downtown: 0.5,
    midtown: 0.5,
    uptown: 0.5,
    suburbs: 0.5,
    buildTiles: function() {
        var x, y;
        var bush = Game.ItemRepository.create('bush');

        for (var i = 0, num = Game.getRandomInRange(2, 6); i < num; i++) {
            x = Game.getRandomInRange(0, this.getWidth());
            y = Game.getRandomInRange(0, this.getHeight());
            this.addItem(x, y, 0, bush);
        }

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
