Game.Entity = function(properties) {
	properties = properties || {};
	Game.Glyph.call(this, properties);
	this._name = properties['name'] || '';
	this._x = properties['x'] || 0;
	this._y = properties['y'] || 0;
	this._z = properties['z'] || 0;
	this._map = null;
	this._attachedMixins = {};
	this._attachedMixinGroups = {};
	// Set up the object's mixins
	var mixins = properties['mixins'] || [];
	for (var i = 0; i < mixins.length; i++) {
		// Copy over all properties from each mixin as long
        // as it's not the name or the init property. We
        // also make sure not to override a property that
        // already exists on the entity.
		for(var key in mixins[i]) {
			if(key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
				this[key] = mixins[i][key];
			}
		}

		// Add the name of this mixin to our attached mixins
		this._attachedMixins[mixins[i].name] = true;
		// If a group name exists, add it
		if(mixins[i].groupName) {
			this._attachedMixinGroups[mixins[i].groupName] = true;
		}
		
		// And finally call the init function of the mixin if there is one
		if(mixins[i].init) {
			mixins[i].init.call(this, properties);
		}
	};
};
// Make entities inherit all the functionality from glyphs
Game.Entity.extend(Game.Glyph);

Game.Entity.prototype.setName = function(name) {
    this._name = name;
};
Game.Entity.prototype.setX = function(x) {
    this._x = x;
};
Game.Entity.prototype.setY = function(y) {
    this._y = y;
};
Game.Entity.prototype.setZ = function(z) {
	this._z = z;
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
Game.Entity.prototype.getName = function() {
    return this._name;
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

Game.Entity.prototype.hasMixin = function(obj) {
    // Allow passing the mixin itself or the name as a string
    if (typeof obj === 'object') {
        return this._attachedMixins[obj.name];
    } else {
        return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
    }
};

Game.Entity.prototype.tryMove = function(x, y, z, map) {
	// Must use starting z
	var tile = map.getTile(x, y, this.getZ());
	var target = map.getEntityAt(x, y, this.getZ());
	// If our z level changed, check if we are on stair
	if(z < this.getZ()) {
		if(tile != Game.Tile.stairsUpTile) {
			Game.sendMessage(this, "You can't go up here!");
		} else {
			Game.sendMessage(this, "You ascend to level %s!", [z + 1]);
			this.setPosition(x, y, z);
		}
	} else if(z > this.getZ()) {
		if(tile != Game.Tile.stairsDownTile) {
			Game.sendMessage(this, "You can't go down here!");
		} else {
			Game.sendMessage(this, "You descend to level %s!", [z + 1]);
			this.setPosition(x, y, z);
		}
	} else if(target) {
		if(this.hasMixin('Attacker')) {
			this.attack(target);
			return true;
		} else {
			return false;	
		}
	} else if(tile.isWalkable()) {
		this.setPosition(x, y, z);
		return true;
	} else if(tile.isDiggable()) {
		map.dig(x, y, z);
		return true;
	}
	return false;
}