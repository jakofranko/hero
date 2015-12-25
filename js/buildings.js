Game.BuildingRepository = new Game.Repository('buildings', Game.Building);

Game.BuildingRepository.define('office building', {
	width: 8,
	height: 8,
	stories: 4
});