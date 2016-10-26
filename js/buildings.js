Game.BuildingRepository = new Game.Repository('buildings', Game.Building);

Game.BuildingRepository.define('office building', {
	width: Game.getLotSize() / 2,
	height: Game.getLotSize() / 2,
	stories: 4,
	roomNumber: 6
});