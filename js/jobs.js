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
		Game.Tasks.hunt(entity);
	},
	priority: function(entity) {
		console.log(Math.round(200 / entity.getMoney()));
		return Math.round(200 / entity.getMoney());
	}
}