Game.Time = function() {
	this._seconds = 0;
	this._minutes = Game.getStartTime().slice(2, 2) || 0;
	this._hours = Game.getStartTime().slice(0, 2) || 0;
	this._days = 0;
	this._months = 0;
	this._years = 0;

	// In the HERO System, one phase = 1 second, and one round = 12 phases
	// So 5 rounds = 1 minute. All entities have a SPD between 1 and 10, and 
	// your SPD determine's how many phases (turns) that entity gets per round.
	this._rounds = 0;

	// In order to keep track of how many turns have passed, time will be an actor
	// that does stuff once per 'round' (i.e., has a SPD of 1)
	this._speed = 1;
};
Game.Time.prototype.act = function() {
	this._rounds++;
	this._seconds += 12;
	if(this._seconds % 60 == 0 && this._seconds !== 0) {
		this._seconds = 0;
		this._minutes++;
	}
	if(this._minutes % 60 == 0 && this._minutes !== 0) {
		this._minutes = 0;
		this._hours++;
	}
	if(this._hours % 24 == 0 && this._hours !== 0) {
		this._hours = 0;
		this._days++;
	}
	if(this._days % 30 == 0 && this._days !== 0) {
		this._days = 0;
		this._months++;
	}
	if(this._months % 12 == 0 && this._months !== 0) {
		this._months = 0;
		this._years++;
	}
};
Game.Time.prototype.getSeconds = function() {
	return this._padDigit(this._seconds);
};
Game.Time.prototype.getMinutes = function() {
	return this._padDigit(this._minutes);
};
Game.Time.prototype.getHours = function() {
	return this._padDigit(this._hours);
};
Game.Time.prototype.getDays = function() {
	return this._padDigit(this._days);
};
Game.Time.prototype.getMonths = function() {
	return this._padDigit(this._months);
};
Game.Time.prototype.getYears = function() {
	return this._padDigit(this._years);
};
Game.Time.prototype.getRounds = function() {
	return this._padDigit(this._rounds);
};
Game.Time.prototype.getTime = function() {
	return '%s:%s:%s'.format(this.getHours(), this.getMinutes(), this.getSeconds());
};
Game.Time.prototype.getSpeed = function() {
	return this._speed;
};
Game.Time.prototype._padDigit = function(digit) {
	if(digit < 10) {
		return digit.toString().lpad("0");
	} else {
		return digit;
	}
};