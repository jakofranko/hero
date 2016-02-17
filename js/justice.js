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
	this._criminals = 10;

	// Initialize justice level based on other starting levels
	this.updateJustice();
};
Game.Justice.prototype.getJustice = function() {
	return this._justice;
};
Game.Justice.prototype.updateJustice = function() {
	// Update second tier meters
	this.updateCrime();

	// Justice is a function of the second tier meters (crime and corruption)
	this._justice = 100 - this._crime - this._corruption;
};

// Second Tier methods
Game.Justice.prototype.getCrime = function() {
	return this._crime;
};
Game.Justice.prototype.updateCrime = function() {
	// The Crime level should be a function of the number of criminals (other things later)
	this._crime = this._criminals;
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