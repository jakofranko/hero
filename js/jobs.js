Game.Jobs = {};

Game.Jobs.getPriority = function(entity, job) {
	return this[job].priority(entity);
};

Game.Jobs.survive = {
	doJob: function(entity) {
		// For now, just wander
	 	// Flip coin to determine if moving by 1 in the positive or negative direction
        var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
        // Flip coin to determine if moving in x direction or y direction
        if (Math.round(Math.random()) === 1) {
            entity.tryMove(entity.getX() + moveOffset, entity.getY(), entity.getZ());
        } else {
            entity.tryMove(entity.getX(), entity.getY() + moveOffset, entity.getZ());
        }
	},
	priority: function(entity) {
		return 10;
	}
};