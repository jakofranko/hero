Game.Entity = function(properties) {
	properties = properties || {};
	Game.DynamicGlyph.call(this, properties);
	this._name = properties['name'] || '';
    this._type = properties['type'] || '';
    this._description = properties['description'] || this._name;
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
    this._x = Number(x);
};
Game.Entity.prototype.setY = function(y) {
    this._y = Number(y);
};
Game.Entity.prototype.setZ = function(z) {
	this._z = Number(z);
};
Game.Entity.prototype.setSpeed = function(speed) {
    this._speed = speed;
};
Game.Entity.prototype.setPosition = function(x, y, z) {
	var oldX = this._x;
	var oldY = this._y;
	var oldZ = this._z;
	// Update position
	this.setX(x);
	this.setY(y);
	this.setZ(z);

	// If the entity is on a map, notify the map that the entity has moved
	if(this._map) {
		this._map.updateEntityPosition(this, oldX, oldY, oldZ);
	}
};
Game.Entity.prototype.swapPosition = function(target) {
    var tx = target.getX(),
        ty = target.getY(),
        tz = target.getZ(),
        ex = this.getX(),
        ey = this.getY(),
        ez = this.getZ(),
        tempPos = this.getMap().getRandomFloorPosition(tz);

    // Move target temporarily
    target.setPosition(tempPos.x, tempPos.y, tempPos.z);

    // Move the entity to the target's old pos
    this.setPosition(tx, ty, tz);

    // Move the target to the entity's pos
    target.setPosition(ex, ey, ez);
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
Game.Entity.prototype.getType = function() {
    return this._type;
};
Game.Entity.prototype.tryMove = function(x, y, z, map) {
    var tile, target, canMoveResults,canAttackResults, canMove, canAttack, items;

    function isTrue(result) {
        return result;
    }

	if(!map)
		map = this.getMap();

	tile = map.getTile(x, y, z);
	target = map.getEntityAt(x, y, z);

    // Target shouldn't be itself
    if(target === this)
        target = false;

    canMoveResults = this.raiseEvent('canMove', { x: x, y: y, z: z, tile: tile });
    canMove = canMoveResults.length && canMoveResults.some(isTrue);
    canAttackResults = this.raiseEvent('canAttack', target);
    canAttack = this.hasMixin('Attacker') && target && target.hasMixin('Characteristics') && canAttackResults.length && canAttackResults.some(isTrue);

	if(canAttack) {
        if(this.hasMixin('PowerUser') && this.getPrimaryMelee())
            this.usePower(target, this.getPrimaryMelee());
        else
            this.hthAttack(target);

        return true;
    } else if(target) {
        // There is a target at x,y,z, but the entity can't attack, so swap positions with them
        this.swapPosition(target);
        return true;
    } else if(canMove) {
        items = this.getMap().getItemsAt(x, y, z);
        this.setPosition(x, y, z);
        if (items) {
            if (items.length === 1)
                Game.sendMessage(this, "You see %s.", [items[0].describeA()]);
            else
                Game.sendMessage(this, "There are several objects here.");
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
Game.Entity.prototype.getDescription = function() {
    return this._description;
};
