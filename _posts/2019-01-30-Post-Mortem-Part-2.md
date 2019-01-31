---
title: Post Mortem Part 2 - What Went Poorly
date: 2019-01-30 09:31pm
---

This is part 2 of 4 for the post-mortem of Justice, the superhero-themed roguelike I've just "finished." This is the section I have been most excited to write about as the problems that arose and the things that went poorly were not trivial things, and the solutions to them could be very interesting and valuable for all of my software engineering moving forward.

Onward ho!

## What Went Poorly

### Open world format

The open-world format of the game worked against it in the very end. I was heavily influenced by Cataclysm: Dark Days Ahead, a post-apocalyptic survival roguelike that has an awesome open-world format. However, there are systems in that game that make every move interesting that I specifically omitted from Justice because they are things that I did not want the game to be about; things like items, crafting, hunger, disease, thirst, and rest systems.

Due to a lack of content (mainly events and other petty criminals), moving around was just plain boring. I had an idea early on about being able to talk to civilians you pass about crime that they've seen in the area and basically having a mystery solving mini-game, but I didn't end up expanding on this. I think having more petty crime, being able to interact with civilians meaningfully, and perhaps being able to jump to events (and making them more dangerous) would have made things more fun.

### Bad architecture

The architecture I used was borrowed from a couple of tutorials and a few other ROT.js games that I had seen, and then I bolted my own ideas on top of that. Some of this was good (mixins, repositories) but a lot ended up being bad. A lot of the badness comes down to inexperience I think; I was making it up as I went a long, and I hadn’t looked at how other roguelikes organized their code. Some of it was laziness; had I known that by not doing something right the first time I was making so much pain for myself later, I would have simply taken the extra time.

I do want to call out a few things in particular that stand out to me as painful from an architecture standpoint.

#### Screens

Screens ended up being way too integrated with game logic. They contained the game state, and directly stored data needed for character creation. The main play screen is what held the map object. So anything having to do with game generation or player creation had to go through the play screen.

These screens are initialized on window load in an altogether different place.

Screen flow and order was also ridiculous and not obvious; a series of initial start screens passed data on the seed and player data to a load screen, which generated the map (a lot more complex than a simple matrix of tiles), which then passed the player and map objects to the play screen. Once in the play screen, certain commands could set “sub-screens” on the play screen; when the game tries to render the play screen it would first check if a sub-screen was being used and if so it would render that instead. Same thing when handling inputs.

A lot of this was fixed over time but ended up being a big time-sink, and in the end was still not even close to optimal.

I also kept all of the screens, including their different prototypes, in the same file, which got rather large.

In the future, I really want to keep all display logic totally segregated from state and logic of the game, and organize my screens into much smaller, logical groupings instead of a mega file.

#### Map and City architecture

My idea with having a city object came from how I was conceiving of “stitching together” tiles from city blocks. The “city” was supposed to only be a way to obtain tiles. But, it ended up being a lot more. It was also where I would instant image event sources, which are special actors. It also had to store item information, living locations, job locations, companies...all because this data needed to be “floated up” to the city object because of the way world gen happens.

The result is that any time I wanted to add a feature to the world, I had to sift through about 5 layers of PCG code. Any time I wanted to add an event, I had to remember that it they went into the city object.

Part of the impetus for having a city object was that I could potentially have multiple cities. I still like this idea, and I like the idea of each city having its own event sources, entities, items etc. But the city, and the city blocks and buildings and the map were all so intertwined that it made things very confusing.

The map on the other hand also contained a lot more information that just the tiles, items and entities that were in it. It also initialized the “engine” (how ROT.js handles turns and actor scheduling), the justice system, the time system (both being special actors), and FOV stuff.

I needed to have a better separation of concept between what the city was supposed to do, and what the map was supposed to do.


#### Tile generation

When I conceptualized how to generate the city, it seemed like the best way to do it was to stitch together city lots. This is the fundamental way I thought about the map. A city is comprised of different types of city blocks, and the type of city block is determined randomly based on its distance to the center of the city; skyscraper blocks were likely to appear "down town" and will never be found "in the suburbs". Likewise, house "lots" would pretty much never be found down town or in "uptown", but would appear in the suburbs. These lots in turn could have multiple types of buildings appear on them.

So, map generation went like this:

1. Determine lot types and locations for the city
2. The city will loop through each lot, and call the getTiles function
3. This function will loop through all the buildings on the lot, and call THEIR getTiles function
4. This will then generate an x,y matrix of building tiles for each building. Fill in any empty tiles places.
5. Stitch together the building tiles for the current lot in order to derive the "lot" tiles.
6. Fill in any empty tile places after putting the buildings together. Return these tiles to the city.
7. Continue step 2 until there are no more lots.
8. Return all this stuff to the map object

There were so many layers that any time anything went wrong, it was difficult to debug where it was coming from. It also meant that any time I wanted to add a new map feature, like a new lot type or a new building type, I had to remember how to wire everything up EVERY time.

I think some of this pain could have been reduced by having a better way of dealing with my tile arrays. A matrix-like object that handles adding matrices together and handled non-existent tiles gracefully could have saved me some time.

I'm not sure how, but I think having a flatter architecture would have also simplified things, and reduced the cognitive load. Or maybe just having some better tooling around adding buildings or lot types, so that it wasn't so hard to remember where to put everything.


#### Actor organization (time, justice, event sources etc.)

This is a short one, but most entities were generated at the map level, including the special time and justice actors. Event sources however were added and tracked at the city level and passed up to the map. Events had their own entities, which they also passed up to the map. The exception was the player, who was mostly generated in various screens and then passed down to the map.

The idea of cities owning a lot of this data makes sense, because ultimately I wanted to be able to generate a number of cities and have the player be able to cycle between them. However, since this ended up not being a feature in the final game, there were a lot of layers that didn't need to be there. Keeping all of my actors in the same place would have helped me keep track of things a lot better.

## And Next Time...

Whew! That is quite a bit and also, quite enough for now. I thought I'd be able to get through all the bad in a single post but it looks like this 3 part post will need to be a 4 part post. Next time, I'll be talking about my AI system, game mechanics, "funness", and other stuff.

'Til then.
