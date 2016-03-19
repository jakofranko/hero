// Tutorial reference: http://www.codingcookies.com/2013/04/03/building-a-roguelike-in-javascript-part-2/
// ASCII art from http://www.chris.com/ascii/index.php?art=objects/scales; altered by me.
// TODO: Build a 'fromTemplate' function to parse files or a logo or something like that
// TODO: Flesh out startScreen to be more of a menu, flipping between current items etc.
Game.Screen = {};

// Define start screen
Game.Screen.startScreen = {
	enter: function() { Game.resize(Game.getDisplay(), true, false, true); },
	exit: function() { console.log('Exited the start screen'); },
	render: function(display) {
		// Render prompt to the screen
        var w = Game.getScreenWidth();
        var h = Game.getScreenHeight();
        var text = "%c{#585DF5}Justice%c{}: A Superhero Roguelike";
        display.drawText((w/2) - (text.length / 2), 2, text);

        text = "Press [%c{#585DF5}Enter%c{}] to start!";
        display.drawText((w/2) - (text.length / 2), 3, text);
        // The widest point of the scale is 74 characters, so, use that to pad the rest
        var widestPoint = "'Y88888888888888888888888P'       i8888i       'Y88888888888888888888888P'";
        // var padLeft = Math.round(widestPoint.length / 2);
        var scalesASCII = [
                        ",ggg,                   gg                   ,ggg,",
                       "d8P^^8b                ,d88b,                d8^^Y8b",
                       "Y8b,__,,aadd88888bbaaa,888888,aaadd88888bbaa,,__,d8P",
                        "'88888888888888888888I888888I88888888888888888888'",
                        "/|\\`^^YY8888888PP^^^^`888888'^^^^YY8888888PP^^'/|\\",
                       "/ | \\                  `WWWW'                  / | \\",
                      "/  |  \\                 ,dMMb,                 /  |  \\",
                     "/   |   \\                I8888I                /   |   \\",
                    "/    |    \\               `Y88P'               /    |    \\",
                   "/     |     \\               `YP'               /     |     \\",
                  "/      |      \\               88               /      |      \\",
                 "/       |       \\             i88i             /       |       \\",
                "/        |        \\            8888            /        |        \\",
            "'Y88888888888888888888888P'       i8888i       'Y88888888888888888888888P'",
              "`''Y888888888888888P'''        ,888888,        `''Y888888888888888P'''",
                                             "I888888I",
                                             "Y888888P",
                                             "`Y8888P'",
                                              "`WWWW'",
                                               "dMMb",
                                           "_,ad8888ba,_",
                                "__,,aaaadd888888888888888bbaaaa,,__",
                              "d8888888888888888888888888888888888888b"
        ];

        for (var i = 0; i < scalesASCII.length; i++) {
            display.drawText(3 + (widestPoint.length - scalesASCII[i].length) / 2, i + 7, "%c{#F5F058}" + scalesASCII[i]);
        }

        //             ,ggg,                   gg                   ,ggg,
        //            d8P^^8b                ,d88b,                d8^^Y8b
        //            Y8b,__,,aadd88888bbaaa,888888,aaadd88888bbaa,,__,d8P
        //             '88888888888888888888I888888I88888888888888888888'
        //             /|\`^^YY8888888PP^^^^`888888'^^^^YY8888888PP^^'/|\
        //            / | \                  `WWWW'                  / | \
        //           /  |  \                 ,dMMb,                 /  |  \
        //          /   |   \                I8888I                /   |   \
        //         /    |    \               `Y88P'               /    |    \
        //        /     |     \               `YP'               /     |     \
        //       /      |      \               88               /      |      \
        //      /       |       \             i88i             /       |       \
        //     /        |        \            8888            /        |        \
        // 'Y88888888888888888888888P'       i8888i       'Y88888888888888888888888P'
        //   `''Y888888888888888P'''        ,888888,        `''Y888888888888888P'''
        //                                  I888888I
        //                                  Y888888P
        //                                  `Y8888P'
        //                                   `WWWW'    Normand
        //                                    dMMb     Veilleux
        //                                _,ad8888ba,_
        //                     __,,aaaadd888888888888888bbaaaa,,__
        //                   d8888888888888888888888888888888888888b

	},
	handleInput: function(inputType, inputData) {
		// When [Enter] is pressed, go to the play screen
		if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
			Game.switchScreen(Game.Screen.playScreen);
		}
	}
};

Game.Screen.overview = {
    _city: null,
    enter: function(player) {
        this._player = player;
        this._city = player.getMap().getCity();
    },
    exit: function() { console.log('Exited the overview screen'); },
    render: function(display) {
        var playerX = Math.floor(this._player.getX() / Game.getLotSize());
        var playerY = Math.floor(this._player.getY() / Game.getLotSize());
        var lots = this._city.getLots();
        for(var x = 0; x < this._city.getWidth(); x++) {
            for (var y = 0; y < this._city.getHeight(); y++) {
                var lot = lots[x][y];
                var background;
                if(playerX == x && playerY == y)
                    background = 'grey';
                else
                    background = lot.getBackground();

                display.draw(
                    x,
                    y,
                    lot.getChar(),
                    lot.getForeground(),
                    background
                );
            }
        }
    },
    handleInput: function(inputType, inputData) {}
};

Game.Screen.stats = {
    enter: function(player) {
        this._player = player;
    },
    exit: function() { console.log('Exited the stats screen'); },
    render: function(display) {
        var red = Game.Palette.red;
        var blue = Game.Palette.blue;
        var yellow = Game.Palette.yellow;
        var BODY = "BODY: %c{" + red + "}" + String(this._player.getBODY()) + "/" + String(this._player.getMaxBODY());
        var STUN = "STUN: %c{" + blue + "}" + String(this._player.getSTUN()) + "/" + String(this._player.getMaxSTUN());
        var HTH = "HTH: %c{" + '' + "}" + this._player.getHTH();
        var XP = "XP: %c{" + yellow + "}" + this._player.getSpendablePoints();
        var y = 1;

        display.clear();
        display.drawText(0, y++, BODY);
        display.drawText(0, y++, STUN);
        display.drawText(0, y++, HTH);
        display.drawText(0, y++, XP);
    },
    handleInput: function(inputType, inputData) {}
};

// Define our playing screen
Game.Screen.playScreen = {
	_player: null,
    _time: null,
	_gameEnded: false,
    _subScreen: null,
    enter: function() {
        // TODO: Player chooses size of city?
        this._player = new Game.Entity(Game.PlayerTemplate);
        var map = new Game.Map(Game.getCitySize(), this._player);

        // Once player has been created, the map generated and the 
        // map assigned to the player (happens in map creation),
        // we can set the minimap to reflect the city overview.
        Game.setMiniMap(Game.Screen.overview, this._player);

        // Display the player's stats (characteristics)
        Game.setCharacterStats(Game.Screen.stats, this._player);

        // Start the map's engine
        map.getEngine().start();

        // The first thing that should happen is when the game starts is to
        // assign starting points
        Game.Screen.gainStatScreen.setup(this._player);
        this.setSubScreen(Game.Screen.gainStatScreen);
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

        // Render the tiles
        this.renderTiles(display);

        // Render player stats and time
        var stats = '%c{white}%b{black}';
        stats += String.format(
            'HP: %s/%s XP: %s Money: $%s %s',
            this._player.getHp(),
            this._player.getMaxHp(),
            this._player.getExperiencePoints(),
            this._player.getMoney(),
            this._player.getMap().getTime().clock()
        );
        display.drawText(0, screenHeight, stats);
    },
    move: function(dX, dY, dZ) {
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        var newZ = this._player.getZ() + dZ;
        this._player.tryMove(newX, newY, newZ, this._player.getMap());
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

        // If the player is unconscious, all they can do is skip their turn
        if(!this._player.isConscious()) {
            if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN)
                this._player.getMap().getEngine().unlock();
            else
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
            } else if(inputData.keyCode === ROT.VK_S) {
                // Show the stats screen for spending xp
                Game.Screen.gainStatScreen.setup(this._player);
                this.setSubScreen(Game.Screen.gainStatScreen);
                return;
            } else if(inputData.keyCode === ROT.VK_J) {
                this.setSubScreen(Game.Screen.justiceScreen);
                return;
            } else if (inputData.keyCode === ROT.VK_X) {
                // Show the drop screen
                this.showItemsSubScreen(Game.Screen.examineScreen, this._player.getItems(), 'You have nothing to examine.');
                return;
            } else if(inputData.keyCode === ROT.VK_T) {
                this.showItemsSubScreen(Game.Screen.throwScreen, this._player.getItems(), 'You have nothing to throw.');
                return;
            } else if (inputData.keyCode === ROT.VK_COMMA) {
                var items = this._player.getMap().getItemsAt(this._player.getX(), this._player.getY(), this._player.getZ());
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
            } else if(inputData.keyCode === ROT.VK_PERIOD) {
                // Skip turn
                this._player.getMap().getEngine().unlock();
                // If you don't stop it here, then it will try to perform two actions for the player
                return;
            } else {
                // Not a valid key
                return;
            }
	        // Unlock the engine
        	this._player.getMap().getEngine().unlock();
        } else if (inputType === 'keypress') {
        	var keyChar = String.fromCharCode(inputData.charCode);
        	if(keyChar === '>') {
        		this.move(0, 0, -1);
        	} else if(keyChar === '<') {
        		this.move(0, 0, 1);
        	} else if (keyChar === ';') {
                // Setup the look screen.
                var offsets = this.getScreenOffsets();
                Game.Screen.lookScreen.setup(
                    this._player,
                    this._player.getX(),
                    this._player.getY(),
                    offsets.x, 
                    offsets.y
                );
                this.setSubScreen(Game.Screen.lookScreen);
                return;
            } else if (keyChar === '?') {
                // Setup the look screen.
                this.setSubScreen(Game.Screen.helpScreen);
                return;
            } else {
        		// Not a valid key
        		return;
        	}
        	// Unlock the engine
        	this._player.getMap().getEngine().unlock();
        }
    },
    getScreenOffsets: function() {
        // Make sure we still have enough space to fit an entire game screen
        var topLeftX = Math.max(0, this._player.getX() - (Game.getScreenWidth() / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftX = Math.round(Math.min(topLeftX, this._player.getMap().getWidth() - Game.getScreenWidth()));
        // Make sure the y-axis doesn't above the top bound
        var topLeftY = Math.max(0, this._player.getY() - (Game.getScreenHeight() / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftY = Math.round(Math.min(topLeftY, this._player.getMap().getHeight() - Game.getScreenHeight()));
        return {
            x: topLeftX,
            y: topLeftY
        };
    },
    renderTiles: function(display) {
        var screenWidth = Game.getScreenWidth();
        var screenHeight = Game.getScreenHeight();

        var offsets = this.getScreenOffsets();
        var topLeftX = offsets.x;
        var topLeftY = offsets.y;
        // This object will keep track of all visible map cells
        var visibleCells = {};
        // Store this._player.getMap() and player's z to prevent losing it in callbacks
        var map = this._player.getMap();
        
        var currentDepth = this._player.getZ();
        // Find all visible cells and update the object
        map.getFov(currentDepth).compute(
            this._player.getX(), 
            this._player.getY(), 
            this._player.getSightRadius(), 
            function(x, y, radius, visibility) {
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
                    var glyph = map.getTile(x, y, currentDepth);
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
                        foreground = ROT.Color.toHex(ROT.Color.multiply([100,100,100], ROT.Color.fromString(foreground)));
                    }
                    
                    display.draw(
                        x - topLeftX,
                        y - topLeftY,
                        glyph.getChar(), 
                        foreground, 
                        glyph.getBackground()
                    );
                }
            }
        }

        // Render the entities
        var entities = this._player.getMap().getEntities();
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
            Game.refresh(this._player);
        }
    },
    getPlayer: function() {
        return this._player;
    }
};

// Item Listing
Game.Screen.ItemListScreen = function(template) {
    // Set up based on the template
    this._caption = template['caption'];
    this._okFunction = template['ok'];
    // By default, we use the identity function
    this._isAcceptableFunction = template['isAcceptable'] || function(x) {
        return x;
    };

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

            // If the item is stackable, show the number we are currently holding
            var stack = this._items[i].hasMixin('Stackable') ? ' (' + this._items[i].amount() + ')' : '';

            // Render at the correct row and add 2
            display.drawText(0, 2 + row, letter + ' ' + selectionState + ' ' + this._items[i].describe() + stack);
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
};

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
        return item && item.hasMixin('Edible') && item !== this._player._armor && item !== this._player._weapon;
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
            Game.sendMessage(this._player, "You are not wearing anthing.");
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
Game.Screen.examineScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to examine',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return true;
    },
    ok: function(selectedItems) {
        var keys = Object.keys(selectedItems);
        if (keys.length > 0) {
            var item = selectedItems[keys[0]];
            var description = "It's %s";
            var details = item.details();
            if(details && details != "") {
                description += " (%s).";
                Game.sendMessage(this._player, description, 
                [
                    item.describeA(false),
                    item.details()
                ]);
            } else {
                Game.sendMessage(this._player, description, [item.describeA(false)]);
            }
            
        }
        return true;
    }
});
Game.Screen.throwScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to throw',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        if(!item || !item.hasMixin('Throwable')) {
            return false;
        } else if(item.hasMixin('Equippable') && (item.isWielded() || item.isWorn())) {
            return false;
        } else {
            return true;
        }
    },
    ok: function(selectedItems) {
        var offsets = Game.Screen.playScreen.getScreenOffsets();
        // Go to the targetting screen
        Game.Screen.throwTargetScreen.setup(this._player, this._player.getX(), this._player.getY(), offsets.x, offsets.y);
        this._player.setThrowing(Object.keys(selectedItems)[0]);
        Game.Screen.playScreen.setSubScreen(Game.Screen.throwTargetScreen);
        return;
    }
});

// Targetting Screen
Game.Screen.TargetBasedScreen = function(template) {
    template = template || {};
    // By default, our ok return does nothing and does not consume a turn.
    this._okFunction = template['okFunction'] || function(x, y) {
        return false;
    };
    // The defaut caption function returns a description of the tiles or creatures.
    this._captionFunction = template['captionFunction'] || function(x, y) {
        var z = this._player.getZ();
        var map = this._player.getMap();
        // If the tile is explored, we can give a better capton
        if (map.isExplored(x, y, z)) {
            // If the tile isn't explored, we have to check if we can actually 
            // see it before testing if there's an entity or item.
            if (this._visibleCells[x + ',' + y]) {
                var items = map.getItemsAt(x, y, z);
                // If we have items, we want to render the top most item
                if (items) {
                    var item = items[items.length - 1];
                    return String.format('%s - %s (%s)',
                        item.getRepresentation(),
                        item.describeA(true),
                        item.details());
                // Else check if there's an entity
                } else if (map.getEntityAt(x, y, z)) {
                    var entity = map.getEntityAt(x, y, z);
                    return String.format('%s - %s (%s)',
                        entity.getRepresentation(),
                        entity.describeA(true),
                        entity.details());
                }
            }
            // If there was no entity/item or the tile wasn't visible, then use
            // the tile information.
            return String.format('%s - %s',
                map.getTile(x, y, z).getRepresentation(),
                map.getTile(x, y, z).getDescription());

        } else {
            var nullTile = Game.TileRepository.create('null');
            // If the tile is not explored, show the null tile description.
            return String.format('%s - %s',
                nullTile.getRepresentation(),
                nullTile.getDescription());
        }
    };
};
Game.Screen.TargetBasedScreen.prototype.setup = function(player, startX, startY, offsetX, offsetY) {
    this._player = player;
    // Store original position. Subtract the offset to make life easy so we don't
    // always have to remove it.
    this._startX = startX - offsetX;
    this._startY = startY - offsetY;
    // Store current cursor position
    this._cursorX = this._startX;
    this._cursorY = this._startY;
    // Store map offsets
    this._offsetX = offsetX;
    this._offsetY = offsetY;
    // Cache the FOV
    var visibleCells = {};
    this._player.getMap().getFov(this._player.getZ()).compute(
        this._player.getX(), this._player.getY(), 
        this._player.getSightRadius(), 
        function(x, y, radius, visibility) {
            visibleCells[x + "," + y] = true;
        });
    this._visibleCells = visibleCells;
};
Game.Screen.TargetBasedScreen.prototype.render = function(display) {
    Game.Screen.playScreen.renderTiles.call(Game.Screen.playScreen, display);

    // Draw a line from the start to the cursor.
    var points = Game.Geometry.getLine(this._startX, this._startY, this._cursorX, this._cursorY);

    // Render stars along the line.
    for (var i = 1, l = points.length; i < l; i++) {
        if(i == l - 1) {
            display.drawText(points[i].x, points[i].y, '%c{white}X');
        } else {
            display.drawText(points[i].x, points[i].y, '%c{white}*');    
        }
        
    }

    // Render the caption at the bottom.
    display.drawText(0, Game.getScreenHeight() - 1, 
        this._captionFunction(this._cursorX + this._offsetX, this._cursorY + this._offsetY));
};
Game.Screen.TargetBasedScreen.prototype.handleInput = function(inputType, inputData) {
    // Move the cursor
    if (inputType == 'keydown') {
        if (inputData.keyCode === ROT.VK_LEFT) {
            this.moveCursor(-1, 0);
        } else if (inputData.keyCode === ROT.VK_RIGHT) {
            this.moveCursor(1, 0);
        } else if (inputData.keyCode === ROT.VK_UP) {
            this.moveCursor(0, -1);
        } else if (inputData.keyCode === ROT.VK_DOWN) {
            this.moveCursor(0, 1);
        } else if (inputData.keyCode === ROT.VK_ESCAPE) {
            Game.Screen.playScreen.setSubScreen(undefined);
        } else if (inputData.keyCode === ROT.VK_RETURN) {
            this.executeOkFunction();
        }
    }
    Game.refresh();
};
Game.Screen.TargetBasedScreen.prototype.moveCursor = function(dx, dy) {
    // Make sure we stay within bounds.
    this._cursorX = Math.max(0, Math.min(this._cursorX + dx, Game.getScreenWidth()));
    // We have to save the last line for the caption.
    this._cursorY = Math.max(0, Math.min(this._cursorY + dy, Game.getScreenHeight() - 1));
};
Game.Screen.TargetBasedScreen.prototype.executeOkFunction = function() {
    // Switch back to the play screen.
    Game.Screen.playScreen.setSubScreen(undefined);
    // Call the OK function and end the player's turn if it return true.
    if (this._okFunction && this._okFunction(this._cursorX + this._offsetX, this._cursorY + this._offsetY)) {
        this._player.getMap().getEngine().unlock();
    }
};

// Target-based screens
Game.Screen.lookScreen = new Game.Screen.TargetBasedScreen({
    captionFunction: function(x, y) {
        var z = this._player.getZ();
        var map = this._player.getMap();
        // If the tile is explored, we can give a better capton
        if (map.isExplored(x, y, z)) {
            // If the tile isn't explored, we have to check if we can actually 
            // see it before testing if there's an entity or item.
            if (this._visibleCells[x + ',' + y]) {
                var items = map.getItemsAt(x, y, z);
                // If we have items, we want to render the top most item
                if (items) {
                    var item = items[items.length - 1];
                    return String.format('%s - %s (%s)',
                        item.getRepresentation(),
                        item.describeA(true),
                        item.details());
                // Else check if there's an entity
                } else if (map.getEntityAt(x, y, z)) {
                    var entity = map.getEntityAt(x, y, z);
                    return String.format('%s - %s (%s)',
                        entity.getRepresentation(),
                        entity.describeA(true) + ' ('+ entity.getName() + ')',
                        entity.details());
                }
            }
            // If there was no entity/item or the tile wasn't visible, then use
            // the tile information.
            return String.format('%s - %s',
                map.getTile(x, y, z).getRepresentation(),
                map.getTile(x, y, z).getDescription());

        } else {
            var nullTile = Game.TileRepository.create('null');
            // If the tile is not explored, show the null tile description.
            return String.format('%s - %s',
                nullTile.getRepresentation(),
                nullTile.getDescription());
        }
    }
});
Game.Screen.throwTargetScreen = new Game.Screen.TargetBasedScreen({
    okFunction: function(x, y) {
        this._player.throwItem(this._player.getThrowing(), x, y);
        return true;
    }
});

// Define our help screen
Game.Screen.helpScreen = {
    render: function(display) {
        var text = 'Help / Command List';
        var border = '-------------------';
        var y = 0;
        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, border);
        
        display.drawText(0, y++, '[%c{#585DF5},%c{}] to pick up items');
        display.drawText(0, y++, '[%c{#585DF5}d%c{}] to drop items');
        display.drawText(0, y++, '[%c{#585DF5}w%c{}] to wield items');
        display.drawText(0, y++, '[%c{#585DF5}W%c{}] to wield items');
        display.drawText(0, y++, '[%c{#585DF5}x%c{}] to examine items');
        display.drawText(0, y++, '[%c{#585DF5};%c{}] to look around you');
        display.drawText(0, y++, '[%c{#585DF5}.%c{}] to wait');
        display.drawText(0, y++, '[%c{#585DF5}j%c{}] to show city statistics');
        display.drawText(0, y++, '[%c{#585DF5}s%c{}] to spend experience points');
        display.drawText(0, y++, '[%c{#585DF5}?%c{}] to show this help screen');
        y += 3;
        text = '--- press any key to continue ---';
        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
    },
    handleInput: function(inputType, inputData) {
        Game.Screen.playScreen.setSubScreen(null);
    }
};

// View Justice meters
Game.Screen.justiceScreen = {
    _padding: 3,
    _border: 1,
    _green: ROT.Color.fromString("#00ff78"),
    _red: ROT.Color.fromString("#ea003b"),
    render: function(display) {
        var text = 'Justice';
        var justice = Game.Screen.playScreen.getPlayer().getMap().getJustice();
        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, 0, 'Justice');

        var startX = 0;
        var title = 'Justice';
        // Draw Justice Meter
        this._drawMeter(display, startX, 2, title, justice.getJustice() / 100);

        startX += (title.length + this._padding);
        title = 'Crime';
        // Draw Crime Meter
        this._drawMeter(display, startX, 2, title, justice.getCrime() / 100, true);

        // Number of Criminals
        startX += (title.length + this._padding);
        title = 'Criminals';
        display.drawText(startX, 2, title + ': ' + justice.getCriminals());
    },
    handleInput: function(inputType, inputData) {
        if(inputType == 'keydown' && (inputData.keyCode === ROT.VK_ESCAPE || inputData.keyCode === ROT.VK_RETURN))
            Game.Screen.playScreen.setSubScreen(null);
        else
            return;
    },
    /**
     * @display     The same ROT.Display object passed to the this.render()
     * @startX 
     * @startY 
     * @title       The text to put above the meter
     * @percentage  Amount the gauge should be filled. Percentage should be a decimal (0.54 for 54%)
     * @inverse     If set && true, then the more empty the greener it should be. 
     *              Otherwise, the more full it is, the greener it should be
     **/
    _drawMeter: function(display, startX, startY, title, percentage, inverse) {
        // Draw the title
        display.drawText(startX, startY, title);

        // Draw meter a little beneathe the title
        startY += 2;

        var color;
        if(inverse && inverse === true)
            color = ROT.Color.interpolate(this._green, this._red, percentage);
        else
            color = ROT.Color.interpolate(this._red, this._green, percentage);

        // Draw a meter 10 units tall, and fill the meter if the segment is within the given percentage
        var edge = "|";
        for (var i = 10; i > 0; i--) {
            var meter = "";
            if(Math.floor10(percentage, -1) * 10 >= i) {
                meter = edge + "%c{" + ROT.Color.toHex(color) + "}#%c{}" + edge;
            } else {
                meter = edge + " " + edge;
            }

            // The meter should be centered under the title (and the meter is 3 characters 'long')
            var meterX = startX + (title.length / 2) - 2;
            display.drawText(meterX, startY++, meter);
        }

    }
};

// Spend character points screen
Game.Screen.gainStatScreen = {
    setup: function(entity) {
        // Must be called before rendering.
        this._entity = entity;
        this._options = entity.getPointOptions();
    },
    render: function(display) {
        var letters = 'abcdefghijklmnopqrstuvwxyz';
        display.drawText(0, 0, 'Choose a stat to increase: ');
        display.drawText(4, 2, 'CHAR  COST  VAL');

        // Iterate through each of our options
        for (var i = 0; i < this._options.length; i++) {
            // When displaying and checking costs, strip out 'max' and 'mod' from name
            var charName = this._options[i][0].replace(/^max(\w+)/, "$1").replace(/(\w+)mod$/, "$1");
            var spacer1 = "".lpad(" ", 4 - charName.length + 3);
            var spacer2 = "".lpad(" ", 3 - String(Game.Cost.Characteristics[charName]).length + 2);

            display.drawText(0, 3 + i, letters.substring(i, i + 1) + ' - %c{#585DF5}' + charName + '%c{}' + spacer1 + Game.Cost.Characteristics[charName] + spacer2 + '%c{#585DF5}' + this._entity.getCharacteristic(charName, true, true));
        }

        // Render remaining stat points
        display.drawText(0, 4 + this._options.length, "Remaining points: %c{#00ff78}" + this._entity.getSpendablePoints());
    },
    handleInput: function(inputType, inputData) {
        // TODO: instead of pressing letters, use direction keys to highlight characteristics to increase
        // and spend points on the highlighted stat. Should be able to put points in and see how figured
        // characteristics are affected, and be able to move your spendible points around (without
        // selling back what the character has previously put points into). Up/down to hightlihg, left/right
        // to spend and take back points, enter to accept (making the purchase permanent).
        if(inputType === 'keydown' && inputData.keyCode >= ROT.VK_A && inputData.keyCode <= ROT.VK_Z) {
            // If a letter was pressed, check if it matches to a valid option.
            if(this._entity.getSpendablePoints() > 0) {
                // Check if it maps to a valid item by subtracting 'a' from the character
                // to know what letter of the alphabet we used.
                var index = inputData.keyCode - ROT.VK_A;
                if (this._options[index]) {
                    // When displaying and checking costs, strip out 'max' and 'mod' from name
                    var charName = this._options[index][0].replace(/^max(\w+)/, "$1").replace(/(\w+)mod$/, "$1");
                    // Call the stat increasing function with the name of the stat as an argument
                    this._options[index][1].call(this._entity, this._options[index][0]);
                    // Decrease stat points
                    this._entity.subtractSpendablePoints(Game.Cost.Characteristics[charName]);

                    Game.refresh(this._entity);
                }
            } else {
                Game.sendMessage(this._entity, 'You have no more points to spend.');
                Game.refresh(this._entity);
                this._entity.clearMessages();
            }
        } else if(inputType === 'keydown' && (inputData.keyCode === ROT.VK_RETURN || inputData.keyCode === ROT.VK_ESCAPE)) {
            Game.Screen.playScreen.setSubScreen(undefined);
        }
    }
};

// Define our winning screen
Game.Screen.winScreen = {
    enter: function() {    console.log("Entered win screen."); },
    exit: function() { console.log("Exited win screen."); },
    render: function(display) {
        var w = Game.getScreenWidth();
        var text = "%c{#585DF5}Justice%c{} Prevails!";
        display.drawText((w/2) - (text.length / 2), 2, text);

        text = "You have successfully restored justice to this city. While crime and corruption will always be present, you can rest easy knowing that the people of this city can take care of themselves.";
        display.drawText((w/2) - 40, 4, text, 80);

        text = "Press [%c{#585DF5}Enter%c{}] to keep playing";
        display.drawText((w/2) - (text.length / 2), 8, text);
    },
    handleInput: function(inputType, inputData) {
        if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
			Game.Screen.playScreen.setSubScreen(undefined);
		}   
    }
};

// Define our winning screen
Game.Screen.loseScreen = {
    enter: function() { console.log("Entered lose screen."); },
    exit: function() { console.log("Exited lose screen."); },
    render: function(display) {
        var w = Game.getScreenWidth();
        var text = "%c{#ea003b}You have been killed";
        display.drawText((w/2) - 10, 2, text);

        text = "Press [%c{#585DF5}Enter%c{}] to try again";
        display.drawText((w/2) - 13, 4, text);
    },
    handleInput: function(inputType, inputData) {
        if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
			location.reload();
		}     
    }
};