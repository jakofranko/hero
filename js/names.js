// names.json is a file from a repo I forked here: https://github.com/dominictarr/random-name
Game.NameGenerator = function() {
	this.generator = new ROT.StringGenerator();

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

	    for (var i = 0; i < 50; i++) {
	    	console.log(that.generator.generate());
	    }
	};
};