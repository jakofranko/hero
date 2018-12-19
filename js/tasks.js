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
            moveX = ROT.RNG.getUniform() < 0.5 ? 0 : moveX;
            moveY = moveX === 0 ? moveY : 0;
        }

        entity.tryMove(eX + moveX, eY + moveY, eZ + moveZ);
    }
};
Game.Tasks.doWork = function(entity) {
    var phrases = ["I'm totally working right now", "This is me, and I'm working", "Can you see me right now? I am so totally working.", "Work it, work it, work it"];
    Game.sendMessageNearby(entity.getMap(), entity.getX(), entity.getY(), entity.getZ(), phrases.random());
};
Game.Tasks.goToJobLocation = function(entity) {
    var entityPath = entity.getPath(),
        jobLocation = entity.getJobLocation();

    if(jobLocation && !entity.isAtJobLocation() && !entityPath.length && !entity.isPathing) {
        entity._isPathing = true;
        entity.getMap().getBatchProcessor().add(function() {
            // Since calculating a path can takea long time, make it asynchronous
            var entityZ = entity.getZ()
            var pathToJob;
            var split = jobLocation.split(","),
                destX = Number(split[0]),
                destY = Number(split[1]),
                destZ = Number(split[2]);

            // If the entity is not on z level 0 and their
            // destiniation is on a different z level than themselves,
            // the chances of there being a direct path to their location
            // are slim, so just go to the bottom floor and calculate
            // the path from there.
            if (entityZ !== 0 || entityZ !== destZ)
                pathToJob = this.getPathToLevel(entity, 0);
            else
                pathToJob = this.getPath(entity, destX, destY, destZ);

            // If there isn't a path to work, go down to the ground floor and try again.
            if(pathToJob)
                entity.setPath(pathToJob);
            else {
                this.wander(entity);

                // debugger;
                console.log(entity.getName());
                console.log("Dest:", destX, destY, destZ);
                console.log("Entity:", entity.getX(), entity.getY(), entity.getZ());
                // var debugPath = this.getPath(entity, destX, destY, destZ);
                // Game.Screen.playScreen._player.tryMove(destX, destY, destZ);
                // Game.Screen.playScreen._player.tryMove(entity.getX() + 1, entity.getY() + 1, entity.getZ());
            }

            entity._isPathing = false;
        }.bind(this));
    } else if(!entity.isAtJobLocation() && entityPath.length) {
        // TODO: [EVENTS] Implement the new follow path method either here, or at the job level
        var nextStep = entity.getNextStep();
        var success = entity.tryMove(nextStep[0], nextStep[1], nextStep[2]);

        // If moving wasn't a success, put the next step back
        if(!success) {
            // TODO: Perhaps recalculate path from new position?
            entity.addNextStep(nextStep);
            this.wander(entity);
        }

    }
};

// TODO: Improve this to support what happens if an entity cannot path someplace when they are on the same z-level
// (I think the solution here would be to have them go to the ground level if they aren't already)
Game.Tasks.getPath = function(entity, dx, dy, dz, currentPath) {
    var map = entity.getMap(),
        newPath = [],
        destX = Number(dx),
        destY = Number(dy),
        destZ = Number(dz);
    if(!currentPath)
        currentPath = [];

    // If the z levels are not the same, get a series of paths that
    // lead to the nearest appropriate stair to the destination,
    // find a path from that stair to the destination, and then recurse with
    // the new destination being the tile above or below the up/down stair that
    // was found. The result should be a path from the entity to a series of
    // stairs that are closest to the destination. Since this is reversing
    // the pathing process, (path from destination to entity), return reversed path.
    if(destZ < entity.getZ()) { // Entity is above destination
        // Find the nearest up stair to the destination (since the destination is below)
        newPath = map.getPathToNearestStair(destX, destY, destZ, 'up');

        if(newPath.length <= 0)
            return false;

        var us = newPath[newPath.length - 1];

        // Recurse with new path, the new destination being the tile above the upstair
        // which should be the corresponding down stair.
        return Game.Tasks.getPath(entity, us[0], us[1], destZ + 1, currentPath.concat(newPath));
    } else if(destZ > entity.getZ()) { // entity is below the destination
        newPath = map.getPathToNearestStair(destX, destY, destZ, 'down');

        if(newPath.length <= 0)
            return false;

        var ds = newPath[newPath.length - 1];
        // Recurse with new path, which is a combo of the new path + the old path (in that order),
        // attempting to find a path to tile beneath the downstair, which should be an upstair
        return Game.Tasks.getPath(entity, ds[0], ds[1], destZ - 1, currentPath.concat(newPath));
    } else {
        var pathToDest = new ROT.Path.AStar(entity.getX(), entity.getY(), function(x, y) {
            var tile = map.getTile(x, y, destZ);
            return tile.isWalkable() || tile.getName().includes("door");
        });
        pathToDest.compute(destX, destY, function(x, y) {
            newPath.push([x, y, destZ]);
        });

        if(newPath.length <= 0)
            return false;
        return currentPath.concat(newPath).reverse(); // entity should be final step, so return reversed
    }
};

// This is different from getPath in that this is merely trying to a specified Z-level,
// and doesn't care about a destination. Thus, it's able to find a path to a Z-level
// just from knowing the start coords. getPath tries to get to a destination, which
// may or may not be on a different Z-level. Similar methods, different goals.
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
        newPath = map.getPathToNearestStair(startX, startY, startZ, 'down');

        // No path was found, so return false
        if(newPath.length <= 0)
            return false;

        var ds = newPath[newPath.length - 1];
        if(!ds[0])
            debugger;
        // Recurse with new path, which is a combo of the new path + the old path (in that order),
        // attempting to find a path to the next down stair starting from the tile beneath the downstair.
        return Game.Tasks.getPathToLevel(entity, level, ds[0], ds[1], startZ - 1, currentPath.concat(newPath));
    } else if(level > startZ) { // entity is below the desired z-level
        newPath = map.getPathToNearestStair(startX, startY, startZ, 'up');

        // No path was found, so return false
        if(newPath && newPath.length <= 0)
            return false;

        var us = newPath[newPath.length - 1];

        // Recurse with new path, the new destination being the tile
        // above the upstair which should be the corresponding down stair.
        return Game.Tasks.getPathToLevel(entity, level, us[0], us[1], startZ + 1, currentPath.concat(newPath));
    } else {
        newPath = [[startX, startY, startZ]];
        return currentPath.concat(newPath);
    }
};

// endAction should be structured like the MenuScreen items should be: an array of arrays,
// with each array having three values: a function to call, an array of params for that function, and the 'this' context
Game.Tasks.followPath = function(entity, endActions) {
    var nextStep = entity.getNextStep(),
        remainingPath = entity.getPath(),
        success = false;

    if(nextStep)
        success = entity.tryMove(nextStep[0], nextStep[1], nextStep[2]);

    // If moving wasn't a success, put the next step back
    // TODO: Perhaps recalculate path from new position?
    if(!success && nextStep)
        entity.addNextStep(nextStep);
    else if(!success)
        this.wander(entity);

    // If at the end of the path, if there is an array of endActions, perform them
    if(remainingPath.length < 1 && endActions && endActions.length) {
        for (var i = 0; i < endActions.length; i++) {
            var func = endActions[i][0],
                args = endActions[i][1],
                context = endActions[i][2] || this;
            func.apply(context, args);
        }
    }
};
Game.Tasks.wander = function(entity) {
    // Flip coin to determine if moving by 1 in the positive or negative direction
    var moveOffset = (Math.round(ROT.RNG.getUniform()) === 1) ? 1 : -1;
    // Flip coin to determine if moving in x direction or y direction
    if (Math.round(ROT.RNG.getUniform()) === 1) {
        entity.tryMove(Number(entity.getX()) + moveOffset, entity.getY(), entity.getZ());
    } else {
        entity.tryMove(entity.getX(), Number(entity.getY()) + moveOffset, entity.getZ());
    }
};

Game.Tasks.hunt = function(entity, endActions) {
    if(!entity.hasMixin('Targeting'))
        throw new Error(`The '${entity.getType()}' entity needs to have the Targeting mixin assigned to do the hunt job`);

    // Check to see if an entity already has a target. If not, pick a new one.
    var target = entity.getTarget();
    if(target === null || target === false) {
        // Pick a random entity that they can see
        entity.setTarget(this.findRandomEntityInSight(entity));
    }

    var path = entity.getPath();

    // If no one is around, then just wander
    if(!target) {
        this.wander(entity);
    } else if (path && path.length) {
        this.followPath(entity, endActions);
    } else if (!path || !path.length) {
        entity.setPath(this.getPath(entity, target.getX(), target.getY(), target.getZ()));
        this.followPath(entity, endActions);
    } else {
        this.wander(entity);
    }
};

Game.Tasks.huntEntitiesInSight = function(entity, types) {
    var entitiesInSight = entity.getEntitiesInSight(types);
    if(entitiesInSight.length) {
        entity.setTarget(entitiesInSight.random());
        this.hunt(entity);
    } else {
        this.wander(entity);
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

Game.Tasks.findRivalGangMember = function(self, gangName) {
    var entities = self.getMap().getEntities();
    var coords = Object.keys(entities);
    var target;
    if (gangName) {
        coords.some(function(coord) {
            var entity = entities[coord];
            if (entity._gangName && entity._gangName !== self._gangName && entity._gangName === gangName) {
                target = entity;
                return true;
            } else {
                return false;
            }
        }, this);
    } else {
        coords.some(function(coord) {
            var entity = entities[coord];
            if (entity._gangName && entity._gangName !== self._gangName) {
                target = entity;
                return true;
            } else {
                return false;
            }
        }, this);
    }

    return target;
}
Game.Tasks.attemptAttackPower = function(self, target) {
    var powers = self.getPowers();
    var inRange = true;
    powers.forEach(function(power) {
        if (power.type === "Attack") {
            if (power.inRange(self.getX(), self.getY(), target.getX(), target.getY())) {
                self.usePower([target], power);
                self.setPath(); // clear existing path
            } else {
                inRange = false;
            }
        }
    }, this);

    if (!inRange) {
        this.hunt(self);
    }
}

Game.Tasks.attemptMelee = function(self, target) {
    var adjacent;
    if (self.canSee(target))
        adjacent = this.approach(self, target);
    else
        this.hunt(self); // Will track target

    if (adjacent) {
        self.hthAttack(target);
        var witnesses = self.getMap().getEntitiesWithinRadius(self.getX(), self.getY(), self.getZ(), this.noise);
        for (var i = 0; i < witnesses.length; i++) {
            witnesses[i].raiseEvent('onCrime', self);
        }

        self.setPath(); // clear any existing path
    }
}
