---
layout: post
title: "Version plan for v1.0"
date: "2016-03-22 12:02pm"
---

Well, it's happened. You might have noticed (probably not, I don't think anybody reads this...) that I changed the title of an older post from "Version Plan for v1" to "Version Plan for v0.1." That's because, the game is going to need to be a little bigger than I thought.

My original goal (still is, in fact) is to have something that you can PLAY by what is now v0.1. I thought that would have been enough, but what I'm seeing now is that running around trying to find and then knockout muggers isn't quite as fun as it sounds. It also feels very empty. I'm only generating grass tiles and rectangular buildings, and the entities just wander around aimlessly when they aren't mugging someone. It seems that there are a few things lacking for even that to be fun, namely a clearly defined goal, and more interesting choices for the player as to how they accomplish that goal (which is to restore justice to the city). I also would like the NPCs to be a little more interesting. Once all of that is done, then I can push out features that will make accomplishing the goal more complex, throw in more abilities and choices for the player etc.

So, below is a new version plan for v1.0. Each version bump will probably be more similar in scope to what I had originally planned for v0.1.

## v1.0 Version Plan

* v0.1.1 - Seperate engine code from codebase, and re-implement as a seperate library (probably through Bower)
* v0.2 - More (better) City generation
  * PCG for houses, skyscrapers, apartment complexes and potentially others (like parks)
  * Furniture. Could be as simple as making more items, but generally should not be picked up. Some furniture will have functionality tied to it, as in you can only sleep in your bed, you can only work at your designated work area (could be a toolbox for a mechanic, or a cash register, or a desk).
  * Bug fixes for how buildings are being generated with some rooms not having doors.
  * Lot sizes should probably be bigger, which means that roads and sidewalks should be generated more intelligently
  * Need to create doors that are able to be opened/closed. Could be built as furniture?
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
