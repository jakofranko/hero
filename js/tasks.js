Game.Tasks = {};

// Simple "move towards". No need for fancy path finding yet.
Game.Tasks.approach = function(entity, target) {
	if(!target) {
		this.wander(entity);
	} else {
		// Get the diffs between target and entity
		var eX = entity.getX(),
			eY = entity.getY(),
			eZ = entity.getZ(),
			tX = target.getX(),
			tY = target.getY(),
			tZ = target.getZ(),
			diffX = Math.abs(eX - tX),
			diffY = Math.abs(eY - tY),
			diffZ = Math.abs(eZ - tZ),
			adjacent = (diffX < 2 && diffY < 2 && diffX + diffY !== 2 && (diffX === 1 || diffY === 1)), // Can't be diagonally adjacent
			moveX, moveY, moveZ;

		if(adjacent)
			return true;

		// Based on diffs, determine which direction to move toward
		if(diffX < 0)
			moveX = -1;
		else if(diffX > 0)
			moveX = 1;
		else
			moveX = 0;

		if(diffY < 0)
			moveY = -1;
		else if(diffY > 0)
			moveY = 1;
		else
			moveY = 0;

		if(diffZ < 0)
			moveZ = -1;
		else if(diffZ > 0)
			moveZ = 1;
		else
			moveZ = 0;

		// No diagonals
		if(Math.abs(moveX) === 1 && Math.abs(moveY) === 1) {
			moveX = Math.random() < 0.5 ? 0 : moveX;
			moveY = moveX === 0 ? moveY : 0;
		}

		entity.tryMove(eX + moveX, eY + moveY, eZ + moveZ);
	}
};
Game.Tasks.doWork = function(entity) {
	var phrases = ["I'm totally working right now", "This is me, and I'm working", "Can you see me right now? I am so totally working.", "Work it, work it, work it"];
	Game.sendMessageNearby(entity.getMap(), entity.getX(), entity.getY(), entity.getZ(), phrases.random());
};
Game.Tasks.goToWork = function(entity) {
	var entityPath = entity.getPath(),
		jobLocation = entity.getJobLocation();
	if(jobLocation && !entity.isAtJobLocation() && !entityPath.length) {
		var split = jobLocation.split(","),
			destX = split[0],
			destY = split[1],
			destZ = split[2];

		var pathToWork = this.getPath(entity, destX, destY, destZ);

		if(!pathToWork) {
			debugger;
			console.log("Dest:", destX, destY, destZ);
			console.log("Entity:", entity.getX(), entity.getY(), entity.getZ());
			// Game.Screen.playScreen._player.tryMove(destX, destY, destZ);
			// Game.Screen.playScreen._player.tryMove(entity.getX(), entity.getY(), entity.getZ());
		}

		// If there isn't a path to work, go down to the ground floor and try again.
		if(pathToWork)
			entity.setPath(pathToWork);
		else if(entity.getZ() !== 0)
			entity.setPath(this.getPathToLevel(entity, 0));
		else
			this.wander(entity);
	} else if(!entity.isAtJobLocation() && entityPath.length) {
		var nextStep = entity.getNextStep();
		var success = entity.tryMove(nextStep[0], nextStep[1], nextStep[2]);

		// If moving wasn't a success, put the next step back
		if(!success) {
			// TODO: Perhaps recalculate path from new position?
			entity.addNextStep(nextStep);
			this.wander(entity);
		}

	} else {
		console.log(entity.getName() + ": I made it to work!");
	}
};

// TODO: Improve this to support what happens if an entity cannot path someplace when they are on the same z-level
// (I think the solution here would be to have them go to the ground level if they aren't already)
Game.Tasks.getPath = function(entity, destX, destY, destZ, currentPath) {
	var map = entity.getMap(),
		newPath = [],
		destX = Number(destX),
		destY = Number(destY),
		destZ = Number(destZ);
	if(!currentPath)
		currentPath = [];

	// If the z levels are not the same, get a series of paths that
	// lead to the nearest appropriate stair to the destination,
	// find a path from that stair to the destination, and the recurse with
	// the new destination being the tile above or below the up/down stair that
	// was found. The result should be a path from the entity to a series of
	// stairs that are closest to the destination.
	if(destZ < entity.getZ()) { // Entity is above destination
		// Find the nearest up stair to the destiniation (since the destiniation is below)
		var nearestUpStair = map.findNearestUpStair(destX, destY, destZ),
			splitNUS = nearestUpStair.split(","),
			usX = +splitNUS[0],
			usY = +splitNUS[1];

		// Instantiate a path with the target being the destination
		var pathFromUpStair = new ROT.Path.AStar(destX, destY, function(x, y) {
			return map.getTile(x, y, destZ).isWalkable();
		});

		// Add the path from the upstair to the destination
		pathFromUpStair.compute(usX, usY, function(x, y) {
			newPath.push([x, y, destZ]);
		});

		if(newPath.length <= 0)
			return false;

		// Recurse with new path, the new destination being the tile above the upstair
		// which should be the corresponding down stair.
		return Game.Tasks.getPath(entity, usX, usY, destZ + 1, newPath.concat(currentPath));
	} else if(destZ > entity.getZ()) { // entity is below the destination
		var nearestDownStair = map.findNearestDownStair(destX, destY, destZ),
			splitNDS = nearestDownStair.split(","),
			dsX = +splitNDS[0],
			dsY = +splitNDS[1];
		var pathFromDownStair = new ROT.Path.AStar(destX, destY, function(x, y) {
			return map.getTile(x, y, destZ).isWalkable();
		});

		// Add the pathed moves to the existing path, and then try call this function again.
		pathFromDownStair.compute(dsX, dsY, function(x, y) {
			newPath.push([x, y, destZ]);
		});

		if(newPath.length <= 0)
			return false;

		// Recurse with new path, which is a combo of the new path + the old path (in that order),
		// attempting to find a path to tile beneath the downstair, which should be an upstair
		return Game.Tasks.getPath(entity, dsX, dsY, destZ - 1, newPath.concat(currentPath));
	} else {
		var pathToDest = new ROT.Path.AStar(destX, destY, function(x, y) {
			return map.getTile(x, y, destZ).isWalkable();
		});
		pathToDest.compute(entity.getX(), entity.getY(), function(x, y) {
			newPath.push([x, y, destZ]);
		});

		if(newPath.length <= 0)
			return false;
		return newPath.concat(currentPath);
	}
};
Game.Tasks.getPathToLevel = function(entity, level, startX, startY, startZ, currentPath) {
	var map = entity.getMap(),
		newPath = [];
	if(!currentPath)
		currentPath = [];
	if(startX === undefined)
		startX = entity.getX();
	if(startY === undefined)
		startY = entity.getY();
	if(startZ === undefined)
		startZ = entity.getZ();

	// If the z levels are not the same, get a series of paths that
	// lead to the nearest appropriate stair, starting from the destination
	if(level < startZ) { // Entity is above destination
		var nearestDownStair = map.findNearestDownStair(startX, startY, startZ),
			splitNDS = nearestDownStair.split(","),
			dsX = splitNDS[0],
			dsY = split[1],
			dsZ = split[2];
		var pathToDownStair = new ROT.Path.AStar(dsX, dsY, function(x, y) {
			return map.getTile(x, y, destZ).isWalkable();
		});

		// Add the pathed moves to the existing path, and then try call this function again.
		pathToDownStair.compute(startX, startY, function(x, y) {
			if(x !== startX || y !== startY)
				newPath.push([x, y, startZ]);
		});

		// No path was found, so return false
		if(newPath.length <= 0)
			return false;

		// Descend once you've reached the downstair
		newPath.push([dsX, dsY, dsZ - 1]);


		// Recurse with new path, which is a combo of the new path + the old path (in that order),
		// attempting to find a path to the next down stair starting from the tile beneath the downstair.
		return Game.Tasks.getPathToLevel(entity, level, dsX, dsY, dsZ - 1, newPath.concat(currentPath));
	} else if(level > startZ) { // entity is below the desired z-level
		var nearestUpStair = map.findNearestUpStair(startX, startY, startZ),
			splitNUS = nearestUpStair.split(","),
			usX = splitNUS[0],
			usY = split[1],
			usZ = split[2];
		var pathToUpStair = new ROT.Path.AStar(usX, usY, function(x, y) {
			return map.getTile(x, y, startZ).isWalkable();
		});

		// Add the path from the upstair to the destination
		pathToUpStair.compute(startX, startY, function(x, y) {
			if(x !== startX || y !== startY)
				newPath.push([x, y, startZ]);
		});

		// No path was found, so return false
		if(newPath.length <= 0)
			return false;

		// Attempt to go up the upStair
		newPath.push([x, y, startZ + 1]);

		// Recurse with new path, the new destination being the tile above the upstair
		// which should be the corresponding down stair.
		return Game.Tasks.getPathToLevel(entity, level, usX, usY, usZ + 1, newPath.concat(currentPath));
	} else {
		return currentPath;
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