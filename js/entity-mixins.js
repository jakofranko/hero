// From http://www.codingcookies.com/2013/04/20/building-a-roguelike-in-javascript-part-4/
Game.EntityMixins = {};

Game.EntityMixins.Sight = {
	name: 'Sight',
	groupName: 'Sight',
	init: function(template) {
		this._sightRadius = template['sightRadius'] || 5;
	},
	getSightRadius: function() {
		return this._sightRadius;
	}
}

Game.EntityMixins.Destructible = {
	name: 'Destructible',
	init: function(template) {
		this._maxHp = template['maxHp'] || 10;
		this._hp = template['hp'] || this._maxHp;
		this._defenseValue = template['defenseValue'] || 0;
	},
	getDefenseValue: function() {
		return this._defenseValue;
	},
	getHp: function() {
		return this._hp;
	},
	getMaxHp: function() {
		return this._maxHp;
	},
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		if(this._hp <= 0) {
			Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
        	Game.sendMessage(this, 'You die!');
        	// Check if the player died, and if so call their act method to prompt the user.
            if (this.hasMixin(Game.EntityMixins.PlayerActor)) {
                this.act();
            } else {
                this.getMap().removeEntity(this);
            }
			this.getMap().removeEntity(this);
		}
	}
};

Game.EntityMixins.Attacker = {
    name: 'Attacker',
    groupName: 'Attacker',
    init: function(template) {
    	this._attackValue = template['attackValue'] || 1;
    },
    getAttackValue: function() {
    	return this._attackValue;
    },
    attack: function(target) {
        // Only remove the entity if they were attackable
        if (target.hasMixin('Destructible')) {
        	var attack = this.getAttackValue();
        	var defense = target.getDefenseValue();
        	var max = Math.max(0, attack - defense);
        	var damage = 1 + Math.floor(Math.random() * max);

        	Game.sendMessage(this, 'You strike the %s for %s damage!', [target.getName(), damage]);
            Game.sendMessage(target, 'The %s strikes you for %s damage!', [this.getName(), damage]);
            target.takeDamage(this, damage);
        }
    }
};

Game.EntityMixins.InventoryHolder = {
    name: 'InventoryHolder',
    init: function(template) {
        // Default to 10 inventory slots.
        var inventorySlots = template['inventorySlots'] || 10;
        // Set up an empty inventory.
        this._items = new Array(inventorySlots);
    },
    getItems: function() {
        return this._items;
    },
    getItem: function(i) {
        return this._items[i];
    },
    addItem: function(item) {
        // Try to find a slot, returning true only if we could add the item.
        for (var i = 0; i < this._items.length; i++) {
            if (!this._items[i]) {
                this._items[i] = item;
                return true;
            }
        }
        return false;
    },
    removeItem: function(i) {
        // Simply clear the inventory slot.
        this._items[i] = null;
    },
    canAddItem: function() {
        // Check if we have an empty slot.
        for (var i = 0; i < this._items.length; i++) {
            if (!this._items[i]) {
                return true;
            }
        }
        return false;
    },
    pickupItems: function(indices) {
        // Allows the user to pick up items from the map, where indices is
        // the indices for the array returned by map.getItemsAt
        var mapItems = this._map.getItemsAt(this.getX(), this.getY(), this.getZ());
        var added = 0;
        // Iterate through all indices.
        for (var i = 0; i < indices.length; i++) {
            // Try to add the item. If our inventory is not full, then splice the 
            // item out of the list of items. In order to fetch the right item, we
            // have to offset the number of items already added.
            if (this.addItem(mapItems[indices[i]  - added])) {
                mapItems.splice(indices[i] - added, 1);
                added++;
            } else {
                // Inventory is full
                break;
            }
        }
        // Update the map items
        this._map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
        // Return true only if we added all items
        return added === indices.length;
    },
    dropItem: function(i) {
        // Drops an item to the current map tile
        if (this._items[i]) {
            if (this._map) {
                this._map.addItem(this.getX(), this.getY(), this.getZ(), this._items[i]);
            }
            this.removeItem(i);      
        }
    }
};

Game.EntityMixins.MessageRecipient = {
	name: 'MessageRecipient',
	init: function(template) {
		this._messages = [];
	},
	receiveMessage: function(message) {
		this._messages.push(message);
	},
	getMessages: function() {
		return this._messages;
	},
	clearMessages: function() {
		this._messages = [];
	}
};

Game.sendMessage = function(recipient, message, args) {
	// Make sure the recipient can receive messages
	if(recipient.hasMixin('MessageRecipient')) {
		// If args were passed, format the message
		// Elsewise, don't format the message
		if(args) {
			message = message.format.apply(message, args);
		}
		recipient.receiveMessage(message);
	}
};
Game.sendMessageNearby = function(map, centerX, centerY, centerZ, message, args) {
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
}

Game.EntityMixins.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function() {
		// Detect if the game is over
        if (this.getHp() < 1) {
            Game.Screen.playScreen.setGameEnded(true);
            // Send a last message to the player
            Game.sendMessage(this, 'You have died... Press [Enter] to continue!');
        }
		// Re-render the screen
		Game.refresh();
		// Lock the engine and wait asynchronously
        // for the player to press a key.
        this.getMap().getEngine().lock();
        this.clearMessages();
	}
};

Game.EntityMixins.FungusActor = {
	name: 'FungusActor',
	groupName: 'Actor',
	init: function() {
        this._growthsRemaining = 5;
    },
	act: function() {
		if(this._growthsRemaining > 0) {
			if(Math.random() <= 0.02) {
				// Generate the coordinates of a random adjacent square by
                // generating an offset between [-1, 0, 1] for both the x and
                // y directions. To do this, we generate a number from 0-2 and then
                // subtract 1.
                var xOffset = Math.floor(Math.random() * 3) - 1;
                var yOffset = Math.floor(Math.random() * 3) - 1;
                // Make sure we aren't trying to spawn on the same tile as us
                if (xOffset != 0 || yOffset != 0) {
                    // Check if we can actually spawn at that location, and if so
                    // then we grow!
                    if (this.getMap().isEmptyFloor(this.getX() + xOffset, this.getY() + yOffset, this.getZ())) {
                        var entity = Game.EntityRepository.create('fungus');
                        entity.setPosition(this.getX() + xOffset, this.getY() + yOffset, this.getZ());
                        this.getMap().addEntity(entity);
                        this._growthsRemaining--;

                        // Send a message nearby!
                        Game.sendMessageNearby(this.getMap(), entity.getX(), entity.getY(), entity.getZ(), 'The fungus is spreading!');
                    }
                }
			}
		}
	}
}

Game.EntityMixins.WanderActor = {
	name: 'WanderActor',
	groupName: 'Actor',
	act: function() {
		// Flip coin to determine if moving by 1 in the positive or negative direction
		var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
		// Flip coin to determine if moving in x or y direction
		if(Math.round(Math.random()) === 1) {
			this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
		} else {
			this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
		}
	}
}

Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	maxHp: 40,
	attackValue: 10,
	sightRadius: 6,
	inventorySlots: 22,
	mixins: [
		Game.EntityMixins.Sight, 
		Game.EntityMixins.PlayerActor, 
		Game.EntityMixins.Destructible, 
		Game.EntityMixins.Attacker,
		Game.EntityMixins.InventoryHolder,
		Game.EntityMixins.MessageRecipient
	]
};