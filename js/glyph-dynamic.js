Game.DynamicGlyph = function(properties) {
	properties = properties || {};
    // Call the glyph's construtor with our set of properties
    Game.Glyph.call(this, properties);
    // Instantiate any properties from the passed object
    this._name = properties['name'] || '';
    // Create an object which will keep track what mixins we have
    // attached to this entity based on the name property
    this._attachedMixins = {};
    // Create a similar object for groups
    this._attachedMixinGroups = {};
    // Set up an object for listeners
    this._listeners = {};
    // Setup the object's mixins
    var mixins = properties['mixins'] || [];
    var ignoreKeys = [
     'init',
     'name',
     'groupName',
     'listeners'
    ];
    for(var i = 0; i < mixins.length; i++) {
        // Copy over all properties from each mixin as long
        // as it's not the name or the init property. We
        // also make sure not to override a property that
        // already exists on the entity.
        var mixinKeys = Object.keys(mixins[i]);
        for(var j = 0; j < mixinKeys.length; j++) {
            var key = mixinKeys[j];
            if(this.hasOwnProperty(key)) {
                console.log(this);
                throw new Error("Mixin '" + mixins[i].name + "' is attempting to add duplicate property '" + key + "'");
            }
            if(ignoreKeys.indexOf(key) === -1)
                this[key] = mixins[i][key];
        }
        // Add the name of this mixin to our attached mixins
        this._attachedMixins[mixins[i].name] = true;
        // If a group name is present, add it
        if(mixins[i].groupName) {
            this._attachedMixinGroups[mixins[i].groupName] = true;
        }
        // Add all of our listeners
        if(mixins[i].listeners) {
            var listeners = Object.keys(mixins[i].listeners);
            for(var k = 0; k < listeners.length; k++) {
                var listener = listeners[k];
                // If we don't already have a listener for this event in our listeners array, add it.
                if (!this._listeners[listener]) {
                    this._listeners[listener] = [];
                }
                // Add the listener.
                this._listeners[listener].push(mixins[i].listeners[listener]);
            }
        }
        // Finally call the init function if there is one
        if(mixins[i].init) {
            mixins[i].init.call(this, properties);
        }
    }
};
// Make dynamic glyphs inherit all the functionality from glyphs
Game.DynamicGlyph.extend(Game.Glyph);

Game.DynamicGlyph.prototype.hasMixin = function(obj) {
    // Allow passing the mixin itself or the name / group name as a string
    if (typeof obj === 'object') {
        return this._attachedMixins[obj.name];
    } else {
        return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
    }
};

Game.DynamicGlyph.prototype.setName = function(name) {
    this._name = name;
};

Game.DynamicGlyph.prototype.getName = function() {
    return this._name;
};
Game.DynamicGlyph.prototype.details = function() {
    var details = [];
    var detailGroups = this.raiseEvent('details');
    // Iterate through each return value, grabbing the details from the arrays.
    if(detailGroups) {
        for(var i = 0, l = detailGroups.length; i < l; i++) {
            if(detailGroups[i]) {
                for(var j = 0; j < detailGroups[i].length; j++) {
                    details.push(detailGroups[i][j].key + ': ' +  detailGroups[i][j].value);          
                }
            }
        }
    }
    return details.join(', ');
};
Game.DynamicGlyph.prototype.describe = function() {
    var descriptions = [];
    var descriptionGroups = this.raiseEvent('describe');
    // Iterate through each return value, grabbing the descriptions from the arrays.
    if(descriptionGroups) {
        for(var i = 0, l = descriptionGroups.length; i < l; i++) {
            if(descriptionGroups[i]) {
                for(var j = 0; j < descriptionGroups[i].length; j++) {
                    descriptions.push(descriptionGroups[i][j]);
                }
            }
        }
    }
    return descriptions.join('. ');
};
Game.DynamicGlyph.prototype.describeA = function(capitalize) {
    // Optional parameter to capitalize the a/an.
    var prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
    var string = this.getName();
    var firstLetter = string.charAt(0).toLowerCase();
    // If word starts by a vowel, use an, else use a. Note that this is not perfect.
    var prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;

    return prefixes[prefix] + ' ' + string;
};
Game.DynamicGlyph.prototype.describeThe = function(capitalize) {
    var prefix = capitalize ? 'The' : 'the';
    return prefix + ' ' + this.getName();
};

Game.DynamicGlyph.prototype.raiseEvent = function(event) {
    // Make sure we have at least one listener, or else exit
    if (!this._listeners[event]) {
        return;
    }
    // Extract any arguments passed, removing the event name
    var args = Array.prototype.slice.call(arguments, 1);
    // Invoke each listener, with this entity as the context and the arguments
    var results = [];
    for (var i = 0; i < this._listeners[event].length; i++) {
        results.push(this._listeners[event][i].apply(this, args));
    }
    return results;
};