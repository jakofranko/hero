Game.Tasks = {};

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
	var player = entity.getMap().getPlayer();

    // If we are adjacent to the player, then attack instead of hunting.
    // TODO: if I'm not mistaken, this enforces a topology 4 and doesn't account for diagnally adjacent
    var offsets = Math.abs(player.getX() - entity.getX()) + Math.abs(player.getY() - entity.getY());
    if (offsets === 1) {
        if (entity.hasMixin('Attacker')) {
            entity.attack(player);
            return;
        }
    }

    // Generate the path and move to the first tile.
    var source = entity;
    var z = source.getZ();
    var path = new ROT.Path.AStar(player.getX(), player.getY(), function(x, y) {
        // If an entity is present at the tile, can't move there.
        var entity = source.getMap().getEntityAt(x, y, z);
        if (entity && entity !== player && entity !== source) {
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