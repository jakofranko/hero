---
layout: post
title: "Powers! And controls too."
date: 2018-01-26 10:26am
---

So I recently (as in...4 months ago) changed jobs. I am going to be [writing more about that particular transition](/thoughts). This has been a great change, but with it I lost access to the main computer I was using to develop during off hours. At my new gig, in addition to having a pretty locked down work machine, the company also has some pretty strict policies regarding what they own that is created with company resources or using company property. Thus, it became necessary to get a new personal machine at home. So, I recently rebuilt my desktop computer! It's been working like a dream, and it's allowed me to get back in the saddle developing this game.

I'm almost done with version 0.5. The things I had wanted to accomplish in 0.5 were:

1. Powers (with a scalable framework for creating new powers easily)
2. Control scheme refactor
3. Bug fixes to house generation

I am proud to say that I'm 100% finished with the powers framework and the control scheme redesign, and about 95% complete with creating a set of base-powers, and maybe 70% converting the remaining screens to the new control schema. The remaining work is just grunt work, the primary redesign is finished.

I wanted to give a brief summary of the work I've done, and then mention what's next on my to-do list.

## Powers

I more or less went with my plan outlined in my [previous post](/hero/2017/07/06/powers.html): There is a base `Power` prototype that handles all shared functionality between powers. Generic implementations of `Power` are built out as `BasePower`s. These are things like "Energy Blast", or "Armor", where cost and range will be the same for all powers of that type. Finally, specific implementations of `BasePowers`, are built out in their own repositories under the `Powers` namespace. Example: 'Katana' is an instance of the Hand-to-Hand Killing Attack base power that does physical damage and has it's own set of hit and miss messages.

`BasePower`s, are relatively easy to build out, and only rarely involve updating an EntityMixin or the `Power` prototype, where things like the range and cost need to be set, and most importantly, the `effect` method, and if the power is anything but an 'instant' power, `equeue` and `dequeue` methods need to be defined.

After a `BasePower` is defined, adding powers that can actually be used is very simple, as simple as creating new tiles or items, with usually only the damage type and messages needing to be updated.

## Controls Refactor

As I began building out the powers, I realized that I was going to need to add some new controls, and when I went back to the input handler in the play screen I knew I needed to refactor it. It was a horrendous tangle of `if/else` statements comparing keyCodes against ROT.js's VK interface. On top of that the controls were tightly coupled to the player functionality and could not be reassigned. I completely refactored my control scheme based off of the [Command Pattern](http://gameprogrammingpatterns.com/command.html). Basically, by having inputs return a function that can be executed later at any time, it allows a huge increase in flexibility. On one screen I can have the arrow keys pass back move commands, to which I can then pass the player entity, and on another screen I could use the exact same command and pass in an NPC entity. On top of that, it should now be possible to create a key-binding screen that will allow the user to set what keys do what.

## What's Next

One of the last things I wanted to fix this release was some strange rendering bugs in the house generator that was causing (among other things) NPCs to be trapped on stories above the ground. I think I must have been sleep deprived or something when I wrote that bit of code because trying to sift through that file and debug it was going to be extremely difficult. [So, I decided to rip it out into its own repo](https://github.com/jakofranko/maison) in order to perform a refactor and debug the rendering issues in a more controlled environment, with the byproduct being a fun little JS demo. After I figure out what the issue is, I'll copy my refactored code back over and hopefully everything will be hunky dory.

That will conclude v0.5;

v0.6 was originally slated for items, but I think I am not going to be implementing an item system in Justice. It feels robust enough having items expressed as powers, which is how the HERO System works anyways. So I may bump up additional locations to v0.7, and do some UI refinements? I'm also needing to convert every instance of `Math.random` to `ROT.RNG.getUniform()` in order to take advantage of the ROT RNG's ability to have a seeded generator, which would be a huge improvement and allow players to share seeds to play the same levels etc.

That's all for now!
