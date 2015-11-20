// This is HEAVILY inspired by Shamus Young's post here:http://www.shamusyoung.com/twentysidedtale/?p=2983.
// Essentially, creating the city will involve a few steps, the first of which is creating a grid of roads. I want to start off with just creating a semi-random grid, but thought that it could be made more interesting by including a highway or two which would cut sort of diagnally across the city. Additionally, a river or nearby lake might be a neat addition as well. Perhaps a large, central park type of construct as well?
// After generating the roads, features can be used to fill in the non-road portions
// The overall display of the city will have a couple different aspects: the first is an overview map which will be used as a simple way to place roads and buildings and other features on the map. The second is the view that the player will actually play in. Think Dwarf Fortress, or the difference between the map and the game world in Cataclysm.
Game.Layout = function(width, height) {
	this.width = width || ROT.DEFAULT_WIDTH;
	this.height = height || ROT.DEFAULT_WIDTH;
	this._roadFrequency = 0.4;
	this.grid = {};
	this.legend = {
		road: ".",
		feature: {"B": 4, "b": 3, "#": 1, "|":2, "%": 1} // Weighted for ROT.RNG.getWeightedValue()
	};

	this._display = new ROT.Display({width: this.width, height: this.height, forceSquareRatio: true});
	this._node = document.createElement("div");

	this._node.id = "overview";
	this._node.appendChild(this._display.getContainer());

	document.querySelector("#sidebar").appendChild(this._node);

	this.resize();
};
Game.Layout.prototype.getNode = function() {
	return this._node;
};
Game.Layout.prototype.init = function() {
	// Generate a random grid
	var lastKey;
	// Start by randomly seeding the first row and column
	for(var y = 0; y < this.height; y++) {
		for(var x = 0; x < this.width; x++) {
			var key = x + "," + y;
			// Only apply random roads on the first row/column,
			// don't let them be right next to each other,
			// dont' let them be within 2 unites of each other,
			// and don't put a road at 0,0
			if((x == 0 || y == 0) && key != "0,0" && Math.random() < this._roadFrequency) {
				var lastX = x - 1;
				var lastY = y - 1;
				var lastRow = lastX + "," + y;
				var lastColumn = x + "," + lastY;

				// Don't put roads within two units of eachother
				if(lastRow != lastKey && lastColumn != lastKey) {
					lastKey = key;
					this.grid[key] = this.legend.road;
				} else {
					this.grid[key] = " ";
				}
			} else {
				this.grid[key] = " ";
			}
		}
	}

	// Create the rest of the grid based off the randomly seeded first rows and columns
	for(var key in this.grid) {
		if(this.grid[key] == this.legend.road) {
			var pos = key.split(",");
			var x = pos[0];
			var y = pos[1];

			// We are on the first row, so draw the roads directly down
			if(y == 0) {
				var thisColumn = x;
				for(var i = 1; i < this.height; i++) {
					var roadKey = thisColumn + "," + i;
					this.grid[roadKey] = this.legend.road;
				}
			// Otherwise, we are on the first column, so draw the road directly over
			} else if(x == 0) {
				var thisRow = y;
				for(var j = 1; j < this.width; j++) {
					var roadKey = j + "," + thisRow;
					this.grid[roadKey] = this.legend.road;
				}
			}
		}
	}

	// Now that the grid has been created, randomly place buildings in the empty spaces
	for(var key in this.grid) {
		if(this.grid[key] == this.legend.road)
			continue;
		else
			this.grid[key] = ROT.RNG.getWeightedValue(this.legend.feature);
	}

	this._draw();
};
Game.Layout.prototype._draw = function() {
	for(var key in this.grid) {
		var pos = key.split(",");
		var x = Number(pos[0]);
		var y = Number(pos[1]); 
		this._display.draw(x, y, this.grid[key]);
	}
};
Game.Layout.prototype.resize = function(width, height) {
	var fontSize = this._display.computeFontSize(width, height);
	this._display.setOptions({fontSize:fontSize});
	// var canvas = this._display.getContainer();
	// canvas.style.top = Math.floor((height-canvas.height)/2) + "px";
	return this;
}