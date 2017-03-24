Game.HouseRepository = new Game.Repository('houses', Game.House);

Game.HouseRepository.define('medium house', {
	maxStories: 1,
	maxWidth: Math.floor(Game.getLotSize() / 2) - 2, // Should allow for 4 houses per lot
	maxHeight: Math.floor(Game.getLotSize() / 2) - 2 // Minus 2 to leave room for a 1 tile perimeter
});