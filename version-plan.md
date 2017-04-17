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
  	* "Container" mixin for things like chests.
  * Bug fixes for how buildings are being generated with some rooms not having doors.
  * Lot sizes should probably be bigger, which means that roads and sidewalks should be generated more intelligently
* v0.3 - NPC improvements
  * Bug Fixes and improvements
    * Performance Audit improvements
      * Pathfinding efficiency improvements
    * Items in houses
  * Pathfinding between z-levels and through doors
  * Path finding from work to home and vice-versa
  * Schedule-based jobs (between 9-5, I should be working, between 10-7 I should be sleeping etc)
* v0.4 - Events
  * Event system! The event system will comprise three or four (for now) components: Event Sources, and Events
    * Event Sources are the objects that will contain logic for generating events, and can be affected by in game actions. Some will be standard (appear in every game), whereas others will be tied directly to an NPC (perhaps as a mixin). Event sources will always have a condition for 'spawning' events that is tied either to the NPC that is creating them, the Justice meters, or both. Event 'sources' should define what kinds of events they spawn. 
    * Events are objects that define a list of entities to spawn or a template of entities to spawn (if applicable), logic for where to spawn the entities, and all logic for what happens when the event is 'active' (Event Sources determine when this happen and each source will generally only have 1 or 2 events active at a time)
    * Active Events is an array of event instances at the Game.Map level. Listeners should be applied to entity-mixins that will apply actions to the active events when event NPCs die, are spoken too etc.
  * Different event types might include:
    * Bank robberies, drug deals, break-ins, black markets. Some could be more complex jobs, but others should probably appear out of no-where and the PC will have to race to the scene to try to stop the bad guys. Events should probably have more powerful enemies
    * Some events are 'good:' appear for this photo-shoot, give this speech, receive the keys to the city
    * Some events are 'environmental:' put out the fire, rescue the citizens from the bus crash, destroy the meteor
  * A more complex NPC generator might need to be built in order to create these more powerful NPC villains
    * For now this might just entail some logic for adding an 'event source' mixin that is appropriate to an NPC, but might later include ways of procedurally building out randomized super-villains
* v0.5 - Super-powers
  * Need to build a powers module for the player, allowing them to purchase more interesting abilities. I think I will diverge from the HERO system a little bit (though I might use some of the mechanics in the back end) in favor of having 'ready-made' powers available to the player.
  * Bug fixes
    * Upper story of house generation sometimes don't have downstairs or doors between walls, or are disconnected.
* v0.6 - Items
  * Support for using weapons and armor! Perhaps best to pull in the system used in MonsterHunterRL (since it has a robust slot-based system for items)
* v0.7 - Locations
  * More lot types and building types for things like Banks, Restaurants, Grocery Stores, Pharmacies, Warehouses etc. Basically one-story locations that could be the target of robberies, or the 'hangout' of villains
* v0.8 - Animations
  * A component of an action during an entity's turn. Should be able to add Animation objects to an array if the player would be able to see any part of the animation, and then animate them sequentially on the player's turn.
  * Add animations for things like gun shots, super-powers things like that.
* v0.9 - SFX
  * Streetlights
  * day/night lighting changes
  * Animations that aren't tied to actions, such as a torch flickering or a UI element pulsing
* v0.10 - UI Updates and improvements