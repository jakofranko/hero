// names.json is a file from a repo I forked here: https://github.com/dominictarr/random-name
Game.NameGenerator = function() {
	this.generator = new ROT.StringGenerator();
	this._ready = false;

	var that = this;
	var r = new XMLHttpRequest();
	r.open('get', 'http://raw.githubusercontent.com/jakofranko/random-name/master/names.json', true);
	r.send();
	r.onreadystatechange = function() {
	    if (r.readyState != 4) 
	    	return;
	    that.names = JSON.parse(r.response);
	    for (var i = 0; i < that.names.length; i++) {
	    	that.generator.observe(that.names[i]);
	    }
	    that._ready = true;
	};
};
Game.NameGenerator.prototype.name = function() {
	// Wait till names are generated
	while(!this._ready)
		continue;

	return this.generator.generate();
};