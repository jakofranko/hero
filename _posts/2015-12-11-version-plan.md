---
layout: post
title: "Version Plan"
date:  2015-12-17 09:55am
---

# v0.5

* Features object for things like ponds and fountains
  * Constructor
  * Repository
* Similar Furniture object that will have more advanced interactivity
  * Constructor
  * Repository
  * Mixin functionality like items and entities
  * Associate furniture with buildings that house them
* `tilesFromTemplate` (or something) functionality for placing features and furniture larger than 1 tile

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
  * Statues
  * Windows
  * Firehydrant
  * Manhole

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
