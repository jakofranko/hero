Game.Tasks = {};

Game.Tasks.approach = function(entity, target) {
	// If no one is around, then just wander
	if(!target) {
		this.wander(entity);
	} else if(entity.getPath().length > 0) {
		var step = entity.getNextStep();
		entity.tryMove(step[0], step[1], entity.getZ());
	} else {
		// If we are adjacent to the target, then we have successfully approached it.
	    // TODO: if I'm not mistaken, this enforces a topology 4 and doesn't account for diagnally adjacent
	    var distance = Math.abs(target.getX() - entity.getX()) + Math.abs(target.getY() - entity.getY());
	    if (distance === 1) {
            return true;
	    }

	    // Generate the path and move to the first tile.
	    var source = entity;
	    var z = source.getZ();
	    var path = new ROT.Path.AStar(target.getX(), target.getY(), function(x, y) {
	        // If an entity is present at the tile, can't move there.
	        var entity = source.getMap().getEntityAt(x, y, z);
	        if (entity && entity !== target && entity !== source) {
	            return false;
	        }
	        return source.getMap().getTile(x, y, z).isWalkable();
	    }, {topology: 4});
	    // Once we've gotten the path, we want to store a number of steps equal
	    // to half the distance between the entity and the target, skipping the 
	    // first coordinate because that is the entity's starting location
	    var count = 0;
	    var entityPath = [];
	    path.compute(source.getX(), source.getY(), function(x, y) {
	        if(count > 0 && count <= distance / 2)
	            entityPath.push([x, y]);
	        count++;
	    });

	    // Update the entity's path and make the first step
	    entity.setPath(entityPath);
	    var step = entity.getNextStep();
	    entity.tryMove(step[0], step[1], z);
	}
};

Game.Tasks.wander = function(entity) {
	// Flip coin to determine if moving by 1 in the positive or negative direction
    var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
    // Flip coin to determine if moving in x direction or y direction
    if (Math.round(Math.random()) === 1) {
        entity.tryMove(entity.getX() + moveOffset, entity.getY(), entity.getZ());
    } else {
        entity.tryMove(entity.getX(), entity.getY() + moveOffset, entity.getZ());
    }
};

Game.Tasks.hunt = function(entity) {
	// Check to see if an entity already has a target. If not, pick a new one.
	var target = entity.getTarget();
	if(entity.hasMixin('Targeting') && (target === null || target === false)) {
		// Pick a random entity that they can see
		entity.setTarget(this.findRandomEntityInSight(entity));
	}
	
	// If no one is around, then just wander
	if(!target) {
		this.wander(entity);
	} else {
		// If we are adjacent to the target, then attack instead of hunting.
	    // TODO: if I'm not mistaken, this enforces a topology 4 and doesn't account for diagnally adjacent
	    var offsets = Math.abs(target.getX() - entity.getX()) + Math.abs(target.getY() - entity.getY());
	    if (offsets === 1) {
	        if (entity.hasMixin('Attacker')) {
	            entity.hthAttack(target);
	            return;
	        }
	    }

	    // Generate the path and move to the first tile.
	    var source = entity;
	    var z = source.getZ();
	    var path = new ROT.Path.AStar(target.getX(), target.getY(), function(x, y) {
	        // If an entity is present at the tile, can't move there.
	        var entity = source.getMap().getEntityAt(x, y, z);
	        if (entity && entity !== target && entity !== source) {
	            return false;
	        }
	        return source.getMap().getTile(x, y, z).isWalkable();
	    }, {topology: 4});
	    // Once we've gotten the path, we want to move to the second cell that is
	    // passed in the callback (the first is the entity's starting point)
	    var count = 0;
	    path.compute(source.getX(), source.getY(), function(x, y) {
	        if (count == 1) {
	            source.tryMove(x, y, z);
	        }
	        count++;
	    });
	}
};

Game.Tasks.retreat = function(self, target) {
	var selfPos = {
		x: self.getX(),
		y: self.getY(),
		z: self.getZ()
	};
	var targetPos = {
		x: target.getX(),
		y: target.getY(),
		z: target.getZ()
	};

	// Entity needs to forget their current path
	if(self.getPath().length > 0)
		self.setPath([]);

	// Determine if the target is to the left or right of self
	var x = 0;
	if(selfPos.x - targetPos.x > 0)
		x = 1; // target is to the left, so we want to go right
	else if(selfPos.x - targetPos.x < 0)
		x = -1; // target is to the right, so we want to go left

	// Determine if the target is to the north or south of self
	var y = 0;
	if(selfPos.y - targetPos.y > 0)
		y = 1; // target is above, so we want to go south
	else if(selfPos.y - targetPos.y < 0)
		y = -1; // target is below, so we want to go up

	if(x === 0 && y === 0)
		throw new Error('Two entities are on top of each other...how did that happen???');

	self.tryMove(selfPos.x + x, selfPos.y + y, selfPos.z);
};

Game.Tasks.findRandomEntityInSight = function(self) {
	var entities = self.getMap().getEntitiesWithinRadius(self.getX(), self.getY(), self.getZ(), self.getSightRadius());
	var randomized = entities.randomize();
	var entity = randomized.pop();

	while(entity == self && randomized.length > 0)
		entity = randomized.pop();

	if(entity && entity != self)
		return entity;
	else
		return false;	
};