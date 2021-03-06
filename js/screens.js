// Tutorial reference: http://www.codingcookies.com/2013/04/03/building-a-roguelike-in-javascript-part-2/
// ASCII art from http://www.chris.com/ascii/index.php?art=objects/scales; altered by me.
// TODO: Build a 'fromTemplate' function to parse files or a logo or something like that
// TODO: Flesh out startScreen to be more of a menu, flipping between current items etc.

/* global Game */
Game.Screen = {};

// Define start screen
Game.Screen.startScreen = {
    enter: function() { Game.resize(Game.getDisplay(), true, false, true); },
    exit: function() { console.log('Exited the start screen'); },
    render: function(display) {
        var y = 2
        // Render prompt to the screen
        var w = Game.getScreenWidth();
        var text = "%c{" + Game.Palette.blue + "}Justice%c{}: A Superhero Roguelike";
        display.drawText((w/2) - (30 / 2), y++, text);

        y++;
        text = "Press [%c{" + Game.Palette.blue + "}Enter%c{}] to start!";
        display.drawText((w/2) - (23 / 2), y++, text);

        text = "Press [%c{" + Game.Palette.blue + "}s%c{}] to enter a world seed";
        display.drawText((w/2) - (30 / 2), y++, text);


        text = "Press [%c{" + Game.Palette.blue + "}?%c{}] any time in game for help";
        display.drawText((w/2) - (35 / 2), y++, text);

        if (Game.getSeed()) {
            text = "Current Seed: %c{" + Game.Palette.blue + "}" + Game.getSeed();
            display.drawText((w/2) - ((14 + Game.getSeed().length)/2), y++, text);
        }

        var scalesASCII = [
                        ",ggg,                   gg                   ,ggg,",
                       "d8P^^8b                ,d88b,                d8^^Y8b",
                       "Y8b,__,,aadd88888bbaaa,888888,aaadd88888bbaa,,__,d8P",
                        "'88888888888888888888I888888I88888888888888888888'",
                        "/|\\`^^YY8888888PP^^^^`888888'^^^^YY8888888PP^^'/|\\",
                       "/ | \\                  `WWWW'                  / | \\",
                      "/  |  \\                 ,dMMb,                 /  |  \\",
                     "/   |   \\                I8888I                /   |   \\",
                    "/    |    \\               `Y88P'               /    |    \\",
                   "/     |     \\               `YP'               /     |     \\",
                  "/      |      \\               88               /      |      \\",
                 "/       |       \\             i88i             /       |       \\",
                "/        |        \\            8888            /        |        \\",
            "'Y88888888888888888888888P'       i8888i       'Y88888888888888888888888P'",
              "`''Y888888888888888P'''        ,888888,        `''Y888888888888888P'''",
                                             "I888888I",
                                             "Y888888P",
                                             "`Y8888P'",
                                              "`WWWW'",
                                               "dMMb",
                                           "_,ad8888ba,_",
                                "__,,aaaadd888888888888888bbaaaa,,__",
                              "d8888888888888888888888888888888888888b"
        ];

        y++;
        for (var i = 0; i < scalesASCII.length; i++) {
            display.drawText((w / 2) - (scalesASCII[i].length / 2), i + y, "%c{#F5F058}" + scalesASCII[i]);
        }

        //             ,ggg,                   gg                   ,ggg,
        //            d8P^^8b                ,d88b,                d8^^Y8b
        //            Y8b,__,,aadd88888bbaaa,888888,aaadd88888bbaa,,__,d8P
        //             '88888888888888888888I888888I88888888888888888888'
        //             /|\`^^YY8888888PP^^^^`888888'^^^^YY8888888PP^^'/|\
        //            / | \                  `WWWW'                  / | \
        //           /  |  \                 ,dMMb,                 /  |  \
        //          /   |   \                I8888I                /   |   \
        //         /    |    \               `Y88P'               /    |    \
        //        /     |     \               `YP'               /     |     \
        //       /      |      \               88               /      |      \
        //      /       |       \             i88i             /       |       \
        //     /        |        \            8888            /        |        \
        // 'Y88888888888888888888888P'       i8888i       'Y88888888888888888888888P'
        //   `''Y888888888888888P'''        ,888888,        `''Y888888888888888P'''
        //                                  I888888I
        //                                  Y888888P
        //                                  `Y8888P'
        //                                   `WWWW'    Normand
        //                                    dMMb     Veilleux
        //                                _,ad8888ba,_
        //                     __,,aaaadd888888888888888bbaaaa,,__
        //                   d8888888888888888888888888888888888888b

        var version = "v1.1";
        display.drawText((w / 2) - (version.length / 2), scalesASCII.length + y, version);

    },
    handleInput: function(inputType, inputData) {
        // When [Enter] is pressed, go to the play screen
        if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
            Game.switchScreen(Game.Screen.characterSelectScreen);
        } else if (inputType === 'keydown' && inputData.keyCode === ROT.VK_S) {
            Game.switchScreen(Game.Screen.seedEntryScreen);
        }
    }
};

Game.Screen.seedEntryScreen = {
    enter: function() {
        this.seed = Game.getSeed() || "";
    },
    exit: function() {},
    render: function(display) {
        var w = Game.getScreenWidth();
        var h = Game.getScreenHeight();
        var blue = "%c{" + Game.Palette.blue + "}";
        var text;

        text = "Enter World " + blue + "Seed";
        display.drawText((w / 2) - ((text.length / 2) - (blue.length / 2)), (h / 2) - 1, text);

        text = blue + this.seed || "";
        display.drawText((w / 2) - ((text.length / 2) - (blue.length / 2)), h / 2, text);
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            if ((inputData.keyCode >= ROT.VK_A && inputData.keyCode <= ROT.VK_Z) || (inputData.keyCode >= ROT.VK_0 && inputData.keyCode <= ROT.VK_9)) {
                this.seed += inputData.key;
            } else if (inputData.keyCode === ROT.VK_BACK_SPACE) {
                this.seed = this.seed.slice(0, -1);
            } else if (inputData.keyCode === ROT.VK_ENTER || inputData.keyCode === ROT.VK_RETURN) {
                Game.setSeed(this.seed);
                Game.switchScreen(Game.Screen.startScreen);
            }

            Game.refresh();
        }
    }
};

// Character creation/selectin screen
Game.Screen.characterSelectScreen = {
    enter: function() {
        this._descriptionWidth = 60;
        this._index = 0;
        this._options = {
            "Brick": {
                description: "A tough hero who is hard to hurt and hurts hard. A high-defense, melee-focused hero who can fly.",
                powers: ['tough skin', 'flight', 'sonic boom'],
                basePoints: 20,
                STR: 50,
                DEX: 8,
                INT: 8,
                CON: 25,
                BODY: 25
            },
            "Energy Projector": {
                description: "You tend to fly around, loose bolts of lightning from your fingertips, and glow in the dark. A ranged-focused hero with low defenses.",
                powers: ['energy blast', 'force field (physical damage)', 'force field (energy damage)', 'teleport', 'flight'],
                basePoints: 50,
                CON: 6,
                BODY: 8
            },
            "Martial Artist": {
                description: "What you lack in super-powers you make up for with super-moves. Martial artists tend to be hard to hit, and focus on physical melee and ranged attacks.",
                // powers: ['bo staff', 'throwing star', 'deflect projectile'],
                powers: ['bo staff', 'throwing star'],
                basePoints: 30,
                STR: 15,
                DEX: 25,
                CON: 20
            },
            "Mentalist": {
                description: "The voices in your head are real, but the spiders you see crawling all over your flesh...are probably not. Mentalists can use powers that are not affected by normal defenses and that often do not need line-of-sight.",
                powers: ['mind spike', 'force field (physical damage)', 'flight', 'telepathy'],
                basePoints: 40,
                STR: 8,
                DEX: 15,
                EGO: 50,
                CON: 8,
                BODY: 8
            },
            "Vigilante": {
                description: "Vengence and Justice are the same, and the only important thing is that they are final. These 'heroes' don't have powers, they have guns and kevlar, and intend to get the job done by any means necessary.",
                // powers: ['assault rifle', 'pistol', 'katana', 'kevlar']
                powers: ['pistol', 'katana', 'kevlar'],
                basePoints: 60,
            }
        };
    },
    render: function(display) {
        var caption = "Select Archtype";
        var archtypes = Object.keys(this._options);
        var w = Game.getScreenWidth();
        var y = 1;

        display.drawText(Math.round(w / 2) - Math.round(caption.length / 2), y++, caption);
        y += 2;

        // Align archtypes with description text
        archtypes.forEach(function(archtype, i) {
            if(i === this._index) archtype = "%c{" + Game.Palette.blue + "}" + archtype;
            display.drawText(Math.round(w / 2) - Math.round(this._descriptionWidth / 2), y++, archtype);
        }, this);

        y++;
        display.drawText(
            Math.round(w / 2) - Math.round(this._descriptionWidth / 2),
            y,
            this._options[archtypes[this._index]].description,
            this._descriptionWidth
        );
    },
    handleInput: function(inputData, inputType) {
        var archtypes = Object.keys(this._options);
        var archtype = archtypes[this._index];
        switch(inputType.key) {
            case 'Enter':
                Game.switchScreen(Game.Screen.namePlayerScreen, [this._options[archtype]]);
                break;
            case 'ArrowDown':
                this.incrementIndex();
                break;
            case 'ArrowUp':
                this.decrementIndex();
                break;
            default:
                break;
        }

        Game.refresh();
    },
    incrementIndex: function() {
        if(this._index + 1 < Object.keys(this._options).length)
            this._index++;
        return false;
    },
    decrementIndex: function() {
        if(this._index - 1 >= 0)
            this._index--;
        return false;
    },
    exit: function() {}
}

Game.Screen.namePlayerScreen = {
    enter: function(playerArchtype) {
        this.playerName = "";
        this.playerArchtype = playerArchtype;
    },
    exit: function() {},
    render: function(display) {
        var w = Game.getScreenWidth();
        var h = Game.getScreenHeight();
        var blue = "%c{" + Game.Palette.blue + "}";
        var text;

        text = "Enter Player " + blue + "Name";
        display.drawText((w / 2) - ((text.length / 2) - (blue.length / 2)), (h / 2) - 1, text);

        text = blue + this.playerName || "";
        display.drawText((w / 2) - ((text.length / 2) - (blue.length / 2)), h / 2, text);
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            if (inputData.keyCode >= ROT.VK_A && inputData.keyCode <= ROT.VK_Z) {
                this.playerName += inputData.key;
            } else if (inputData.keyCode === ROT.VK_BACK_SPACE) {
                this.playerName = this.playerName.slice(0, -1);
            } else if (inputData.keyCode === ROT.VK_ENTER || inputData.keyCode === ROT.VK_RETURN) {
                this.playerArchtype.name = this.playerName;
                Game.switchScreen(Game.Screen.loadScreen, [this.playerArchtype]);
            }

            Game.refresh();
        }
    }
}

Game.Screen.loadScreen = {
    loader: null,
    _player: null,
    _map: null,
    _startedLoading: false,
    enter: function(archtypeTemplate) {
        var screen = this;
        var playerTemplate;

        this.loader = new Game.Loader();

        // Register test modules
        this.loader.registerModule('Map');
        this.loader.registerModule('Map', 'City');
        this.loader.registerModule('Map', 'Justice');
        this.loader.registerModule('Map', 'Tiles');
        this.loader.registerModule('Map', 'Entities');

        // TODO: Move player generation into player creation screen
        // TODO: Player chooses size of city?
        playerTemplate = Object.assign(Game.PlayerTemplate, archtypeTemplate);
        this._player = new Game.Entity(playerTemplate);

        // Begin load loop
        function checkAndRenderLoader() {
            if(this.loader.getProgress() === 100 && this._map)
                Game.switchScreen(Game.Screen.playScreen, [this._player, this._map]);
            else
                Game.refresh();

            if(!this._startedLoading) {
                this._startedLoading = true;
                // Begin loading the map
                try {
                    this.loader.startModule('Map');
                    this.loader.startSubmodule('Map', 'City');
                    this.loader.startSubmodule('Map', 'Justice');
                    this.loader.startSubmodule('Map', 'Tiles');
                    this.loader.startSubmodule('Map', 'Entities');

                    setTimeout(function() {
                        screen._map = new Game.Map(Game.getCitySize(), screen._player)
                    }, 1000);

                    setTimeout(function() {
                        screen.loader.finishSubmodule('Map', 'City');
                    }, 250);
                    setTimeout(function() {
                        screen.loader.finishSubmodule('Map', 'Justice');
                    }, 500);
                    setTimeout(function() {
                        screen.loader.finishSubmodule('Map', 'Tiles');
                    }, 750);
                    setTimeout(function() {
                        screen.loader.finishSubmodule('Map', 'Entities');
                    }, 1000);
                    setTimeout(function() {
                        screen.loader.finishModule('Map');
                    }, 1250);
                } catch(e) {
                    Game.switchScreen(Game.Screen.errorScreen, [e]);
                }
            }
        }
        this._intID = setInterval(checkAndRenderLoader.bind(this), 50);
    },
    render: function(display) {
        var w = Game.getScreenWidth();
        var progress = this.loader.getProgress();
        var loadListY = 10;

        // 100 being the max progress number
        var barWidthMax = (w - 2) / 100; // -2 to account for end brackets

        // Due to an anomaly with l and rpad, 0 will add a pad, 1 will not (since
        // it gets the diff) so, if barWidth or barDiff are 0, then default to 1.
        var barWidth = progress * barWidthMax || 1;
        if(barWidth === 100 * barWidthMax)
            barWidth -= 1; // So as to account for the cap char
        var barDiff = (100 * barWidthMax) - barWidth || 1;
        var bar = "[".rpad("=", barWidth);
        var end = "]".lpad(" ", barDiff);
        var progressBar = bar + end; // The length of this string should always be 78 (or w - 2)

        // Render prompt to the screen
        display.drawText((w/2) - 5, 5, "%c{" + Game.Palette.yellow + "}Loading...");
        display.drawText((w/2) - (progressBar.length / 2), 7, progressBar);
        display.drawText(0, 8, "Currently loading:");
        this.loader.currentlyLoading.forEach(function(item) {
            display.drawText(0, loadListY++, item);
        }, this);
    },
    handleInput: function() {},
    exit: function() {
        clearInterval(this._intID);
        Game.setLoading(true);
    }
};

Game.Screen.overview = {
    _city: null,
    enter: function(player) {
        this._player = player;
        this._city = player.getMap().getCity();
    },
    exit: function() { console.log('Exited the overview screen'); },
    render: function(display) {
        var lotSize = Game.getLotSize();
        var playerX = Math.floor(this._player.getX() / lotSize);
        var playerY = Math.floor(this._player.getY() / lotSize);
        var lots = this._city.getLots();

        // Get the lot locations of active events
        var events = this._player.getMap().getActiveEvents();
        var eventLocations = [];
        events.forEach(event => {
            var location = event.getLocation().split(",");
            var eventX = Math.floor(location[0] / lotSize);
            var eventY = Math.floor(location[1] / lotSize);
            eventLocations.push([eventX, eventY]);
        });

        for(var x = 0; x < this._city.getWidth(); x++) {
            for (var y = 0; y < this._city.getHeight(); y++) {
                var lot = lots[x][y];
                var background;
                if(playerX == x && playerY == y)
                    background = Game.Palette.grey;
                else
                    background = lot.getBackground();

                // Indicate events
                for (var i = 0; i < eventLocations.length; i++) {
                    if(eventLocations[i][0] == x && eventLocations[i][1] == y) {
                        background = Game.Palette.blue;
                        break;
                    }
                }

                display.draw(
                    x,
                    y,
                    lot.getChar(),
                    lot.getForeground(),
                    background
                );
            }
        }
    },
    handleInput: function() {}
};

Game.Screen.stats = {
    enter: function(player) {
        this._player = player;
    },
    exit: function() { console.log('Exited the stats screen'); },
    render: function(display) {
        var red = Game.Palette.red;
        var blue = Game.Palette.blue;
        var yellow = Game.Palette.yellow;
        var green = Game.Palette.green;
        var BODY = "BODY: %c{" + red + "}" + Math.round(this._player.getBODY()) + "/" + this._player.getMaxBODY();
        var STUN = "STUN: %c{" + blue + "}" + Math.round(this._player.getSTUN()) + "/" + this._player.getCharacteristic('STUN', true, true);
        var END = "END: %c{" + green + "}" + Math.round(this._player.getEND()) + "/" + this._player.getCharacteristic('END', true, true);
        var PD = "Total PD: %c{" + green + "}" + (this._player.getCharacteristic("PD", true) + this._player.getRPD());
        var ED = "Total ED: %c{" + green + "}" + (this._player.getCharacteristic("ED", true) + this._player.getRED());
        var rPD = "rPD: %c{" + green + "}" + this._player.getRPD();
        var rED = "rED: %c{" + green + "}" + this._player.getRED();
        var HTH = "HTH: %c{" + '' + "}" + this._player.getHTH();
        var XP = "XP: %c{" + yellow + "}" + this._player.getSpendablePoints();
        var y = 1;

        // TODO: tidy up alignment
        display.clear();
        display.drawText(0, y++, BODY);
        display.drawText(0, y++, STUN);
        display.drawText(0, y++, END);
        display.drawText(0, y++, PD);
        display.drawText(0, y++, ED);
        display.drawText(0, y++, rPD);
        display.drawText(0, y++, rED);
        display.drawText(0, y++, HTH);
        display.drawText(0, y++, XP);
    },
    handleInput: function() {}
};

// Define our playing screen
Game.Screen.playScreen = {
    _player: null,
    _map: null,
    _time: null,
    _gameEnded: false,
    _subScreen: null,
    enter: function(player, map) {
        this._player = player;
        this._map = map;

        // Once player has been created, the map generated and the
        // map assigned to the player (happens in map creation),
        // we can set the minimap to reflect the city overview.
        Game.setMiniMap(Game.Screen.overview, this._player);

        // Display the player's stats (characteristics)
        Game.setCharacterStats(Game.Screen.stats, this._player);

        // Start the map's engine
        this._map.getEngine().start();

        // The first thing that should happen is when the game starts is to
        // assign starting points
        Game.Screen.gainStatScreen.setup(this._player);
        this.setSubScreen(Game.Screen.gainStatScreen);
    },
    exit: function() { console.log("Exited play screen."); },
    render: function(display, noSubScreen) {
        // Render subscreen if there is one
        if (this._subScreen && !noSubScreen) {
            this._subScreen.render(display);
            return;
        }

        var screenHeight = Game.getScreenHeight();
        var screenWidth = Game.getScreenWidth();
        var offsets = this.getScreenOffsets();
        var topLeftX = offsets.x;
        var topLeftY = offsets.y;
        var map = this._player.getMap();
        var currentDepth = this._player.getZ();

        // Will cause items previously in the map to be overwritten.
        // If rendering bugs occur, investigate here. May need to pass
        // in a function as a first argument that will allow smart filtering.
        function mapFromArray(map, arrayItem) {
            var keys = Object.keys(arrayItem);
            keys.forEach(function(key) {
                map[key] = arrayItem[key];
            });

            return map;
        }
        var visibleTiles = this._player.raiseEvent('getVisibleTiles').reduce(mapFromArray, {});
        var visibleEntities = this._player.raiseEvent('getVisibleEntities', visibleTiles).reduce(mapFromArray, {});
        var visibleItems = this._player.raiseEvent('getVisibleItems', visibleTiles).reduce(mapFromArray, {});

        // Combine the render map, overwriting duplicate entries
        // e.g., entities standing on top of items or tiles, or items resting on top of a tile
        var render = Object.assign(visibleTiles, visibleItems, visibleEntities);
        var glyph, foreground;

        // Iterate through visible map cells
        for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
            for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
                glyph = render[x + ',' + y];
                if (!glyph && map.isExplored(x, y, currentDepth)) {
                    // Not in our FOV, so just display the terrain
                    glyph = map.getTile(x, y, currentDepth);
                    // Since the tile was previously explored but is not
                    // visible, we want to change the foreground color to
                    // dark gray.
                    foreground = ROT.Color.toHex(ROT.Color.multiply([100,100,100], ROT.Color.fromString(glyph.getForeground())));
                } else if(glyph) {
                    foreground = glyph.getForeground();
                }

                if (glyph) { // don't draw unexplored terrain
                    display.draw(
                        x - topLeftX,
                        y - topLeftY,
                        glyph.getChar(),
                        foreground,
                        glyph.getBackground()
                    );
                }
            }
        }

        // Render player stats and time
        var stats = '%c{white}%b{black}';
        stats += String.format(
            'HP: %s/%s XP: %s Money: $%s %s, x: %s y: %s z: %s',
            this._player.getHp(),
            this._player.getMaxHp(),
            this._player.getExperiencePoints(),
            this._player.getMoney(),
            this._player.getMap().getTime().clock(),
            this._player.getX(),
            this._player.getY(),
            this._player.getZ()
        );
        display.drawText(0, screenHeight, stats);
    },
    handleInput: function(inputType, inputData) {
        // If the game is over, enter will bring the user to the losing screen.
        if(this._gameEnded) {
            if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
                if (this._player.isAlive())
                    Game.switchScreen(Game.Screen.loseScreen);
                else
                    Game.switchScreen(Game.Screen.deathScreen);
            }
            // Return to make sure the user can't still play
            return;
        }
        // Handle subscreen input if there is one
        if (this._subScreen) {
            this._subScreen.handleInput(inputType, inputData);
            return;
        }

        // If the player is unconscious, all they can do is skip their turn
        if(!this._player.isConscious()) {
            if(inputData.keyCode === ROT.VK_RETURN) {
                this._player.getMap().getEngine().unlock();
                return;
             } else {
                return;
             }
        }

        var command = Game.Input.handleInput('playScreen', inputType, inputData);
        var unlock  = command ? command(this._player) : false;

        if(unlock)    // Unlock the engine
            this._player.getMap().getEngine().unlock();
        else
            Game.refresh(this._player);
    },
    getScreenOffsets: function() {
        // Make sure we still have enough space to fit an entire game screen
        var topLeftX = Math.max(0, this._player.getX() - (Game.getScreenWidth() / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftX = Math.round(Math.min(topLeftX, this._player.getMap().getWidth() - Game.getScreenWidth()));
        // Make sure the y-axis doesn't above the top bound
        var topLeftY = Math.max(0, this._player.getY() - (Game.getScreenHeight() / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftY = Math.round(Math.min(topLeftY, this._player.getMap().getHeight() - Game.getScreenHeight()));
        return {
            x: topLeftX,
            y: topLeftY
        };
    },
    setGameEnded: function(gameEnded) {
        this._gameEnded = gameEnded;
    },
    getSubScreen: function() {
        return this._subScreen;
    },
    setSubScreen: function(subScreen) {
        this._subScreen = subScreen;
        Game.refresh();
    },
    showItemsSubScreen: function(subScreen, items, emptyMessage) {
        if (items && subScreen.setup(this._player, items) > 0) {
            this.setSubScreen(subScreen);
        } else {
            Game.sendMessage(this._player, emptyMessage);
            Game.refresh(this._player);
        }
    },
    getPlayer: function() {
        return this._player;
    }
};

// Item Listing
// TODO: refactor this to support arrow key selection
Game.Screen.ItemListScreen = function(template) {
    this._enterMessage = template['enterMessage'] || '';

    // This is dependant on the number of letters we use as indices in the render function
    this._maxItems = 52;

    this._items = null;
    this._altItems = null;

    // Set up based on the template
    this._caption = template['caption'] || '';
    this._altCaption = template['altCaption'] || '';
    this._okFunction = template['ok'];
    this._isAcceptableFunction = template['isAcceptable'] || function(x) {
        return x;
    };

    // Can the user select items at all?
    this._canSelectItem = template['canSelect'];

    // Can they select multiple items?
    this._canSelectMultipleItems = template['canSelectMultipleItems'];

    // Whether a 'no item' option should appear.
    this._hasNoItemOption = template['hasNoItemOption'];
};
Game.Screen.ItemListScreen.prototype.setup = function(player, items, altEntity, altItems) {
    Game.sendMessage(player, this._enterMessage);

    if(items > this._maxItems || altItems > this._maxItems || items + altItems > this._maxItems)
        throw new Error("The item number max has been reached. Throw some rotten fruit at the developer and tell him that he needs to come up with a better solution for indexing items!");

    this._player = player;
    this._altEntity = altEntity;

    if(this._player && this._caption === '')
        this._caption = this._player.getName() + " inventory";
    if(this._altEntity && this._altCaption === '')
        this._altCaption = this._altEntity.getName() + " inventory";

    // Should be called before switching to the screen.
    var count = 0;
    // Iterate over each item, keeping only the aceptable ones and counting the number of acceptable items.
    var that = this;
    this._items = items.map(function(item) {
        // Transform the item into null if it's not acceptable
        if(that._isAcceptableFunction(item)) {
            count++;
            return item;
        } else {
            return null;
        }
    });

    if(altItems) {
        this._altItems = altItems.map(function(item) {
            // Transform the item into null if it's not acceptable
            if(that._isAcceptableFunction(item)) {
                count++;
                return item;
            } else {
                return null;
            }
        });
    }

    // Clean set of selected indices
    this._selectedIndices = {};
    this._altSelectedIndices = {};
    return count;
};
Game.Screen.ItemListScreen.prototype.render = function(display) {
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    letters += letters.toUpperCase();

    // Set column width based on the presence of altItems
    var screenWidth = Game.getScreenWidth();
    var midPoint = Math.round(screenWidth / 2);
    var colWidth, separatorHeight;

    // Render the caption in the top row
    display.drawText(1, 1, this._caption);
    display.drawText(screenWidth / 2 + 2, 1, this._altCaption);

    // Render the no item row if enabled
    if (this._hasNoItemOption)
    display.drawText(0, 2, '0 - no item');

    if(this._altItems && this._altItems.length > 0) {
        colWidth = midPoint - 1;

        // Also set the height of the separator
        separatorHeight = Math.max(this._items.length, this._altItems.length);
    } else {
        colWidth = screenWidth;
    }

    var row = 0;
    for(var i = 0; i < this._items.length; i++) {
        // If we have an item, we want to render it
        if(this._items[i]) {
            // Get the letter corresponding to the item's index
            var letter = letters.substring(i, i + 1);

            // If the item is selected, show a +, otherwise show a dash, then the item's name
            var selectionState = (this._canSelectItem && this._canSelectMultipleItems && this._selectedIndices[i]) ? '+' : '-';

            // If the item is stackable, show the number we are currently holding
            var stack = this._items[i].hasMixin('Stackable') ? ' (' + this._items[i].amount() + ')' : '';

            // Render at the correct row and add 2
            display.drawText(
                1,
                3 + row,
                letter + ' ' + selectionState + ' ' + this._items[i].getName() + stack,
                colWidth
            );
            row++;
        }
    }

    if(this._altItems && this._altItems.length > 0) {
        var altRow = 0;
        for (var j = 0; j < separatorHeight; j++) {
            display.draw(midPoint, j, '|');
        }

        // Continue to get the next letter by continuing to increment i
        for (var k = 0; k < this._altItems.length; k++, i++) {
            if(this._altItems[k]) {
                var altLetter = letters.substring(i, i + 1); // Note: using i, not k
                var altSelectionState = (
                    this._canSelectItem &&
                    this._canSelectMultipleItems &&
                    this._altSelectedIndices[k]
                ) ? '+' : '-';
                var altStack = this._altItems[k].hasMixin('Stackable') ? ' (' + this._altItems[k].amount() + ')' : '';
                display.drawText(
                    midPoint + 2,
                    3 + altRow,
                    altLetter + ' ' + altSelectionState + ' ' + this._altItems[k].getName() + altStack,
                    colWidth
                );
                altRow++;
            }
        }
    }
};
Game.Screen.ItemListScreen.prototype.executeOkFunction = function() {
    // Gather the selected items.
    var selectedItems = {};
    for (var key in this._selectedIndices) {
        selectedItems[key] = this._items[key];
    }

    // And the altSelected items.
    var altSelectedItems = {};
    for (var altKey in this._altSelectedIndices) {
        altSelectedItems[altKey] = this._altItems[altKey];
    }

    // Switch back to play screen
    Game.Screen.playScreen.setSubScreen(undefined);

    // Call the OK function and end the player's turn if it returns true
    if(this._okFunction(selectedItems, altSelectedItems)) {
        this._player.getMap().getEngine().unlock();
    }
};
Game.Screen.ItemListScreen.prototype.handleInput = function(inputType, inputData) {
    if(inputType === 'keydown') {
        // If the user hit escape, hit enter and can't select an item, or hit
        // enter without any items selected, simply cancel out
        if(inputData.keyCode === ROT.VK_ESCAPE ||
            (inputData.keyCode === ROT.VK_RETURN &&
                (!this._canSelectItem ||
                    (Object.keys(this._selectedIndices).length === 0 && Object.keys(this._altSelectedIndices).length === 0)))) {
            Game.Screen.playScreen.setSubScreen(undefined);

        // Handle pressing return when items are selected
        } else if(inputData.keyCode === ROT.VK_RETURN) {
            this.executeOkFunction();

        // Handle pressing zero when 'no item' selection is enabled
        } else if(this._canSelectItem &&
                  this._hasNoItemOption &&
                  inputData.keyCode === ROT.VK_0) {

            this._selectedIndices = {};
            this.executeOkFunction();

        // Handle pressing a letter if we can select
        // TODO: Might need to eventually support using numbers
        } else if(this._canSelectItem &&
                  inputData.keyCode >= ROT.VK_A &&
                  inputData.keyCode <= ROT.VK_Z) {

            // Check if it maps to a valid item by subtracting 'a' from the character
            // to know what letter of the alphabet we used. If the shift key is pressed,
            // then add 26 to the index since our letters string is organized lowercaseUPPERCASE
            var shift = inputData.shiftKey ? 26 : 0;
            var index = inputData.keyCode - ROT.VK_A + shift;

            // This works because of the way letters are added to each item.
            // After all the items are rendered, we begin to render altItems
            // (if they exist), and continue to use the next letter in the sequence.
            // Thus, the index needs to be 'reset' like this when we begin checking
            // altItems.
            var altIndex = index - this._items.length;
            if(this._items[index]) {
                // If multiple selection is allowed, toggle the selection status, else
                // select the item and exit the screen
                if(this._canSelectMultipleItems) {
                    if(this._selectedIndices[index]) {
                        delete this._selectedIndices[index];
                    } else {
                        this._selectedIndices[index] = true;
                    }
                    // Redraw screen
                    Game.refresh();
                } else {
                    this._selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            } else if(this._altItems !== null && this._altItems[altIndex]) {
                if(this._canSelectMultipleItems) {
                    if(this._altSelectedIndices[altIndex]) {
                        delete this._altSelectedIndices[altIndex];
                    } else {
                        this._altSelectedIndices[altIndex] = true;
                    }
                    // Redraw screen
                    Game.refresh();
                } else {
                    this._altSelectedIndices[altIndex] = true;
                    this.executeOkFunction();
                }
            }
        }
    }
};

// Inventory sub-screens
Game.Screen.inventoryScreen = new Game.Screen.ItemListScreen({
    caption: 'Inventory',
    enterMessage: 'You rifle through your belongings',
    canSelect: false
});
Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the items you wish to pickup',
    enterMessage: 'You ponder what to pick up',
    canSelect: true,
    canSelectMultipleItems: true,
    ok: function(selectedItems) {
        // Try to pick up all items (messages handled by the pickupItems function)
        this._player.pickupItems(Object.keys(selectedItems));
        return true;
    }
});
Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to drop',
    enterMessage: 'You consider what to drop',
    canSelect: true,
    canSelectMultipleItems: false,
    ok: function(selectedItems) {
        // Drop the selected item
        this._player.dropItem(Object.keys(selectedItems)[0]);
        return true;
    }
});
Game.Screen.examineScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to examine',
    enterMessage: 'You start to examin something you are holding',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function() {
        return true;
    },
    ok: function(selectedItems) {
        var keys = Object.keys(selectedItems);
        if (keys.length > 0) {
            var item = selectedItems[keys[0]];
            var description = "It's %s";
            var details = item.details();
            if(details && details != "") {
                description += " (%s).";
                Game.sendMessage(this._player, description,
                [
                    item.describeA(false),
                    item.details()
                ]);
            } else {
                Game.sendMessage(this._player, description, [item.describeA(false)]);
            }

        }
        return true;
    }
});
Game.Screen.throwScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to throw',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        if(!item || !item.hasMixin('Throwable')) {
            return false;
        } else if(item.hasMixin('Equippable') && (item.isWielded() || item.isWorn())) {
            return false;
        } else {
            return true;
        }
    },
    ok: function(selectedItems) {
        var offsets = Game.Screen.playScreen.getScreenOffsets();
        // Go to the targetting screen
        Game.Screen.throwTargetScreen.setup(this._player, this._player.getX(), this._player.getY(), offsets.x, offsets.y);
        this._player.setThrowing(Object.keys(selectedItems)[0]);
        Game.Screen.playScreen.setSubScreen(Game.Screen.throwTargetScreen);
        return;
    }
});
Game.Screen.containerScreen = new Game.Screen.ItemListScreen({
    enterMessage: 'You look into the container',
    canSelect: true,
    canSelectMultipleItems: true,
    ok: function(selectedItems, altSelectedItems) {
        for(var itemKey in selectedItems) {
            if(this._altEntity.hasMixin('Container')) {
                this._altEntity.addItem(this._player, itemKey);
            }
        }

        for(var altItemKey in altSelectedItems) {
            if(this._player.hasMixin('InventoryHolder')) {
                this._altEntity.removeItem(this._player, altItemKey)
            }
        }
    }
});

// Targetting Screen
Game.Screen.TargetBasedScreen = function(template) {
    template = template || {};

    this._enterMessage = template['enterMessage'] || 'Choose target';
    this._targetNearest = template['targetNearest'] || false;
    this._visibleEntities = [];
    this._targetedEntity = 0;

    // By default, our ok return does nothing and does not consume a turn.
    this._okFunction = template['okFunction'] || function() {
        return false;
    };
    this._overlayFunction = template['overlayFunction'] || function(){};
    // The defaut caption function returns a description of the tiles or creatures.
    this._captionFunction = template['captionFunction'] || function(x, y) {
        var z = this._player.getZ();
        var map = this._player.getMap();
        var entity, item, items, details;

        // If the tile is explored, we can give a better capton
        if(map.isExplored(x, y, z)) {
            // If the tile isn't explored, we have to check if we can actually
            // see it before testing if there's an entity or item.
            if(this._visibleCells[x + ',' + y]) {
                items = map.getItemsAt(x, y, z);
                // If we have items, we want to render the top most item
                if(map.getEntityAt(x, y, z)) {
                    entity = map.getEntityAt(x, y, z);
                    details = entity.details();
                    return String.format('%s - %s %s',
                        entity.getRepresentation(),
                        entity.describeA(true),
                        details == '' ? '' : "(" + details + ")"
                    );
                } else if(items) {
                    item = items[items.length - 1];
                    details = item.details();
                    return String.format('%s - %s %s',
                        item.getRepresentation(),
                        item.describeA(true),
                        details == '' ? '' : "(" + details + ")"
                    );
                }
            }
            // If there was no entity/item or the tile wasn't visible, then use
            // the tile information.
            return String.format('%s - %s',
                map.getTile(x, y, z).getRepresentation(),
                map.getTile(x, y, z).getDescription());

        } else {
            var nullTile = Game.TileRepository.create('null');
            // If the tile is not explored, show the null tile description.
            return String.format('%s - %s',
                nullTile.getRepresentation(),
                nullTile.getDescription());
        }
    };
    this._descriptionFunction = template['descriptionFunction'] || function(x, y) {
        var z = this._player.getZ();
        var map = this._player.getMap();
        var items, entity, item;

        // If the tile is explored, we can give a better capton
        if(map.isExplored(x, y, z) && this._visibleCells[x + ',' + y]) {
            // If the tile isn't explored, we have to check if we can actually
            // see it before testing if there's an entity or item.

            items = map.getItemsAt(x, y, z);
            // If we have items, we want to render the top most item
            if(map.getEntityAt(x, y, z)) {
                entity = map.getEntityAt(x, y, z);
                return String.format('%s %s', entity.getDescription(), entity.describe());
            } else if(items) {
                item = items[items.length - 1];
                return String.format('%s %s', item.getDescription(), item.describe());
            }
        }

        // Return blank string if item or entity not found
        return '';
    };
};
Game.Screen.TargetBasedScreen.prototype.setup = function(player, startX, startY, offsetX, offsetY) {
    Game.sendMessage(player, this._enterMessage);

    this._player = player;
    this._visibleEntities = [];
    this._targetedEntity = 0;

    // Store original position. Subtract the offset to make life easy so we don't
    // always have to remove it.
    this._startX = startX - offsetX;
    this._startY = startY - offsetY;

    // Store current cursor position
    if(this._targetNearest) {
        var visible = [],
            nearest;

        // Get entities in sight radius
        var nearestEntities = this._player
            .getMap()
            .getEntitiesWithinRadius(
                this._player.getX(),
                this._player.getY(),
                this._player.getZ(),
                this._player.getSightRadius()
            );

        // Remove player from list
        nearestEntities.splice(nearestEntities.indexOf(this._player), 1);

        // Filter out invisible entities
        visible = nearestEntities.reduce(function(vis, entity) {
            if(this._player.canSee(entity)) {
                vis.push(entity);
                this._visibleEntities.push(entity); // Add to cached list of entities
            }

            return vis;
        }.bind(this), visible);

        if(visible.length) {
            // Find nearest entity
            visible.reduce(function(shortest, entity) {
                var distance = Game.Geometry.distance(this._player.getX(), this._player.getY(), entity.getX(), entity.getY());
                if(entity != this._player && distance <= shortest)
                    nearest = entity;

                return Math.min(distance, shortest);
            }.bind(this), Game.Geometry.distance(this._player.getX(), this._player.getY(), visible[0].getX(), visible[0].getY()));
        }

        if(nearest) {
            this._targetedEntity = this._visibleEntities.indexOf(nearest);
            this._cursorX = nearest.getX() - offsetX;
            this._cursorY = nearest.getY() - offsetY;
        } else {
            this._cursorX = this._startX;
            this._cursorY = this._startY;
        }
    } else {
        this._cursorX = this._startX;
        this._cursorY = this._startY;
    }

    // Store map offsets
    this._offsetX = offsetX;
    this._offsetY = offsetY;

    // Cache the FOV
    var visibleCells = {};
    this._player.getMap().getFov(this._player.getZ()).compute(
        this._player.getX(), this._player.getY(),
        this._player.getSightRadius(),
        function(x, y) {
            visibleCells[x + "," + y] = true;
        });
    this._visibleCells = visibleCells;
};
Game.Screen.TargetBasedScreen.prototype.render = function(display) {
    Game.Screen.playScreen.render.call(Game.Screen.playScreen, display, true);

    // Draw a line from the start to the cursor.
    var points = Game.Geometry.getLine(this._startX, this._startY, this._cursorX, this._cursorY);

    // Render stars along the line.
    for (var i = 1, l = points.length; i < l; i++) {
        if(i == l - 1)
            display.drawText(points[i].x, points[i].y, '%c{white}X');
        else
            display.drawText(points[i].x, points[i].y, '%c{white}*');
    }

    // Render any overlay information
    var overlays = this._overlayFunction(this._cursorX + this._offsetX, this._cursorY + this._offsetY);
    if(overlays) {
        for (var j = 0; j < overlays.length; j++) {
            for (var k = 0; k < overlays[j].length; k++) {
                if(!overlays[j][k].points.length)
                    continue;
                for (var m = 0; m < overlays[j][k].points.length; m++) {
                    var point = overlays[j][k].points[m];
                    console.log(point);
                    display.drawText(point[0] - this._offsetX, point[1] - this._offsetY, "%c{" + overlays[j][k].color + "}" + overlays[j][k].char);
                }
            }
        }
    }

    // Render the caption at the bottom.
    display.drawText(
        0,
        Game.getScreenHeight() - 1,
        this._captionFunction(this._cursorX + this._offsetX, this._cursorY + this._offsetY)
    );

    // Render the description on the log display
    Game.getLog().clear();
    Game.getLog().drawText(
        0,
        0,
        this._descriptionFunction(this._cursorX + this._offsetX, this._cursorY + this._offsetY)
    );
};
Game.Screen.TargetBasedScreen.prototype.handleInput = function(inputType, inputData) {
    var command = Game.Input.handleInput('TargetBasedScreen', inputType, inputData);
    var unlock = command ? command(this._player) : false;

    if(unlock)
        this._player.getMap().getEngine().unlock();
    else
        Game.refresh(); // Don't display log messages so extra info can be put there instead
};
Game.Screen.TargetBasedScreen.prototype.moveCursor = function(dx, dy) {
    // Make sure we stay within bounds.
    this._cursorX = Math.max(0, Math.min(this._cursorX + dx, Game.getScreenWidth()));
    // We have to save the last line for the caption.
    this._cursorY = Math.max(0, Math.min(this._cursorY + dy, Game.getScreenHeight() - 1));
};
Game.Screen.TargetBasedScreen.prototype.executeOkFunction = function() {
    // Switch back to the play screen.
    Game.Screen.playScreen.setSubScreen(undefined);

    // Call the OK function and end the player's turn if it return true.
    if(this._okFunction)
        return this._okFunction(this._cursorX + this._offsetX, this._cursorY + this._offsetY);
    else
        return false;
};
Game.Screen.TargetBasedScreen.prototype.nextEntity = function () {
    if(this._visibleEntities.length) {
        var entity;
        this._targetedEntity++;
        entity = this._visibleEntities[Math.abs(this._targetedEntity) % this._visibleEntities.length];
        this._cursorX = entity.getX() - this._offsetX;
        this._cursorY = entity.getY() - this._offsetY;
    }

    return false;
};
Game.Screen.TargetBasedScreen.prototype.prevEntity = function () {
    if(this._visibleEntities.length) {
        var entity;
        this._targetedEntity--;
        entity = this._visibleEntities[Math.abs(this._targetedEntity) % this._visibleEntities.length];
        this._cursorX = entity.getX() - this._offsetX;
        this._cursorY = entity.getY() - this._offsetY;
    }

    return false;
};

// Target-based screens
Game.Screen.lookScreen = new Game.Screen.TargetBasedScreen({
    enterMessage: 'You begin to look at your surroundings',
    overlayFunction: function(x, y) {
        var z = this._player.getZ();
        var map = this._player.getMap();

        // TODO: Support for items?
        // TODO: Default action?
        if(Game.debug && map.getEntityAt(x, y, z))
            return map.getEntityAt(x, y, z).raiseEvent('overlay');
    }
});
Game.Screen.throwTargetScreen = new Game.Screen.TargetBasedScreen({
    okFunction: function(x, y) {
        this._player.throwItem(this._player.getThrowing(), x, y);
        return true;
    }
});
Game.Screen.powerTargetScreen = new Game.Screen.TargetBasedScreen({
    targetNearest: true,
    okFunction: function(x, y) {
        var targets = this._player.getActivePower().getTargets(x, y, this._player.getZ());
        return this._player.usePower(targets, null, {x: x, y: y, z: this._player.getZ()});
    },
    overlayFunction: function(x, y) {
        var points = this._player.getActivePower().getAOE(x, y);
        return [
            [{
                points: points,
                char: "#",
                color: Game.Palette.red
            }]
        ];
    }
});

// Menu screens
Game.Screen.MenuScreen = function(template) {
    template = template || {};

    this._player = null;

    // Display settings
    this._caption = template['caption'] || 'Menu';
    this._outerPadding = template['outerPadding'] || 4;
    this._innerPadding = template['innerPadding'] || 2;
    this._width = template['width'] || Game.getScreenWidth() - this._outerPadding;
    this._height = template['height'] || Game.getScreenHeight() - this._outerPadding;
    this._textWidth = this._width - this._innerPadding;
    this._verticalChar = template['verticalChar'] || '|';
    this._horizontalChar = template['horizontalChar'] || '-';
    this._cornerChar = template['cornerChar'] || '+';
    this._highlightColor = template['highlightColor'] || Game.Palette.blue;

    // Menu item settings
    this._currentIndex = template['currentIndex'] || 0;
    this._menuItems = template['menuItems'] || [];
    this._menuActions = template['menuActions'] || [];
    this._buildMenuItems = template['buildMenuItems'] || function() {
        // The the value of each menu item should be an array of arrays, where the first value of each sub array is a function reference, and the second value is an array of parameters, such that the menu action can be called via menuAction[i][0].apply(this, menuAction[i][1]). This data structure allows for as many function calls with as many arguments to be called sequentially by a single menu action.
        var exampleMenuItem = {
            'Example 1': [[console.log, ['This is an example', ', and another.']], [console.log, ['And another!']]],
            'Example 2': [[console.log, ['This is another example', ', and another.']], [console.log, ['And another!!']]]
        };
        for(var item in exampleMenuItem) {
            this._menuItems.push(item);
            this._menuActions.push(exampleMenuItem[item]);
        }
    };
    this._okFunction = template['ok'] || function() {
        var menuActions = this._menuActions[this._currentIndex];
        for (var i = 0; i < menuActions.length; i++) {
            if(menuActions[i].length !== 2 && menuActions[i].length !== 3)
                throw new Error('Incorrectly formatted action type:', menuActions[i]);
            var actionFunc = menuActions[i][0],
                actionArgs = menuActions[i][1],
                actionContext = (menuActions[i].length === 3) ? menuActions[i][2] : actionFunc;

            actionFunc.apply(actionContext, actionArgs);
        }
        return true;
    };
};
Game.Screen.MenuScreen.prototype.setup = function(player, builderArgs) {
    this._player = player;
    this._currentIndex = 0; // reset current index to 0
    this._menuItems = []; // clear out old menu items;
    this._menuActions = []; // clear out old menu items;
    this._buildMenuItems.apply(this, builderArgs);
};
Game.Screen.MenuScreen.prototype.render = function(display) {
    var startX = this._outerPadding,
        startY = this._outerPadding;

    // Draw caption
    display.drawText(
        Math.round(this._width / 2) - Math.round(this._caption.length / 2),
        startY - 1,
        '%c{' + Game.Palette.blue + '}' + this._caption + '%c{}'
    );
    // Draw menu box
    for (var row = 0; row < this._height; row++) {
        if(row === 0 || row === this._height - 1) {
            display.drawText(
                startX,
                startY + row,
                this._cornerChar.rpad(this._horizontalChar, this._width - 2) + this._cornerChar,
                this._width
            );
        } else {
            display.drawText(
                startX,
                startY + row,
                this._verticalChar.rpad(" ", this._width - 2) + this._verticalChar,
                this._width
            );
        }
    }

    // Draw menu items
    for (var item = 0; item < this._menuItems.length; item++) {
        var highlight;
        if(item === this._currentIndex)
            highlight = '%b{' + this._highlightColor + '}';
        else
            highlight = '%b{}';

        display.drawText(
            startX + this._innerPadding,
            startY + this._innerPadding + item,
            highlight + this._menuItems[item]
        );
    }
};
Game.Screen.MenuScreen.prototype.handleInput = function(inputType, inputData) {
    // Move the cursor
    if(inputType == 'keydown') {
        if(inputData.keyCode === ROT.VK_UP && this._currentIndex > 0)
            this._currentIndex--;
        else if(inputData.keyCode === ROT.VK_DOWN && this._currentIndex < this._menuItems.length - 1)
            this._currentIndex++;
        else if(inputData.keyCode === ROT.VK_ESCAPE)
            Game.Screen.playScreen.setSubScreen(undefined);
        else if(inputData.keyCode === ROT.VK_RETURN)
            this.executeOkFunction();
    }
    Game.refresh();
};
Game.Screen.MenuScreen.prototype.executeOkFunction = function() {
    // Switch back to the play screen.
    Game.Screen.playScreen.setSubScreen(undefined);
    // Call the OK function and end the player's turn if it return true.
    if (this._okFunction && this._okFunction()) {
        this._player.getMap().getEngine().unlock();
    }
};

Game.Screen.actionMenu = new Game.Screen.MenuScreen({
    buildMenuItems: function() {
        var adjacentCoords = Game.Geometry.getCircle(this._player.getX(), this._player.getY(), 1),
            map = this._player.getMap(),
            z = this._player.getZ(),
            actions = [];

        // Populate a list of actions with which to build the menu
        var playerActions = this._player.raiseEvent('action');
        if (playerActions)
            actions.push(playerActions);
        for(var i = 0; i < adjacentCoords.length; i++) {
            var coords = adjacentCoords[i].split(","),
                x = coords[0],
                y = coords[1];

            var entity = map.getEntityAt(x, y, z),
                items = map.getItemsAt(x, y, z);

            if(entity) {
                var entityActions = entity.raiseEvent('action', this._player);
                if(entityActions) actions.push(entityActions);
            }
            if(items) {
                for(var j = 0; j < items.length; j++) {
                    var itemActions = items[j].raiseEvent('action', this._player);
                    if(itemActions) actions.push(itemActions);
                }
            }
        }

        // Iterate through the actions, building out the _menuItems and _menuActions arrays
        for(var k = 0; k < actions.length; k++) {
            var glyphActions = actions[k]; // An array of action objects
            for (var l = 0; l < glyphActions.length; l++) {
                // An object of action name/functions pairs returned by each relevant item-mixin listener
                var mixinActions = glyphActions[l];
                for(var actionName in mixinActions) {
                    this._menuItems.push(actionName);
                    this._menuActions.push(mixinActions[actionName]);
                }
            }
        }
    }
});

// Define our help screen
Game.Screen.helpScreen = {
    render: function(display) {
        var text = 'Help / Command List';
        var border = '-------------------';
        var padding = 3;
        var y = padding;

        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, border);
        display.drawText(padding, y++, 'Your goal is to restore justice to this city by defeating %c{' + Game.Palette.red + '}criminals%c{} and doing good deeds. Knocking criminals out is often enough to change their minds, and there is a price to pay for killing them. Your location on the mini-map is %b{' + Game.Palette.grey + '}highlighted in grey%b{}. City events are in %c{' + Game.Palette.blue + '}blue%c{}.');

        y += padding;
        display.drawText(padding, y++, '%c{' + Game.Palette.blue + '}Arrow keys%c{} to move, attack or use primary melee power');
        display.drawText(padding, y++, '%c{' + Game.Palette.blue + '}Ctrl + Arrow keys%c{} to swap positions with NPC');
        display.drawText(padding, y++, '%c{' + Game.Palette.blue + '}<%c{} to go up stairs');
        display.drawText(padding, y++, '%c{' + Game.Palette.blue + '}>%c{} to go down stairs');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '}Space%c{}] to use/interact with nearby items and entities');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '}j%c{}] to show city statistics');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '}s%c{}] to spend experience points');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '}p%c{}] to use powers');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '}f%c{}] to use primary ranged power');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '}n or N%c{}] to cycle targets');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '},%c{}] to pick up items');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '}d%c{}] to drop items');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '}x%c{}] to examine items');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '}t%c{}] to throw item');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '};%c{}] to look around you');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '}.%c{}] to wait');
        display.drawText(padding, y++, '[%c{' + Game.Palette.blue + '}?%c{}] to show this help screen');

        y += padding;
        text = '--- press any key to continue ---';
        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
    },
    handleInput: function() {
        Game.Screen.playScreen.setSubScreen(null);
    }
};

// View Justice meters
Game.Screen.justiceScreen = {
    _padding: 3,
    _border: 1,
    _green: ROT.Color.fromString("#00ff78"),
    _red: ROT.Color.fromString("#ea003b"),
    render: function(display) {
        var text = 'Justice';
        var justice = Game.Screen.playScreen.getPlayer().getMap().getJustice();
        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, 0, 'Justice');

        var startX = 0;
        var startY = 2;
        var title = 'Justice';
        // Draw Justice Meter
        this._drawMeter(display, startX, startY, title, justice.getJustice() / 100);

        startX += (title.length + this._padding);
        title = 'Crime';
        // Draw Crime Meter
        this._drawMeter(display, startX, startY, title, justice.getCrime() / 100, true);

        startX += (title.length + this._padding);
        title = 'Corruption';
        // Draw Corruption Meter
        this._drawMeter(display, startX, startY, title, justice.getCorruption() / 100, true);

        // Other stats
        startX += (title.length + this._padding);
        display.drawText(startX, startY++, 'Criminals: ' + justice.getCriminals());
        display.drawText(startX, startY++, 'Respect for Law: ' + justice.getRespectForLaw());
        display.drawText(startX, startY++, 'Good Deeds: ' + justice.getGoodDeeds());
        display.drawText(startX, startY++, 'Infamy: ' + justice.getInfamy());
    },
    handleInput: function(inputType, inputData) {
        if(inputType == 'keydown' && (inputData.keyCode === ROT.VK_ESCAPE || inputData.keyCode === ROT.VK_RETURN))
            Game.Screen.playScreen.setSubScreen(null);
        else
            return;
    },
    /**
     * @display     The same ROT.Display object passed to the this.render()
     * @startX
     * @startY
     * @title       The text to put above the meter
     * @percentage  Amount the gauge should be filled. Percentage should be a decimal (0.54 for 54%)
     * @inverse     If set && true, then the more empty the greener it should be.
     *              Otherwise, the more full it is, the greener it should be
     **/
    _drawMeter: function(display, startX, startY, title, percentage, inverse) {
        // Draw the title
        display.drawText(startX, startY, title);

        // Draw meter a little beneathe the title
        startY += 2;

        var color;
        if(inverse && inverse === true)
            color = ROT.Color.interpolate(this._green, this._red, percentage);
        else
            color = ROT.Color.interpolate(this._red, this._green, percentage);

        // Draw a meter 10 units tall, and fill the meter if the segment is within the given percentage
        var edge = "|";
        for (var i = 10; i > 0; i--) {
            var meter = "";
            if(Math.floor10(percentage, -1) * 10 >= i) {
                meter = edge + "%c{" + ROT.Color.toHex(color) + "}#%c{}" + edge;
            } else {
                meter = edge + " " + edge;
            }

            // The meter should be centered under the title (and the meter is 3 characters 'long')
            var meterX = startX + (title.length / 2) - 2;
            display.drawText(meterX, startY++, meter);
        }

    }
};

// Spend character points screen
Game.Screen.gainStatScreen = {
    setup: function(entity) {
        // Must be called before rendering.
        this._entity = entity;
        this._options = entity.getPointOptions();
        this._powers = entity.getPowers();

        // Rendering constants
        this._powersSpacer = this._powers.reduce(function(max, power) {
            return Math.max(max, power.name.length);
        }, 0)

        // Screen controls
        this._letters = 'abcdefghijklmnopqrstuvwxyz';
        this._numbers = '0123456789';
    },
    render: function(display) {
        display.drawText(0, 0, 'Choose a stat or power to increase: ');
        display.drawText(0, 1, `Remaining points: %c{${Game.Palette.green}}${this._entity.getSpendablePoints()}`);
        display.drawText(4, 3, 'CHAR  COST  VAL');

        // Iterate through each of our options
        for(let i = 0; i < this._options.length; i++) {
            // When displaying and checking costs, strip out 'max' and 'mod' from name
            var charName = this._options[i][0].replace(/^max(\w+)/, "$1").replace(/(\w+)mod$/, "$1");
            var spacer1 = "".lpad(" ", 4 - charName.length + 3);
            var spacer2 = "".lpad(" ", 3 - String(Game.Cost.Characteristics[charName]).length + 2);

            display.drawText(0, 4 + i, this._letters.substring(i, i + 1) + ' - %c{#585DF5}' + charName + '%c{}' + spacer1 + Game.Cost.Characteristics[charName] + spacer2 + '%c{#585DF5}' + this._entity.getCharacteristic(charName, true, true));
        }

        display.drawText(0, 3 + this._options.length + 2, 'Powers:')
        for(let i = 0; i < this._powers.length; i++) {
            let spacer = "".lpad(" ", this._powersSpacer - this._powers[i].name.length + 3);
            display.drawText(
                0,
                4 + this._options.length + i + 3,
                `${this._numbers.substring(i, i + 1)} - %c{${Game.Palette.blue}}${this._powers[i].name} (${this._powers[i].points})%c{}${spacer}Cost: ${this._powers[i].cost}`
            );
        }
    },
    handleInput: function(inputType, inputData) {
        // TODO: instead of pressing letters, use direction keys to highlight characteristics to increase
        // and spend points on the highlighted stat. Should be able to put points in and see how figured
        // characteristics are affected, and be able to move your spendible points around (without
        // selling back what the character has previously put points into). Up/down to hightlihg, left/right
        // to spend and take back points, enter to accept (making the purchase permanent).
        var command = Game.Input.handleInput("gainStatScreen", inputType, inputData);
        var unlock = command ? command(this._entity) : false;

        if(unlock)
            this._entity.getMap().getEngine().unlock();
        else
            Game.refresh(this._entity);
    }
};

// Manage character powers screen
Game.Screen.powersScreen = {
    setup: function(entity) {
        // Must be called before rendering.
        this._entity = entity;
        this._powers = entity.getPowers().filter(function(power) {
            return power.points;
        });
        this._letters = 'abcdefghijklmnopqrstuvwxyz';
    },
    render: function(display) {
        var y = 0;
        var text, powerName, active;

        text = 'Press [%c{' + Game.Palette.blue + '}key%c{}] to use power, [%c{' + Game.Palette.blue + '}shift + key%c{}] to make it your primary melee power, [%c{' + Game.Palette.blue + '}ctrl + key%c{}] to make it your primary ranged power.\n Press [%c{' + Game.Palette.blue + '}Esc%c{}] or [%c{' + Game.Palette.blue + '}Enter%c{}] to leave this screen.';
        display.drawText(0, y++, text);

        y += 4;
        if(this._powers.length) {
            display.drawText(0, y++, 'Powers:');

            // Iterate through each of our powers
            for (var i = 0; i < this._powers.length; i++) {
                powerName = this._powers[i].name;
                active = this._powers[i].active ? '(active) ' : '';

                text = this._letters.substring(i, i + 1) + ' - ' + active + '%c{#585DF5}' + powerName;

                if(this._powers[i] == this._entity.getPrimaryMelee())
                text += ' %c{}| %c{' + Game.Palette.lightBlue + '}Primary Melee';
                if(this._powers[i] == this._entity.getPrimaryRanged())
                text += ' %c{}| %c{' + Game.Palette.lightBlue + '}Primary Ranged';

                display.drawText(0, y++, text);
            }
        } else {
            display.drawText(0, y++, 'You have no powers! Purchase powers by pressing [%c{' + Game.Palette.blue + '}s%c{}] on the play screen.')
        }
    },
    handleInput: function(inputType, inputData) {
        var command = Game.Input.handleInput('powersScreen', inputType, inputData);
        var unlock = command ? command(this._entity) : false;

        if(unlock)
            this._entity.getMap().getEngine().unlock();
        else
            Game.refresh(this._entity);
    },
    activatePower: function(letter) {
        var showScreenCommand;
        var index = this._letters.indexOf(letter);

        if (this._powers[index]) {
            this._entity.setActivePower(this._powers[index]);

            if(this._entity.getActivePower() && this._entity.getActivePower().range === 'self') {
                return this._entity.usePower([this._entity]);
            } else {
                showScreenCommand = Game.Commands.showTargettingScreenCommand(Game.Screen.powerTargetScreen, Game.Screen.playScreen);
                showScreenCommand(this._entity);
            }
        }
    },
    setPrimaryMelee: function(letter) {
        var currentPrimary = this._entity.getPrimaryMelee();
        var index = this._letters.indexOf(letter.toLowerCase());

        if(currentPrimary && this._entity.getPower(index) == currentPrimary)
            this._entity.setPrimaryMelee(null);
        else
            this._entity.setPrimaryMelee(this._powers[index]);
    },
    setPrimaryRanged: function(letter) {
        var currentPrimary = this._entity.getPrimaryRanged();
        var index = this._letters.indexOf(letter.toLowerCase());

        if(currentPrimary && this._entity.getPower(index) == currentPrimary)
            this._entity.setPrimaryRanged(null);
        else
            this._entity.setPrimaryRanged(this._powers[index]);
    }
};

Game.Screen.errorScreen = {
    enter: function(error) {
        this._error = error;
        console.log(error);
    },
    exit: function() {  console.log("Exited error screen."); },
    render: function(display) {
        var w = Game.getScreenWidth();
        var text = "Uh oh :(";
        display.drawText((w/2) - (text.length / 2), 2, text);

        text = "Looks like there was an error:" + this._error;
        display.drawText((w/2) - 40, 4, text, 80);

        text = "Press [%c{#585DF5}Enter%c{}] to start over";
        display.drawText((w/2) - (text.length / 2), 8, text);
    },
    handleInput: function(inputType, inputData) {
        if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
            Game.Screen.playScreen.setSubScreen(undefined);
        }
    }
};

Game.Screen.winScreen = {
    enter: function() {    console.log("Entered win screen."); },
    exit: function() { console.log("Exited win screen."); },
    render: function(display) {
        var w = Game.getScreenWidth();
        var text = "%c{#585DF5}Justice%c{} Prevails!";
        display.drawText((w/2) - (text.length / 2), 2, text);

        text = "You have successfully restored justice to this city. While crime and corruption will always be present, you can rest easy knowing that the people of this city can take care of themselves.";
        display.drawText((w/2) - 40, 4, text, 80);

        text = "Press [%c{#585DF5}Enter%c{}] to keep playing";
        display.drawText((w/2) - (text.length / 2), 8, text);
    },
    handleInput: function(inputType, inputData) {
        if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
            Game.Screen.playScreen.setSubScreen(undefined);
        }
    }
};

Game.Screen.loseScreen = {
    enter: function() { console.log("Entered lose screen."); },
    exit: function() { console.log("Exited lose screen."); },
    render: function(display) {
        var w = Game.getScreenWidth();
        var text = "The city has fallen to the criminals and the corrupt.";
        display.drawText((w/2) - (text.length / 2), 2, "%c{" + Game.Palette.red + "}" + text);

        text = "Press [%c{#585DF5}Enter%c{}] to try again";
        display.drawText((w/2) - 13, 4, text);
    },
    handleInput: function(inputType, inputData) {
        if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
            location.reload();
        }
    }
};

Game.Screen.deathScreen = {
    enter: function() { console.log("Entered lose screen."); },
    exit: function() { console.log("Exited lose screen."); },
    render: function(display) {
        var w = Game.getScreenWidth();
        var text = "%c{#ea003b}You have been killed";
        display.drawText((w/2) - 10, 2, text);

        text = "Press [%c{#585DF5}Enter%c{}] to try again";
        display.drawText((w/2) - 13, 4, text);
    },
    handleInput: function(inputType, inputData) {
        if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
            location.reload();
        }
    }
};
