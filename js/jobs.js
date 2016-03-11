// Jobs should all have two methods: doJob, and priority. doJob is a collection of Game.Tasks 
// that the entity performs intelligently when the value that is returned by priority is 
// a greater integer than any of the other priorities returned by the other jobs the entity has.
// In this case, a higher priority is actually a lower integer, with 0 being the highest priority possible.
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
	doJob: function(entity) {
		var target = entity.getTarget();
		// If the target is not conscious or out of money, don't target them.
		if(target != null && target != false && (!target.isConscious() || !target.isAlive() || target.getMoney <= 0)) {
			entity.setTarget(null);
			return;	
		}
		
		var adjacent = Game.Tasks.approach(entity);
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
		} else {
			entity.steal(target, target.getMoney());
		}
	},
	priority: function(entity) {
		// the less money an entity has, the higher the priority should be.
		return entity.getMoney() / Game.Jobs.survive.priority();
	}
};