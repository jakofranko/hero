Game.HouseRepository = new Game.Repository('houses', Game.House);

Game.HouseRepository.define('medium house', {
	maxStories: 1,
	maxWidth: Game.getLotSize() / 4,
	maxHeight: Game.getLotSize() / 4
});