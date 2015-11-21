// Tutorial reference: http://www.codingcookies.com/2013/04/03/building-a-roguelike-in-javascript-part-2/
// TODO: Build a 'fromTemplate' function to parse files or a logo or something like that
// TODO: Flesh out startScreen to be more of a menu, flipping between current items etc.
Game.Screen = {};

// Define start screen
Game.Screen.startScreen = {
	enter: function() { console.log('Entered teh start screen'); },
	exit: function() { console.log('Exited the start screen'); },
	render: function(display) {
		// Render prompt to the screen
		display.drawText(1, 1, "%c{yellow}Javascript Roguelike");
		display.drawText(1, 2, "Press [Enter] to start!");
	},
	handleInput: function(inputType, inputData) {
		// When [Enter] is pressed, go to the play screen
		if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
			Game.switchScreen(Game.Screen.playScreen);
		}
	}
}

// Define our playing screen
Game.Screen.playScreen = {
	_map: null,
	_player: null,
    enter: function() { 
    	var map = [];
    	var mapWidth = 500;
    	var mapHeight = 500;
	    for (var x = 0; x < mapWidth; x++) {
	    	// Create the nested array for the y values
        	map.push([]);
	        for (var y = 0; y < mapHeight; y++) {
	        	map[x].push(Game.Tile.nullTile);
	        }
	    }

	    var generator = new ROT.Map.Cellular(mapWidth, mapHeight);
	    generator.randomize(0.5);
	    var totalIterations = 3;
	    // Iteratively smoothen the map
	    for (var i = 0; i < totalIterations - 1; i++) {
	        generator.create();
	    }
	    // Smoothen it one last time and then update our map
	    generator.create(function(x, y, value) {
	        if (value === 1) {
	            map[x][y] = Game.Tile.floorTile;
	        } else {
	            map[x][y] = Game.Tile.wallTile;
	        }
	    });

	    // Create the player in a random flor tile
	    this._player = new Game.Entity(Game.PlayerTemplate);
	    // Create our map from the tiles
	    this._map = new Game.Map(map, this._player);
	    this._map.getEngine().start();
    },
    exit: function() { console.log("Exited play screen."); },
    render: function(display) {
    	var screenWidth = Game.getScreenWidth();
    	var screenHeight = Game.getScreenHeight();

    	// Make sure top X isn't less than the zero corner
    	var topLeftX = Math.max(0, this._player.getX() - (screenWidth / 2));
    	// Make sure it doesn't get greater than the far right side of the screen
    	// (Make sure to still have enough room to fit the game screen)
    	topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
    	// Make sure the top Y doesn't go past the top of the map
    	var topLeftY = Math.max(0, this._player.getY() - (screenHeight / 2));
    	// Make sure Y doesn't get less than the top while at the bottom of the map
    	topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);

        // Iterate through visible map cells
        for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
        	for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
        		// Fetch the glyph for the tile and render it to the screen
	            var tile = this._map.getTile(x, y);
	            display.draw(
	            	x - topLeftX,
	            	y - topLeftY,
	            	tile.getChar(), 
	            	tile.getForeground(),
	            	tile.getBackground()
	            );
        	};
        };

        var entities = this._map.getEntities();
        for (var i = 0; i < entities.length; i++) {
        	var e = entities[i];
        	// Only render the entity if they would show up on the screen
        	if(e.getX() < topLeftX + screenWidth && e.getX() >= topLeftX && e.getY() < topLeftY + screenHeight && e.getY() >= topLeftY) {
        		display.draw(
        			e.getX() - topLeftX,
        			e.getY() - topLeftY,
        			e.getChar(),
        			e.getForeground(),
        			e.getBackground()
        		);
        	}
        };
    },
    move: function(dX, dY) {
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        this._player.tryMove(newX, newY, this._map);
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            // If enter is pressed, go to the win screen
            // If escape is pressed, go to lose screen
            if (inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.winScreen);
            } else if (inputData.keyCode === ROT.VK_ESCAPE) {
                Game.switchScreen(Game.Screen.loseScreen);
            } else {
		        if (inputData.keyCode === ROT.VK_LEFT) {
		            this.move(-1, 0);
		        } else if (inputData.keyCode === ROT.VK_RIGHT) {
		            this.move(1, 0);
		        } else if (inputData.keyCode === ROT.VK_UP) {
		            this.move(0, -1);
		        } else if (inputData.keyCode === ROT.VK_DOWN) {
		            this.move(0, 1);
		        }
		    }
            // Unlock the engine
            this._map.getEngine().unlock();
        }    
    }
}

// Define our winning screen
Game.Screen.winScreen = {
    enter: function() {    console.log("Entered win screen."); },
    exit: function() { console.log("Exited win screen."); },
    render: function(display) {
        // Render our prompt to the screen
        for (var i = 0; i < 22; i++) {
            // Generate random background colors
            var r = Math.round(Math.random() * 255);
            var g = Math.round(Math.random() * 255);
            var b = Math.round(Math.random() * 255);
            var background = ROT.Color.toRGB([r, g, b]);
            display.drawText(2, i + 1, "%b{" + background + "}You win!");
        }
    },
    handleInput: function(inputType, inputData) {
        if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
			Game.switchScreen(Game.Screen.playScreen);
		}   
    }
}

// Define our winning screen
Game.Screen.loseScreen = {
    enter: function() { console.log("Entered lose screen."); },
    exit: function() { console.log("Exited lose screen."); },
    render: function(display) {
        // Render our prompt to the screen
        for (var i = 0; i < 22; i++) {
            display.drawText(2, i + 1, "%b{red}You lose! :(");
        }
    },
    handleInput: function(inputType, inputData) {
        if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
			Game.switchScreen(Game.Screen.startScreen);
		}     
    }
}