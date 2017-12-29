/* global Game */
Game.Input = {};

Game.Input.controlMaps = {};

// Defining controlMaps like this should, theoretically, allow key bindings for each screen
// to be re-configured on the fly; simply say:
//
// `Game.Input.controlMaps[screen][inputType][input] = someFunc.bind(this, params);`
//
// and ker-blamo.
// These controlMaps could/should be defined from each screen? Maybe not
// Otherwise, handle input normally for this screen
Game.Input.controlMaps.playScreen = {
    keydown: {
        'ArrowRight':   Game.Commands.moveCommand.bind(this, -1, 0, 0),
        'ArrowLeft':    Game.Commands.moveCommand.bind(this, 1, 0, 0),
        'ArrowDown':    Game.Commands.moveCommand.bind(this, 0, -1, 0),
        'ArrowUp':      Game.Commands.moveCommand.bind(this, 0, 1, 0),
        '>':            Game.Commands.moveCommand.bind(this, 0, 0, -1),
        '<':            Game.Commands.moveCommand.bind(this, 0, 0, 1),
        'Space':        Game.Commands.showScreenCommand.bind(this, Game.Screen.actionScreen, Game.Screen.playScreen),
        'p':            Game.Commands.showScreenCommand.bind(this, Game.Screen.powersScreen, Game.Screen.playScreen),
        'i':            Game.Commands.showItemScreenCommand.bind(this, Game.Screen.inventoryScreen, Game.Screen.playScreen, 'You are not carrying anything.'),
        'j':            Game.Commands.showScreenCommand.bind(this, Game.Screen.justiceScreen, Game.Screen.playScreen),
        'd':            Game.Commands.showItemScreenCommand.bind(this, Game.Screen.dropScreen, Game.Screen.playScreen, 'You have nothing to drop.'),
        'e':            Game.Commands.showItemScreenCommand.bind(this, Game.Screen.eatScreen, Game.Screen.playScreen, 'You have nothing to eat.'),
        'w':            Game.Commands.showItemScreenCommand.bind(this, Game.Screen.wieldScreen, Game.Screen.playScreen, 'You have nothing to wield.'),
        'W':            Game.Commands.showItemScreenCommand.bind(this, Game.Screen.wearScreen, Game.Screen.playScreen, 'You have nothing to wear.'),
        's':            Game.Commands.showScreenCommand.bind(this, Game.Screen.gainStatScreen, Game.Screen.playScreen),
        'x':            Game.Commands.showItemScreenCommand.bind(this, Game.Screen.examineScreen, Game.Screen.playScreen, 'You have nothing to examine.'),
        't':            Game.Commands.showItemScreenCommand.bind(this, Game.Screen.throwScreen, Game.Screen.playScreen, 'You have nothing to throw.'),
        ',':            Game.Commands.showItemScreenCommand.bind(this, Game.Screen.pickupScreen, Game.Screen.playScreen, 'There is nothing here to pick up.',  function(entity) {
            return entity.getMap().getItemsAt(entity.getX(), entity.getY(), entity.getZ());
        }),
        ';':            Game.Commands.showTargettingScreenCommand.bind(this, Game.Screen.lookScreen, Game.Screen.playScreen),
        '?':            Game.Commands.showScreenCommand.bind(this, Game.Screen.helpScreen, Game.Screen.playScreen),
        '.':            Game.Commands.boolCommand.bind(this, true), // Skips turn
        '*':            Game.Commands.debugCommand.bind(this, function() { Game.watchName = prompt("Enter NPC name"); })
    },
    shift: {
        keydown: {
            'ArrowRight':   Game.Commands.swapCommand.bind(this, -1, 0, 0),
            'ArrowLeft':    Game.Commands.swapCommand.bind(this, 1, 0, 0),
            'ArrowDown':    Game.Commands.swapCommand.bind(this, 0, -1, 0),
            'ArrowUp':      Game.Commands.swapCommand.bind(this, 0, 1, 0),
        }
    }
};

Game.Input.controlMaps.ItemListScreen = {
  keydown: {
    'Escape': Game.Commands.removeSubScreenCommand.bind(this, Game.Screen.playScreen),
    'Enter': Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, 'Enter'),
    '0': Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "0"),
    "a": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "a"),
    "b": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "b"),
    "c": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "c"),
    "d": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "d"),
    "e": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "e"),
    "f": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "f"),
    "g": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "g"),
    "h": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "h"),
    "i": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "i"),
    "j": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "j"),
    "k": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "k"),
    "l": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "l"),
    "m": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "m"),
    "n": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "n"),
    "o": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "o"),
    "p": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "p"),
    "q": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "q"),
    "r": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "r"),
    "s": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "s"),
    "t": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "t"),
    "u": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "u"),
    "v": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "v"),
    "w": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "w"),
    "x": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "x"),
    "y": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "y"),
    "z": Game.Commands.ItemScreenExecuteOkCommand.bind(this, Game.Screen.playScreen, "z")
  }
};

Game.Input.controlMaps.TargetBasedScreen = {
    keydown: {
        "ArrowRight": Game.Commands.moveCursorCommand.bind(this, Game.Screen.playScreen, 1, 0),
        "ArrowLeft": Game.Commands.moveCursorCommand.bind(this, Game.Screen.playScreen, -1, 0),
        "ArrowUp": Game.Commands.moveCursorCommand.bind(this, Game.Screen.playScreen, 0, -1),
        "ArrowDown": Game.Commands.moveCursorCommand.bind(this, Game.Screen.playScreen, 0, 1),
        "Enter": Game.Commands.TargetBasedScreenOkCommand.bind(this, Game.Screen.playScreen),
        "Escape": Game.Commands.removeSubScreenCommand.bind(this, Game.Screen.playScreen)
    }
};

Game.Input.controlMaps.MenuScreen = {
    keydown: {
        "ArrowUp": Game.Commands.moveMenuIndexCommand.bind(this, Game.Screen.playScreen, -1),
        "ArrowDown": Game.Commands.moveMenuIndexCommand.bind(this, Game.Screen.playScreen, 1),
        "Enter": Game.Commands.MenuScreenOkCommand.bind(this, Game.Screen.playScreen),
        " ": Game.Commands.MenuScreenOkCommand.bind(this, Game.Screen.playScreen),
        "Escape": Game.Commands.removeSubScreenCommand.bind(this, Game.Screen.playScreen)
    }
}

// This function is meant to handle input data of all types
Game.Input.handleInput = function(screen, inputType, inputData) {
    // Each keyMap object should contain a list of references to Commands with specific parameters
    // bound to them. These command functions will return a function that can be executed later,
    // by passing in a specific entity to the function returned from `handleInput`
    // TODO: inputData.key is only good for key events. need a way to abstract out data depending on event type
    let inputMap = Game.Input.controlMaps[screen];
    if(inputMap && inputData.shiftKey)
        inputMap = inputMap.shift;
        
    if(inputMap && inputMap[inputType] && inputMap[inputType][inputData.key])
        return inputMap[inputType][inputData.key]();
    else {
        return Game.Commands.nullCommand();
    }
};