Game.Entity = function(properties) {
	properties = properties || {};
	Game.DynamicGlyph.call(this, properties);
	this._name = properties['name'] || '';
    this._type = properties['type'] || '';
    this._description = properties['description'] || '';
    this._shortDescription = properties['shortDescription'] || '';
	this._alive = true;
    this._conscious = true;
	this._x = properties['x'] || 0;
	this._y = properties['y'] || 0;
	this._z = properties['z'] || 0;
	this._map = null;
};
// Make entities inherit all the functionality from glyphs
Game.Entity.extend(Game.DynamicGlyph);

Game.Entity.prototype.setX = function(x) {
    this._x = x;
};
Game.Entity.prototype.setY = function(y) {
    this._y = y;
};
Game.Entity.prototype.setZ = function(z) {
	this._z = z;
};
Game.Entity.prototype.setSpeed = function(speed) {
    this._speed = speed;
};
Game.Entity.prototype.setPosition = function(x, y, z) {
	var oldX = this._x;
	var oldY = this._y;
	var oldZ = this._z;
	// Update position
	this._x = x;
	this._y = y;
	this._z = z;

	// If the entity is on a map, notify the map that the entity has moved
	if(this._map) {
		this._map.updateEntityPosition(this, oldX, oldY, oldZ);
	}
};
Game.Entity.prototype.getSpeed = function() {
    if(this.hasMixin('Characteristics')) {
        // SPD is always rounded down
        return Math.floor(this.getSPD() + this.getSPDmod());
    } else {
        return 1;
    }
    
};
Game.Entity.prototype.getX = function() {
    return this._x;
};
Game.Entity.prototype.getY   = function() {
    return this._y;
};
Game.Entity.prototype.getZ = function() {
	return this._z;
};
Game.Entity.prototype.setMap = function(map) {
    this._map = map;
};
Game.Entity.prototype.getMap = function() {
    return this._map;
};
Game.Entity.prototype.getName = function() {
    return this._name;
};
Game.Entity.prototype.tryMove = function(x, y, z, map) {
	if(!map) {
		var map = this.getMap();
	}
	// Must use starting z
	var tile = map.getTile(x, y, this.getZ());
	var target = map.getEntityAt(x, y, this.getZ());
    
	// If our z level changed, check if we are on stair
	if(z > this.getZ()) {
		if(tile.describe() != 'stairsUp') {
			Game.sendMessage(this, "You can't go up here!");
		} else {
			Game.sendMessage(this, "You ascend to level %s!", [z + 1]);
			this.setPosition(x, y, z);
		}
	} else if(z < this.getZ()) {
		if (tile.describe() != 'stairsDown') {
            Game.sendMessage(this, "You can't go down here!");
        } else {
            this.setPosition(x, y, z);
            Game.sendMessage(this, "You descend to level %s!", [z + 1]);
        }
	} else if(target) {
		// An entity can only attack if the entity has the Attacker mixin and 
        // either the entity or the target is the player.
        if (this.hasMixin('Characteristics') &&
        	(this.hasMixin(Game.EntityMixins.PlayerActor) || target.hasMixin(Game.EntityMixins.PlayerActor))) {
            this.hthAttack(target);
            return true;
        } 

        // If not nothing we can do, but we can't move to the tile
        return false;
	} else if(tile.isWalkable()) {
		this.setPosition(x, y, z);
		// Notify the entity that there are items at this position
        var items = this.getMap().getItemsAt(x, y, z);
        if (items) {
            if (items.length === 1) {
                Game.sendMessage(this, "You see %s.", [items[0].describeA()]);
            } else {
                Game.sendMessage(this, "There are several objects here.");
            }
        }
		return true;
	} 
	return false;
};
Game.Entity.prototype.isAlive = function() {
    return this._alive;
};
Game.Entity.prototype.isConscious = function() {
    return this._conscious;
};
Game.Entity.prototype.kill = function(message) {
    // Only kill once!
    if (!this._alive) {
        return;
    }
    this._alive = false;
    if (message) {
        Game.sendMessage(this, message);
    } else {
        Game.sendMessage(this, "You have died!");
    }

    // Check if the player died, and if so call their act method to prompt the user.
    if (this.hasMixin(Game.EntityMixins.PlayerActor)) {
        this.act();
    } else {
        this.getMap().removeEntity(this);
    }
};
Game.Entity.prototype.ko = function(message) {
    // Only KO once
    if(!this._conscious) {
        return;
    }
    this._conscious = false;
    if (message) {
        Game.sendMessage(this, message);
    } else {
        Game.sendMessage(this, "You have been knocked unconscious!");
    }
};
Game.Entity.prototype.regainConsciousness = function(message) {
    // Only wake once
    if(this._conscious) {
        return;
    }
    this._conscious = true;
    if (message) {
        Game.sendMessage(this, message);
    } else {
        Game.sendMessage(this, "You have regained consciousness");
    }
};
Game.Entity.prototype.switchMap = function(newMap) {
    // If it's the same map, nothing to do!
    if (newMap === this.getMap()) {
        return;
    }
    this.getMap().removeEntity(this);
    // Clear the position
    this._x = 0;
    this._y = 0;
    this._z = 0;
    // Add to the new map
    newMap.addEntity(this);
};
Game.Entity.prototype.describeA = function(capitalize) {
    // Optional parameter to capitalize the a/an.
    var prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
    var string = this._type;
    var firstLetter = string.charAt(0).toLowerCase();
    // If word starts by a vowel, use an, else use a. Note that this is not perfect.
    var prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;

    return prefixes[prefix] + ' ' + string;
};
Game.Entity.prototype.describeThe = function(capitalize) {
    var prefix = capitalize ? 'The' : 'the';
    if(this._shortDescription) {
        return prefix + ' ' + this._shortDescription;
    } else {
        return prefix + ' ' + this._type;
    }
};
Game.Entity.prototype.describe = function() {
    return this._description;
};