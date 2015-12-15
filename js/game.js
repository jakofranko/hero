var Game = {
	_display: null,
	_overview: null,
	_stats: null,
	_messageLog: null,
	_currentScreen: null,
	_miniMap: null,
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
	getMessageLog: function() {
		return this._messageLog;
	},
	getScreenWidth: function() {
	    return this._screenWidth;
	},
	getScreenHeight: function() {
	    return this._screenHeight;
	},
	init: function() {
		// Add one to height for displaying stats
	    this._display = new ROT.Display({width: this._screenWidth, height: this._screenHeight + 1});
	    this._overview = new ROT.Display({width: this._citySize, height: this._citySize});

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
	refresh: function() {
        // Clear the screen
        this._display.clear();
        // this._overview.clear();
        // Render the screen
        this._currentScreen.render(this._display);
        // this._miniMap.render(this._display);
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
	setMiniMap: function(screen) {
		this.getOverview().clear();
		this._miniMap = screen;
		if(!this._miniMap !== null) {
			this._miniMap.enter(this._citySize);
			this._miniMap.render(this._overview);
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
        // Load the start screen
        Game.switchScreen(Game.Screen.startScreen);

        // Load the minimap
        Game.setMiniMap(Game.Screen.overview);
    }
}