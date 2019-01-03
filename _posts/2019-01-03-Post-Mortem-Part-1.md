---
title: Post Mortem Part 1 - What Went Well
date: 2019-01-03 10:23pm
---

Here is the promised post mortem of "Justice." I'm hoping to carry the lessons I learned on this project forward to future games, and think that a lot of the lessons I learned can apply to software engineering in general.

I want to process what went well, what went poorly, and in the end to synthesize some "lessons learned" from everything. None of the points are in any kind of order, just whatever order they came to mind as I was thinking through everything. This will be the first of a three-part series.

## What Went Well

### Procedural city generation

This is not something that I've seen in a roguelike yet in quite the way that I implemented it. Cataclysm DDA is the closest, but they favor templated buildings and I wanted procedural buildings, and CDDA really only has a couple of z-levels (last time I played it), and I wanted big skyscrapers and multi-storied office buildings. This was the first piece I wrote for this game, and it served me well throughout the rest of the game. Once the bones were in place I didn't have to change anything.

### Procedural house generation

Another innovation of mine. I looked at a lot of scholarly papers on the topic, but had a hard time finding any practical examples. This was super fun to build and I spun it off into [a little standalone project](http://jakofranko.github.io/maison) so that I could work on some kinks in isolation from the rest of the game. The effect is really nice.

### Procedural office building generation

One of my proudest achievements was coming up with the algorithm for placing doors in these office buildings so that no rooms were isolated and you could always get out. The result is a sort of maze-like building full of chairs and desks.

### Mixins

The mixin system is something that I took from a tutorial on building a game with ROT.js, and I think this system works wonderfully. It is similar to the Entity/Component/System ideology in that it allows near-complete modularization of entity behavior. Mixins can be used for items and entities, and I ended up using a similar architecture for power advantages. Separating each mixin into its own file that a packager could use would be trivial as well.

### Event listeners

This is component of the mixin architecture, but I expanded it quite a bit. It allows for great separation of logic throughout the game, but requires a bit of a paradigm shift; instead of calculating whether or not an entity can see something in a given function, just raise an event on the entity and allow all of the various mixins to determine what it can see, for example. Event listeners allowed for greater modularization and ease of development in keeping the logical parts in one place, which is within the mixin.

### Command pattern for input

I noticed halfway through development that the input system was this big bloated switch statement, and wanted to do something about it. I found Bob Nystrom's book [Game Programming Patterns](http://gameprogrammingpatterns.com/) to be hugely helpful, and decided to implement the Command Pattern for my control system. I could have organized my code better, but it allowed me to move all the commands into a file and then simply have an "input" interface for each screen that was simply a mapping of a key to a command. Then, all my screens had to do was pass a key stroke to its interface, which would return a command function, and then fire this command function with whatever parameters were relevant to the screen. It was beautiful and elegant and I will be using this quite a bit from now on.

### Repository system (inheritance)

This pattern was actually inspired by some of Ondras's games (the creator of ROT.js), and is sort of a fancy constructor for different types of objects. Repositories are created by passing in a name and a constructor function. Then, templates can be added to this repository by simply providing a name for the template, and an object containing default values. The repository can then be told to create objects by simply passing in a name, and optionally a set of values that will be added to/override the values in the template.

The result is that it is simple and fast to make more templates for a given repo, and the base behavior is defined in the constructor function for a repo. This pattern allows for a nice separation of "data" and "logic," while still keeping everything written in JS. This is much different from other ECS systems that would have their entities described purely as data (JSON, XML etc.) but is also not inheritance based by having entities described entirely as classes that inherit from other classes.

### "Justice" system

The core mechanic of the game that determines whether you win or lose (besides dying) is the "Justice" system. The main idea of this system is that you need to get a primary meter, the "Justice" meter, to 100. This primary meter is conversely related to a second tier of meters, the "Crime" and "Corruption" meters. This second tier of meters is never directly affected by player actions, but are derived from tertiary city stats like number of criminals, "respect for the law" etc. The player is only able to influence these third-tier systems, and these systems could get very complex as new things were added to the game. They didn't get that complex in the end, but I really like this core concept and will definitely re-use it in future games.

### Event system

The event system involves "event sources," which are actually actors in the scheduler. The role of the event sources is to perform logic every round on whether or not they should spawn an type of event that they are responsible for, and managing its active events. For example a "crime event source" will be responsible for spawning "crime type" events etc.

An event lives within its event source's "active events" queue, and contains the logic for what happens when it starts, and what it takes for the event to be a success or a loss. Usually, they spawn event entities, which are just normal entities with the "Event Participant" mixin, and the actions of these entities influence the success and loss conditions.

Event entities are able to trigger listeners on their host event when they die, are KO'd, rescued etc., which in turn will determine whether or not the event has been won or lost.

The system as a whole works nicely, and with some minor improvements could be made extremely flexible. Due to some bad architecture they became a bit tedious to create, but on the whole I really liked the essence of the system.

## What's Next

Well that about sums up the things that I think went well with the project. There are lots and lots of little things that brought me joy throughout, but on the whole these were the ones that stick out to me as I think back over everything.

Next will be the things that I think did not go well. I'm really looking forward to that post because while the tone seems negative, the issues are really interesting and I'm hoping to think through some better solutions.

Till next time.
