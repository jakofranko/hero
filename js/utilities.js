Game.extend = function(src, dest) {
    // Create a copy of the source.
    var result = {};
    for (var key in src) {
        result[key] = src[key];
    }
    // Copy over all keys from dest
    for (var key in dest) {
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

Game._consoleLogGrid = function(grid, field) {
    var string = "";
    for (var y = 0; y < grid[0].length; y++) {
        for (var x= 0; x < grid.length; x++) {
            if(field) {
                string += String(grid[x][y][field]);
            } else {
                string += String(grid[x][y]);
            }
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
        for(y = 0, initialY = startY; y < height; y++, initialY++) {
            list.push(startX + "," + initialY);
        }
    }
    return list;
};