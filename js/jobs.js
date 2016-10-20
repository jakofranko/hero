// Jobs should all have two methods: doJob, and priority. doJob is a collection of Game.Tasks 
// that the entity performs intelligently when the value that is returned by priority is 
// a greater integer than any of the other priorities returned by the other jobs the entity has.
// In this case, a higher priority is actually a lower integer, with 0 being the highest priority possible.
//
// Another property of jobs is their 'noise-level.' This is basically the radius within which all entities
// will have various listeners triggered, particularly the 'onCrime' listener.
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

		// If the target is not conscious or out of money, don't target them.
		if(target !== null && target !== false && (!target.isConscious() || !target.isAlive() || target.getMoney() <= 0)) {
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
				target.remember('events', false, 'mugged by ' + entity.describe(), {entity: entity, expires: 50});
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