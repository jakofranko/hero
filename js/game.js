var Game = {
	map: {},
	display: new ROT.Display(),
	scheduler: new ROT.Scheduler.Simple(),
	engine: new ROT.Engine(this.scheduler),

	layout: null,
	buildings: null,
	player: null,

	init: function() {
		window.addEventListener("load", this);
		window.addEventListener("resize", this);
	},
	handleEvent: function(e) {
		switch (e.type) {
			case "load":
				window.removeEventListener("load", this);
				this._load();
			break;

			case "resize":
				this._resize();
			break;
		}
	},
	_load: function() {
		// this._generateMap();
        document.querySelector('#level').appendChild(this.display.getContainer());
        this.layout = new Game.Layout(28, 20);
        this.layout.init();
	    // this.scheduler.add(this.player, true);	    
	    // this.engine.start();
	},
	_resize: function() {
		if (!this.layout) { return; }
		var level = document.querySelector("#level");
		this.layout.resize(parent.offsetWidth, parent.offsetHeight);
		// var position = this.player.getPosition();
		// Game.legend.update(position[0], position[1]);
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