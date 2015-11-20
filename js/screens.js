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
	_centerX: 0,
	_centerY: 0,
    enter: function() { 
    	var map = {};
    	var mapWidth = 500;
    	var mapHeight = 500;
	    for (var x = 0; x < mapWidth; x++) {
	        for (var y = 0; y < mapHeight; y++) {
	        	var key = x + "," + y;
	        	map[key] = Game.Tile.nullTile;
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
	    	var key = x + "," + y;
	        if (value === 1) {
	            map[key] = Game.Tile.floorTile;
	        } else {
	            map[key] = Game.Tile.wallTile;
	        }
	    });
	    // Create our map from the tiles
	    this._map = new Game.Map(mapWidth, mapHeight, map);
    },
    exit: function() { console.log("Exited play screen."); },
    render: function(display) {
    	var screenWidth = Game.getScreenWidth();
    	var screenHeight = Game.getScreenHeight();

    	// Make sure top X isn't less than the zero corner
    	var topLeftX = Math.max(0, this._centerX - (screenWidth / 2));
    	// Make sure it doesn't get greater than the far right side of the screen
    	// (Make sure to still have enough room to fit the game screen)
    	topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
    	// Make sure the top Y doesn't go past the top of the map
    	var topLeftY = Math.max(0, this._centerY - (screenHeight / 2));
    	// Make sure Y doesn't get less than the top while at the bottom of the map
    	topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);

        // Iterate through visible map cells
        for (var x = 0; x < topLeftX + screenWidth; x++) {
        	for (var y = 0; y < topLeftY + screenHeight; y++) {
        		// Fetch the glyph for the tile and render it to the screen
	            var glyph = this._map.getTile(x, y).getGlyph();
	            display.draw(
	            	x - topLeftX,
	            	y - topLeftY,
	            	glyph.getChar(), 
	            	glyph.getForeground(),
	            	glyph.getBackground()
	            );
        	};
        };

        // Render the cursor
        display.draw(
            this._centerX - topLeftX, 
            this._centerY - topLeftY,
            '@',
            'white',
            'black');
    },
    move: function(dX, dY) {
        // Positive dX means movement right
        // negative means movement left
        // 0 means none
        this._centerX = Math.max(0, Math.min(this._map.getWidth() - 1, this._centerX + dX));
        // Positive dY means movement down
        // negative means movement up
        // 0 means none
        this._centerY = Math.max(0, Math.min(this._map.getHeight() - 1, this._centerY + dY));
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            // If enter is pressed, go to the win screen
            // If escape is pressed, go to lose screen
            if (inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.winScreen);
            } else if (inputData.keyCode === ROT.VK_ESCAPE) {
                Game.switchScreen(Game.Screen.loseScreen);
            }

            // Movement
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