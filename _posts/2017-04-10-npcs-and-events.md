---
layout: post
title: "NPCs and Events"
date: 2017-04-10 3:20pm
---

## NPC Development

Version 0.3 is ALMOST done...turns out pathing between z-levels is difficult. As it stands right now though, NPCs will spawn on beds (still need to add these locations to their memories as "home"), and those that have jobs, will walk to work, which is defined as a job location when items are spawned in buildings.

As you can imagine, all of this gets very messy, and I've been feeling pretty bogged down with it all. What's scary is that this is how projects die. I am determined not to let this happen to this game! So I've been thinking about what's next...having NPCs walk back and forth between work and home is great and all but...so what? I mean like really, what the heck am I even doing?

If you'll remember, I wrote [an article on what I want gameplay to look like more than a year ago](http://jakofranko.github.io/hero/2016/01/18/gameplay-justice.html). The role that NPCs play in the game is this:

* They should behave poorly when the city is doing badly
* They should behave better as the city's stats get better
* They will be victims of criminals
* They are criminals
* They provide a way for the play to interact with the world in a way that will effect the Justice meter

In order for this to happen, I need there to be a certain amount of predictability to the movements of the NPCs. The mayor will be at town hall during the day. The drug dealers will be on certain street corners at night. People will be milling about a bank when a bank robbery takes place.

As I've built out this game and [another one](https://github.com/jakofranko/MonsterHunterRL), I've realized that the best way to go about building these games is to get them to a point where the bulk of the work is producing content, not writing code. What I want to be doing with NPCs is defining jobs, tasks, and events. In order to do this I need to

* Have my NPC generator be smart enough to automatically assign available jobs to NPCs (implying a need to be able to define what is 'available' for any NPC)
* Have my job and task definitions abstracted enough to be easy to write
* Have a way to easily define "events"

It might behoove me to abstract out job locations and types to some kind of global object that looks like 

```
{
    company: "Narwhal Enterprises",
    location: "124,44,4",
    workTask: Game.Tasks.typeAtComputer,
    entity: null
}
```

which I could then loop through assigning NPCs. As it is, I sort of keep track of them at the company level and they bubble up into building -> lot -> city which === lame, but it seems like the best way to do it right now. The whole thing seems a bit clunky to me.

## Events

I want events to be one of the main mechanics in Justice. An event

* Happens randomly
* Directly effects one of the Justice status bars (increases public trust, decreases crime etc.)
* Will have a failure as well as a success condition
* Often are part of a "series" of events that are "spawned" from a common source.

Event sources are objects that will spit out events of a certain theme, often conditional upon certain Justice meters. Some are standard (will appear in every game), and some will be procedurally generated.

For example, on world gen, the following event sources are randomly generated: "Mayor Cardinal", "Italian Mob", "Triangle Clan", "Dr. Doom". The Mayor source will spit out events like "Press Release", "Photo Shoot", "Ceremony" that the player has to rush off to in order to be present at. The success condition for these types of events is "Talk to the Mayor", and the failure condition is a certain amount of time passing. These types of events will only spawn when the character has a good enough reputation.

The other event sources however will spawn based on Crime and Corruption levels. They will spawn events like "Arms Deal", "Robbery", "Drug Deal," "Drive By" etc. These events have success conditions of defeating the NPCs that are spawned at the location, with a failure condition of not defeating them before a certain amount of time. However, speaking with one of the defeated NPCs could reveal the location of a boss NPC, who, if defeated, will stop spawning these kinds of events.

It's still a work in progress...things are feeling more and more clunky, and I'm trying to figure out why. It's helpful to get my thoughts on paper though.