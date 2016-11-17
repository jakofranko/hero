Game.BuildingRepository = new Game.Repository('buildings', Game.Building);

// Building template:
//
// Game.BuildingRepository.define('name', {
// 		exactProperties: bool,
// 		width: int, 					-- required
// 		height: int, 					-- required
// 		stories: int, 					-- required
// 		name: string,					-- required (for now)
// 		roomNumber: int,
// 		items: object,
// 		roomSize: int,
// 		createBlueprint: function, 		-- 	function to generate initial tiles (stored in _blueprint)
// 		placeRooms: function, 			-- 	used to augment the tiles generated by createBlueprint 
// 		placeStairs: function,			-- 	used to place stair tiles
// 		generateRoomRegions: function, 	-- 	used to populate a reference object for tracking room locations
//											(stored in _roomRegions)
// 		placeDoors: function, 			-- 	used to place door tiles in walls
// 		placeItems: function, 			-- 	populates _items
// 		build: function					-- 	used to order the way that the previous functions are called,
//											finalizing _blueprint
// });
//
// By default, if only the required settings are set, calling a building's `build()` function
// will produce a generic office building. Creating a custom function for the above will
// likely mean that custom versions of the others will need to be supplied as well, but in the
// future, these functions can perhaps be a bit more flexible in order to work with uncertain
// tiles created by custom `createBlueprint` functions etc.

Game.BuildingRepository.define('office building', {
	name: 'Office Building',
	width: Game.getLotSize() / 2,
	height: Game.getLotSize() / 2,
	stories: 4,
	roomNumber: 6
});

Game.BuildingRepository.define('apartment', {
	name: 'Apartment Complex',
	exactProperties: true,
	width: Game.getLotSize() - 2, // 1 tile sidewalks
	height: Game.getLotSize() - 2,
	stories: 3,
	createBlueprint: function() {
		// Using the various apartment room templates, select a combination, 
		// surround them with outer walls, sidewalk and on the upper levels, guard-rails.
		// Note: These templates by default have an extra row at the bottom for a door that
		// that should be used to place a door in the outer wall.
		var apartmentTypes = {
			studio: Game.TemplateRepository.create('studio apartment'),				// 8x8
			oneBedroom: Game.TemplateRepository.create('one-bedroom apartment'),	// 12x12
			twoBedroom: Game.TemplateRepository.create('two-bedroom apartment')		// 16x16
		};
		var layouts = [
			{
				studio: 4,
				twoBedroom: 2
			},
			{
				studio: 3,
				oneBedroom: 2
			}
		];

		var layout = layouts.random();
		var layoutTemplates = Object.keys(layout);

		// Since we will just be stacking the types on top of each other (no multiple rows or anything)
		// we just need to add the heights of each type together.
		var totalHeight = 0;
		for (var i = 0; i < layoutTemplates.length; i++) {
			totalHeight += apartmentTypes[layoutTemplates[i]].getHeight();
		}

		// Total width should be the same for each apartment type added together, and it should be the same.
		var totalWidth = 0;
		for (var j = 0; j < layoutTemplates.length; j++) {
			var rowWidth = apartmentTypes[layoutTemplates[j]].getWidth() * layout[layoutTemplates[j]];
			if(totalWidth === 0)
				totalWidth = rowWidth;
			else if(totalWidth !== rowWidth)
				throw new Error("The widths of the apartmentTypes are not the same");
		}

		if((totalWidth + 6) > this.getWidth() || (totalHeight + 4) > this.getHeight())
			throw new Error("Width or height of apartment rooms is bigger than the building is supposed to be");

		// Now that we have the layout, width and height of the apartment, surround it with outer walls
		// No +2 height since the templates have an extra row for placing doors in the outer wall
		var outerWall = new ROT.Map.Arena(totalWidth + 2, totalHeight);
		var outerWallTile = Game.TileRepository.create('brick wall');
		var floorTile = Game.TileRepository.create('floor');
		var sidewalk = new ROT.Map.Arena(totalWidth + 4, totalHeight + 2);
		var sidewalkTile = Game.TileRepository.create('sidewalk');
		var outerRing = new ROT.Map.Arena(totalWidth + 6, totalHeight + 4);
		for (var z = 0; z < this._stories; z++) {
			// Initialize the x,y grid for this story
			var story = new Array(totalWidth + 6);
			for (var x = 0; x < story.length; x++) {
				if(!story[x])
					story[x] = new Array(totalHeight + 4);
			}

			// Now place the tiles for each story, starting with the outer tiles
			var outerRingTile = (z === 0) ? Game.TileRepository.create('grass') : Game.TileRepository.create('guard rail');
			outerRing.create(function(x, y, value) {
				if(value === 1)
					story[x][y] = outerRingTile;
			});
			sidewalk.create(function(x, y, value) {
				if(value === 1)
					story[x + 1][y + 1] = sidewalkTile;
			});
			outerWall.create(function(x, y, value) {
				if(value === 1)
					story[x + 2][y + 2] = outerWallTile;
				else
					story[x + 2][y + 2] = floorTile;
			});

			// Now that the outer tiles have been placed, lay down the template tiles
			// within the 'outerWall', according to the layout
			var firstRow = true; // Used to determine whether or not to flip the template vertically
			for(var apartment in layout) {
				for (var index = 0; index < layout[apartment]; index++) {
					var at = apartmentTypes[apartment]; // at === apartment template

					// Determine the x and y offsets
					var offsetX = (index * at.getWidth()) + 3;
					var offsetY = false;
					if(firstRow) {
						offsetY = 2;
					} else {
						var diffY = totalHeight - at.getHeight();
						offsetY = diffY + 2;
					}
					var templateMap = (firstRow) ? at.getProcessedTemplateFlipVertical() : at.getProcessedTemplate();
					for(var templateKey in templateMap) {
						var name = templateMap[templateKey].name;
						var repo = templateMap[templateKey].repository;
						var splitKey = templateKey.split(",");
						var tX = Number(splitKey[0]);
						var tY = Number(splitKey[1]);
						if(repo === "ItemRepository")
							this.addItem(tX + offsetX, tY + offsetY, z, Game[repo].create(name));
						else if(repo === "TileRepository")
							story[tX + offsetX][tY + offsetY] = Game[repo].create(name);
						else
							throw new Error("Need to account for repository '" + repo + "' that is trying to create '" + name + "'");
					}
				}
				if(firstRow !== false)
					firstRow = false;
			}
			this._blueprint[z] = story;
		}
	}
});