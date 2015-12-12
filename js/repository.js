Game.Repository = function(name, ctor) {
	this._name = name;
	this._templates = {};
    this._randomTemplates = {};
	this._ctor = ctor; // ctor = 'constructor'
};

// Define a new named template.
Game.Repository.prototype.define = function(name, template, options) {
    this._templates[name] = template;
    // Apply any options
    var disableRandomCreation = options && options['disableRandomCreation'];
    if (!disableRandomCreation) {
        this._randomTemplates[name] = template;
    }
};

// Create an object based on a template.
Game.Repository.prototype.create = function(name, extraProperties) {
    if(!this._templates[name]) {
        throw new Error("No template named '" + name + "' in repository '" + this._name + "'");
    }
    // Copy the template
    var template = Object.create(this._templates[name]);
    // Apply any extra properties
    if(extraProperties) {
        for (var key in extraProperties) {
            template[key] = extraProperties[key];
        }
    }
    // Create the object, passing the template as an argument
    return new this._ctor(template);
};

// Create an object based on a random template
Game.Repository.prototype.createRandom = function() {
    // Pick a random key and create an object based off of it.
    return this.create(Object.keys(this._randomTemplates).random());
};

// Cycle through all the templates. If a template has a function that's name
// matches the criteria string, it will execute that function to determine whether 
// or not to create the current template. If none are found, return false.
Game.Repository.prototype.createIf = function(criteria) {
    for(var template in this._templates) {
        if(template.hasOwnProperty(criteria)) {
            var args = Array.prototype.slice.call(arguments, 1)
            var create = template[criteria].apply(template, args);
            if(create) {
                this.create(this._templates[template]);
                return true;
            } else {
                continue;
            }
        }
    }
    return false;
};