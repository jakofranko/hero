if(!String.prototype.splice) {
    /**
     * {JSDoc}
     *
     * The splice() method changes the content of a string by removing a range of
     * characters and/or adding new characters.
     *
     * @this {String}
     * @param {number} start Index at which to start changing the string.
     * @param {number} delCount An integer indicating the number of old chars to remove.
     * @param {string} newSubStr The String that is spliced in.
     * @return {string} A new string with the spliced substring.
     */
    String.prototype.splice = function(start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}


// Since Ondras isn't updating ROT.js much these days, I need the unbroken version of this function
Array.prototype.randomize = function() {
    var result = [];
    var clone = this.slice();
    while (clone.length) {
        var index = clone.indexOf(clone.random());
        result.push(clone.splice(index, 1)[0]);
    }
    return result;
};

if(!Object.prototype.randomKey) {
    /**
     * {JSDoc}
     *
     * The randomKey() method will fetch a random key from an object
     *
     * @this {Object}
     * @return {String} A string which is the randomly selected key.
     */
     Object.defineProperty(Object.prototype, 'randomKey', {
        value: function() {
            var keys = Object.keys(this);
            return keys.random();
        }
     });
}

// Math helper for calculating percentages
if(!Math.percent) {
    /**
     * {JSDoc}
     *
     * Math.percent will convert a fraction to a percent.
     * @param {Number} num smaller number.
     * @param {Number} denominator bigger number.
     * @this {Object}
     * @return {Number} percent which is (num / denominator) * 100.
     */
     Math.percent = function(num, denominator) {
        return (num / denominator) * 100;
     };
}

// camelCase a string
if(!String.prototype.camelCase) {
    String.prototype.camelCase = function() {
        // Capitalize words after first
        var capitalized = this.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
            return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
        });

        // Remove spaces
        return capitalized.replace(/\s+/g, '');
  };
}

Game.extend = function(src, dest) {
    // Create a copy of the source.
    var result = {};
    var key;
    for(key in src) {
        result[key] = src[key];
    }
    // Copy over all keys from dest
    for(key in dest) {
        result[key] = dest[key];
    }
    return result;
};

Game.getRandomInRange = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Game.rollDice = function(XdX) {
    var dice = XdX.split("d");
    var num = dice[0];
    var sides = dice[1];
    var total = 0;
    for (var i = 0; i < num; i++) {
        total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
};

Game._consoleLogGrid = function(grid, field, items, z) {
    var string = "";
    for (var y = 0; y < grid[0].length; y++) {
        for (var x = 0; x < grid.length; x++) {
            if(items && z !== undefined && items[x + "," + y + "," + z])
                string += items[x + "," + y + "," + z][0]._char;
            else if(!grid[x] || !grid[x][y])
                string += " ";
            else if(field)
                string += String(grid[x][y][field]);
            else
                string += String(grid[x][y]);
        }
        string += "\n";
    }
    console.log(string);
};

/**
* Decimal adjustment of a number. Copy/pasted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
*
* @param {String}  type  The type of adjustment.
* @param {Number}  value The number.
* @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
* @returns {Number} The adjusted value.
*/
function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

// Decimal round
if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
}
// Decimal floor
if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
}
// Decimal ceil
if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
}


Game.listXY = function(startX, startY, width, height) {
    var list = [];
    for (var x = 0; x < width; x++, startX++) {
        for(var y = 0, initialY = startY; y < height; y++, initialY++) {
            list.push(startX + "," + initialY);
        }
    }
    return list;
};

// Takes a 3-dimensional array and fills in non-existant
// places in the arrays and fills them with air or grass tiles
Game.spaceFill = function(grid) {
    for (var z = 0; z < grid.length; z++) {
        // If there are varying heights, find the highest column
        var height = grid[z].reduce(function(prev, curr) {
            if(typeof prev === 'object') prev = prev.length;
            if(typeof curr === 'object') curr = curr.length;
            return Math.max(prev, curr);
        }, 0);
        for (var x = 0; x < grid[z].length; x++) { // grid[z].length == width
            if(!grid[z][x])
                grid[z][x] = new Array(height);

            for (var y = 0; y < height; y++) {
                if(!grid[z][x][y])
                    grid[z][x][y] = (z === 0) ? Game.TileRepository.create('grass') : Game.TileRepository.create('air');
            }
        }
    }
    return grid;
};
