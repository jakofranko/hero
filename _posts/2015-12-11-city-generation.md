---
layout: post
title: "City Generation"
date: 2015-12-11 12:25pm
---

# The Plan

Initially, I am conceptualizing this process in a few steps:

Step 1 - Procedurally generate an overview. This is similar to Dwarf Fortresses worldgen, where a top level overview is procedurally generated with roads, houses, parks, skyscrapers and other buildings. The result would be kind of like the map from Cataclysm.

Step 2 - Generate lots based off of the overview. For every character on the overview there is a corresponding lot that will be x wide and y high. Each lot would in turn have procedurally generated information associated with it based on the type of lot it is:

* Layout for the houses for neighborhood lots and House Objects, 
* The locations of trees and ponds for park lots, 
* The direction the road is flowing for road lots,
* A Building object for building lots
* etc.

Lots should store an array with all the relevant map information to draw a single lot and have a method to return an object with 'adjusted' keys that could be used by the main map when stitching together lots.

Step 2b - Generate building objects for each lot. Buildings should store information about items located in them, as well as a map object that can be used to draw the building, as well as a method to return an adjusted map given a center x-y position, for lots to use when generating their own map object.

Step 3 - Generate the map from the list of lots. The map generation will essentially consisting of quilting together lots. The result is a 3-dimensional array, quilted together from 3-dimensional lot objects, which are in turn generated from 3-dimensional building objects + lot information.

# How Dominic does it on Coding Cookies

Something that I noticed while following [Part 7 of the Coding Cookies tutorial](http://www.codingcookies.com/2013/05/03/building-a-roguelike-in-javascript-part-7/) is that Dominic follows this progression when generating the map/screen/game:

1.  Initializes the Game object, which creates ROT's display object. This is at the top Game level. 

2.  When the window loads, he sets the current screen to be the 'startScreen.' Screens are basically display interfaces; their sole purpose is to 
    1. Draw to the display given different various information that differs from screen to screen based on purpose.
    2. Act as a container for the information it is responsible for drawing. *This includes map and player data!* Screens then become the parents of all generated map content. They can't draw what they don't know about.
    3. Handle input. This is significant because it means that the playScreen, for instance, is responsible for handling every single control.
  
    Another thing to notice about Game.Screen objects is what they don't keep track of; they don't track any entity besides the player and they don't have an engine or a scheduler. Since the screen has to keep track of the player, it does have a method for moving the character, and it does lock and unlock the engine based on player input, but that's all. The screen is just responsible for drawing the current state of the map tiles
  
3.  The startScreen is merely a way to enter the playScreen. When the playScreen is first 'entered,' it creates a player entity, a tiles object using Game.Builder, and a map object.

4.  The tiles object created by Game.Builder is actually where most of the world gen happens. The builder creates a 3-dimensional array (z, x, y) of tiles and of regions.
  * Tiles contain information about, well, tiles, using ROT.Map.Cellular generated information; i.e., wallTile, floorTile or anything else found in tile.js
  * Regions are used to group connected floor tiles together. Once they are grouped, small regions (20 cells or less) are filled in, and then the z levels are attempted to connect via stair-cases.

5.  Game.Map.Cave, which is a super-set of Game.Map is then created with these tiles as a parameter. 
    * Game.Map keeps track of everything needed to draw it: entities, the tiles generated in the previous step, FOV, engine, scheduler, items, explored tiles. It also contains the methods for adding and removing entities and items.
    * Game.Map.Cave is what's actually instantiated by the playScreen; so it calls Game.Map (with the tiles created by the builder) and then uses Game.Map methods to randomly place monsters and items and additional terrain.
    * The player entity is passed as a parameter to Game.Map.Cave. Part of the game's `addEntity` method is that it actually puts the whole map in a property of the entity for easy reference when calculating things like moves. This is very important because the render method of the playScreen never calls the map directly, it references it from the map object associated with the player entity (via `getMap()` on the player).

6.  After the player, the tiles and the map is generated, the enter function starts the game engine. Starting the engine cycles through all of the actors, starting with the player actor. On the player's turn, the engine is locked, and the render method for the current screen is called. From here on out the map that is referenced and rendered is only ever the one associated with the player entity.
  
## What I do and don't like about this approach

I really like the Game.Screen object. I like how easily it makes it to create an options screen or a help screen or an inventory screen. I also really like how Game.Map is responsible for keeping track of entities, FOV, the engine and scheduler.

I don't like the separation between the 'tiles' and the 'map.'  The fact that all of the actual 'map' is generated by the 'builder' and then passed in for the other stuff doesn't make much sense to me. Further on in the tutorial, Dominic creates two sub-maps: a cave map and a bosscavern map. Game.Map.Cave doesn't do anything other than be responsible for adding items and monsters, whereas Game.Map.BossCavern generates its own tiles.

# My Solution

## Game.Screen

I want this to largely remain the same, with a couple changes: first, I want to support multiple displays. Right now, I just want to have a log panel (where game messages will go) and a mini-map and then the playScreen. Game.Screen will have to be updated to support the various panels. The second change is that playScreen will only initialize Game.Map. I want to get rid of Game.Builder and have Game.Map be responsible for, well, the whole map.

## Game.Map

This will also largely remain the same with the major exception being that its tiles will be generated on initialization instead of being passed in.

Since I am wanting to generate the map by stitching together 'lots,' which in turn will be created by parsing through an 'overview,' I may want to store the overview and lot information at this level.

Game.Map will continue to store entities, FOV information, explored map information and potentially items. I am wanting a lot of items to be generated at the building level, and maybe even room level, so we'll see.

`Game.Map._tiles` will be generated by calling Game.Map.City.Lots.tiles() or something

## Game.Map.City

This is going to be a smallish class that is responsible for generating the overview from which lots will be generated. This will include logic for how often to place skyscrapers, down-town housing, parks, neighborhoods/houses etc. Later on down the road, this might all be responsible for keeping track of city statistics, but we'll see.

Initializing Game.Map.City should create the overview and then initialize Game.Map.City.Lots by passing in the tiles/info from the generated overview.

## Game.Map.City.Lots

This should be initialized with a two-dimensional overview map supplied to it. For each character in the overview map, a lot should be created of the type specified by the overview. Each lot should be of a certain standard size, and should have the logic for placing buildings and items and potentially entities depending on the type of lot it is. The main class might keep track of buildings, items and entities for use in Game.Map.City and Game.Map. At this point, the map is still 2-dimensional. After buildings are generated on the lot, there may be multiple z-levels depending on the height of the building(s).

## Game.Map.City.Buildings

These will be generated by Game.Map.City.Lots, depending on the lot type. Buildings will have all the logic for creating different floors, placing items and furniture, building rooms etc. They should be responsible for returning a 3-dimensional array that Game.Map.City.Lots can then use to finish building out its own 3-dimensional array. It should probably also return the information regarding items, entities and rooms so that it is ultimately accessible by Game.Map and usable for path-finding etc.

## Additional considerations

Since the map is ultimately stored in the player object, creating the player on `Game.init()` and then adding the player to the map might be a good way to get map info to both the overview panel as well as the playScreen. 

There might be a need/desire to build any number of these from static templates, especially certain kinds of buildings like capital buildings or banks or whatever. Not sure. They could probably be procedurally generated though.