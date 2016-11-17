---
title: "Version Plan"
layout: page
---

## v1.0 Version Plan

* v0.1.1 - Seperate engine code from codebase, and re-implement as a seperate library (probably through Bower)
* v0.2 - More (better) City generation
  * PCG for houses, skyscrapers, apartment complexes
  * Furniture. These will be implemented as items with some new mixins:
  	* "Pick-up-able" (some furniture should not be picked up (or perhaps only))
  	* "Openable" for things like chests. Also for tiles, for things like doors
  * Bug fixes for how buildings are being generated with some rooms not having doors.
  * Lot sizes should probably be bigger, which means that roads and sidewalks should be generated more intelligently
* v0.3 - NPC improvements
  * Pathfinding between z-levels and through doors
  * Path finding from work to home and vice-versa
  * Schedule-based jobs (between 9-5, I should be working, between 10-7 I should be sleeping etc)
  * Work jobs that give the NPC money
  * More intelligent reactions (or a better reaction system) depending on events happening around them
* v0.4 - Events
  * Bank robberies, drug deals, break-ins, black markets. Some could be more complex jobs, but others should probably appear out of no-where and the PC will have to race to the scene to try to stop the bad guys. Events should probably have more powerful enemies
  * A more complex npc generator might need to be built in order to create these more powerful NPC villains
  * Will need to add module to entities to allow them to attack with various weapons (and potentially super-powers?) like guns.
* v0.5 - Super-powers
  * Need to build a powers module for the player, allowing them to purchase more interesting abilities. I think I will diverge from the HERO system a little bit (though I might use some of the mechanics in the back end) in favor of having 'ready-made' powers available to the player.
* v0.6 - Animations
  * A component of an action during an entity's turn. Should be able to add Animation objects to an array if the player would be able to see any part of the animation, and then animate them sequentially on the player's turn.
  * Add animations for things like gun shots, super-powers things like that.
* v0.7 - SFX
  * Streetlights
  * day/night lighting changes
  * Animations that aren't tied to actions, such as a torch flickering or a UI element pulsing
* v0.8 - UI Updates and improvements