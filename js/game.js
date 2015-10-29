var Game = {
	display: null,
	map: {},
	player: null,
	engine: null,
	init: function() {
		this.display = new ROT.Display();
        document.getElementById('game').appendChild(this.display.getContainer());
        this._generateMap();
        var scheduler = new ROT.Scheduler.Simple();
	    scheduler.add(this.player, true);
	    this.engine = new ROT.Engine(scheduler);
	    this.engine.start();
	},
	_generateMap: function() {
	    var digger = new ROT.Map.Digger();
	    var freeCells = [];
	 
	    var digCallback = function(x, y, value) {
	        if (value) { return; } /* do not store walls */
	 
	        var key = x+","+y;
	        freeCells.push(key);
	        this.map[key] = ".";
	    }
	    digger.create(digCallback.bind(this));
	    this._drawWholeMap();
	    this.player = this._createBeing(Player, freeCells);
	},
	_drawWholeMap: function() {
	    for (var key in this.map) {
	        var parts = key.split(",");
	        var x = parseInt(parts[0]);
	        var y = parseInt(parts[1]);
	        this.display.draw(x, y, this.map[key]);
	    }
	},
	_createBeing: function(Being, freeCells) {
	    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
	    var key = freeCells.splice(index, 1)[0];
	    var parts = key.split(",");
	    var x = parseInt(parts[0]);
	    var y = parseInt(parts[1]);
	    return new Being(x, y);
	}
}