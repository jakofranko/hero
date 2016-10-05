# Justice: A superhero roguelike

Justice is a browser-based, superhero-themed roguelike a-la Cataclysm DDA, Angband, Nethack, Rogue etc. The goal is to fill the 'Justice Meter' up to 100. This is accomplished by fighting criminals, busting up black markets and drug-lords, defeating super-villains, assiting the citizens of your city, fighting fires, and other superhero-y things in a procedurally generated city.

Right now, the game is in early alpha stages, and is something that I just pick at in my free time.

## Notes about the mechanics

Almost all of the mechanics for your character and combat are inspired by the [HERO System](http://www.herogames.com/index.html), an phenominal RPG system that that evolved from [Champions](http://www.herogames.com/forums/store/product/4-champions-complete-bookpdf/), a superhero RPG.

## Notes about code architecture

This game is built using [ROT.js](http://ondras.github.io/rot.js/hp/), which stands for "ROguelike Toolkit." In addition, it is also modeled after some of Ondras's games in many ways, but I've diverged and sometimes confuse even myself on where certain things are located. Below is a brief overview detailing the architecture:

### Initialization

`Game` initializes the screens on window load, and presents the player with `Game.Screen.startScreen`. Pressing [Enter] initializes `Game.Screen.playScreen`, which initializes `Game.Map`, along with the player entity. `Game.Map` is where most of the magic happens; `Game.Map` is what initializes `Game.City`, entities, and items. `Game.Map` is also where the ROT.js engine and scheduler live, and the `Game.Time` and `Game.Justice` modules are initialized. `Game.City` is where "lots" are generated, which is how I procedurally lay out the city. Each lot in turn (depending on type) contains code for generating their own tiles, which in turn contains the code for procedurally generated buildings.

### game.js

`Game` is the namespace that contains 

* settings, and 
* initializes screens. 

Theoretically, if you want to tweak the number or size of something, you should do it here; things like lot-size, number of entities etc.

### screens.js

All of the screens are initialized by `game.js`, and house 

* the player entity 
* the game map (`map.js`)
* code for controls 

Since the controls will change depending on the active screen, it made the most logical sense to house that code here. Some of the screens display player entity information, and some screens display information regarding the justice module. Mostly, they provide different ways of interacting with the tiles, items and entities contained in `map.js`.

### map.js

`map.js` has a lot going on. Since theoritically, at some point it may be possible to switch cities (ie, switch maps), it made sense to have this code contained within the screens. If this ever happens though, the various maps may need to be initialized in `game.js` and then merely selected from `screens.js`. For now though, the map is initialized by `Game.Screen.playScreen`. The map contains the information for

* The city (`city.js`)
* the justice system
* tiles (generated from `city.js`)
* field of vision (fov)
* items (organized by map location)
* entities (organized by map location)
* the time module (converts game turns to in-game minutes, seconds, hours etc.)
* `rot.js` scheduler
* `rot.js` engine
* explored map information (combined with the tiles and fov to create a "fog of war" effect)
* the player (inherited from screens.js)

All of this information is housed in `map.js` because `map.js` is what handles the addition of entities and items to the map, storing and tracking their location, and adding or removing them from the scheduler. The actual 'act' method for entities and items is contained in their respective `-mixins.js` files. The `Game.Screen.playScreen` uses all this information (including fov and explored tiles) to render the map to the player as they move around.