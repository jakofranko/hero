---
layout: post
title: "Version Plan"
date:  2015-12-17 09:55am
---

# v0.8

* Crime; some NPCs should get the robber job and take money from buildings at night
* Revamp player stats to start matching HERO System stats
* Pathfinding between z-levels

# v0.7

* Houses! Need to start generating places for our NPCs to live. This will be a new building template, with all new method for placing rooms
* Furniture Repository and some additional pieces of furniture.
* NPCs should sleep at home, and go to work during the day

# v0.6

* Minimap reflect current location of player by lot
* Start placing job locations on z-level 0
* Begin pathfinding for NPCs

# v0.5

* Begin revamp of task system to start to support jobs
* Begin time-system for tracking time of day
* Add some additional stats to entities (though perhaps not the player) to track:
  * Hunger
  * Money
* Base 'Person' entity

# v0.4

* Rooms for buildings. Need to develop good logic for placing them and drawing walls
* Render lots with buildings -- probably just cubes for right now, but they should be explorable with multiple z-levels
  * `buildTiles` method for generic buidling lots

# v0.3

* `buildTiles` method for road lots
  * Update road lots to include information upon creation about whether they are up-down roads or left-right roads
  * Need new tiles for asphault, painted stripes, sidewalk and concrete tiles
* Buildings
  * Constructor object
  * Repository
  * Associate buildings with lots (will work on rendering buildings that are explorable in next version)
  * Generic building template
* Additional tiles
  * Windows

# v0.2

* Add Lots method for generating tiles so that each lot contains logic for procedurally generating terrain
* Modify `Game.Tile` to be a constructor for a repository so that some tiles (grass, for instance) can have random colors and characters associated with them upon creation
* Convert game tiles to repository templates
* Add a `buildTiles` method for empty lots that generates grass tiles.
* Add a message log display that is seperate from the playScreen
* Have displays take up 100% of whatever element they are in
* Have displays resize appropriately when changing window sizes

# v0.1

* City overview generation
* Basic city lot generation, no buildings or features yet.
* Screen support for multiple displays
* Ability for our player to walk around in a generated city stitched together from lots
* Scraping out some residual mechanics from cave-quest
  * Remove hunger mechanic
