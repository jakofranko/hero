// Thursday 03/23/17 at 10:06PM - 34 files in 0.74 secs

## TODO (33)
1. js/jobs.js:36              Figure out how to prioritize going to work...
2. js/jobs.js:52              Figure out how to prioritize going to work...
3. js/tasks.js:91             Perhaps recalculate path from new position?
4. js/tasks.js:101            Improve this to support what happens if an entity cannot path someplace when they are on the same z-level
5. js/tasks.js:269            if I'm not mistaken, this enforces a topology 4 and doesn't account for diagnally adjacent
6. js/template.js:10          Add support for adding multiple objects to a single place on the template via a template key
7. js/template.js:11          Add functions to turn a template by 90 degrees, and by 180 degrees (and maybe by 270 degrees)
8. js/building.js:306         fix this? Not sure how this happens, or if when it happens, rooms are left isolated
9. js/building.js:317         Skip placing additional doors into region 1
10. js/building.js:513        instead of placing the wall immediately, run 'currentWall' through tests, and if it passes all of them, then place the walls
11. js/city.js:5              Could be made more interesting by including a highway or two which would cut sort of diagnally across the city. Additionally, a river or nearby lake might be a neat addition as well. Perhaps a large, central park type of construct as well?
12. js/company.js:1           Have this create different types of companies based on the size and other demographics of the city
13. js/company.js:2           Add special generator for News companies (like stores and corps)
14. js/screens.js:3           Build a 'fromTemplate' function to parse files or a logo or something like that
15. js/screens.js:4           Flesh out startScreen to be more of a menu, flipping between current items etc.
16. js/screens.js:150         Player chooses size of city?
17. js/screens.js:464         refactor this to support arrow key selection
18. js/screens.js:646         Might need to eventually support using numbers
19. js/screens.js:1359        instead of pressing letters, use direction keys to highlight characteristics to increase
20. js/map.js:200             Give entities jobs at companies upon creation
21. js/map.js:236             Place entities in their homes
22. js/map.js:363             move this?
23. js/entity-mixins.js:718   give a unique time for re-prioritization (still once an hour, just a different minute/second perhaps) so that the NPCs don't all reprioritize and the same time and lag the system
24. js/entity-mixins.js:811   upon waking up, the NPC loses 'petty crime' jobs?
25. js/entity-mixins.js:895   there is a possibility that an entity could get generated with a duplicate name and that could mess with an entities memory of that entity. However, since entities don't have much that differentiates them now other than their name, it probably doesn't matter/is kind of a funny 'real-life' way of entities (and maybe players?) getting confused...
26. js/entity-mixins.js:1016  base the amount stolen off of a dexterity contest or at least the dex of the stealer
27. js/entity-mixins.js:1232  This should use the existing FOV isntead of re-computing
28. js/entity-mixins.js:1281  Tasks should have their own 'canDo' function and this should just do that
29. js/entity-mixins.js:1295  if I'm not mistaken, this enforces a topology 4 and doesn't account for diagnally adjacent
30. js/house.js:9             If there is no more room to add a room's children on the current z-level, the code will try to place all the children directly above the room, resulting in only one being able to be placed (since the other's would not pass the _roomCheck being placed in the same x, y coordinates). Fix this somehow?
31. js/house.js:355           make sure this also updates the objects in the queue
32. js/house.js:537           populate the room with items (may need to be done after the whole house has been generated)
33. js/lots.js:37             Smarter way of pickin the direction houses face
