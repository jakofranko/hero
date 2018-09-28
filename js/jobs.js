// Jobs should all have two methods: doJob, and priority. doJob is a collection of Game.Tasks
// that the entity performs intelligently when the value that is returned by priority is
// a greater integer than any of the other priorities returned by the other jobs the entity has.
// In this case, a higher priority is actually a lower integer, with 0 being the highest priority possible.
//
// Another property of jobs is their 'noise-level.' This is basically the radius within which all entities
// will have various listeners triggered, particularly the 'onCrime' listener.
// TODO: [EVENTS] Create job for robbers
Game.Jobs = {};

Game.Jobs.getPriority = function(entity, job) {
    return this[job].priority(entity);
};

Game.Jobs.listJobs = function() {
    console.log(Object.keys(this));
};

Game.Jobs.survive = {
    doJob: function(entity) {
        // For now, just wander
         Game.Tasks.wander(entity);
    },
    priority: function(entity) {
        return 10;
    }
};

Game.Jobs.work = {
    doJob: function(entity) {
        if(!entity.isAtJobLocation())
            Game.Tasks.goToJobLocation(entity);
        else
            Game.Tasks.doWork(entity);
    },
    priority: function(entity) {
        var total = 10;
        var hour = entity.getMap().getTime().getHours();
        if(hour >= 8 && hour < 17)
            total -= 5;
        if(!entity.recall('places', 'work').location)
            total += 100;
        return total;
    }
};

Game.Jobs.home = {
    doJob: function(entity) {
        if(!entity.isAtJobLocation())
            Game.Tasks.goToJobLocation(entity);
        else
            Game.Tasks.wander(entity);
    },
    priority: function(entity) {
        var total = 10;
        var hour = entity.getMap().getTime().getHours();
        if(hour >= 17)
            total -= 5;
        return total;
    }
};

Game.Jobs.robber = {
    crime: true,
    noise: 20,
    doJob: function(entity) {
        if(!entity.hasMixin('Targeting'))
            throw new Error(`The '${entity.getType()}' entity must have the Targeting mixin in order to perform the robber job`);

        // If they have completed a robbery, escape home, or fight the nearest enemy
        if(entity.isJobComplete('robber')) {
            entity.setCurrentJob('home');
        } else {
            var entityPath = entity.getPath(),
                target = entity.getTarget(),
                location;

            // If the entity already has a path, follow it
            if(entityPath && entityPath.length)
                return Game.Tasks.followPath(entity);

            // If the entity has a target and at the end of the path, then attempt to get the items out of the target
            if(target && entityPath && entityPath.length === 0) {
                var numItems = target.getItems().length;
                for(var i = 0; i < numItems; i++)
                    target.removeItem(entity, i);

                // Robbery complete, now reprioritize so that an escape can be made
                entity.setJobComplete('robber', true);
                entity.reprioritizeJobs();

                // Trigger the onCrime event for witnesses
                var witnesses = entity.getMap().getEntitiesWithinRadius(entity.getX(), entity.getY(), entity.getZ(), this.noise);
                for(var i = 0; i < witnesses.length; i++)
                    witnesses[i].raiseEvent('onCrime', entity);

                return true;
            } else if(target) {
                // If the entity already has a target, then set the path and follow it
                if(target instanceof Game.Item)
                    location = target.getLocation().split(",");
                else if(target instanceof Game.Entity)
                    location = [target.getX(), target.getY(), target.getZ()];

                entity.setPath(Game.Tasks.getPath(entity, location[0], location[1], location[2]));
                return Game.Tasks.followPath(entity);
            }

            // Otherwise, find a target, and path to it
            // Locate nearest 'robbable' object
            var map = entity.getMap(),
                item = map.getItemsInRadius(entity.getX(), entity.getY(), entity.getZ(), entity.getSightRadius(), ['vault door', 'cash register', 'safe']).random();

            if(item) {
                entity.setTarget(item);
                location = item.getLocation().split(",");
                entity.setPath(Game.Tasks.getPath(entity, location[0], location[1], location[2]));
                return Game.Tasks.followPath(entity);
            } else {
                Game.Tasks.huntEntitiesInSight(entity, ['Player', 'police']);
            }
        }
    },
    priority: function(entity) {
        // If the entity has completed a robbery, then heavily de-prioritize this job for them, but reset the completion
        // so that they will potentially rob the next time it's time to re-prioritize
        var priority = 0;
        var crime = entity.getMap().getJustice().getCrime();
        if(entity.isJobComplete('robber')) {
            priority += 100;
            entity.setJobComplete('robber', false);
        } else {
            priority += 10;
            priority -= Math.round(crime / 10);
            priority = Math.max(0, priority); // Make sure it's not less than 0
        }
        return priority;
    }
};

Game.Jobs.mugger = {
    crime: true,
    noise: 15,
    doJob: function(entity) {
        if(!entity.hasMixin('Targeting'))
            return;

        var target = entity.getTarget();
        if(target === false || target === null) {
            // Pick a random entity that they can see and that they haven't already mugged
            target = Game.Tasks.findRandomEntityInSight(entity);
            if(target && entity.hasMixin('MemoryMaker') && entity.recall('people', 'victims', target.getName())) {
                target = entity.setTarget(null);
            } else {
                entity.setTarget(target);
            }
        }

        // If the target is not conscious, visible, or is out of money, don't target them.
        if(target !== null && target !== false && (!target.isConscious() || !target.isAlive() || (target.hasMixin('MoneyHolder') && target.getMoney() <= 0) || !entity.canSee(target))) {
            target = entity.setTarget(null);
        }

        var adjacent = Game.Tasks.approach(entity, target);
        if(adjacent) {
            var success = entity.presenceAttack(target, 2, "Give me all your money!");
            if(success >= 10) {
                this._attemptTheft(entity, target);
            } else {
                var hit = entity.hthAttack(target);
                if(!target.isConscious()) {
                    this._attemptTheft(entity, target);
                }
            }

            if(!entity || !entity.getX)
                debugger;

            var witnesses = entity.getMap().getEntitiesWithinRadius(entity.getX(), entity.getY(), entity.getZ(), this.noise);
            for (var i = 0; i < witnesses.length; i++) {
                witnesses[i].raiseEvent('onCrime', entity);
            }
        }
    },
    _attemptTheft: function(entity, target) {
        if(target.isConscious()) {
            // The target can make an EGO roll to determine how much money they give
            var margin = target.charRoll("EGO");
            if(margin !== false && margin !== 0) {
                entity.steal(target, Math.round(target.getMoney() / margin));
            } else {
                entity.steal(target, target.getMoney());
            }

            if(target.hasMixin('MemoryMaker')) {
                target.remember('events', false, 'mugged by ' + entity.getName(), {entity: entity, expires: 50});
            }
        } else {
            entity.steal(target, target.getMoney());
        }
    },
    priority: function(entity) {
        // the less money an entity has, the higher the priority should be.
        return entity.getMoney() / Game.Jobs.survive.priority();
    }
};
