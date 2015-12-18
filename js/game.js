var Game = {
	_player: null,

	// ROT.Displays
	_display: null,
	_overview: null,
	_log: null,
	_stats: null,

	// Screens
	_currentScreen: null,
	_miniMap: null,
	_messages: null,

	_screenWidth: 80,
	_screenHeight: 24,
	_citySize: 10,

	getDisplay: function() {
		return this._display;
	},
	getOverview: function() {
		return this._overview;
	},
	getStats: function() {
		return this._stats;
	},
	getLog: function() {
		return this._log;
	},
	getScreenWidth: function() {
	    return this._screenWidth;
	},
	getScreenHeight: function() {
	    return this._screenHeight;
	},
	getCitySize: function() {
		return this._citySize;
	},
	init: function() {
		// Create player entity
		this._player = new Game.Entity(Game.PlayerTemplate);

		// Add one to height for displaying stats
	    this._display = new ROT.Display({width: this._screenWidth, height: this._screenHeight + 1});
	    this._overview = new ROT.Display({width: this._citySize, height: this._citySize});
	    this._log = new ROT.Display({width: 30, height: 20});

	    // Create a helper function for binding to an event
	    // and making it send it to the screen
	    var game = this; // So that we don't lose this
	    var bindEventToScreen = function(event) {
	        window.addEventListener(event, function(e) {
	            // When an event is received, send it to the
	            // screen if there is one
	            if (game._currentScreen !== null) {
	                // Send the event type and data to the screen
	                game._currentScreen.handleInput(event, e);
	            }
	        });
	    };
	    // Bind keyboard input events
	    bindEventToScreen('keydown');
	    // bindEventToScreen('keyup');
	    bindEventToScreen('keypress');
	},
	refresh: function(player) {
        // Clear the screen
        this._display.clear();
        // this._overview.clear();
        // Render the screen
        this._currentScreen.render(this._display);
        if(this._miniMap !== null) {
        	this._miniMap.render(this._overview);	
        }

        this.displayMessages(player);
    },
    sendMessage: function(recipient, message, args) {
		// Make sure the recipient can receive messages
		if(recipient.hasMixin('MessageRecipient')) {
			// If args were passed, format the message
			// Elsewise, don't format the message
			if(args) {
				message = message.format.apply(message, args);
			}
			recipient.receiveMessage(message);
		}
	},
	sendMessageNearby: function(map, centerX, centerY, centerZ, message, args) {
	    // If args were passed, then we format the message, else
	    // no formatting is necessary
	    if(args) {
	        message = message.format.apply(this, args);
	    }
	    // Get the nearby entities
	    entities = map.getEntitiesWithinRadius(centerX, centerY, centerZ, 5);
	    // Iterate through nearby entities, sending the message if
	    // they can receive it.
	    for(var i = 0; i < entities.length; i++) {
	        if(entities[i].hasMixin(Game.EntityMixins.MessageRecipient)) {
	            entities[i].receiveMessage(message);
	        }
	    }
	},
	displayMessages: function(entity) {
		if(entity && entity.hasMixin('MessageRecipient')) {
			// Get the messages in the player's queue and render them
	        var messages = entity.getMessages();
	        var messageY = 0;
	        for (var i = 0; i < messages.length; i++) {
	            // Draw each message, adding the number of lines
	            messageY += this._log.drawText(
	                0, 
	                messageY,
	                '%c{white}%b{black}' + messages[i]
	            );
	        }
		}
	},
	switchScreen: function(screen) {
	    // If we had a screen before, notify it that we exited
	    if (this._currentScreen !== null) {
	        this._currentScreen.exit();
	    }
	    // Clear the display
	    this.getDisplay().clear();
	    // Update our current screen, notify it we entered
	    // and then render it
	    this._currentScreen = screen;
	    if (!this._currentScreen !== null) {
	        this._currentScreen.enter();
	        this.refresh();
	    }
	},
	setMiniMap: function(screen, player) {
		this.getOverview().clear();
		this._miniMap = screen;
		if(!this._miniMap !== null) {
			this._miniMap.enter(player);
		}
	}
};

window.onload = function() {
    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
        alert("The rot.js library isn't supported by your browser.");
    } else {
        // Initialize the game
        Game.init();
        // Add the container to our HTML page
        document.getElementById('level').appendChild(Game.getDisplay().getContainer());
        document.getElementById('overview').appendChild(Game.getOverview().getContainer());
        document.getElementById('log').appendChild(Game.getLog().getContainer());
        // Load the start screen
        Game.switchScreen(Game.Screen.startScreen);
    }
}