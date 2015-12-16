var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}
 
Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "@", "#ff0");
}

Player.prototype.getX = function() { return this._x; }
 
Player.prototype.getY = function() { return this._y; }

Player.prototype.act = function() {
    Game.engine.lock();
    /* wait for user input; do stuff when user hits a key */
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
	console.log(e.keyCode);
    var keyMap = {};

    // Arrow keys
	keyMap[38] = 0;
	keyMap[33] = 1;
	keyMap[39] = 2;
	keyMap[34] = 3;
	keyMap[40] = 4;
	keyMap[35] = 5;
	keyMap[37] = 6;
	keyMap[36] = 7;

	// Numpad keys
	keyMap[104] = 0;
	keyMap[105] = 1;
	keyMap[102] = 2;
	keyMap[99]  = 3;
	keyMap[98]  = 4;
	keyMap[97]  = 5;
	keyMap[100] = 6;
	keyMap[103] = 7;

	var code = e.keyCode;
	if (code == 13 || code == 32) {
        return;
    }
 
    if (!(code in keyMap)) { return; }
 
    var diff = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + diff[0];
    var newY = this._y + diff[1];
 
    var newKey = newX + "," + newY;
    if (!(newKey in Game.map)) { return; } /* cannot move in this direction */

    Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
    this._x = newX;
    this._y = newY;
    this._draw();
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
}