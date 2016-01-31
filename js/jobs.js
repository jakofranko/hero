Game.Jobs = {};

Game.Jobs.getPriority = function(entity, job) {
	return this[job].priority(entity);
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
		var adjacent = Game.Tasks.approach(entity);
		console.log(adjacent);
		if(adjacent) {
			var success = entity.presenceAttack(entity.getTarget(), 1, "Give me all your money!");
			console.log(success);
		}
	},
	priority: function(entity) {
		console.log("Priority: ", Math.round(200 / entity.getMoney()), "Money: ", entity.getMoney());
		return Math.round(500 / entity.getMoney());
	}
}