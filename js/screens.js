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
	_gameEnded: false,
    _subScreen: null,
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
        // Render subscreen if there is one
        if (this._subScreen) {
            this._subScreen.render(display);
            return;
        }

        // Otherwise, procede as usual...
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
        		if (map.isExplored(x, y, currentDepth)) {
                    // Fetch the glyph for the tile and render it to the screen
                    // at the offset position.
                    var glyph = this._map.getTile(x, y, currentDepth);
                    var foreground = glyph.getForeground();
                    // If we are at a cell that is in the field of vision, we need
                    // to check if there are items or entities.
                    if (visibleCells[x + ',' + y]) {
                        // Check for items first, since we want to draw entities
                        // over items.
                        var items = map.getItemsAt(x, y, currentDepth);
                        // If we have items, we want to render the top most item
                        if (items) {
                            glyph = items[items.length - 1];
                        }
                        // Check if we have an entity at the position
                        if (map.getEntityAt(x, y, currentDepth)) {
                            glyph = map.getEntityAt(x, y, currentDepth);
                        }
                        // Update the foreground color in case our glyph changed
                        foreground = glyph.getForeground();
                    } else {
                        // Since the tile was previously explored but is not 
                        // visible, we want to change the foreground color to
                        // dark gray.
                        foreground = 'darkGray';
                    }
                    
                    display.draw(
                        x - topLeftX,
                        y - topLeftY,
                        glyph.getChar(), 
                        foreground, 
                        glyph.getBackground());
                }
        	};
        };

        // Render the entities
        var entities = this._map.getEntities();
        for (var key in entities) {
        	var entity = entities[key];
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

        // Render hunger state
        var hungerState = this._player.getHungerState();
        display.drawText(screenWidth - hungerState.length, screenHeight, hungerState);
    },
    move: function(dX, dY, dZ) {
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        var newZ = this._player.getZ() + dZ;
        this._player.tryMove(newX, newY, newZ, this._map);
    },
    handleInput: function(inputType, inputData) {
    	// If the game is over, enter will bring the user to the losing screen.
        if(this._gameEnded) {
            if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.loseScreen);
            }
            // Return to make sure the user can't still play
            return;
        }
        // Handle subscreen input if there is one
        if (this._subScreen) {
            this._subScreen.handleInput(inputType, inputData);
            return;
        }

        // Otherwise, handle input normally for this screen
        if (inputType === 'keydown') {
	        if (inputData.keyCode === ROT.VK_LEFT) {
	            this.move(-1, 0, 0);
	        } else if (inputData.keyCode === ROT.VK_RIGHT) {
	            this.move(1, 0, 0);
	        } else if (inputData.keyCode === ROT.VK_UP) {
	            this.move(0, -1, 0);
	        } else if (inputData.keyCode === ROT.VK_DOWN) {
                this.move(0, 1, 0);
            } else if (inputData.keyCode === ROT.VK_I) {
                // Show the inventory screen
                this.showItemsSubScreen(Game.Screen.inventoryScreen, this._player.getItems(), 'You are not carrying anything.');
                return;
            } else if (inputData.keyCode === ROT.VK_D) {
                // Show the drop screen
                this.showItemsSubScreen(Game.Screen.dropScreen, this._player.getItems(), 'You have nothing to drop.');
                return;
            } else if (inputData.keyCode === ROT.VK_E) {
                // Show the drop screen
                this.showItemsSubScreen(Game.Screen.eatScreen, this._player.getItems(), 'You have nothing to eat.');
                return;
            } else if (inputData.keyCode === ROT.VK_W) {
                if (inputData.shiftKey) {
                    // Show the wear screen
                    this.showItemsSubScreen(Game.Screen.wearScreen, this._player.getItems(), 'You have nothing to wear.');
                } else {
                    // Show the wield screen
                    this.showItemsSubScreen(Game.Screen.wieldScreen, this._player.getItems(), 'You have nothing to wield.');
                }
                return;
            } else if (inputData.keyCode === ROT.VK_COMMA) {
                var items = this._map.getItemsAt(this._player.getX(), this._player.getY(), this._player.getZ());
                // If there is only one item, directly pick it up
                if (items && items.length === 1) {
                    var item = items[0];
                    if (this._player.pickupItems([0])) {
                        Game.sendMessage(this._player, "You pick up %s.", [item.describeA()]);
                    } else {
                        Game.sendMessage(this._player, "Your inventory is full! Nothing was picked up.");
                    }
                } else {
                    this.showItemsSubScreen(Game.Screen.pickupScreen, items, 'There is nothing here to pick up.');
                } 
            } else {
                // Not a valid key
                return;
            }
	        // Unlock the engine
        	this._map.getEngine().unlock();
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
    },
    setGameEnded: function(gameEnded) {
        this._gameEnded = gameEnded;
    },
    setSubScreen: function(subScreen) {
        this._subScreen = subScreen;
        Game.refresh();
    },
    showItemsSubScreen: function(subScreen, items, emptyMessage) {
        if (items && subScreen.setup(this._player, items) > 0) {
            this.setSubScreen(subScreen);
        } else {
            Game.sendMessage(this._player, emptyMessage);
            Game.refresh();
        }
    }
}

// Item Listing
Game.Screen.ItemListScreen = function(template) {
    // Set up based on the template
    this._caption = template['caption'];
    this._okFunction = template['ok'];
    // By default, we use the identity function
    this._isAcceptableFunction = template['isAcceptable'] || function(x) {
        return x;
    }

    // Can the user select items at all?
    this._canSelectItem = template['canSelect'];

    // Can they select multiple items?
    this._canSelectMultipleItems = template['canSelectMultipleItems'];

    // Whether a 'no item' option should appear.
    this._hasNoItemOption = template['hasNoItemOption'];
};

Game.Screen.ItemListScreen.prototype.setup = function(player, items) {
    this._player = player;
    // Should be called before switching to the screen.
    var count = 0;
    // Iterate over each item, keeping only the aceptable ones and counting the number of acceptable items.
    var that = this;
    this._items = items.map(function(item) {
        // Transform the item into null if it's not acceptable
        if (that._isAcceptableFunction(item)) {
            count++;
            return item;
        } else {
            return null;
        }
    });

    // Clean set of selected indices
    this._selectedIndices = {};
    return count;
};

Game.Screen.ItemListScreen.prototype.render = function(display) {
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    // Render the no item row if enabled
    if (this._hasNoItemOption) {
        display.drawText(0, 1, '0 - no item');
    }   
    // Render the caption in the top row
    display.drawText(0, 0, this._caption);
    var row = 0;
    for(var i = 0; i < this._items.length; i++) {
        // If we have an item, we want to render it
        if(this._items[i]) {
            // Get the letter corresponding to the item's index
            var letter = letters.substring(i, i + 1);

            // If the item is selected, show a +, otherwise show a dash, then the item's name
            var selectionState = (this._canSelectItem && this._canSelectMultipleItems && this._selectedIndices[i]) ? '+' : '-';

            // Render at the correct row and add 2
            display.drawText(0, 2 + row, letter + ' ' + selectionState + ' ' + this._items[i].describe());
            row++;
        }
    }
};

Game.Screen.ItemListScreen.prototype.executeOkFunction = function() {
    // Gather the selected items.
    var selectedItems = {};
    for (var key in this._selectedIndices) {
        selectedItems[key] = this._items[key];
    }

    // Switch back to play screen
    Game.Screen.playScreen.setSubScreen(undefined);

    // Call the OK function and end the player's turn if it returns true
    if(this._okFunction(selectedItems)) {
        this._player.getMap().getEngine().unlock();
    }
};

Game.Screen.ItemListScreen.prototype.handleInput = function(inputType, inputData) {
    if(inputType === 'keydown') {
        // If the user hit escape, hit enter and can't select an item, or hit
        // enter without any items selected, simply cancel out
        if (inputData.keyCode === ROT.VK_ESCAPE || (inputData.keyCode === ROT.VK_RETURN && (!this._canSelectItem || Object.keys(this._selectedIndices).length === 0))) {
            Game.Screen.playScreen.setSubScreen(undefined);
        // Handle pressing return when items are selected
        } else if (inputData.keyCode === ROT.VK_RETURN) {
            this.executeOkFunction();
        // Handle pressing zero when 'no item' selection is enabled
        } else if (this._canSelectItem && this._hasNoItemOption && inputData.keyCode === ROT.VK_0) {
            this._selectedIndices = {};
            this.executeOkFunction();
        // Handle pressing a letter if we can select
        } else if (this._canSelectItem && inputData.keyCode >= ROT.VK_A && inputData.keyCode <= ROT.VK_Z) {
            // Check if it maps to a valid item by subtracting 'a' from the character
            // to know what letter of the alphabet we used.
            var index = inputData.keyCode - ROT.VK_A;
            if (this._items[index]) {
                // If multiple selection is allowed, toggle the selection status, else
                // select the item and exit the screen
                if (this._canSelectMultipleItems) {
                    if (this._selectedIndices[index]) {
                        delete this._selectedIndices[index];
                    } else {
                        this._selectedIndices[index] = true;
                    }
                    // Redraw screen
                    Game.refresh();
                } else {
                    this._selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            }
        }
    }
}

// Inventory sub-screens
Game.Screen.inventoryScreen = new Game.Screen.ItemListScreen({
    caption: 'Inventory',
    canSelect: false
});

Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the items you wish to pickup',
    canSelect: true,
    canSelectMultipleItems: true,
    ok: function(selectedItems) {
        // Try to pick up all items, messaging the player if they couldn't all be picked up.
        if (!this._player.pickupItems(Object.keys(selectedItems))) {
            Game.sendMessage(this._player, "Your inventory is full! Not all items were picked up.");
        }
        return true;
    }
});

Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to drop',
    canSelect: true,
    canSelectMultipleItems: false,
    ok: function(selectedItems) {
        // Drop the selected item
        this._player.dropItem(Object.keys(selectedItems)[0]);
        return true;
    }
});

Game.Screen.eatScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to eat',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return item && item.hasMixin('Edible');
    },
    ok: function(selectedItems) {
        // Eat the item, removing it if there are no consumptions remaining.
        var key = Object.keys(selectedItems)[0];
        var item = selectedItems[key];
        Game.sendMessage(this._player, "You eat %s.", [item.describeThe()]);
        item.eat(this._player);
        if (!item.hasRemainingConsumptions()) {
            this._player.removeItem(key);
        }
        return true;
    }
});

Game.Screen.wieldScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to wield',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable: function(item) {
        return item && item.hasMixin('Equippable') && item.isWieldable();
    },
    ok: function(selectedItems) {
        // Check if we selected 'no item'
        var keys = Object.keys(selectedItems);
        if (keys.length === 0) {
            this._player.unwield();
            Game.sendMessage(this._player, "You are empty handed.")
        } else {
            // Make sure to unequip the item first in case it is the armor.
            var item = selectedItems[keys[0]];
            this._player.unequip(item);
            this._player.wield(item);
            Game.sendMessage(this._player, "You are wielding %s.", [item.describeA()]);
        }
        return true;
    }
});

Game.Screen.wearScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to wear',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable: function(item) {
        return item && item.hasMixin('Equippable') && item.isWearable();
    },
    ok: function(selectedItems) {
        // Check if we selected 'no item'
        var keys = Object.keys(selectedItems);
        if (keys.length === 0) {
            this._player.unwield();
            Game.sendMessage(this._player, "You are not wearing anthing.")
        } else {
            // Make sure to unequip the item first in case it is the weapon.
            var item = selectedItems[keys[0]];
            this._player.unequip(item);
            this._player.wear(item);
            Game.sendMessage(this._player, "You are wearing %s.", [item.describeA()]);
        }
        return true;
    }
});

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