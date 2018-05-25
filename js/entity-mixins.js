// From http://www.codingcookies.com/2013/04/20/building-a-roguelike-in-javascript-part-4/
Game.EntityMixins = {};

Game.EntityMixins.Attacker = {
    name: 'Attacker',
    groupName: 'Attacker',
    init: function() {
        if(!this.hasMixin('Characteristics')) {
            throw new Error('Entity needs the "Characteristics" mixin in order to use this mixin');
        }
    },
    getHTH: function() {
        return Math.floor(this._STR / 5) + "d6";
    },
    hthAttack: function(target) {
        // No matter what, some entity took a swing at another entity,
        // so trigger the onAttack event. onHit on the other hand...
        target.raiseEvent('onAttack', this);

        var hit = this._attackRoll(target);
        if(hit) {
            var dice = Math.floor(this._STR / 5);
            var STUN = 0;
            var BODY = 0;

            for(var i = 0; i < dice; i++) {
                var dieRoll = Game.rollDice("1d6");

                STUN += dieRoll;
                if(dieRoll == 6) {
                    BODY += 2;
                } else if(dieRoll > 1) {
                    BODY += 1;
                }

            }

            target.takeSTUN(this, STUN);
            target.takeBODY(this, BODY);
            Game.sendMessage(target, "%s does %s STUN and %s BODY to you!", [this.describeThe(), STUN, BODY]);
            Game.sendMessage(this, "You do %s STUN and %s BODY to %s!", [STUN, BODY, target.describeThe()]);
            return true;
        } else {
            Game.sendMessage(target, "%s misses you!", [this.describeThe()]);
            Game.sendMessage(this, "You miss!");
            return false;
        }
    },
    presenceAttack: function(target, additionalDice, message) {
        if(!additionalDice)
            additionalDice = 0;
        var dice = Math.floor(this._PRE / 5) + additionalDice;
        var result = Game.rollDice(dice + "d6");

        if(!message)
            message = "%s makes a presense attack!".format(this.getName());

        Game.sendMessageNearby(
            this.getMap(),
            this.getX(),
            this.getY(),
            this.getZ(),
            message
        );
        // Return the margin of success or false
        var margin;
        if(result >= target.getPRE()) {
            margin = result - target.getPRE();
        }
        else if(result >= target.getEGO()) {
            margin = result - target.getEGO();
        } else {
            Game.sendMessage(this, "Your presence attack fails to impress %s", [target.describeThe()]);
            Game.sendMessage(target, "%s attempted and failed to impress you with a presense attack", [this.getName()]);
            return false;
        }

        Game.sendMessage(this, "Your presence attack succeeds in impressing %s by %s points!", [target.describeThe(), margin]);
        Game.sendMessage(target, "%s has impressed you with a presense attack by %s points!", [this.getName(), margin]);
        return margin;
    },
    _attackRoll: function(target) {
        var roll = Game.rollDice("3d6");
        return roll <= 11 + this.getOCV() - target.getDCV();
    }
};
Game.EntityMixins.Characteristics = {
    name: 'Characteristics',
    init: function(template) {
        // Primary characteristics
        this._STR = template['STR'] || 10;
        this._DEX = template['DEX'] || 10;
        this._CON = template['CON'] || 10;
        this._BODY = template['BODY'] || 10;
        this._maxBODY = template['maxBODY'] || this._BODY;
        this._INT = template['INT'] || 10;
        this._EGO = template['EGO'] || 10;
        this._PRE = template['PRE'] || 10;
        this._COM = template['COM'] || 10;

        // Figured characteristics. These will update as primary
        // characteristics change, but cannot be added to.
        this._PD = template['PD'] || this._STR / 5;
        this._ED = template['ED'] || this._CON / 5;
        this._SPD = template['SPD'] || 1 + (this._DEX / 10);
        this._REC = template['REC'] || (this._STR / 5) + (this._CON / 5);
        this._END = template['END'] || this._CON * 2;
        this._maxEND = template['maxEND'] || this._END;
        this._STUN = template['STUN'] || this._BODY + (this._STR / 2) + (this._CON / 2);
        this._maxSTUN = template['maxSTUN'] || this._STUN;

        // Figured characteristic modifiers. These are seperate from the values of the figured characteristics,
        // but can be individually subtracted and added to seperately from the figured characteristics
        this._PDmod = template['PDmod'] || 0;
        this._EDmod = template['EDmod'] || 0;
        this._SPDmod = template['SPDmod'] || 0;
        this._ENDmod = template['ENDmod'] || 0;
        this._RECmod = template['RECmod'] || 0;
        this._maxENDmod = template['maxENDmod'] || 0;
        this._STUNmod = template['STUNmod'] || 0;
        this._maxSTUNmod = template['maxSTUNmod'] || 0;

        // It should be noted that BODY, STUN and END are tracked as the current values, whereas
        // maxBODY, maxSTUN and maxEND is the upper limit that they can recover too, and
        // maxBODYmod, maxSTUNmod, and maxENDmod are what get incrememnted when spending XP

        // Combat values
        this._CV = Math.round(this._DEX / 3);
        this._OCVmod = template['OCVmod'] ||  0;
        this._DCVmod = template['DCVmod'] ||  0;
        this._ECV = Math.round(this._EGO / 3);
        this._EOCVmod = template['EOCVmod'] ||  0;
        this._EDCVmod = template['EDCVmod'] ||  0;

        // Resistant Defenses. Can only be updated by powers (armor, resistant defense)
        this._rPD = 0;
        this._rED = 0;
    },
    updateFiguredCharacteristics: function() {
        this._PD        = Math.round(this._STR / 5);
        this._ED        = Math.round(this._CON / 5);
        this._SPD       = Math.floor(1 + (this._DEX / 10));
        this._REC       = Math.round((this._STR / 5) + (this._CON / 5));
        this._maxEND    = Math.round(this._CON * 2);
        this._maxSTUN   = Math.round(this._BODY + (this._STR / 2) + (this._CON / 2));
    },
    getCharacteristic: function(CHAR, total, max, mod) {
        var prefix = (max && (CHAR == 'BODY' || CHAR == 'STUN' || CHAR == 'END')) ? 'max' : '';
        var suffix = mod ? 'mod' : '';
        var characteristic = "_" + prefix + CHAR + suffix;
        if(total && this[characteristic + "mod"])
            return this[characteristic] + this[characteristic + "mod"];
        else
            return this[characteristic];
    },
    getSTR: function() {
        return this._STR;
    },
    getDEX: function() {
        return this._DEX;
    },
    getCON: function() {
        return this._CON;
    },
    getBODY: function() {
        return this._BODY;
    },
    takeBODY: function(attacker, BODY, type, killing) {
        var defense;
        if(killing) {
            if(!type || type == 'physical') defense = this._rPD;
            else if(type == 'energy')       defense = this._rED;
            else                            defense = 0;
        } else {
            if(!type || type == 'physical') defense = this._PD;
            else if(type == 'energy')       defense = this._ED;
            else                            defense = 0;
        }

        // Make sure we don't take any less than zero damage
        this._BODY -= Math.max(0, (BODY - defense));
        if(this._BODY <= -this._maxBODY) {
            Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
            // Raise events
            this.raiseEvent('onDeath', attacker);
            attacker.raiseEvent('onKill', this);

            this.kill();
            if(this.hasMixin('JobActor') && this.hasJob('mugger')) {
                this.getMap().getJustice().removeCriminals(1);
            }
        }
    },
    getMaxBODY: function() {
        return this._maxBODY;
    },
    getINT: function() {
        return this._INT;
    },
    getEGO: function() {
        return this._EGO;
    },
    getPRE: function() {
        return this._PRE;
    },
    getCOM: function() {
        return this._COM;
    },
    getPD: function() {
        return this._PD;
    },
    getPDmod: function() {
        return this._PDmod;
    },
    getED: function() {
        return this._ED;
    },
    getEDmod: function() {
        return this._EDmod;
    },
    getSPD: function() {
        return this._SPD;
    },
    getSPDmod: function() {
        return this._SPDmod;
    },
    getREC: function() {
        return this._REC;
    },
    getRECmod: function() {
        return this._RECmod;
    },
    adjustEND: function(amount) {
        this._END += amount;
    },
    getEND: function() {
        return this._END;
    },
    getMaxEND: function() {
        return this._maxEND;
    },
    getMaxENDmod: function() {
        return this._maxENDmod;
    },
    getSTUN: function() {
        return this._STUN;
    },
    getMaxSTUN: function() {
        return this._maxSTUN;
    },
    getMaxSTUNmod: function() {
        return this._maxSTUNmod;
    },
    takeSTUN: function(attacker, STUN, type, killing) {
        var defense;
        if(killing) {
            // Page 410 of the 5th Ed. -- can apply normal defenses against killing STUN if they have resistant defenses
            if(!type || type == 'physical') defense = this._rPD ? this._rPD + this._PD : 0;
            else if(type == 'energy')       defense = this._rED ? this._rPD + this._ED : 0;
            else                            defense = 0;
        } else {
            if(!type || type == 'physical') defense = this._PD;
            else if(type == 'energy')       defense = this._ED;
            else                            defense = 0;
        }

        // Make sure we don't take any less than zero damage
        this._STUN -= Math.max(0, (STUN - defense));
        if(this._STUN <= 0) {
            Game.sendMessage(attacker, "You knocked %s unconscious", [this.getName()]);
            this.ko();
        } else {
            if(this.hasMixin('Reactor')) {
                var reaction = this.getReactionTypes().random();
                this.setReaction(reaction);
            }
        }
    },
    increaseChar: function(CHAR) {
        var characteristic = "_" + CHAR;
        this[characteristic] += 1;
        this.updateFiguredCharacteristics();
    },
    decreaseChar: function(CHAR) {
        var characteristic = "_" + CHAR;
        this[characteristic] -= 1;
        this.updateFiguredCharacteristics();
    },
    recoverSTUN: function(STUN) {
        var max = this._maxSTUN + this._maxSTUNmod;
        if(!STUN)
            STUN = this._REC;

        if(this._STUN + STUN > max)
            this._STUN = max;
        else
            this._STUN += STUN;

        if(this._STUN > 0 && !this.isConscious()) {
            this.regainConsciousness();
            this.raiseEvent('onRegainConsciousness');
        }
    },
    recoverEND: function(END) {
        var max = this._maxEND + this._maxENDmod;
        if(!END)
            END = this._REC;

        if(this._END + END > max)
            this._END = max;
        else
            this._END += END;
    },
    getOCV: function() {
        return this._CV + this._OCVmod;
    },
    getDCV: function() {
        return this._CV + this._DCVmod;
    },
    charRoll: function(chr) {
        var roll = Game.rollDice("3d6");
        var characteristic = "_" + chr;
        var targetRoll = 9 + (this[characteristic] / 5);
        if(roll <= targetRoll) {
            return targetRoll - roll;
        } else {
            return false;
        }
    },
    listeners: {
        post12Recovery: function() {
            this.recoverSTUN();
            this.recoverEND();
        }
    }
};
Game.EntityMixins.BasePoints = {
    name: 'BasePoints',
    groupName: 'CharacterPoints',
    init: function(template) {
        // Characters will have a base pool of points, and can earn experience points,
        // and potentially aquire disadvantages for more points. Seperately, as points
        // are aquired they should be put in a pool of 'spendable' points that they can
        // enhance themselves with. That way, a total point value can be ascertained
        // from a character for awarding experience points for their defeat.
        this._basePoints = template['basePoints'] || 0;
        this._spendablePoints = template['basePoints'] || 0;

        // Determine what they can spend XP on.
        this._pointOptions = [];
        if (this.hasMixin('Characteristics')) {
            this._pointOptions.push(['STR', this.increaseChar]);
            this._pointOptions.push(['DEX', this.increaseChar]);
            this._pointOptions.push(['CON', this.increaseChar]);
            this._pointOptions.push(['maxBODY', this.increaseChar]);
            this._pointOptions.push(['INT', this.increaseChar]);
            this._pointOptions.push(['EGO', this.increaseChar]);
            this._pointOptions.push(['PRE', this.increaseChar]);
            this._pointOptions.push(['COM', this.increaseChar]);
            this._pointOptions.push(['PDmod', this.increaseChar]);
            this._pointOptions.push(['EDmod', this.increaseChar]);
            this._pointOptions.push(['SPDmod', this.increaseChar]);
            this._pointOptions.push(['RECmod', this.increaseChar]);
            this._pointOptions.push(['maxENDmod', this.increaseChar]);
            this._pointOptions.push(['maxSTUNmod', this.increaseChar]);
        }
    },
    getBasePoints: function() {
        return this._basePoints;
    },
    getPointOptions: function() {
        return this._pointOptions;
    },
    getSpendablePoints: function() {
        return this._spendablePoints;
    },
    addSpendablePoints: function(points) {
        this._spendablePoints += points;
    },
    subtractSpendablePoints: function(points) {
        this._spendablePoints -= points;
    },
    getTotalPoints: function() {
        var pointTotal = this._basePoints;
        if(this.hasMixin('ExperienceGainer')) {
            pointTotal += this.getExperiencePoints();
        }
        return pointTotal;
    }
};
Game.EntityMixins.CorpseDropper = {
    name: 'CorpseDropper',
    init: function(template) {
        // Chance of dropping a corpse (out of 100).
        this._corpseDropRate = template['corpseDropRate'] || 100;
    },
    listeners: {
        onDeath: function() {
            // Check if we should drop a corpse.
            if (Math.round(Math.random() * 100) <= this._corpseDropRate) {
                // Create a new corpse item and drop it.
                this._map.addItem(
                    this.getX(),
                    this.getY(),
                    this.getZ(),
                    Game.ItemRepository.create('corpse', {
                        name: this._name + ' corpse',
                        foreground: this._foreground
                    })
                );
            }
        }
    }
};
Game.EntityMixins.Destructible = {
    name: 'Destructible',
    init: function(template) {
        this._maxHp = template['maxHp'] || 10;
        this._hp = template['hp'] || this._maxHp;
        this._defenseValue = template['defenseValue'] || 0;
    },
    getDefenseValue: function() {
        var modifier = 0;
        // If we can equip items, then have to take into
        // consideration weapon and armor
        if (this.hasMixin(Game.EntityMixins.Equipper)) {
            if (this.getWeapon()) {
                modifier += this.getWeapon().getDefenseValue();
            }
            if (this.getArmor()) {
                modifier += this.getArmor().getDefenseValue();
            }
        }
        return this._defenseValue + modifier;
    },
    getHp: function() {
        return this._hp;
    },
    getMaxHp: function() {
        return this._maxHp;
    },
    takeDamage: function(attacker, damage) {
        this._hp -= damage;
        if(this._hp <= 0) {
            Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
            // Raise events
            this.raiseEvent('onDeath', attacker);
            attacker.raiseEvent('onKill', this);
            this.kill();
        }
    },
    setHp: function(hp) {
        this._hp = hp;
    },
    increaseDefenseValue: function(value) {
        // If no value was passed, default to 2.
        value = value || 2;
        // Add to the defense value.
        this._defenseValue += value;
        Game.sendMessage(this, "You look tougher!");
    },
    increaseMaxHp: function(value) {
        // If no value was passed, default to 10.
        value = value || 10;
        // Add to both max HP and HP.
        this._maxHp += value;
        this._hp += value;
        Game.sendMessage(this, "You look healthier!");
    },
    listeners: {
        onGainLevel: function() {
            // Heal the entity.
            this.setHp(this.getMaxHp());
        },
        details: function() {
            return [
                {key: 'defense', value: this.getDefenseValue()},
                {key: 'hp', value: this.getHp()}
            ];
        }
    }
};
Game.EntityMixins.Equipper = {
    name: 'Equipper',
    init: function() {
        this._weapon = null;
        this._armor = null;
    },
    wield: function(item) {
        this._weapon = item;
        item.wield();
    },
    unwield: function() {
        this._weapon.unwield();
        this._weapon = null;
    },
    wear: function(item) {
        this._armor = item;
        item.wear();
    },
    takeOff: function() {
        this._armor.takeOff();
        this._armor = null;
    },
    getWeapon: function() {
        return this._weapon;
    },
    getArmor: function() {
        return this._armor;
    },
    unequip: function(item) {
        // Helper function to be called before getting rid of an item.
        if (this._weapon === item) {
            this.unwield();
        }
        if (this._armor === item) {
            this.takeOff();
        }
    }
};
Game.EntityMixins.EventParticipant = {
    name: 'EventParticipant',
    groupName: 'Event',
    init: function(template) {
        // TODO: [EVENTS] Handle being able to participate in multiple events?
        this._event = template['event'] || false;
    },
    getEvent: function() {
        return this._event;
    },
    listeners: {
        onDeath: function(killer) {
            this._event.raiseEvent('onDeath', this, killer);
        },
        onKill: function(victim) {
            this._event.raiseEvent('onKill', this, victim);
        }
    }
};
Game.EntityMixins.ExperienceGainer = {
    name: 'ExperienceGainer',
    groupName: 'CharacterPoints',
    init: function(template) {
        this.experiencePoints = template['experiencePoints'] || 0;
    },
    getExperiencePoints: function() {
        return this.experiencePoints;
    },
    giveExperiencePoints: function(xp) {
        this.experiencePoints += xp;
        Game.sendMessage(this, 'You have earned %s experience points', [xp]);
    },
    listeners: {
        onKill: function(victim) {
            var xp = 0;
            if(victim.hasMixin('BasePoints'))
            // Only give experience if more than 0.
            if (xp > 0) {
                this.giveExperiencePoints(xp);
            }
        }
    }
};
Game.EntityMixins.FoodConsumer = {
    name: 'FoodConsumer',
    init: function(template) {
        this._maxFullness = template['maxFullness'] || 1000;
        // Start halfway to max fullness if no default value
        this._fullness = template['fullness'] || (this._maxFullness / 2);
        // Number of points to decrease fullness by every turn.
        this._fullnessDepletionRate = template['fullnessDepletionRate'] || 1;
    },
    addTurnHunger: function() {
        // Remove the standard depletion points
        this.modifyFullnessBy(-this._fullnessDepletionRate);
    },
    modifyFullnessBy: function(points) {
        this._fullness = this._fullness + points;
        if (this._fullness <= 0) {
            this.kill("You have died of starvation!");
        } else if (this._fullness > this._maxFullness) {
            this.kill("You choke and die!");
        }
    },
    getHungerState: function() {
        // Fullness points per percent of max fullness
        var perPercent = this._maxFullness / 100;
        // 5% of max fullness or less = starving
        if(this._fullness <= perPercent * 5) {
            return 'Starving';
        // 25% of max fullness or less = hungry
        } else if (this._fullness <= perPercent * 25) {
            return 'Hungry';
        // 95% of max fullness or more = oversatiated
        } else if (this._fullness >= perPercent * 95) {
            return 'Oversatiated';
        // 75% of max fullness or more = full
        } else if (this._fullness >= perPercent * 75) {
            return 'Full';
        // Anything else = not hungry
        } else {
            return 'Not Hungry';
        }
    }
};
Game.EntityMixins.InventoryHolder = {
    name: 'InventoryHolder',
    init: function(template) {
        // Default to 10 inventory slots.
        var inventorySlots = template['inventorySlots'] || 10;
        // Set up an empty inventory.
        this._items = new Array(inventorySlots);
    },
    getItems: function() {
        return this._items;
    },
    getItem: function(i) {
        return this._items[i];
    },
    addItem: function(item) {
        var stack = this.canStackItem(item);
        var index = this.canAddItem(item);
        if(stack !== false)
            this._items[stack].addToStack();
        else if(index !== false)
            this._items[index] = item;
        else
            return false;

        return true;
    },
    removeItem: function(i, amount) {
        if(!this._items[i])
            return false;

        // If we can equip items, then make sure we unequip the item we are removing.
        if(this._items[i] && this.hasMixin(Game.EntityMixins.Equipper))
            this.unequip(this._items[i]);

        // If the item is in a stack, decrement the stack amount
        if(this._items[i].hasMixin('Stackable') && this._items[i].amount() > 1)
            this._items[i].removeFromStack(amount);
        else
            // Simply clear the inventory slot.
            this._items[i] = null;
    },
    canAddItem: function(item) {
        if(item.hasMixin("Fixture")) {
            Game.sendMessage(this, "%s is fixed to the ground and cannot be picked up", [item.describeThe()]);
            return false;
        }

        // Return false if the item is too heavy
        if(item.hasMixin('Heavy') && !item.canPickUp(this))
            return false;

        // Otherwise, return the empty slot if it exists
        for(var i = 0; i < this._items.length; i++) {
            if (!this._items[i]) {
                return i;
            }
        }
        Game.sendMessage(this, "Your inventory is full! Not all items were picked up.");
        return false;
    },
    canStackItem: function(item) {
        if(item.hasMixin('Stackable')) {
            for(var i = 0; i < this._items.length; i++) {
                if(this._items[i].getName() == item.getName()) {
                    return i;
                }
            }
        }
        return false;
    },
    pickupItems: function(indices) { // This is invoked from screens.js Game.Screen.pickupScreen
        // Allows the user to pick up items from the map, where indices is
        // the indices for the array returned by map.getItemsAt
        var mapItems = this._map.getItemsAt(this.getX(), this.getY(), this.getZ());
        var added = 0;
        // Iterate through all indices.
        for (var i = 0; i < indices.length; i++) {
            // Try to add the item. If our inventory is not full, then splice the
            // item out of the list of items. In order to fetch the right item, we
            // have to offset the number of items already added.
            if (this.addItem(mapItems[indices[i] - added])) {
                mapItems.splice(indices[i] - added, 1);
                added++;
            } else {
                // Inventory is full
                break;
            }
        }
        // Update the map items
        this._map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
        // Return true only if we added all items
        return added === indices.length;
    },
    dropItem: function(i) {
        // Drops an item to the current map tile
        if (this._items[i]) {
            if (this._map) {
                this._map.addItem(this.getX(), this.getY(), this.getZ(), this._items[i]);
            }
            this.removeItem(i);
        }
    }
};
Game.EntityMixins.JobActor = {
    name: 'JobActor',
    groupName: 'Actor',
    init: function(template) {
        this._jobs = template['jobs'] || ['survive'];
        this._jobCurrent = null;
        this._jobComplete = {};
        this._jobPriority = template['jobPriority'] || {};
        this._lastJobPrioritization = 0;
        this._jobLocation = template['jobLocation'] || null;
        this._path = [];
    },
    act: function() {
        if(Game.debug && Game.watchName == this.getName())
            debugger;

        if(!this.isConscious())
            return;

        // If entity can react and is reacting right now,
        // do that instead of performing job.
        if(this.hasMixin('Reactor') && this.isReacting())
            return this.react();

        // Re-prioritize every hour
        // TODO: give a unique time for re-prioritization (still once an hour, just a different minute/second perhaps) so that the NPCs don't all reprioritize and the same time and lag the system
        if(this._lastJobPrioritization != this._map.getTime().getHours() || this._lastJobPrioritization === 0)
            this.reprioritizeJobs();

        Game.Jobs[this._jobCurrent].doJob(this);

        if(this.hasMixin('MemoryMaker'))
            this.processMemories();
    },
    getJobs: function() {
        return this._jobs;
    },
    addJob: function(job) {
        this._jobs.push(job);
        if(Game.Jobs[job].crime)
            this.getMap().getJustice().addCriminals(1);
    },
    removeJob: function(job) {
        var index = this._jobs.indexOf(job);
        if(index > -1)
            this._jobs.splice(index, 1);

        if(Game.Jobs[job].crime)
            this.getMap().getJustice().removeCriminals(1);
    },
    hasJob: function(job) {
        return this._jobs.indexOf(job) > -1;
    },
    setCurrentJob: function(job) {
        if(Game.Jobs[job])
            this._jobCurrent = job;
    },
    reprioritizeJobs: function() {
        // Remove any jobs that the entity no longer has
        for(var job in this._jobPriority)
            if(this._jobs.indexOf(job) === -1)
                delete this._jobPriority[job];

        // Re-prioritize
        for(var i = 0; i < this._jobs.length; i++) {
            // Add new jobs to the job priority list
            if(!this._jobPriority[this._jobs[i]])
                this._jobPriority[this._jobs[i]] = 0;

            this._jobPriority[this._jobs[i]] = Game.Jobs.getPriority(this, this._jobs[i]);
        }

        // Get highest priority job, with a higher
        // priority being a smaller int (0 is highest priority)
        var highestPriority = null;
        for(var newJob in this._jobPriority) {
            if(highestPriority === null)
                highestPriority = newJob;
            else if(this._jobPriority[newJob] < this._jobPriority[highestPriority])
                highestPriority = newJob;
        }

        // Set current job as the highest priority
        this._jobCurrent = highestPriority;

        // Set the job location to the new job
        if(this.hasMixin('MemoryMaker')) {
            var place = this.recall('places', highestPriority);
            if(place) {
                if(!place.location)
                    debugger;
                this._jobLocation = place.location;
            }
        }

        this._lastJobPrioritization = this._map.getTime().getHours();
    },
    getPath: function() {
        return this._path;
    },
    getNextStep: function() {
        return this._path.shift();
    },
    addNextStep: function(step) {
        this._path.unshift(step);
    },
    setPath: function(path) {
        this._path = path || [];
    },
    getJobLocation: function() {
        return this._jobLocation;
    },
    setJobLocation: function(jobLocation) {
        this._jobLocation = jobLocation;
    },
    isAtJobLocation: function() {
        var currentLocation = this.getX() + "," + this.getY() + "," + this.getZ();
        return currentLocation === this._jobLocation;
    },
    isJobComplete: function(job) {
        return this._jobComplete[job];
    },
    setJobComplete: function(job, complete) {
        this._jobComplete[job] = !!complete;
    },
    listeners: {
        overlay: function() {
            return [{key: 'path', points: this._path, char: '#', color: 'purple'}];
        },
        onRegainConsciousness: function() {
            if(Game.Jobs[this._jobCurrent] && Game.Jobs[this._jobCurrent].crime) {
                // TODO: upon waking up, the NPC loses 'petty crime' jobs?
                if(Math.random() > 0.5) {
                    Game.sendMessageNearby(
                        this.getMap(),
                        this.getX(),
                        this.getY(),
                        this.getZ(),
                        "Ok ok! I'll never do it again!"
                    );
                    this.removeJob(this._jobCurrent);
                    this.reprioritizeJobs();
                    var witnesses = this.getMap().getEntitiesWithinRadius(this.getX(), this.getY(), this.getZ(), 25);
                    for (var i = 0; i < witnesses.length; i++) {
                        witnesses[i].raiseEvent('onRepent', this);
                    }

                    if(this.hasMixin('Reactor'))
                        this.setReaction(false);
                }
            }
        }
    }
};
Game.EntityMixins.MemoryMaker = {
    name: 'MemoryMaker',
    init: function() {
        // Each memory in a given category should have a unique key.
        // Additionally, each memory may have sub-categories
        this._memory = {
            people: {
                enemies: {},
                criminals: {},
                victims: {}
            },
            places: {
                work: {},
                home: {}
            },
            events: {}
        };

        // Single level (no categories) place to process memories with expirations.
        // Type and subtypes should be added as properties for easy reference when
        // forgetting memories that have expired (ie, they will be deleted from
        // short-term memory as well as normal memory).
        // Example: this._memory = {
        //    people: {
        //        enemies: {
        //            'Bob Schmo': {
        //                entity: {Entity Object},
        //                expires: 25
        //            }
        //        }
        //    }
        //}
        //this._shortTermMemory = {
        //    'Bob Schmo': {
        //             entity: {Entity Object},
        //             expires: 25,
        //             memoryType: 'people',
        //             memorySubtype: 'enemies'
        //         }
        //     }
        //}
        this._shortTermMemory = {};
    },
    getMemory: function() {
        return this._memory;
    },
    remember: function(type, subtype, memoryName, memory) {
        // Until I can find a better way of dealing with memories
        // in a more loose manner (ie, not caring about the content or type)
        // I think it's better to just throw an error if the type or
        // subtype doesn't exist so I can assume certain logic is applicable
        if(!this._memory[type]) {
            console.log(this);
            throw new Error(this._name + ' has no category for \'' + type + '\' in their memory!');
        } else if(subtype && !this._memory[type][subtype]) {
            console.log(this);
            throw new Error(this._name + ' has no category for \'' + subtype + '\' in their memory of \'' + type + '\' !');
        } else if(!subtype && !memoryName) {
            throw new Error("You must specify a type or a memory name in order to remember something");
        }

        // TODO: there is a possibility that an entity could get generated with a duplicate name and that could mess with an entities memory of that entity. However, since entities don't have much that differentiates them now other than their name, it probably doesn't matter/is kind of a funny 'real-life' way of entities (and maybe players?) getting confused...

        // 'memory' param should be an object.
        if(typeof memory !== 'object') {
            console.log(memory);
            throw new Error('Memories need to be objects, silly...');
        }

        // Each memory needs to have an 'expires' key,
        // and an 'entity' key, both of which can be null/false.
        if(typeof memory.expires === undefined)
            memory.expires = false;
        if(typeof memory.entity === undefined)
            memory.entity = false;

        if(subtype && !memoryName)
            this._memory[type][subtype] = memory;
        else if(!subtype && memoryName)
            this._memory[type][memoryName] = memory;
        else
            this._memory[type][subtype][memoryName] = memory;


        if(memory.expires !== false && memory.expires !== undefined)
            this.addShortTermMemory(type, subtype, memoryName, memory);

    },
    forget: function(type, subtype, memoryName) {
        if(subtype) {
            if(!this._memory[type][subtype][memoryName])
                return false;
            else {
                this.raiseEvent('onForget', memoryName, this._memory[type][subtype][memoryName]);
                delete this._memory[type][subtype][memoryName];
            }
        } else {
            if(!this._memory[type][memoryName])
                return false;
            else {
                this.raiseEvent('onForget', memoryName, this._memory[type][memoryName]);
                delete this._memory[type][memoryName];
            }
        }
    },
    recall: function(type, subtype, memoryName) {
        if(!subtype && !memoryName)
            return this._memory[type];
        else if(subtype && !memoryName)
            return this._memory[type][subtype];
        else if(!subtype && memoryName)
            return this._memory[type][memoryName];
        else
            return this._memory[type][subtype][memoryName];
    },
    addShortTermMemory: function(type, subtype, memoryName, memory) {
        if(!memory.expires)
            throw new Error('Short Term memory added with no expiration...');

        memory.memoryType = type;
        memory.memorySubtype = subtype;
        this._shortTermMemory[memoryName] = memory;
    },
    processMemories: function() {
        // Loop through all short-term memories (those with expirations)
        // and delete those that have a value of 0, and decrement the rest
        for(var memory in this._shortTermMemory) {
            var m = this._shortTermMemory[memory];
            if(m.expires === 0) {
                if(m.memorySubtype !== false)
                    this.forget(m.memoryType, m.memorySubtype, memory);
                else
                    this.forget(m.memoryType, false, memory);

                delete this._shortTermMemory[memory];
            } else {
                this._shortTermMemory[memory].expires--;
            }
        }
    },
    listeners: {
        onAttack: function(attacker, expires) {
            var enemy = {entity: attacker};
            var event = {entity: attacker};
            if(expires !== false && expires !== undefined) {
                enemy.expires = expires;
                event.expires = expires;
            } else {
                event.expires = 5;
            }

            this.remember('people', 'enemies', attacker.getName(), enemy);
            this.remember('events', false, 'attacked by ' + attacker.getName(), event);

            if(attacker.hasMixin('MemoryMaker'))
                attacker.remember('people', 'victims', this.getName(), {entity: this});
        },
        details: function() {
            return [
                {key: 'Job Title', value: this.recall('places', 'work').title},
                {key: 'Employer', value: this.recall('places', 'work').name},
                {key: 'Job Location', value: this.recall('places', 'work').location}
            ];
        }
    }
};
Game.EntityMixins.MoneyHolder = {
    name: 'MoneyHolder',
    init: function(template) {
        this._money = template['money'] || 1000;
    },
    getMoney: function() {
        return this._money;
    },
    pay: function(amount) {
        this._money += amount;
    },
    spend: function(amount) {
        this._money -= amount;
    },
    steal: function(target, amount) {
        if(target.hasMixin('MoneyHolder')) {
            // TODO: base the amount stolen off of a dexterity contest or at least the dex of the stealer
            if(amount > target.getMoney()) {
                amount = target.getMoney();
            }

            target.give(this, amount);

            if(target.hasMixin('MessageRecipient')) {
                Game.sendMessage(target, 'Someone just stole $%s from you!', [amount]);
            }
            if(this.hasMixin('MessageRecipient')) {
                Game.sendMessage(this, 'You successfully stole $%s from %s', [amount, target.describeThe()]);
            }
        } else if(this.hasMixin('MessageRecipient')) {
            Game.sendMessage(this, '%s doesn\'t have any money', [target.describeThe()]);
        }
    },
    give: function(target, amount) {
        if(target.hasMixin('MoneyHolder')) {
            if(this._money < amount) {
                Game.sendMessage(target, 'I don\'t have that much money');
                return false;
            }
            target.pay(amount);
            this.spend(amount);

            if(target.hasMixin('MessageRecipient')) {
                Game.sendMessage(target, '%s just gave you $%s', [this.describeThe(), amount]);
            }
            if(this.hasMixin('MessageRecipient')) {
                Game.sendMessage(this, 'You just gave $%s to %s', [amount, target.describeThe()]);
            }
        } else if(this.hasMixin('MessageRecipient')) {
            Game.sendMessage(this, '%s can\'t take money', [target.describeThe()]);

        }
    }
};
Game.EntityMixins.MessageRecipient = {
    name: 'MessageRecipient',
    init: function() {
        this._messages = [];
    },
    receiveMessage: function(message) {
        this._messages.push(message);
    },
    getMessages: function() {
        return this._messages;
    },
    clearMessages: function() {
        this._messages = [];
    }
};
Game.EntityMixins.PowerUser = {
    name: 'PowerUser',
    init: function(template) {
        this._powersList = template['powers'] || [];
        this._powers = [];
        this._activePower = null;
        this._primaryRanged = null;
        this._primaryMelee = null;
        this._constantPowers = [];
        this._persistentPowers = [];
        this._inherentPowers = [];

        // Initialize powers
        if(this._powersList.length) {
            this._powersList.forEach(power => this.addPower(power));
        }
    },
    getPower: function(i) {
        return this._powers[i];
    },
    getPowers: function() {
        return this._powers;
    },
    addPower: function(powerName) {
        var newPower = Game.Powers.create(powerName);
        newPower.setEntity(this);
        this._powers.push(newPower);
    },
    getActivePower: function() {
        return this._activePower;
    },
    setActivePower: function(i) {
        if(typeof i === 'number')
            this._activePower = this._powers[i];
        else
            this._activePower = i;
    },
    getPrimaryRanged: function() {
        return this._primaryRanged;
    },
    setPrimaryRanged: function(i) {
        if(i === false || i === null || i === undefined)
            this._primaryRanged = null;
        else
            this._primaryRanged = this._powers[i];
    },
    getPrimaryMelee: function() {
        return this._primaryMelee;
    },
    setPrimaryMelee: function(i) {
        if(i === false || i === null || i === undefined)
            this._primaryMelee = null;
        else
            this._primaryMelee = this._powers[i];
    },
    usePower: function(target, power) {
        if(!power && !this._activePower) {
            Game.sendMessage(this, "You have no power to use!");
            return false;
        }

        if(!target) {
            Game.sendMessage(this, "There's nothing there!");
            return false; // don't end turn
        }

        if(!power)
            power = this._activePower;

        // TODO: [POWERS] handle non-instant powers every turn
        // TODO: Update entity mixins to support an 'onAct' or some such method (update pattern)
        if(power['duration'] != 'instant') {
            var queue = '_' + power['duration'] + 'Powers'; // e.g., '_constantPowers'
            this[queue].push(power);
            power.enqueue();
        }

        // TODO: Handle miss? True if hit, false if miss
        power.effect(target);

        return true;
    }
};
Game.EntityMixins.PlayerActor = {
    name: 'PlayerActor',
    groupName: 'Actor',
    act: function() {
        if(this._acting)
            return;

        this._acting = true;

        // Detect if the game is over
        if(!this.isAlive()) {
            Game.Screen.playScreen.setGameEnded(true);
            // Send a last message to the player
            Game.sendMessage(this, 'Press [Enter] to continue!');
        } else if(!this.isConscious()) {
            Game.sendMessage(this, 'You\'re unconscious. Press [Enter] to continue!');
        }

        // If they can use powers, process the non-instant powers that are activated
        ['constant', 'persistent'].forEach(function(duration) {
            var queue = '_' + duration + 'Powers';

            // Now that we have the right queue, process all of the powers in this queue
            this[queue].forEach(function(power) {
                if(power[duration])
                    power[duration]();
            }, this);
        }, this);

        // Re-render the screen
        Game.refresh(this);
        // Lock the engine and wait asynchronously
        // for the player to press a key.
        this.getMap().getEngine().lock();
        this.clearMessages();
        this._acting = false;
    },
    listeners: {
        describe: function() {
            return ['Strapping muscles and dashing good looks', 'Everyone that looks upon you shall despair'];
        }
    }
};
Game.EntityMixins.PlayerStatGainer = {
    name: 'PlayerStatGainer',
    groupName: 'StatGainer',
    listeners: {
        onGainLevel: function() {
            // Setup the gain stat screen and show it.
            Game.Screen.gainStatScreen.setup(this);
            Game.Screen.playScreen.setSubScreen(Game.Screen.gainStatScreen);
        }
    }
};
Game.EntityMixins.RandomStatGainer = {
    name: 'RandomStatGainer',
    groupName: 'StatGainer',
    init: function() {
        if(this.hasMixin('BasePoints') && this.getSpendablePoints() > 0) {
            var characteristics = ['STR', 'DEX', 'BODY', 'INT', 'STUN'];
            while(this.getSpendablePoints() > 0) {
                // The only thing keeping this from being an infinite loop
                // is the fact that STR and STUN only cost 1 character point
                var characteristic = characteristics.random();
                // Make sure the characteristic is within the amount of spendable points we have
                while(Game.Cost.Characteristics[characteristic] > this.getSpendablePoints()) {
                    characteristic = characteristics.random();
                }

                this.increaseChar(characteristic);
                this.subtractSpendablePoints(Game.Cost.Characteristics[characteristic]);
            }
        }
    },
    listeners: {
        onGainLevel: function() {
            var statOptions = this.getStatOptions();
            // Randomly select a stat option and execute the callback for each stat point.
            while (this.getStatPoints() > 0) {
                // Call the stat increasing function with this as the context.
                statOptions.random()[1].call(this);
                this.setStatPoints(this.getStatPoints() - 1);
            }
        }
    }
};
Game.EntityMixins.Reactor = {
    name: 'Reactor',
    init: function(template) {
        var self = this;
        this._reactionTypes = template['reactionTypes'] || ['defend', 'runAway'];
        this._reacting = false;
        this._reaction = false;
        this._reactions = Object.assign({}, {
            defend: function() {
                Game.Tasks.hunt(self);
            },
            runAway: function() {
                Game.Tasks.retreat(self, self.getTarget());
            }
        }, template['reactions']);
        this._reactionMessages = template['reactionMessages'] || {
            runAway: ['Help! Somebody help!', 'Help! I\'m being attacked!'],
            defend: ['Take that you ruffian!', 'I\'m not as defenseless as I look!']
        };
    },
    isReacting: function() {
        return this._reacting;
    },
    getReaction: function() {
        return this._reaction;
    },
    getReactionTypes: function() {
        return this._reactionTypes;
    },
    setReaction: function(reaction) {
        this._reaction = reaction;
        if(reaction)
            this._reacting = true;
        else
            this._reacting = false;
    },
    react: function() {
        if(this._reaction) {
            Game.sendMessageNearby(this.getMap(), this.getX(), this.getY(), this.getZ(), this._reactionMessages[this._reaction].random());
            this._reactions[this._reaction]();
        }
        else
            return false;

        // Make sure to process memories so that these poor entities
        // can forget (one day) that they have been attacked.
        if(this.hasMixin('MemoryMaker')) {
            this.processMemories();
        }
    },
    listeners: {
        onAttack: function(attacker) {
            // Only switch it up if not already reacting
            if(!this._reacting) {
                var reaction = this._reactionTypes.random();
                this.setReaction(reaction);

                if(this.hasMixin('Targeting'))
                    this.setTarget(attacker);
            }
        },
        onForget: function(memoryName, memory) {
            if(this._reacting) {
                if((memoryName.search(/mugged by/) !== -1 || memoryName.search(/attacked by/) !== -1) && memory.entity == this.getTarget())
                    this.setReaction(false);

            }
        }
    }
};
Game.EntityMixins.Sight = {
    name: 'Sight',
    groupName: 'Sight',
    init: function(template) {
        this._sightRadius = template['sightRadius'] || 5;
    },
    getSightRadius: function() {
        return this._sightRadius;
    },
    canSee: function(entity) {
        // If not on the same map or on different floors, then exit early
        if (!entity || this._map !== entity.getMap() || this._z !== entity.getZ()) {
            return false;
        }

        var otherX = entity.getX();
        var otherY = entity.getY();

        // If we're not in a square field of view, then we won't be in a real
        // field of view either.
        if ((otherX - this._x) * (otherX - this._x) +
            (otherY - this._y) * (otherY - this._y) >
            this._sightRadius * this._sightRadius) {
            return false;
        }

        // Compute the FOV and check if the coordinates are in there.
        // TODO: This should use the existing FOV instead of re-computing
        var found = false;
        this.getMap().getFov(this.getZ()).compute(
            this.getX(),
            this.getY(),
            this.getSightRadius(),
            function(x, y) {
                if (x === otherX && y === otherY)
                    found = true;
            }
        );
        return found;
    },
    getEntitiesInSight: function(type) { // type can be a string or array
        debugger;
        var entities = this.getMap().getEntitiesWithinRadius(this._sightRadius),
            seen = [],
            isType;
        entities.forEach(entity => {
            // If we are looking for a specific type then only add entities
            // that can be seen and are of a certain type, otherwise just seen
            isType = type ? (entity.getType() == type || type.indexOf(entity.getType()) > -1) : true;
            if(this.canSee(entity) && isType)
                seen.push(entity);
        });
        return seen;
    },
    increaseSightRadius: function(value) {
        // If no value was passed, default to 1.
        value = value || 1;
        // Add to sight radius.
        this._sightRadius += value;
        Game.sendMessage(this, "You are more aware of your surroundings!");
    },
    listeners: {
        onCrime: function(entity) {
            if(this.canSee(entity) && this.hasMixin('MemoryMaker') && this != entity) {
                this.remember('people', 'criminals', entity.getName(), {entity: entity, expires: 200});
            }
        },
        onRepent: function(entity) {
            if(this.canSee(entity) && this.hasMixin('MemoryMaker') && this != entity) {
                this.forget('people', 'criminals', entity.getName());
            }
        }
    }
};
Game.EntityMixins.TaskActor = {
    name: 'TaskActor',
    groupName: 'Actor',
    init: function(template) {
        // Load tasks
        this._tasks = template['tasks'] || ['wander'];
    },
    act: function() {
        // Iterate through all our tasks
        for (var i = 0; i < this._tasks.length; i++) {
            if (this.canDoTask(this._tasks[i])) {
                // If we can perform the task, execute the function for it.
                this[this._tasks[i]]();
                return;
            }
        }
    },
    // TODO: Tasks should have their own 'canDo' function and this should just do that
    canDoTask: function(task) {
        if (task === 'hunt') {
            return this.hasMixin('Sight') && this.canSee(this.getMap().getPlayer());
        } else if (task === 'wander') {
            return true;
        } else {
            throw new Error('Tried to perform undefined task ' + task);
        }
    },
    hunt: function() {
        var player = this.getMap().getPlayer();

        // If we are adjacent to the player, then attack instead of hunting.
        // TODO: if I'm not mistaken, this enforces a topology 4 and doesn't account for diagnally adjacent
        var offsets = Math.abs(player.getX() - this.getX()) + Math.abs(player.getY() - this.getY());
        if (offsets === 1) {
            if (this.hasMixin('Attacker')) {
                this.attack(player);
                return;
            }
        }

        // Generate the path and move to the first tile.
        var source = this;
        var z = source.getZ();
        var path = new ROT.Path.AStar(player.getX(), player.getY(), function(x, y) {
            // If an entity is present at the tile, can't move there.
            var entity = source.getMap().getEntityAt(x, y, z);
            if (entity && entity !== player && entity !== source) {
                return false;
            }
            return source.getMap().getTile(x, y, z).isWalkable();
        }, {topology: 4});
        // Once we've gotten the path, we want to move to the second cell that is
        // passed in the callback (the first is the entity's strting point)
        var count = 0;
        path.compute(source.getX(), source.getY(), function(x, y) {
            if (count == 1) {
                source.tryMove(x, y, z);
            }
            count++;
        });
    },
    wander: function() {
        // Flip coin to determine if moving by 1 in the positive or negative direction
        var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
        // Flip coin to determine if moving in x direction or y direction
        if (Math.round(Math.random()) === 1) {
            this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
        } else {
            this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
        }
    }
};
Game.EntityMixins.Targeting = {
    name: "Targeting",
    init: function(template) {
        this._target = template['target'] || null;
    },
    getTarget: function() {
        return this._target;
    },
    setTarget: function(target) {
        this._target = target;
        return this._target;
    },
    listeners: {
        onKill: function(target) {
            if(this._target == target) {
                this.setTarget(null);
            }
        }
    }
};
Game.EntityMixins.Thrower = {
    name: 'Thrower',
    init: function(template) {
        this._throwing = template['throwing'] || null;
        this._throwingSkill = template['throwingSkill'] || 1;
    },
    getThrowing: function() {
        return this._throwing;
    },
    getThrowingSkill: function() {
        return this._throwingSkill;
    },
    setThrowing: function(i) {
        this._throwing = i;
    },
    increaseThrowingSkill: function(value) {
        if(!value) value = 2;
        this._throwingSkill += 2;
        Game.sendMessage(this, "You feel better at throwing things!");
    },
    _getTarget: function(targetX, targetY) {
        var linePoints = Game.Geometry.getLine(this.getX(), this.getY(), targetX, targetY);
        var z = this.getZ();
        // Check to see if any walls or other creatures other than the thrower in the path
        var end;
        var lastPoint;
        for (var i = 1; i < linePoints.length; i++) {
            if(!this.getMap().getTile(linePoints[i].x, linePoints[i].y, z).isWalkable()) {
                end = lastPoint;
                break;
            } else if(this.getMap().getEntityAt(linePoints[i].x, linePoints[i].y, z)) {
                end = linePoints[i];
                break;
            } else {
                lastPoint = linePoints[i];
            }
        }

        // If nothing is in the way, the end point is targetX and targetY
        if(!end) {
            end = {x: targetX, y: targetY}
        }
        return {x: end.x, y: end.y, distance: linePoints.length};
    },
    throwItem: function(i, targetX, targetY) {
        var item = this._items[i];
        if(item.isThrowable()) {
            var target = this._getTarget(targetX, targetY);
            var entity = this.getMap().getEntityAt(target.x, target.y, this.getZ());
            if(entity && entity.hasMixin('Destructible')) {
                var damage = Math.max(0, item.getAttackValue() + this.getThrowingSkill() - Math.floor(target.distance / 3));
                Game.sendMessage(this, "You throw %s at %s!", [item.describeA(), entity.describeThe()]);
                Game.sendMessage(entity, "%s throws %s at you!", [this.describeThe(), item.describeA()]);
                entity.takeDamage(this, damage);
            }

            var amount = 0;
            if(item.hasMixin('Stackable')) {
                amount = Math.min(1, item.amount() - 1);
            }

            this.getMap().addItem(target.x, target.y, this.getZ(), item);
            this.removeItem(i, amount);
        }
    }
};
