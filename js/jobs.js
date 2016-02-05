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
	doJob: function(entity) {
		var target = entity.getTarget();
		// If the target is not conscious or out of money, don't target them.
		if(target != null && target != false && (!target.isConscious() || target.getMoney <= 0)) {
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
				entity.steal(target, Math.round(target.getMoney() / margin))
			} else {
				entity.steal(target, target.getMoney());
			}
		} else {
			entity.steal(target, target.getMoney());
		}
	},
	priority: function(entity) {
		return Math.round(500 / entity.getMoney());
	}
}