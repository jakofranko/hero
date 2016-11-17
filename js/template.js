// A helper for generating tiles and items in a fixed pattern.
// @template 	should be an array of strings, with each item of the array representing
// 				a row 'x', and each character of the string representing a column of x
// @templateKey should be an object, with each key representing a character on the template
// 				and the value of templateKey[key] would be an object 
//				{ repository: functionName, name: repository item name}
// 				where repository is the name of the repo (like Game.TileRepository) and name is the item/tile name
// 				like 'grass' or 'table' such that calling templateKey[key].repository.create(templateKey[key].name) 
//				would generate the appropriate thing
// TODO: Add support for adding multiple objects to a single place on the template via a template key
// TODO: Add functions to turn a template by 90 degrees, and by 180 degrees (and maybe by 270 degrees)
Game.Template = function(properties) {
	if(this._validateTemplateKey(properties['templateKey']) && this._validateTemplate(properties['template'])) {
		this._name = properties['name'];
		this._template = properties['template'];
		this._key = properties['templateKey'];
		this._tempKey = null;
	} else {
		throw new Error("The template key is not valid, so the '" + name + "' template was not created");
	}
};

Game.Template.prototype.getTemplate = function() {
	return this._template;
};

Game.Template.prototype.getKey = function() {
	return this._key;
};

// Returns a hash-map object that holds the generated items like so:
// { "x,y": Game.[type]Repository.create(templateKey name) }
// Note, since this._template is an array of strings, 'i' in this._template[i] will 
// reference the 'y' axis, and the character index 'j' at this._template[i][j]
// will reference the 'x' axis. This is a bit backwards from how it is usually done.
Game.Template.prototype.getProcessedTemplate = function() {
	var map = {};
	for(var y = 0; y < this._template.length; y++) {
		for (var x = 0; x < this._template[y].length; x++) {
			var char = this._template[y][x];
			if(this._key[char]) {
				var key = x + "," + y;
				map[key] = this._key[char];
			}
		}
	}
	this._consoleLogMap(map);
	return map;
};

// Process _template, rotating it by 90 degrees
// by flipping x an y values. Returns a two-dimensional 
// grid-like array (used for all our maps and throughout the game)
Game.Template.prototype.rotateTemplate = function(template) {
	debugger;
	var width, height, newTemplate;
	var templateKey = this._tempKey || this._key; // Use the tempKey unless it's null

	// If this is an array of strings, we'll need to iterate it differently
	// than we will iterate through our typical two-dimensional arrays
	if(typeof template[0] === 'string') {
		width = template[0].length;
		height = template.length;
		newTemplate = new Array(height); // new template will be as wide as old template is long
		for(var y = 0; y < template.length; y++) {
			if(!newTemplate[y])
				newTemplate[y] = new Array(width); // new template will be as long as old template is wide
			for (var x = 0; x < template[y].length; x++) {
				var char = template[y][x];
				if(templateKey[char]) {
					var name = templateKey[char].name;
					var repository = templateKey[char].repository;
					if(!this._tempKey)
						this._tempKey = {};
					if(!this._tempKey[char])
						this._tempKey[char] = {};

					if(name.match(/horizontal/) !== null)
						this._tempKey[char].name = name.replace(/horizontal/, 'vertical');
					else if(name.match(/vertical/))
						this._tempKey[char].name = name.replace(/vertical/, 'horizontal');
					else
						this._tempKey[char].name = name;

					this._tempKey[char].repository = repository;
					newTemplate[y][x] = template[y][x];
				}
			}
		}
	} else {
		width = template.length;
		height = template[0].length;
		newTemplate = new Array(height); // new template will be as wide as old template is long
		for(var x = 0; x < template.length; x++) {
			for (var y = 0; y < template[x].length; y++) {
				if(!newTemplate[y]) // we are flipping x and y for the new template, remember?
					newTemplate[y] = new Array(width); // new template will be as long as old template is wide
				var char = template[x][y];
				if(templateKey[char]) {
					var name = templateKey[char].name;
					var repository = templateKey[char].repository;
					if(!this._tempKey)
						this._tempKey = {};
					if(!this._tempKey[char])
						this._tempKey[char] = {};

					if(name.match(/horizontal/) !== null)
						this._tempKey[char].name = name.replace(/horizontal/, 'vertical');
					else if(name.match(/vertical/))
						this._tempKey[char].name = name.replace(/vertical/, 'horizontal');
					else
						this._tempKey[char].name = name;

					this._tempKey[char].repository = repository;
					newTemplate[y][x] = template[x][y];
				}
			}
		}
	}
	
	Game._consoleLogGrid(newTemplate);
	return newTemplate;
};

// Process the template to get a map of x,y coords. and map tiles,
// then flip these coordinates such that each template char will 
// have the same y position, but a reversed x position.
Game.Template.prototype.getProcessedTemplateFlipHorizontal = function() {
	var map = {};
	for(var y = 0; y < this._template.length; y++) {
		for (var x = 0, i = this._template[y].length - 1; x < this._template[y].length; x++, i--) {
			var char = this._template[y][i];
			if(this._key[char]) {
				var key = x + "," + y;
				map[key] = this._key[char];
			}
		}
	}
	this._consoleLogMap(map);
	return map;
};

// Process the template to get a map of x,y coords. and map tiles,
// then flip these coordinates such that each template char will 
// have the same x position, but a reversed y position.
Game.Template.prototype.getProcessedTemplateFlipVertical = function() {
	var map = {};
	for(var y = 0, i = this._template.length - 1; y < this._template.length; y++, i--) {
		for (var x = 0; x < this._template[y].length; x++) {
			var char = this._template[i][x];
			if(this._key[char]) {
				var key = x + "," + y;
				map[key] = this._key[char];
			}
		}
	}
	this._consoleLogMap(map);
	return map;
};

Game.Template.prototype.getWidth = function() {
	return this._template[0].length;
};

Game.Template.prototype.getHeight = function() {
	return this._template.length;
};

Game.Template.prototype._validateTemplateKey = function(templateKey) {
	for(var tk in templateKey) {
		if(typeof templateKey[tk] !== 'object')
			throw new Error('Template key "' + tk + '" needs an object definition with values for "repository" and "name"');

		if(!templateKey[tk].repository || !templateKey[tk].name)
			throw new Error('Template key "' + tk + '" is missing a definiting for "repository" or "name"');

		if(!Game[templateKey[tk].repository])
			throw new Error('"' + templateKey[tk].repository + '" does not exist in the "Game" namespace');
	}
	return true;
};

Game.Template.prototype._validateTemplate = function(template) {
	var width = template[0].length;
	for (var i = 0; i < template.length; i++)
		if(template[i].length !== width)
			throw new Error('Templates must have uniform string lengths in order to produce squares and rectangles. This string: "' + template[i] + '" is longer or shorter than the rest');

	return true;
};

Game.Template.prototype._consoleLogMap = function(map) {
	var grid = new Array(this.getWidth());
	for(var key in map) {
		var name = map[key].name;
		var repo = map[key].repository;
		var splitKey = key.split(",");
		var x = splitKey[0];
		var y = splitKey[1];

		if(!grid[x])
			grid[x] = new Array(this.getHeight());

		grid[x][y] = Game[repo].create(name);
	}
	Game._consoleLogGrid(grid, '_char');
};