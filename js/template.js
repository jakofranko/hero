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
Game.Template = function(name, properties) {
	if(this._validateTemplateKey(properties['templateKey'])) {
		this._name = name;
		this._template = properties['template'];
		this._key = properties['templateKey'];
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
				var repo = this._key[char].repository;
				var name = this._key[char].name;
				map[key] = Game[repo].create(name);
			}
		}
	}
	return map;
};

Game.Template._validateTemplateKey = function(templateKey) {
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