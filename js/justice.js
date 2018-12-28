// This is the main mechanic for winning the game (and maybe losing).
// The goal is to have a perfect justice meter. This doesn't mean that
// criminals will never spawn, that crime will never be committed or that
// corrupt officials will never get into the system, or that outside forces
// will never appear to make things difficult for your city. But it does
// mean that the city is healthy enough to rise to the occasion.
//
// Principles of the Justice mechanic:
// 1.	The Justice Level can never be directly affected; it is
// 		simply an indicator of the health of the city.
// 2.	The Justice Level is affected by 'second tier' meters, which also
//		cannot be directly affected. Some of these should be kept low,
//		and some should be kept high.
// 3.	These 'second tier' meters are directly affected by 'third tier'
//		levels/meters, and these ARE directly affected by the player.
//		The resolution of these 'third tier' elements will thus be the
//		main gameplay, such as defeating criminals, gaining arrests,
//		shutting down drug labs, and defeating crime bosses.
// 4.	Justice will eventually be a city-level mechanic (as opposed to game-level or map-level) in
//		the eventuality that the character could travel between multiple cities, each
//		with their own justice rating. For now it is map-level though.
Game.Justice = function() {
	this._justice = 0;

	// Second Tier meters
	this._crime = 0;
	this._corruption = 0;

	// Third Tier meters
	this._criminals = 0;
	this._respect_for_law = 0;
    this._good_deeds = 0;
    this._infamy = 0;

	// Initialize justice level based on other starting levels
	this.updateJustice();
};
Game.Justice.prototype.getJustice = function() {
	return this._justice;
};
Game.Justice.prototype.updateJustice = function() {
	// Update second tier meters
	this.updateCrime();
    this.updateCorruption();

	// Justice is a function of the second tier meters (crime and corruption)
	// Neither Crime nor Corruption should be more that 50
	this._justice = Math.ceil(100 - (this._crime / 2) - (this._corruption / 2));

	// If Justice == 100, you win!
	if(this._justice >= 100 && !Game.won())
	{
		Game.Screen.playScreen.setSubScreen(Game.Screen.winScreen);
		Game.win();
	} else if (this._justice <= 50 && !Game.won()) {
        Game.Screen.playScreen.setSubScreen(Game.Screen.loseScreen);
    }
};

// Second Tier methods
Game.Justice.prototype.getCrime = function() {
	return this._crime;
};
Game.Justice.prototype.updateCrime = function() {
	// The Crime level should be a function of the number of criminals times
	// respect for the law, such that when respect for the law is highest, crime
	// is reduced by half. (other things later)
	var crimePercentage = Math.percent(this._criminals, Game.getTotalEntities()),
		rflModifier = (this._respect_for_law / 100) + 1,
		totalCrime = crimePercentage / rflModifier;
	this._crime = totalCrime;
};
Game.Justice.prototype.getCorruption = function() {
    return this._corruption;
};
Game.Justice.prototype.updateCorruption = function () {
    this._corruption = 0 - (this._good_deeds / this._infamy);
};

// Third Tier methods
Game.Justice.prototype.getCriminals = function() {
	return this._criminals;
};
Game.Justice.prototype.addCriminals = function(criminals) {
	this._criminals += criminals;
	this.updateJustice();
};
Game.Justice.prototype.removeCriminals = function(criminals) {
	this._criminals -= criminals;
	this.updateJustice();
};

Game.Justice.prototype.getRespectForLaw = function() {
	return this._respect_for_law;
};
Game.Justice.prototype.addRespectForLaw = function(respect) {
	// Should not be more than 100
	this._respect_for_law += respect;
	if(this._respect_for_law > 100)
		this._respect_for_law = 100;
	this.updateJustice();
};
Game.Justice.prototype.removeRespectForLaw = function(respect) {
	this._respect_for_law -= respect;
	this.updateJustice();
};

Game.Justice.prototype.getGoodDeeds = function() {
	return this._good_deeds;
};
Game.Justice.prototype.addGoodDeeds = function(deeds) {
	// Should not be more than 100
	this._good_deeds += deeds;
	if(this._good_deeds > 100)
		this._good_deeds = 100;
	this.updateJustice();
};
Game.Justice.prototype.removeGoodDeeds  = function(deeds) {
	this._good_deeds -= deeds;
	this.updateJustice();
};

Game.Justice.prototype.addInfamy = function (infamy) {
    this._infamy += infamy;
};
Game.Justice.prototype.removeInfamy = function (infamy) {
    this._infamy -= infamy;
};
Game.Justice.prototype.setInfamy = function (infamy) {
    this._infamy = infamy;
};
Game.Justice.prototype.getInfamy = function () {
    return this._infamy;
};
