Game.TemplateRepository = new Game.Repository('templates', Game.Template);

// 8x8
Game.TemplateRepository.define('studio apartment', {
	name: 'studio apartment',
	template: [
		'--------',
		'|&0|t#l|',
		'|o +  c|',
		'|---   |',
		'|      |',
		'|     o|',
		'|cTc  {|',
		'|     [|',
		'    +   '
	],
	templateKey: {
		't': {
			repository: 'ItemRepository',
			name: 'end table'
		},
		'#': {
			repository: 'ItemRepository',
			name: 'bed'
		},
		'l': {
			repository: 'ItemRepository',
			name: 'floor lamp'
		},
		'T': {
			repository: 'ItemRepository',
			name: 'table'
		},
		'c': {
			repository: 'ItemRepository',
			name: 'chair'
		},
		'{': {
			repository: 'ItemRepository',
			name: 'oven'
		},
		'[': {
			repository: 'ItemRepository',
			name: 'refridgerator'
		},
		'+': {
			repository: 'TileRepository',
			name: 'door'
		},
		'|': {
			repository: 'TileRepository',
			name: 'indoor wall-vertical'
		},
		'-': {
			repository: 'TileRepository',
			name: 'indoor wall-horizontal'
		},
		'&': {
			repository: 'ItemRepository',
			name: 'toilet'
		},
		'0': {
			repository: 'ItemRepository',
			name: 'bathtub'
		},
		'o': {
			repository: 'ItemRepository',
			name: 'sink'
		},
	}
});

// 12x12
Game.TemplateRepository.define('one-bedroom apartment', {
	name: 'one-bedroom apartment',
	template: [
		'------------',
		'|&0o|d  t#l|',
		'|   |c     |',
		'|+--|----+-|',
		'|     tcl  |',
		'|  C       |',
		'|V C     cd|',
		'|  C       |',
		'|          |',
		'|         o|',
		'|--   cTc {|',
		'| +       [|',
		'    +       '
	],
	templateKey: {
		't': {
			repository: 'ItemRepository',
			name: 'end table'
		},
		'#': {
			repository: 'ItemRepository',
			name: 'bed'
		},
		'l': {
			repository: 'ItemRepository',
			name: 'floor lamp'
		},
		'd': {
			repository: 'ItemRepository',
			name: 'desk'
		},
		'T': {
			repository: 'ItemRepository',
			name: 'table'
		},
		'c': {
			repository: 'ItemRepository',
			name: 'chair'
		},
		'C': {
			repository: 'ItemRepository',
			name: 'couch'
		},
		'V': {
			repository: 'ItemRepository',
			name: 'television'
		},
		'{': {
			repository: 'ItemRepository',
			name: 'oven'
		},
		'[': {
			repository: 'ItemRepository',
			name: 'refridgerator'
		},
		'+': {
			repository: 'TileRepository',
			name: 'door'
		},
		'|': {
			repository: 'TileRepository',
			name: 'indoor wall-vertical'
		},
		'-': {
			repository: 'TileRepository',
			name: 'indoor wall-horizontal'
		},
		'&': {
			repository: 'ItemRepository',
			name: 'toilet'
		},
		'0': {
			repository: 'ItemRepository',
			name: 'bathtub'
		},
		'o': {
			repository: 'ItemRepository',
			name: 'sink'
		},
	}
});

// 16x16
Game.TemplateRepository.define('two-bedroom apartment', {
	name: 'two-bedroom apartment',
	template: [
		'----------------',
		'|&  | ld   t#l |',
		'|0  +  c      c|',
		'|o  |         t|',
		'|------------+-|',
		'|t V           |',
		'|c            {|',
		'|lCCC         [|',
		'|  cTc        o|',
		'|      ---+----|',
		'|      + |     |',
		'|      | |&oO  |',
		'|   --+------+-|',
		'|   |t        l|',
		'|   |c t#l   cd|',
		'|   -----------|',
		'  +             '
	],
	templateKey: {
		't': {
			repository: 'ItemRepository',
			name: 'end table'
		},
		'#': {
			repository: 'ItemRepository',
			name: 'bed'
		},
		'l': {
			repository: 'ItemRepository',
			name: 'floor lamp'
		},
		'd': {
			repository: 'ItemRepository',
			name: 'desk'
		},
		'T': {
			repository: 'ItemRepository',
			name: 'table'
		},
		'c': {
			repository: 'ItemRepository',
			name: 'chair'
		},
		'C': {
			repository: 'ItemRepository',
			name: 'couch'
		},
		'V': {
			repository: 'ItemRepository',
			name: 'television'
		},
		'{': {
			repository: 'ItemRepository',
			name: 'oven'
		},
		'[': {
			repository: 'ItemRepository',
			name: 'refridgerator'
		},
		'+': {
			repository: 'TileRepository',
			name: 'door'
		},
		'|': {
			repository: 'TileRepository',
			name: 'indoor wall-vertical'
		},
		'-': {
			repository: 'TileRepository',
			name: 'indoor wall-horizontal'
		},
		'&': {
			repository: 'ItemRepository',
			name: 'toilet'
		},
		'0': {
			repository: 'ItemRepository',
			name: 'bathtub'
		},
		'o': {
			repository: 'ItemRepository',
			name: 'sink'
		},
	}
});

// Bathroom: needs to be no more than 3x3
Game.TemplateRepository.define('bathroom', {
	name: 'bathroom',
	template: [
		'& o',
		'  0'
	],
	templateKey: {
		'&': {
			repository: 'ItemRepository',
			name: 'toilet'
		},
		'0': {
			repository: 'ItemRepository',
			name: 'bathtub'
		},
		'o': {
			repository: 'ItemRepository',
			name: 'sink'
		},
	}
});

// Needs to at most be 7x7
Game.TemplateRepository.define('kitchen', {
	name: 'kitchen',
	template: [
		'[o{  ',
		'    h',
		'    #',
		'    h'
	],
	templateKey: {
		'{': {
			repository: 'ItemRepository',
			name: 'oven'
		},
		'[': {
			repository: 'ItemRepository',
			name: 'refridgerator'
		},
		'o': { // don't say I didn't throw in the kitchen sink... heh heh heh
			repository: 'ItemRepository',
			name: 'sink'
		},
	}
});

// needs to be no bigger than 6x6
Game.TemplateRepository.define('dining room', {
	name: 'dining room',
	template: [
		'     ',
		' h#h ',
		' h#h ',
		' h#h ',
		'     '
	],
	templateKey: {
		'h': {
			repository: 'ItemRepository',
			name: 'chair'
		},
		'#': {
			repository: 'ItemRepository',
			name: 'chair'
		},
	}
});

// needs to be no bigger than 6x6
Game.TemplateRepository.define('living room', {
	name: 'living room',
	template: [
		' l T *',
		' h    ',
		' tCCC ',
		'      ',
	],
	templateKey: {
		'T': {
			repository: 'ItemRepository',
			name: 'television'
		},
		'h': {
			repository: 'ItemRepository',
			name: 'chair'
		},
		'C': {
			repository: 'ItemRepository',
			name: 'couch'
		},
		'l': {
			repository: 'ItemRepository',
			name: 'floor lamp'
		},
		'*': {
			repository: 'ItemRepository',
			name: 'potted plant'
		}
	}
});
Game.TemplateRepository.define('bedroom', {
	name: 'bedroom',
	template: [
		' t#l ',
		'    ]',
		'dh   '
	],
	templateKey: {
		't': {
			repository: 'ItemRepository',
			name: 'end table'
		},
		'#': {
			repository: 'ItemRepository',
			name: 'bed'
		},
		'l': {
			repository: 'ItemRepository',
			name: 'floor lamp'
		},
		']': {
			repository: 'ItemRepository',
			name: 'dresser'
		},
		'd': {
			repository: 'ItemRepository',
			name: 'desk'
		},
		'h': {
			repository: 'ItemRepository',
			name: 'chair'
		},
	}
});
Game.TemplateRepository.define('office', {
	name: 'office',
	template: [
		' ld ]',
		't h ]',
		'h   ]',
	],
	templateKey: {
		't': {
			repository: 'ItemRepository',
			name: 'end table'
		},
		'l': {
			repository: 'ItemRepository',
			name: 'floor lamp'
		},
		']': {
			repository: 'ItemRepository',
			name: 'bookshelf'
		},
		'd': {
			repository: 'ItemRepository',
			name: 'desk'
		},
		'h': {
			repository: 'ItemRepository',
			name: 'chair'
		},
	}
});