// Tuesday 05/09/17 at 04:14PM - 39 files in 0.97 secs

## TODO (41)
1. js/event.js:8              Add property to handle win and lose conditions and handlers for events (to be ultimately defined by the event template)
2. js/event.js:78             Might need to update this to include special settings for the entity's event mixin based on the event template
3. js/entity-mixins.js:4      Write 'Event' mixin that handles being assigned an event and listeners that will trigger that event's listeners for things like 'onDeath' etc.
4. js/entity-mixins.js:722    give a unique time for re-prioritization (still once an hour, just a different minute/second perhaps) so that the NPCs don't all reprioritize and the same time and lag the system
5. js/entity-mixins.js:818    upon waking up, the NPC loses 'petty crime' jobs?
6. js/entity-mixins.js:902    there is a possibility that an entity could get generated with a duplicate name and that could mess with an entities memory of that entity. However, since entities don't have much that differentiates them now other than their name, it probably doesn't matter/is kind of a funny 'real-life' way of entities (and maybe players?) getting confused...
7. js/entity-mixins.js:1023   base the amount stolen off of a dexterity contest or at least the dex of the stealer
8. js/entity-mixins.js:1239   This should use the existing FOV isntead of re-computing
9. js/entity-mixins.js:1288   Tasks should have their own 'canDo' function and this should just do that
10. js/entity-mixins.js:1302  if I'm not mistaken, this enforces a topology 4 and doesn't account for diagnally adjacent
11. js/events.js:27           Create specific templates for 'robbers', 'gunman' etc. 
12. js/event-source.js:18     need to add property 'spawnCondition' that is factored when 
13. js/entities.js:21         Write special event NPCs like 'robber' and 'gunman' etc.
14. js/lots.js:37             Smarter way of pickin the direction houses face
15. js/screens.js:3           Build a 'fromTemplate' function to parse files or a logo or something like that
16. js/screens.js:4           Flesh out startScreen to be more of a menu, flipping between current items etc.
17. js/screens.js:153         Player chooses size of city?
18. js/screens.js:470         refactor this to support arrow key selection
19. js/screens.js:652         Might need to eventually support using numbers
20. js/screens.js:1056        Support for items?
21. js/screens.js:1057        Default action?
22. js/screens.js:1398        instead of pressing letters, use direction keys to highlight characteristics to increase
23. js/tasks.js:93            Perhaps recalculate path from new position?
24. js/tasks.js:103           Improve this to support what happens if an entity cannot path someplace when they are on the same z-level
25. js/tasks.js:229           if I'm not mistaken, this enforces a topology 4 and doesn't account for diagnally adjacent
26. js/template.js:10         Add support for adding multiple objects to a single place on the template via a template key
27. js/template.js:11         Add functions to turn a template by 90 degrees, and by 180 degrees (and maybe by 270 degrees)
28. js/map.js:2               Add utilities to handle activeEvent queue
29. js/map.js:3               Add utilities to fetch event sources from the city and then schedule them
30. js/map.js:309             Have this support both string coords ("x,y") and arrays ([x,y])
31. js/map.js:328             Optimize these get path functions to sort the stairs by distance first, then find path. Additionally, most of this code is duplicated between the two functions, and could be reduced to a single function that takes a direction param
32. js/map.js:474             move this?
33. js/building.js:308        fix this? Not sure how this happens, or if when it happens, rooms are left isolated
34. js/building.js:319        Skip placing additional doors into region 1
35. js/building.js:522        instead of placing the wall immediately, run 'currentWall' through tests, and if it passes all of them, then place the walls
36. js/city.js:5              Could be made more interesting by including a highway or two which would cut sort of diagnally across the city. Additionally, a river or nearby lake might be a neat addition as well. Perhaps a large, central park type of construct as well?
37. js/company.js:1           Have this create different types of companies based on the size and other demographics of the city
38. js/company.js:2           Add special generator for News companies (like stores and corps)
39. js/house.js:9             If there is no more room to add a room's children on the current z-level, the code will try to place all the children directly above the room, resulting in only one being able to be placed (since the other's would not pass the _roomCheck being placed in the same x, y coordinates). Fix this somehow?
40. js/house.js:363           make sure this also updates the objects in the queue
41. js/house.js:545           populate the room with items (may need to be done after the whole house has been generated)
