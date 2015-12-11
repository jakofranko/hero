// This is HEAVILY inspired by Shamus Young's post here:http://www.shamusyoung.com/twentysidedtale/?p=2983.
// Essentially, creating the city will involve a few steps, the first of which is creating a grid of roads. I want to start off with just creating a semi-random grid.
// TODO: Could be made more interesting by including a highway or two which would cut sort of diagnally across the city. Additionally, a river or nearby lake might be a neat addition as well. Perhaps a large, central park type of construct as well?
// After generating the roads, lots will be placed semi-randomly in the non-road portions

Game.City = function(width, height) {
	this._width = width;
	this._height = height;

	// How many roads in the city.
	this._roadFrequency = 0.4;
	this.grid = {};
	this.legend = {
		road: ".",
		feature: {"B": 4, "b": 3, "#": 1, "|":2, "%": 1} // Weighted for ROT.RNG.getWeightedValue()
	};
};
Game.City.prototype.getNode = function() {
	return this._node;
};
Game.City.prototype.init = function() {
	// Generate a random grid
	var lastKey;
	// Start by randomly seeding the first row and column
	for(var y = 0; y < this._height; y++) {
		for(var x = 0; x < this._width; x++) {
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
				for(var i = 1; i < this._height; i++) {
					var roadKey = thisColumn + "," + i;
					this.grid[roadKey] = this.legend.road;
				}
			// Otherwise, we are on the first column, so draw the road directly over
			} else if(x == 0) {
				var thisRow = y;
				for(var j = 1; j < this._width; j++) {
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
};