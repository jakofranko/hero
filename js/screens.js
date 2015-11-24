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
    	var width = 100;
    	var height = 48;
    	var depth = 6;

    	// Create a map based on our size parameters
    	var tiles = new Game.Builder(width, height, depth).getTiles();
	    this._player = new Game.Entity(Game.PlayerTemplate);
	    this._map = new Game.Map(tiles, this._player);
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

    	var visibleCells = {};
    	// Store this._map and player's z to prevent losing it in callbacks
        var map = this._map;
        var currentDepth = this._player.getZ();

    	//Find all visible cells
    	map.getFov(currentDepth).compute(this._player.getX(), this._player.getY(), this._player.getSightRadius(), function(x, y, radius, visibility) {
    		// console.log(visibility);
    		visibleCells[x + "," + y] = true;
    		// Mark cell as explored
            map.setExplored(x, y, currentDepth, true);
    	});

        // Iterate through visible map cells
        for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
        	for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
        		if(map.isExplored(x, y, currentDepth)) {
        			// Fetch the glyph for the tile and render it to the screen
		            var tile = this._map.getTile(x, y, currentDepth);
		            // The foreground color becomes dark gray if the tile has been explored but is not visible
                    var foreground = visibleCells[x + ',' + y] ? tile.getForeground() : 'darkGray';
		            display.draw(
		            	x - topLeftX,
		            	y - topLeftY,
		            	tile.getChar(), 
		            	foreground,
		            	tile.getBackground()
		            );
        		}
        	};
        };

        // Render the entities
        var entities = this._map.getEntities();
        for (var i = 0; i < entities.length; i++) {
        	var entity = entities[i];
        	if (visibleCells[entity.getX() + ',' + entity.getY()]) {
	        	// Only render the entity if they would show up on the screen
	        	if(entity.getX() < topLeftX + screenWidth && 
	        		entity.getX() >= topLeftX && 
	        		entity.getY() < topLeftY + screenHeight && 
	        		entity.getY() >= topLeftY &&
	        		entity.getZ() == this._player.getZ()) {
	        		display.draw(
	        			entity.getX() - topLeftX,
	        			entity.getY() - topLeftY,
	        			entity.getChar(),
	        			entity.getForeground(),
	        			entity.getBackground()
	        		);
	        	}
	        }
        };

        // Get the messages in the player's queue and render them
        var messages = this._player.getMessages();
        var messageY = 0;
        for (var i = 0; i < messages.length; i++) {
            // Draw each message, adding the number of lines
            messageY += display.drawText(
                0, 
                messageY,
                '%c{white}%b{black}' + messages[i]
            );
        }

        // Render player HP 
        var stats = '%c{white}%b{black}';
        stats += String.format('HP: %s/%s ', this._player.getHp(), this._player.getMaxHp());
        display.drawText(0, screenHeight, stats);
    },
    move: function(dX, dY, dZ) {
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        var newZ = this._player.getZ() + dZ;
        this._player.tryMove(newX, newY, newZ, this._map);
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
		            this.move(-1, 0, 0);
		        } else if (inputData.keyCode === ROT.VK_RIGHT) {
		            this.move(1, 0, 0);
		        } else if (inputData.keyCode === ROT.VK_UP) {
		            this.move(0, -1, 0);
		        } else if (inputData.keyCode === ROT.VK_DOWN) {
		            this.move(0, 1, 0);
		        } else {
		        	// Not a valid key
		        	return;
		        }
		        // Unlock the engine
            	this._map.getEngine().unlock();
		    }
        } else if (inputType === 'keypress') {
        	var keyChar = String.fromCharCode(inputData.charCode);
        	if(keyChar === '>') {
        		this.move(0, 0, 1);
        	} else if(keyChar === '<') {
        		this.move(0,0, -1);
        	} else {
        		// Not a valid key
        		return;
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